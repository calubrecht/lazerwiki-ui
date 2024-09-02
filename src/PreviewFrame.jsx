import React, {Component} from 'react';
import HTMLReactParser from 'html-react-parser';
import {instance as RES_instance} from './svc/RenderEnhancerService';

import './PreviewFrame.css';

export default class PreviewFrame extends Component
{
  constructor(props) {
    super(props);
    this.state = {pageData: {rendered: ''}};
    props.initData.initFnc().then( (data) => this.setState({pageData:data}));
    this.previewRef = React.createRef();
  }

  render()
  {
    let counter = 0;
    return <div className="previewFrame">
      <button className="button-unstyled close" onClick={() => this.props.doClose()}>X</button>
      <h2 className="title">Preview - {this.props.initData.pageName}</h2>
        <div>{this.renderPage()}</div>
    </div>;
  }

  renderPage() {
    return <div className="previewFrameContent" ref={this.previewRef}> {HTMLReactParser(this.state.pageData.rendered)}</div>
  }

  componentDidMount() {
    RES_instance().enhanceRenderedCode(this.previewRef.current);
  }
}
