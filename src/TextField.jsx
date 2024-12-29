import {PropTypes} from "prop-types";

export default function TextField(props) {
  let fieldType = props.isPassword ? "password" : "text";
  let className = props.className ? props.className : "TextField";
  let id = props.name + (Math.random()*10000);
  let autoComplete = props.autoComplete === undefined ? "on" : props.autoComplete;

  return <div className={className}><label htmlFor={id} className="textFieldLabel">{props.label}</label><input type={fieldType} placeholder={props.name} id={id} onChange={evt => props.onChange(evt.target.value, props.varName)} disabled={props.disabled} autoFocus={props.autofocus} value={props.value} autoComplete={autoComplete}></input></div>;
}

TextField.propTypes = {isPassword: PropTypes.bool, className: PropTypes.string, name: PropTypes.string,
  label: PropTypes.string, autoComplete: PropTypes.string, disabled: PropTypes.bool, onChange: PropTypes.func,
  varName: PropTypes.string, value: PropTypes.string, autofocus: PropTypes.bool};
