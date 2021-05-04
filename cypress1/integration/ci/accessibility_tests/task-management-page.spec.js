describe.skip("Accessibility-Task Management", () => {
  beforeEach(() => {
    cy.server()
      .route("GET", Cypress.env("apiTasks"))
      .as("apiTasks");
    cy.visit(Cypress.env("tasks")).wait("@apiTasks");
    cy.injectAxe();
  });
  it("Has no violations on load", () => {
    cy.checkA11y(); // fail for a11y violations
  });
  it("Has no violations on package table", () => {
    cy.checkA11y("[data-test=task-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });
  it("Has no violations on task expansion", () => {
    cy.get("[data-test=row]")
      .as("row")
      .each((_, i) => {
        cy.get("@row")
          .eq(i)
          .within(() => {
            cy.get("[data-test=row-header]").click();
          });
      });

    cy.checkA11y("[data-test=task-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });

  it("Has no violations on task pagination", () => {
    cy.checkA11y("[data-test=task-pagination]", { runOnly: ["wcag2a", "wcag2aa"] });
  });
});
