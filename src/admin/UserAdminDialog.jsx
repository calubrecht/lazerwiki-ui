import {useEffect, useState, useRef} from 'react';
import './AdminWidget.css';
import TextField from "../TextField.jsx";
import VerifyTokenFrame from "./VerifyTokenFrame.jsx";
import {instance as DS_instance} from '../svc/DataService';
import {instance as US_instance} from '../svc/UserService';
import {PropTypes} from "prop-types";

function submitSavePassword(setters)
{
    let u = US_instance().getUser().userName;
    setters.setError("");
    DS_instance().setPassword(u, setters.newPassword).then( (res) => {
        if (res.success) {
            setters.setNewPassword('');
            setters.setConfirmPassword('');
        }
        else {
          setters.setError(res.message);
        }
    });
}

function submitSaveEmail(setters)
{
    let u = US_instance().getUser().userName;
    setters.setError("");
    DS_instance().saveEmail(u, setters.email).then( (res) => {
        if (res.success) {
            setters.setDisplayVerifyEmail(true);
        }
        else {
            setters.setError(res.message);
        }
    });
}

function verifyEmail(email) {
    let regex = /^[\w\-.]+@[\w\-.]+(\.[\w\-.]+)+$/ ;
    return regex.test(email);
}


function renderGeneralSettings( visible, setters) {
    const className = "settingsBody"; // visible ? "settingsBody" : "settingsBody hidden";
    let disabled = false;
    let savePasswordEnabled = setters.newPassword && (setters.newPassword === setters.confirmPassword);
    let saveEmailEnabled = setters.email && (setters.email !== setters.savedEmail) && verifyEmail(setters.email);
    //The text and password here are to prevent FF from auto filling login credentials because it ignores autocomplete="off"
    return <div className={className} aria-label="SettingSiteBody"><h1>General Settings</h1>
        <h2>Change Password</h2>
        <input type="text" style={{display: "none"}}></input>
        <input type="password" style={{display: "none"}}></input>
        <TextField name="New Password" label="New Password:" onChange={(v,) => setters.setNewPassword(v)}
                   disabled={disabled} varName="password" isPassword={true} value={setters.newPassword}
                   autoComplete="off"/>
        <div onKeyDown={(ev) => handleKeyDown(ev, savePasswordEnabled, () => submitSavePassword(setters))}>
        <TextField name="Confirm Password" label="Confirm Password:" onChange={(v,) => setters.setConfirmPassword(v)}
                   disabled={disabled} varName="confirmPassword" isPassword={true} value={setters.confirmPassword}
                   autoComplete="off"/></div>
        <button disabled={!savePasswordEnabled} onClick={() => submitSavePassword(setters)}>Save Password</button>
        <div onKeyDown={(ev) => handleKeyDown(ev, saveEmailEnabled, () => submitSaveEmail(setters))}>
        <TextField name="Email" label="Email:" onChange={(v,) => setters.setEmail(v)}
                   disabled={disabled} varName="email" isPassword={false} value={setters.email || ''}
                   autoComplete="off"/></div>
        <button disabled={!saveEmailEnabled} onClick={() => submitSaveEmail(setters)}>Save Email</button>

        <div className="error">{setters.error}</div>
    </div>;
}

function renderDlgBody(tab, setters) {
    return <div>
        {renderGeneralSettings(tab === 'General', setters)}</div>
}

function handleKeyDown(ev, isactive, action)
{
    if (ev.key === "Enter")
    {
        ev.stopPropagation();
        ev.preventDefault();
        if (!isactive) {
            return;
        }
        action();
    }
}

function UserAdminDialog(props) {
    const [selectedTab, setSelectedTab] = useState("General");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [email, setEmail] = useState(US_instance().getUser().settings["email"]);
    const [savedEmail, setSavedEmail] = useState("");
    const [displayVerifyEmail, setDisplayVerifyEmail] = useState(false);
    let showSelectedTab = selectedTab;
    let tabList = ["General"];
    const dlgRef = useRef();
    useEffect(() => {
        dlgRef.current?.showModal?.();
    }, [])
    useEffect(() => {
        // Get current setting emaildlgRef.current?.showModal?.();
    }, [])
    return (<dialog className="AdminDialog" ref={dlgRef}>
        <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
        <div id="adminSidebar" aria-label="SettingSiteTabs">
            <label>User Settings</label>
            {tabList.map(tab => {
                let className = "settingsTabBtn button-unstyled";
                className = className + " selectedTab"; //tab == showSelectedTab ? className + " selectedTab" : className;
                return <button key={tab} className={className} onClick={() => setSelectedTab(tab)}>{tab}</button>
            })}
        </div>
        {renderDlgBody(showSelectedTab, {newPassword, setNewPassword, confirmPassword, setConfirmPassword, error, setError, email, setEmail, savedEmail, setSavedEmail, setDisplayVerifyEmail})}
        {displayVerifyEmail && <VerifyTokenFrame email={email} tokenType="email" doClose={() => setDisplayVerifyEmail(false)} onSuccess={() => {
            setDisplayVerifyEmail(false);
            setSavedEmail(email);
        }}/>}
    </dialog>);
}

UserAdminDialog.propTypes = {doClose:PropTypes.func};


export default UserAdminDialog;
