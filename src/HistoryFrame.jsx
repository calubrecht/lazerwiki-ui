import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';
import HTMLReactParser from 'html-react-parser';

import './HistoryFrame.css';

export default class HistoryFrame extends Component
{
  constructor(props) {
    super(props);
    this.pageName = this.props.initData;
    this.pageDisplayName = this.pageName == '' ? 'ROOT' : this.pageName;
    this.state = {historyList: [], loading:true, mode:'history'};
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
    if (this.state.mode == 'diff') {
      let counter = 0;
      return <div className="historyFrame">
        {this.renderClose()}
        <h2 className="title">Diff - {this.pageDisplayName} - {this.state.startSelect} -&gt; {this.state.endSelect}</h2>
        <div className= "historyList">
        {this.state.diffInfo.map(a =>
        <div className="diffLine" key={"diff" + counter++}> <div className="lineNumber">{a.first == -1 ? " " : "Line: " + a.first}</div> - <span>{HTMLReactParser(a.second)}</span></div>)} 
      </div>
        <div><button onClick={() => this.setState({mode:'history'})} >Back</button></div>
      </div>
    }
    if (this.state.mode == 'historicalView') {
      return <div className="historyFramePreview">
        {this.renderClose()}
        <h2 className="title">{this.pageDisplayName} - {this.state.displayRevision}</h2>
        <div className="historicalPage">{HTMLReactParser(this.state.historicalPageData.rendered)}</div>
        <div><button onClick={() => this.setState({mode:'history'})} >Back</button></div>
      </div>
    }
     return <div className="historyFrame">
      {this.renderClose()}

        <h2 className="title">History - {this.pageDisplayName}</h2>
        {this.renderList()}
        <div><button onClick={() => this.doDiff()} disabled={!this.state.startSelect || !this.state.endSelect} >View Diff</button></div>
    </div>;
  }

  renderClose() {
    return <button className="close button-unstyled" onClick={() => this.props.doClose()}>X</button>
  }

  renderLinkName(p, first) {
    let changeType = p.deleted ? "Deleted" : "Modified";
    if (first) {
      return  "Current - " + changeType + " " + p.modified + " - by " + p.modifiedBy;
    }
    if (p.deleted) {
    return  'Revision ' + p.revision + " - " + changeType + " " + p.modified + " - by " + p.modifiedBy;
    }
    return  <a onClick={() => this.showHistoricalPage(p.revision)}>{'Revision ' + p.revision + " - " + changeType + " " + p.modified + " - by " + p.modifiedBy}</a>;
  }

  renderDiffSelections(revision) {
    let imgType = this.state.startSelect == revision ? "startSelect.png" : (this.state.endSelect == revision ? "endSelect.png" : "noSelect.png");
    let name = this.state.startSelect == revision ? "startSelect" : (this.state.endSelect == revision ? "endSelect" : "noSelect");
    return <button className="diffSelections button-unstyled" aria-label="diffSelect" onClick={() => this.doSelect(revision)} ><img src={"/_resources/" + imgType} alt={name}  /></button>
  }

  renderList() {
    let pages = this.state.historyList;
    if (!pages || pages.length == 0) {
      if (this.state.loading) {
        return <div>Loading</div>;
      }
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

  showHistoricalPage(revision) {
    this.data.fetchHistoricalPage(this.pageName, revision).then((pageData) => this.setState({historicalPageData: pageData, displayRevision: revision, mode:'historicalView'}));
  }

  doDiff() {
    this.data.fetchPageDiff(this.pageName, this.state.startSelect, this.state.endSelect).then(
      (e) => {
        this.setState({diffInfo: e, mode:'diff'})}); 
  }
}
