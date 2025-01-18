import {PropTypes} from "prop-types";
import './SliderInput.css';

export default function SliderInput(props) {
    return <span><label className='realLabel' htmlFor={props.id}>{props.label}</label><label className="sliderSwitch">
        <input id={props.id} type="checkbox"/>
        <span className="slider round"></span>
    </label></span>;
}
//activeSites={sites} setSites={setSites}
SliderInput.propTypes = {
    label: PropTypes.string, value: PropTypes.bool, setter: PropTypes.func, id : PropTypes.string};
