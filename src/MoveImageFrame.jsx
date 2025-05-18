import {PropTypes} from "prop-types";
import NsTree from './NsTree';
import TextField from './TextField';
import React, {useState, useEffect, useRef} from 'react';
import {instance as DS_instance} from './svc/DataService';

function doMove(newNS, newName, setError, setShowConfirmDlg, props) {
   DS_instance().moveImage(props.ns, props.imageName, newNS, newName).then((j) => {
       if (j.success) {
           setShowConfirmDlg(true);
           return;
       }
       setError(j.message);
   }).catch(e => setError("Unknown error"));
}

function combineNSName(ns, name) {
    if (ns) {
        return ns + ":" + name;
    }
    return name;
}


function MoveImageFrame(props) {
    let [newNS, setNewNS] = useState(props.ns);
    let [newName, setNewName] = useState(props.imageName);
    let [error, setError] = useState('');
    let [showConfirmDlg, setShowConfirmDlg] = useState(false);
    let enableMove = newNS !== props.ns || newName !== props.imageName;
    useEffect(() => {
        dlgRef?.current?.showModal?.();
    }, []);
    let dlgRef = useRef();
    if (showConfirmDlg) {
        return <dialog className="moveImageDialog" ref={dlgRef}>
            <button onClick={props.doClose} className="close button-unstyled">X</button>
            <div className="dialogHeader">Where do you want to move {props.imageName}?</div>
            <div className="nsTreeContainer">
                <h3>Namespace [{newNS}]</h3>
                <NsTree nsTree={props.nsTree} selectNS={(ns) => {
                    setNewNS(ns)
                }
                }/></div>
            <div>{combineNSName(props.ns, props.imageName)} moved to {combineNSName(newNS, newName)}</div>
            <div className="buttonRow"><button onClick={() => {props.doRefresh(); props.doClose()}}>OK</button></div>
        </dialog>;
    }
    return (<dialog className="moveImageDialog" ref={dlgRef}>
        <button onClick={props.doClose} className="close button-unstyled">X</button>
        <div className="dialogHeader">Where do you want to move {props.imageName}?</div>
        <div className="nsTreeContainer">
            <h3>Namespace [{newNS}]</h3>
            <NsTree nsTree={props.nsTree} selectNS={(ns) => {
                setNewNS(ns)
            }
            }/></div>
        <TextField name="New NS" label="New NS:" onChange={(v,) => setNewNS(v)} disabled={false}
                   varName="filter" autofocus={true} value={newNS}/>
        <TextField name="New Name" label="New Name:" onChange={(v,) => setNewName(v)} disabled={false}
                   varName="filter" autofocus={true} value={newName}/>
        <div className="moveDesc">{combineNSName(props.ns,props.imageName)} -> {combineNSName(newNS,newName)}</div>
        <div className="buttonRow"><button onClick={() => doMove(newNS, newName, setError, setShowConfirmDlg, props)} disabled={!enableMove}>Move</button> <button onClick={props.doClose}>Cancel</button></div>
        <div className="error">{error}</div>
</dialog>)
    ;
}

MoveImageFrame.propTypes = {
    imageName: PropTypes.string,
    ns: PropTypes.string,
    nsTree: PropTypes.object, doClose:PropTypes.func, doRefresh:PropTypes.func};

export default MoveImageFrame;