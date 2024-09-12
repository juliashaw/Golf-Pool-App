import Player from '../models/Player.mjs';
import { distributePoints } from '../services/tournament.mjs';
const API_KEY = process.env.API_KEY

// Helper Functions
export const fetchPlayerFromAPI = async (firstName, lastName) => {
    const url = `https://live-golf-data.p.rapidapi.com/players?lastName=${encodeURIComponent(lastName)}&firstName=${encodeURIComponent(firstName)}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'live-golf-data.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    const playerData = await response.json();

    // The API returns an array with a single player object
    if (Array.isArray(playerData) && playerData.length > 0) {
        const player = playerData[0];
        return {
            id: player.playerId, 
            name: `${player.firstName}` + " " + `${player.lastName}`,
        };
    } 
    
    return null;
}

export const addNewPlayer = async (playerId, playerName) => {
    try {
        const newPlayer = new Player({
            id: playerId,
            name: playerName,
            points: 0,
            records: {
                prevEventsPlayed: 0,
                prevYearSalary: 0,
                prevTourWins: 0, 
                currEventsPlayed: 0, 
                currTourWins: 0
            },  
            tournaments: null
        })
        await newPlayer.save()
        return newPlayer
    } catch (error) {
        throw error
    }
}

export const addNewPlayers = async (leaderboardRows) => {
    try {
        for (const row of leaderboardRows) {
            // const { player } = row
            let existingPlayer = await Player.findOne({ id: row.playerId })

            if (!existingPlayer) {
                addNewPlayer(row.playerId, row.name)
            }
        }
    } catch (error) {
        // console.error("Error adding new players:", error) TODO
        throw error
    }
}

export const isPlayerEligible = (player) => {
    return player.isInTop60
}

export const updatePlayers = async (tournament, leaderboardRows) => {
    try {
        for (const row of leaderboardRows) {
          let player = await Player.findOne({ id: row.playerId });
    
          if (player) {
            player.records.currEventsPlayed += 1;
    
            if (row.position === "1") {
              player.records.currTourWins += 1;
            }

            await player.save();
          } else {
            // console.error(`Player with ID ${row.player.id} not found in database.`); TODO
          }
        }
    
        distributePoints(tournament, leaderboardRows);
    
        console.log('Player records updated and points distributed successfully.');
      } catch (error) {
        // console.error('Error updating player records:', error); TODO
        throw error;
      }
}

export const fetchPlayers = async (playerIds) => {
    const players = []
    for (const playerId in playerIds) {
        let player = await Player.findById(playerId)
        if (player) {
            players.push({ name: player.name, points: player.points })
        } else {
            throw new Error('Some players not found')
        }
    }
    return players
}

// Purpose: Fetch players from database, sort by salary, return in json array
export const fetchPlayerSalaries = async () => {
    try {
        const players = await Player.find({ isInTop60: true }); 

        const sortedPlayers = players.sort((a, b) => b.records.prevYearSalary - a.records.prevYearSalary);

        const playerSalariesWithPosition = sortedPlayers.map((player, index) => ({
            position: index + 1,
            name: player.name,
            events: player.records.prevEventsPlayed,
            wins: player.records.prevTourWins,
            salary: player.salary,
        }));

        return playerSalariesWithPosition;
    } catch (error) {
        // console.error("Error in fetching player salaries:", error); TODO
        throw error;
    }
  };

// Purpose: Fetch players from database, sort by points, return in json array
export const fetchPlayerStandings = async () => {
    try {
      const players = await Player.find({ isInTop60: true }); 
  
      const sortedPlayers = players.sort((a, b) => b.points - a.points);
  
      const playerStandingsWithPosition = sortedPlayers.map((player, index) => ({
          position: index + 1,
          name: player.name,
          points: player.points,
          events: player.records.currEventsPlayed,
          wins: player.records.currTourWins,
        }));
  
        return playerStandingsWithPosition;
      } catch (error) {
        // console.error("Error in fetching player salaries:", error);  TODO
        throw new Error("Failed to fetch player salaries. Please try again later.");
      }
};

// Purpose: Update player salary if already in database, otherwise add to database with salary
export const createOrUpdatePlayerSalary = async (playerFirstName, playerLastName, salary) => {
    try {
        let playerName = playerFirstName + " " + playerLastName
        let player = await Player.findOne({ name: playerName })

      if (!player) {
        const playerData = fetchPlayerFromAPI(playerFirstName, playerLastName)

        if (!playerData || !playerData.id) {
            throw new Error('Player not found in the external API')
        }

        player = await addNewPlayer(playerData.id, playerData.name)
      }

        player.records.prevYearSalary = salary
        player.isInTop60 = true
        await player.save()

        console.log(`Player ${playerName} updated with salary ${salary} and marked as eligible for team.`);
        return player;
    } catch (error) {
        // console.error('Error setting player salary:', error) TODO
        throw error
    }
}

