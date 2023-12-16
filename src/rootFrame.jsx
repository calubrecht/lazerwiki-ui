import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import PageSearchFrame from './PageSearchFrame';
import PreviewFrame from './PreviewFrame';
import EditableTextbox from './EditableTextbox';
import {instance as US_instance} from './svc/UserService';
import HTMLReactParser from 'html-react-parser';
import DrawerLink from './DrawerLink';
import BacklinksFrame from './BacklinksFrame'
import HistoryFrame from './HistoryFrame'

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
    this.state = {pageData: {rendered: 'Loading', flags:{exists:false}, tags:[], backlinks:[]}, stage:'viewing', user: this.userService.getUser(), loaded:false, searchTag: null, displayDeleteDlg:false, message:'', errorMessage:'', displayPreview:false, siteTitle: "", pageTitle: this.pageName};
    this.data = DS_instance();
    this.modalDlgRef = React.createRef();
  }

  componentDidMount()
  {
    this.userService.addListener(this);
    this.data.getUIVersion().then(meta => console.log(`UI-version - ${meta.version}`));
    this.data.getVersion().then(res => console.log(`Server-version - ${res}`));
    if (this.state.user) {
      this.fetchPageData();
    }
    this.data.getSiteName().then(res => {
      this.setState({siteTitle:res});
      document.title = res + " - " + this.state.pageTitle;});
  }

  componentWillUnmount() {
    this.userService.removeListener(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    if (!this.state.showImgDlg) {
      this.updateLinkImages();
    }
  }

  setPageData(pageData) {
    let stage = (window.location.hash=="#Edit" && pageData.flags.userCanWrite) ? "editing" : "viewing";
    this.setState({pageData: pageData, loaded:true, stage});
    if (pageData.title) {
      this.setState({pageTitle:pageData.title});
      this.data.getSiteName().then(res => document.title = this.state.siteTitle + " - " + pageData.title);
    }
  }

  setUser(user) {
    this.setState({user: user});
    this.fetchPageData();
  }

  loggedIn() {
    return this.state.user != null;
  }

  fetchPageData() {
    this.setState({pageData: {rendered: 'Loading', flags:{exists:false}, tags:[]}, stage:'viewing', loaded:false});
    this.data.fetchPage(this.pageName).then((pageData) => this.setPageData(pageData)).catch(e => this.handleError(e));
  }

  render()
  {
    let user = this.state.user ? this.state.user.userName : "GUEST";
    let createAction = this.state.pageData.flags.exists ? "Edit Page" : "Create Page";
    if (this.state.stage === 'viewing') {
      return <div className="RootFrame">
        {this.state.displayDeleteDlg && this.renderDeleteDialog() }
        {this.renderImgDialog() }
        { this.renderMenu(createAction) }
        <div className="RootBody"> {HTMLReactParser(this.state.pageData.rendered)}  
        { this.renderTags() }
        </div>
        { this.renderTagSearch() }
        </div>;
    }
      return <div className="RootFrame">      
      <div className="RootMenu">{this.state.stage === 'editing' && <div className="rootMenuButton" onClick={ev => this.savePage(ev)}>Save Page</div>}<div className="rootMenuButton" onClick={ev => this.cancelEdit(ev)}>Cancel</div>{this.state.stage === 'editing' && <DrawerLink title="Show Preview" initData={{initFnc:()=> this.data.previewPage(this.pageName, this.getText()), pageName: this.pageName}} component={PreviewFrame} extraClasses="rootMenuButton shiftRight"/>}</div>
      <div className="RootBody"><EditableTextbox text={this.state.pageData.source} tags={this.state.pageData.tags} registerTextCB={data => this.setGetEditCB(data)} editable={this.state.stage === 'editing'} savePage={(ev)=>this.savePage(ev)} cancelEdit={ev => this.cancelEdit(ev)} pageName={this.pageName}/> </div>
      </div>;

  }

  renderMenu(createAction) {
        if ( !this.state.loaded) {
          return <div className="RootMenu"></div>;
        }
        if (! this.loggedIn() || !this.state.pageData.flags.userCanWrite ){
          return <div className="RootMenu"><div className="rootMenuButton" onClick={() => this.viewSource()}>View Source</div><DrawerLink title="Backlinks" component={BacklinksFrame} initData={this.state.pageData.backlinks} extraClasses="rootMenuButton"/><DrawerLink title="History" component={HistoryFrame} initData={this.pageName} extraClasses="rootMenuButton"/></div>;
        }
        return <div className="RootMenu"><div className="rootMenuButton" onClick={() => this.editPage()}>{createAction}</div>   {this.state.pageData.flags.exists && this.state.pageData.flags.userCanDelete &&  <div className="rootMenuButton"onClick={() => this.doDelete()}>Delete Page</div>}<DrawerLink title="Backlinks" component={BacklinksFrame} initData={this.state.pageData.backlinks} extraClasses="rootMenuButton"/><DrawerLink title="History" component={HistoryFrame} initData={this.pageName} extraClasses="rootMenuButton"/></div>;
  }

  renderTags() {
    return <div className="tagList"> {
      this.state.pageData.tags.map((t) => <span key={t} onClick={ev => this.toggleSearchTag(t)}>{t}</span> )
    }
      </div>
  }

  renderTagSearch() {
    return this.state.searchTag && <PageSearchFrame searchTag={this.state.searchTag} doClose={() => this.setState({searchTag:null})}/>
  }

  toggleSearchTag(t) {
    this.setState({searchTag: (this.state.searchTag ? null : t)});
  }

  handleError(error) {
    console.log(error);
  }

  editPage() {
    this.setState({"stage": "editing"});
  }
  
  viewSource() {
    this.setState({"stage": "viewingSource"});
  }

  clearHash() {
    history.replaceState("", "", `${location.pathname}${location.search}`);
  }

  cancelEdit(ev) {
    ev && ev.preventDefault();
    this.clearHash();
    this.setState({"stage": "viewing", displayPreview: false});
  }
  
  cancelPreview(ev) {
    ev && ev.preventDefault();
    this.setState({displayPreview: false});
  }
  
  savePage(ev) {
    ev.preventDefault();
    this.clearHash();
    this.data.savePage(this.pageName, this.getText()).then((pageData) => {
      this.setPageData(pageData);
      this.cancelEdit(); }).catch(e => this.handleError(e));
  }

  showPreview() {
    this.data.previewPage(this.pageName, this.getText()).then((pageData) => {
      this.setState({displayPreview: true, previewData: pageData})});
  }

 
  setGetEditCB(cb) {
    this.getText = cb;
  }
  
  renderDeleteDialog() {
    return (<dialog className="deletePageDialog" open>
    <div>Are you sure you want to delete this page?</div>
    <div><button onClick={  ()=> this.requestDelete().then(() => this.closeDeleteDialog("Page Deleted")).
  catch(e => {this.handleError(e); this.closeDeleteDialog()})}>Delete</button><button onClick={() => this.closeDeleteDialog()}>Cancel</button></div>
    </dialog>);
  }
  
  renderImgDialog() {
    let filename = this.state.showImgDlg ? this.state.showImgDlg.substring(this.state.showImgDlg.lastIndexOf("/")+1) :"";
    return (<dialog className="showImageDialog" ref = {this.modalDlgRef}>
    <div className="imgTitle">{filename}</div>
    <div><img src={this.state.showImgDlg} ></img></div>
    <div><button onClick={() => this.closeShowImgDialog()}>Close</button></div>
    </dialog>);
  }
  
  doDelete() {
    this.setState({displayDeleteDlg: true});
  }

  closeDeleteDialog(msg) {
   if (msg) {
        this.setState({displayDeleteDlg: false, message: msg, errorMessage:false});
        this.fetchPageData();
        return;
   }
   this.setState({displayDeleteDlg: false});
 }

 closeShowImgDialog() {
   this.setState({showImgDlg: null});
   this.modalDlgRef.current?.close();
 }

 openShowImgDialog(src) {
   this.setState({showImgDlg: src});
   this.modalDlgRef.current?.showModal();
 }

 requestDelete() {
   return this.data.deletePage(this.pageName);
 }

 updateLinkImages() {
   let body = document.getElementsByClassName("RootBody")[0];
   let fullLinkImages = document.getElementsByClassName("fullLink");
   for (let img of fullLinkImages) {
     let src = img.src.split("?")[0];
     img.onclick = () => {
       this.openShowImgDialog(src);
     };
   }
 }

}
