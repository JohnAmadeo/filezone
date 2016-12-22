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

    this.showAlertAndRenameFiles = this.showAlertAndRenameFiles.bind(this);
    this.renameDuplicateFiles = this.renameDuplicateFiles.bind(this);
    this.storeFileToAzure = this.storeFileToAzure.bind(this);
    this.storeFileDataToState = this.storeFileDataToState.bind(this);    

    var localPersistentState = this.getLocalPersistentState();

    this.state = {
      acceptedFilesData: localPersistentState.acceptedFilesData,
      rejectedFilesData: [],
      userID: localPersistentState.userID,
      isUploading: false
    }
  }
  getLocalPersistentState() {
    {/* Retrieve state values from previous sessions stored
        on localStorage using store.js library */}
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
    {/* Load files from local folders after the 'Computer' button 
        is clicked */}
    var nonMappableFileList = e.target.files;
    var acceptedFiles = [];
    var rejectedFilesData = [];
    for(let file of nonMappableFileList) {
      if(file.type === "application/pdf") {
        acceptedFiles.push(file); 
      }
      else {
        rejectedFilesData.push({'name': file.name});
      }
    }

    console.log(rejectedFilesData);

    this.setState({
      rejectedFilesData: rejectedFilesData,
      isUploading: acceptedFiles.length === 0 ? false : true
    })


    if(acceptedFiles) {
      this.renameDuplicateFiles(acceptedFiles);
    }

    console.log(acceptedFiles);
  }
  onDrop(acceptedFiles, rejectedFiles) {  
    {/* Trigerred following drag-n-drop of files into the dropzone */}
    {/* Update rejectedFilesData so user can be shown the 
        dismissable aler component, <FailedUploadAlert /> */}
    var newRejectedFilesData = rejectedFiles.map(function(file) {
      return {'name': file.name}
    })
    this.setState({
      rejectedFilesData: newRejectedFilesData,
      isUploading: acceptedFiles.length === 0 ? false : true
    });

    {/* Update acceptedFilesData so user can be given ability
        to view and open newly uploaded files in <FileList /> */}
    this.renameDuplicateFiles(acceptedFiles);
  }
  onLoadChooser() {
    {/* Create Dropbox Chooser to allow upload of files in a 
        Dropbox account */}
    Dropbox.choose({
      success: this.showAlertAndRenameFiles,
      cancel: function() {console.log("No files uploaded");},
      linkType: "direct",
      multiselect: true,
      extensions: ['.pdf']
    });
  }
  showAlertAndRenameFiles(acceptedFiles) {
    this.setState({
      isUploading: true
    })
    this.renameDuplicateFiles(acceptedFiles);
  }
  renameDuplicateFiles(acceptedFiles) {
    {/* Resolve all potential naming collisions between uploaded
        files and files the user wants to upload */}
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
  }
  storeFileToAzure(acceptedFiles, error, response) {
    {/* Store file in Azure to allow user to click on link in
        the <FileList /> component and be brought to a PDF viewer. 
        Depending on method of upload, (local vs Dropbox), different 
        calls are made to the back-end to perform the file storage */}
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
    }
  }
  storeFileDataToState(newAcceptedFilesData, error, response) {
    {/* Update the list of files that have been uploaded to keep 
        files listed in <FilesList> current and accurate */}
    this.setState({
      acceptedFilesData: newAcceptedFilesData,
      isUploading: false
    })    
    Store.session.set('acceptedFilesData', newAcceptedFilesData);
  }
  onDelete(fileData, e) {
    {/* Delete a file, removing both the file itself on Azure and the
        entry visible in <FileList /> */}
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
        <LoadingAlert isUploading={this.state.isUploading}/>
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

class LoadingAlert extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if(this.props.isUploading === true) {
      return (
        <div className="LoadingAlert"> 
          Uploading files... 
        </div>
      )      
    }
    else {
      return null;
    }
  }
}


class FailedUploadAlert extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    {/* Show user a dismissable error alert if user attempted
        to upload non-PDF files; Show nothing otherwise */}

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