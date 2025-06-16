import {useEffect, useState, useRef} from 'react';
import './AdminWidget.css';
import {instance as US_instance} from '../svc/UserService';
import {instance as DS_instance} from '../svc/DataService';
import {instance as SS_instance} from '../svc/SettingsService';
import DrawerLink from '../DrawerLink';
import SliderInput from '../SliderInput';
import SiteSetup from './SiteSetup';
import UserSetup from './UserSetup';
import SiteSettings from './SiteSettings';
import {PropTypes} from "prop-types";


function userHasAdmin(siteName, roles) {
    return roles.filter(r => r === "ROLE_ADMIN" || r === "ROLE_ADMIN:" + siteName || r === "ROLE_USERADMIN").length > 0;
}

function userHasGlobalAdmin(roles) {
  return roles.filter(r => r === "ROLE_ADMIN").length > 0;
}

function userHasUserAdmin(roles) {
    return roles.filter(r => r === "ROLE_USERADMIN").length > 0;
}

function userHasSiteAdmin(roles, site) {
    if (userHasGlobalAdmin(roles)) {
        return true;
    }
    return roles.filter(r => r === "ROLE_ADMIN:" + site.name).length > 0;
}

function renderGlobalSettings(sites, setSites, globalSettings, setGlobalSettings, userData, visible, roles) {
    let enableSelfReg = !!globalSettings.enableSelfReg;
    let setEnableSelfReg = (t) => {
        let newSettings = {...globalSettings, enableSelfReg: t};
        setGlobalSettings(newSettings);
        SS_instance().updateSettings(newSettings);
    };
  let hasGlobalAdmin = userHasGlobalAdmin(roles);
  const className = visible ? "settingsBody" : "settingsBody hidden";
  return <div className={className} aria-label="SettingSiteBody"><h1>Global Settings</h1>
      {hasGlobalAdmin && <SiteSetup activeSites={sites} setSites={setSites}/>}
      <UserSetup sites={sites} userData={userData} hasGlobal={hasGlobalAdmin}/>
      <div className='clear'></div>
      {hasGlobalAdmin && <div className='enableSelfReg'><SliderInput label="Enable Self Registration" id="globalEnableSelfReg" value={enableSelfReg} setter={setEnableSelfReg}/></div>}
  </div>;
}

function renderDlgBody(tab, sites, setSites, globalSettings, setGlobalSettings, userData, roles) {
    return <div>
        {renderGlobalSettings(sites, setSites, globalSettings, setGlobalSettings, userData, tab === 'Global Settings', roles)}
    {sites.map(site => <SiteSettings key={site.name} siteDisplayName={site.siteName} siteName={site.name} siteSettings={site.settings} siteHostname={site.hostname} userData ={userData} visible={site.siteName === tab}/>)}</div>
}

function AdminDialog(props) {
 const [selectedTab, setSelectedTab] = useState(props.initData.selectedTab);
 let showSelectedTab = selectedTab;
 const [sites, setSites] = useState([]);
 const [users, setUsers] = useState([]);
 const [userMap, setUserMap] = useState({});
 let userData = {users, setUsers, userMap, setUserMap};
 const [globalSettings, setGlobalSettings] = useState({});
 let roles = props.initData.roles;
 const siteNames = sites.filter(site => userHasSiteAdmin(roles, site)).map(site => site.siteName);
 let tabList =  userHasGlobalAdmin(roles) || userHasUserAdmin(roles) ? ["Global Settings", ...siteNames] : siteNames;
 if (! tabList.includes(selectedTab) && tabList.length > 0) {
  showSelectedTab = tabList[0];
 }
 useEffect( () => {
    DS_instance().getSites().then(sites => {
      setSites(sites);
    });
    setGlobalSettings(SS_instance().getSettings());
    SS_instance().addListener({setSettings: setGlobalSettings })
 }, []);
 useEffect( () => {
    DS_instance().getUsers().then(users => {
        setUsers(users.map(user => user.userName));
        let newUserMap = {};
        for (let user of users) {
            newUserMap[user.userName] = user;
        }
        setUserMap(newUserMap);
    });}, []);
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
            className = tab === showSelectedTab ? className + " selectedTab" : className;
            return <button key={tab} className={className} onClick={() => setSelectedTab(tab)}>{tab}</button>
          })}
       </div>
         {renderDlgBody(showSelectedTab, sites, setSites, globalSettings, setGlobalSettings, userData, roles)}
    </dialog>
    </div>);
}

AdminDialog.propTypes = {initData: PropTypes.object, doClose: PropTypes.func};


function AdminWidget() {
  const [ ,setUserName] = useState(null);
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
