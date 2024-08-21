import {jest} from '@jest/globals';
import mongoose from 'mongoose';
import { fetchTournamentsFromAPI, fetchLeaderboardFromAPI } from '../../services/tournament.mjs';
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
    jest.clearAllMocks();
})

// tests for getTournaments
describe('getTournaments', () => {
    let mockTournamentModel;
    let mockFetch;

    beforeAll(() => {
        // Mock the Tournament model (database)
        mockTournamentModel = {
            find: jest.fn(),
            insertMany: jest.fn(),
        };

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
        mockTournamentModel.find.mockClear();
        mockTournamentModel.insertMany.mockClear();
        mockFetch.calls = [];
        mockFetch.returnValue = null;
    });

    afterAll(() => {
        // Restore the original fetch implementation
        global.fetch = global.originalFetch;
    });

    it('should return tournaments from the database if they exist', async () => {
        // Mock existing tournaments in the database
        const existingTournaments = [{ _id: '1', name: 'Tournament A' }];
        mockTournamentModel.find.mockResolvedValue(existingTournaments);

        const result = await getTournaments({}, {});

        expect(result).toEqual(existingTournaments);
        expect(mockTournamentModel.find).toHaveBeenCalled();
        expect(mockTournamentModel.insertMany).not.toHaveBeenCalled();
    });

    it('should fetch from external API and add tournaments to the database if none exist', async () => {
        // Mock external API response
        const externalTournaments = [{ id: '2', name: 'Tournament B' }];
        mockFetch.returnValue = {
            json: async () => externalTournaments,
        };

        // Mock filtered and initialized tournaments
        const filteredTournaments = [{ _id: '2', name: 'Tournament B' }];
        const newTournaments = [{ _id: '2', name: 'Tournament B' }];

        // Mock inserting tournaments into the database
        mockTournamentModel.insertMany.mockResolvedValue(newTournaments);

        const result = await getTournaments({}, {});

        expect(result).toEqual(newTournaments);
        expect(mockTournamentModel.find).toHaveBeenCalled();
        expect(mockTournamentModel.insertMany).toHaveBeenCalledWith(newTournaments);
    });

    it('should handle errors and return 500 status if an error occurs', async () => {
        // Mock an error during database fetch
        mockTournamentModel.find.mockRejectedValue(new Error('Database error'));
    
        const res = {
            status: jest.fn(),
            json: jest.fn(),
        };
    
        // Mock the status function to return the res object itself
        res.status.mockReturnValue(res);
    
        await getTournaments({}, res);
    
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

});



// tests for getTournamentById