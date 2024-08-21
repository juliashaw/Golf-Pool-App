import {jest} from '@jest/globals';
import { isPlayerEligble } from '../../services/player.mjs';
import Player from '../../models/Player.mjs'
const API_KEY = process.env.API_KEY
import fetch from 'node-fetch'
import { fetchPlayerFromAPI } from '../../services/player.mjs'

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
  
    await mongoose.connect(uri)
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
})

afterEach(async () => {
    // Clean up the database after each test
    await Player.deleteMany({});
    // jest.clearAllMocks();
})


test('player is not elgible', () => {
    const player = {
        id: "1",
        name: "John Smith",
        points: "1",
        isInTop60: false,
        records: null,
        tournaments: null,
    }

    expect(isPlayerEligble(player)).toBeFalsy()
})

test('player is elgible', () => {
    const player = {
        id: "1",
        name: "John Smith",
        points: "1",
        isInTop60: true,
        records: null,
        tournaments: null,
    }

    expect(isPlayerEligble(player)).toBeTruthy()
})


// tests for addNewPlayer
describe('addNewPlayer Error Handling', () => {
    test('should add a new player to the database', async () => {
        const playerId = '1';
        const playerName = 'John Smith';
      
        const newPlayer = await addNewPlayer(playerId, playerName);
      
        const playerInDb = await Player.findOne({ id: playerId });
      
        expect(playerInDb).toBeTruthy();
        expect(playerInDb.name).toBe(playerName);
        expect(playerInDb.records.prevEventsPlayed).toBe(0);
        expect(playerInDb.records.prevTourWins).toBe(0);
        expect(playerInDb.points).toBe(0);
    }),
    it('should throw an error if saving the player fails', async () => {
        const playerId = '12345';
        const playerName = 'John Doe';

        const saveMock = jest.spyOn(Player.prototype, 'save').mockRejectedValue(new Error('Failed to save player'));

        await expect(addNewPlayer(playerId, playerName)).rejects.toThrow('Failed to save player');

        saveMock.mockRestore(); // Restore original implementation after the test
    })
})

// tests for addNewPlayers
test('should add new players from leaderboardRows to the database', async () => {
    const leaderboardRows = [
      { player: { id: '1', name: 'John Smith' }, position: '1', total: '10' },
      { player: { id: '2', name: 'Jane Doe' }, position: '2', total: '8' }
    ]
  
    await addNewPlayers('someTournament', leaderboardRows)
  
    const johnSmith = await Player.findOne({ id: '1' })
    const janeDoe = await Player.findOne({ id: '2' })
  
    expect(johnSmith).toBeTruthy();
    expect(janeDoe).toBeTruthy();
    expect(johnSmith.name).toBe('John Smith');
    expect(janeDoe.name).toBe('Jane Doe');
})



// tests for fetchPlayerFromAPI

describe('fetchPlayerFromAPI', () => {
    let mockFetch;

    beforeAll(() => {
        // Save the original fetch implementation
        global.originalFetch = global.fetch;

        // Create a manual mock for fetch
        mockFetch = async (...args) => {
            mockFetch.calls.push(args);
            return mockFetch.returnValue;
        };
        mockFetch.calls = [];
        mockFetch.returnValue = null;

        // Replace the global fetch with the manual mock
        global.fetch = mockFetch;
    });

    afterEach(() => {
        // Clear any calls to the mock
        mockFetch.calls = [];
        mockFetch.returnValue = null;
    });

    afterAll(() => {
        // Restore the original fetch implementation
        global.fetch = global.originalFetch;
    });

    it('should return player data from the API', async () => {
        const mockPlayerData = { name: 'John Doe', id: '12345' };

        // Set the return value of the mock fetch
        mockFetch.returnValue = {
            json: async () => mockPlayerData,
        };

        const result = await fetchPlayerFromAPI('John', 'Doe');
        expect(result).toEqual(mockPlayerData);
    });

    it('should throw an error if the API call fails', async () => {
        // Set the mock to throw an error
        mockFetch.returnValue = Promise.reject(new Error('API call failed'));

        await expect(fetchPlayerFromAPI('John', 'Doe')).rejects.toThrow('API call failed');
    });
});

