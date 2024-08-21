import { Router } from 'express'
import { addTeam } from '../controllers/teamController.mjs'

const router = Router()

// Route for data displayed on Teams page
router.get('/teams', getTeams)

// Route to handle the post request to add a new team
router.post('/teams', async (req, res) => {
    const { teamName, players } = req.body;
  
    try {
      await addTeam(teamName, players);
      res.status(200).json({ message: 'Team added successfully' });
    } catch (error) {
      console.error('Error in adding team: ', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  })

export default router