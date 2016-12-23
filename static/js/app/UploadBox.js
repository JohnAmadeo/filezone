import React from 'react';
import ReactDOM from 'react-dom'
import Dropzone from 'react-dropzone';

const UploadBox = (props) => {
  {/* Allows user to upload PDFs via drag-and-drop, clicking the 'Computer' button,
      to upload from local folders, or the 'Dropbox' button to bring up the 
      Dropbox Chooser */}
  return (
    <div className="UploadBox">
      <PickerBar onLoadLocal={props.onLoadLocal} onLoadChooser={props.onLoadChooser}/>
      <Dropzone className="Dropzone" accept='application/pdf' onDrop={props.onDrop}>
        <div> 
          <span> Drag and drop PDFs or click the box to upload </span>
        </div>
      </Dropzone>  
    </div>
  )
}

const PickerBar = (props) => {
  return (
    <div className="PickerBar btn-group" role="group" aria-label="...">
      <ComputerPicker onLoadLocal={props.onLoadLocal}/>
      <DropboxPicker onLoadChooser={props.onLoadChooser}/>
    </div>
  )
}

const ComputerPicker = (props) => {
  return (
    <label className="ComputerPicker btn btn-default btn-file">
        Computer <input type="file" onChange={props.onLoadLocal} accept=".pdf" multiple/>
    </label>
  )
}

const DropboxPicker = (props) => {
  return (
    <button type="button" className="btn btn-default" onClick={props.onLoadChooser}>Dropbox</button>
  )
}

module.exports = UploadBox;
