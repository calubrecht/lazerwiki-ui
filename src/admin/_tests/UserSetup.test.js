import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSetup from '../UserSetup';


let mockDS = {getUsers: () => Promise.resolve([{userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, {userName:"User 2"}]), deleteRole:
  jest.fn(() => new Promise(() => {}))};

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
}, 300000);