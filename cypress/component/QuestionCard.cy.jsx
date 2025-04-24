// cypress/Component/QuestionCard.cy.jsx
/* eslint-disable no-undef */
import QuestionCard from "../../src/components/QuestionCard";
import TestWrapper from "../../src/__test__/TestWrapper";

// Test suite for the QuestionCard component
describe("QuestionCard Component", () => {
  // A base valid question object used in most tests
  const baseQuestion = {
    questionId: 1,
    text: "What is 2 + 2?",
    duration: 30,
    type: "single",
    correctAnswers: [2], // index of the correct answer ("4")
    Answers: [
      { Answer: "2" },
      { Answer: "3" },
      { Answer: "4" },
      { Answer: "5" },
    ],
  };

  // Test 1: Renders all question metadata correctly
  it("renders question title and type metadata", () => {
    // Mount the component with the base question
    cy.mount(
      <TestWrapper>
        <QuestionCard
          index={0}
          question={baseQuestion}
          onEdit={cy.stub()}
          onDelete={cy.stub()}
        />
      </TestWrapper>
    );

    cy.wait(1000); // optional: ensure all animations/rendering are completed

    // Assert: Question header shows the index (1-based)
    cy.contains("Question 1").should("exist");

    // Assert: Question text is shown
    cy.contains("Q: What is 2 + 2?").should("exist");

    // Assert: Type metadata is rendered
    cy.contains("Type: Single Choice").should("exist");

    // Assert: Duration is displayed correctly
    cy.contains("Duration: 30s").should("exist");
  });

  // Test 2: Shows the "complete" status icon when question is fully defined
  it("renders complete status icon when complete", () => {
    cy.mount(
      <TestWrapper>
        <QuestionCard
          index={0}
          question={baseQuestion}
          onEdit={cy.stub()}
          onDelete={cy.stub()}
        />
      </TestWrapper>
    );

    cy.wait(1000); // wait for icon animation or rendering

    // Assert: The green complete icon is shown with the correct test ID
    cy.get('[data-testid="complete-icon"]').should("exist");
  });

  // Test 3: Renders "incomplete" icon when missing required fields (e.g. answers/correctAnswers)
  it("renders incomplete status when missing answers", () => {
    // Create a copy of baseQuestion but remove answer data to simulate incompleteness
    const incomplete = {
      ...baseQuestion,
      Answers: [],
      correctAnswers: [],
    };

    cy.mount(
      <TestWrapper>
        <QuestionCard
          index={1}
          question={incomplete}
          onEdit={cy.stub()}
          onDelete={cy.stub()}
        />
      </TestWrapper>
    );

    cy.wait(1000); // wait for rendering

    // Assert: The red "Incomplete" status icon is shown
    cy.get('[data-testid="Incomplete-icon"]').should("exist");
  });

  // Test 4: Calls onEdit and onDelete callbacks when their buttons are clicked
  it("triggers edit and delete actions", () => {
    // Set up spies to track function calls
    const onEdit = cy.stub().as("onEdit");
    const onDelete = cy.stub().as("onDelete");

    cy.mount(
      <TestWrapper>
        <QuestionCard
          index={2}
          question={baseQuestion}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TestWrapper>
    );

    cy.wait(1000); // allow render animations

    // Click the Edit button and check that onEdit was called
    cy.contains("Edit").click();
    cy.get("@onEdit").should("have.been.calledOnce");

    // Click the Delete button and check that onDelete was called
    cy.contains("Delete").click();
    cy.get("@onDelete").should("have.been.calledOnce");
  });
});
