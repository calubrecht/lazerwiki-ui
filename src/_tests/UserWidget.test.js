import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserWidget from '../UserWidget';
import {instance as US_instance} from '../svc/UserService';

let mockDS = {getUser: jest.fn(() => new Promise(() => {})), logout: () => Promise.resolve("")};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS, FOUR_O_THREE: '403'};

});

jest.mock("../LoginFrame", () => () =>  "Login Frame" );
jest.mock("../admin/UserAdminDialog", () => () =>  "");

let realConsolelog = console.log;
let realConsoleerror = console.error;

beforeEach( () => {
  console.log = jest.fn(() => {});
  console.error = jest.fn(() => {});
});

afterEach(() => {
  console.log = realConsolelog;
  console.error = realConsoleerror;
  US_instance().setUser(null);
  US_instance().cleanup();
});

test('render loading',  () => {
    render(<UserWidget  /> );

    expect(screen.getByText('Loading, please wait')).toBeInTheDocument();
});

test('render not logged in',  async () => {
    mockDS.getUser = jest.fn(() => Promise.reject({message: '403'}));
    await render(<UserWidget  /> );
    
    await waitFor(() => {});

    expect(screen.getByText('Hi, Guest')).toBeInTheDocument();
    expect(screen.getByText('Login Frame')).toBeInTheDocument();
});

test('render other error',  async() => {
    mockDS.getUser = jest.fn(() => Promise.reject({message: '500'}));
    await render(<UserWidget  /> );
    await waitFor(() => {});

    await expect(screen.getByText('Loading, please wait')).toBeInTheDocument();
    expect(console.log.mock.calls[0][0]).toBe("Other user error: 500");
});

test('render log in after load',  async() => {
    mockDS.getUser = jest.fn(() => Promise.reject({message: '403'}));
    await render(<UserWidget  /> );
    await waitFor(() => {});

    act( () => {US_instance().setUser({userName: "Bob"});});
    await waitFor(() => {});
    await expect(screen.getByText('Hi, Bob')).toBeInTheDocument();
    expect(screen.queryByText('Login Frame')).not.toBeInTheDocument();
    
});

test('render already logged in',  async() => {
    let resolveHook = null
    mockDS.getUser = jest.fn(() => new Promise((resolve, reject) => resolveHook=resolve));
    await render(<UserWidget  /> );
    
    await waitFor(() => {resolveHook({userName: 'Joe'})});

    await expect(screen.getByText('Hi, Joe')).toBeInTheDocument();
    expect(screen.queryByText('Login Frame')).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: "LogOut"})).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", {name: "LogOut"}));
    await waitFor(() => {});
    
    await expect(screen.getByText('Hi, Guest')).toBeInTheDocument();
    expect(screen.getByText('Login Frame')).toBeInTheDocument();
});



test('Logout with error',  async() => {
    let resolveHook = null
    mockDS.getUser = jest.fn(() => new Promise((resolve,) => resolveHook=resolve));
    mockDS.logout = () => Promise.reject("oof");
    await render(<UserWidget  /> );
    
    await act(async() => await resolveHook({userName: 'Joe'}));
    await act( () => waitFor(() => {}));

    await act(() =>  userEvent.click(screen.getByRole("button", {name: "LogOut"})));
    await act( () => waitFor(() => {}));
    
    await expect(screen.getByText('Hi, Guest')).toBeInTheDocument();
    expect(screen.getByText('Login Frame')).toBeInTheDocument();
    expect(console.error.mock.calls[0][0]).toBe("oof");
});
