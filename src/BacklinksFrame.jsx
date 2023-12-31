import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';
import NsTree from './NsTree';

import './BacklinksFrame.css';

export default class BacklinksFrame extends Component
{
  constructor(props) {
    super(props);
  }


  render()
  {
    let counter = 0;
    return <div className="backlinksFrame">
      <button onClick={() => this.props.doClose()} className="close button-unstyled">X</button>
        <h2 className="title">Backlinks</h2>
        {this.renderList()}
    </div>;
  }

  renderLinkURL(p) {
    return p === '' ? '/' : '/page/' + p;
  }

  renderLinkName(p) {
    return  p === '' ? '<ROOT>' : p;
  }

  renderList() {
    let pages = this.props.initData;
    if (!pages || pages.length == 0) {
      return <div>No links to this page</div>;
    }
    return (<div className="backlinkspageList">
        {pages.map( p => <div key={p}><a href={this.renderLinkURL(p)}>{this.renderLinkName(p)}</a></div>)}

      </div>);
  }
}
