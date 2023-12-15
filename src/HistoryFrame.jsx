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
    this.data.fetchPageHistory(this.pageName).then(data =>
      {
        let max = Math.max(...data.map( d => d.revision));
        this.setState({historyList:data, loading:false, maxRevision:max})
      });
  }


  render()
  {
    let counter = 0;
    return <div className="historyFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
        <h2 className="title">History - {this.pageName}</h2>
        {this.renderList()}
        <div><button onClick={() => this.doDiff()} disabled={!this.state.startSelect || !this.state.endSelect} >View Diff</button></div>
    </div>;
  }

  renderLinkName(p, first) {
    if (first) {
      return  "Current - Modified " + p.modified + " - by " + p.modifiedBy;
    }
    return  'Revision ' + p.revision + " - Modified " + p.modified + " - by " + p.modifiedBy;
  }

  renderDiffSelections(revision) {
    let imgType = this.state.startSelect == revision ? "startSelect.png" : (this.state.endSelect == revision ? "endSelect.png" : "noSelect.png");
    return <span className="diffSelections"><img src={"/_resources/" + imgType} onClick={() => this.doSelect(revision)} /></span>
  }

  renderList() {
    let pages = this.state.historyList;
    if (!pages || pages.length == 0) {
      return <div>Could not find history for this page</div>;
    }
    let first = true;
    return (<div className="historyList">
        {pages.toReversed().map( p => {
          let name = this.renderLinkName(p, first);
          first = false;
          return <div key={p.revision}>{this.renderDiffSelections(p.revision)}{name}</div>;})}

      </div>);
  }

  doSelect(revision) {
    if (revision == this.state.maxRevision) {
      this.setState({endSelect: revision});
      return;
    }
    if (!this.state.startSelect) {
      this.setState({endSelect: this.state.maxRevision, startSelect: revision});
      return; 
    }
    if (revision == this.state.endSelect){ 
      this.setState({endSelect: this.state.maxRevision, startSelect: revision});
      return
    }
    if (revision >  this.state.endSelect) {
      this.setState({endSelect: revision});
      return;
    }
    if (revision <= this.state.startSelect) {
      this.setState({startSelect: revision});
      return;
    }
    this.setState({endSelect:revision});
  }

  doDiff() {
  }
}
