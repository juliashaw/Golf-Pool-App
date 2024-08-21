import {jest} from '@jest/globals';
import { calculatePoints, distributePoints, filterTournaments, determineDoublePoints, initializeTournaments, tournamentIsFinished} from '../../services/tournament.mjs'
import Player from '../../models/Player.mjs'
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
    jest.clearAllMocks();
})

// tests for calculatePoints
test('calculatePoints returns correct points for different positions', () => {
    expect(calculatePoints(0)).toBe(0);
    expect(calculatePoints(1)).toBe(15);
    expect(calculatePoints(2)).toBe(12);
    expect(calculatePoints(3)).toBe(10);
    expect(calculatePoints(4)).toBe(7);
    expect(calculatePoints(5)).toBe(6);
    expect(calculatePoints(6)).toBe(5);
    expect(calculatePoints(7)).toBe(4);
    expect(calculatePoints(8)).toBe(3);
    expect(calculatePoints(9)).toBe(2);
    expect(calculatePoints(10)).toBe(1);
    expect(calculatePoints(11)).toBe(0); 
});

// tests for distributePoints
describe('distributePoints correctly adds points to players, accounting for ties and doublePoints', () => {
    test('no ties', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }
    
        // Prepare leaderboard rows for 10 players with positions from 1 to 10
        const leaderboardRows = Array.from({ length: 10 }, (_, i) => ({
            position: (i + 1).toString(),
            playerId: `player${i + 1}`,
        }));
    
        // Create player documents in the database
        for (let i = 0; i < 10; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        // Call the distributePoints function
        await distributePoints(tournament, leaderboardRows);
    
        // Verify that each player has the correct points
        for (let i = 0; i < 10; i++) {
            const player = await Player.findOne({ id: `player${i + 1}` });
            const expectedPoints = calculatePoints(i + 1)
            expect(player.points).toBe(expectedPoints)
        }
    })

    test('no ties, double points', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: true,
            messnage: "",
            leaderboard: null,
        }
    
        // Prepare leaderboard rows for 10 players with positions from 1 to 10
        const leaderboardRows = Array.from({ length: 10 }, (_, i) => ({
            position: (i + 1).toString(),
            playerId: `player${i + 1}`,
        }));
    
        // Create player documents in the database
        for (let i = 0; i < 10; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        // Call the distributePoints function
        await distributePoints(tournament, leaderboardRows);
    
        // Verify that each player has the correct points
        for (let i = 0; i < 10; i++) {
            const player = await Player.findOne({ id: `player${i + 1}` });
            const expectedPoints = calculatePoints(i + 1)
            expect(player.points).toBe(expectedPoints * 2)
        }
    })

    test('two-way tie for second place', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },  // First place
            { position: "T2", playerId: "player2" }, // Tied for second place
            { position: "T2", playerId: "player3" }, // Tied for second place
            { position: "4", playerId: "player4" },  // Fourth place
            { position: "5", playerId: "player5" },  // Fifth place
            { position: "6", playerId: "player6" },  // Sixth place
            { position: "7", playerId: "player7" },  // Seventh place
            { position: "8", playerId: "player8" },  // Eighth place
            { position: "9", playerId: "player9" },  // Ninth place
            { position: "10", playerId: "player10" },// Tenth place
            { position: "11", playerId: "player11" } // Eleventh place
        ];

        // Create player documents in the database
        for (let i = 0; i < 11; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        // Call the distributePoints function
        await distributePoints(tournament, leaderboardRows);

        const player1 = await Player.findOne({ id: `player1` });
        expect(player1.points).toBe(15)
        const player2 = await Player.findOne({ id: `player2` });
        expect(player2.points).toBe(11)
        const player3 = await Player.findOne({ id: `player3` });
        expect(player3.points).toBe(11)
        const player4 = await Player.findOne({ id: `player4` });
        expect(player4.points).toBe(7)
        const player5 = await Player.findOne({ id: `player5` });
        expect(player5.points).toBe(6)
        const player6 = await Player.findOne({ id: `player6` });
        expect(player6.points).toBe(5)
        const player7 = await Player.findOne({ id: `player7` });
        expect(player7.points).toBe(4)
        const player8 = await Player.findOne({ id: `player8` });
        expect(player8.points).toBe(3)
        const player9 = await Player.findOne({ id: `player9` });
        expect(player9.points).toBe(2)
        const player10 = await Player.findOne({ id: `player10` });
        expect(player10.points).toBe(1)
        const player11 = await Player.findOne({ id: `player11` });
        expect(player11.points).toBe(0)
    })

    test('two-way tie for second place, doublePoints', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: true,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },  // First place
            { position: "T2", playerId: "player2" }, // Tied for second place
            { position: "T2", playerId: "player3" }, // Tied for second place
            { position: "4", playerId: "player4" },  // Fourth place
            { position: "5", playerId: "player5" },  // Fifth place
            { position: "6", playerId: "player6" },  // Sixth place
            { position: "7", playerId: "player7" },  // Seventh place
            { position: "8", playerId: "player8" },  // Eighth place
            { position: "9", playerId: "player9" },  // Ninth place
            { position: "10", playerId: "player10" },// Tenth place
            { position: "11", playerId: "player11" } // Eleventh place
        ];

        // Create player documents in the database
        for (let i = 0; i < 11; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        // Call the distributePoints function
        await distributePoints(tournament, leaderboardRows);

        const player1 = await Player.findOne({ id: `player1` });
        expect(player1.points).toBe(30)
        const player2 = await Player.findOne({ id: `player2` });
        expect(player2.points).toBe(22)
        const player3 = await Player.findOne({ id: `player3` });
        expect(player3.points).toBe(22)
        const player4 = await Player.findOne({ id: `player4` });
        expect(player4.points).toBe(14)
        const player5 = await Player.findOne({ id: `player5` });
        expect(player5.points).toBe(12)
        const player6 = await Player.findOne({ id: `player6` });
        expect(player6.points).toBe(10)
        const player7 = await Player.findOne({ id: `player7` });
        expect(player7.points).toBe(8)
        const player8 = await Player.findOne({ id: `player8` });
        expect(player8.points).toBe(6)
        const player9 = await Player.findOne({ id: `player9` });
        expect(player9.points).toBe(4)
        const player10 = await Player.findOne({ id: `player10` });
        expect(player10.points).toBe(2)
        const player11 = await Player.findOne({ id: `player11` });
        expect(player11.points).toBe(0)
    })

    test('two-way tie for ninth place', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },
            { position: "2", playerId: "player2" },
            { position: "3", playerId: "player3" },
            { position: "4", playerId: "player4" },
            { position: "5", playerId: "player5" },
            { position: "6", playerId: "player6" },
            { position: "7", playerId: "player7" },
            { position: "8", playerId: "player8" },
            { position: "T9", playerId: "player9" },  // Tied for ninth place
            { position: "T9", playerId: "player10" }  // Tied for ninth place
        ];
    
        // Create players in the database
        for (let i = 0; i < 10; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        await distributePoints(tournament, leaderboardRows);
    
        const player9 = await Player.findOne({ id: "player9" });
        const player10 = await Player.findOne({ id: "player10" });
    
        // Assuming points for 9th = 20, 10th = 10, average = 15
        expect(player9.points).toBe(1.5);
        expect(player10.points).toBe(1.5);
    })

    test('two-way tie for tenth place', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },
            { position: "2", playerId: "player2" },
            { position: "3", playerId: "player3" },
            { position: "4", playerId: "player4" },
            { position: "5", playerId: "player5" },
            { position: "6", playerId: "player6" },
            { position: "7", playerId: "player7" },
            { position: "8", playerId: "player8" },
            { position: "9", playerId: "player9" },
            { position: "T10", playerId: "player10" },  // Tied for tenth place
            { position: "T10", playerId: "player11" }  // Tied for tenth place
        ];
    
        // Create players in the database
        for (let i = 0; i < 11; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        await distributePoints(tournament, leaderboardRows);
    
        const player10 = await Player.findOne({ id: "player10" });
        const player11 = await Player.findOne({ id: "player11" });
    
        expect(player10.points).toBe(0.5);
        expect(player11.points).toBe(0.5);
    })

    test('two-way tie for second place, two-way tie for fifth place', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },
            { position: "T2", playerId: "player2" },  // Tied for second place
            { position: "T2", playerId: "player3" },  // Tied for second place
            { position: "4", playerId: "player4" },
            { position: "T5", playerId: "player5" },  // Tied for fifth place
            { position: "T5", playerId: "player6" },  // Tied for fifth place
            { position: "7", playerId: "player7" },
            { position: "8", playerId: "player8" },
            { position: "9", playerId: "player9" },
            { position: "10", playerId: "player10" }
        ];
    
        // Create players in the database
        for (let i = 0; i < 10; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        await distributePoints(tournament, leaderboardRows);
    
        const player2 = await Player.findOne({ id: "player2" });
        const player3 = await Player.findOne({ id: "player3" });
        const player5 = await Player.findOne({ id: "player5" });
        const player6 = await Player.findOne({ id: "player6" });
    
        expect(player2.points).toBe(11);
        expect(player3.points).toBe(11);
        expect(player5.points).toBe(5.5);
        expect(player6.points).toBe(5.5);
    })

    test('two-way tie for second place, three-way tie for fifth place', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },
            { position: "T2", playerId: "player2" },  // Tied for second place
            { position: "T2", playerId: "player3" },  // Tied for second place
            { position: "4", playerId: "player4" },
            { position: "T5", playerId: "player5" },  // Tied for fifth place
            { position: "T5", playerId: "player6" },  // Tied for fifth place
            { position: "T5", playerId: "player7" },  // Tied for fifth place
            { position: "8", playerId: "player8" },
            { position: "9", playerId: "player9" },
            { position: "10", playerId: "player10" }
        ];
    
        // Create players in the database
        for (let i = 0; i < 10; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        await distributePoints(tournament, leaderboardRows);
    
        const player2 = await Player.findOne({ id: "player2" });
        const player3 = await Player.findOne({ id: "player3" });
        const player5 = await Player.findOne({ id: "player5" });
        const player6 = await Player.findOne({ id: "player6" });
        const player7 = await Player.findOne({ id: "player7" });
    
        expect(player2.points).toBe(11);
        expect(player3.points).toBe(11);
    
        expect(player5.points).toBe(5);
        expect(player6.points).toBe(5);
        expect(player7.points).toBe(5);
    })

    test('three-way tie for tenth place', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },
            { position: "2", playerId: "player2" },  
            { position: "3", playerId: "player3" },  
            { position: "4", playerId: "player4" },
            { position: "5", playerId: "player5" },  
            { position: "6", playerId: "player6" }, 
            { position: "7", playerId: "player7" },  
            { position: "8", playerId: "player8" },
            { position: "9", playerId: "player9" },
            { position: "T10", playerId: "player10" },
            { position: "T10", playerId: "player11" },
            { position: "T10", playerId: "player12" }
        ];
    
        // Create players in the database
        for (let i = 0; i < 12; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }
    
        await distributePoints(tournament, leaderboardRows);
    
        const player10 = await Player.findOne({ id: "player10" });
        const player11 = await Player.findOne({ id: "player11" });
        const player12 = await Player.findOne({ id: "player12" });
    
        const n = ( 1 / 3 )
        expect(player10.points).toBe(n);
        expect(player11.points).toBe(n);
        expect(player12.points).toBe(n);
    })

    it('should throw an error if saving a player fails', async () => {
        const tournament = {
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: false,
            messnage: "",
            leaderboard: null,
        }

        const leaderboardRows = [
            { position: "1", playerId: "player1" },
            { position: "2", playerId: "player2" },
            { position: "3", playerId: "player3" }
        ];

        // Create players in the database
        for (let i = 0; i < 3; i++) {
            await Player.create({ id: `player${i + 1}`, points: 0 });
        }

        // Mock the save method to throw an error when trying to save a player
        const saveMock = jest.spyOn(Player.prototype, 'save').mockRejectedValue(new Error('Failed to save player'));

        // Call distributePoints and expect it to throw an error
        await expect(distributePoints(tournament, leaderboardRows)).rejects.toThrow('Failed to save player');

        // Restore the original implementation after the test
        saveMock.mockRestore();
    });
})




// tests for filterTournaments
describe('filterTournaments returns filtered tournaments', () => {

    test('filter none', () => {
        let unfilteredTournaments = [
            {
                "tournId": "009",
                "name": "Arnold Palmer Invitational presented by Mastercard",
                 "date": {
                    "start": "2024-03-07T00:00:00Z",
                    "end": "2024-03-10T00:00:00Z"
                },
                "weekNumber": "10",
                "format": "stroke",
                "purse": 20000000,
                "winnersShare": 4000000,
                "fedexCupPoints": 700
            }
        ]

        expect(filterTournaments(unfilteredTournaments)).toStrictEqual(unfilteredTournaments)
    })

    test('filter one', () => {
        let unfilteredTournaments = [
            {
                "tournId": "010",
                "name": "Cognizant Classic in The Palm Beaches",
                "date": {
                    "start": "2024-02-29T00:00:00Z",
                    "end": "2024-03-03T00:00:00Z"
                },
                "weekNumber": "9",
                "format": "stroke",
                "purse": 9000000,
                "winnersShare": 1620000,
                "fedexCupPoints": 500
            },
            {
                "tournId": "009",
                "name": "Arnold Palmer Invitational presented by Mastercard",
                 "date": {
                    "start": "2024-03-07T00:00:00Z",
                    "end": "2024-03-10T00:00:00Z"
                },
                "weekNumber": "10",
                "format": "stroke",
                "purse": 20000000,
                "winnersShare": 4000000,
                "fedexCupPoints": 700
            }
        ]

        let filteredTournaments = [
            {
                "tournId": "009",
                "name": "Arnold Palmer Invitational presented by Mastercard",
                 "date": {
                    "start": "2024-03-07T00:00:00Z",
                    "end": "2024-03-10T00:00:00Z"
                },
                "weekNumber": "10",
                "format": "stroke",
                "purse": 20000000,
                "winnersShare": 4000000,
                "fedexCupPoints": 700
            }
        ]

        expect(filterTournaments(unfilteredTournaments)).toStrictEqual(filteredTournaments)
    })

    test('filter many', () => {
        let unfilteredTournaments = [
            {
                "tournId": "010",
                "name": "Cognizant Classic in The Palm Beaches",
                "date": {
                    "start": "2024-02-29T00:00:00Z",
                    "end": "2024-03-03T00:00:00Z"
                },
                "weekNumber": "9",
                "format": "stroke",
                "purse": 9000000,
                "winnersShare": 1620000,
                "fedexCupPoints": 500
            },
            {
                "tournId": "009",
                "name": "Arnold Palmer Invitational presented by Mastercard",
                 "date": {
                    "start": "2024-03-07T00:00:00Z",
                    "end": "2024-03-10T00:00:00Z"
                },
                "weekNumber": "10",
                "format": "stroke",
                "purse": 20000000,
                "winnersShare": 4000000,
                "fedexCupPoints": 700
            },
            {
                "tournId": "540",
                "name": "Mexico Open at Vidanta",
                "date": {
                    "start": "2024-02-22T00:00:00Z",
                    "end": "2024-02-25T00:00:00Z"
                },
                "weekNumber": "9",
                "format": "stroke",
                "purse": 9000000,
                "winnersShare": 1620000,
                "fedexCupPoints": 500
            }
        ]

        let filteredTournaments = [
            {
                "tournId": "009",
                "name": "Arnold Palmer Invitational presented by Mastercard",
                 "date": {
                    "start": "2024-03-07T00:00:00Z",
                    "end": "2024-03-10T00:00:00Z"
                },
                "weekNumber": "10",
                "format": "stroke",
                "purse": 20000000,
                "winnersShare": 4000000,
                "fedexCupPoints": 700
            }
        ]

        expect(filterTournaments(unfilteredTournaments)).toStrictEqual(filteredTournaments)
    })
})

// tests for initializeTournaments
describe('initalizeTournaments initalizes the tournaments', () => {
    test('initalize one', () => {
        let unintializedTournaments = [
            {
                "tournId": "483",
                "name": "Puerto Rico Open",
                "date": {
                  "start": "2024-03-07T00:00:00Z",
                  "end": "2024-03-10T00:00:00Z"
                },
                "weekNumber": "10",
                "format": "stroke",
                "purse": 4000000,
                "winnersShare": 720000,
                "fedexCupPoints": 300
            }
        ]

        let initializedTournaments = [
            { 
                id: "483",
                name: "Puerto Rico Open",
                dateStart: "2024-03-07T00:00:00Z",
                dateEnd: "2024-03-10T00:00:00Z",
                doublePoints: false,
                message: "",
                leaderboard: null
            }
        ]

        let newTournaments = initializeTournaments(unintializedTournaments)
        expect(newTournaments[0].id).toBe(initializedTournaments[0].id)
        expect(newTournaments[0].name).toBe(initializedTournaments[0].name)
        expect(newTournaments[0].dateStart).toBe(initializedTournaments[0].dateStart)
        expect(newTournaments[0].dateEnd).toBe(initializedTournaments[0].dateEnd)
        expect(newTournaments[0].doublePoints).toBe(initializedTournaments[0].doublePoints)
        expect(newTournaments[0].message).toBe(initializedTournaments[0].message)
        expect(newTournaments[0].leaderboard).toBe(initializedTournaments[0].leaderboard)
        expect(newTournaments).toStrictEqual(initializedTournaments)
    })
})

// tests for determineDoublePoints
describe('determineDoublePoints works correctly', () => {
    test('THE PLAYERS Championship', () => {
        let tournament = {
            "tournId": "483",
            "name": "THE PLAYERS Championship",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }

        expect(determineDoublePoints(tournament)).toBeTruthy()
    })

    test('Masters Tournament', () => {
        let tournament = {
            "tournId": "483",
            "name": "Masters Tournament",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }

        expect(determineDoublePoints(tournament)).toBeTruthy()
    })

    test('PGA Championship', () => {
        let tournament = {
            "tournId": "483",
            "name": "PGA Championship",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }

        expect(determineDoublePoints(tournament)).toBeTruthy()
    })

    test('U.S. Open', () => {
        let tournament = {
            "tournId": "483",
            "name": "U.S. Open",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }

        expect(determineDoublePoints(tournament)).toBeTruthy()
    })

    test('The Open Championship', () => {
        let tournament = {
            "tournId": "483",
            "name": "The Open Championship",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }

        expect(determineDoublePoints(tournament)).toBeTruthy()
    })

    test('TOUR Championship', () => {
        let tournament = {
            "tournId": "483",
            "name": "TOUR Championship",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }

        expect(determineDoublePoints(tournament)).toBeTruthy()
    })

    test('Barracuda Championship', () => {
        let tournament = {
            "tournId": "483",
            "name": "Barracuda Championship",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }

        expect(determineDoublePoints(tournament)).toBeFalsy()
    })
})

// tests for tournamentIsFinished
describe(`tournamentIsFinished works correctly`, () => {
    test('should return true', () => {
        let tournament = {
            "tournId": "483",
            "name": "Puerto Rico Open",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2024-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }
        
        expect(tournamentIsFinished(tournament)).toBeTruthy()
    })

    test('should return false', () => {
        let tournament = {
            "tournId": "483",
            "name": "Puerto Rico Open",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": "2034-03-10T00:00:00Z"
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }
        
        expect(tournamentIsFinished(tournament)).toBeFalsy()
    })

    test('should return false', () => {
        const d = new Date()
        let dateString = d.toString()

        let tournament = {
            "tournId": "483",
            "name": "Puerto Rico Open",
            "date": {
              "start": "2024-03-07T00:00:00Z",
              "end": dateString
            },
            "weekNumber": "10",
            "format": "stroke",
            "purse": 4000000,
            "winnersShare": 720000,
            "fedexCupPoints": 300
        }
        
        expect(tournamentIsFinished(tournament)).toBeFalsy()
    })
}) 

// tests for fetchTournamentsFromAPI
describe('fetchTournamentsFromAPI', () => {
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

    it('should return tournament schedule data from the API', async () => {
        const mockScheduleData = {
            schedule: [
                { id: '1', name: 'Tournament One', date: '2024-03-01' },
                { id: '2', name: 'Tournament Two', date: '2024-04-01' },
            ],
        };

        // Set the return value of the mock fetch
        mockFetch.returnValue = {
            json: async () => mockScheduleData,
        };

        const result = await fetchTournamentsFromAPI();
        expect(result).toEqual(mockScheduleData.schedule);
    });

    it('should throw an error if the API call fails', async () => {
        // Set the mock to throw an error
        mockFetch.returnValue = Promise.reject(new Error('API call failed'));

        await expect(fetchTournamentsFromAPI()).rejects.toThrow('API call failed');
    });
});


// test for fetchLeaderboardFromAPI
describe('fetchLeaderboardFromAPI', () => {
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

    it('should return leaderboard data from the API', async () => {
        const mockLeaderboardData = {
            leaderboard: [
                { playerId: '1', position: '1', score: '-10' },
                { playerId: '2', position: '2', score: '-8' },
            ],
        };

        // Set the return value of the mock fetch
        mockFetch.returnValue = {
            json: async () => mockLeaderboardData,
        };

        const result = await fetchLeaderboardFromAPI('475');
        expect(result).toEqual(mockLeaderboardData);
    });

    it('should throw an error if the API call fails', async () => {
        // Set the mock to throw an error
        mockFetch.returnValue = Promise.reject(new Error('API call failed'));

        await expect(fetchLeaderboardFromAPI('475')).rejects.toThrow('API call failed');
    });
});
