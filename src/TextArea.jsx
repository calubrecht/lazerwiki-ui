import {PropTypes} from "prop-types";

export default function TextArea(props) {
  let className = props.className ? props.className : "TextField";
  let id = props.name + (Math.random()*10000);

  return <div className={className}><label htmlFor={id} className="textFieldLabel">{props.label}</label><textarea placeholder={props.name} id={id} onChange={evt => props.onChange(evt.target.value, props.varName)} disabled={props.disabled} autoFocus={props.autofocus} value={props.value} cols={60} rows={5} spellcheck="false"></textarea></div>;
}

TextArea.propTypes = {
  className: PropTypes.string, name: PropTypes.string, label: PropTypes.string, siteSettings: PropTypes.string, varName: PropTypes.string, value: PropTypes.string, visible: PropTypes.bool, disabled: PropTypes.bool, autofocus: PropTypes.bool,  onChange: PropTypes.func
};
