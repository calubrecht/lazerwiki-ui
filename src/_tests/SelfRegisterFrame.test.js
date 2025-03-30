import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../svc/UserService';
import SelfRegisterFrame from '../SelfRegisterFrame';

let mockDS = {};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});


test('render',  () => {
    let doClose  = jest.fn(() => {});
    render(<SelfRegisterFrame doClose={doClose} /> );

    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(screen.getByText('Create User')).toBeInTheDocument();
});

test('createUser', async () => {
    let doClose = jest.fn(() => {
    });
    mockDS.addUser = jest.fn(() => Promise.resolve());
    render(<SelfRegisterFrame doClose={doClose}/>);
    await waitFor(() => {
    });

    await act(() => userEvent.keyboard("myUser[Tab]myPass[Tab]myPass[Enter]"));

    expect(mockDS.addUser.mock.calls[0][0]).toBe("myUser");
    expect(mockDS.addUser.mock.calls[0][1]).toBe("myPass");
    expect(screen.getByText('User Successfully created. Please log in.')).toBeInTheDocument();

    await act(() => screen.getByText("X").click()) ;
    expect(doClose).toHaveBeenCalled();
});

test('failEntry', async () => {
    let doClose = jest.fn(() => {
    });
    mockDS.addUser = jest.fn(() => Promise.resolve());
    render(<SelfRegisterFrame doClose={doClose}/>);
    await waitFor(() => {
    });
    await act(() => userEvent.keyboard("[Tab][Tab][Enter]"));
    expect(mockDS.addUser).not.toHaveBeenCalled();

    await act(() => screen.getByLabelText('Username:').focus() );
    await act(() => userEvent.keyboard("U1[Tab][Tab]"));
    expect(screen.getByText('Create User')).toHaveAttribute('disabled');

    await act(() => userEvent.keyboard("[Enter]]"));
    expect(mockDS.addUser).not.toHaveBeenCalled();

    await act(() => screen.getByLabelText('Username:').focus() );
    await act(() => userEvent.keyboard("U1[Tab]Pass1[Tab]Pass2"));
    expect(screen.getByText('Passwords don\'t match')).toBeInTheDocument();
    expect(screen.getByText('Create User')).toHaveAttribute('disabled');

    await act(() => userEvent.keyboard("[Enter]]"));
    expect(mockDS.addUser).not.toHaveBeenCalled();
});

test('serverRejectUser', async () => {
    let doClose = jest.fn(() => {
    });
    mockDS.addUser = jest.fn(() => Promise.reject({promise: Promise.resolve("Bad User"), message:'Message with promise'}));
        render(<SelfRegisterFrame doClose={doClose}/>);
    await waitFor(() => {
    });

    await act(() => userEvent.keyboard("myUser[Tab]myPass[Tab]myPass"));
    await act(() => screen.getByText("Create User").click());



    expect(mockDS.addUser.mock.calls[0][0]).toBe("myUser");
    expect(mockDS.addUser.mock.calls[0][1]).toBe("myPass");
    expect(screen.getByText('Bad User')).toBeInTheDocument();

    mockDS.addUser = jest.fn(() => Promise.reject({promise: Promise.resolve(""), message:'Message no promise'}));
    await act(() => screen.getByText("Create User").click());
    expect(screen.getByText('Message no promise')).toBeInTheDocument();

    await act(() => screen.getByText("X").click()) ;
    expect(doClose).toHaveBeenCalled();
});

