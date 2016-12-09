import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';
import Request from 'superagent';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='Main'>
        <Header />
        <Storage />
      </div>
    )    
  }
}

const Header = (props) => {
  return (
    <div className='Header'>
      <nav className="navbar navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">FileZone</a>
          </div>
      </nav>
    </div>
  )
}

class Storage extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.getFormat = this.getFormat.bind(this);
    this.state = {
      filenameList: ['test.pdf']
    }
  }
  onDrop(acceptedFiles, rejectedFiles) {    
    var acceptedFilenameList = acceptedFiles.map((file) => file.name);
    var rejectedFilenameList = rejectedFiles.map((file) => file.name);

    var PDFNameList = acceptedFilenameList.filter(
      (filename) => this.getFormat(filename) === 'pdf');

    {/*var req = Request.post('/upload')
              .send()
              .end((err, res) => {
                
              });*/}

    this.setState({
      filenameList: [...this.state.filenameList, ...PDFNameList]
    });
  }
  getFormat(filename) {
    return filename.slice(filename.length - 3, filename.length);
  }
  render() {
    return (
      <div className="Storage container">
        <UploadBox onDrop={this.onDrop} />
        <FileList filenameList={this.state.filenameList} />
      </div>
    )
  }
}

Storage.propTypes = {
  filenameList: React.PropTypes.arrayOf(React.PropTypes.string),
  errorFilenameList: React.PropTypes.arrayOf(React.PropTypes.string)
}

{/*class FailedUploadAlert extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var errorFilenameList = this.props.errorFilenameList;
    if(errorFilenameList && errorFilenameList.length > 0) {
      return (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <button type="button" className="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          Sorry! {this.props.errorFilenameList.join(', ')} could not be uploaded. Please check .
        </div>
      )    
    }
    else {
      return null;
    }
  }
}*/}

const UploadBox = (props) => {
  return (
    <div className="UploadBox">
      <Picker />
      <Dropzone className="Dropzone" accept='application/pdf' onDrop={props.onDrop}>
        <div> 
          <span> Drag and drop PDFs or click on the box to start uploading </span>
        </div>
      </Dropzone>  
    </div>
  )
}

{/*Insert onSelect functions*/}
const Picker = (props) => {
  return (
    <div className="Picker btn-group" role="group" aria-label="...">
      <button type="button" className="btn btn-default">Computer</button>
      <button type="button" className="btn btn-default">Dropbox</button>
      <button type="button" className="btn btn-default">Google Drive</button>
    </div>
  )
}

const FileList = (props) => {
  return (
    <div className="FileList table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th className="rest-child">Size</th>
            <th className="rest-child">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {props.filenameList.map((filename, index) => (
            <File filename={filename} key={index}/>
          ))}
        </tbody>
      </table>
    </div>
  )
}

class File extends React.Component {
  constructor(props) {
    super(props);
    this.onViewFile = this.onViewFile.bind(this);
  }
  onViewFile() {
    console.log(this.props.filename);
  }
  render() {
    return (
      <tr>
        <th>
          <a href={"https://filezone.blob.core.windows.net/filezone-static/web/viewer.html?file=" + this.props.filename}>{this.props.filename}</a>
        </th>
        <th className="rest-child">0.5KB</th>
        <th className="rest-child">9/9/2016 3:45</th>
      </tr>
    )
  }
}

module.exports = Main;

