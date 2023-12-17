import React, {useEffect, useState} from 'react';
import './App.css';
import {instance as US_instance} from './svc/UserService';
import LoginFrame from './LoginFrame';


function userHasAdmin(siteName, roles) {
    return roles.filter(r => r === "ROLE_ADMIN" || r === "ROLE_ADMIN:" + siteName).length > 0;
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
  return (
    <div className={userIsAdmin ? "AdminWidget" : "AdminWidget hidden"}>
      { userIsAdmin && "admin" }
    </div>
  );
}

export default AdminWidget;
