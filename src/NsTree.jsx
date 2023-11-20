import React, {Component} from 'react';


export default class NsTree extends Component
{
  constructor(props) {
    super(props);
  }
  
  render() {
    return <ul className="nsTree">{this.renderNSSubtree(this.props.nsTree, 1)}</ul>;
  }

  renderNSSubtree(tree, level) {
    let name = tree.namespace ? tree.namespace : "<ROOT>";
    if (!tree.children || tree.children.length == 0) {
      return <li className="terminal" key={tree.fullNamespace}><span className="dot" onClick={evt => evt.stopPropagation()}> </span><span onClick={(evt => this.selectNS(evt, tree.fullNamespace))}>{name}</span></li>;
    }
    let subTreeClass = level <= 1 ? "open" : "closed";
    return <li className={subTreeClass} key={tree.fullNamespace} onClick= {(evt => this.toggleTreeClass(evt))}><span className="dot"> </span><span onClick={(evt => this.selectNS(evt, tree.fullNamespace))}>{name}</span><ul className="nsTree">{
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
    this.props.selectNS(ns);
  }
}
