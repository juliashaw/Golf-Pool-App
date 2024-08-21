import Player from '../models/Player.mjs';
const API_KEY = process.env.API_KEY

// Helper Functions
export async function fetchPlayerFromAPI(firstName, lastName) {
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
    return playerData;
}

export async function addNewPlayer(playerId, playerName) {
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

export async function addNewPlayers(tournament, leaderboardRows) {
    try {
        for (const row of leaderboardRows) {
            const { player } = row
            let existingPlayer = await Player.findOne({ id: player.id })

            if (!existingPlayer) {
                addNewPlayer(player.id, player.name)
            }
        }
    } catch (error) {
        console.error("Error adding new players:", error)
        throw error
    }
}

export function isPlayerEligible(player) {
    return player.canBeOnTeam
}

export async function updatePlayers(tournament, leaderboardRows) {
    try {
        for (const row of leaderboardRows) {
          let player = await Player.findById(row.player.id);
    
          if (player) {
            player.records.currEventsPlayed += 1;
    
            if (row.position === "1") {
              player.records.currTourWins += 1;
            }

            await player.save();
          } else {
            console.error(`Player with ID ${row.player.id} not found in database.`);
          }
        }
    
        distributePoints(tournament, leaderboardRows);
    
        console.log('Player records updated and points distributed successfully.');
      } catch (error) {
        console.error('Error updating player records:', error);
        throw error;
      }
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
        console.error("Error in fetching player salaries:", error);
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
        console.error("Error in fetching player salaries:", error);
        throw error;
      }
};

// Purpose: Update player salary if already in database, otherwise add to database with salary
export async function createOrUpdatePlayerSalary(playerFirstName, playerLastName, salary) {
    try {
        let playerName = playerFirstName + " " + playerLastName
        let player = await Player.findOne({ name: playerName })

      if (!player) {
        const playerData = fetchPlayerFromAPI(playerFirstName, playerLastName)

        if (!playerData || !playerData.id) {
            throw new Error('Player not found in the external API')
        }

        const newPlayerName = playerData.firstName + " " + playerData.lastName
        player = addNewPlayer(playerData.id, newPlayerName)
      }

        player.records.prevYearSalary = salary
        player.isInTop60 = true
        await player.save()

        console.log(`Player ${playerName} updated with salary ${salary} and marked as eligible for team.`);
        return player;
    } catch (error) {
        console.error('Error setting player salary:', error)
        throw error
    }
}

