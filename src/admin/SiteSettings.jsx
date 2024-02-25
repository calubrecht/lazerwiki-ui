import React, {useEffect, useState, useRef} from 'react';
import './AdminWidget.css';
import TextField from '../TextField';
import {instance as US_instance} from '../svc/UserService';
import {instance as DS_instance} from '../svc/DataService';

export default function SiteSettings(props) {
  const [disabled, setDisabled] = useState(false);
  const [siteName, setSiteName] = useState(props.siteDisplayName);
  const className = props.visible ? "settingsBody" : "settingsBody hidden";
  const label = props.visible ? "SettingSiteBody" : "SettingSiteBodyHidden";
  function changeField(namme, value, field) {
      setSiteName(value);
  }
  return <div className={className} aria-label={label} role="group">
    <h1>Settings for - {props.siteDisplayName}</h1>
    <TextField className="SettingsField" name="SiteName" label="Site Name:" onChange={(v,f) => changeField(props.siteName, v,f)} disabled={disabled} varName="siteName" value={siteName} />
    </div>;
}
