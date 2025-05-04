  import {Component} from 'react';
import {instance as DS_instance} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';
import {instance as SS_instance} from './svc/SettingsService';
import DrawerLink from './DrawerLink';
import SelfRegisterFrame from './SelfRegisterFrame';
import ForgotPasswordFrame from './ForgotPasswordFrame';

import TextField from './TextField';

import './LoginFrame.css';

export default class LoginFrame extends Component
{
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleError = this.handleError.bind(this);
    this.state = {error:'', username:'', password:'', disabled: false, 'enableSelfReg': false};
  }

  componentDidMount() {
    this.checkSelfRegSetting();
  }

  render()
  {
    return (
      <div className="loginComponent" onKeyDown={this.handleKeyDown}>
      <div className="loginHeader">Please Log in</div>
      <div className="loginForm">
        <TextField name="Username" label="Username:" onChange={(v,f) => this.onChangeField(v,f)} disabled={this.state.disabled} varName="username" autofocus={true} value={this.state.username}/>
        <TextField name="Password" label="Password:" onChange={(v,f) => this.onChangeField(v,f)} disabled={this.state.disabled} varName="password" isPassword={true} value={this.state.password}/>
        {this.state.enableSelfReg ? <DrawerLink title="Register New Account" component={SelfRegisterFrame}/> : "" }
        <div className='errorText'>{this.state.error}</div><div className="forgot">
        {this.state.showForgot ? <DrawerLink title="Forgot?" component={ForgotPasswordFrame} initData={{username:this.state.username}} extraClasses="forgotPassword"/> : "" }</div>
      </div>
      </div>)
  }

  attemptLogin()
  {
    this.setState({error:'', disabled: true});
    DS_instance().login(this.state.username, this.state.password)
      .then((user) => {
        this.setState({disabled: false});
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
    this.setState({error:'Invalid username or password', disabled: false, showForgot:true});
  }

  onChangeField(val, field) {
    this.setState({[field]: val});
  }

  checkSelfRegSetting() {
    SS_instance().addListener(this);
    let settings = SS_instance().getSettings();
    this.setSettings(settings);
  }

  setSettings(settings) {
    this.setState({enableSelfReg: settings.enableSelfReg});
  }
}
