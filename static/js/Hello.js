import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';
import Request from 'superagent';
import PDF from 'react-pdf-js';

var Hello = React.createClass({
  getInitialState: function() {
    return {
      page: 1,
    }
  },
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
  handlePrevious() {
    this.setState({page: this.state.page - 1});
  },
  handleNext() {
    this.setState({page: this.state.page + 1});
  },
  renderPagination(page, pages) {
    let previousButton = <li className="previous" onClick={this.handlePrevious}><a href="#"><i className="fa fa-arrow-left"></i> Previous</a></li>;
    if (page === 1) {
      previousButton = <li className="previous disabled"><a href="#"><i className="fa fa-arrow-left"></i> Previous</a></li>;
    }
    let nextButton = <li className="next" onClick={this.handleNext}><a href="#">Next <i className="fa fa-arrow-right"></i></a></li>;
    if (page === pages) {
      nextButton = <li className="next disabled"><a href="#">Next <i className="fa fa-arrow-right"></i></a></li>;
    }
    return (
      <nav>
        <ul className="pager">
          {previousButton}
          {nextButton}
        </ul>
      </nav>
      );
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
    var pagination = null;
    if(this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }

    return (
      <div>
        <PDF  file="/hw1.pdf"               
              onDocumentComplete={this.onDocumentComplete} 
              onPageComplete={this.onPageComplete}
              page={1} />
        <PDF  file="/hw1.pdf"               
              onDocumentComplete={this.onDocumentComplete} 
              onPageComplete={this.onPageComplete}
              page={2} />
        {pagination}
      </div>
    )
  }
});

export default Hello;

