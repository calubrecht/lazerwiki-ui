import React, {useEffect, useState} from 'react';
import './App.css';
import {instance as DS_instance, FOUR_O_THREE} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';
import LoginFrame from './LoginFrame';


function logout() {
    DS_instance().logout().then(() => US_instance().setUser(null)).catch((e) => {
      US_instance().setUser(null);
      console.error(e);});
}

function UserWidget() {
  const [initted, setInitted] = useState(false);
  const [userName, setUserName] = useState(null);
  useEffect( () => {
    US_instance().addListener({setUser: (user) => {
      setUserName(user ? user.userName : null);
    }});
    DS_instance().getUser().then(user => {
       setInitted(true);
       setUserName(user.userName);
       US_instance().setUser(user);
    }).
    catch((e) => {
      if (e.message == FOUR_O_THREE) {
        console.log("Not logged in. Reset login state");
        US_instance().setUser(null);
        setInitted(true);
        setUserName(null);
        return;
      }
      console.log("Other user error: " + e.message);

      });
  }, []);
  return (
    <div className="UserWidget">
      {
        initted ? (
          userName ? (
             <div><span>Hi, {userName}</span> <button className="logout button-unstyled" onClick={logout}>LogOut</button></div>
          ) :
             <div>
               <div><span>Hi, Guest</span></div>
               <LoginFrame/>
             </div>
        ) :
        <span>Loading, please wait</span>
      }
    </div>
  );
}

export default UserWidget;
