import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordFrame from '../ForgotPasswordFrame';

var resetPromise = null;
let mockDS = {resetForgottenPassword: jest.fn(() => resetPromise)};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

let doVerifyClose = null;
let doVerifySuccess = null;
jest.mock("../admin/VerifyTokenFrame.jsx", () => (props) =>  {
    doVerifyClose = props.doClose;
    doVerifySuccess = props.onSuccess;
    return "Verify Email";
} );


test('render',  () => {
    render(<ForgotPasswordFrame  initData={{username: "Bob"}} doClose={() => {}} /> );

    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Username:')).toHaveValue('Bob');
});

test('request token', async () => {
    let doClose = jest.fn(() => {});
    render(<ForgotPasswordFrame  initData={{username: "Bob"}} doClose={doClose} /> );
    await waitFor( () => {});

    await act(() => userEvent.click(screen.getByLabelText("Email:")));

    resetPromise = Promise.resolve();
    await act( async() => await userEvent.keyboard("bob@bob.com[Tab]abc[Tab]abc[Enter]"));

    expect(screen.getByText('Verify Email')).toBeInTheDocument();

    await act( () => doVerifyClose ());

    await act( async() => await userEvent.click(screen.getByText("Reset Password")));

    await act( () => doVerifySuccess ());

    expect(screen.queryByLabelText('Username:')).not.toBeInTheDocument();
    expect(screen.getByText('The password for Bob has been successfully reset. Please close this box and log in.')).toBeInTheDocument();

    await act( () => userEvent.click(screen.getByText("X")));
    expect(doClose).toHaveBeenCalled();
});

test('password validations', async () => {
    let doClose = jest.fn(() => {});
    render(<ForgotPasswordFrame  initData={{username: "Bob"}} doClose={doClose} /> );
    await waitFor( () => {});

    // No email = no reset
    await act( async() => await userEvent.click(screen.getByLabelText("Email:")));
    await act( async() => await userEvent.keyboard("[Tab]abc[Tab]abc[Enter]"));
    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeDisabled();
    expect(screen.queryByText("Passwords don't match")).not.toBeInTheDocument();

    // Nonmatching password = no reset
    await act( async() => await userEvent.click(screen.getByLabelText("Email:")));
    await act( async() => await userEvent.keyboard("bob@bob.com[Tab][Tab]d[Enter]"));
    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeDisabled();
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    expect(screen.getByLabelText("Password:")).toHaveValue("abc");
    expect(screen.getByLabelText("Confirm Password:")).toHaveValue("d");

    // Blank password = no reset
    await act( async() => await userEvent.click(screen.getByLabelText("Password:")));
    await act( async() => await userEvent.keyboard("{Backspace}{Backspace}{Backspace}[Tab]{Backspace}[Enter]"));
    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeDisabled();
    expect(screen.queryByText("Passwords don't match")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Password:")).toHaveValue("");
    expect(screen.getByLabelText("Confirm Password:")).toHaveValue("");

    await act( () => userEvent.click(screen.getByText("X")));
    expect(doClose).toHaveBeenCalled();
});


test('failed submit', async () => {
    let doClose = jest.fn(() => {});
    render(<ForgotPasswordFrame  initData={{username: "Bob"}} doClose={doClose} /> );
    await waitFor( () => {});

    await act(() => userEvent.click(screen.getByLabelText("Email:")));

    let rejectCall = null;
    resetPromise = new Promise((resolve, reject) => rejectCall = reject);
    await act( async() => await userEvent.keyboard("bob@bob.com[Tab]abc[Tab]abc[Enter]"));
    await act( () => rejectCall({message: "Server Error"}));

    expect(screen.getByText('Server Error')).toBeInTheDocument();
});
