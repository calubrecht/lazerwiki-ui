import {useEffect, useState} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './ACLWidget.css';
import NsTree from '../NsTree';
import {PropTypes} from "prop-types";

function parseNamespaces(namespaces, parsedNamespaces) {
    parsedNamespaces[namespaces.fullNamespace] = namespaces;
    for (const namespace of namespaces.children) {
        parseNamespaces(namespace, parsedNamespaces);
    }
}

function updateNamespaces(namespaces, setNamespaces, setParsedNamespaces, setEnabled) {
    setNamespaces(namespaces.namespaces);
    const parsedNamespaces = {};
    parseNamespaces(namespaces.namespaces, parsedNamespaces);
    setParsedNamespaces(parsedNamespaces);
    setEnabled(true);
}

function fetchNamespaces(site, setNamespaces, setParsedNamespaces, setEnabled) {
    setEnabled(false);
    DS_instance().fetchNamespaces(site).then( (namespaces) => {
        updateNamespaces(namespaces, setNamespaces, setParsedNamespaces, setEnabled);
    });
}

function setNSaccess(site, namespace, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev) {
    setEnabled(false);
    let restrictionType = ev.target.value;
    parsedNamespaces[namespace].restriction_type = restrictionType;
    setParsedNamespaces({...parsedNamespaces});
    DS_instance().setNamespaceRestriction(site, namespace, restrictionType).then( (namespaces) => {
        updateNamespaces(namespaces, setNamespaces, setParsedNamespaces, setEnabled);
    });
}

function getSiteRoles(site, namespace, user) {
    return user.userRoles.filter(userRole => {
       let parts = userRole.split(":");
       if (parts.length !== 3) {
           return false;
       }
       return !(parts[1] !== site || parts[2] !== namespace);

   }).map(userRole => {
       return userRole.split(":")[0].split("_")[1];
   });
}

function setSelectedRoles(site, selectedNs, selectedUser, target, userMap, setUserMap, setEnabled) {
    let user = userMap[selectedUser];
    let selectedRoles = [];
    for (let i = 0 ; i < target.selectedOptions.length; i++) {
        let option = target.selectedOptions[i];
        selectedRoles.push("ROLE_" + option.value + ":" + site +":" + selectedNs);
    }
    // get userRoles not related to this site and ns
    user.userRoles.filter(userRole => {
        let parts = userRole.split(":");
        if (parts.length !== 3) {
            return true;
        }
        return parts[1] !== site || parts[2] !== selectedNs;

    }).forEach( userRole => {
          selectedRoles.push(userRole);
        }
    );
    user.userRoles = selectedRoles;
    let siteRoles = selectedRoles.filter(userRole => {
        let parts = userRole.split(":");
        if (parts.length !== 3) {
            return false;
        }
        return parts[1] === site;

    })
    setUserMap({...userMap});
    setEnabled(false);
    // Do network stuff
    DS_instance().setRoles(selectedUser, site, siteRoles).then((changedUser) => {
        userMap[changedUser.userName] = changedUser;
        setUserMap({...userMap});
        setEnabled(true);
    }).catch((ev) => {console.log(ev); setEnabled(true)});
}

export default function ACLWidget(props) {
    const [namespaces, setNamespaces] = useState({});
    const [parsedNamespaces, setParsedNamespaces] = useState({});
    const [selectedNs, setSelectedNs] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [selectedUser, setSelectedUser] = useState("");

    let userRoles = !selectedUser ? [] :  getSiteRoles(props.site, selectedNs, props.userMap[selectedUser]);

    useEffect( () => {
        fetchNamespaces(props.site, setNamespaces, setParsedNamespaces, setEnabled);

    }, []);

    const nsAccessType = selectedNs in parsedNamespaces ? parsedNamespaces[selectedNs].restriction_type : "OPEN";
    const inheritAccessType = selectedNs in parsedNamespaces ? parsedNamespaces[selectedNs].inherited_restriction_type : "OPEN";
    let roleEnable = enabled &&  !(nsAccessType === "OPEN" || nsAccessType === "INHERIT" && inheritAccessType === "OPEN");

  return <div className="aclWidget">
      <h2>Access Control</h2>
      <div className="nsTree"><NsTree nsTree={namespaces}  selectNS = {setSelectedNs}></NsTree>
      </div>
      <div className="aclPanel">
          <label>Set Controls for : {selectedNs}</label>
          <div className="controlRadios">
              <div><input type="radio" name={"controlType_" + props.site} value="INHERIT"
                          id={"accessInherit_" + props.site} onChange={ev => {
                  setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)
              }} checked={nsAccessType === "INHERIT"} disabled={!enabled}/><label
                  htmlFor={"accessInherit_" + props.site}>
                  Inherit ({inheritAccessType})</label></div>
              <div><input type="radio" name={"controlType_" + props.site} value="OPEN" id={"accessOpen_" + props.site}
                          onChange={ev => {
                              setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)
                          }} checked={nsAccessType === "OPEN"} disabled={!enabled}/><label
                  htmlFor={"accessOpen_" + props.site}>Open
                  Access</label></div>
              <div><input type="radio" name={"controlType_" + props.site} value="WRITE_RESTRICTED"
                          id={"writeRestrict_" + props.site} onChange={ev => {
                  setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)
              }} checked={nsAccessType === "WRITE_RESTRICTED"} disabled={!enabled}/><label
                  htmlFor={"writeRestrict_" + props.site}>Write Restricted</label></div>
              <div><input type="radio" name={"controlType_" + props.site} value="READ_RESTRICTED"
                          id={"readRestrict_" + props.site} onChange={ev => {
                  setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)
              }} checked={nsAccessType === "READ_RESTRICTED"} disabled={!enabled}/><label
                  htmlFor={"readRestrict_" + props.site}>Read Restricted</label></div>
              <div><input type="radio" name={"controlType_" + props.site} value="GUEST_WRITABLE"
                          id={"guestWritable_" + props.site} onChange={ev => {
                  setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)
              }} checked={nsAccessType === "GUEST_WRITABLE"} disabled={!enabled}/><label
                  htmlFor={"guestWritable_" + props.site}>Guest Writable</label></div>
          </div>
          <select name="userList" className="userList" data-testid="userList" size="5" onChange={(ev) => {
              setSelectedUser(ev.target.value);
          }}
                  value={selectedUser} disabled={!roleEnable}>
              {props.users.map(user => <option value={user} key={user}>{user}</option>)}
          </select>
          <select name="roleList" className="roleList" data-testid="roleList" size="5" onChange={(ev) => {
              setSelectedRoles(props.site, selectedNs, selectedUser, ev.target, props.userMap, props.setUserMap, setEnabled);
          }} disabled={!roleEnable} multiple={true} value={userRoles} >
              <option value={"READ"}>Allow Read</option>
              <option value={"WRITE"}>Allow Write</option>
              <option value={"UPLOAD"}>Allow Upload</option>
              <option value={"DELETE"}>Allow Delete</option>
          </select>
      </div>
  </div>
}

ACLWidget.propTypes = {site: PropTypes.string.isRequired, users:PropTypes.array, userMap:PropTypes.object, setUserMap:PropTypes.func};
