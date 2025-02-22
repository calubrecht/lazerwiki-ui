import './SelfRegisterFrame.css';
import {PropTypes} from "prop-types";
import TextField from "./TextField.jsx";
import {useState} from "react";
import {instance as DS_instance} from './svc/DataService';

export default function SelfRegisterFrame(props) {
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [confirmPassword, setConfirmPassword] = useState("");
    let [disabled, setDisabled] = useState(false);
    let [buttonDisabled, setButtonDisabled] = useState(true);
    let [message, setMessage] = useState("");
    let [completed, setCompleted] = useState(false);

    if (completed) {
        return <div className='selfRegisterFrame'>
            <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
            <div className='box'>
                User Successfully created. Please log in.
            </div>
        </div>;
    }

    return <div className='selfRegisterFrame'>
        <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
        <div className='box'><TextField name="New Username" label="Username:"
                                        onChange={(v,) => setAndCheckPasswords(v, setUsername, password, confirmPassword, v, setButtonDisabled, setMessage)}
                                        disabled={disabled} varName="username" autofocus={true}
                                        autoComplete="new-password" value={username}/>
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
        setButtonDisabled(password === "" || user === "");
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


SelfRegisterFrame.propTypes = {doClose: PropTypes.func.isRequired}