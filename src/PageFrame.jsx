import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';

import './PageFrame.css';

export default class PageFrame extends Component
{
  constructor(props) {
    super(props);
    this.dataService = DS_instance();
    this.state = {nsTree: {}, pageData: {}, namespace: "" };
  }

  componentDidMount()
  {
    this.fetchPageList();
  }

  fetchPageList() {
    this.dataService.fetchPageList().then( (data) => this.structurePageData(data));
  }

  structurePageData(pageData) {
    let tree = {};
    this.parseTree(tree, pageData, "", "");
    let nsPages = {};
    this.parsePages(nsPages, pageData);
    this.setState({nsTree: tree, pageData: nsPages})
  }

  parseTree(tree, pageData, fullName, displayName) {
    tree.fullName = fullName;
    tree.displayName = displayName;
    tree.children = [];
    for (let idx in pageData.children) {
      let node = pageData.children[idx];
      if (node.namespace) {
        let subtree = {};
        this.parseTree(subtree, node, displayName === '' ? node.namespace : displayName + ":" + node.namespace, node.namespace);
        tree.children.push(subtree);
      }
    }
  }

  parsePages(nsPages, pageData) {
    for (let idx in pageData.children) {
      let node = pageData.children[idx];
      if (node.namespace) {
        let subtree = {};
        this.parsePages(nsPages, node);
      }
      if (node.page) {
        let ns = node.page.namespace;
        if (!(ns in nsPages)) {
          nsPages[ns] = []
        }
        nsPages[ns].push(node.page);
      }
    }

  }




  render()
  {
    let counter = 0;
    return <div className="pageFrame">
      <div onClick={() => this.props.doClose()} className="close">X</div>
      <h2 className="title">Page List</h2>
        <div className="pageFrameContent">
        <div className="nsTreeSelector">
          <h3>Namespace</h3>
          {this.renderNSTree()}
        </div>
        <div className="pageSelector">
          <h3>Pages - [{this.state.namespace}]</h3>
          {this.renderList()}
        </div>
        </div>
    </div>;
  }

  renderLinkURL(p) {
    let name = p.namespace === '' ? p.pagename : p.namespace + ":" + p.pagename;
    return name === '' ? '/' : '/page/' + name;
  }

  renderLinkName(p) {
    let name = p.pagename === '' ? '<ROOT>' : p.pagename;
    let title = p.title ? ' - ' + p.title : '';
    return name + title;
  }

  renderList() {
    let pages = this.state.pageData[this.state.namespace];
    if (!pages) {
      return <div></div>;
    }
    if (this.asLinks() ) {
      return (<div className="pageList">
        {pages.map( p => <div key={p.pagename}><a href={this.renderLinkURL(p)} >{this.renderLinkName(p)}</a></div>)}

      </div>);
    }

    return <div></div>;
  }

  renderNSTree() {
    console.log("renderNSTree");
    return <ul className="nsTree">{this.renderNSSubtree(this.state.nsTree, 1)}</ul>;
  }

  renderNSSubtree(tree, level) {
    let name = tree.displayName ? tree.displayName : "<ROOT>";
    console.log("renderNSSubTree:" + name);
    if (!tree.children || tree.children.length == 0) {
      return <li className="terminal" key={tree.name}><span className="dot" onClick={evt => evt.stopPropagation()}> </span><span onClick={(evt => this.selectNS(evt, tree.fullName))}>{name}</span></li>;
    }
    let subTreeClass = level <= 1 ? "open" : "closed";
    return <li className={subTreeClass} key={tree.name} onClick= {(evt => this.toggleTreeClass(evt))}><span className="dot"> </span><span onClick={(evt => this.selectNS(evt, tree.fullName))}>{name}</span><ul className="nsTree">{
      tree.children.map( c => this.renderNSSubtree(c))
    }</ul></li>;
  }

  toggleTreeClass(evt) {
    evt.stopPropagation();
    evt.currentTarget.classList.toggle("open");
    evt.currentTarget.classList.toggle("closed");
  }

  selectNS(evt, ns) {
    evt.stopPropagation();
    this.setState({namespace: ns});
  }

  asLinks() {
    return !this.props.editorWidget;
  }
}
