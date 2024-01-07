import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSetup from '../UserSetup';


let mockDS = {getUsers: () => Promise.resolve([{userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, {userName:"User 2"}]), deleteRole:
  jest.fn(() => Promise.resolve({userName:"User 1", userRoles:["ROLE_USER"]})), addRole: jest.fn(() => Promise.resolve({userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER", "ROLE_NEW"]}))};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});

test('render', async () => {
  render(<UserSetup />);

  await waitFor(() => {});

  expect(screen.getByText("Users"));
  expect(screen.getByRole("option", {name: "User 1"}));
  expect(screen.getByRole("option", {name: "User 2"}));
  expect(screen.getByRole("button", {name: "Create User"}));
  expect(screen.getByRole("button", {name: "Reset User Password"}));
  expect(screen.getByRole("button", {name: "Delete User"}));
});



test('select User', async () => {
  render(<UserSetup />);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await userEvent.selectOptions(screen.getByTestId('userList'), 'User 1');
  expect(screen.getByText("User 1 Roles")).toBeInTheDocument()
  expect(screen.getByRole("button", {name: "Add Role"})).toBeInTheDocument();
  expect(screen.getByRole("button", {name: "Remove Role"})).toBeInTheDocument();
  expect(screen.getByRole("option", {name: "ROLE_ADMIN"}));
  expect(screen.getByRole("option", {name: "ROLE_USER"}));
});

test('remove Role', async () => {
  render(<UserSetup />);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await userEvent.selectOptions(screen.getByTestId('userList'), 'User 1');
  await userEvent.selectOptions(screen.getByTestId('roleList'), 'ROLE_ADMIN');
  await userEvent.click(screen.getByRole("button", {name: "Remove Role"}));

  expect(mockDS.deleteRole.mock.calls[0][0]).toBe("User 1");
  expect(mockDS.deleteRole.mock.calls[0][1]).toBe("ROLE_ADMIN");

  expect(screen.queryByRole("option", {name: "ROLE_ADMIN"})).not.toBeInTheDocument();
});

test('add Role', async () => {
  render(<UserSetup />);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await userEvent.selectOptions(screen.getByTestId('userList'), 'User 1');
  await userEvent.selectOptions(screen.getByTestId('roleList'), 'ROLE_ADMIN');
  await userEvent.click(screen.getByRole("button", {name: "Add Role"}));
  let dlg= document.getElementsByClassName("addRoleDialog")[0];
  dlg.open = true;

  let roleInput = screen.getByLabelText("New Role:");
  await(roleInput.focus());
  expect(roleInput.value).toBe("ROLE_");
  await userEvent.keyboard("ONE[ENTER]");
  expect(mockDS.addRole.mock.calls[0][0]).toBe("User 1");
  expect(mockDS.addRole.mock.calls[0][1]).toBe("ROLE_ONE");
  
  await waitFor(() => {});
  expect(screen.getByRole("option", {name: "ROLE_NEW"}));

  expect(roleInput.value).toBe("ROLE_");
  await userEvent.keyboard("TWO");
  await userEvent.click(screen.getByRole("button", {name: "Submit New Role"}));
  expect(mockDS.addRole.mock.calls[1][0]).toBe("User 1");
  expect(mockDS.addRole.mock.calls[1][1]).toBe("ROLE_TWO");

  await waitFor(() => {});

  expect(roleInput.value).toBe("ROLE_");
  await userEvent.keyboard("THREE");
  await userEvent.click(screen.getByRole("button", {name: "Cancel"}));
  await waitFor(() => {});
  expect(roleInput.value).toBe("ROLE_");

});

test('net Fail', async () => {
  mockDS.deleteRole = jest.fn(() => Promise.reject("Failed"));
  mockDS.addRole = jest.fn(() => Promise.reject("Add Failed"));
  console.log = jest.fn(() => {});

  render(<UserSetup />);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await userEvent.selectOptions(screen.getByTestId('userList'), 'User 1');
  await userEvent.selectOptions(screen.getByTestId('roleList'), 'ROLE_ADMIN');

  console.log.mockClear();

  await userEvent.click(screen.getByRole("button", {name: "Remove Role"}));
  expect(console.log.mock.calls[0][0]).toBe("Failed");

  await userEvent.click(screen.getByRole("button", {name: "Add Role"}));
  let dlg= document.getElementsByClassName("addRoleDialog")[0];
  dlg.open = true;

  let roleInput = screen.getByLabelText("New Role:");
  await(roleInput.focus());
  expect(roleInput.value).toBe("ROLE_");
  await userEvent.keyboard("ONE[ENTER]");
    expect(console.log.mock.calls[1][0]).toBe("Add Failed");

});