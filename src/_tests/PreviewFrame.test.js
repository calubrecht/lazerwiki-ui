import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import PreviewFrame from '../PreviewFrame';

test('render', async () => {
    render(<PreviewFrame initData={{initFnc: () => Promise.resolve({rendered: "This is some <input type=\"checkbox\"></input>text"})}} /> );
    await waitFor( () => {});

    expect(screen.getByText('This is some', {exact: false})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'X'})).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
});

test('closeButton', () => {
    let closeFnc = jest.fn(() => {});
    render(<PreviewFrame initData={{initFnc: () => new Promise(() => {})}} doClose = {closeFnc} />);

    screen.getByRole("button", {name : 'X'}).click();

    expect(closeFnc.mock.calls).toHaveLength(1);
});
