import  {useState} from 'react';
import TextField from './TextField';
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
// <TextField name="Username" label="Username:" onChange={(v,f) => this.onChangeField(v,f)} disabled={this.state.disabled} varName="username" autofocus={true} value={this.state.username}/>
function imageSize(selectedX, selectedY, setSelectedX, setSelectedY) {
    return <div><span>Image Size</span>
        <TextField name="Width" label="Width:" onChange={setSelectedX} disabled={false} varName="selectedX" autofocus={false} value={selectedX}/>
        <TextField name="Height" label="Height:" onChange={setSelectedY} disabled={false} varName="selectedX" autofocus={false} value={selectedY}/>
    </div>;
}


export default function ImageSettings(props) {
    const [selectedAlignment, setSelectedAlignment] = useState("Flow");
    const [selectedY, setSelectedY] = useState("");
    const [selectedX, setSelectedX] = useState("");
    let setBothAlignment = (val) => {
        setSelectedAlignment(val);
        props?.chooseAlignment(val);
    }
    let checkAndSetDimension = (setter, propSetter) => {
        return (val) => {
            if (val === '') {
                setter(val);
                propSetter(null);
                return;
            }
            let parsed = parseInt(val, 10);
            if(parsed.toString()===val) {
                setter(val);
                propSetter(parsed);
            }
        }
    }
    return <div className="imageSettings">{imageAlignments(selectedAlignment, setBothAlignment)}{imageSize(selectedX, selectedY, checkAndSetDimension(setSelectedX, props.chooseX), checkAndSetDimension(setSelectedY, props.chooseY))}</div>
}

ImageSettings.propTypes = {chooseAlignment: PropTypes.func, chooseX: PropTypes.func, chooseY: PropTypes.func};
