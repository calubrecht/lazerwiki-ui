import React, {Component} from 'react';
import HTMLReactParser from 'html-react-parser';

import './PreviewFrame.css';

export default class PreviewFrame extends Component
{
  constructor(props) {
    super(props);
    this.state = {pageData: {rendered: ''}};
    props.initData.initFnc().then( (data) => this.setState({pageData:data}));
  }

  render()
  {
    let counter = 0;
    return <div className="previewFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
      <h2 className="title">Preview - {this.props.initData.pageName}</h2>
        <div>{this.renderPage()}</div>
    </div>;
  }

  renderPage() {
    return <div className="previewFrameContent"> {HTMLReactParser(this.state.pageData.rendered)}</div>  
  }
}
