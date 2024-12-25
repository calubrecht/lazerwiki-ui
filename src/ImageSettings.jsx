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
    return <div className="imageSettings">{imageAlignments(selectedAlignment, setBothAlignment)}</div>
}

ImageSettings.propTypes = {chooseAlignment: PropTypes.func}
