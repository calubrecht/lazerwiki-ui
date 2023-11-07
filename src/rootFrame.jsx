import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';
import HTMLReactParser from 'html-react-parser';

export default class RootFrame extends Component
{
  constructor(props) {
    super(props);
    this.state = {pageData:'', stage:'viewing'}
    this.data = DS_instance();
    this.userService = US_instance();
  }

  componentDidMount()
  {
    this.userService.addListener(this);
    this.data.getUIVersion().then(meta => console.log(`UI-version - ${meta.version}`));
    this.data.getVersion().then(res => console.log(`Server-version - ${res}`));
    this.data.fetchPage('anyPage').then((pageData) => this.setPageData(pageData)).catch(e => this.handleError(e));
  }

  componentWillUnmount() {
    this.userService.removeListener(this);
  }

  setPageData(pageData) {
    this.setState({pageData: pageData});
  }

  setUser(user) {
    this.setState({user: user});
  }

  loggedIn() {
    return this.state.user != null;
  }

  render()
  {
    let user = this.state.user ? this.state.user.user : "GUEST";
    let createAction = "Create Page";
    if (this.state.stage === 'viewing') {
      return <div className="RootFrame">
        <div className="RootBody">this page state should be {HTMLReactParser(this.state.pageData)} or something. You are {user} </div>
        {this.loggedIn() && <div className="RootMenu"><span onClick={() => this.editPage()}>{createAction}</span><span>Delete Page</span></div>}</div>;
    }
      return <div>This will be an edit frame</div>;

  }

  handleError(error) {
    console.log(error);
  }

  editPage() {
    this.setState({"stage": "editing"});
  }
}
