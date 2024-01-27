import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';
import NsTree from './NsTree';

import './PageFrame.css';

export default class PageFrame extends Component
{
  constructor(props) {
    super(props);
    this.dataService = DS_instance();
    this.userService = US_instance();
    let initialNS = this.props.namespace ? this.props.namespace : "";
    this.state = {nsTree: {}, pageData: {}, namespace: initialNS}
  }

  componentDidMount()
  {
    this.userService.addListener(this);
    this.fetchPageList();
  }
  
  componentWillUnmount() {
    this.userService.removeListener(this);
  }


  fetchPageList() {
    this.dataService.fetchPageList().then( (data) => this.structurePageData(data));
  }

  structurePageData(pageData) {
    this.setState({nsTree: pageData.namespaces, pageData: pageData.pages})
  }

  render()
  {
    let counter = 0;
    return <div className="pageFrame">
      <button onClick={() => this.props.doClose()} className="close button-unstyled">X</button>
      <h2 className="title">Page List</h2>
        <div className="pageFrameContent">
        <div className="nsTreeSelector">
          <h3>Namespace</h3>
          <NsTree nsTree={this.state.nsTree} selectNS={(ns) => this.selectNS(ns)} />
        </div>
        <div className="pageSelector">
          <h3>Pages - [{this.state.namespace}]</h3>
          {this.renderList()}
        </div>
        </div>
    </div>;
  }

  renderLinkURL(p) {
    let name = p.namespace === '' ? p.pagename : p.namespace + ":" + p.pagename;
    return name === '' ? '/' : '/page/' + name;
  }

  renderLinkName(p) {
    let name = p.pagename === '' ? '<ROOT>' : p.pagename;
    let title = p.title ? ' - ' + p.title : '';
    return name + title;
  }

  renderList() {
    let pages = this.state.pageData[this.state.namespace];
    if (!pages) {
      return <div></div>;
    }
    if (this.asLinks() ) {
      return (<div className="pageList">
        {pages.map( p => <div key={p.pagename}><a href={this.renderLinkURL(p)} >{this.renderLinkName(p)}</a></div>)}

      </div>);
    }
    return (<div className="pageList">
        {pages.map( p => <div key={p.pagename}><button className="button-unstyled pageFrameSelect" key={p.pagename} onClick={ev => this.doAction(ev, p)}>{this.renderLinkName(p)}</button></div>)}

      </div>);
  }
  
  setUser(user) {
    this.setState({user: user});
    this.fetchPageList();
  }
  
  selectNS(ns) {
    this.setState({namespace: ns});
  }


  asLinks() {
    return !this.props.selectItem;
  }

  doAction(ev, p) {
    let name = p.namespace === '' ? p.pagename : p.namespace + ":" + p.pagename;
    this.props.selectItem(name);
    ev.preventDefault();
  }
}
