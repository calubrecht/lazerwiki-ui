import React, {Component} from 'react';

import './EditableTextbox.css';

export default class EditableTextbox extends Component
{
  constructor(props) {
    super(props);
    this.state = {text: props.text};
    this.props.registerTextCB(() => this.state.text);
  }

  render()
  {
    if (!this.props.editable) {
      return <div><textarea rows="25" cols="80" name="message" className="message" value={this.state.text}  disabled></textarea></div>;
    }
    return <div><textarea rows="25" cols="80" name="message" className="message" value={this.state.text} onChange={ev => this.onChangeText(ev) } ></textarea></div>
  }

  onChangeText(ev)
  {
    this.setState({text: ev.target.value});
  }

  submit(ev)
  {
    ev.preventDefault();
    this.props.doSubmit(this.state.text);
  }
  
  cancel(ev)
  {
    ev.preventDefault();
    this.setState({text:null});
    this.props.doCancel()
  }
}
