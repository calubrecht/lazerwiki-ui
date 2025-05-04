import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../../svc/UserService';
import VerifyTokenFrame from '../VerifyTokenFrame.jsx';


let VERIFY_TOKEN_PROMISE = null;


let mockDS = {verifyEmailToken: jest.fn(() => VERIFY_TOKEN_PROMISE),
    verifyPasswordToken: jest.fn(() => VERIFY_TOKEN_PROMISE),};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});



test('render', async() => {
    let doClose = jest.fn();
    render(<VerifyTokenFrame doClose={doClose} onSuccess={() => {}} tokenType="email"/>);

    expect(screen.queryByLabelText('Verification Token:')).toBeInTheDocument();

    await act( () => screen.queryByText('X').click());
    expect(doClose).toHaveBeenCalled();
});


test('verify Failure', async() => {
    let doClose = jest.fn();
    render(<VerifyTokenFrame doClose={doClose} onSuccess={() => {}} tokenType="email"/>);

    screen.queryByLabelText('Verification Token:').focus();

    await act(() => userEvent.keyboard("ABCC"));

    VERIFY_TOKEN_PROMISE = Promise.resolve({success: false, message: "Invalid Token"});

    await act( async() => await screen.queryByText('Verify Token').click());
    expect(screen.queryByText('Invalid Token')).toBeInTheDocument();
});

test('verify Success', async() => {
    let doClose = jest.fn();
    let onSuccess = jest.fn();
    jest.clearAllMocks();
    render(<VerifyTokenFrame doClose={doClose} onSuccess={onSuccess} tokenType="email"/>);

    screen.queryByLabelText('Verification Token:').focus();

    await act(() => userEvent.keyboard("ABCC"));

    VERIFY_TOKEN_PROMISE = Promise.resolve({success: true, message: ""});

    await act( async() => await screen.queryByText('Verify Token').click());
    expect(mockDS.verifyEmailToken).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
});

test('close by backdrop', async() => {
    let doClose = jest.fn();
    render(<VerifyTokenFrame doClose={doClose} onSuccess={() => {}} tokenType="email"/>);

    await act( () => screen.getByTestId('VerifyTokenBackdrop').click());
    expect(doClose).toHaveBeenCalled();
});

test('verify Password', async() => {
    let doClose = jest.fn();
    let onSuccess = jest.fn();
    jest.clearAllMocks();
    render(<VerifyTokenFrame doClose={doClose} onSuccess={onSuccess} tokenType="password" userName={"bob"}/>);

    screen.queryByLabelText('Verification Token:').focus();

    await act(() => userEvent.keyboard("ABCC"));

    VERIFY_TOKEN_PROMISE = Promise.resolve({success: true, message: ""});

    await act( async() => await screen.queryByText('Verify Token').click());
    expect(mockDS.verifyPasswordToken).toHaveBeenCalled();
    expect(mockDS.verifyPasswordToken.mock.calls[0]).toStrictEqual(["ABCC", "bob"]);
    expect(onSuccess).toHaveBeenCalled();
});