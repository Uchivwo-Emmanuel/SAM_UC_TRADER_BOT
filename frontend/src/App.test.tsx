import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("monitoring dashboard", () => {
  it("shows the read-only demo safety state", () => {
    const view = render(<App />);
    expect(view.getByText("Trading overview")).toBeInTheDocument();
    expect(view.getByText("Live execution disabled")).toBeInTheDocument();
    expect(view.queryByRole("button", { name: /buy|sell|close position/i })).not.toBeInTheDocument();
  });

  it("shows strategy provenance and never offers a strategy mutation", () => {
    const view = render(<App />);
    fireEvent.click(view.getAllByRole("button", { name: /strategy/i })[0]);
    expect(view.getByText("Strategy status")).toBeInTheDocument();
    expect(view.getByText("0.0.0-pending-specification")).toBeInTheDocument();
    expect(view.queryByRole("button", { name: /approve|edit strategy|enable strategy/i })).not.toBeInTheDocument();
  });

  it("marks AI reports as descriptive and disables unprotected exports", () => {
    const view = render(<App />);
    fireEvent.click(view.getAllByRole("button", { name: /reports/i })[0]);
    fireEvent.click(view.getAllByRole("button", { name: "Open report" })[0]);
    expect(view.getByText(/AI analysis is descriptive only/i)).toBeInTheDocument();
    expect(view.getByRole("button", { name: "Download unavailable" })).toBeDisabled();
  });
});
