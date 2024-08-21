import Player from '../models/Player.mjs'
import Team from '../models/Team.mjs'
import {isPlayerEligible} from './player.mjs'
export const SALARY_CAP = 35000000  // $35,000,000

// Helper Functions
export function exceedsSalaryCap(players) {
    let totalSalary = 0;
    for (const player of players) {
        totalSalary += player.records.prevYearSalary
    }
    return totalSalary > SALARY_CAP
}

export async function teamCompositionExists(playerObjectIds) {
    const existingTeamComposition = await Team.findOne({ players: { $all: playerObjectIds, $size: playerObjectIds.length } });
    return existingTeamComposition
}

export async function teamNameExists(name) {
    const existingTeamName = await Team.findOne({ name })
    return existingTeamName
}

export const recalculateTeamPoints = async () => {
    try {
        const teams = await Team.find().populate('players');

        await Promise.all(teams.map(async team => {
            const totalPoints = team.players.reduce((sum, player) => sum + player.points, 0);

            team.totalPoints = totalPoints
            await team.save()
        }))

        console.log('Team points recalculated successfully.')
    } catch (error) {
        console.error('Error recalculating team points:', error)
        throw error
    }
}

export const fetchTeams = async () => {

    const teams = await Team.find({}); 
  
    const sortedTeams = teams.sort((a, b) => b.totalPoints - a.totalPoints);

    const teamsWithPosition = sortedTeams.map((team, index) => ({
        position: index + 1,
        name: player.name,
        points: player.points,
        events: player.records.currEventsPlayed,
        wins: player.records.currTourWins,
      }));

      return playerStandingsWithPosition;
}

// Purpose: add team to database if conditions are met
export const createTeam = async (name, players) => {
    try {
        const playerObjectIds = await Promise.all(
            players.map(async ({ firstName, lastName }) => {
                let playerName = firstName + " " + lastName
                let player = await Player.findOne({ name: playerName})
                return player
            })
        )

        const roster = await Player.find({ _id: { $in: playerObjectIds } });

        if (!roster || (players.length !== roster.length)) {
            throw new Error('Some players could not be found')
        }

        if (!roster.every(isPlayerEligible)) {
            throw new Error('All players must be in the top 60 paid golfers for the previous year')
        }

        if (exceedsSalaryCap(roster)) {
            throw new Error(`The team's total salary exceeds the salary cap of ${SALARY_CAP}`)
        }

        const existingTeamComposition = await teamCompositionExists(playerObjectIds)
        if (existingTeamComposition) {
            throw new Error(`A team with the same player composition already exists: ${existingTeamComposition.name}`)
        } 
        
        if (await teamNameExists(name)) {
            throw new Error(`A team with the same name already exists`)
        }

        // create the new team if all conditions are met
        const newTeam = new Team({
            name,
            totalPoints: 0,
            players: playerObjectIds,
        })

        await newTeam.save()
        return newTeam
    } catch (error) {
        // console.error('Error adding team:', error) // TODO
        throw error
    }
}