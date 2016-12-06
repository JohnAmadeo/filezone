import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';
import Request from 'superagent';
import PDF from 'react-pdf-js';

var Hello = React.createClass({
  onDrop: function(acceptedFiles, rejectedFiles) {
    var req = Request.post('/upload');
    console.log(req);
    acceptedFiles.forEach((file)=> {
        req.attach(file.name, file);
    });
    req.end(function(err, request) {
      if(err) {
        console.log(err.status);
      }
    });
  },
  onDocumentComplete(pages) {
    this.setState({page: 1, pages})
  },
  onPageComplete(page) {
    this.setState({page})
  },
  render() {
  {/*
    return (
      <div>
        <h1>Hello, world. Upwards and Onwards! It's me!</h1>
        <h1>Another heading</h1>
        <Dropzone onDrop={this.onDrop}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
      </div>
    )
  }*/}
    return (
      <div>
        <PDF  file="/hw1.pdf"               
              onDocumentComplete={this.onDocumentComplete} 
              onPageComplete={this.onPageComplete}
              page={2} />
      </div>
    )
  }
});

export default Hello;

