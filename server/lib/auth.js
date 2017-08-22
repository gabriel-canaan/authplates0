const jwt = require('jsonwebtoken')
const passport = require('passport')
const users = require('./users')

const twitterConfig = {
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: 'http://localhost:3000/'
}

function createToken (user, secret) {
  console.log('user', user)
  return jwt.sign({
    id: user.id,
    username: user.username
  }, secret, {
    expiresIn: 60 * 60 * 24
  })
}

function getToken (req) {
  console.log('req headers', req.headers)
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1]
  } else if (req.cookies && req.cookies.token) {
    return req.cookies.token
  } else if (req.query && req.query.token) {
    console.log('req.query', req.query);
    return req.query.token
  }
  return null
}

function handleError (err, req, res, next) {
  if (err) {
    return res.status(403).json({
      message: 'Access to this resource was denied.',
      error: err.message
    })
  }
  next()
}

function issueJwt (req, res, next) {
  passport.authenticate('twitter', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: 'Authentication failed due to a server error.',
        info: err.message
      })
    }

    if (!user) {
      return res.json({
        message: 'Authentication failed.',
        info: info.message
      })
    }

    const token = createToken(user, req.app.get('JWT_SECRET'))
    // Ideally use `secure: true` in production
    res.cookie('token', token, { httpOnly: true })
    res.redirect('/')
  })(req, res, next)
}

function verify (token, tokenSecret, profile, done) {
  const user = { username: profile.username }
  users.getByTwitter(profile.id)
    .then(userList => {
      if (userList.length === 0) {
        users
          .create(profile.username, profile.id)
          .then(newIds => {
            user.id = newIds[0]
            done(null, user)
          })
          .catch(err => done(err, false, { message: "Couldn't add user due to a server error." }))
      } else {
        user.id = userList[0].id
        done(null, user)
      }
    })
    .catch(err => {
      done(err, false, { message: "Couldn't check your credentials with the database." })
    })
}

module.exports = {
  getToken: getToken,
  handleError: handleError,
  issueJwt: issueJwt,
  twitterConfig: twitterConfig,
  verify: verify
}
