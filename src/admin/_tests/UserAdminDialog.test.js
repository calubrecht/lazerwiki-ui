import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../../svc/UserService';
import UserAdminDialog from '../UserAdminDialog';


let SET_PASSWORD_PROMISE = null;
let SAVE_EMAIL_PROMISE = null;

let mockDS = {setPassword: () => SET_PASSWORD_PROMISE, saveEmail: jest.fn(() => SAVE_EMAIL_PROMISE)};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});

let doVerifyClose = null;
let doVerifySuccess = null;
jest.mock("../VerifyEmailFrame", () => (props) =>  {
    doVerifyClose = props.doClose;
    doVerifySuccess = props.onSuccess;
    return "Verify Email";
} );


test('render', () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:[], settings:{}});
    render(<UserAdminDialog/>);

    expect(screen.queryByLabelText('New Password:')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(screen.queryByText('Save Password')).toBeInTheDocument();
    expect(screen.queryByText('Save Password')).not.toBeEnabled();
    expect(screen.queryByLabelText('Email:')).toBeInTheDocument();
    expect(screen.queryByLabelText('Email:').value).toBe("");
    expect(screen.queryByText('Save Email')).toBeInTheDocument();
    expect(screen.queryByText('Save Email')).not.toBeEnabled();
});

test('enter passwords', async () => {
        US_instance().setUser({userName: "bob", siteName:"test",userRoles:[], settings:{}});
        render(<UserAdminDialog/>);

    screen.queryByLabelText('New Password:').focus();
    await act( () => userEvent.keyboard("a password"));
    expect(screen.queryByText('Save Password')).not.toBeEnabled();
    screen.queryByLabelText('Confirm Password:').focus();
    await act( () => userEvent.keyboard("a password"));
    expect(screen.queryByText('Save Password')).toBeEnabled();

    SET_PASSWORD_PROMISE = Promise.resolve({success: false, message: "no good"});
    await act(async () => await userEvent.click( screen.queryByText('Save Password')));

    expect(screen.queryByText('no good')).toBeInTheDocument();

    // Submit failed, so passwords weren't cleared so save still ready
    expect(screen.queryByText('Save Password')).toBeEnabled();
    let resolveFnc = null;
    SET_PASSWORD_PROMISE = new Promise((resolve, ) => resolveFnc = resolve);

    await act(async () => await userEvent.click( screen.queryByText('Save Password')));
    expect(screen.queryByText('no good')).not.toBeInTheDocument();

    await act( async () => await resolveFnc({success: true}));

    expect(screen.queryByText('Save Password')).not.toBeEnabled();
});

test('doClose', async () => {
    let doClose = jest.fn(() => {});
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:[], settings:{}});
    render(<UserAdminDialog doClose={doClose}/>);

    await userEvent.click(screen.getByText("X"));

    expect(doClose).toHaveBeenCalled();
});

test('enter email', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:[], settings:{email: "bob@example.com"}});
    render(<UserAdminDialog/>);

    expect(screen.queryByLabelText('Email:').value).toBe("bob@example.com");
    screen.queryByLabelText('Email:').focus();

    await act(() => userEvent.tripleClick(screen.queryByLabelText('Email:')));
    await act( () => userEvent.keyboard("jake@other.com"));
    expect(screen.queryByLabelText('Email:').value).toBe("jake@other.com");
    expect(screen.queryByText('Save Email')).toBeEnabled();


    SAVE_EMAIL_PROMISE = Promise.resolve({success: true});

    await(act(async () => await screen.queryByText('Save Email').click()));

    expect(mockDS.saveEmail).toHaveBeenCalled();
    expect(screen.queryByText('Verify Email')).toBeInTheDocument();

    await act(() => doVerifyClose()) ;
    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Email:').value).toBe("jake@other.com");
    expect(screen.queryByText('Save Email')).toBeEnabled();

    await(act(async () => await screen.queryByText('Save Email').click()));

    expect(screen.queryByText('Verify Email')).toBeInTheDocument();

    await act(() => doVerifySuccess()) ;
    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Email:').value).toBe("jake@other.com");
    expect(screen.queryByText('Save Email')).not.toBeEnabled();

});

test('simple verify email', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:[], settings:{}});
    render(<UserAdminDialog/>);

    screen.queryByLabelText('Email:').focus();

    await act(() => userEvent.tripleClick(screen.queryByLabelText('Email:')));
    // invalid email
    await act( () => userEvent.keyboard("jake@other"));
    expect(screen.queryByLabelText('Email:').value).toBe("jake@other");
    expect(screen.queryByText('Save Email')).not.toBeEnabled();

    await act( () => userEvent.keyboard(".domain.com"));
    expect(screen.queryByLabelText('Email:').value).toBe("jake@other.domain.com");
    expect(screen.queryByText('Save Email')).toBeEnabled();
    await act( () => userEvent.keyboard("@aol.com"));
    expect(screen.queryByLabelText('Email:').value).toBe("jake@other.domain.com@aol.com");
    expect(screen.queryByText('Save Email')).not.toBeEnabled();


    await act(() => userEvent.tripleClick(screen.queryByLabelText('Email:')));
    // missing ueser
    await act( () => userEvent.keyboard("other.com"));
    expect(screen.queryByLabelText('Email:').value).toBe("other.com");
    expect(screen.queryByText('Save Email')).not.toBeEnabled();
});