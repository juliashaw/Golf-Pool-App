import { describe, it, beforeAll, afterAll, beforeEach, afterEach, expect, test, spyOn, clearAllMocks, vi    } from 'vitest';

test('sample test', () => {
    expect(true).toBe(true)
})

// Purpose: Returns an array of tournaments. If no tournaments are found in the 
// database, calls the external API to fetch and save tournaments starting on or 
// after March 1st, 2024.
// router.get('/tournaments', getTournaments);

// // Purpose: Returns a specific tournament by ID. If the leaderboard is null and 
// // the tournament has ended, fetches the leaderboard from the external API.
// router.get('/tournaments/:id', getTournamentById);
