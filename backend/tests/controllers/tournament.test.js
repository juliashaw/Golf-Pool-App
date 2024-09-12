import { describe, it, beforeAll, afterAll, beforeEach, afterEach, expect, test, spyOn, clearAllMocks, vi    } from 'vitest';
import mongoose from 'mongoose';
import { fetchTournamentsFromAPI, fetchLeaderboardFromAPI, fetchTournaments } from '../../services/tournament.mjs';
import { getTournaments, getTournamentById } from '../../controllers/tournament.mjs'
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SALARY_CAP } from '../../services/team.mjs'
import Player from '../../models/Player.mjs'
import Tournament from '../../models/Tournament.mjs';
import Team from '../../models/Team.mjs';
const API_KEY = process.env.API_KEY

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
})

// tests for getTournaments
describe('getTournaments', () => {
    let mockFetch;
    let mockFetchTournaments;

    const mockScheduleData = {
        "_id": "64fbe3ac235ac8857ff8e769",
        "orgId": "1",
        "year": "2024",
        "schedule": [
            {
                "tournId": "016",
                "name": "The Sentry",
                "date": {
                    "start": "2024-06-04T00:00:00Z",
                    "end": "2024-06-07T00:00:00Z",
                    "weekNumber": "1"
                },
                "format": "stroke",
                "purse": 20000000,
                "winnersShare": 3600000,
                "fedexCupPoints": 700
            },
            {
                "tournId": "006",
                "name": "Sony Open in Hawaii",
                "date": {
                    "start": "2024-01-11T00:00:00Z",
                    "end": "2024-01-14T00:00:00Z",
                    "weekNumber": "2"
                },
                "format": "stroke",
                "purse": 8300000,
                "winnersShare": 1494000,
                "fedexCupPoints": 500
            },
            {
                "tournId": "002",
                "name": "The American Express",
                "date": {
                    "start": "2024-01-18T00:00:00Z",
                    "end": "2024-01-21T00:00:00Z",
                    "weekNumber": "3"
                },
                "format": "stroke",
                "purse": 8400000,
                "fedexCupPoints": 500
            }
        ]
    };

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
        mockFetch.calls = [];
        mockFetch.returnValue = null;
    });

    afterAll(() => {
        // Restore the original fetch implementation
        global.fetch = global.originalFetch;
    });

    it('should return tournaments from the database if they exist', async () => {
        const tournament1 = await Tournament.create({
            id: "483",
            name: "Masters Tournament",
            dateStart: "2024-03-07T00:00:00Z",
            dateEnd: "2024-03-10T00:00:00Z",
            doublePoints: true,
            message: "",
            leaderboard: null,
        })
        const tournament2 = await Tournament.create({
            id: "502",
            name: "The U.S. Open",
            dateStart: "2024-06-07T00:00:00Z",
            dateEnd: "2024-06-10T00:00:00Z",
            doublePoints: true,
            message: "",
            leaderboard: null,
        }) 
 
        const result = await getTournaments()
        expect(result).toEqual(await Tournament.find())
    });

    // it('should fetch tournaments from the external API and add them to the database when the database is empty', async () => {
    //     // Set the mock to return an empty array (no tournaments in the database)
    //     mockFetchTournaments.shouldReturnEmpty = true;

    //     // Mock the global fetch function to simulate the external API call
    //     global.fetch = async () => ({
    //         json: async () => mockScheduleData,
    //         ok: true,
    //         status: 200,
    //     });

    //     const result = await getTournaments();

    //     // Verify that fetchTournaments was called
    //     expect(mockFetchTournaments.calls.length).toBeGreaterThan(0);

    //     // Verify that the external API was called
    //     expect(global.fetch).toHaveBeenCalled();

    //     // Verify that saveTournamentsToDB was called with filtered tournaments
    //     expect(mockFetchTournaments.calls).toEqual(
    //       expect.arrayContaining([
    //         expect.objectContaining({
    //           savedTournaments: [
    //             {
    //                 id: "016",
    //                 name: "The Sentry",
    //                 startDate: "2024-06-04T00:00:00Z",
    //                 endDate: "2024-06-07T00:00:00Z",
    //                 doublePoints: false,
    //                 tournamentRows: null
    //             }
    //           ]
    //         })
    //       ])
    //     );

    //     // Verify that the function returns the correct tournaments
    //     expect(result).toEqual([
    //         {
    //             id: "016",
    //             name: "The Sentry",
    //             startDate: "2024-06-04T00:00:00Z",
    //             endDate: "2024-06-07T00:00:00Z",
    //             doublePoints: false,
    //             tournamentRows: null
    //         }
    //     ]);
    // });

    // it('should throw an error if fetching tournaments fails', async () => {
    //     // Set the mock to throw an error
    //     mockFetchTournaments.returnValue = Promise.reject(new Error('Internal Server Error'));

    //     await expect(getTournaments()).rejects.toThrow('Error fetching tournaments from external API');

    //     // Ensure that the external API was not called
    //     expect(global.fetch).not.toHaveBeenCalled();
    // });
});



// tests for getTournamentById