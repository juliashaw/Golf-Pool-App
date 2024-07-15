const express = require("express")
const cors = require('cors')
const playerSalariesData = require("./playerSalariesData.json")
const app = express()
app.use(cors())

app.get("/", (req, res) => {
    res.send("Welcome to the Player Salaries API!");
  });

app.get('/playerSalaries', (req, res) => {
    res.json(playerSalariesData);
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

