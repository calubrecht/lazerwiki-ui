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
    let searchTypeInput= props.searchTag ? "tag" : "text";
    this.state = { pageList: [], textPageList: [],  searchTerm: searchTerm, searchTermInput: "", searchTypeInput , message:"" , showSearchInput: !!searchTerm};
  }

  componentDidMount()
  {
    this.userService.addListener(this);
    this.initialFetchPageList();
  }
  
  componentWillUnmount() {
    this.userService.removeListener(this);
  }


  initialFetchPageList() {
    this.state.searchTerm && this.fetchPageList(this.state.searchTerm);
  }
  
  fetchPageList(searchTerm) {
    this.dataService.doPageSearch(searchTerm).then( (data) => this.setPageList(data));
  }

  render()
  {
    let counter = 0;
    return <div className="pageSearchFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
      <h2 className="title">Page Search - {this.state.searchTerm}</h2>
        {this.renderSearchInput()}
        <div className="pageSearchFrameContent">
          <div className="message">{this.state.message}</div>
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
    if (this.state.searchTypeInput == "tag") {
      return this.renderTagList();
    }
    return this.renderTextList();
  }
     
  renderTagList() {
    let pages = this.state.pageList;
    if (pages.length == 0) {
      return <div></div>;
    }
    return (<div className="pageSearchList">
        {pages.map( p => <div key={p.pageName}><a href={this.renderLinkURL(p)} >{this.renderLinkName(p)}</a></div>)}
      </div>);
  }

  renderTextList() {
    if (this.state.pageList.length == 0 && this.state.textPageList.length ==0) {
      return "";
    }
    return (<div className="pageSearchList">
      <h3>Title Matches</h3>
      {this.renderTitleMatches()}
      <h3>Text Matches</h3>
      {this.renderTextMatches()}
      </div>);
  }

  renderTitleMatches() {
    let pages = this.state.pageList;
    if (pages.length == 0) {
      return "No Matches";
    }
    return (<div >
        {pages.map( p => <div key={p.pageName}><a href={this.renderLinkURL(p)} >{this.renderLinkName(p)}</a></div>)}
      </div>);
  }

  renderTextMatches() {
    let pages = this.state.textPageList;
    let searchTerm = this.state.searchTerm.substring(this.state.searchTerm.indexOf(':')+1)
    if (pages.length == 0) {
      return "No Matches";
    }
    return (<div >
        {pages.map( p => <div key={p.pageName}><a href={this.renderLinkURL(p)} >{this.renderLinkName(p)}</a><br/> {this.highlightMatch(p.resultLine, searchTerm)}</div>)}
      </div>);
  }

  highlightMatch(line, searchTerm) {
    let searches = searchTerm.toLowerCase().split(" ");
    let words = line.split(/( )/g);
    return words.map(w =>
      searches.includes(w.toLowerCase()) ? <span className="match">{w}</span> : <span>{w}</span>);
  }

  renderSearchInput() {
    return this.state.showSearchInput || <div className="searchInput">
       <select name="searchType" value={this.state.searchTypeInput} onChange={evt =>this.setState({searchTypeInput:evt.target.value})}>
        <option value="text">Text Search</option>
        <option value="tag">Tag Search</option>
      </select> <input name="searchTermInput" id="searchTermInput" value={this.state.searchTermInput} onChange={evt => this.setState({searchTermInput:evt.target.value})} placeholder="Search Term" onKeyDown={(ev) => this.handleKeyDown(ev)}/> <button name="Search" onClick={() => this.doSearch()}>Search</button></div>
  }
  
  setUser(user) {
    this.setState({user: user});
    this.initialFetchPageList();
  }
  
  setPageList(data) {
    if (this.state.searchTypeInput === 'tag' || this.props.searchTag) {
      this.setState({pageList: data.tag});
      return;
    }
    let message = (data.title.length == 0 && data.text.length ==0) ? "No matches found." : "";
    this.setState({pageList: data.title, textPageList: data.text, message});
  }

  doSearch() {
    let searchTerm = this.state.searchTypeInput + ":" + this.state.searchTermInput;
    this.setState({searchTerm: searchTerm, message: "Searching", pageList:[], textPageList: []});
    this.fetchPageList(searchTerm);
  }
  

  handleKeyDown(ev)
  {
      if (ev.key === "Enter")
      {
        ev.stopPropagation();
        ev.preventDefault();
        this.doSearch();
      }
  }
}
