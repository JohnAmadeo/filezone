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

    {/* Wipe old session data */}
    Store.session.remove('userID');
    Store.session.remove('acceptedFilesData');
  
    this.onFBLogin = this.onFBLogin.bind(this);
    this.onGuestLogin = this.onGuestLogin.bind(this);
  }
  onFBLogin() {
    FB.login(function(response) {
      if(response.authResponse) {
        console.log("Yay! Login was successful");
        FB.api('/me', function(response) {
          Store.session.set('userID', response.id);
          window.location.href="/app";   
        }); 
      }
      else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  }
  onGuestLogin() {
    window.location.href="/app";
  }
  render() {
    return (
      <div className="LoginBox">
        <button type="button" className="btn btn-default fb"
          onClick={this.onFBLogin}>
          Log in with Facebook
        </button>
        <button type="button" className="btn btn-default guest"
          onClick={this.onGuestLogin}>
          Use as Guest (PDFs not stored)
        </button>   
      </div>
    )
  }
}

module.exports = Main;