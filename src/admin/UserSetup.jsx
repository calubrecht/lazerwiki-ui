import React, {useEffect, useState} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './UserSetup.css';

function UserSetup() {
  const [activeUsers, setActiveUsers] = useState([]);
  useEffect( () => {
    DS_instance().getUsers().then(users => {
      setActiveUsers(users);
    });
  }, []);
  return <div className="userSetup">
    <label htmlFor="userList" >Users</label>
    <div>
    <select name="userList" id="userList" size="5">
      {activeUsers.map( user => <option value={user} key={user}>{user}</option>)}
    </select>
    <div className="userButtons">
      <button>Create User</button>
      <button>Reset User Password</button>
      <button>Delete User</button>
    </div>
    </div>
    </div>;
}


export default UserSetup;
