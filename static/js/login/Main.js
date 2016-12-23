import React from 'react';
import ReactDOM from 'react-dom'
import Request from 'superagent';
import UUID from 'uuid/v4';
import Store from 'store2';

const Main = (props) => {
  return (
    <div className='Main container'>
      <Branding />
      <LoginBox />
    </div>
  )
}

const Branding = (props) => {
  return (
    <div className="Branding">
      <img alt="icon" src="../static/icon.png"/>
      <span>FileZone</span>
      <p>Store, upload, and view PDFs to your heart's content</p>
    </div>
  )
}

class LoginBox extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="LoginBox">
        <button type="button" className="btn btn-default fb">
          Log in with Facebook
        </button>
        <button type="button" className="btn btn-default guest">
          Use as Guest (PDFs not stored)
        </button>   
      </div>
    )
  }
}

module.exports = Main;