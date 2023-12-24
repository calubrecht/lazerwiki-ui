import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import UserSetup from '../UserSetup';


let mockDS = {getUsers: () => Promise.resolve(["User 1", "User 2"])};

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
