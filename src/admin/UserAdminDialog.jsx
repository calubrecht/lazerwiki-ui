import {useEffect, useState, useRef} from 'react';
import './AdminWidget.css';
import TextField from "../TextField.jsx";
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


function renderGeneralSettings( visible, setters) {
    const className = "settingsBody"; // visible ? "settingsBody" : "settingsBody hidden";
    let disabled = false;
    let savePasswordEnabled = setters.newPassword && (setters.newPassword === setters.confirmPassword);
    return <div className={className} aria-label="SettingSiteBody" ><h1>General Settings</h1>
        <h2>Change Password</h2>
        <TextField name="Password" label="New Password:" onChange={(v,) => setters.setNewPassword(v)} disabled={disabled} varName="password" isPassword={true} value={setters.newPassword}/>
        <TextField name="Password" label="Confirm Password:" onChange={(v,) => setters.setConfirmPassword(v)} disabled={disabled} varName="confirmPassword" isPassword={true} value={setters.confirmPassword}/>
        <button disabled = {!savePasswordEnabled} onClick={() => submitSavePassword(setters) }>Save Password</button>

        <div className="error">{setters.error}</div>
    </div>;
}

function renderDlgBody(tab, setters) {
    return <div>
        {renderGeneralSettings(tab === 'General', setters)}</div>
}

function UserAdminDialog(props) {
    const [selectedTab, setSelectedTab] = useState("General");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    let showSelectedTab = selectedTab;
    let tabList = ["General"];
    const dlgRef = useRef();
    useEffect(() => {
        dlgRef.current?.showModal?.();
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
        {renderDlgBody(showSelectedTab, {newPassword, setNewPassword, confirmPassword, setConfirmPassword, error, setError})}
    </dialog>);
}

UserAdminDialog.propTypes = {doClose:PropTypes.func};


export default UserAdminDialog;
