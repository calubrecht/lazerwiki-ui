import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import {instance as DB_instance} from './svc/DbService';
import EditToolbar from './EditToolbar';
import ConfirmDialog from './ConfirmDialog';

import './EditableTextbox.css';

const MAX_DRAFT_AGE= 60*60; // 1 hour

export default class EditableTextbox extends Component
{
  constructor(props) {
    super(props);
    let namespace = '';
    let pageName = this.props.pageName;
    if (pageName.indexOf(':') != -1 ) {
        namespace = this.props.pageName.slice(0, this.props.pageName.lastIndexOf(':'));
        pageName = this.props.pageName.slice(this.props.pageName.lastIndexOf(':')+1);
    }
    this.state = {text: props.text, tags: new Set(props.tags), activeTags:new Set(), newTag:'', error:"", namespace:namespace, pageName:pageName, dbChecked:false,
      revisionChecked:false, lockWarnMsg: '', revision: props.revision, force:false
    };
    this.props.registerTextCB(() => { return {text: this.state.text, tags: [...this.state.tags], revision: this.state.revision, force: this.state.force}});
    this.props.setCleanupCB(() => this.doCleanup());
    this.props.setCancelCB(() => this.doCancel());
    this.data = DS_instance();
    this.textAreaRef = React.createRef();
    this.closeDraftConfirmDlg = this.closeDraftConfirmDlg.bind(this);
    this.restoreDraft = this.restoreDraft.bind(this);
  }
  
  componentDidMount()
  {
    if (this.props.editable) {
      this.getPageLock((lockResponse) => this.checkDraftPage(lockResponse, (lockResponse) => this.checkPageRevision(lockResponse)), this.props.cancelEdit);
    }
    else {
      this.setState({ dbChecked: true });
    }

    this.data.fetchTagList().then((tags) => this.setState({activeTags:new Set(tags)}));
    this.textAreaRef.current.focus()
  }

  componentWillUnmount() {
    if (this.state.warningTimeoutHandle) {
      clearTimeout(this.state.warningTimeoutHandle);
    }
    if (this.state.lockTimeoutHandle) {
      clearTimeout(this.state.lockTimeoutHandle);
    }
  }

  getPageLock(successAction, cancelAction) {
    DS_instance().getPageLock(this.props.pageName).then(lockResponse => {
      if (lockResponse.success) {
        this.setLock(lockResponse);
        this.startLockTimer(lockResponse);
        successAction(lockResponse);
      }
      else {
        this.setState({askUser: true, userQuestion: "This page was locked on " + lockResponse.lockTime + " by " + lockResponse.owner + ". Editing this page could risk overwriting their changes",
          action: () => {
            DS_instance().overrideLock(this.props.pageName).then(overrideResponse => {
              this.setLock(overrideResponse);
              this.startLockTimer(lockResponse);
              successAction(lockResponse);
            });
          },
          cancelAction: cancelAction, btnNames: ["Override Lock", "Cancel Edit"], });
      }
    });
  }

  checkDraftPage(lockResponse, successAction) {
    // Add revision to draft cache.... extra warning if draft was based on outdated revision
    DB_instance().getValue(this.props.pageName).then(draftDoc => {
      if (draftDoc) {
        let draftAge = (new Date() - draftDoc.ts) / 1000;
        if (draftAge > MAX_DRAFT_AGE) {
          DB_instance().delValue(this.props.pageName);
          console.log("page cached at " + draftDoc.ts + " is older than max age, discarding");
          this.setState({ dbChecked: true });
          successAction(lockResponse);
          return;
        }
        console.log("page cached at " + draftDoc.ts);
        let user = draftDoc.user;
        this.setState({
          askUser: true,
          dbChecked: true, userQuestion: "This page was edited by " + user + " at " + draftDoc.ts.toLocaleString() + " and left in a draft state. Do you want to restore the draft or edit state as saved?",
          draftText: draftDoc.text,
          btnNames: ["Use Draft", "Discard Draft"],
          action: this.restoreDraft,
          cancelAction: () => this.closeDraftConfirmDlg(successAction, lockResponse)
        });
      }
      else {
        this.setState({askUser:false, dbChecked: true });
        successAction(lockResponse);
      }

    });
  }

  checkPageRevision(lockResponse) {
    if (lockResponse.revision == this.props.revision) {
      this.setState({ revisionChecked: true });
    }
    else {
      DS_instance().fetchPage(this.props.pageName).then(pageData => {
        console.log("loaded page out of date, reloaded revision " + pageData.revision);
        this.setState({ revisionChecked: true, text:pageData.source, tags:new Set(pageData.tags), revision:pageData.revision });
      });
    }

  }

  render()
  {
    if (this.state.askUser) {
      return <div><div ><textarea ref={this.textAreaRef} autoFocus={true} rows="50" cols="80" name="pageSource" className="pageSource disabled" value={this.state.text}  readOnly={true}></textarea></div>
      <ConfirmDialog onConfirm={this.state.action} onCancel={this.state.cancelAction} displayText={this.state.userQuestion} className="confirmDraftDlg" btnNames={this.state.btnNames}></ConfirmDialog>
      </div>;      
    }
    if (!this.props.editable || ! this.state.dbChecked || !this.state.revisionChecked) {
      return <div onKeyDown={ev => this.onKeydown(ev)}><textarea ref={this.textAreaRef} autoFocus={true} rows="50" cols="80" name="pageSource" className="pageSource disabled" value={this.state.text}  readOnly={true}></textarea></div>;
    }
    return <div onKeyDown={ev => this.onKeydown(ev)}>{this.renderLockWarn()}<EditToolbar getCurrentText={() => this.state.text} setText={(t)=>this.setText(t)} namespace={this.state.namespace} pageName={this.state.pageName}/> <textarea ref={this.textAreaRef} autoFocus rows="40" cols="80" name="pageSource" className="pageSource" id="pageSource" value={this.state.text} onChange={ev => this.onChangeText(ev)} onKeyDown={(e) => this.handleAutoIndent(e)} ></textarea> {this.renderTagList()} {this.renderErrorMsg()}</div>
  }

  renderLockWarn() {
    return this.state.lockWarnMsg && <div className="lockWarn">{this.state.lockWarnMsg}</div>;
  }

  renderTagList() {
    let allTags = [...new Set([...this.state.tags,...this.state.activeTags])].sort();
    return <div className="editableTagList">
      <span className="tagHeader">TAGS</span>{allTags.map((t) => <span key={t}><span className="tag"> <input type="checkbox"  name={t} checked={this.state.tags.has(t)}
      onChange={ev => this.onTagClick(ev)}/><label htmlFor={t} onClick={ev => this.onTagClick(ev)}>{t}</label></span> </span>)}
      <span><span className="newTagEntry" title="Add New Tag">+<input type="text" name="tagEntry" value={this.state.newTag}
        onChange={ev => this.newTagBox(ev)}
        onKeyDown={ev =>this.newTagEnter(ev)}/></span> </span></div>;
  }

  renderErrorMsg() {
    return <div className="error">{this.state.error}</div>;
  }

  onChangeText(ev)
  {
    this.setText(ev.target.value);
  }
  
  setText(text)
  {
    this.setState({text: text, error:""});
    if (text === this.props.text) {
      DB_instance().delValue(this.props.pageName);
      return;      
    }
    DB_instance().addValue(this.props.pageName, text);
  }

  setLock(lockResponse) {
    this.setState({lockId: lockResponse.pageLockId});
  }

  doCleanup() {
    DB_instance().delValue(this.props.pageName);
  }

  doCancel() {
    if (this.state.lockId) {
      DS_instance().clearLock(this.props.pageName, this.state.lockId);
    }
  }

  onKeydown(ev) {
    if (ev.ctrlKey && ev.key === 's') {
      ev.preventDefault();
      this.props.savePage(ev);
      return;
    }
    if (ev.ctrlKey && ev.altKey && ev.key === 'c' || ev.key === "Escape") {
      ev.preventDefault();
      this.props.cancelEdit(ev);
      return;
    }
  }

  newTagBox(ev) {
    this.setState({newTag: ev.target.value, error:""});
  }
  
  newTagEnter(ev) {
    if (ev.key === "Enter")
    {
      if (!this.validateTag(ev.currentTarget.value)){
        this.setState({error: "invalid tag value"});
        return;
      }
      ev.stopPropagation();
      ev.preventDefault();
      let currActiveTags = new Set(this.state.activeTags);
      currActiveTags.add(ev.currentTarget.value);
      let currTags = new Set(this.state.tags);
      currTags.add(ev.currentTarget.value);
      this.setState({activeTags: currActiveTags, tags: currTags, newTag:'', error:""});
    }
  }

  validateTag(tag) {
    return /^[A-Za-z0-9_\-]*$/.test(tag);
  }

  onTagClick(ev) {
    let currTags = new Set(this.state.tags);
    let tagName = ev.target.name ? ev.target.name : ev.target.htmlFor;
    let newTagValue = !currTags.has(tagName);
    if (newTagValue) {
      currTags.add(tagName);
      this.setState( {tags: currTags, error:""});
      return;
    }
    currTags.delete(tagName);
    this.setState( {tags: currTags, error:""});
  }

  handleAutoIndent(ev) {
    if (ev.code == 'Enter') {
      ev.preventDefault();
      let el = ev.target;
      let val = el.value;
      let start = el.selectionStart;
      let currentLine = val.slice(0, start).split('\n').pop();
      let newlineIndent = '\n' + currentLine.match(/^\s*/)[0];
      let newVal = val.slice(0, start) + newlineIndent + val.slice(start);
      el.value = newVal;
      el.selectionStart = start + newlineIndent.length;
      el.selectionEnd = start + newlineIndent.length;
      el.blur();
      el.focus();
      this.setState({text: newVal, error:""});
    }
  }

  closeDraftConfirmDlg(successAction, argument) {
    this.setState({askUser:false})
    successAction(argument);
  }

  restoreDraft() {
    this.setState({askUser:false, text:this.state.draftText, draftText: "", revisionChecked: true });
  }

  startLockTimer(lockResponse) {
     let lockTimeout = Date.parse(lockResponse.lockTime);
     let lockTimeRemaining = lockTimeout - new Date();
     let timeTillWarning = lockTimeRemaining - 120*1000;
     let warningTimeoutHandle = setTimeout(() => this.showLockTimeoutWarning(), timeTillWarning);
     let lockTimeoutHandle =setTimeout(() => this.showLockTimeout(), lockTimeRemaining);
     this.setState({warningTimeoutHandle, lockTimeoutHandle});
  }

  showLockTimeoutWarning() {
    console.log("Lock timeout warning");
    this.setState({warningTimeoutHandle: undefined, lockWarnMsg: "The page lock will expire soon. You should save your work soon"});
  }

  showLockTimeout() {
    console.log("Lock timeout");
    this.setState({lockTimeoutHandle: undefined, lockWarnMsg: "The page lock has expired. Saving now may overwrite an update"});
  }
}
