import React, {useEffect, useState} from 'react';
import './AdminWidget.css';
import {instance as US_instance} from '../svc/UserService';
import DrawerLink from '../DrawerLink';
import SiteSetup from './SiteSetup';
import UserSetup from './UserSetup';


function userHasAdmin(siteName, roles) {
    return roles.filter(r => r === "ROLE_ADMIN" || r === "ROLE_ADMIN:" + siteName).length > 0;
}

function renderGlobalSettings() {
  return <div className="settingsBody" aria-label="SettingSiteBody" ><h1>Global Settings</h1>
      <SiteSetup activeSites={["Site1", "Site2"]} />
      <UserSetup />
    </div>;
}

function renderDlgBody(tab) {
  if (tab === 'Global Settings') {
    return renderGlobalSettings();
  }
  return <div className="settingsBody" aria-label="SettingSiteBody">  <h1>Settings for - {tab}</h1></div>;
}

function AdminDialog(props) {
 const [selectedTab, setSelectedTab] = useState(props.initData.selectedTab);
 let tabList = ["Global Settings", "Site 1", "Site 2"];
 return (<div><dialog className="AdminDialog" open>
       <button onClick={() => props.doClose()} className="close button-unstyled">X</button>
       <div id="adminSidebar" aria-label="SettingSiteTabs">
          <label>Site Settings</label>
          {tabList.map(tab => {
            let className = "settingsTabBtn button-unstyled";
            className = tab == selectedTab ? className + " selectedTab" : className;
            return <button key={tab} className={className} onClick={() => setSelectedTab(tab)}>{tab}</button>
          })}
       </div>
       {renderDlgBody(selectedTab)}
    </dialog>
    <dialog className="AdminDialogBackdrop" open/>
    </div>);
}


function AdminWidget() {
  const [userName, setUserName] = useState(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  useEffect( () => {
    let u = US_instance().getUser();
    setUserName(u ? u.userName : null);
    setUserIsAdmin(u ? userHasAdmin(u.siteName, u.userRoles) : false);
    setUserName(US_instance().getUser());
    US_instance().addListener({setUser: (user) => {
      setUserName(user ? user.userName : null);
      setUserIsAdmin(user ? userHasAdmin(user.siteName, user.userRoles) : false);
    }});
  }, []);
  return (userIsAdmin? <DrawerLink extraClasses="AdminWidget" title="admin" component={AdminDialog} initData={{selectedTab:"Global Settings"}}/> : "");
}

export default AdminWidget;
