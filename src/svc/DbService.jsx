import Dexie from 'dexie';
import {instance as userInstance} from './UserService';

var INSTANCE = null;

export function instance() {
    if (INSTANCE == null) {
      INSTANCE = new DbService();
    }
    return INSTANCE;
}

export function setInstance(instance) {
    INSTANCE = instance;
}

export default class DbService{
    constructor()
    {
        this.db = new Dexie('lwDB');
        this.db.version(1).stores({
            pageDrafts: 'pageName,ts',
          });
    }

    addValue(key, value)
    {
        this.db.pageDrafts.put({pageName: key,text:value, user:userInstance().getUser().userName, ts: Date.now()});
    }

    delValue(key)
    {
        this.db.pageDrafts.delete(key);
    }

    // Returns a promise that receives the value
    getValue(key)
    {
        let promise = this.db.pageDrafts.get(key);
        return promise.then(val => {
            if (val && val.ts) {
              let ts = val.ts;

              val.ts= new Date(ts);
            }
            return val;
        });
    }
  
}