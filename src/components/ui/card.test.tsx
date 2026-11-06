import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

describe("Card component suite", () => {
  it("renders card structure and children faithfully", () => {
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>Focus Session</CardTitle>
          <CardDescription>Deep work block</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Session contents</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId("test-card")).toHaveClass("surface");
    expect(screen.getByText("Focus Session")).toBeInTheDocument();
    expect(screen.getByText("Deep work block")).toBeInTheDocument();
    expect(screen.getByText("Session contents")).toBeInTheDocument();
  });
});
