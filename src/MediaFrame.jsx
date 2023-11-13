import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';

import './MediaFrame.css';

export default class MediaFrame extends Component
{
  constructor(props) {
    super(props);
    this.dataService = DS_instance();
    this.userService = US_instance();
    this.state = {fileToUpload: "", mediaFiles: [], user:this.userService.getUser()};
  }

  componentDidMount()
  {
    this.userService.addListener(this);
  }

  componentWillUnmount() {
    this.userService.removeListener(this);
  }

  
  render()
  {
    return <div className="mediaFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
      <div className="title">MediaBox</div>
      {this.state.user && <form className="uploadBox">
        <div><input id="mediaFileUpload" type="file"/> <button onClick={(ev) => this.uploadFile(ev)} >Upload</button></div>
      </form>}
      <div className="mediaList"></div>
      </div>;
  }

  uploadFile(ev) {
    this.dataService.saveMedia(mediaFileUpload.files).then((e) => console.log("uploaded " + e));
    ev.preventDefault();
  }
  
  setUser(user) {
    this.setState({user: user});
  }
}
