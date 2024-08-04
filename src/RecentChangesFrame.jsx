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
    this.state = {recentChangesList: {"changes":[]}, loading:true, selectedFilter:"All"};
    this.userService = US_instance();
    this.data = DS_instance();
    this.handleFilterChange = this.handleFilterChange.bind(this);
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
        {this.renderFilter()}
        {this.renderList()}
    </div>;
  }

  renderClose() {
    return <button className="close button-unstyled" onClick={() => this.props.doClose()}>X</button>
  }

  renderRadio(value) {
    return <label key={value}><input type="radio" value={value} checked={this.state.selectedFilter===value} onChange={this.handleFilterChange} />{value}</label>
  }

  renderFilter() {
    return <div className="recentChangesFilter">
      {this.renderRadio('All')}
      {this.renderRadio('Pages')}
      {this.renderRadio('Media')}
      </div>
  }

  renderLinkName(p) {
    if (!p.pageDesc) {
      let name = p.namespace === '' ? p.fileName : p.namespace + ":" + p.fileName;
      return <span>{name + " - " + p.action + " by " + p.uploadedBy + " - "}<span className="ts">{p.ts}</span></span>;
    }
    if (p.action === "Deleted") {
        return <span><a href={this.renderLinkURL(p.pageDesc)} >{this.renderPageDesc(p.pageDesc)}</a>{" - " + p.action + " by " + p.pageDesc.modifiedBy + " - "}<span className="ts">{p.pageDesc.modified}</span></span>;
    }
    return <span><a href={this.renderLinkURL(p.pageDesc)} >{this.renderPageDesc(p.pageDesc)}</a>{" r" + p.pageDesc.revision + " - " + p.action + " by " + p.pageDesc.modifiedBy + " - "}<span className="ts">{p.pageDesc.modified}</span></span>;
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

  historyKey(i) {
    if (i.pageDesc) {
      return i.namespace + ":" + i.pageDesc.pagename + i.pageDesc.revision;
    }
    return i.id;
  }


  renderList() {
    let pages = this.state.selectedFilter === 'All' ? this.state.recentChangesList.merged :
      (this.state.selectedFilter === 'Pages' ? this.state.recentChangesList.changes : this.state.recentChangesList.mediaChanges);
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
          return <div className="recentChangesItem" key={this.historyKey(p)}>{name}</div>;})}

      </div>);
  }

  handleFilterChange(ev) {
    this.setState({selectedFilter: ev.target.value});
  }
}
