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
    this.onDelete = this.onDelete.bind(this);
    this.state = {
      acceptedFiles: [],
      rejectedFiles: [],
      userID: UUID()
    }
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
    
    this.setState({
      acceptedFiles: [...this.state.acceptedFiles, ...acceptedFiles],
      rejectedFiles: rejectedFiles
    });
  }
  onDelete(file, e) {
    e.preventDefault();
    var fileIndex = this.state.acceptedFiles.indexOf(file);

    {/* Request back-end to delete file from Azure via POST*/}
    var req = Request.post('/delete');
    req.set('userID', this.state.userID)
       .send({userID: this.state.acceptedFiles[fileIndex].name})
       .end((err, res) => {console.log(res.statusText);});

    this.setState({
      acceptedFiles: this.state.acceptedFiles.filter((_, index) => index != fileIndex)
    })
  }
  render() {
    return (
      <div className="Storage container">
        <FailedUploadAlert rejectedFiles={this.state.rejectedFiles}/>
        <UploadBox onDrop={this.onDrop} />
        <FileList acceptedFiles={this.state.acceptedFiles} 
                  userID={this.state.userID} 
                  onDelete={this.onDelete}/>
      </div>
    )
  }
}

Storage.propTypes = {
  acceptedFiles: React.PropTypes.arrayOf(React.PropTypes.object),
  rejectedFiles: React.PropTypes.arrayOf(React.PropTypes.object),
  userID: React.PropTypes.string
}

class FailedUploadAlert extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var rejectedFiles = this.props.rejectedFiles;
    var rejectedFilenames = rejectedFiles.map((file) => file.name);
    if(rejectedFiles && rejectedFiles.length > 0) {
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
          {props.acceptedFiles.map((file, index) => (
            <File file={file} userID={props.userID} 
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
    var userPath = "../pdf/" + this.props.userID + "/" + this.props.file.name;
    var fileSize = (this.props.file.size/1000000).toFixed(2)
    return (
      <tr>
        <td>
          <a target="_blank" href={viewerUrl + userPath}>
            {this.props.file.name}
          </a>
        </td>
        <td className="size">{fileSize} MB</td>
        <td className="delete-cross">
          <a target="#" onClick={this.props.onDelete.bind(this, this.props.file)}> 
            &times; 
          </a>
        </td>
      </tr>
    )
  }
}

module.exports = Main;

