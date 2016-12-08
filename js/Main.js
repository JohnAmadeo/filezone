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
      <div className='PDFViewer'>
        <Header />
        <Storage />
      </div>
    )    
  }
}

const Header = (props) => {
  return (
    <div className='Header'>
      <p>FileZone</p>
    </div>
  )
}

class Storage extends React.Component {
  constructor(props) {
    super(props);
    this.onUploadFile = this.onUploadFile.bind(this);
    this.state = {
      filenameList = ['file1', 'file2']
    }
  }
  onUploadFile() {
  }
  render() {
    return (
      <div className="Storage">
        <UploadBox onUploadFile={this.onUploadFile}/>
        <FileList filenameList={this.state.filenameList}/>
      </div>
    )
  }
}

Storage.propTypes = {
  filenameList: React.PropTypes.arrayOf(React.PropTypes.string)
}

class UploadBox extends React.Component {
  constructor(props) {
    this.onDrop = this.onDrop.bind(this);
    super(props);
  }
  onDrop(acceptedFiles, rejectedFiles) {
    console.log(acceptedFiles, rejectedFiles);
  }
  render() {
    <div className="UploadBox">
      <Picker />
      <Dropzone onDrop={this.onDrop}>
        <div> Try dropping files here </div>
      </Dropzone>  
    </div>
  }
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
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {props.filenameList.map((filename) => (
            <File filename={filename}/>
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
        <th>0.5KB</th>
      </tr>
    )
  }
}

module.exports = Main;

