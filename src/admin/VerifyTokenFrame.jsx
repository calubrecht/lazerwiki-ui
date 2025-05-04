import {useState} from 'react';
import './AdminWidget.css';
import {PropTypes} from "prop-types";
import {instance as DS_instance} from '../svc/DataService';
import TextField from "../TextField.jsx";


function doVerify(token, username, onSuccess, setMessage, verifyFunc) {
  setMessage("");
  verifyFunc(token, username).then(response => {
     if (response.success) {
       onSuccess();
     }
     else {
       setMessage(response.message);
     }
  })
}

function VerifyTokenFrame(props) {
  let email = props.email;
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  let verifyFunc = props.tokenType === 'email' ? DS_instance().verifyEmailToken.bind(DS_instance()) : DS_instance().verifyPasswordToken.bind(DS_instance());
  let disabled = false;
  return <div data-testid="VerifyTokenBackdrop" className="VerifyTokenBackdrop" onClick = {(ev) => {if (ev.target === ev.currentTarget) {props.doClose()}}}>
    <div className="VerifyTokenFrame">
      <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
      <div className="heading">An email has been sent to {email} containing a verification code. Please verify your
        email
        by entering the code here.
      </div>
      <TextField name="VerificationToken" label="Verification Token:" onChange={setToken}
                 disabled={disabled} varName="VerificationToken" isPassword={false} value={token}
                 autoComplete="off"/>
      <button onClick={() => doVerify(token, props.userName, props.onSuccess, setMessage, verifyFunc)}>Verify Token</button>
      <div className="error">{message}</div>
    </div>
  </div>;
}

VerifyTokenFrame.propTypes = {doClose: PropTypes.func, onSuccess: PropTypes.func, email: PropTypes.string, tokenType: PropTypes.string, userName:PropTypes.string};


export default VerifyTokenFrame;