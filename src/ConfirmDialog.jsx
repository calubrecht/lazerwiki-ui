import React, {useEffect, useState, useRef} from 'react';

function ConfirmDialog(props) {
    let dlgRef = useRef();
    let btnRef = useRef();
    useEffect(() => {
        dlgRef.current?.showModal?.();
    }, []
    );
    return <dialog className={props.className + "Overlay, dlgOverlay"} onClick={() => props.onCancel()} ref={dlgRef}  >
        <div  className={props.className + ", confirmDlg"} onClick={(evt) => evt.stopPropagation()}>
        <div>{props.displayText}</div>
        <div className={props.className + "Buttons, confirmDlgBtns"}>
           <button ref={btnRef} className="cancel" onClick={() => props.onCancel()} >{props.btnNames[1]}</button>
           <button className="confirm" onClick={  ()=> props.onConfirm()}>{props.btnNames[0]}</button>
        </div>
      </div>
    </dialog>;
}
    


export default ConfirmDialog;