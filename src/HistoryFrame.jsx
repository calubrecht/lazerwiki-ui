import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';

import './HistoryFrame.css';

export default class HistoryFrame extends Component
{
  constructor(props) {
    super(props);
    this.pageName = this.props.initData;
    this.state = {historyList: [], loading:true};
    this.userService = US_instance();
    this.data = DS_instance();
  }
  
  componentDidMount()
  {
    this.userService.addListener(this);
    this.fetchPageHistory();
  }

  componentWillUnmount() {
    this.userService.removeListener(this);
  }
  
  setUser(user) {
    this.setState({user: user, historyList:[], loading:true});
    this.fetchPageHistory();
  }
 
  fetchPageHistory() {
    this.data.fetchPageHistory(this.pageName).then(data => this.setState({historyList:data, loading:false}));
  }


  render()
  {
    let counter = 0;
    return <div className="historyFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
        <h2 className="title">History - {this.pageName}</h2>
        {this.renderList()}
    </div>;
  }

  renderLinkName(p) {
    return  'Revision ' + p.revision + " - Modified " + p.modified + " - by " + p.modifiedBy;
  }

  renderList() {
    let pages = this.state.historyList;
    if (!pages || pages.length == 0) {
      return <div>No links to this page</div>;
    }
    return (<div className="historyList">
        {pages.toReversed().map( p => <div key={p.revision}>{this.renderLinkName(p)}</div>)}

      </div>);
  }
}
