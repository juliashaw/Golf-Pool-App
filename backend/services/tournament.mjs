import Tournament from '../models/Tournament.mjs'
import Player from '../models/Player.mjs'
const API_KEY = process.env.API_KEY

// Helper Functions
export async function fetchTournamentsFromAPI() {
    const url = 'https://live-golf-data.p.rapidapi.com/schedule?orgId=1&year=2024';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'live-golf-data.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    const data = await response.json();
    return data.schedule;
}

export async function fetchLeaderboardFromAPI(tournId) {
    const url = `https://live-golf-data.p.rapidapi.com/leaderboard?orgId=1&tournId=${tournId}&year=2024`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'live-golf-data.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    const data = await response.json();
    return data;
}

export function filterTournaments(tournaments) {
    const marchFirst2024 = new Date('2024-03-01');
    return tournaments.filter(tournament => new Date(tournament.date.start) >= marchFirst2024);
}

export function initializeTournaments(filteredTournaments) {
    const newTournaments = filteredTournaments.map(tournament => ({
        id: tournament.tournId,
        name: tournament.name,
        dateStart: tournament.date.start,
        dateEnd: tournament.date.end,
        doublePoints: determineDoublePoints(tournament),
        message: "",
        leaderboard: null 
    }))
    return newTournaments
}

export function determineDoublePoints(tournament) {
    const majorTournaments = ['THE PLAYERS Championship', 'Masters Tournament', 'PGA Championship', 'U.S. Open', 'The Open Championship', 'TOUR Championship'];
    return majorTournaments.includes(tournament.name);
}

export async function tournamentIsFinished(tournament) {
    const currentDate = new Date()
    const tournamentEndDate = new Date(tournament.date.end)
    tournamentEndDate.setHours(tournamentEndDate.getHours() + 28)   // add 28hr buffer since they play on the last day  

    if (currentDate > tournamentEndDate) {
        return true
    } else {
        const formattedEndDate = tournamentEndDate.toLocaleDateString("en-US", 
            { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric"})
        tournament.message = 
        `The results for this tournament will be available on ${formattedEndDate}.`
        await tournament.save()
        return false
    }
}

export async function fetchAndProcessLeaderboard(tournament) {
    const leaderboardData = await fetchLeaderboardFromAPI(tournament.id)
    const leaderboardRows = leaderboardData.leaderboardRows

    await addNewPlayers(tournament, leaderboardRows)
    await updatePlayers(tournament, leaderboardRows)
    await recalculateTeamPoints()    

    return leaderboardRows
}

export async function updateTournamentWithLeaderboard(tournament, leaderboardRows) {
    tournament.leaderboard = leaderboardRows.map(row => ({
        player: row.playerId,
        position: row.position,
        total: row.total,
    }))
    await tournament.save();
}

export function calculatePoints(position) {
    const pointsTable = {
        1: 15,
        2: 12,
        3: 10,
        4: 7,
        5: 6,
        6: 5,
        7: 4,
        8: 3,
        9: 2,
        10: 1,
    };
    return pointsTable[position] || 0;
}

export function calculateAveragePointsForTie(positions) {
    const totalPoints = positions.reduce((acc, pos) => acc + calculatePoints(pos), 0);
    return totalPoints / positions.length;
};

// Purpose: Calculate and distribute points based on the player's position, accounting for ties.
export async function distributePoints(tournament, leaderboardRows) {
    try {
        const multiplier = tournament.doublePoints ? 2 : 1

        // Process each row in the leaderboard
        for (let i = 0; i < leaderboardRows.length; i++) {
            const { position, playerId } = leaderboardRows[i];
    
            // Check if the position has a "T" indicating a tie
            if (position.startsWith("T")) {
                // Extract the position number from the string (e.g., "T4" becomes 4)
                const positionNumber = parseInt(position.slice(1), 10);
    
                // Gather all players tied for this position
                const tiedPlayers = leaderboardRows.filter(row => parseInt(row.position.slice(1), 10) === positionNumber);
    
                // Determine positions that will have their points averaged
                const positionsToAverage = [];
                for (let j = 0; j < tiedPlayers.length; j++) {
                    positionsToAverage.push(positionNumber + j);
                }
    
                // Calculate the average points for the tied positions
                const averagePoints = calculateAveragePointsForTie(positionsToAverage);
    
                // Assign the average points to each tied player
                for (let j = 0; j < tiedPlayers.length; j++) {
                    const player = await Player.findOne({ id: tiedPlayers[j].playerId });
                    if (player) {
                        player.points += (averagePoints * multiplier);
                        await player.save();
                    }
                }
    
                // Skip over the tied positions in the leaderboard processing
                i += tiedPlayers.length - 1;
            } else {
                // No tie, distribute points normally
                const points = calculatePoints(parseInt(position, 10));
                const player = await Player.findOne({ id: playerId });
                if (player) {
                    player.points += (points * multiplier);
                    await player.save();
                }
            }
        }

    } catch (error) {
        throw Error('Error distributing points: ' + error)
    }
}

// Purpose: return tournaments from database if found, 
// otherwise fetch from external API and save to database
export const fetchTournaments = async () => {
    try {
        const tournaments = await Tournament.find({});
    
        if (tournaments.length > 0) {
            // Tournaments were retrieved from the database
            return tournaments
        } else {
            // No tournaments in the database. Fetch from external API, filter by startDate, 
            // then add to the database
            const externalTournaments = await fetchTournamentsFromAPI()
            const filteredTournaments = filterTournaments(externalTournaments)
            const newTournaments = initializeTournaments(filteredTournaments)
            await Tournament.insertMany(newTournaments)
            return newTournaments
        }
    } catch (error) {
        console.error('Error fetching tournaments:', error)
        throw error
    }
}

// Purpose: return leaderboard from database if found, otherwise fetch 
// from external API, update players/teams, and save to database
export const fetchLeaderboard = async (id) => {
    try {
        const tournament = await Tournament.findOne({ id: id.toString() });
        if (!tournament) {
            throw new Error('Tournament not found')
        }

        if (!await tournamentIsFinished(tournament)) {
            // return tournament with message stating when leaderboard will be available
            return tournament 
        }

        if (!tournament.leaderboard || tournament.leaderboard.length === 0) {
            // database does not have leaderboard, fetch from external API and process
            const leaderboardRows = await fetchAndProcessLeaderboard(tournament)
            await updateTournamentWithLeaderboard(tournament, leaderboardRows)
        }

        return tournament 
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        throw error
    }
}
