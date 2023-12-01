import MediaFrame from './MediaFrame';
import PageFrame from './PageFrame';
import DrawerLink from './DrawerLink';
import {useState} from 'react';

  export default function Toolbar() {
    let [showMedia, setShowMedia] = useState(false);
    return <div className="toolbar">
       <div className="bold">Toolbar</div>
       <div><a href="/">Home</a></div>
       <DrawerLink title="Media List" component={MediaFrame} />
       <DrawerLink title="Page List" component={PageFrame} />
      </div>
}
