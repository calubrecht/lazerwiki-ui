import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import EditableTextbox from './EditableTextbox';
import {instance as US_instance} from './svc/UserService';
import HTMLReactParser from 'html-react-parser';

export default class RootFrame extends Component
{
  constructor(props) {
    super(props);
    this.userService = US_instance();
    let url =  window.location.pathname;
    if (url != '/' && !url.startsWith("/page/")) {
      window.location.pathname = '/';
      return;
    }
    let p = url.split('/');
    if (p.length > 3) {
      window.location.pathname = '/';
      return;
    }

    this.pageName = p.length > 2 ? p[2] : "";
    this.state = {pageData: {rendered: 'Loading'}, stage:'viewing', user: this.userService.getUser(), loaded:false};
    this.data = DS_instance();
  }

  componentDidMount()
  {
    this.userService.addListener(this);
    this.data.getUIVersion().then(meta => console.log(`UI-version - ${meta.version}`));
    this.data.getVersion().then(res => console.log(`Server-version - ${res}`));
    this.data.fetchPage(this.pageName).then((pageData) => this.setPageData(pageData)).catch(e => this.handleError(e));
  }

  componentWillUnmount() {
    this.userService.removeListener(this);
  }

  setPageData(pageData) {
    this.setState({pageData: pageData, loaded:true});
  }

  setUser(user) {
    this.setState({user: user});
  }

  loggedIn() {
    return this.state.user != null;
  }

  render()
  {
    let user = this.state.user ? this.state.user.userName : "GUEST";
    let createAction = "Create Page";
    if (this.state.stage === 'viewing') {
      return <div className="RootFrame">
        <div className="RootBody"> {HTMLReactParser(this.state.pageData.rendered)}  </div>
        {this.loggedIn() && <div className="RootMenu"><span onClick={() => this.editPage()}>{createAction}</span><span>Delete Page</span></div>}</div>;
    }
      return <div className="RootFrame">
      <div className="RootBody"><EditableTextbox text={this.state.pageData.source} registerTextCB={data => this.setGetEditCB(data)} /> </div>
      <div className="RootMenu"><span onClick={ev => this.savePage(ev)}>Save Page</span><span onClick={ev => this.cancelEdit(ev)}>Cancel</span></div>
      </div>;

  }

  handleError(error) {
    console.log(error);
  }

  editPage() {
    this.setState({"stage": "editing"});
  }

  cancelEdit(ev) {
    ev && ev.preventDefault();
    this.setState({"stage": "viewing"});
  }
  
  savePage(ev) {
    ev.preventDefault();
    this.data.savePage(this.pageName, this.getText()).then((pageData) => {
      this.setPageData(pageData);
      this.cancelEdit(); }).catch(e => this.handleError(e));
  }

 
  setGetEditCB(cb) {
    this.getText = cb;
  }
}
