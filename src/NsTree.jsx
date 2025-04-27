import React, {Component} from 'react';
import {PropTypes} from "prop-types";


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
      return <li className="terminal" key={tree.fullNamespace}><button className="dot button-unstyled" onClick={evt => evt.stopPropagation()} aria-label={"expand-" + tree.fullNamespace}> </button><button className="button-unstyled" onClick={(evt => this.selectNS(evt, tree.fullNamespace))}>{name}</button></li>;
    }
    let subTreeClass = level <= 1 ? "open" : "closed";
    return <li className={subTreeClass} key={tree.fullNamespace} onClick= {(evt => this.toggleTreeClass(evt))}><button className="dot button-unstyled" aria-label={"expand-" + tree.fullNamespace}> </button><button className="button-unstyled" onClick={(evt => this.selectNS(evt, tree.fullNamespace))}>{name}</button><ul className="nsTree">{
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

  static propTypes = {nsTree:PropTypes.object, selectNS:PropTypes.func.isRequired};
}
