import { describe, it, beforeAll, afterAll, beforeEach, afterEach, expect, test, spyOn, clearAllMocks, vi   } from 'vitest';
import Player from '../../models/Player.mjs'
import Team from '../../models/Team.mjs'
import Tournament from '../../models/Tournament.mjs'
const API_KEY = process.env.API_KEY
import fetch from 'node-fetch'
import { fetchPlayerFromAPI, addNewPlayer, addNewPlayers, isPlayerEligible, updatePlayers, fetchPlayers, fetchPlayerSalaries, fetchPlayerStandings, createOrUpdatePlayerSalary } from '../../services/player.mjs'
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as playerService from '../../services/player.mjs';
import * as tournamentService from '../../services/tournament.mjs';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
})

beforeEach(() => {
    global.fetch = vi.fn();
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
})

afterEach(async () => {
    await Player.deleteMany({});
    await Team.deleteMany({})
    await Tournament.deleteMany({})
    vi.clearAllMocks();
    vi.restoreAllMocks();
})

describe('fetchPlayerFromAPI', () => {
    it('should return player data in the correct format when fetch is successful', async () => {
      const mockPlayerData = [
        {
          playerId: '50525',
          firstName: 'Collin',
          lastName: 'Morikawa'
        }
      ];
  
      global.fetch.mockResolvedValueOnce({
        json: async () => mockPlayerData,
      });
  
      const playerData = await fetchPlayerFromAPI('Collin', 'Morikawa');
      
      const expectedData = {
        id: '50525',
        name: 'Collin Morikawa',
      };
  
      expect(playerData).toEqual(expectedData);
    });
  
    it('should return null if no player data is found', async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => [],
      });
  
      const playerData = await fetchPlayerFromAPI('Collin', 'Morikawa');
      
      expect(playerData).toBeNull();
    });
  
    it('should handle fetch errors correctly', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
  
      await expect(fetchPlayerFromAPI('Collin', 'Morikawa')).rejects.toThrow('Network error');
    });
  
    it('should correctly encode URL parameters', async () => {
      const mockPlayerData = [
        {
          playerId: '50525',
          firstName: 'Collin',
          lastName: 'Morikawa'
        }
      ];
      global.fetch.mockResolvedValueOnce({
        json: async () => mockPlayerData,
      });
  
      const playerData = await fetchPlayerFromAPI('Collin', 'Morikawa');
      
      const expectedData = {
        id: '50525',
        name: 'Collin Morikawa'
      };
      
      expect(playerData).toEqual(expectedData);
      
      const expectedUrl = 'https://live-golf-data.p.rapidapi.com/players?lastName=Morikawa&firstName=Collin';
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY, 
          'x-rapidapi-host': 'live-golf-data.p.rapidapi.com'
        }
      });
    });
  });

describe('addNewPlayer', () => {
    it('should add a new player to the database', async () => {
        const playerId = '1';
        const playerName = 'John Smith';
      
        const newPlayer = await addNewPlayer(playerId, playerName);
      
        const playerInDb = await Player.findOne({ id: playerId });
      
        expect(playerInDb).toBeTruthy();
        expect(playerInDb.name).toBe(playerName);
        expect(playerInDb.records.prevEventsPlayed).toBe(0);
        expect(playerInDb.records.prevTourWins).toBe(0);
        expect(playerInDb.points).toBe(0);
    })

    it('should throw an error if saving the player fails', async () => {
        const playerId = '12345';
        const playerName = 'John Doe';

        const saveMock = vi.spyOn(Player.prototype, 'save').mockRejectedValue(new Error('Failed to save player'));

        await expect(addNewPlayer(playerId, playerName)).rejects.toThrow('Failed to save player');

        saveMock.mockRestore(); 
    })
})

// tests for addNewPlayers
describe('addNewPlayers', () => {
    beforeEach(() => {
        vi.spyOn(playerService, 'addNewPlayer').mockImplementation(async (playerId, playerName) => {
            return { id: playerId, name: playerName, points: 0 };
        });
    });

    it('should add new players to the database if they do not exist', async () => {
        const leaderboardRows = [
            { playerId: 'player1', name: 'Player One', position: "1", total: "-5" },
            { playerId: 'player2', name: 'Player Two', position: "2", total: "-4" }
        ];

        await addNewPlayers(leaderboardRows);

        const player1 = await Player.findOne({ id: 'player1' });
        const player2 = await Player.findOne({ id: 'player2' });

        expect(player1).not.toBeNull();
        expect(player2).not.toBeNull();
        expect(player1.name).toBe('Player One');
        expect(player2.name).toBe('Player Two');
    });

    it('should not add existing players', async () => {
        const existingPlayer = new Player({
            id: 'existingPlayer',
            name: 'Existing Player',
            points: 0,
            records: {
                prevEventsPlayed: 0,
                prevYearSalary: 0,
                prevTourWins: 0,
                currEventsPlayed: 0,
                currTourWins: 0
            },
            tournaments: null
        });
        await existingPlayer.save();

        const leaderboardRows = [
            { playerId: 'player1', name: 'Player One', position: "1", total: "-5" },
            { playerId: 'player2', name: 'Player Two', position: "2", total: "-4" }
        ];

        await addNewPlayers(leaderboardRows);

        expect(playerService.addNewPlayer).toHaveBeenCalledTimes(0);
    });

    it('should throw an error if player lookup fails', async () => {
        vi.spyOn(Player, 'findOne').mockImplementation(() => {
            throw new Error('Database lookup failed');
        });

        const leaderboardRows = [
            { player: { id: 'player1', name: 'Player One' } }
        ];

        await expect(addNewPlayers(leaderboardRows))
            .rejects
            .toThrow('Database lookup failed');
    });
})

describe(`isPlayerEligible`, () => {
    it('should return false', () => {
        const player = {
            id: "1",
            name: "John Smith",
            points: "1",
            isInTop60: false,
            records: null,
            tournaments: null,
        }

        expect(isPlayerEligible(player)).toBeFalsy()
    })

    it('should return true', () => {
        const player = {
            id: "1",
            name: "John Smith",
            points: "1",
            isInTop60: true,
            records: null,
            tournaments: null,
        }
    
        expect(isPlayerEligible(player)).toBeTruthy()
    })
})

describe('updatePlayers', () => {  
    const tournament = {
        id: "483",
        name: "The FedEx Tournament",
        dateStart: "2024-03-07T00:00:00Z",
        dateEnd: "2024-03-10T00:00:00Z",
        doublePoints: false,
        message: "",
        leaderboard: null,
    };

    it('should update player records correctly', async () => {
        const player = await Player.create({
            id: '01',
            name: 'player 1',
            points: 0,
            records: {
                prevEventsPlayed: 0,
                prevYearSalary: 0,
                prevTourWins: 0,
                currEventsPlayed: 0,
                currTourWins: 0,
            },
        });

        const leaderboardRows = [
            { playerId: '01', name: 'player 1', position: '1' }
        ];

        const distributePointsSpy = vi.spyOn(tournamentService, 'distributePoints').mockImplementation(() => {});

        await updatePlayers(tournament, leaderboardRows);

        const updatedPlayer = await Player.findOne({ id: '01' });
        expect(updatedPlayer.records.currEventsPlayed).toBe(1);
        expect(updatedPlayer.records.currTourWins).toBe(1);
        expect(distributePointsSpy).toHaveBeenCalledWith(tournament, leaderboardRows);
    });

    it('should handle missing players gracefully', async () => {
        const leaderboardRows = [
            { playerId: '01', name: 'player 1', position: '1' }
        ];

        const distributePointsSpy = vi.spyOn(tournamentService, 'distributePoints').mockImplementation(() => {});

        await updatePlayers(tournament, leaderboardRows);

        expect(distributePointsSpy).toHaveBeenCalledWith(tournament, leaderboardRows);
    });

    it('should throw an error if an error occurs during player update', async () => {
        vi.spyOn(Player, 'findOne').mockRejectedValue(new Error('Database lookup failed'));

        const leaderboardRows = [
            { playerId: '01', name: 'player 1', position: '1' }
        ];

        await expect(updatePlayers(tournament, leaderboardRows)).rejects.toThrow('Database lookup failed');
    });
});

describe('fetchPlayers', () => {
    it.todo('should return players')

    it.todo('should throw an error if a player is not found')
})

describe('fetchPlayerSalaries', () => {
    it.todo('should return players with position')

    it.todo('should throw an error if database fetch fails')
})

describe('fetchPlayerStandings', () => {
    it.todo('should return players with position')

    it.todo('should throw an error if database fetch fails')
})

describe('createOrUpdatePlayerSalary', () => {
    it.todo('should update salary of existing player')

    it.todo('should add new player with salary')

    it.todo('should throw an error if database fetch fails')

    it.todo('should throw an error if external API fetch fails')

    it.todo('should throw an error if database save fails')
})