import  {useState} from 'react';

import './ImageSettings.css';
import {PropTypes} from "prop-types";

function imageAlignments(selectedAlignment, setSelectedAlignment) {
    let flowClass = "selectBox" + (selectedAlignment === "Flow" ? " selected": "");
    let leftClass = "selectBox" + (selectedAlignment === "Left" ? " selected": "");
    let rightClass = "selectBox" + (selectedAlignment === "Right" ? " selected": "");
    let centerClass = "selectBox" + (selectedAlignment === "Center" ? " selected": "");
    let selectorFnc = (val) => (() => setSelectedAlignment(val));
    return <div><span>Alignment: </span><span className={flowClass} onClick={selectorFnc("Flow")}>Flow</span>
    <span className={leftClass} onClick={selectorFnc("Left")}>Left</span>
    <span className={rightClass} onClick={selectorFnc("Right")}>Right</span>
    <span className={centerClass} onClick={selectorFnc("Center")}>Center</span>
</div>;
}


export default function ImageSettings(props) {
    const [selectedAlignment, setSelectedAlignment] = useState("Flow");
    let setBothAlignment = (val) => {
        setSelectedAlignment(val);
        props?.chooseAlignment(val);
    }
   //    let fieldType = props.isPassword ? "password" : "text";
   // let className = props.className ? props.className : "TextField";
   // let id = props.name + (Math.random()*10000);
    return <div className="imageSettings">{imageAlignments(selectedAlignment, setBothAlignment)}</div>
 //   return <div className={className}><label htmlFor={id} className="textFieldLabel">{props.label}</label><input type={fieldType} placeholder={props.name} id={id} onChange={evt => props.onChange(evt.target.value, props.varName)} disabled={props.disabled} autoFocus={props.autofocus} value={props.value}></input></div>;
}

ImageSettings.propTypes = {chooseAlignment: PropTypes.func}
