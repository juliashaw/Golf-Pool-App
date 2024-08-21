import { fetchPlayerSalaries, fetchPlayerStandings, updateOrCreatePlayerSalary } from '../services/player.mjs'

// Purpose: return players with salaries with the following structure
export const getPlayerSalaries = async (req, res) => {
    try {
      const playerSalaries = await fetchPlayerSalaries();
  
      res.status(200).json(playerSalaries);
    } catch (error) {
      console.error("Error fetching player salaries:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

// Purpose: return player standings for the current year
export const getPlayerStandings = async (req, res) => {
    try {
      const playerStandings = await fetchPlayerStandings();

      res.status(200).json(playerStandings);
    } catch (error) {
      console.error("Error fetching player standings:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

// Purpose: call function that adds/updates player in database
export const setPlayerSalary = async (firstName, lastName, salary) => {
    try {
      await updateOrCreatePlayerSalary(firstName, lastName, salary);
    } catch (error) {
      console.error('Error in setting player salary:', error);
      throw error;
    }
  };

