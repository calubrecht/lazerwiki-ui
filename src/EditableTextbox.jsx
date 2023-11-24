import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';

import './EditableTextbox.css';

export default class EditableTextbox extends Component
{
  constructor(props) {
    super(props);
    this.state = {text: props.text, tags: new Set(props.tags), activeTags:new Set(), newTag:'', error:""};
    this.props.registerTextCB(() => { return {text: this.state.text, tags: [...this.state.tags]};});
    this.data = DS_instance();
  }
  
  componentDidMount()
  {
    this.data.fetchTagList().then((tags) => this.setState({activeTags:new Set(tags)}));
  }

  render()
  {
    if (!this.props.editable) {
      return <div><textarea rows="25" cols="80" name="pageSource" className="pageSource" value={this.state.text}  disabled></textarea></div>;
    }
    return <div><textarea rows="25" cols="80" name="pageSource" className="pageSource" value={this.state.text} onChange={ev => this.onChangeText(ev) } ></textarea> {this.renderTagList()} {this.renderErrorMsg()}</div>
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
}
