import React from 'react';
import ReactDOM from 'react-dom'

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

module.exports = FileList;
