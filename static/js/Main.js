import React from 'react';
import ReactDOM from 'react-dom'
import Request from 'superagent';
import UUID from 'uuid/v4';
import Store from 'store2';
import FileList from './FileList';
import UploadBox from './UploadBox';

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
    this.getLocalPersistentState = this.getLocalPersistentState.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onLoadChooser = this.onLoadChooser.bind(this);
    this.onLoadLocal = this.onLoadLocal.bind(this);

    this.renameDuplicateFiles = this.renameDuplicateFiles.bind(this);
    this.storeFileToAzure = this.storeFileToAzure.bind(this);
    this.storeFileDataToState = this.storeFileDataToState.bind(this);    

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
  onLoadLocal(e) {
    var nonMappableFileList = e.target.files;
    var files = [];
    for(let file of nonMappableFileList) {
      files.push(file);
    }
    if(files) {
      this.renameDuplicateFiles(files);
    }
  }
  onDrop(acceptedFiles, rejectedFiles) {  
    {/* Update rejectedFilesData */}
    var newRejectedFilesData = rejectedFiles.map(function(file) {
      return {'name': file.name}
    })
    this.setState({
      rejectedFilesData: newRejectedFilesData
    });

    {/* Update acceptedFilesData */}
    this.renameDuplicateFiles(acceptedFiles);
  }
  onLoadChooser() {
    Dropbox.choose({
      success: this.renameDuplicateFiles,
      cancel: function() {console.log("No files uploaded");},
      linkType: "direct",
      multiselect: true,
      extensions: ['.pdf']
    });
  }
  renameDuplicateFiles(acceptedFiles) {

    var req = Request.post('/rename_duplicates');
    req.set('Content-Type', 'application/json')
       .send({
          'filesData': this.state.acceptedFilesData,
          'newFilesData': acceptedFiles.map(function(file) {
            var size = 'size' in file ? (file.size /1000000).toFixed(2) :
                                        (file.bytes /1000000).toFixed(2)
            return {
              'name': file.name,
              'size': size
            }
          })  
       })
       .end(this.storeFileToAzure.bind(this, acceptedFiles));
       {/*.end(this.storeFileData.bind(this, acceptedFiles));*/}
  }
  storeFileToAzure(acceptedFiles, error, response) {
    var oldLength = this.state.acceptedFilesData.length;
    var newLength = response.body.length;
    var filenameList = response.body.map((file) => file.name);
    filenameList = filenameList.slice(oldLength, newLength);
    var fileUrlList = acceptedFiles.map((file) => file.link);

    if('size' in acceptedFiles[0]) {
      var req = Request.post('/upload');
      req.set('userID', this.state.userID);
      acceptedFiles.map((file, index) => {
        req.attach(filenameList[index], file);
      });
      {/*req.end((err, res) => {console.log(res.statusText);});*/}
      req.end(this.storeFileDataToState.bind(this, response.body));
    }
    else if('bytes' in acceptedFiles[0]) {
      var req = Request.post('/download_from_dropbox_and_store');
      req.set('userID', this.state.userID)
         .set('Content-Type', 'application/json')
         .send({
            'fileUrlList': fileUrlList,
            'filenameList': filenameList
         })
         .end(this.storeFileDataToState.bind(this, response.body));
         {/*.end((err, res) => {console.log(res.statusText);})*/}   
    }
  }
  storeFileDataToState(newAcceptedFilesData, error, response) {
    this.setState({
      acceptedFilesData: newAcceptedFilesData
    })    
    Store.session.set('acceptedFilesData', newAcceptedFilesData);
  }
  onDelete(fileData, e) {
    e.preventDefault();
    var fileIndex = this.state.acceptedFilesData.indexOf(fileData);

    {/* Request back-end to delete file from Azure via POST*/}
    var req = Request.post('/delete');
    req.set('userID', this.state.userID)
       .send({filename: this.state.acceptedFilesData[fileIndex].name})
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
        <UploadBox onDrop={this.onDrop} userID={this.state.userID}
                   onLoadChooser={this.onLoadChooser}
                   onLoadLocal={this.onLoadLocal}/>
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

module.exports = Main;