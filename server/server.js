var path = require('path')
var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

const cookieParser = require('cookie-parser')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

const auth = require('./lib/auth')
const users = require('./lib/users')
const apiRoutes = require('./routes/authRoutes')

var greetings = require('./routes/greeting')
var authRoutes = require('./routes/authRoutes')

var server = express()

server.use(cors('*'))

server.set('JWT_SECRET', process.env.JWT_SECRET) // Can this be moved to api.js?
server.use(passport.initialize()) // Can this be moved to api.js?

server.use(cookieParser())

server.use(bodyParser.json())
server.use(express.static(path.join(__dirname, '../public')))

server.use('/api/greetings', greetings)
server.use('/api/v1/', authRoutes)

passport.use(new TwitterStrategy(auth.twitterConfig, auth.verify))
passport.serializeUser(users.serialize)
passport.deserializeUser(users.deserialize)

module.exports = function(db) {
  server.set('db', db)
  return server
}
