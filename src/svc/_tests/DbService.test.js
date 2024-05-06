import DbService, {instance, setInstance} from '../DbService';
import {setInstance as setUserService} from '../UserService';
import { waitFor } from '@testing-library/react';





test('test instance', ()  => {
  let dbService1 = instance();
  let dbService2 = instance();
  expect(dbService1).toBe(dbService2);
});


test('test db', async () => {
    let dbService = instance();

    setUserService({getUser: () => {return {userName: "Bob"}}});

    let dbValues = {};
    let db = {"put": (val) => dbValues[val.pageName] = val.text, "delete": key => dbValues[key] = null, "get": key=> Promise.resolve({"v": dbValues[key]})};
    dbService.db= {'pageDrafts': db};
    setInstance(dbService);

    dbService.addValue('key', 'val');

    await waitFor(() => {});

    let v = null;
    await dbService.getValue('key').then( a => v = a);

    expect(v).toStrictEqual({"v": "val"});

    db = {"put": (val) => dbValues[val.pageName] = val.text, "delete": key => dbValues[key] = null, "get": key=> Promise.resolve({"v": dbValues[key], "ts": 
        Date.UTC(2024,10,1)  })};
    dbService.db= {'pageDrafts': db};

    v = null;
    await dbService.getValue('key').then( a => v = a);

    expect(v).toStrictEqual({"v": "val", "ts": new Date(Date.UTC(2024,10,1)) });

    v = null;
    await dbService.delValue("key");

    await dbService.getValue('key').then( a => v = a);
    expect(v).toStrictEqual({"v": null, "ts": new Date(Date.UTC(2024,10,1)) });

});