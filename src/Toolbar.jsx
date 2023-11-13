import MediaFrame from './MediaFrame';
import {useState} from 'react';

  export default function Toolbar() {
    let [showMedia, setShowMedia] = useState(false);
    return <div className="toolbar">
       <div>I'm a toolbar</div>
       <div onClick={() => {setShowMedia(!showMedia);}}>Media Manager</div>
       {showMedia && <MediaFrame doClose={() => setShowMedia(false)}/>}</div>
}
