describe.skip("Accessibility-Package list", () => {
  beforeEach(() => {
    cy.server()
      .route("GET", `${Cypress.env("apiPackages")}*`)
      .as("apiPackages");
    cy.visit(Cypress.env("packages")).wait("@apiPackages");
    cy.injectAxe();
  });
  it("Has no violations on load", () => {
    cy.checkA11y(); // fail for a11y violations
  });
  it("Has no violations on package table", () => {
    cy.checkA11y("[data-test=package-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });
  it("Has no violations on package expansion", () => {
    cy.get("[data-test=row]")
      .as("row")
      .each((_, i) => {
        cy.get("@row")
          .eq(i)
          .within(() => {
            cy.get("[data-test=row-header]").click();
            cy.get("[data-test=row-body] textarea").focus();
          });
      });

    cy.checkA11y("[data-test=package-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });
});
