import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';
import HTMLReactParser from 'html-react-parser';

import './RecentChangesFrame.css';

export default class RecentChangesFrame extends Component
{
  constructor(props) {
    super(props);
    this.pageName = this.props.initData;
    this.state = {recentChangesList: {"changes":[]}, loading:true};
    this.userService = US_instance();
    this.data = DS_instance();
  }
  
  componentDidMount()
  {
    this.userService.addListener(this);
    this.fetchRecentChanges();
  }

  componentWillUnmount() {
    this.userService.removeListener(this);
  }
  
  setUser(user) {
    this.setState({user: user, recentChangesList:[], loading:true});
    this.fetchRecentChanges();
  }
 
  fetchRecentChanges() {
    this.data.fetchRecentChanges(this.pageName).then(data =>
      {
        this.setState({recentChangesList:data, loading:false})
      });
  }


  render()
  {
     return <div className="recentChangesFrame">
      {this.renderClose()}

        <h2 className="title">Recent Changes</h2>
        {this.renderList()}
    </div>;
  }

  renderClose() {
    return <button className="close button-unstyled" onClick={() => this.props.doClose()}>X</button>
  }

  renderLinkName(p) {
    if (p.action === "Deleted") {
        return <span><a href={this.renderLinkURL(p.pageDesc)} >{this.renderPageDesc(p.pageDesc)}</a>{" - " + p.action + " by " + p.pageDesc.modifiedBy}</span>;
    }
    return <span><a href={this.renderLinkURL(p.pageDesc)} >{this.renderPageDesc(p.pageDesc)}</a>{" r" + p.pageDesc.revision + " - " + p.action + " by " + p.pageDesc.modifiedBy}</span>;
  }

  renderPageDesc(pageDesc) {
    if (pageDesc.namespace) {
      return pageDesc.namespace + ":" + pageDesc.pagename;
    }
    if (!pageDesc.pagename) {
      return "<ROOT>";
    }
    return pageDesc.pagename;
  }

  renderLinkURL(p) {
    let name = p.namespace === '' ? p.pagename : p.namespace + ":" + p.pagename;
    return name === '' ? '/' : '/page/' + name;
  }


  renderList() {
    let pages = this.state.recentChangesList.changes;
    if (!pages || pages.length == 0) {
      if (this.state.loading) {
        return <div>Loading</div>;
      }
    }
    let first = true;
    return (<div className="recentChangesList">
        {pages.map( p => {
          let name = this.renderLinkName(p, first);
          first = false;
          return <div key={p.pageDesc.pagename + p.pageDesc.revision}>{name}</div>;})}

      </div>);
  }

}
