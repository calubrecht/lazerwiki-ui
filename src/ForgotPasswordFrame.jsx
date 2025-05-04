import './ForgotPasswordFrame.css';
import {PropTypes} from "prop-types";
import TextField from "./TextField.jsx";
import {useState} from "react";
import {instance as DS_instance} from './svc/DataService';
import VerifyTokenFrame from "./admin/VerifyTokenFrame.jsx";

export default function ForgotPasswordFrame(props) {
    let username = props.initData.username;
    let [password, setPassword] = useState("");
    let [confirmPassword, setConfirmPassword] = useState("");
    let [confirmToken, setConfirmToken] = useState(false);
    let [disabled, setDisabled] = useState(false);
    let [buttonDisabled, setButtonDisabled] = useState(true);
    let [message, setMessage] = useState("");
    let [completed, setCompleted] = useState(false);
    let [email, setEmail] = useState("");

    if (completed) {
        return <div className='forgotPasswordFrame'>
            <button onClick={() => {props.doClose(); setCompleted(false);}} className="close button-unstyled">X</button>
            <div className='box'>
                The password for {username} has been successfully reset. Please close this box and log in.
            </div>
        </div>;
    }
    let dlg="";
    if (confirmToken) {
        dlg= <VerifyTokenFrame email={email} userName ={username} tokenType="password" doClose={() => {
            setConfirmToken(false);
            setDisabled(false);
            setButtonDisabled(false);
        }} onSuccess={() => {
            setConfirmToken(false);
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setCompleted(true);
            setDisabled(false);
            setButtonDisabled(false);
        }}/>
    }

    return <div className='forgotPasswordFrame'>
        {dlg}
        <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
        <div className='box' onKeyDown={(ev) => handleKeyDown(ev, username, email, password, confirmPassword, setDisabled, setButtonDisabled, setMessage, setConfirmToken)}>
            <div>Enter user name, email and desired password. If the email address is associated with the user name, you will receive and email
            to confirm the change.</div>
            <TextField name="UserName" label="Username:" disabled={true} value={username} />
            <TextField name="Email" label="Email:"  value={email} onChange={(v,) => setEmail(v)}/>
            <TextField name="New Password" label="Password:"
                       onChange={(v,) => setAndCheckPasswords(v, setPassword, v, confirmPassword, email, setButtonDisabled, setMessage)}
                       disabled={disabled} varName="password" isPassword={true} autoComplete="new-password"
                       value={password}/>
            <TextField name="Confirm Password" label="Confirm Password:"
                       onChange={(v,) => setAndCheckPasswords(v, setConfirmPassword, password, v, email, setButtonDisabled, setMessage)}
                       disabled={disabled} varName="password" isPassword={true} autoComplete="new-password"
                       value={confirmPassword}/>
        </div>
        <div>
            <button className="submitButton" disabled={buttonDisabled} onClick={() => submitPassword(username, email, password, setDisabled, setButtonDisabled, setMessage, setConfirmToken)}>Reset Password</button>
        </div>
        <div className="passwordMessage">{message}</div>
    </div>
}


function setAndCheckPasswords(newValue, setter, password, confirmPassword, email, setButtonDisabled, setMessage)
{
    setter(newValue);
    if (password === confirmPassword) {
        setButtonDisabled(password.trim() === "" || email.trim() === "");
        setMessage("");
    }
    else {
        setButtonDisabled(true);
        setMessage("Passwords don't match");
    }

}

function submitPassword(user, email, password, setDisabled, setButtonDisabled, setMessage, setConfirmToken) {
    setDisabled(true);
    setButtonDisabled(true);
    setMessage("");
    DS_instance().resetForgottenPassword(user, email, password).then(
        () => {
            setConfirmToken(true);
        }
    ).catch((res) => {
        setDisabled(false);
        setButtonDisabled(false);
        setMessage(res.message);
    })
}

function handleKeyDown(ev, user, email, password, confirmPassword, setDisabled, setButtonDisabled, setMessage, setConfirmToken)
{
    if (ev.key === "Enter")
    {
        ev.stopPropagation();
        ev.preventDefault();
        if (password !== confirmPassword) {
            return;
        }
        if (password.trim() === '' || email.trim()=== '') {
            return;
        }
        submitPassword(user, email, password, setDisabled, setButtonDisabled, setMessage, setConfirmToken);
    }
}


ForgotPasswordFrame.propTypes = {doClose: PropTypes.func.isRequired, initData: PropTypes.object};