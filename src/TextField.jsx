import React, {Component} from 'react';

export default function TextField(props) {
  let fieldType = props.isPassword ? "password" : "text";
  let className = props.className ? props.className : "TextField";
  let id = props.name + (Math.random()*10000);

  return <div className={className}><label htmlFor={id} className="textFieldLabel">{props.label}</label><input type={fieldType} placeholder={props.name} id={id} onChange={evt => props.onChange(evt.target.value, props.varName)} disabled={props.disabled} autoFocus={props.autofocus} value={props.value}></input></div>;
}
