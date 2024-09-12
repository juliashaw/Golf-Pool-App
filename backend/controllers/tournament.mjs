import { fetchTournaments, fetchLeaderboard } from '../services/tournament.mjs';

// Purpose: Try to get tournaments from the database. If empty, 
// call external API, filter by date, and add them to the database.
export const getTournaments = async () => {
    try {
      const tournaments = await fetchTournaments();
      return tournaments
    } catch (error) {
    //   console.error("Error fetching tournaments:", error); TODO
      throw error
    }
}

// Purpose: Retrieve a tournament by ID, fetch leaderboard if 
// necessary, and update player points.
export const getTournamentById = async (id) => {
    try {
        const tournament = await fetchLeaderboard(id)
        return tournament
    } catch (error) {
        // console.error('Error retrieving tournament:', error); TODO
        throw error
    }
}

