import {useEffect, useState, useRef} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './UserSetup.css';
import {PropTypes} from "prop-types";

const DEF_ROLE='ROLE_';
  
function handleKeyDown(ev, submit, data,close)
{
    if (ev.key === "Enter")
    {
      ev.stopPropagation();
      ev.preventDefault();
      submit(data, close);
    }
}

function submitAddRole(data, close) {
        data.setDisabled(true);
        DS_instance().addRole(data.selectedUser, data.newRole).then((changedUser) => {
          data.setDisabled(false);
          data.setNewRole(DEF_ROLE);
          data.userMap[changedUser.userName] = changedUser;
          data.setUserMap(data.userMap);
          close?.();
        }).catch((ev) => {console.log(ev); data.setDisabled(false)});
}

function submitAddUser(data, close) {
  if (data.password !== data.confirmPassword) {
    data.setErrMsg("Password confirmation does not match. Please correct");
    return;
  }
  data.setErrMsg('');
  data.setDisabled(true);
  DS_instance().addUser(data.userName, data.password).then((newUser) => {
    data.setDisabled(false);
    data.setNewUserName('');
    data.setPassword('');
    data.setConfirmPassword('');
    data.userMap[newUser.userName] = newUser;
    data.setUserMap(data.userMap);
    data.activeUsers.push(newUser.userName);
    data.setActiveUsers(data.activeUsers);
    close();
  }).catch((ev) => {console.log(ev); data.setDisabled(false); data.setErrMsg('Add User Failed');});
}

function submitResetPassword(data, close) {
  if (data.password !== data.confirmPassword) {
    data.setErrMsg("Password confirmation does not match. Please correct");
    return;
  }
  data.setErrMsg('');
  data.setDisabled(true);
  DS_instance().setUserPassword(data.userName, data.password).then(() => {
    data.setDisabled(false);
    data.setNewUserName('');
    data.setPassword('');
    data.setConfirmPassword('');
    close();
  }).catch((ev) => {console.log(ev); data.setDisabled(false); data.setErrMsg('Set Password Failed');});
}

function AddRoleDlg(props) {
    const selectedUser = props.user;
    const userMap = props.userMap.userMap;
    const setUserMap = props.userMap.setUserMap;
    const dlgRef = props.addRoleDlgRef;
    const addRoleMode = props.addRoleMode;
    const [newRole, setNewRole] = useState(DEF_ROLE);
    const [disabled, setDisabled] = useState(false);
    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [selectedSite, setSelectedSite] = useState(props.sites.length> 0 ? props.sites[0].name : "");
    const close = props.close;
    if (addRoleMode === "admin") {
      const adminRole = globalAdmin ? "ROLE_ADMIN": "ROLE_ADMIN:" + selectedSite;
      return (<dialog className="addRoleDialog" ref={dlgRef}>
        <div><input type="checkbox" id="globalAdmin"  onClick={ () => setGlobalAdmin(!globalAdmin)} checked={globalAdmin}></input>
          <label htmlFor="globalAdmin">Global Admin</label>
        </div>
        {!globalAdmin &&
        <div>
          <div> <label htmlFor="adminSiteSelect">Site for admin role:</label></div>
          <select id="adminSiteSelect" onChange={(ev) =>
              setSelectedSite(ev.target.value)} value={selectedSite}>
            {props.sites.map( site => <option value={site.name} key={site.name}>{site.siteName}</option>)}
        </select>
        </div>}
        <div className="addRoleButtons">
          <button className="cancel" onClick={() => {
            close?.();
            setGlobalAdmin(false);
            setSelectedSite(props.sites[0].name);
          }} disabled={disabled}>Cancel
          </button>
          <button className="add" onClick={() => {
            submitAddRole({selectedUser, newRole:adminRole, userMap, setUserMap, setDisabled, setNewRole}, close);
            setGlobalAdmin(false);
            setSelectedSite(props.sites[0].name);
          }} disabled={disabled}>Submit New Role
          </button>
        </div>
      </dialog>)
    }
    return (<dialog className="addRoleDialog" ref={dlgRef}>
      <input type="text" style={{display: "none"}}></input>
      <input type="password" style={{display: "none"}}></input>
      <div><label htmlFor="roleName">New Role:</label>
      <input type="text" placeholder="New Role" id="roleName"
          name="roleName" value={newRole}
          onChange={evt => setNewRole(evt.target.value)}
          onKeyDown={evt => handleKeyDown(evt, submitAddRole, {
            selectedUser,
            newRole,
            userMap,
            setUserMap,
            setDisabled,
            setNewRole
          }, close)} disabled={disabled} autoComplete="off"
          autoFocus></input></div>
      <div className="addRoleButtons">
        <button className="cancel" onClick={() => {
          close?.();
          setNewRole(DEF_ROLE);
        }} disabled={disabled}>Cancel
        </button>
        <button className="add" onClick={() => {
          submitAddRole({selectedUser, newRole, userMap, setUserMap, setDisabled, setNewRole}, close);
          setNewRole(DEF_ROLE);
        }} disabled={disabled}>Submit New Role
        </button>
      </div>
    </dialog>);
}

AddRoleDlg.propTypes = {
  user: PropTypes.string,
  userMap: PropTypes.object,
  sites: PropTypes.array,
  close: PropTypes.func,
  addRoleDlgRef: PropTypes.object,
  addRoleMode: PropTypes.string};

function AddUserDlg(props) {
  //function renderAddUser(currentUser, userMap, setUserMap, activeUsers, setActiveUsers, dlgRef, isResetPassword) {
    const [newUserName, setNewUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const submitFnc = props.isResetPassword ? submitResetPassword : submitAddUser;
    const title = props.isResetPassword ? "Reset Password for " + props.currentUser : "Add New User";
    const submitBtnText = props.isResetPassword ? "Set Password" : "Submit New User";
    let userName = props.isResetPassword ? props.currentUser : newUserName;
    const submitData = {userName, password, confirmPassword, userMap:props.userMap.userMap, activeUsers:props.activeUsers.activeUsers, setUserMap:props.userMap.setUserMap, setDisabled, setNewUserName, setPassword, setConfirmPassword, setErrMsg, setActiveUsers:props.activeUsers.setActiveUsers};
    return (<dialog className="addUserDialog" ref={props.dlgRef} >
      <h3 className="title">{title}</h3>
      {props.isResetPassword || <div><label htmlFor="username" >New User:</label><input type="text" placeholder="Username" id="username" name="username" value={newUserName}  onChange={evt => setNewUserName(evt.target.value)} disabled= {disabled} autoFocus autoComplete="new-password" ></input></div>}
      {props.isResetPassword || <div><label htmlFor="password" >Password:</label><input type="password" placeholder="Password" id="password" name="password" value={password}  onChange={evt => setPassword(evt.target.value)}  autoComplete="new-password" disabled= {disabled}  ></input></div>}
      {props.isResetPassword && <div><label htmlFor="password" >Password:</label><input type="password" placeholder="Password" id="password" name="password" value={password}  onChange={evt => setPassword(evt.target.value)}  autoComplete="new-password" autoFocus disabled= {disabled}  ></input></div>}
      <div><label htmlFor="confirmPassword" >Confirm Password:</label><input type="password" placeholder="Confirm Password" id="confirmPassword" name="confirmPassword" value={confirmPassword}  onChange={evt => setConfirmPassword(evt.target.value)} onKeyDown={evt => handleKeyDown(evt, submitFnc, submitData, props.close)} autoComplete="new-password" disabled= {disabled} ></input></div>
    <div className="addUserButtons">
    <button className="add" onClick={() => {
        submitFnc(submitData, props.close);
      }} disabled={disabled} >{submitBtnText}</button>
      <button className="cancel"  onClick={() => {
        props.close();
        setNewUserName('');
        setPassword('');
        setConfirmPassword('');
        setErrMsg('');
      }} disabled={disabled} >Cancel</button>
      </div>
      <div className="AddUserError">{errMsg}</div>
    </dialog>);
  }

AddUserDlg.propTypes = {currentUser: PropTypes.string, userMap: PropTypes.object, activeUsers: PropTypes.object, dlgRef: PropTypes.object, close:PropTypes.function, isResetPassword:PropTypes.boolean};

function renderDeleteConfirm(userName, activeUsers, setActiveUsers, dlgRef) {
  const [disabled, setDisabled] = useState(false);
  const title = "Really delete user: " + userName;
  return (<dialog className="confirmDeleteDialog" ref={dlgRef} >
  <h3 className="title">{title}</h3>
<div className="confirmDeleteButtons">
<button className="cancel"  onClick={() => {
    dlgRef?.current?.close?.();
    setDisabled(false);
  }} disabled={disabled} >Cancel</button>
<button className="delete" onClick={() => {
  setDisabled(true);
  DS_instance().deleteUser(userName).then(() => {
   setDisabled(false);
   const index = activeUsers.indexOf(userName);
   activeUsers.splice(index, 1);
   setActiveUsers(activeUsers);
   dlgRef?.current?.close?.();
  })}} disabled={disabled} >Delete</button>
  </div>
</dialog>);
}

function UserSetup(props) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [selectedRole, setSelectedRole] = useState(undefined);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [addRoleMode, setAddRoleMode] = useState("free");
  const addRoleDlgRef = useRef(); 
  const addUserDlgRef = useRef(); 
  const confirmDelDlgRef = useRef();
  useEffect( () => {
    DS_instance().getUsers().then(users => {
      setActiveUsers(users.map(user => user.userName));
      let newUserMap = {};
      for (let user of users) {
        newUserMap[user.userName] = user;
      }
      setUserMap(newUserMap);
    });
  }, []);
  return <div className="userSetup">
    <div className="selectWidget">
      <label htmlFor="userList" >Users</label>
      <AddRoleDlg user={selectedUser} userMap={{userMap, setUserMap}} addRoleMode={addRoleMode} addRoleDlgRef={addRoleDlgRef} close= {() => {
        addRoleDlgRef?.current?.close?.();
        setUserMap({...userMap});
      }} sites={props.sites} ></AddRoleDlg>
      <AddUserDlg currentUser= {selectedUser} userMap={{userMap: userMap, setUserMap: setUserMap}} activeUsers= {{activeUsers, setActiveUsers}} dlgRef={addUserDlgRef} isResetPassword={isResetPassword}  close= {() => {
        addUserDlgRef?.current?.close?.();
        setUserMap({...userMap});
      }} sites={props.sites}></AddUserDlg>
      {renderDeleteConfirm(selectedUser, activeUsers, setActiveUsers, confirmDelDlgRef)}
      <div>
        <select name="userList" id="userList" data-testid="userList" size="5" onChange={(ev) => {
          setSelectedUser(ev.target.value);
          setSelectedRole('');}}
          value={selectedUser}>
          {activeUsers.map( user => <option value={user} key={user}>{user}</option>)}
        </select>
      <div className="userButtons">
        <button onClick={() => {setIsResetPassword(false); addUserDlgRef?.current?.showModal?.()}}>Create User</button>
        <button onClick={() => {setIsResetPassword(true); addUserDlgRef?.current?.showModal?.()}}>Reset User Password</button>
        <button onClick={() => {confirmDelDlgRef?.current?.showModal?.()}}>Delete User</button>
      </div>
    </div></div>
    { selectedUser && (<div className="selectWidget">
      <label htmlFor="roleList">{selectedUser + " Roles"}</label>
      <div>
        <select name="roleList" id="roleList" data-testid="roleList" size="5" onChange={(ev) => setSelectedRole(ev.target.value)} value={selectedRole}>
        {userMap[selectedUser].userRoles.map( role => <option value={role} key={role}>{role}</option>)}
        </select>
        <div className="roleButtons">
          <button onClick={() => {
            setAddRoleMode("free");
            addRoleDlgRef?.current?.showModal?.();
          }}>Add Role
          </button>
          <button onClick={() => {
            setAddRoleMode("admin");
            addRoleDlgRef?.current?.showModal?.();
          }}>Add Admin Role
          </button>
          <button onClick={(ev) =>
              DS_instance().deleteRole(selectedUser, selectedRole).then(changedUser => {
                let newMap = {...userMap};
                newMap[changedUser.userName] = changedUser;
                setUserMap(newMap);
              }).catch(ev => console.log(ev))
          }>Remove Role
          </button>
        </div>
      </div>
    </div>)}
  </div>;
}

UserSetup.propTypes = {sites: PropTypes.array}

export default UserSetup;
