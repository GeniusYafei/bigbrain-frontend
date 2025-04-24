// cypress/e2e/happyPath.cy.jsx
/* eslint-disable no-undef */

/**
 * Auth Login Test
 * 1 - Registers successfully
 * 2 - Creates a new game successfully
 * 3 - Updates the gameCard detail
 * 4 - Edit the gameCard
 * 5 - Create a new Question Card successfully
 * 6 - Edit the Question
 * 7 - Starts a game successfully
 * 8 - Ends a game successfully and Loads the results page successfully
 * 9 - Logs out of the application successfully
 * 10 - Logs back into the application successfully
 * ..
 */


describe("Admin Happy Path Flow", () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "test1234";
  const testName = "CypressUser";
  const testGameName = "CypressTestGame";
  const testQuestion = "CypressTestQuestion";
  const testAnswerO = "CypressAnswerO";
  const testAnswerT = "CypressAnswerT";

  // Before each test we need to restore local storage to preserve it.
  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  // After each test we save local storage.
  afterEach(() => {
    cy.saveLocalStorage();
  });

  before(() => {
    cy.visit("/login");
  });

  it("Admin UI happyPath test", () => {
    cy.wait(1000);
    // Click the Sign Up button go to register page
    cy.contains(/^Sign\s*up$/).click();

    // Step 1 Fill in registration form fields
    cy.url().should('include', '/register');
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[name="name"]').type(testName);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    // Submit the form
    cy.contains("button", "Sign up").click();

    // Expect to navigate to dashboard
    cy.url().should("include", "/dashboard", { timeout: 10000 });

    // Expect to see success notification
    cy.contains("Registration successful!").should("exist");
    cy.wait(1000);

    // Step2  Next steps Create Game.
    cy.contains("Create Game").click();
    cy.contains("Create New Game").should("be.visible");

    // Create a Game Name
    cy.get("#gameName").type(testGameName);
    cy.get("button")
      .contains(/^Create$/)
      .click();

    // Game card exist
    cy.contains("Game created successfully!").should("exist");
    cy.contains(testGameName).should("exist");
    cy.wait(1000);

    // Step 3 Edit GameCard
    cy.get("button")
      .contains(/^Edit Game$/)
      .click();
    cy.url().should('include','/game/');
    cy.wait(1000);

    // Step 4 Create teh QuestionCard
    cy.get("button")
      .contains(/^Add New Question$/)
      .click();
    cy.contains("Question Added").should("exist");
    cy.wait(1000);

    // Step 5 Edit QuestionCard
    cy.get("button")
      .contains(/^Edit$/)
      .click();
    cy.url().should('match',/\/game\/\d+\/question\/1$/);
    cy.wait(1000);

    // Step 5 Edit the Question content
    cy.get('input[id="questionText"]').type(testQuestion);

    // Add the Answer box
    cy.get("button")
      .contains(/^Add Answer$/)
      .click();
    cy.get("button")
      .contains(/^Add Answer$/)
      .click();
    cy.wait(1000);

    // Type and edit Answer text
    cy.get('input[type="answerFile"]').eq(0).type(testAnswerO);
    cy.get('input[type="answerFile"]').eq(1).type(testAnswerT);

    // Click the checkbox make their be checked
    cy.contains('label', 'Correct').eq(0).click();
    cy.contains('label', 'Correct').eq(0).find('input').should('be.checked');
    cy.get("button")
      .contains(/^Save Question$/)
      .click();
    cy.wait(1000);
    cy.url().should('match',/\/game\/\d+/);


    // Save question successfully
    cy.contains("Question saved").should("exist");
    cy.wait(1000);

    // Step 6 go back the Dashboard and start game session
    cy.get('[data-cy="go-dashboard"]').click();
    cy.url().should('include', '/dashboard');
    cy.wait(1000);

    // Start Game Session
    cy.get("button")
      .contains(/^Start Game$/)
      .click();
    cy.wait(1000);
    cy.contains("Game Started").should("exist");
    cy.get("button")
      .contains(/^Go to Session$/)
      .click();

    // Validate the page jump to session page
    cy.url().should('match', /\/session\/\d+/);
    cy.wait(1000);

    // Go back
    cy.get('[data-cy="go-dashboard"]').click();
    cy.url().should('include', '/dashboard');
    cy.wait(1000);

    // Close the Game Started Dialog
    cy.get("button")
      .contains(/^Close$/)
      .click();
    cy.wait(1000);
    cy.get("button")
      .contains(/^Stop Game$/)
      .click();
    cy.wait(1000);

    // Validate the Stop Game Dialog
    cy.contains("Stop Game").should("exist");
    cy.wait(1000);

    // Step 7 Ends a game successfully and Loads the result page
    cy.get("button")
      .contains(/^Stop & View Results$/)
      .click();

    // Validate the result page whether is load？
    cy.url().should('match', /\/session\/\d+/);
    cy.contains("Game Summary").should("exist");
    cy.wait(1000);

    // Go Back and Checked status of game
    cy.get('[data-cy="go-dashboard"]').click();
    cy.url().should('include', '/dashboard');
    cy.wait(1000);

    // Step 8 Logs out of the application successfully
    cy.get('[data-cy="go-logout"]').click();
    cy.contains("Confirm Logout").should("exist");
    cy.wait(1000);

    // Confirm logout and jump to login page
    cy.get("button")
      .contains(/^Logout$/)
      .click();
    cy.contains("logout successful")
    cy.url().should('include', '/login');
    cy.wait(1000);

    // Step 9 Logs back into the application successfully
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.contains("button", "Sign in").click();
    cy.wait(1000);

    // Validate the login successful
    cy.contains("Login successful!");
    cy.url().should('include', '/dashboard');

    // validate the create game still exist
    cy.contains(testGameName).should('be.visible');
  });
});
