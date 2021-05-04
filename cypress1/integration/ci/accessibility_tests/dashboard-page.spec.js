describe.skip("Accessibility-Dashboard", () => {
  beforeEach(() => {
    cy.server()
      .route("GET", Cypress.env("apiAvailability"))
      .as("apiAvailability");
    cy.visit(Cypress.env("dashboard")).wait("@apiAvailability");
    cy.injectAxe();
  });
  it("Has no violations on load", () => {
    cy.checkA11y(); // fail for a11y violations
  });
  it("Has no violations on system availability", () => {
    cy.checkA11y("[data-test=system-availability]", { runOnly: ["wcag2a", "wcag2aa"] });
  });
});
