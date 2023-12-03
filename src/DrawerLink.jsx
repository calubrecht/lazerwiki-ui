
import {useState} from 'react';


const allDrawerCloseFuncs = {};

function closeAll() {
  Object.values(allDrawerCloseFuncs).forEach( f => f());
}

export default function DrawerLink(props) {
   let [showComponent, setShowComponent] = useState(false);
   allDrawerCloseFuncs[props.title] = () => setShowComponent(false);
   return <div className="drawer"><div className="drawerPull" onClick={() => {closeAll(); setShowComponent(!showComponent);}}>{props.title}</div> {showComponent && <props.component doClose={() => setShowComponent(false)} initData={props.initData}/>}</div>;
}
