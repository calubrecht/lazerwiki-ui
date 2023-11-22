import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import UserService, {instance as US_instance} from './svc/UserService';
import NsTree from './NsTree';

import './MediaFrame.css';

export default class MediaFrame extends Component
{
  constructor(props) {
    super(props);
    this.dataService = DS_instance();
    this.userService = US_instance();
    this.state = {fileToUpload: "", mediaFiles: [], user:this.userService.getUser(), serverImages:[], enabled:true, message:"", errorMessage:false, displayDeleteDlg: false, namespace:"", nsTree:{children:[]}, uploadNS: ""};
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
      (imgs) => this.setState({serverImages: imgs.media, nsTree: imgs.namespaces, enabled:true})).catch(
      e => this.setState({"message": e, "errorMessage": false, enabled:true}));
  }


  render()
  {
    let messageClass = this.state.errorMessage ? "error" : "message";
    let enableUpload = this.enableUpload();
    return <div className="mediaFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
      <h2 className="title">Media Viewer</h2>
      <div className="mediaFrameContent">
      <div className="nsTreeSelector">
          <h3>Namespace</h3>
          <NsTree nsTree={this.state.nsTree} selectNS={(ns) => this.selectNS(ns)} />
      </div>
      <div className="mediaSelector">
          <h3>Media - [{this.state.namespace}]</h3>
      {this.state.user && <form className="uploadBox">
        <div><input id="mediaFileUpload" type="file" disabled={!enableUpload}/>
        <span className="label">NS</span><input id="mediaFileUploadNS" disabled={!enableUpload} onChange={evt => this.setState({uploadNS: evt.target.value})} value={this.state.uploadNS}></input><button onClick={(ev) => this.uploadFile(ev)} disabled={!enableUpload}>Upload</button></div>
      </form>}
      <div id="message" className={messageClass}>{this.state.message}</div>
      {this.state.displayDeleteDlg && this.renderDeleteDialog() }
      {this.renderList()}
      </div>
      </div>
    </div>;
  }

  renderList() {
      if (!  this.state.serverImages[this.state.namespace]) {
        return <div className="mediaList"> <div className="imageFrame">Image Preview</div></div>;
      }
      let counter = 0;
      let nsPrefix = this.state.namespace ? this.state.namespace + ":" : '';
      return <div className="mediaList">
        <div className="imageFrame">Image Preview</div>
        {
          this.state.serverImages[this.state.namespace].map( img => {
            counter++;
            return <div className="mediaListItem" key={"media" + counter}>
              <div>{img.fileName} - {this.renderFileSize(img.fileSize)} - {img.width}x{img.height} - uploaded by {img.uploadedBy}  {this.state.user && <span className="delete" onClick={() => this.doDelete(this.state.namespace, img)}>Delete</span>}</div>
              <img className="hoverImg" src={"/_media/" + nsPrefix + img.fileName} loading="lazy"/>
            </div>;
          })
        }
      </div>
  }

  renderFileSize(size) {
    if (size < 1024) {
      return size + " bytes";
    }
    const kb = size/1024.0;
    if (kb < 1024) {
      return kb.toFixed(2) + " kb";
    }
    return (kb/1024.0).toFixed(2) + " mb";
  }

  enableUpload() {
    if (!this.state.enabled) {
      return false;
    }
    const node = this.findNode(this.state.nsTree, this.state.namespace);
    return node && node.writable;
  }

  findNode(tree, namespace) {
    if (tree.namespace == namespace) {
      return tree;
    }
    for (let subtree of tree.children) {
      let node = this.findNode(subtree, namespace);
      if (node) {
        return node;
      }
    }
    return null;
  }

  handleError(e) {
    if (e.message) {
      this.setState({"message": e.message, "errorMessage": true, enabled:true})
    }
    else {
      e.promise.then(msg => this.setState({"message": msg, "errorMessage": true, enabled:true})  )
    }
  }

  uploadFile(ev) {
    ev.preventDefault();
    this.setState({"message": "Uploading", "errorMessage":false, "enabled": false});
    this.dataService.saveMedia(mediaFileUpload.files, mediaFileUploadNS.value).then(
      (e) => { this.setState({"message": "Upload Complete", "errorMessage": false, enabled:true}); this.fetchImageList();}).catch(
      e => this.handleError(e));
  }

  doDelete(namespace, img) {
    const fileName = namespace ? namespace + ":" + img.fileName : img.fileName;
    const displayName = img.fileName;
    this.setState({displayDeleteDlg: true, deleteImage:{fileName, displayName}});
  }

  renderDeleteDialog() {
    return (<dialog className="deleteDialog" open>
    <div>Are you sure you want to delete {this.state.deleteImage.displayName}?</div>
    <div>The file will be removed from the server</div>
    <div><button onClick={  ()=> this.requestDelete(this.state.deleteImage.fileName).then(() => this.closeDeleteDialog("File Deleted")).
  catch(e => {this.handleError(e); this.closeDeleteDialog()})}>Delete</button><button onClick={() => this.closeDeleteDialog()}>Cancel</button></div>
    </dialog>);
  }

 closeDeleteDialog(msg) {
   if (msg) {
        this.setState({displayDeleteDlg: false, message: msg, errorMessage:false});
        this.fetchImageList();
        return;
   }
   this.setState({displayDeleteDlg: false});
 }

 requestDelete(fileName) {
   return this.dataService.deleteFile(fileName);
 }


  setUser(user) {
    this.setState({user: user});
    this.fetchImageList();
  }
  
  selectNS(ns) {
    this.setState({namespace: ns, uploadNS: ns});
  }
}
