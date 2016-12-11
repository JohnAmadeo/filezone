import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';
import Request from 'superagent';
import UUID from 'uuid/v4';
import Store from 'store2';

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
    this.getLocalPersistentState = this.getLocalPersistentState.bind(this);

    {/* Retrieve state values from previous sessions stored
        on localStorage using store.js library */}
    var localPersistentState = this.getLocalPersistentState();

    this.state = {
      acceptedFilesData: localPersistentState.acceptedFilesData,
      rejectedFilesData: [],
      userID: localPersistentState.userID
    }
  }

  getLocalPersistentState() {
    var acceptedFilesData = Store.session.get('acceptedFilesData') ? 
                            Store.session.get('acceptedFilesData') : [];

    var userID = Store.session.get('userID') ? 
                 Store.session.get('userID') : UUID();
    Store.session.set('userID', userID);

    return {
      'acceptedFilesData': acceptedFilesData,
      'userID': userID
    }
  }

  renameDuplicates(acceptedFiles) {
    var stateAcceptedFilesData = copyObjectWoFunctions(this.state.acceptedFilesData); 
    for(let file of acceptedFiles) {
      while(hasDuplicateName(file.name, stateAcceptedFilesData)) {
        file.name = getUniqueName(file.name);
      }
      stateAcceptedFilesData.push(getNameAndSizePair(file));
    }
  }

  onDrop(acceptedFiles, rejectedFiles) {  
    {/*// send post request to server
    // (acceptedFilesData, newAcceptedFilesData)
    // need array to JSON
    // retrieve (combinedAcceptedFilesDataNoDuplicates,
    //           newAcceptedFilesDataNoDuplicates)*/}

    var req = Request.post('/rename_duplicates');
    req.set('Content-Type', 'application/json')
       .send({
          'filesData': this.state.acceptedFilesData,
          'newFilesData': acceptedFiles.map(function(file) {
            return {
              'name': file.name,
              'size': (file.size /1000000).toFixed(2)
            }
          })  
       })
       .end((err, res) => res);

    {/*// iterate through newAcceptedFilesData and alter 
    // name of files in acceptedFiles

    // set this.state.acceptedFilesData to 
    // combinedAcceptedFilesDataNoDuplicates*/}

    {/* Send PDF to Flask back-end via POST request */}
    var req = Request.post('/upload');
    req.set('userID', this.state.userID);
    acceptedFiles.map((file) => {
      req.attach(file.name, file);
    });
    req.end((err, res) => {console.log(res.statusText);});  

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
    Store.session.set('acceptedFilesData', newAcceptedFilesData);
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
    Store.session.set('acceptedFilesData', newAcceptedFilesData);
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

