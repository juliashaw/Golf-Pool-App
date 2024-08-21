import { Router } from 'express'
import { getPlayerSalaries, setPlayerSalary, getPlayerStandings } from '../controllers/player.mjs'

const router = Router()

// Route for data displayed on Player Salaries page
router.get('/player-salaries', getPlayerSalaries)

// Route for data displayed on Standings page
router.get('player-standings', getPlayerStandings)

// Route for player salary to be saved in database
router.post('/players', async (req, res) => {
    const { firstName, lastName, salary } = req.body;
  
    try {
      await setPlayerSalary(firstName, lastName, salary);
      res.status(200).json({ message: 'Player salary updated successfully' });
    } catch (error) {
      console.error('Error in setting player salary: ', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

export default router
