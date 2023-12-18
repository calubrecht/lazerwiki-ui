
import {useState} from 'react';


const allDrawerCloseFuncs = {};

function closeAll() {
  Object.values(allDrawerCloseFuncs).forEach( f => f());
}

export default function DrawerLink(props) {
   let [showComponent, setShowComponent] = useState(false);
   allDrawerCloseFuncs[props.title] = () => setShowComponent(false);
   let className = props.extraClasses ? "drawer " + props.extraClasses : "drawer";
   return <div className={className}><button className="drawerPull button-unstyled" onClick={() => {closeAll(); setShowComponent(!showComponent);}}>{props.title}</button> {showComponent && <props.component doClose={() => setShowComponent(false)} initData={props.initData}/>}</div>;
}
