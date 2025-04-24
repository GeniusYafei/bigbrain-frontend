// cypress/Component/QuestionCard.cy.jsx
/* eslint-disable no-undef */
import TopBar from "../../src/components/TopBar";
import TestWrapper from "../../src/__test__/TestWrapper";

// Test suite for the TopBar component
describe("TopBar Conditional Buttons & Logout", () => {
  beforeEach(() => {
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("email", "tester@example.com");
  });

  it("does NOT render go-back or go-dashboard when at /dashboard", () => {
    // Set the current URL to /dashboard
    window.history.pushState({}, "", "/dashboard");

    cy.mount(
      <TestWrapper>
        <TopBar />
      </TestWrapper>
    );

    // These buttons should not be displayed
    cy.get('[data-cy="go-back"]').should("not.exist");
    cy.get('[data-cy="go-dashboard"]').should("not.exist");

    // But logout should exist
    cy.get('[data-cy="go-logout"]').should("exist");
    cy.wait(1000);
  });

  it("renders go-back and go-dashboard on other pages (e.g. /play)", () => {
    // Simulation on the /play page
    window.history.pushState({}, "", "/play");

    cy.mount(
      <TestWrapper>
        <TopBar />
      </TestWrapper>
    );

    // The Back and dashboard buttons should be displayed
    cy.get('[data-cy="go-back"]').should("exist");
    cy.get('[data-cy="go-dashboard"]').should("exist");

    // Click "dashboard" to jump
    cy.get('[data-cy="go-dashboard"]').click();
    cy.wait(1000);
    cy.location("pathname").should("eq", "/dashboard");
  });

  it("opens logout dialog and logs out on confirm", () => {
    // Currently on any page (such as /game)
    window.history.pushState({}, "", "/game");

    cy.mount(
      <TestWrapper>
        <TopBar />
      </TestWrapper>
    );

    // Click logout button
    cy.get('[data-cy="go-logout"]').click();
    cy.contains("Confirm Logout").should("exist");
  });
});
