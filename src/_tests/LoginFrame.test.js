import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../svc/UserService';
import LoginFrame from '../LoginFrame';

let mockDS = {login: jest.fn((u, p) => Promise.resolve(u +"-loggedIn"))};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});
test('render',  () => {
    render(<LoginFrame  /> );

    expect(screen.getByText('Please Log in')).toBeInTheDocument();
    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
});

test('attemptLogin', async () => {
    render(<LoginFrame  /> );
    await waitFor( () => {});

    await userEvent.keyboard("myUser[Tab]myPass[Enter]");

    expect(US_instance().getUser()).toBe("myUser-loggedIn");
    let rejectCall = null
    mockDS.login = jest.fn((u, p) => new Promise((resolve, reject) => {rejectCall=reject}));
    
    await US_instance().setUser(null);
    await userEvent.keyboard("[Enter]");
    await rejectCall("Login Failed");
    await waitFor( () => {});
    expect(US_instance().getUser()).toBe(null);

    expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
});
