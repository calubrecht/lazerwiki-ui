import React, {Component} from 'react';
import DataService from './svc/DataService';
import HTMLReactParser from 'html-react-parser';

export class RootFrame extends Component
{
  constructor(props) {
    super(props);
    this.state = {pageData:''}
    this.data = new DataService();
  }

  componentDidMount()
  {
    this.data.getUIVersion().then(meta => console.log(`UI-version - ${meta.version}`));
    this.data.getVersion().then(res => console.log(`Server-version - ${res}`));
    this.data.fetchPage('anyPage').then((pageData) => this.setPageData(pageData)).catch(e => this.handleError(e));
  }

  setPageData(pageData) {
    this.setState({pageData: pageData});
  }

  render()
  {
    return <div className="RootFrame"> this page state should be {HTMLReactParser(this.state.pageData)} or something </div>;
  }

  handleError(error) {
    console.log(error);
  }
}
