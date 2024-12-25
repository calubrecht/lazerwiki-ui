import { render, screen, waitFor, act} from '@testing-library/react';
import ImageSettings from '../ImageSettings';

test('alignment', async () => {
    let chooseAlignment = jest.fn(() => {});
    render(<ImageSettings chooseAlignment={chooseAlignment}/>);
    await waitFor(() => {});

    expect(screen.getByText("Flow")).toHaveClass("selected");
    expect(screen.getByText("Left")).not.toHaveClass("selected");
    expect(screen.getByText("Right")).not.toHaveClass("selected");
    expect(screen.getByText("Center")).not.toHaveClass("selected");

    await act(() => screen.getByText("Left").click());

    expect(screen.getByText("Flow")).not.toHaveClass("selected");
    expect(screen.getByText("Left")).toHaveClass("selected");
    expect(screen.getByText("Right")).not.toHaveClass("selected");
    expect(screen.getByText("Center")).not.toHaveClass("selected");

    await act(() => screen.getByText("Right").click());

    expect(screen.getByText("Flow")).not.toHaveClass("selected");
    expect(screen.getByText("Left")).not.toHaveClass("selected");
    expect(screen.getByText("Right")).toHaveClass("selected");
    expect(screen.getByText("Center")).not.toHaveClass("selected");

    await act(() => screen.getByText("Center").click());

    expect(screen.getByText("Flow")).not.toHaveClass("selected");
    expect(screen.getByText("Left")).not.toHaveClass("selected");
    expect(screen.getByText("Right")).not.toHaveClass("selected");
    expect(screen.getByText("Center")).toHaveClass("selected");

    await act(() => screen.getByText("Flow").click());

    expect(screen.getByText("Flow")).toHaveClass("selected");

    expect(chooseAlignment.mock.calls[0][0]).toBe("Left");
    expect(chooseAlignment.mock.calls[1][0]).toBe("Right");
    expect(chooseAlignment.mock.calls[2][0]).toBe("Center");
    expect(chooseAlignment.mock.calls[3][0]).toBe("Flow");
});