import React, {useEffect, useState} from 'react';
import './SiteSetup.css';

function SiteSetup(props) {
  return <div className="siteSetup">
    <label htmlFor="siteList" >Available Sites</label>
    <div>
    <select name="siteList" id="siteList" size="5">
      {props.activeSites.map( site => <option value={site} key={site}>{site}</option>)}
    </select>
    <div className="siteButtons">
      <button>Add New Site</button>
      <button>Delete Site</button>
    </div>
    </div>
    </div>;
}


export default SiteSetup;
