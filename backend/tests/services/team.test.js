import { describe, it, beforeAll, afterAll, afterEach, expect, test, vi } from 'vitest';
import { exceedsSalaryCap, teamCompositionExists, teamNameExists, recalculateTeamPoints, createTeam, fetchTeams } from '../../services/team.mjs';
import Player from '../../models/Player.mjs'
import Team from '../../models/Team.mjs'
import Tournament from '../../models/Tournament.mjs'
import mongoose from 'mongoose';
import * as playerService from '../../services/player.mjs'
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SALARY_CAP } from '../../services/team.mjs'

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
    await Player.deleteMany({}); 
    await Team.deleteMany({})
    await Tournament.deleteMany({})
    vi.clearAllMocks();
    vi.restoreAllMocks();
})

describe('exceedsSalaryCap', () => {
    it('should return false', () => {
        let players = [
            {
                id: "1",
                name: "John Smith", 
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 15000000,  
                    prevTourWins: 3,
                    currEventsPlayed: 4, 
                    currTourWins: 2
                },
                tournaments: null,
            },
            {
                id: "1",
                name: "John Doe",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 15000000, 
                    prevTourWins: 3,
                    currEventsPlayed: 4,
                    currTourWins: 2
                },
                tournaments: null,
            }
        ]

        expect(exceedsSalaryCap(players)).toBeFalsy()
    }),
    it('should return false', () => {
        let players = [
            {
                id: "1",
                name: "John Smith",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 15000000, 
                    prevTourWins: 3,
                    currEventsPlayed: 4,
                    currTourWins: 2
                },
                tournaments: null,
            },
            {
                id: "1",
                name: "John Doe",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 20000000,
                    prevTourWins: 3,
                    currEventsPlayed: 4,
                    currTourWins: 2
                },
                tournaments: null,
            }
        ]

        expect(exceedsSalaryCap(players)).toBeFalsy()
    }),
    it('should return true', () => {
        let players = [
            {
                id: "1",
                name: "John Smith",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 30000000, 
                    prevTourWins: 3,
                    currEventsPlayed: 4,
                    currTourWins: 2
                },
                tournaments: null,
            },
            {
                id: "1",
                name: "John Doe",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 20000000, 
                    prevTourWins: 3,
                    currEventsPlayed: 4,
                    currTourWins: 2
                },
                tournaments: null,
            }
        ]

        expect(exceedsSalaryCap(players)).toBeTruthy()
    })
})

describe('teamCompositionExists', () => {
    it('should return false', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        const player3 = await Player.create({ id: "3", name: 'Player Three', points: 30 });
        const player4 = await Player.create({ id: "4", name: 'Player Four', points: 10 });
        const player5 = await Player.create({ id: "5", name: 'Player Five', points: 20 });
        const player6 = await Player.create({ id: "6", name: 'Player Six', points: 30 });

        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id, player3._id],
          })

        let newRoster = [player4._id, player5._id, player6._id]

        const result = await teamCompositionExists(newRoster)
        expect(result).toBeFalsy()
    }),
    it('should return true', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        const player3 = await Player.create({ id: "3", name: 'Player Three', points: 30 });

        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id, player3._id],
          })

        let newRoster = [player3._id, player1._id, player2._id]

        const result = await teamCompositionExists(newRoster)
        expect(result).toBeTruthy()
    }),
    test('newRoster has 1 less player', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        const player3 = await Player.create({ id: "3", name: 'Player Three', points: 30 });

        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id, player3._id],
          })

        let newRoster = [player2._id, player1._id]

        const result = await teamCompositionExists(newRoster)

        expect(result).toBeFalsy()
    }),
    test('newRoster has 1 more player', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        const player3 = await Player.create({ id: "3", name: 'Player Three', points: 30 });

        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id],
          })

        let newRoster = [player1._id, player2._id, player3._id]

        const result = await teamCompositionExists(newRoster)

        expect(result).toBeFalsy()
    })
})

describe('teamNameExists', () => {
    it('should return false', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        
        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id],
        })
    
        const result = await teamNameExists("Team")
        expect(result).toBeFalsy()
    })
    it('should return true', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        
        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id],
        })
    
        const result = await teamNameExists("Team A")
        expect(result).toBeTruthy()
    }),
    test('teamNameExists should return false', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        
        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id],
        })
    
        const result = await teamNameExists("Team AA")
        expect(result).toBeFalsy()
    })
})

describe('recalculateTeamPoints', () => {
    test('one player, one team', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        
        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id],
        })

        expect(team.totalPoints).toBe(0)
        await recalculateTeamPoints()

        const teamA = await Team.findOne({ name: 'Team A' })
        expect(teamA.totalPoints).toBe(10)
    }),
    test('two players, one team', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });

        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id],
        })

        expect(team.totalPoints).toBe(0)
        await recalculateTeamPoints()

        const teamA = await Team.findOne({ name: 'Team A' })
        expect(teamA.totalPoints).toBe(30)
    }),
    test('three players, two teams', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        const player3 = await Player.create({ id: "3", name: 'Player Three', points: 50 });

        const team1 = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id],
        })

        const team2 = await Team.create({
            name: 'Team B',
            totalPoints: 0,
            players: [player1._id, player3._id],
        })

        expect(team1.totalPoints).toBe(0)
        expect(team2.totalPoints).toBe(0)
        await recalculateTeamPoints()

        const teamA = await Team.findOne({ name: 'Team A' })
        const teamB = await Team.findOne({ name: 'Team B' })
        expect(teamA.totalPoints).toBe(30)
        expect(teamB.totalPoints).toBe(60)
    }),
    it('should throw an error', async () => { 
        vi.spyOn(Team, 'find').mockImplementation(() => {
            throw new Error('Database error');
        });

        await expect(recalculateTeamPoints()).rejects.toThrowError('Error recalculating team points');
    })
})

describe('fetchTeams', () => {
    it('should fetch teams, sort them by totalPoints, and return them with positions', async () => {
        const playerOne = await Player.create({
            name: 'Player One',
            points: 10,
            isInTop60: true,
            records: {
                prevEventsPlayed: 0,
                prevYearSalary: 20000000,
                prevTourWins: 0,
                currEventsPlayed: 0,
                currTourWins: 0,
            },
        });
    
        const playerTwo = await Player.create({
            name: 'Player Two',
            points: 20,
            isInTop60: true,
            records: {
                prevEventsPlayed: 0,
                prevYearSalary: 30000000,
                prevTourWins: 1,
                currEventsPlayed: 1,
                currTourWins: 1,
            },
        });
    
        await Team.create({
            name: 'Team A',
            totalPoints: 30,
            players: [playerOne._id],
        });
    
        await Team.create({
            name: 'Team B',
            totalPoints: 40,
            players: [playerTwo._id],
        });
    
        const fetchPlayersSpy = vi.spyOn(playerService, 'fetchPlayers').mockImplementation((playerIds) => {
            return playerIds.map(id => {
                if (id.toString() === playerOne._id.toString()) {
                    return { name: 'Player One', points: 10 };
                }
                if (id.toString() === playerTwo._id.toString()) {
                    return { name: 'Player Two', points: 20 };
                }
                return null;
            }).filter(player => player !== null);
        });
    
        const result = await fetchTeams();
    
        expect(result).toEqual([
            { position: 1, name: 'Team B', points: 40, players: [{ name: 'Player Two', points: 20 }] },
            { position: 2, name: 'Team A', points: 30, players: [{ name: 'Player One', points: 10 }] },
        ]);
    
        expect(fetchPlayersSpy).toHaveBeenCalledTimes(2);
        expect(fetchPlayersSpy).toHaveBeenCalled();
    }),
    it('should return an empty array if no teams are found', async () => {
      const result = await fetchTeams();
      expect(result).toEqual([]);
    });
});

describe('createTeam', () => {
    test('all conditions are met', async () => {
        const player1 = await Player.create(
            { 
                id: "1", 
                name: 'Player One', 
                points: 10, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 20000000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });
        const player2 = await Player.create(
            { 
                id: "2",
                name: 'Player Two', 
                points: 20, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 15000000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });

        const before = await Team.findOne({ name: 'Team A' })
        expect(before).toBeNull()
        await createTeam('Team A', [{firstName: "Player", lastName: "One"}, {firstName: "Player", lastName: "Two"}])
        const after = await Team.findOne({ name: 'Team A' })
        expect(after).toBeTruthy()
        expect(after.name).toBe('Team A')
        expect(after.totalPoints).toBe(0)
        expect(after.players).toStrictEqual([player1._id, player2._id])
    }),
    test('one player is inelgible', async () => {
        const player1 = await Player.create(
            { 
                id: "1", 
                name: 'Player One', 
                points: 10, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 100000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });
        const player2 = await Player.create(
            { 
                id: "2",
                name: 'Player Two', 
                points: 20, 
                isInTop60: false, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 100000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });

            const before = await Team.findOne({ name: 'Team A' });
            expect(before).toBeNull();
        
            await expect(createTeam('Team A', [{firstName: "Player", lastName: "One"}, {firstName: "Player", lastName: "Two"}])).rejects.toThrow('All players must be in the top 60 paid golfers for the previous year');
        
            const after = await Team.findOne({ name: 'Team A' });
            expect(after).toBeNull();
    }),
    test('totalSalary exceeds the salary cap', async () => {
        const player1 = await Player.create(
            { 
                id: "1", 
                name: 'Player One', 
                points: 10, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 20000000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });
        const player2 = await Player.create(
            { 
                id: "2",
                name: 'Player Two', 
                points: 20, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 15000001,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });

            const before = await Team.findOne({ name: 'Team A' });
            expect(before).toBeNull();
        
            await expect(createTeam('Team A', [{firstName: "Player", lastName: "One"}, {firstName: "Player", lastName: "Two"}])).rejects.toThrow(`The team's total salary exceeds the salary cap of ${SALARY_CAP}`);
        
            const after = await Team.findOne({ name: 'Team A' });
            expect(after).toBeNull();
    }),
    test('team composition exists', async () => {
        const player1 = await Player.create(
            { 
                id: "1", 
                name: 'Player One', 
                points: 10, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 20000000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });
        const player2 = await Player.create(
            { 
                id: "2",
                name: 'Player Two', 
                points: 20, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 15000000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });

        const before = await Team.findOne({ name: 'Team A' })
        expect(before).toBeNull()
        await createTeam('Team A', [{firstName: "Player", lastName: "One"}, {firstName: "Player", lastName: "Two"}])
        await expect(createTeam('Team B', [{firstName: "Player", lastName: "One"}, {firstName: "Player", lastName: "Two"}])).rejects.toThrow(`A team with the same player composition already exists: Team A`);
        const after = await Team.findOne({ name: 'Team B' });
        expect(after).toBeNull();
    }),
    test('team name already exists', async () => {
        const player1 = await Player.create(
            { 
                id: "1", 
                name: 'Player One', 
                points: 10, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 20000000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });
        const player2 = await Player.create(
            { 
                id: "2",
                name: 'Player Two', 
                points: 20, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 1500000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });

            const before = await Team.findOne({ name: 'Team A' });
            expect(before).toBeNull();
        
            await createTeam('Team A', [{firstName: "Player", lastName: "One"}])
            await expect(createTeam('Team A', [{firstName: "Player", lastName: "One"}, {firstName: "Player", lastName: "Two"}])).rejects.toThrow(`A team with the same name already exists`);
        
            const after = await Team.findOne({ name: 'Team A' });
            expect(after).toBeTruthy()
            expect(after.name).toBe('Team A')
            expect(after.totalPoints).toBe(0)
            expect(after.players).toStrictEqual([player1._id])
    }),
    test('some players could not be found', async () => {
        const player1 = await Player.create(
            { 
                id: "1", 
                name: 'Player One', 
                points: 10, 
                isInTop60: true, 
                records: {
                    prevEventsPlayed: 0,
                    prevYearSalary: 20000000,
                    prevTourWins: 0,
                    currEventsPlayed: 0,
                    currTourWins: 0
                }, 
                tournaments: null
            });

            await expect(createTeam('Team A', [{firstName: "Player", lastName: "One"}, {firstName: "Player", lastName: "Two"}])).rejects.toThrow(`Some players could not be found`);
        
            const after = await Team.findOne({ name: 'Team A' });
            expect(after).toBeNull()
    })
})
