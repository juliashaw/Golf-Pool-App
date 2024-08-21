import express from "express"
import { ObjectId } from 'mongodb'
import { connectToDb, getDb } from '../config/db.mjs'
import cors from 'cors'
const PORT = process.env.PORT || 3000

import tournamentsRoute from './src/routes/tournaments.mjs'
import playersRoute from './src/routes/players.mjs'
import teamsRoute from './src/routes/teams.mjs'

// init app 
const app = express()
app.use(cors())
app.use('/tournaments', tournamentsRoute)
app.use('/players', playersRoute)
app.use('/teams', teamsRoute)

// db connection
let db

connectToDb((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log('Server running on port ${PORT}')
    })
    db = getDb()
  }
})

// routes
app.get("/", (req, res) => {
    res.send("Welcome to the Player Salaries API!")
  })