import React from 'react';
import PDF from 'react-pdf-js';

class PDFViewer extends React.Component {
  constructor(props) {
    super(props);
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
    this.onSearchQuery = this.onSearchQuery.bind(this);
    this.onZoom = this.onZoom.bind(this);
    this.onGoToPage = this.onGoToPage.bind(this);
    this.state = {
      searchQuery: '',
      currentPageNumber: 1,
      displayScale: 1.5,
      pdf: null,
      numberOfPages: 1 
    }
  }
  onDocumentComplete(pages) {
    console.log(pages);
    this.setState({ 
      currentPageNumber: 1,
      numberOfPages: pages
    });
  }
  onPageComplete(page) {
  }
  onSearchQuery(text) {

  }
  onZoom(scale) {

  }
  onGoToPage(pageNumber) {

  }
  render() {
    return (
      <div className='PDFViewer'>
        {/*<Navigation filename={this.props.filename}
                    pdf={this.props.pdf}
                    onSearchQuery={this.onSearchQuery}
                    onZoom={this.onZoom}
                    onGoToPage={this.onGoToPage}/>*/}

        <PageList onDocumentComplete={this.onDocumentComplete}
                  onPageComplete={this.onPageComplete}
                  filename={this.props.filename}
                  pdf={this.state.pdf}
                  numberOfPages={this.state.numberOfPages}
                  displayScale={this.state.displayScale}
                  currentPageNumber={this.state.currentPageNumber}
                  searchQuery={this.state.searchQuery}/>
      </div>
    )    
  }
}

PDFViewer.propTypes = {
  filename: React.PropTypes.string.isRequired
}

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.onExitViewer = this.onExitViewer.bind(this);
  }
  onExitViewer() {}
  render() {
    return (
      <div className="Navigation">
        <PageNumberSearch onGoToPage={this.props.onGoToPage}
                          currentPageNumber={this.props.currentPageNumber}
                          pdf={this.props.pdf}/>
      </div>
    )
  }
}

Navigation.propTypes = {
  filename: React.PropTypes.string.isRequired,
  pdf: React.PropTypes.object,
  onSearchQuery: React.PropTypes.func.isRequired,
  onGoToPage: React.PropTypes.func.isRequired,
  onZoom: React.PropTypes.func.isRequired
}

{/*PageNumberSearch.propTypes = {
  pdf: React.PropTypes.object,
  currentPageNumber: React.PropTypes.number.isRequired,
  onGoToPage: React.PropTypes.func.isRequired
}*/}

const PageList = (props) => {
  console.log(props);

  return (
    <div className='PageList'>
      <Page filename={props.filename} 
            onDocumentComplete={props.onDocumentComplete} 
            onPageComplete={props.onPageComplete} 
            pageNumber={1} 
            key={1} 
            displayScale={props.displayScale} />

      {Array(props.numberOfPages-1).fill().map((_, pageNumber) => 
      (<Page filename={props.filename} 
             onDocumentComplete={props.onDocumentComplete} 
             onPageComplete={props.onPageComplete} 
             pageNumber={pageNumber + 2} 
             key={pageNumber + 2} 
             displayScale={props.displayScale}/>))}
    </div>
  )    
  
}

PageList.propTypes = {
  filename: React.PropTypes.string.isRequired,
  pdf: React.PropTypes.object,  
  displayScale: React.PropTypes.number.isRequired,
  searchQuery: React.PropTypes.string.isRequired,
  onDocumentComplete: React.PropTypes.func.isRequired,
  onPageComplete: React.PropTypes.func.isRequired
}

const Page = (props) => {
  return (
    <PDF file={props.filename} 
         scale={props.displayScale} 
         onDocumentComplete={props.onDocumentComplete} 
         onPageComplete={props.onPageComplete} 
         page={props.pageNumber} />    
  )
}
 
Page.propTypes = {
  filename: React.PropTypes.string.isRequired,
  onDocumentComplete: React.PropTypes.func.isRequired,
  onPageComplete: React.PropTypes.func.isRequired,
  pageNumber: React.PropTypes.number.isRequired,
  displayScale: React.PropTypes.number.isRequired
}

module.exports = PDFViewer;