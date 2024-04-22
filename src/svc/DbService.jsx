import Dexie from 'dexie';

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
        this.db.pageDrafts.put({pageName: key,text:value, ts: Date.now()});
    }

    delValue(key)
    {
        this.db.pageDrafts.delete(key);
    }

    // Returns a promise that receives the value
    getValue(key)
    {
        return this.db.pageDrafts.get(key); 
    }
  
}