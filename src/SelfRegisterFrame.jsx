import './SelfRegisterFrame.css';
import {PropTypes} from "prop-types";

export default function SelfRegisterFrame(props) {
    return <div className='selfRegisterFrame'>
        <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
        <div className='box'> Register Here</div></div>
}

SelfRegisterFrame.propTypes = {doClose: PropTypes.func.isRequired}