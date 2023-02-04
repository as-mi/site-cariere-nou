import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "~/lib/test/i18next-mock";

import NavBar from "~/components/common/navbar";

describe("NavBar", () => {
  it("renders correctly", () => {
    const linkText = "Test link";

    const tree = render(<NavBar renderLinks={() => <li>{linkText}</li>} />);
    expect(tree).toMatchSnapshot();

    const link = screen.getByText(linkText);

    expect(link).toBeInTheDocument();
  });

  it("opens and closes correctly", async () => {
    const user = userEvent.setup();

    const linkText = "Home";
    render(<NavBar renderLinks={() => <li>{linkText}</li>} />);

    expect(screen.queryByText(linkText)).toBeHidden();

    const showButton = screen.getByTitle("navbar.show");
    await user.click(showButton);

    expect(screen.getByTitle("navbar.show")).toBeHidden();
    expect(screen.queryByText(linkText)).not.toBeHidden();

    const closeButton = screen.getByTitle("navbar.close");
    await user.click(closeButton);

    expect(screen.getByTitle("navbar.close")).toBeHidden();
    expect(screen.queryByText(linkText)).toBeHidden();
  });
});
