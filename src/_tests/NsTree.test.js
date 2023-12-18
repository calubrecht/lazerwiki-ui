import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NsTree from '../NsTree';


test('render', () => {
  let nsTree = {namespace: '', fullNamespace:'',  children:[{namespace:'ns', fullNamespace:'ns',children:[{namespace:'ns2', fullNamespace:'ns:ns2', children:[]}]}, {namespace:'ns3', fullNamespace:'n3'}]};

  render(<NsTree nsTree={nsTree}/>);


  expect(screen.getByRole("button", {name: '<ROOT>'})).toBeInTheDocument();
  expect(screen.getByRole("button", {name: 'expand-'})).toBeInTheDocument();
  expect(screen.getByRole("button", {name: 'expand-'}).parentElement).not.toHaveClass("closed");
  expect(screen.getByRole("button", {name: 'ns'})).toBeInTheDocument();
  expect(screen.getByRole("button", {name: 'expand-ns'}).parentElement).toHaveClass("closed");
  expect(screen.getByRole("button", {name: 'ns2'})).toBeInTheDocument();
  expect(screen.getByRole("button", {name: 'ns3'})).toBeInTheDocument();
});

test('expandCollapse', async () => {
  let nsTree = {namespace: '', fullNamespace:'',  children:[{namespace:'ns', fullNamespace:'ns',children:[{namespace:'ns2', fullNamespace:'ns:ns2', children:[]}]}, {namespace:'ns3', fullNamespace:'n3'}]};

  render(<NsTree nsTree={nsTree}/>);
  
  await userEvent.click(screen.getByRole("button", {name: 'expand-ns'}));
  expect(screen.getByRole("button", {name: 'expand-ns'}).parentElement).not.toHaveClass("closed");
  
  await userEvent.click(screen.getByRole("button", {name: 'expand-ns'}));
  expect(screen.getByRole("button", {name: 'expand-ns'}).parentElement).toHaveClass("closed");
});


test('selectNS', async () => {
  let selectNS = jest.fn(() => {});
  let nsTree = {namespace: '', fullNamespace:'',  children:[{namespace:'ns', fullNamespace:'ns',children:[{namespace:'ns2', fullNamespace:'ns:ns2', children:[]}]}, {namespace:'ns3', fullNamespace:'n3'}]};

  render(<NsTree nsTree={nsTree} selectNS={selectNS}/>);
  
  await userEvent.click(screen.getByRole("button", {name: '<ROOT>'}));
  expect(selectNS.mock.calls[0][0]).toBe("");
  
  await userEvent.click(screen.getByRole("button", {name: 'ns'}));
  expect(selectNS.mock.calls[1][0]).toBe("ns");

  await userEvent.click(screen.getByRole("button", {name: 'ns2'}));
  expect(selectNS.mock.calls[2][0]).toBe("ns:ns2");
});
