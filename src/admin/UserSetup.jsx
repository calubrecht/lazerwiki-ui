import React, {useEffect, useState, useRef} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './UserSetup.css';

const DEF_ROLE='ROLE_';
  
function handleKeyDown(ev, submit, data,dlgRef)
{
    if (ev.key === "Enter")
    {
      ev.stopPropagation();
      ev.preventDefault();
      submit(data, dlgRef);
    }
}

function submitAddRole(data, dlgRef) {
        data.setDisabled(true);
        DS_instance().addRole(data.selectedUser, data.newRole).then((changedUser) => {
          data.setDisabled(false);
          data.setNewRole(DEF_ROLE);
          data.userMap[changedUser.userName] = changedUser;
          data.setUserMap(data.userMap);
          dlgRef?.current?.close?.();
        }).catch((ev) => {console.log(ev); data.setDisabled(false)});
}

function submitAddUser(data, dlgRef) {
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
    dlgRef?.current?.close?.();
  }).catch((ev) => {console.log(ev); data.setDisabled(false); data.setErrMsg('Add User Failed');});
}

function submitResetPassword(data, dlgRef) {
  if (data.password !== data.confirmPassword) {
    data.setErrMsg("Password confirmation does not match. Please correct");
    return;
  }
  data.setErrMsg('');
  data.setDisabled(true);
  DS_instance().setUserPassword(data.userName, data.password).then((newUser) => {
    data.setDisabled(false);
    data.setNewUserName('');
    data.setPassword('');
    data.setConfirmPassword('');
    data.userMap[newUser.userName] = newUser;
    data.setUserMap(data.userMap);
    dlgRef?.current?.close?.();
  }).catch((ev) => {console.log(ev); data.setDisabled(false); data.setErrMsg('Add User Failed');});
}

function renderAddRole(selectedUser, userMap, setUserMap, dlgRef) {
    const [newRole, setNewRole] = useState(DEF_ROLE);
    const [disabled, setDisabled] = useState(false);
    return (<dialog className="addRoleDialog" ref={dlgRef} >
      <div><label htmlFor="roleName" >New Role:</label><input type="text" placeholder="New Role" id="roleName" name="roleName" value={newRole}  onChange={evt => setNewRole(evt.target.value)} onKeyDown={evt => handleKeyDown(evt, submitAddRole, {selectedUser, newRole, userMap, setUserMap, setDisabled, setNewRole}, dlgRef)} disabled= {disabled} autoFocus ></input></div>
    <div className="addRoleButtons">
      <button className="cancel"  onClick={() => {
        dlgRef?.current?.close?.();
        setNewRole(DEF_ROLE);
      }} disabled={disabled} >Cancel</button>
      <button className="add" onClick={() => {
        submitAddRole({selectedUser, newRole, userMap, setUserMap, setDisabled, setNewRole}, dlgRef);
      }} disabled={disabled} >Submit New Role</button>
      </div>
    </dialog>);
  }

  function renderAddUser(currentUser, userMap, setUserMap, activeUsers, setActiveUsers, dlgRef, isResetPassword) {
    const [newUserName, setNewUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const submitFnc = isResetPassword ? submitResetPassword : submitAddUser;
    const title = isResetPassword ? "Reset Password for " + currentUser : "Add New User";
    let userName = isResetPassword ? currentUser : newUserName;
    const submitData = {userName, password, confirmPassword, userMap, activeUsers, setUserMap, setDisabled, setNewUserName, setPassword, setConfirmPassword, setErrMsg, setActiveUsers};
    return (<dialog className="addUserDialog" ref={dlgRef} >
      <h3 className="title">{title}</h3>
      {isResetPassword || <div><label htmlFor="username" >New User:</label><input type="text" placeholder="Username" id="username" name="username" value={newUserName}  onChange={evt => setNewUserName(evt.target.value)} disabled= {disabled} autoFocus autoComplete="false"></input></div>}
      <div><label htmlFor="password" >Password:</label><input type="password" placeholder="Password" id="password" name="password" value={password}  onChange={evt => setPassword(evt.target.value)} disabled= {disabled}  ></input></div>
      <div><label htmlFor="confirmPassword" >Confirm Password:</label><input type="password" placeholder="Confirm Password" id="confirmPassword" name="confirmPassword" value={confirmPassword}  onChange={evt => setConfirmPassword(evt.target.value)} onKeyDown={evt => handleKeyDown(evt, submitFnc, submitData, dlgRef)} disabled= {disabled} ></input></div>
    <div className="addUserButtons">
    <button className="add" onClick={() => {
        submitFnc(submitData, dlgRef);
      }} disabled={disabled} >Submit New User</button>
      <button className="cancel"  onClick={() => {
        dlgRef?.current?.close?.();
        setNewUserName('');
        setPassword('');
        setConfirmPassword('');
        setErrMsg('');
      }} disabled={disabled} >Cancel</button>
      </div>
      <div className="AddUserError">{errMsg}</div>
    </dialog>);
  }  

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
  DS_instance().deleteUser(userName).then((newUser) => {
   setDisabled(false);
   data.setNewUserName('');
   data.setPassword('');
   data.setConfirmPassword('');
   data.userMap[newUser.userName] = newUser;
   data.setUserMap(userMap);
   dlgRef?.current?.close?.();
  })}} disabled={disabled} >Delete</button>
  </div>
</dialog>);
}

function UserSetup() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [selectedRole, setSelectedRole] = useState(undefined);
  const [isResetPassword, setIsResetPassword] = useState(false);
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
      {renderAddRole(selectedUser, userMap, setUserMap, addRoleDlgRef)}
      {renderAddUser(selectedUser, userMap, setUserMap, activeUsers, setActiveUsers, addUserDlgRef, isResetPassword)}
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
          <button onClick={() => {addRoleDlgRef?.current?.showModal?.()}} >Add Role</button>
          <button onClick={(ev) =>
            DS_instance().deleteRole(selectedUser, selectedRole).
            then(changedUser => {
              let newMap= {...userMap};
              newMap[changedUser.userName] = changedUser;
              setUserMap(newMap);
            }).
            catch(ev => console.log(ev))
          }>Remove Role</button>
        </div>
      </div>
      </div>)}
    </div>;
}


export default UserSetup;
