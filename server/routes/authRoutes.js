const bodyParser = require('body-parser')
const express = require('express')
const expressSession = require('express-session')
const passport = require('passport')
const verifyJwt = require('express-jwt')

const auth = require('../lib/auth')

const router = express.Router()
router.use(bodyParser.json())

console.log(process.env.SESSION_SECRET);
const session = expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET
})

router.get('/auth/twitter', session, passport.authenticate('twitter'))
router.get('/auth/twitter/callback', session, auth.issueJwt)
router.get('/auth/logout', (req,res) => {
  res.clearCookie('token', { path: '/'})
  res.redirect('/')
})

function getSecret(req, payload, done) {
  done(null, req.app.get('JWT_SECRET'))
}

router.get('open',
verifyJwt({
  credentialsRequired: false,
  getToken: auth.getToken,
  secret: getSecret
}),
(req, res) => {
  const json = {message: 'This route is public'}
  if (req.user){
    json.user = `your user id is: ${req.user.id}`
  }
  res.json(json)
})

router.use(
  verifyJwt({
    getToken: auth.getToken,
    secret: getSecret
  }),
  auth.handleError
)

router.get('/closed', (req, res) => {
  res.json({ message: `Yup, you seem to be user ${req.user.id}.` })
})

module.exports = router
