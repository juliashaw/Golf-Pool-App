const express = require("express")
const cors = require('cors')
const playerSalariesData = require("./playerSalariesData.json")
const tournamentsData = require("./tournamentsData.json")
const standingsToDate = require("./standingsToDate.json")
const teamsData = require("./teamsData.json")
const app = express()
app.use(cors())

app.get("/", (req, res) => {
    res.send("Welcome to the Player Salaries API!");
  });

app.get('/playerSalaries', (req, res) => {
    res.json(playerSalariesData);
})

app.get('/tournaments', (req, res) => {
    res.json(tournamentsData);
})

app.get('/standingsToDate', (req, res) => {
    res.json(standingsToDate);
})

app.get('/teams', (req, res) => {
    res.json(teamsData);
})

app.get('/tournaments/:id', (req, res) => {
    const tournamentId = req.params.id;
    
    const tournament = tournamentsData.find(t => t.id === tournamentId);
    
    if (tournament) {
        if (tournament.leaderboard && tournament.leaderboard.length > 0) {
            res.json({ leaderboard: tournament.leaderboard });
        } else {
            res.json({ message: 'The leaderboard for this tournament is currently unavailable.' });
        }
    } else {
        res.status(404).json({ message: 'Tournament not found' });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

