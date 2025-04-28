import {useEffect, useState, useRef} from 'react';
import {instance as DS_instance} from '../svc/DataService';
import './ACLWidget.css';
import NsTree from '../NsTree';
import {PropTypes} from "prop-types";
import {instance as SS_instance} from "../svc/SettingsService.jsx";

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


export default function ACLWidget(props) {
    const [namespaces, setNamespaces] = useState({});
    const [parsedNamespaces, setParsedNamespaces] = useState({});
    const [selectedNs, setSelectedNs] = useState("");
    const [enabled, setEnabled] = useState(false);

    useEffect( () => {
        fetchNamespaces(props.site, setNamespaces, setParsedNamespaces, setEnabled);

    }, []);

    const nsAccessType = selectedNs in parsedNamespaces ? parsedNamespaces[selectedNs].restriction_type : "OPEN";
    const inheritAccessType = selectedNs in parsedNamespaces ? parsedNamespaces[selectedNs].inherited_restriction_type : "OPEN";

  return <div className="aclWidget">
      <h2>Access Control</h2>
      <div className="nsTree"><NsTree nsTree={namespaces}  selectNS = {setSelectedNs}></NsTree>
      </div>
      <div className="aclPanel">
          <label>Set Controls for : {selectedNs}</label>
          <div className="controlRadios">
              <div><input type="radio" name={"controlType_" + props.site} value="INHERIT" id={"accessInherit_" + props.site} onChange={ev => {setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)}} checked={nsAccessType === "INHERIT" }/><label htmlFor={"accessInherit_" + props.site}>
                  Inherit ({inheritAccessType})</label></div>
              <div><input type="radio" name={"controlType_" + props.site} value="OPEN" id={"accessOpen_" + props.site} onChange={ev => {setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)}} checked={nsAccessType === "OPEN" }/><label htmlFor={"accessOpen_" + props.site}>Open
                  Access</label></div>
              <div><input type="radio" name={"controlType_" + props.site} value="WRITE_RESTRICTED" id={"writeRestrict_" + props.site} onChange={ev => {setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)}} checked={nsAccessType === "WRITE_RESTRICTED" }/><label
                  htmlFor={"writeRestrict_" + props.site}>Write Restricted</label></div>
              <div><input type="radio" name={"controlType_" + props.site} value="READ_RESTRICTED" id={"readRestrict_" + props.site} onChange={ev => {setNSaccess(props.site, selectedNs, setNamespaces, parsedNamespaces, setParsedNamespaces, setEnabled, ev)}} checked={nsAccessType === "READ_RESTRICTED" }/><label
                  htmlFor={"readRestrict_" + props.site}>Read Restricted</label></div>
  </div>
</div>
</div>
}

ACLWidget.propTypes = {site: PropTypes.string.isRequired};
