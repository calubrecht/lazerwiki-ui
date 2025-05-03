import './ForgotPasswordFrame.css';
import {PropTypes} from "prop-types";
import TextField from "./TextField.jsx";
import {useState} from "react";
import {instance as DS_instance} from './svc/DataService';

export default function ForgotPasswordFrame(props) {
    let username = props.initData.username;
    let [password, setPassword] = useState("");
    let [confirmPassword, setConfirmPassword] = useState("");
    let [disabled, setDisabled] = useState(false);
    let [buttonDisabled, setButtonDisabled] = useState(true);
    let [message, setMessage] = useState("");
    let [completed, setCompleted] = useState(false);

    if (completed) {
        return <div className='forgotPasswordFrame'>
            <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
            <div className='box'>
                User Successfully created. Please log in.
            </div>
        </div>;
    }

    return <div className='forgotPasswordFrame'>
        <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
        <div className='box' onKeyDown={(ev) => handleKeyDown(ev, username, password, confirmPassword, setDisabled, setButtonDisabled, setMessage, setUserCreated(setUsername, setPassword, setConfirmPassword, setCompleted))}>
            <div>Enter Username, email and desired password. If the email address is associated with the userName, you will receive and email
            to confirm the change.</div>
            <TextField name="UserName" label="Username:" disabled={true} value={username} />
            <TextField name="Email" label="Email:" disabled={true} value={username} />
            <TextField name="New Password" label="Password:"
                       onChange={(v,) => setAndCheckPasswords(v, setPassword, v, confirmPassword, username, setButtonDisabled, setMessage)}
                       disabled={disabled} varName="password" isPassword={true} autoComplete="new-password"
                       value={password}/>
            <TextField name="Confirm Password" label="Confirm Password:"
                       onChange={(v,) => setAndCheckPasswords(v, setConfirmPassword, password, v, username, setButtonDisabled, setMessage)}
                       disabled={disabled} varName="password" isPassword={true} autoComplete="new-password"
                       value={confirmPassword}/>
        </div>
        <div>
            <button className="submitButton" disabled={buttonDisabled} onClick={() => createUser(username, password, setDisabled, setButtonDisabled, setMessage, setUserCreated(setUsername, setPassword, setConfirmPassword, setCompleted))}>Create User</button>
        </div>
        <div className="passwordMessage">{message}</div>
    </div>
}


function setAndCheckPasswords(newValue, setter, password, confirmPassword, user, setButtonDisabled, setMessage)
{
    setter(newValue);
    if (password === confirmPassword) {
        setButtonDisabled(password.trim() === "" || user.trim() === "");
        setMessage("");
    }
    else {
        setButtonDisabled(true);
        setMessage("Passwords don't match");
    }

}

function createUser(user, password, setDisabled, setButtonDisabled, setMessage, setCompleted) {
    setDisabled(true);
    setButtonDisabled(true);
    setMessage("");
    DS_instance().addUser(user, password).then(
        () => {
            setCompleted(true);
        }
    ).catch((res) => {
        res.promise.then(text => {
            setDisabled(false);
            setButtonDisabled(false);
            setMessage(text || res.message);
        });
    })
}

function setUserCreated(setUsername, setPassword, setConfirmPassword, setCompleted) {
    return () => {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setCompleted(true);};
}

function handleKeyDown(ev, user, password, confirmPassword, setDisabled, setButtonDisabled, setMessage, setCompleted)
{
    if (ev.key === "Enter")
    {
        ev.stopPropagation();
        ev.preventDefault();
        if (password !== confirmPassword) {
            return;
        }
        if (password.trim() === '' || user.trim()=== '') {
            return;
        }
        createUser(user, password, setDisabled, setButtonDisabled, setMessage, setCompleted);
    }
}


ForgotPasswordFrame.propTypes = {doClose: PropTypes.func.isRequired}