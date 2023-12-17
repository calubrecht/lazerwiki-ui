import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import {instance as US_instance} from '../svc/UserService';
import AdminWidget from '../AdminWidget';

let dUser = {userName: 'joe', userRoles:[]};

test('firstRender', () => {
    US_instance().setUser(null);
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
});

test('renderAsUser, not admin', () => {
    US_instance().setUser({userName: "joe", siteName:"test", userRoles:["ROLE_USER"]});
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
});

test('renderAsUser, admin', () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).toBeInTheDocument();
});

test('renderAsUser, site admin', () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN:test"]});
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).toBeInTheDocument();
});

test('render userChangesafter render', async () => {
    US_instance().setUser(null);
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
    await waitFor( () => US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN:test"]}));
    expect(screen.queryByText('admin')).toBeInTheDocument();
});
