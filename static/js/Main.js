import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';
import Request from 'superagent';
import UUID from 'uuid/v4';
import Store from 'store';

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
    this.onDelete = this.onDelete.bind(this);
    this.getExistingState = this.getExistingState.bind(this);

    var existingState = this.getExistingState();

    this.state = {
      acceptedFilesData: [],
      rejectedFilesData: [],
      userID: UUID()
    }

    {/*this.state = {
      acceptedFiles: existingState.acceptedFiles,
      rejectedFiles: [],
      userID: existingState.userID
    }*/}
  }
  getExistingState() {
    {/*var acceptedFilenames = Store.get('acceptedFilenamesAndSizes') ? 
                            Store.get('filezoneAcceptedFilenames') : [];
    var userID = Store.get('filezoneUserID') ? 
                 Store.get('filezoneUserID') : UUID();

    var acceptedFiles*/}
  }
  onDrop(acceptedFiles, rejectedFiles) {   
    {/* Send PDF to Flask back-end via POST request */}
    var req = Request.post('/upload');
    req.set('userID', this.state.userID);
    acceptedFiles.map((file) => {
      req.attach(file.name, file);
    });
    req.end((err, res) => {
      console.log(res.statusText);
    })  

    var acceptedFilesData = acceptedFiles.map(function(file) {
      return {
        'name': file.name,
        'size': (file.size /1000000).toFixed(2)
      }
    });
    var newAcceptedFilesData = 
      [...this.state.acceptedFilesData, ...acceptedFilesData];

    var newRejectedFilesData = rejectedFiles.map(function(file) {
      return {'name': file.name}
    })

    this.setState({
      acceptedFilesData: newAcceptedFilesData,
      rejectedFilesData: newRejectedFilesData
    });
  }
  onDelete(fileData, e) {
    e.preventDefault();
    var fileIndex = this.state.acceptedFilesData.indexOf(fileData);

    {/* Request back-end to delete file from Azure via POST*/}
    var req = Request.post('/delete');
    req.set('userID', this.state.userID)
       .send({userID: this.state.acceptedFilesData[fileIndex].name})
       .end((err, res) => {console.log(res.statusText);});

    var newAcceptedFilesData = 
      this.state.acceptedFilesData.filter((_, index) => index != fileIndex);
    
    this.setState({
      acceptedFilesData: newAcceptedFilesData
    });
  }
  render() {
    return (
      <div className="Storage container">
        <FailedUploadAlert rejectedFilesData={this.state.rejectedFilesData}/>
        <UploadBox onDrop={this.onDrop} />
        <FileList acceptedFilesData={this.state.acceptedFilesData} 
                  userID={this.state.userID} 
                  onDelete={this.onDelete}/>
      </div>
    )
  }
}

Storage.propTypes = {
  acceptedFilesData: React.PropTypes.arrayOf(React.PropTypes.object),
  rejectedFilesData: React.PropTypes.arrayOf(React.PropTypes.object),
  userID: React.PropTypes.string
}

class FailedUploadAlert extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var rejectedFilesData = this.props.rejectedFilesData;
    var rejectedFilenames = rejectedFilesData.map((fileData) => fileData.name);
    if(rejectedFilesData && rejectedFilesData.length > 0) {
      return (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <button type="button" className="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          Sorry! <strong> {rejectedFilenames.join(', ')} </strong> 
          {rejectedFilenames.length > 1 ? "were " : "was "} 
          rejected - only PDF uploads are accepted.
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
          <span> Drag and drop PDFs or click the box to upload </span>
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
            <th className="delete-cross"></th>
          </tr>
        </thead>
        <tbody>
          {props.acceptedFilesData.map((fileData, index) => (
            <File fileData={fileData} userID={props.userID} 
                  key={index} onDelete={props.onDelete}/>
          ))}
        </tbody>
      </table>
    </div>
  )
}

class File extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var viewerUrl = "https://filezone.blob.core.windows.net/filezone-static/web/viewer.html?file=";
    var userPath = "../pdf/" + this.props.userID + "/" + this.props.fileData.name;
    return (
      <tr>
        <td>
          <a target="_blank" href={viewerUrl + userPath}>
            {this.props.fileData.name}
          </a>
        </td>
        <td className="size">{this.props.fileData.size} MB</td>
        <td className="delete-cross">
          <a target="#" onClick={this.props.onDelete.bind(this, this.props.fileData)}> 
            &times; 
          </a>
        </td>
      </tr>
    )
  }
}

module.exports = Main;

