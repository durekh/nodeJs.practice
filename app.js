const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

module.exports = app

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Running')
    })
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const postPlayerQuery = `INSERT INTO
    cricket_team(player_name, jersey_number, role) 
    VALUES( 
       ${playerName}, 
       ${jerseyNumber}, 
       ${role}
    )`

  const dbResponse = await db.run(postPlayerQuery)

  response.send('Player Added to Team')
})

//get method

app.get('/players/:playerId', async (request, response) => {
  const playerDetails = request.body
  const {playerId} = request.params

  const getPlayerDetails = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId}`

  const player = await db.get(getPlayerDetails)
  response.send(player)
})

// put method

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQuery = `
    UPDATE cricket_team 
    SET player_name = ${playerName}, 
    jersey_number = ${jerseyNumber}, 
    role = ${role};`

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//delete method

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params

  const deletePlayer = `
   DELETE FROM book 
   WHERE player_id = ${playerId};`

  await db.run(deletePlayer)
  response.send('Player Removed')
})
