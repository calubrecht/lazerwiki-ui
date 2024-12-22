import React, {useEffect, useState, useRef} from 'react';
import './AdminWidget.css';
import {instance as US_instance} from '../svc/UserService';
import {instance as DS_instance} from '../svc/DataService';
import DrawerLink from '../DrawerLink';
import SiteSetup from './SiteSetup';
import UserSetup from './UserSetup';
import SiteSettings from './SiteSettings';


function userHasAdmin(siteName, roles) {
    return roles.filter(r => r === "ROLE_ADMIN" || r === "ROLE_ADMIN:" + siteName).length > 0;
}

function userHasGlobalAdmin(roles) {
  return roles.filter(r => r === "ROLE_ADMIN").length > 0;
}

function renderGlobalSettings(sites, setSites, visible) {
  const className = visible ? "settingsBody" : "settingsBody hidden";
  return <div className={className} aria-label="SettingSiteBody" ><h1>Global Settings</h1>
      <SiteSetup activeSites={sites} setSites={setSites}/>
      <UserSetup />
    </div>;
}

function renderDlgBody(tab, sites, setSites) {
 return <div>
    {renderGlobalSettings(sites, setSites, tab === 'Global Settings')}
    {sites.map(site => <SiteSettings key={site.name} siteDisplayName={site.siteName} siteName={site.name} siteSettings={site.settings} siteHostname={site.hostname} visible={site.siteName === tab}/>)}</div>
}

function AdminDialog(props) {
 const [selectedTab, setSelectedTab] = useState(props.initData.selectedTab);
 let showSelectedTab = selectedTab;
 const [sites, setSites] = useState([]);
 const siteNames = sites.map(site => site.siteName);
 let tabList =  userHasGlobalAdmin(props.initData.roles) ? ["Global Settings", ...siteNames] : siteNames;
 if (! tabList.includes(selectedTab) && tabList.length > 0) {
  showSelectedTab = tabList[0];
 }
 useEffect( () => {
    DS_instance().getSites().then(sites => {
      setSites(sites);
    });
 }, []);
 const dlgRef = useRef();
 useEffect(() => {
  dlgRef.current?.showModal?.();
 }, [])
 return (<div><dialog className="AdminDialog" ref={dlgRef}>
       <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
       <div id="adminSidebar" aria-label="SettingSiteTabs">
          <label>Site Settings</label>
          {tabList.map(tab => {
            let className = "settingsTabBtn button-unstyled";
            className = tab == showSelectedTab ? className + " selectedTab" : className;
            return <button key={tab} className={className} onClick={() => setSelectedTab(tab)}>{tab}</button>
          })}
       </div>
         {renderDlgBody(showSelectedTab, sites, setSites)}
    </dialog>
    </div>);
}


function AdminWidget() {
  const [userName, setUserName] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  let u = US_instance().getUser();

  useEffect( () => {
    setUserName(u ? u.userName : null);
    setUserIsAdmin(u ? userHasAdmin(u.siteName, u.userRoles) : false);
    setUserName(US_instance().getUser());
    US_instance().addListener({setUser: (user) => {
      setUserName(user ? user.userName : null);
      setUserIsAdmin(user ? userHasAdmin(user.siteName, user.userRoles) : false);
    }});
  }, []);
  return (userIsAdmin? <DrawerLink extraClasses="AdminWidget" title="admin" component={AdminDialog} initData={{selectedTab:"Global Settings", roles: u.userRoles}}/> : "");
}

export default AdminWidget;
