import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import SiteSetup from '../SiteSetup';

test('render', () => {
  render(<SiteSetup activeSites={["Site 1", "Site 2"]}/>);

  expect(screen.getByText("Available Sites"));
  expect(screen.getByRole("option", {name: "Site 1"}));
  expect(screen.getByRole("option", {name: "Site 2"}));
  expect(screen.getByRole("button", {name:"Add New Site"}));
  expect(screen.getByRole("button", {name:"Delete Site"}));
});
