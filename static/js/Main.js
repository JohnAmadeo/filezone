import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';
import Request from 'superagent';
import UUID from 'uuid/v4';

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
    this.state = {
      filenameList: [],
      rejectedFilenameList: [],
      userID: UUID()
    }
  }
  onDrop(acceptedFiles, rejectedFiles) {   
    var acceptedFilenameList = acceptedFiles.map((file) => file.name);
    var rejectedFilenameList = rejectedFiles.map((file) => file.name);

    {/* Send PDF to Flask back-end via POST request */}
    var req = Request.post('/upload');
    req.set('userID', this.state.userID);
    acceptedFiles.map((file) => {
      req.attach(file.name, file);
    });
    req.end((err, res) => {
      if(res.statusCode != 200) {
        console.log(res.statusText);
      }
      else {
        console.log(res);
      }
    })  
    
    this.setState({
      filenameList: [...this.state.filenameList, ...acceptedFilenameList],
      rejectedFilenameList: rejectedFilenameList
    });
  }
  render() {
    return (
      <div className="Storage container">
        <FailedUploadAlert rejectedFilenameList={this.state.rejectedFilenameList}/>
        <UploadBox onDrop={this.onDrop} />
        <FileList filenameList={this.state.filenameList} 
                  userID={this.state.userID}/>
      </div>
    )
  }
}

Storage.propTypes = {
  filenameList: React.PropTypes.arrayOf(React.PropTypes.string),
  rejectedFilenameList: React.PropTypes.arrayOf(React.PropTypes.string),
  userID: React.PropTypes.string
}

class FailedUploadAlert extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var rejectedFilenameList = this.props.rejectedFilenameList;
    if(rejectedFilenameList && rejectedFilenameList.length > 0) {
      return (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <button type="button" className="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          Sorry! <strong> {rejectedFilenameList.join(', ')} </strong> 
          could not be uploaded because they are not PDFs.
        </div>
      )    
    }
    else {
      return null;
    }
  }
}

const UploadBox = (props) => {
  return (
    <div className="UploadBox">
      <Picker />
      <Dropzone className="Dropzone" accept='application/pdf' onDrop={props.onDrop}>
        <div> 
          <span> Drag and drop PDFs or click the box to start uploading </span>
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
            <th className="size">Size</th>
            <th className="upload-time">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {props.filenameList.map((filename, index) => (
            <File filename={filename} userID={props.userID} key={index}/>
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
    var viewerUrl = "https://filezone.blob.core.windows.net/filezone-static/web/viewer.html?file=";
    var userPath = "../pdf/" + this.props.userID + "/" + this.props.filename;
    console.log(viewerUrl + userPath);
    return (
      <tr>
        <th>
          <a target="_blank" href={viewerUrl + userPath}>
            {this.props.filename}
          </a>
        </th>
        <th className="size">0.5KB</th>
        <th className="upload-time">9/9/2016 3:45</th>
      </tr>
    )
  }
}

module.exports = Main;

