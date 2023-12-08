import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import EditToolbar from './EditToolbar';

import './EditableTextbox.css';

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
    this.state = {text: props.text, tags: new Set(props.tags), activeTags:new Set(), newTag:'', error:"", namespace:namespace, pageName:pageName};
    this.props.registerTextCB(() => { return {text: this.state.text, tags: [...this.state.tags]};});
    this.data = DS_instance();
    this.textAreaRef = React.createRef();
  }
  
  componentDidMount()
  {
    this.data.fetchTagList().then((tags) => this.setState({activeTags:new Set(tags)}));
    this.textAreaRef.current.focus()
  }

  render()
  {
    if (!this.props.editable) {
      return <div onKeyDown={ev => this.onKeydown(ev)}><textarea ref={this.textAreaRef} autofocus={true} rows="50" cols="80" name="pageSource" className="pageSource disabled" value={this.state.text}  readOnly={true}></textarea></div>;
    }
    return <div onKeyDown={ev => this.onKeydown(ev)}><EditToolbar getCurrentText={() => this.state.text} setText={(t)=>this.setText(t)} namespace={this.state.namespace} pageName={this.state.pageName}/> <textarea ref={this.textAreaRef} autoFocus rows="40" cols="80" name="pageSource" className="pageSource" id="pageSource" value={this.state.text} onChange={ev => this.onChangeText(ev)} onKeyDown={(e) => this.handleAutoIndent(e)} ></textarea> {this.renderTagList()} {this.renderErrorMsg()}</div>
  }

  renderTagList() {
    let allTags = [...new Set([...this.state.tags,...this.state.activeTags])].sort();
    return <div className="editableTagList"><span className="tagHeader">TAGS</span>{allTags.map((t) => <span key={t}> <input type="checkbox"  name={t} checked={this.state.tags.has(t)} onChange={ev => this.onTagClick(ev)}/><label htmlFor={t} onClick={ev => this.onTagClick(ev)}>{t}</label></span>)} <span>+<input type="text" value={this.state.newTag} onChange={ev => this.newTagBox(ev)} onKeyDown={ev =>this.newTagEnter(ev)}/></span></div>;
  }

  renderErrorMsg() {
    return <div className="error">{this.state.error}</div>;
  }

  onChangeText(ev)
  {
    this.setState({text: ev.target.value, error:""});
  }
  
  setText(text)
  {
    this.setState({text: text, error:""});
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

  submit(ev)
  {
    ev.preventDefault();
    this.props.doSubmit(this.state.text);
  }
  
  cancel(ev)
  {
    ev.preventDefault();
    this.setState({text:null, error:""});
    this.props.doCancel()
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
}
