import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';
import NsTree from './NsTree';

import './PageSearchFrame.css';

export default class PageSearchFrame extends Component
{
  constructor(props) {
    super(props);
    this.dataService = DS_instance();
    this.userService = US_instance();
    let searchTerm= props.searchTag ? "tag:" + this.props.searchTag  : "";
    this.state = { pageList: [], searchTerm: searchTerm };
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
    this.dataService.doPageSearch(this.state.searchTerm).then( (data) => this.setState({pageList:(data.tag)}));
  }

  render()
  {
    let counter = 0;
    return <div className="pageSearchFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
      <h2 className="title">Page Search - {this.state.searchTerm}</h2>
        <div className="pageSearchFrameContent">
          {this.renderList()}
        </div>
    </div>;
  }

  renderLinkURL(p) {
    let name = p.namespace === '' ? p.pageName : p.namespace + ":" + p.pageName;
    return name === '' ? '/' : '/page/' + name;
  }

  renderLinkName(p) {
    let name = p.pageName === '' ? '<ROOT>' : p.pageName;
    name = p.namespace ? p.namespace + ":" + p.pageName : p.pageName;
    let title = p.title ? ' - ' + p.title : '';
    return name + title;
  }

  renderList() {
    let pages = this.state.pageList;
    if (!pages) {
      return <div></div>;
    }
    if (this.asLinks() ) {
      return (<div className="pageList">
        {pages.map( p => <div key={p.pageName}><a href={this.renderLinkURL(p)} >{this.renderLinkName(p)}</a></div>)}

      </div>);
    }

    return <div></div>;
  }
  
  setUser(user) {
    this.setState({user: user});
    this.fetchPageList();
  }
  
  asLinks() {
    return !this.props.editorWidget;
  }
}
