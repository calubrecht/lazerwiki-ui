import React, {Component} from 'react';
import DataService from './svc/DataService';
import HTMLReactParser from 'html-react-parser';

export class RootFrame extends Component
{
  constructor(props) {
    super(props);
    this.state = {pageData:''}
    this.data = new DataService();
    this.setPageDate = this.setPageData.bind();
  }

  componentDidMount()
  {
    this.data.fetchPage('anyPage').then((pageData) => this.setPageData(pageData));
  }

  setPageData(pageData) {
    this.setState({pageData: pageData});
  }

  render()
  {
    return <div className="RootFrame"> this page state should be {HTMLReactParser(this.state.pageData)} or something </div>;
  }
}
