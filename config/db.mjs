import { MongoClient } from 'mongodb'

let dbConnection

// Purpose: Connects to the MongoDB database. cb - callback function
// to execute after a successful connection.
export const  connectToDb = (cb, dbName = 'myTestDb') => {
  MongoClient.connect('mongodb://localhost:27017')
    .then((client) => {
      dbConnection = client.db(dbName)
      return cb()
    })
    .catch(err => {
      console.log(err)
      return cb(err)
    })
}
export const getDb = () => { return dbConnection }