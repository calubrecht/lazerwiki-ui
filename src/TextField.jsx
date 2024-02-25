import React, {Component} from 'react';

export default function TextField(props) {
  let fieldType = props.isPassword ? "password" : "text";
  let className = props.className ? props.className : "TextField";

  return <div className={className}><label htmlFor={props.name} className="textFieldLabel">{props.label}</label><input type={fieldType} placeholder={props.name} id={props.name} onChange={evt => props.onChange(evt.target.value, props.varName)} disabled={props.disabled} autoFocus={props.autofocus} value={props.value}></input></div>;
}
