import React from 'react';
import PDF from 'react-pdf-js';
 
class PDFViewer extends React.Component {
  constructor(props) {
    super(props);

    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);

    this.state = {
      pages: 2
    }
  }

  onDocumentComplete(pages) {
    this.setState({ page: 1, pages });
  }
 
  onPageComplete(page) {
    this.setState({ page });
  }
 
  render() {
    return (
      <div className='PDFViewer'>
        {Array(this.state.pages).fill().map((_, pageNum) => 
          ( <Page file="hw1.pdf" 
                  onDocumentComplete={this.onDocumentComplete} 
                  onPageComplete={this.onPageComplete} 
                  pageNum={pageNum + 1} 
                  key={pageNum+1} />
          )
        )}
      </div>
    )    
  }
}

class Page extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <PDF  file={this.props.file} 
            scale={1.5} 
            onDocumentComplete={this.props.onDocumentComplete} 
            onPageComplete={this.props.onPageComplete} 
            page={this.props.pageNum} />
    )
  }
}
 
module.exports = PDFViewer;