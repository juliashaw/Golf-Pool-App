import { fetchTournaments, fetchLeaderboard } from '../services/tournament.mjs';

// Purpose: Try to get tournaments from the database. If empty, 
// call external API, filter by date, and add them to the database.
export const getTournaments = async (req, res) => {
    try {
      const tournaments = await fetchTournaments();

      res.status(200).json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
}

// Purpose: Retrieve a tournament by ID, fetch leaderboard if 
// necessary, and update player points.
export const getTournamentById = async (id) => {
    try {
        const tournament = await fetchLeaderboard(id)
        return tournament
    } catch (error) {
        console.error('Error retrieving tournament:', error);
        throw error
    }
}

