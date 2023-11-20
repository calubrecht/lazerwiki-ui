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
    this.state = {fileToUpload: "", mediaFiles: [], user:this.userService.getUser(), serverImages:[], enabled:true, message:"", errorMessage:true};
  }

  componentDidMount()
  {
    this.userService.addListener(this);
    this.fetchImageList();
  }

  componentWillUnmount() {
    this.userService.removeListener(this);
  }

  fetchImageList() {
    this.dataService.fetchImageList().then(
      (imgs) => this.setState({serverImages: imgs.map(img => img.fileName), enabled:true})).catch(
      e => this.setState({"message": e, "errorMessage": true, enabled:true}));
  }


  render()
  {
    let counter = 0;
    let messageClass = this.state.errorMessage ? "error" : message;
    return <div className="mediaFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
      <h2 className="title">Media Viewer</h2>
      {this.state.user && <form className="uploadBox">
        <div><input id="mediaFileUpload" type="file" disabled={!this.state.enabled}/> <button onClick={(ev) => this.uploadFile(ev)} disabled={!this.state.enabled}>Upload</button></div>
      </form>}
      <div id="message" className={messageClass}>{this.state.message}</div>
      <div className="mediaList">
        <div className="imageFrame">Image Preview</div>
        {
          this.state.serverImages.map( img => {
            counter++;
            return <div className="mediaListItem" key={"media" + counter}>
              <div>{img}</div>
              <img className="hoverImg" src={"/_media/" + img} loading="lazy"/>
            </div>;
          })
        }
      </div>
    </div>;
  }

  uploadFile(ev) {
    ev.preventDefault();
    this.setState({"message": "Uploading", "errorMessage":false, "enabled": false});
    this.dataService.saveMedia(mediaFileUpload.files).then(
      (e) => { this.setState({"message": "Upload Complete", "errorMessage": true, enabled:true}); this.fetchImageList();}).catch(
      e => {
        if (e.message) {
          this.setState({"message": e.message, "errorMessage": true, enabled:true})
        }
        else {
          e.promise.then(msg => this.setState({"message": msg, "errorMessage": true, enabled:true})  )
        }
        });
  }

  setUser(user) {
    this.setState({user: user});
  }
}
