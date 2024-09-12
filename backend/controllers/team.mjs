import { fetchTeams, createTeam } from '../services/team.mjs';

export const getTeams = async () => {
    try {
      const teams = await fetchTeams()

      res.status(200).json(teams);
    } catch (error) {
    //   console.error("Error fetching teams: ", error); TODO
      res.status(500).json({ message: "Internal Server Error" });
    }
}

// Controller function to add a new team
export const addTeam = async (teamName, players) => {
    try {
      await createTeam(teamName, players);
    } catch (error) {
    //   console.error('Error in adding team:', error); TODO
      throw error;
    }
  };