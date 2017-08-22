import React from 'react'
import {connect} from 'react-redux'

import {getGreetings} from '../actions/greetings'

const renderGreeting = (greeting, key) => (
  <h1 key={key}>{greeting.text}</h1>
)

const Greetings = ({greetings, dispatch}) => (
  <div>
    <a href="/api/v1/auth/twitter">Log in to twitter</a>
    <a href='/api/v1/auth/logout'>Logout</a>
    <button onClick={() => dispatch(getGreetings())}>Show Greetings</button>
    {greetings.map(renderGreeting)}
  </div>
)

const mapStateToProps = (state) => {
  return {greetings: state.greetings}

}

export default connect(mapStateToProps)(Greetings)
