const mongoose = require('mongoose')
require('dotenv').config();

//define the mongodb connection URL
const mongoURL = process.env.MONGODB_URL_LOCAL   //replace mydatabase(e.g. hotels) with your db name
// const mongoURL = process.env.MONGODB_URL;

//setup mongo URL
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true   //these 2 parameters are necessary to pass
})

//Get the default connection
//mongoose maintains a default connection object representing the MongoDB connection
const db = mongoose.connection

//define event listener for database connection

db.on('connected', () =>{
    console.log('Connected to MongoDB Server')
})

db.on('error', (err) =>{
    console.log('MongoDB connection error:', err)
})

db.on('disconnected', () =>{
    console.log('MongoDB disconnected')
})

//export the database connection
module.exports = db;