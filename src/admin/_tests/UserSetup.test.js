import {render, screen, act, waitFor, queryByAttribute, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSetup from '../UserSetup';


let mockDS = {getUsers: () => Promise.resolve([{userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, {userName:"User 2"}]), deleteRole:
  jest.fn(() => Promise.resolve({userName:"User 1", userRoles:["ROLE_USER"]})), addRole: jest.fn(() => Promise.resolve({userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER", "ROLE_NEW"]})),
  addUser: jest.fn(() => Promise.resolve({userName:"USER1", userRoles:[]})),
  setUserPassword: jest.fn(() => Promise.resolve({userName:"USER1", userRoles:[]})),
  deleteUser: jest.fn(() => Promise.resolve({})),

};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});

afterEach(() => {
  jest.clearAllMocks();
});

test('render', async () => {
  render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}}}/>);

  await waitFor(() => {});

  expect(screen.getByText("Users"));
  expect(screen.getByRole("option", {name: "User 1"}));
  expect(screen.getByRole("option", {name: "User 2"}));
  expect(screen.getByRole("button", {name: "Create User"}));
  expect(screen.getByRole("button", {name: "Reset User Password"}));
  expect(screen.getByRole("button", {name: "Delete User"}));
});



test('select User', async () => {
  render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}}}/>);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'User 1'));
  expect(screen.getByText("User 1 Roles")).toBeInTheDocument()
  expect(screen.getByRole("button", {name: "Add Role"})).toBeInTheDocument();
  expect(screen.getByRole("button", {name: "Remove Role"})).toBeInTheDocument();
  expect(screen.getByRole("option", {name: "ROLE_ADMIN"}));
  expect(screen.getByRole("option", {name: "ROLE_USER"}));
});

test('remove Role', async () => {
  let setUserMap = jest.fn(() => {});
  let component= render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'User 1'));
  await act( () => userEvent.selectOptions(screen.getByTestId('roleList'), 'ROLE_ADMIN'));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Remove Role"})));

  expect(mockDS.deleteRole.mock.calls[0][0]).toBe("User 1");
  expect(mockDS.deleteRole.mock.calls[0][1]).toBe("ROLE_ADMIN");

  let updatedUserMap = {"User 1": {userName:"User 1", userRoles:["ROLE_USER"]}, "User 2":{userName:"User 2"}};
  expect(setUserMap.mock.calls[0][0]).toStrictEqual(updatedUserMap);
  render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:updatedUserMap, setUserMap}}/>, component);
  expect(screen.queryByRole("option", {name: "ROLE_ADMIN"})).not.toBeInTheDocument();
});

test('add Role', async () => {
  let setUserMap = jest.fn(() => {});
  let component= render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'User 1'));
  await act( () => userEvent.selectOptions(screen.getByTestId('roleList'), 'ROLE_ADMIN'));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Add Role"})));
  let dlg= document.getElementsByClassName("addRoleDialog")[0];
  dlg.open = true;

  let roleInput = screen.getByLabelText("New Role:");
  await(roleInput.focus());
  expect(roleInput.value).toBe("ROLE_");
  await act( () => userEvent.keyboard("ONE[ENTER]"));
  expect(mockDS.addRole.mock.calls[0][0]).toBe("User 1");
  expect(mockDS.addRole.mock.calls[0][1]).toBe("ROLE_ONE");
  
  await waitFor(() => {});
  let updatedUserMap = {"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER", "ROLE_NEW"]}, "User 2":{userName:"User 2"}};
  expect(setUserMap.mock.calls[0][0]).toStrictEqual(updatedUserMap);
  render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:updatedUserMap, setUserMap}}/>, component);

  expect(screen.getByRole("option", {name: "ROLE_NEW"}));

  expect(roleInput.value).toBe("ROLE_");
  await act( () => userEvent.keyboard("TWO"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Submit New Role"})));
  expect(mockDS.addRole.mock.calls[1][0]).toBe("User 1");
  expect(mockDS.addRole.mock.calls[1][1]).toBe("ROLE_TWO");

  await waitFor(() => {});

  expect(roleInput.value).toBe("ROLE_");
  await act( () => userEvent.keyboard("THREE"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Cancel"})));
  await waitFor(() => {});
  expect(roleInput.value).toBe("ROLE_");

});

test('add Admin Role', async () => {
  let setUserMap = jest.fn(() => {});
  let component= render(<UserSetup sites={[{name: "site1", siteName: "Site 1"}, {name: "site2", siteName: "Site 2"}]} userData={{users:["User 1", "User 2"], userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>);


  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Admin Role"})).not.toBeInTheDocument();

  await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'User 1'));
  await act( () => userEvent.selectOptions(screen.getByTestId('roleList'), 'ROLE_ADMIN'));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Add Admin Role"})));
  let dlg= document.getElementsByClassName("addRoleDialog")[0];
  dlg.open = true;

  let globalInput = screen.getByLabelText("Global Admin");
  expect(globalInput).not.toBeChecked();

  let dropdown = screen.getByLabelText("Site for admin role:");
  expect(dropdown).toHaveTextContent("Site 1");
  await act(() => fireEvent.change(dropdown, { target: { value: "site2" } }));
  expect(dropdown).toHaveTextContent("Site 2");
  await act( () => userEvent.click(screen.getByRole("button", {name: "Submit New Role"})));
  expect(mockDS.addRole.mock.calls[0][0]).toBe("User 1");
  expect(mockDS.addRole.mock.calls[0][1]).toBe("ROLE_ADMIN:site2");
  expect(dropdown).toHaveTextContent("Site 1");

  await waitFor(() => {});

  await act(() => globalInput.click());
  expect(globalInput).toBeChecked();
  expect(screen.queryByLabelText("Site for admin role:")).not.toBeInTheDocument();
  await act( () => userEvent.click(screen.getByRole("button", {name: "Submit New Role"})));
  expect(mockDS.addRole.mock.calls[1][0]).toBe("User 1");
  expect(mockDS.addRole.mock.calls[1][1]).toBe("ROLE_ADMIN");
  expect(globalInput).not.toBeChecked();

  await act(() => fireEvent.change(dropdown, { target: { value: "site2" } }));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Cancel"})));
  await waitFor(() => {});
  expect(dropdown).toHaveTextContent("Site 1");
});

test('add User', async () => {
  let setUserMap = jest.fn(() => {});
  let setUsers = jest.fn(() => {});
  let component= render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], setUsers: setUsers, userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>);


  await waitFor(() => {});

  await act( () => userEvent.click(screen.getByRole("button", {name: "Create User"})));
  let dlg= document.getElementsByClassName("addUserDialog")[0];
  dlg.open = true;

  expect(screen.getByText("Add New User")).toBeInTheDocument();
  let userInput = screen.getByLabelText("New User:");
  await(userInput.focus());
  await act( () => userEvent.keyboard("USER1[TAB]PASS[TAB]PAS[ENTER]"));
  expect(mockDS.addUser.mock.calls).toHaveLength(0);

  expect(screen.getByText("Password confirmation does not match. Please correct")).toBeInTheDocument();
  await screen.getByLabelText("Confirm Password:").focus();
  await act( () => userEvent.keyboard("S"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Submit New User"})));
  expect(mockDS.addUser.mock.calls[0][0]).toBe("USER1");
  expect(mockDS.addUser.mock.calls[0][1]).toBe("PASS");
  
  await waitFor(() => {});
  expect(setUsers.mock.calls[0][0]).toStrictEqual(["User 1", "User 2", "USER1"]);
  render(<UserSetup sites={[]} userData={{users:["User 1", "User 2", "USER1"], setUsers: setUsers, userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>, component);
  expect(screen.getByRole("option", {name: "USER1"}));


  expect(userInput.value).toBe("");
  await(userInput.focus());
  await act( () => userEvent.keyboard("USER2"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Cancel"})));
  expect(userInput.value).toBe("");

});

test('reset Password', async () => {
  let setUserMap = jest.fn(() => {});
  let component= render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>);

  await waitFor(() => {});

  await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'User 1'));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Reset User Password"})));
  let dlg= document.getElementsByClassName("addUserDialog")[0];
  dlg.open = true;

  expect(screen.getByText("Reset Password for User 1")).toBeInTheDocument();
  expect(screen.queryByLabelText("New User:")).not.toBeInTheDocument();
  let passwordInput = screen.getByLabelText("Password:");
  await(passwordInput.focus());
  await act( () => userEvent.keyboard("PASS[TAB]PAS[ENTER]"));
  expect(mockDS.setUserPassword.mock.calls).toHaveLength(0);

  expect(screen.getByText("Password confirmation does not match. Please correct")).toBeInTheDocument();
  await screen.getByLabelText("Confirm Password:").focus();
  await act( () => userEvent.keyboard("S"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Set Password"})));
  expect(mockDS.setUserPassword.mock.calls[0][0]).toBe("User 1");
  expect(mockDS.setUserPassword.mock.calls[0][1]).toBe("PASS");

});

test('delete User', async () => {
  let setUserMap = jest.fn(() => {});
  let setUsers = jest.fn(() => {});
  let component= render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], setUsers: setUsers, userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>);

  await waitFor(() => {});

  await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'User 1'));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Delete User"})));
  let dlg= document.getElementsByClassName("confirmDeleteDialog")[0];
  dlg.open = true;

  await act( () => userEvent.click(screen.getByRole("button", {name: "Cancel"})));
  expect(mockDS.deleteUser.mock.calls).toHaveLength(0);

  await act( () => userEvent.click(screen.getByRole("button", {name: "Delete"})));
  expect(mockDS.deleteUser.mock.calls[0][0]).toBe("User 1");
});

test('net Fail', async () => {
  mockDS.deleteRole = jest.fn(() => Promise.reject("Failed"));
  mockDS.addRole = jest.fn(() => Promise.reject("Add Failed"));
  mockDS.addUser = jest.fn(() => Promise.reject("addUser Failed"));
  mockDS.setUserPassword = jest.fn(() => Promise.reject("setUserPassword Failed"));
  console.log = jest.fn(() => {});

  let setUserMap = jest.fn(() => {});
  let component= render(<UserSetup sites={[]} userData={{users:["User 1", "User 2"], userMap:{"User 1": {userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, "User 2":{userName:"User 2"}}, setUserMap}}/>);

  await waitFor(() => {});

  expect(screen.queryByRole("button", {name: "Add Role"})).not.toBeInTheDocument();
  expect(screen.queryByRole("label", {name: "User 1 Roles"})).not.toBeInTheDocument();

  await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'User 1'));
  await act( () => userEvent.selectOptions(screen.getByTestId('roleList'), 'ROLE_ADMIN'));

  console.log.mockClear();

  await act( () => userEvent.click(screen.getByRole("button", {name: "Remove Role"})));
  expect(console.log.mock.calls[0][0]).toBe("Failed");

  await act( () => userEvent.click(screen.getByRole("button", {name: "Add Role"})));
  let dlg= document.getElementsByClassName("addRoleDialog")[0];
  dlg.open = true;

  let roleInput = screen.getByLabelText("New Role:");
  roleInput.focus();
  expect(roleInput.value).toBe("ROLE_");
  await act( () => userEvent.keyboard("ONE[ENTER]"));
  expect(console.log.mock.calls[1][0]).toBe("Add Failed");
  dlg.open = false;

  dlg= document.getElementsByClassName("addUserDialog")[0];
  await act( () => userEvent.click(screen.getByRole("button", {name: "Create User"})));
  dlg.open = true;
  let userInput = screen.getByLabelText("New User:");
  userInput.focus();
  await act( () => userEvent.keyboard("USER1[TAB]PASS[TAB]PASS[ENTER]"));
  expect(console.log.mock.calls[2][0]).toBe("addUser Failed");
  expect(screen.getByText("Add User Failed"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Cancel"})));

  await act( () => userEvent.click(screen.getByRole("button", {name: "Reset User Password"})));
  let passwordInput = screen.getByLabelText("Password:");
  passwordInput.focus();
  await act( () => userEvent.keyboard("PASS2[TAB]PASS2[ENTER]"));
  expect(console.log.mock.calls[3][0]).toBe("setUserPassword Failed");
  expect(screen.getByText("Set Password Failed"));

});
