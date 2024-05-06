import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';


test('render',  () => {
    render(<ConfirmDialog displayText="Just Display This" btnNames={["Do it", "Don't Do It"]}  /> );

    expect(screen.getByText('Just Display This')).toBeInTheDocument();
    expect(screen.getByText('Do it')).toBeInTheDocument();
    expect(screen.getByText("Don't Do It")).toBeInTheDocument();
});

test('doClicks', () => {
    let confirm = jest.fn(() => {});
    let cancel = jest.fn(() => {});
    render(<ConfirmDialog displayText="Just Display This" btnNames={["Do it", "Don't Do It"]} onConfirm={confirm}  onCancel={cancel} /> );

    screen.getByText('Do it').click();
    expect(confirm.mock.calls).toHaveLength(1);

    screen.getByText("Don't Do It").click();
    expect(cancel.mock.calls).toHaveLength(1);
});
