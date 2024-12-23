import {Component} from 'react';
import {instance as DS_instance} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';
import NsTree from './NsTree';
import TextField from './TextField';

import './MediaFrame.css';
import {PropTypes} from "prop-types";

export default class MediaFrame extends Component
{
  constructor(props) {
    super(props);
    this.dataService = DS_instance();
    this.userService = US_instance();
    let initialNS = this.props.namespace ? this.props.namespace : "";
    this.state = {fileToUpload: "", mediaFiles: [], user:this.userService.getUser(), serverImages:[], enabled:true, message:"", errorMessage:false, displayDeleteDlg: false, namespace: initialNS, nsTree:{children:[]}, uploadNS: initialNS, filter: ''};
  }

  static propTypes = {namespace: PropTypes.string, doClose: PropTypes.func, selectItem:PropTypes.func};

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
      e => this.setState({message: e.message, errorMessage: true, enabled:true}));
  }


  render()
  {
    let messageClass = this.state.errorMessage ? "error" : "message";
    let enableUpload = this.enableUpload();
    return <div className="mediaFrame">
      <button onClick={() => this.props.doClose()} className="close button-unstyled">X</button>
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
        <label htmlFor="mediaFileUploadNS" className="label">NS</label><input id="mediaFileUploadNS" disabled={!enableUpload} onChange={evt => this.setState({uploadNS: evt.target.value})} value={this.state.uploadNS}></input><button onClick={(ev) => this.uploadFile(ev)} disabled={!enableUpload}>Upload</button></div>
      </form>}
      <TextField name="Filter" label="Filter:" onChange={(v,) => this.setState({filter: v})} disabled={false} varName="filter" autofocus={true} value={this.state.filter}/>
      <div id="message" className={messageClass}>{this.state.message}</div>
      {this.state.displayDeleteDlg && this.renderDeleteDialog() }
      {this.renderList()}
      </div>
      </div>
    </div>;
  }

  filteredImages() {
    if (!  this.state.serverImages[this.state.namespace]) {
      return [];
    }
    let filter = this.state.filter.toLowerCase();
    return this.state.serverImages[this.state.namespace].filter(
       img => filter === '' || img.fileName.toLowerCase().includes(filter)
    );
  }

  renderList() {
      let imgs = this.filteredImages();
      let counter = 0;
      let nsPrefix = this.state.namespace ? this.state.namespace + ":" : '';
      if (this.props.selectItem) {
      return <div className="mediaBox">
        <div className="imageFrame" title="Hover over filename to preview">Image Preview</div>
          <div className="mediaList">
        {
          imgs.map( img => {
            counter++;
            return <div className="mediaListItem" key={"media" + counter}>
              <div><button className="button-unstyled" onClick={(ev) => this.doAction(ev, nsPrefix + img.fileName)}>{img.fileName}</button> - {this.renderFileSize(img.fileSize)} - {this.renderDownloadLink(img.fileName,"/_media/" + nsPrefix + img.fileName)} {img.width}x{img.height} - uploaded by {img.uploadedBy}  {this.state.user && <button className="delete button-unstyled" onClick={() => this.doDelete(this.state.namespace, img)}>Delete</button>}</div>
              <img className="hoverImg" src={"/_media/" + nsPrefix + img.fileName} loading="lazy"/>
            </div>;
          })
        }
        </div></div>

      }
      return <div className="mediaBox">
        <div className="imageFrame" title="Hover over filename to preview">Image Preview</div>
          <div className="mediaList">
        {
          imgs.map( img => {
            counter++;
            return <div className="mediaListItem" key={"media" + counter}>
              <div>{img.fileName} - {this.renderFileSize(img.fileSize)} - {this.renderDownloadLink(img.fileName,"/_media/" + nsPrefix + img.fileName)} {img.width}x{img.height} - uploaded by {img.uploadedBy}  {this.state.user && <button className="delete button-unstyled" onClick={() => this.doDelete(this.state.namespace, img)}>Delete</button>}</div>
              <img className="hoverImg" src={"/_media/" + nsPrefix + img.fileName} loading="lazy"/>
            </div>;
          })
        }
      </div></div>
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

  renderDownloadLink(fileName, filePath) {
    return <a download={fileName} href={filePath}><img src="/_resources/download.png"/></a>;
  }

  enableUpload() {
    if (!this.state.enabled) {
      return false;
    }
    const node = this.findNode(this.state.nsTree, this.state.namespace);
    return !node || node.writable;
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
    this.setState({"message": e.message, "errorMessage": true, enabled:true})
  }

  uploadFile(ev) {
    ev.preventDefault();
    this.setState({"message": "Uploading", "errorMessage":false, "enabled": false});
    this.dataService.saveMedia(mediaFileUpload.files, mediaFileUploadNS.value).then(
      () => {
        mediaFileUpload.value = null;
        this.setState({"message": "Upload Complete", "errorMessage": false, enabled:true});
        this.fetchImageList();}).catch(
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
  catch(e => {this.handleError(e); this.closeDeleteDialog();})}>Delete</button><button onClick={() => this.closeDeleteDialog()}>Cancel</button></div>
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

  doAction(ev, img) {
    this.props.selectItem(img);
    ev.preventDefault();
  }
}
