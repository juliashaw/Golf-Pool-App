import { getTournaments, getTournamentById } from '../controllers/tournament.mjs';
import express from "express";
const router = express.Router();

// Purpose: Returns an array of tournaments. If no tournaments are found in the 
// database, calls the external API to fetch and save tournaments starting on or 
// after March 1st, 2024.
router.get('/tournaments', getTournaments);

// Purpose: Returns a specific tournament by ID. If the leaderboard is null and 
// the tournament has ended, fetches the leaderboard from the external API.
router.get('/tournaments/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const tournament = await getTournamentById(id)
        res.status(200).json(tournament)
    } catch (error) {
        console.error('Error in fetching leaderboard: ', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

export default router