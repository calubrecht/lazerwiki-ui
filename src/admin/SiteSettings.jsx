import {useState} from 'react';
import './AdminWidget.css';
import TextField from '../TextField';
import TextArea from '../TextArea';
import ACLWidget from './ACLWidget';
import {PropTypes} from "prop-types";
import {instance as DS_instance} from '../svc/DataService';


export default function SiteSettings(props) {
  let disabled = false;
  const [siteHostname, setSiteHostname] = useState(props.siteHostname);
  const [siteSettings, setsiteSettings] = useState(JSON.stringify(props.siteSettings));
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [origHostName, setOrigHostName] = useState(props.siteHostname);
  const [origSettings, setOrigSettings] = useState(JSON.stringify(props.siteSettings));
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");
  const className = props.visible ? "settingsBody" : "settingsBody hidden";
  const label = props.visible ? "SettingSiteBody" : "SettingSiteBodyHidden";
  function change(v, setter) {
    setter(v);
  }
  const saveDisabled = saveInProgress || siteHostname ===  origHostName && siteSettings === origSettings;
  function saveSettings() {
    setSaveInProgress(true);
    setMessage("");
    setErrorMsg("");
    DS_instance().saveSiteSettings(props.siteName, siteHostname, siteSettings).then( res => {
            if (!res.success) {
              setErrorMsg(res.msg);
              setMessage("Settings Saved");
            }
            else
            {
              setOrigHostName(siteHostname);
              setOrigSettings(siteSettings);
              setErrorMsg("");
            }
            setSaveInProgress(false)
    });
  }
  return <div className={className} aria-label={label} role="group">
    <h1>Settings for - {props.siteDisplayName}</h1>
    <TextField className="SettingsField" name="SiteName" label="Site Name:" disabled={true} varName="siteName"
               value={props.siteName}/>
    <TextField className="SettingsField" name="SiteHostName" label="Site Hostname:"
               onChange={(v) => change(v, setSiteHostname)} disabled={disabled} varName="siteHostname"
               value={siteHostname}/>
    <TextArea className="SettingsField" name="SiteSettings" label="Settings:"
              onChange={(v) => change(v, setsiteSettings)} disabled={disabled} varName="siteSettings"
              value={siteSettings}/>
    <button className="SettingsSaveBtn" disabled={saveDisabled} onClick={saveSettings}>Save</button>
    <ACLWidget site={props.siteName} users={props.userData.users} userMap={props.userData.userMap}
               setUserMap={props.userData.setUserMap}></ACLWidget>
    <div className="MaintenanceTasks">
      <button disabled={saveInProgress} onClick={() =>{
        setMessage("");
        setErrorMsg("");
        setSaveInProgress(true);
        DS_instance().regenCacheTable(props.siteName).then(() => {setMessage("Cache Table Regenerated"); setSaveInProgress(false);}).
        catch((err) => {setErrorMsg("Regen failed"); setSaveInProgress(false);});
      }}>Regen Caches</button>
      <button disabled={saveInProgress} onClick={() =>{
        setMessage("");
        setErrorMsg("");
        setSaveInProgress(true);
        DS_instance().regenLinkTable(props.siteName).then(() => {setMessage("Link Table Regenerated"); setSaveInProgress(false);}).
        catch(() => {setErrorMsg("Regen failed"); setSaveInProgress(false);});
      }}>Regen Link Table</button>
    </div>
    <div className="error">{errorMsg}</div>
    <div className="message">{message}</div>
  </div>;
}

SiteSettings.propTypes = {
  siteDisplayName: PropTypes.string, siteName: PropTypes.string, siteHostname: PropTypes.string, siteSettings: PropTypes.object, visible: PropTypes.bool, userData: PropTypes.object
};
