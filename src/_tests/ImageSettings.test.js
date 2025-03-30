import { render, screen, waitFor, act} from '@testing-library/react';
import ImageSettings from '../ImageSettings';
import userEvent from "@testing-library/user-event";

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

test('size', async () => {
    let chooseX = jest.fn(() => {});
    let chooseY = jest.fn(() => {});
    render(<ImageSettings chooseX={chooseX} chooseY={chooseY}/>)
    await waitFor(() => {});

    expect(screen.getByText("Width:")).toBeInTheDocument();
    expect(screen.getByLabelText("Width:")).toHaveValue("");
    expect(screen.getByText("Width:")).toBeInTheDocument();
    expect(screen.getByLabelText("Width:")).toHaveValue("");

    await screen.getByLabelText("Width:").focus();
    await act( () => userEvent.keyboard("10"));
    expect(screen.getByLabelText("Width:")).toHaveValue("10");
    expect(chooseX.mock.calls[0][0]).toBe(1);
    expect(chooseX.mock.calls[1][0]).toBe(10);
    await act( () => userEvent.keyboard("{Backspace}{Backspace}"));
    expect(chooseX.mock.calls[3][0]).toBe(null);
    await act( () => userEvent.keyboard("a"));
    expect(screen.getByLabelText("Width:")).toHaveValue("");
    expect(chooseX.mock.calls).toHaveLength(4);

    await screen.getByLabelText("Height:").focus();
    await act( () => userEvent.keyboard("5"));
    expect(chooseY.mock.calls[0][0]).toBe(5);
});