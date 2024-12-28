import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../../svc/UserService';
import UserAdminDialog from '../UserAdminDialog';


let SET_PASSWORD_PROMISE = null;

let mockDS = {setPassword: () => SET_PASSWORD_PROMISE};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});


test('render', () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:[]});
    render(<UserAdminDialog/>);

    expect(screen.queryByLabelText('New Password:')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm Password:')).toBeInTheDocument();
    expect(screen.queryByText('Save Password')).toBeInTheDocument();
    expect(screen.queryByText('Save Password')).not.toBeEnabled();
});

test('enter passwords', async () => {
        US_instance().setUser({userName: "bob", siteName:"test",userRoles:[]});
        render(<UserAdminDialog/>);

        screen.queryByLabelText('New Password:').focus();
        await userEvent.keyboard("a password");
        expect(screen.queryByText('Save Password')).not.toBeEnabled();
        screen.queryByLabelText('Confirm Password:').focus();
        await userEvent.keyboard("a password");
        expect(screen.queryByText('Save Password')).toBeEnabled();

        SET_PASSWORD_PROMISE = Promise.resolve({success: false, message: "no good"});
        await userEvent.click( screen.queryByText('Save Password'));

    expect(screen.queryByText('no good')).toBeInTheDocument();

    // Submit failed, so passwords weren't cleared so save still ready
    expect(screen.queryByText('Save Password')).toBeEnabled();
    let resolveFnc = null;
    SET_PASSWORD_PROMISE = new Promise((resolve, ) => resolveFnc = resolve);

    await userEvent.click( screen.queryByText('Save Password'));
    expect(screen.queryByText('no good')).not.toBeInTheDocument();

    await act( () => resolveFnc({success: true}));
    await waitFor( () => {});

    expect(screen.queryByText('Save Password')).not.toBeEnabled();
});

test('doClose', async () => {
    let doClose = jest.fn(() => {});
    render(<UserAdminDialog doClose={doClose}/>);

    await userEvent.click(screen.getByText("X"));

    expect(doClose).toHaveBeenCalled();
});
