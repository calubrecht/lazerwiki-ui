import React, {Component} from 'react';
import {instance as DS_instance} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';

import TextField from './TextField';

export default class LoginFrame extends Component
{
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleError = this.handleError.bind(this);
    this.state = {error:'', username:'', password:'', disabled: ''};
  }

  render()
  {
    return (
      <div className="loginComponent" onKeyDown={this.handleKeyDown}>
      <div className="loginHeader">Please Log in</div>
      <div className="loginForm">
        <TextField name="Username" label="Username:" onChange={(v,f) => this.onChangeField(v,f)} disabled={this.state.disabled} varName="username" autofocus={true} value={this.state.username}/>
        <TextField name="Password" label="Password:" onChange={(v,f) => this.onChangeField(v,f)} disabled={this.state.disabled} varName="password" isPassword={true} value={this.state.password}/>
        <div className='errorText'>{this.state.error}</div>
      </div>
      </div>)
  }
  
  attemptLogin()
  {
    this.setState({error:'', disabled: 'disabled'});
    DS_instance().login(this.state.username, this.state.password)
      .then((user) => {
        this.setState({disabled: ''});
        US_instance().setUser(user); })
      .catch(this.handleError);
  }

  handleKeyDown(ev)
  {
      if (ev.key === "Enter")
      {
        ev.stopPropagation();
        ev.preventDefault();
        this.attemptLogin();
      }
  }

  handleError()
  {
    this.setState({error:'Invalid username or password', disabled: ''});
  }

  onChangeField(val, field) {
    this.setState({[field]: val});
  }
}
