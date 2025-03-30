import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../../svc/UserService';
import VerifyEmailFrame from '../VerifyEmailFrame';


let VERIFY_EMAIL_PROMISE = null;


let mockDS = {verifyEmailToken: () => VERIFY_EMAIL_PROMISE};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});



test('render', async() => {
    let doClose = jest.fn();
    render(<VerifyEmailFrame doClose={doClose} onSuccess={() => {}}/>);

    expect(screen.queryByLabelText('Verification Token:')).toBeInTheDocument();

    await act( () => screen.queryByText('X').click());
    expect(doClose).toHaveBeenCalled();
});


test('verify Failure', async() => {
    let doClose = jest.fn();
    render(<VerifyEmailFrame doClose={doClose} onSuccess={() => {}}/>);

    screen.queryByLabelText('Verification Token:').focus();

    await act(() => userEvent.keyboard("ABCC"));

    VERIFY_EMAIL_PROMISE = Promise.resolve({success: false, message: "Invalid Token"});

    await act( async() => await screen.queryByText('Verify Token').click());
    expect(screen.queryByText('Invalid Token')).toBeInTheDocument();
});

test('verify Success', async() => {
    let doClose = jest.fn();
    let onSuccess = jest.fn();
    render(<VerifyEmailFrame doClose={doClose} onSuccess={onSuccess}/>);

    screen.queryByLabelText('Verification Token:').focus();

    await act(() => userEvent.keyboard("ABCC"));

    VERIFY_EMAIL_PROMISE = Promise.resolve({success: true, message: ""});

    await act( async() => await screen.queryByText('Verify Token').click());
    expect(onSuccess).toHaveBeenCalled();
});

test('close by backdrop', async() => {
    let doClose = jest.fn();
    render(<VerifyEmailFrame doClose={doClose} onSuccess={() => {}}/>);

    await act( () => screen.getByTestId('VerifyEmailBackdrop').click());
    expect(doClose).toHaveBeenCalled();
});
