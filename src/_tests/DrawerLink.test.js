import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import DrawerLink from '../DrawerLink';


let MockComponent = (props) => "MockComponent - " + props.initData;

test("renders", () => {
    render(<DrawerLink component={MockComponent} initData={"theData"} title="Click Here"/>);

    expect(screen.getByText("Click Here")).toBeInTheDocument();
    expect(screen.queryByText("MockComponent", {exact: false})).not.toBeInTheDocument();

});

test("clickOn", async () => {
    render(<DrawerLink component={MockComponent} initData={"theData"} title="Click Here"/>);

    await waitFor(() => screen.getByText("Click Here").click());
    expect(screen.queryByText("MockComponent", {exact: false})).toBeInTheDocument();

    // Hide component
    await waitFor(() => screen.getByText("Click Here").click());
    expect(screen.queryByText("MockComponent", {exact: false})).not.toBeInTheDocument();
});

test("click Swap", async () => {
    render(<div>
    <DrawerLink component={MockComponent} initData={"theData"} title="Click Here"/>
    <DrawerLink component={MockComponent} initData={"otherData"} title="Other Click"/>
    </div>
    );

    await waitFor(() => screen.getByText("Click Here").click());
    expect(screen.queryByText("MockComponent - theData")).toBeInTheDocument();
    expect(screen.queryByText("MockComponent - otherData")).not.toBeInTheDocument();

    // Clicking a drawer will close the other drawer if already open
    await waitFor(() => screen.getByText("Other Click").click());
    expect(screen.queryByText("MockComponent - theData")).not.toBeInTheDocument();
    expect(screen.queryByText("MockComponent - otherData")).toBeInTheDocument();
});

test("classes", async () => {
    render(<div>
    <DrawerLink component={MockComponent} initData={"theData"} title="Click Here"/>
    <DrawerLink component={MockComponent} initData={"otherData"} title="Other Click" extraClasses="moreClass"/>
    </div>
    );

    expect(screen.getByText("Other Click").parentElement).toHaveClass("moreClass");
});