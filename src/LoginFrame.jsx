import React, {Component} from 'react';
import {instance as DS_instance} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';

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
        <div><span className="inputLabel">Username:</span><input type="text" placeholder="Username" name="Username" onChange={evt => this.onChangeField(evt, "username")} disabled= {this.state.disabled} ></input></div>
        <div><span className="inputLabel">Password:</span><input type="password" placeholder="Password" name="Password" onChange={evt => this.onChangeField(evt, "password")} disabled= {this.state.disabled} ></input></div>
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

  onChangeField(evt, field) {
    const val = evt.target.value;
    this.setState({[field]: val});
  }
}
