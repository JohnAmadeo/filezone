import React from 'react';
import ReactDOM from 'react-dom'
import Request from 'superagent';
import UUID from 'uuid/v4';
import Store from 'store2';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='Main container'>
        <Branding />
      </div>
    )
  }
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

module.exports = Main;