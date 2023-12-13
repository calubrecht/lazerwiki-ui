import MediaFrame from './MediaFrame';
import PageFrame from './PageFrame';
import DrawerLink from './DrawerLink';
import PageSearchFrame from './PageSearchFrame';
import {useState} from 'react';
import {useEffect} from 'react';
import {instance as DS_instance} from './svc/DataService';
import HTMLReactParser from 'html-react-parser';



export default function Toolbar() {
    let [userToolbar, setUserToolbar] = useState('');
    useEffect( () => {
      DS_instance().fetchPage("_meta:toolbar").then((pageData) => {
        if (!pageData.flags.exists) {
          console.log("No user toolbar info found. To add your own entries, create a page name _meta:toolbar");
          return;
        }
        setUserToolbar(pageData.rendered);
      }).catch((e) =>  {
        if (e.message === "Not Found") {
          return;
        }
        console.log(e);
      });
    }, []);
    return <div className="toolbar">
       <div className="bold">Toolbar</div>
       <div><a href="/">Home</a></div>
       {HTMLReactParser(userToolbar)}
       <DrawerLink title="Search" component={PageSearchFrame} />
       <DrawerLink title="Media List" component={MediaFrame} />
       <DrawerLink title="Page List" component={PageFrame} />
      </div>
}
