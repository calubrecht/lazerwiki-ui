import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import BacklinksFrame from '../BacklinksFrame';

test('firstRender', () => {
    render(<BacklinksFrame initData={['Page1', 'Page2', '']}/>);

    expect(screen.getByText('Page1')).toBeInTheDocument();
    expect(screen.getByText('Page1').closest('a')).toHaveAttribute('href', '/page/Page1');
    expect(screen.getByText('Page2')).toBeInTheDocument();
    expect(screen.getByText('<ROOT>')).toBeInTheDocument();
    expect(screen.getByText('<ROOT>').closest('a')).toHaveAttribute('href', '/');
});

test('closeButton', () => {
    let closeFnc = jest.fn(() => {});
    render(<BacklinksFrame initData={['Page1', 'Page2', '']} doClose={closeFnc}/>);

    screen.getByRole("button", {name : 'X'}).click();

    expect(closeFnc.mock.calls).toHaveLength(1);
});


test('emptyBacklinks', () => {
    let component = render(<BacklinksFrame />);

    expect(screen.getByText('No links to this page')).toBeInTheDocument();

    component.unmount();

    render(<BacklinksFrame initData={[]}/>);

    expect(screen.getByText('No links to this page')).toBeInTheDocument();

});