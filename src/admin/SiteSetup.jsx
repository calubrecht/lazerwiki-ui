import React, {useEffect, useState, useRef} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './SiteSetup.css';


function handleKeyDown(ev, submit, data,dlgRef)
{
    if (ev.key === "Enter")
    {
      ev.stopPropagation();
      ev.preventDefault();
      submit(data, dlgRef);
    }
}
function submitAddSite(data, addSiteRef){
        data.setDisabled(true);
        let i = DS_instance();
        DS_instance().addSite(data.siteName, data.siteDisplayName, data.siteHostName).then((newSites) => {
          addSiteRef?.current?.close?.();
          data.setDisabled(false);
          data.setSiteName('');
          data.setSiteDisplayName('');
          data.setSiteHostName('');
          data.setSites(newSites);
        }).catch((ev) => {console.log(ev); data.setDisabled(false)});
}

function SiteSetup(props) {
  const addSiteRef = useRef();
  const delSiteRef = useRef();
  const [disabled, setDisabled] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteDisplayName, setSiteDisplayName] = useState('');
  const [siteHostName, setSiteHostName] = useState('');
  return <div className="siteSetup">
    <label htmlFor="siteList" >Available Sites</label>
    <div>
    <dialog className="addSiteDialog" ref={addSiteRef} >
      <h2>Add New Site</h2>
      <div><label htmlFor="siteName">New Site:</label><input type="text" placeholder="New Site" id="siteName" name="siteName" value={siteName} onChange={evt => setSiteName(evt.target.value)} disabled={disabled} autoFocus></input></div>
      <div><label htmlFor="siteDisplayName">Display Name:</label><input type="text" placeholder="Display Name" id="siteDisplayName" name="siteDisplayName" value={siteDisplayName} onChange={evt => setSiteDisplayName(evt.target.value)} disabled={disabled} ></input></div>
      <div><label htmlFor="siteHostName">Host Name:</label><input type="text" placeholder="New Site" id="siteHostName" name="siteHostName" value={siteHostName} onChange={evt => setSiteHostName(evt.target.value)} disabled={disabled} onKeyDown={(ev) => handleKeyDown(ev, submitAddSite, {siteName, siteDisplayName, siteHostName, setSiteName, setSiteDisplayName, setSiteHostName, setSites: props.setSites, setDisabled}, addSiteRef)} ></input></div>
      <div className="addSiteButtons">
        <button className="add" onClick={() => {
          submitAddSite({siteName, siteDisplayName, siteHostName, setSiteName, setSiteDisplayName, setSiteHostName, setSites: props.setSites, setDisabled}, addSiteRef);
        }} disabled={disabled} >Submit New Site</button>
        <button className="cancel"  onClick={() => {
          addSiteRef?.current?.close?.();
          setSiteName('');
          setSiteDisplayName('');
          setSiteHostName('');
        }} disabled={disabled} >Cancel</button>
      </div>
    </dialog>
    <select name="siteList" id="siteList" size="5">
      {props.activeSites.map( site => <option value={site.siteName} key={site.name}>{site.siteName}</option>)}
    </select>
    <div className="siteButtons">
      <button onClick={() => {addSiteRef?.current?.showModal?.() }}>Add New Site</button>
      <button>Delete Site</button>
    </div>
    </div>
    </div>;
}


export default SiteSetup;
