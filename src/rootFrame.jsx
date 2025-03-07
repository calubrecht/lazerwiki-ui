import React, {Component} from 'react';
import {instance as DS_instance} from './svc/DataService';
import {instance as RES_instance} from './svc/RenderEnhancerService';
import {instance as SS_instance} from './svc/SettingsService';
import PageSearchFrame from './PageSearchFrame';
import PreviewFrame from './PreviewFrame';
import EditableTextbox from './EditableTextbox';
import {instance as US_instance} from './svc/UserService';
import HTMLReactParser from 'html-react-parser';
import DrawerLink from './DrawerLink';
import BacklinksFrame from './BacklinksFrame'
import HistoryFrame from './HistoryFrame'
import MovePageFrame from './MovePageFrame'

export default class RootFrame extends Component
{
  constructor(props) {
    super(props);
    this.userService = US_instance();
    let url =  window.location.pathname;
    if (url != '/' && !url.startsWith("/page/")) {
      window.location.pathname = '/';
      this.pageName = '';
    }
    else 
    {
      let p = url.split('/');
      if (p.length > 3) {
        window.location.pathname = '/';
      }
      else {
        this.pageName = p.length > 2 ? p[2] : "";
      }
    }
    this.state = {pageData: {rendered: 'Loading', flags:{exists:false}, tags:[], backlinks:[]}, stage:'viewing', user: this.userService.getUser(), loaded:false, searchTag: null, message:'', errorMessage:'', siteTitle: "", pageTitle: this.pageName};
    this.data = DS_instance();
    this.imgDlgRef = React.createRef();
    this.delDlgRef = React.createRef();
    this.rootRef = React.createRef();
    this.confirmOverwriteRef = React.createRef();
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
    RES_instance().enhanceRenderedCode(this.rootRef.current);
    DS_instance().getGlobalSettings().then(settings => {
      SS_instance().setSettings(settings.settings);});
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
      document.title = this.state.siteTitle + " - " + pageData.title;
    }
    else {
      document.title = this.state.siteTitle;
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
    let className= "RootBody" + (this.state.pageData.id  ? (" p" + this.state.pageData.id) : "");
    if (this.state.stage === 'viewing') {
      return <div className="RootFrame" ref={this.rootRef}>
        {this.renderDeleteDialog() }
        {this.renderImgDialog() }
        { this.renderMenu(createAction) }
        <div className={className} role="group" aria-label={className}> {HTMLReactParser(this.state.pageData.rendered)}
        { this.renderTags() }
        </div>
        { this.renderTagSearch() }
        </div>;
    }
      return <div className="RootFrame" ref={this.rootRef}>
      {this.renderConfirmRevOverrideDialog()}
      <div className="RootMenu">{this.state.stage === 'editing' && <button className="rootMenuButton button-unstyled" onClick={ev => this.savePage(ev)}>Save Page</button>}<button className="rootMenuButton button-unstyled" onClick={ev => this.cancelEdit(ev)}>Cancel</button>{this.state.stage === 'editing' && <DrawerLink title="Show Preview" initData={{initFnc:()=> this.data.previewPage(this.pageName, this.getText()), pageName: this.pageName}} component={PreviewFrame} extraClasses="rootMenuButton"/>}</div>
      <div className="RootBody"><EditableTextbox text={this.state.pageData.source} tags={this.state.pageData.tags} registerTextCB={data => this.setGetEditCB(data)} setCleanupCB={data => this.setCleanupCB(data)} setCancelCB={data => this.setCancelCB(data)} editable={this.state.stage === 'editing'} savePage={(ev)=>this.savePage(ev)} cancelEdit={ev => this.cancelEdit(ev)} pageName={this.pageName} revision={this.state.pageData.revision}/> </div>
      </div>;

  }

  renderMenu(createAction) {
        if ( !this.state.loaded) {
          return <div className="RootMenu"></div>;
        }
        if (! this.loggedIn() || !this.state.pageData.flags.userCanWrite ){
          return <div className="RootMenu"><button className="rootMenuButton button-unstyled" onClick={() => this.viewSource()}>View Source</button><DrawerLink title="Backlinks" component={BacklinksFrame} initData={this.state.pageData.backlinks} extraClasses="rootMenuButton"/><DrawerLink title="History" component={HistoryFrame} initData={this.pageName} extraClasses="rootMenuButton"/></div>;
        }
        return <div className="RootMenu">
          <button className="rootMenuButton button-unstyled" onClick={() => this.editPage()}>{createAction}</button>
      {this.pageName !== '' && <DrawerLink title="MovePage" component={MovePageFrame} initData={this.pageName} extraClasses="rootMenuButton"/>}
          {this.state.pageData.flags.exists && this.state.pageData.flags.userCanDelete &&
              <button className="rootMenuButton button-unstyled" onClick={() => this.doDelete()}>Delete
                Page</button>}<DrawerLink title="Backlinks" component={BacklinksFrame}
                                          initData={this.state.pageData.backlinks}
                                          extraClasses="rootMenuButton"/><DrawerLink title="History"
                                                                                     component={HistoryFrame}
                                                                                     initData={this.pageName}
                                                                                     extraClasses="rootMenuButton"/>
        </div>;
  }

  renderTags() {
    return <div className="tagList"> {
      this.state.pageData.tags.map((t) => <button key={t} className="button-unstyled tagButton" onClick={ev => this.toggleSearchTag(t)}>{t}</button> )
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
    this?.cancelCB();
    this.setState({"stage": "viewing"});
  }
  
  savePage(ev) {
    ev.preventDefault();
    this.clearHash();
    let pageName = this.pageName;
    let text = this.getText();
    this.doSavePage(pageName, text);
  }

  overwriteRevision(){ 
    let pageName = this.pageName;
    let text = this.getText();
    text.force = true;
    this.doSavePage(pageName, text);
  }

  doSavePage(pageName, data) {
    this.data.savePage(pageName, data).then((pageData) => {
      if (!pageData.success ){
        this.setState({savedPageData: {pageName, data}});
        this.confirmOverwriteRef.current?.showModal?.();
        return;
      }
      this.setPageData(pageData);
      this?.cleanupTextbox();
      this.confirmOverwriteRef.current?.close?.();
      this.cancelEdit(); }).catch(e => this.handleError(e));
  }

  setCleanupCB(cb) {
    this.cleanupTextbox = cb;
  }

  setCancelCB(cb) {
    this.cancelCB = cb;
  }
 
  setGetEditCB(cb) {
    this.getText = cb;
  }
  
  renderDeleteDialog() {
    return (<dialog className="deletePageDialog" ref={this.delDlgRef} >
    <div>Are you sure you want to delete this page?</div>
    <div className="deleteDialogButtons">
      <button className="cancel" onClick={() => this.closeDeleteDialog()} autoFocus >Cancel</button>
      <button className="delete" onClick={  ()=> this.requestDelete().then(() => this.closeDeleteDialog("Page Deleted")).
  catch(e => {this.handleError(e); this.closeDeleteDialog()})}>Delete</button>
      </div>
    </dialog>);
  }
  
  renderImgDialog() {
    let filename = this.state.showImgDlg ? this.state.showImgDlg.substring(this.state.showImgDlg.lastIndexOf("/")+1) : "";
    return (<dialog className="showImageDialog" ref={this.imgDlgRef}>
    <div className="imgTitle">{filename}</div>
    <div><img src={this.state.showImgDlg} ></img></div>
    <div><button onClick={() => this.closeShowImgDialog()}>Close</button></div>
    </dialog>);
  }

  renderConfirmRevOverrideDialog()  {
    return (<dialog className="confirmRevOverrideDialog" ref={this.confirmOverwriteRef} >
      <div>A newer revision of this page has been saved since you started editing. Are you sure you want to save and overwrite this page?</div>
      <div className="confirmRevOverrideDialogButtons">
        <button className="cancel" onClick={() => this.closeConfirmOverwriteDialog(true)} autoFocus >Cancel Edit</button>
        <button className="return" onClick={() => this.closeConfirmOverwriteDialog(false)} autoFocus >Return to Edit</button>
        <button className="overwrite" onClick={  ()=> this.overwriteRevision()}>Overwrite Page</button>
        </div>
      </dialog>);
  }
  
  doDelete() {
    this.delDlgRef.current?.showModal?.();
  }

  closeDeleteDialog(msg) {
   if (msg) {
        this.setState({message: msg, errorMessage:false});
        this.delDlgRef.current?.close?.();
        this.fetchPageData();
        return;
   }
   this.delDlgRef.current?.close?.();
 }

 closeShowImgDialog() {
   this.setState({showImgDlg: null});
   this.imgDlgRef.current?.close?.();
 }

 closeConfirmOverwriteDialog(stopEdit) {
  this.confirmOverwriteRef.current?.close?.();
  this.setState({savedPageData: null, stage: stopEdit ? "viewing" : "editing"})
  if (stopEdit) {
    this?.cleanupTextbox();
  }
 }

 openShowImgDialog(src) {
   this.setState({showImgDlg: src});
   this.imgDlgRef.current?.showModal?.();
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
