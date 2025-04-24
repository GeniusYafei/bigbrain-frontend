// cypress/Component/GameCard.cy.jsx
/* eslint-disable no-undef */

import GameCard from "../../src/components/GameCard";
import TestWrapper from "../../src/__test__/TestWrapper";

// Test suite for the GameCard component
describe("GameCard Component", () => {
  let testGame;

  // Load test data and setup localStorage token before each test
  beforeEach(function () {
    cy.fixture("game.json").then((data) => {
      // Get a specific game from the fixture by ID
      testGame = data.games["742203142"];
    });

    // Simulate user login by setting a token
    localStorage.setItem("token", "mock-token");
  });

  // Test 1: GameCard renders title, question count, and total duration
  it("renders game title and question count correctly", () => {
    cy.fixture("game.json").then((data) => {
      testGame = data.games["742203142"];

      cy.mount(
        <TestWrapper>
          <GameCard
            game={testGame}
            onClick={cy.stub().as("onClick")}
            onDelete={cy.stub().as("onDelete")}
          />
        </TestWrapper>
      );

      // Assert: game name is visible
      cy.contains(testGame.name).should("exist");

      // Assert: question count is displayed correctly
      cy.contains(`${testGame.questions.length} question`).should("exist");

      cy.wait(1000); // optional: allow render animation

      // Calculate and assert total duration display
      const totalDuration = testGame.questions.reduce(
        (sum, q) => sum + (q.duration || 0),
        0
      );
      cy.contains(`Total duration: ${totalDuration}s`).should("exist");
    });
  });

  // Test 2: Clicking "Edit Game" button should call onClick callback
  it("calls onClick when Edit Game is clicked", () => {
    cy.fixture("game.json").then((data) => {
      testGame = data.games["742203142"];
      const onClickStub = cy.stub().as("onClick");

      cy.mount(
        <TestWrapper>
          <GameCard
            game={testGame}
            onClick={onClickStub}
            onDelete={cy.stub()}
          />
        </TestWrapper>
      );

      // Simulate clicking the "Edit Game" button
      cy.contains("Edit Game").click();
      cy.wait(1000);

      // Assert: callback was called once
      cy.get("@onClick").should("have.been.calledOnce");
    });
  });

  // Test 3: Clicking delete should open confirmation dialog, and confirm triggers onDelete
  it("opens and confirms delete dialog", () => {
    cy.fixture("game.json").then((data) => {
      testGame = data.games["742203142"];
      const onDeleteStub = cy.stub().as("onDelete");

      cy.mount(
        <TestWrapper>
          <GameCard
            game={testGame}
            onClick={cy.stub()}
            onDelete={onDeleteStub}
          />
        </TestWrapper>
      );

      // Simulate clicking the delete icon button
      cy.get('[data-testid="delete-button"]').click();
      cy.wait(1000);

      // Assert: confirmation dialog appears
      cy.contains("Delete Game").should("exist");

      // Click confirm button inside the dialog
      cy.get("button").contains("Delete").click();
      cy.wait(1000);

      // Assert: delete handler was called with the game ID
      cy.get("@onDelete").should("have.been.calledWith", testGame.id);
    });
  });

  // Test 4: If game has no questions, the "Start Game" button should be disabled
  it("disables Start Game button if game is incomplete", () => {
    cy.fixture("game.json").then((data) => {
      // Create an incomplete game by removing questions
      const incompleteGame = {
        ...data.games["742203142"],
        questions: [], // simulate incomplete state
      };

      cy.mount(
        <TestWrapper>
          <GameCard
            game={incompleteGame}
            onClick={cy.stub()}
            onDelete={cy.stub()}
          />
        </TestWrapper>
      );

      // Assert: Start Game button is disabled
      cy.contains("Start Game").should("be.disabled");
    });
  });
});
