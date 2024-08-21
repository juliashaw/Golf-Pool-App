import {jest} from '@jest/globals';
import { exceedsSalaryCap, teamCompositionExists, teamNameExists, recalculateTeamPoints, addTeam } from '../../services/team.mjs';
import Team from '../../models/Team.mjs';
import Player from '../../models/Player.mjs';
import mongoose from 'mongoose';
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
    // Clean up the database after each test
    await Player.deleteMany({});
    await Team.deleteMany({})
    jest.clearAllMocks();
})

// tests for exceedsSalaryCap
describe('exceedsSalaryCap returns true when totalSalary is greater than the cap', () => {
    test('totalSalary is below cap', () => {
        let players = [
            {
                id: "1",
                name: "John Smith",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 15000000, // $15,000,000
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
                    prevYearSalary: 15000000, // $15,000,000
                    prevTourWins: 3,
                    currEventsPlayed: 4,
                    currTourWins: 2
                },
                tournaments: null,
            }
        ]

        expect(exceedsSalaryCap(players)).toBeFalsy()
    }),
    test('totalSalary is equal to salary cap', () => {
        let players = [
            {
                id: "1",
                name: "John Smith",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 15000000, // $15,000,000
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
                    prevYearSalary: 20000000, // $20,000,000
                    prevTourWins: 3,
                    currEventsPlayed: 4,
                    currTourWins: 2
                },
                tournaments: null,
            }
        ]

        expect(exceedsSalaryCap(players)).toBeFalsy()
    }),
    test('totalSalary above salary cap', () => {
        let players = [
            {
                id: "1",
                name: "John Smith",
                points: "1",
                isInTop60: true,
                records: {
                    prevEventsPlayed: 2,
                    prevYearSalary: 30000000, // $30,000,000
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
                    prevYearSalary: 20000000, // $20,000,000
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

// tests for teamCompositionExists
describe('teamCompositionExists returns true only if the exact set of players is equal to a preexisiting teams roster', () => {
    test('team composition does not already exist', async () => {
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
    test('team composition does already exist', async () => {
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

// tests for teamNameExists
describe('teamNameExists correctly returns true if a team with that name exists in the db, false otherwise', () => {
    test('teamNameExists should return false', async () => {
        const player1 = await Player.create({ id: "1", name: 'Player One', points: 10 });
        const player2 = await Player.create({ id: "2", name: 'Player Two', points: 20 });
        
        const team = await Team.create({
            name: 'Team A',
            totalPoints: 0,
            players: [player1._id, player2._id],
        })
    
        const result = await teamNameExists("Team")
        expect(result).toBeFalsy()
    }),
    test('teamNameExists should return true', async () => {
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

// tests for recalculateTeamPoints
describe('recalculateTeamPoints correctly sums the points of the roster players and saves it to the db', () => {
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
    })
})

// tests for addTeam
describe('addTeam adds team to database, only when conditions are met', () => {
    test('team is added successfully', async () => {
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
        await addTeam('Team A', ["1", "2"])
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
        
            // Ensure that an error is thrown when trying to add the ineligible player
            await expect(addTeam('Team A', ["1", "2"])).rejects.toThrow('All players must be in the top 60 paid golfers for the previous year');
        
            // Verify that no team with the name 'Team A' exists after the test
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
        
            // Ensure that an error is thrown when trying to add the ineligible player
            await expect(addTeam('Team A', ["1", "2"])).rejects.toThrow(`The team's total salary exceeds the salary cap of ${SALARY_CAP}`);
        
            // Verify that no team with the name 'Team A' exists after the test
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
        await addTeam('Team A', ["1", "2"])
        await expect(addTeam('Team B', ["1", "2"])).rejects.toThrow(`A team with the same player composition already exists: Team A`);
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
        
            // Ensure that an error is thrown when trying to add the ineligible player
            await addTeam('Team A', ["1"])
            await expect(addTeam('Team A', ["1", "2"])).rejects.toThrow(`A team with the same name already exists`);
        
            // Verify that no team with the name 'Team A' exists after the test
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

            await expect(addTeam('Team A', ["1", "2"])).rejects.toThrow(`Some players could not be found`);
        
            const after = await Team.findOne({ name: 'Team A' });
            expect(after).toBeNull()
    })
})
