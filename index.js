require('dotenv').load()

const express = require('express')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

const auth = require('./lib/auth')
const users = require('./lib/users')
const apiRoutes = require('./routes/authRoutes')

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION', error.stack)
})

const app = express()

app.set('JWT_SECRET', process.env.JWT_SECRET) // Can this be moved to api.js?

app.use(cookieParser())
app.use(passport.initialize()) // Can this be moved to api.js?
app.use('/api/v1', apiRoutes)

app.get('/', (req, res) => {
  var htmlText = `
    <div>
      ${req.cookies.token
        ? `<div>
          <a href="/api/v1/auth/logout">logout</a>
          <p>Token isnt: ${req.cookies.token}</p>
          </div>`
        : `<div>
            <a href="/api/v1/auth/twitter">Login</a>
          </div>`
      }
    </div>
  `
  res.send(htmlText)
})

// Can these be moved to api.js?
passport.use(new TwitterStrategy(auth.twitterConfig, auth.verify))
passport.serializeUser(users.serialize)
passport.deserializeUser(users.deserialize)

app.listen(3000, () => {
  console.log('Listening on 3000')
})
