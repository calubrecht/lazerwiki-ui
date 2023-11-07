import React, {useEffect, useState} from 'react';
import './App.css';
import {instance as DS_instance} from './svc/DataService';
import {instance as US_instance} from './svc/UserService';
import LoginFrame from './LoginFrame';


function logout() {
    DS_instance().logout().then(() => US_instance().setUser(null));
}

function UserWidget() {
  const [initted, setInitted] = useState(false);
  const [userName, setUserName] = useState(null);
  useEffect( () => {
    US_instance().addListener({setUser: (user) => user && setUserName(user.user)});
    DS_instance().getUser().then(user => {
       setInitted(true);
       setUserName(user.user);
       US_instance().setUser(user);
    }).
    catch((e) => {
      if (e.message == 403) {
        console.log("Not logged in. Reset login state");
        US_instance().setUser(null);
        setInitted(true);
        setUserName(null);
        return;
      }
      console.log("Other user error " + e);

      });
  }, []);
  return (
    <div className="UserWidget">
      {
        initted ? ( 
          userName ? (
             <div><span>Hi, {userName}</span> <span className="logout" onClick={logout}>LogOut</span></div>
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
