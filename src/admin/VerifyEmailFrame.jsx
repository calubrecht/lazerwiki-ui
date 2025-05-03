import {useState} from 'react';
import './AdminWidget.css';
import {PropTypes} from "prop-types";
import {instance as DS_instance} from '../svc/DataService';
import TextField from "../TextField.jsx";


function doVerify(token, onSuccess, setMessage) {
  setMessage("");
  DS_instance().verifyEmailToken(token).then(response => {
     if (response.success) {
       onSuccess();
     }
     else {
       setMessage(response.message);
     }
  })
}

function VerifyEmailFrame(props) {
  let email = props.email;
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  let disabled = false;
  return <div data-testid="VerifyEmailBackdrop" className="VerifyEmailBackdrop" onClick = {(ev) => {if (ev.target === ev.currentTarget) {props.doClose()}}}>
    <div className="VerifyEmailFrame">
      <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
      <div className="heading">An email has been sent to {email} containing a verification code. Please verify your
        email
        by entering the code here.
      </div>
      <TextField name="VerificationToken" label="Verification Token:" onChange={setToken}
                 disabled={disabled} varName="VerificationToken" isPassword={false} value={token}
                 autoComplete="off"/>
      <button onClick={() => doVerify(token, props.onSuccess, setMessage)}>Verify Token</button>
      <div className="error">{message}</div>
    </div>
  </div>;
}

VerifyEmailFrame.propTypes = {doClose: PropTypes.func, onSuccess: PropTypes.func, email: PropTypes.string};


export default VerifyEmailFrame;