import React, {useEffect, useState, useRef} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './UserSetup.css';

const DEF_ROLE='ROLE_';
  
function handleKeyDown(ev, submit, userName, role, userMap, setUserMap, setDisabled, setNewRole,dlgRef)
{
    if (ev.key === "Enter")
    {
      ev.stopPropagation();
      ev.preventDefault();
      submit(userName, role, userMap, setUserMap, setDisabled, setNewRole, dlgRef);
    }
}

function submitAddRole(selectedUser, newRole, userMap,setUserMap, setDisabled, setNewRole, dlgRef) {
        setDisabled(true);
        DS_instance().addRole(selectedUser, newRole).then((changedUser) => {
          setDisabled(false);
          setNewRole(DEF_ROLE);
          userMap[changedUser.userName] = changedUser;
          setUserMap(userMap);
          dlgRef?.current?.close?.();
        }).catch((ev) => {console.log(ev); setDisabled(false)});
}
function renderAddRole(selectedUser, userMap, setUserMap, dlgRef) {
    const [newRole, setNewRole] = useState(DEF_ROLE);
    const [disabled, setDisabled] = useState(false);
    return (<dialog className="addRoleDialog" ref={dlgRef} >
      <div><label htmlFor="roleName" >New Role:</label><input type="text" placeholder="New Role" name="roleName" value={newRole}  onChange={evt => setNewRole(evt.target.value)} onKeyDown={evt => handleKeyDown(evt, submitAddRole, selectedUser, newRole, userMap, setUserMap, setDisabled, setNewRole, dlgRef)} disabled= {disabled}  ></input></div>
    <div className="addRoleButtons">
      <button className="cancel"  autoFocus onClick={() => {
        dlgRef?.current?.close?.();
        setNewRole(DEF_ROLE);
      }} disabled={disabled} >Cancel</button>
      <button className="add" onClick={() => {
        submitAddRole(selectedUser, newRole, userMap, setUserMap, setDisabled, setNewRole, dlgRef);
      }} disabled={disabled} > Add Role</button>
      </div>
    </dialog>);
  }

function UserSetup() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [selectedRole, setSelectedRole] = useState(undefined);
  const dlgRef = useRef(); 
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
      {renderAddRole(selectedUser, userMap, setUserMap, dlgRef)}
      <div>
        <select name="userList" id="userList" data-testid="userList" size="5" onChange={(ev) => {
          setSelectedUser(ev.target.value);
          setSelectedRole('');}}
          value={selectedUser}>
          {activeUsers.map( user => <option value={user} key={user}>{user}</option>)}
        </select>
      <div className="userButtons">
        <button>Create User</button>
        <button>Reset User Password</button>
        <button>Delete User</button>
      </div>
    </div></div>
    { selectedUser && (<div className="selectWidget">
      <label htmlFor="roleList">{selectedUser + " Roles"}</label>
      <div>
        <select name="roleList" id="roleList" data-testid="roleList" size="5" onChange={(ev) => setSelectedRole(ev.target.value)} value={selectedRole}>
        {userMap[selectedUser].userRoles.map( role => <option value={role} key={role}>{role}</option>)}
        </select>
        <div className="roleButtons">
          <button onClick={() => {dlgRef?.current?.showModal?.()}} >Add Role</button>
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
