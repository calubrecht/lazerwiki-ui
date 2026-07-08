import React, {Component} from 'react';
import {PropTypes} from "prop-types";


export default class NsTree extends Component
{
  constructor(props) {
    super(props);
    this.state = {toggled: new Set()};
  }

  render() {
    return <ul className="nsTree">{this.renderNSSubtree(this.props.nsTree, 1)}</ul>;
  }

  renderNSSubtree(tree, level) {
    let name = tree.namespace ? tree.namespace : "<ROOT>";
    if (!tree.children || tree.children.length == 0) {
      return <li className="terminal" key={tree.fullNamespace}><button className="dot button-unstyled" onClick={evt => evt.stopPropagation()} aria-label={"expand-" + tree.fullNamespace}> </button><button className="button-unstyled" onClick={(evt => this.selectNS(evt, tree.fullNamespace))}>{name}</button></li>;
    }
    let defaultOpen = level <= 1;
    let isOpen = this.state.toggled.has(tree.fullNamespace) ? !defaultOpen : defaultOpen;
    let subTreeClass = isOpen ? "open" : "closed";
    return <li className={subTreeClass} key={tree.fullNamespace} onClick= {(evt => this.toggleTreeClass(evt, tree.fullNamespace))}><button className="dot button-unstyled" aria-label={"expand-" + tree.fullNamespace}> </button><button className="button-unstyled" onClick={(evt => this.selectNS(evt, tree.fullNamespace))}>{name}</button><ul className="nsTree">{
      tree.children.map( c => this.renderNSSubtree(c, level + 1))
    }</ul></li>;
  }

  toggleTreeClass(evt, fullNamespace) {
    evt.stopPropagation();
    this.setState(prevState => {
      let toggled = new Set(prevState.toggled);
      toggled.has(fullNamespace) ? toggled.delete(fullNamespace) : toggled.add(fullNamespace);
      return {toggled};
    });
  }

  selectNS(evt, ns) {
    evt.stopPropagation();
    this.props.selectNS(ns);
  }

  static propTypes = {nsTree:PropTypes.object, selectNS:PropTypes.func.isRequired};
}
