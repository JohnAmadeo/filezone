import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';

var request = require('superagent');

var Hello = React.createClass({
  onDrop: function(acceptedFiles, rejectedFiles) {
    var req = request.post('/upload');
    console.log(request);
    acceptedFiles.forEach((file)=> {
        req.attach(file.name, file);
    });
    req.end(function(err, request) {
      if(err) {
        console.log(err.status);
      }
    });
  },

  render() {
    return (
      <div>
        <h1>Hello, world. Upwards and Onwards! It's me!</h1>
        <h1>Another heading</h1>
        <Dropzone onDrop={this.onDrop}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
      </div>
    )
  }
});

export default Hello;

