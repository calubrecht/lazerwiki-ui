import React, {useEffect, useState} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './UserSetup.css';

function loadUsers(setActiveUsers, setUserMap) {
  
}

function UserSetup() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [selectedRole, setSelectedRole] = useState(undefined);
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
      <div>
        <select name="userList" id="userList" data-testid="userList" size="5" onChange={(ev) => {
          setSelectedUser(ev.target.value);
          setSelectedRole(undefined);}}
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
          <button>Add Role</button>
          <button>Remove Role</button>
        </div>
      </div>
      </div>)}
    </div>;
}


export default UserSetup;
