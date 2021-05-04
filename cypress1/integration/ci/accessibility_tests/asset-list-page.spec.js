describe.skip("Accessibility-Asset list", () => {
  beforeEach(() => {
    cy.server()
      .route("GET", `${Cypress.env("apiAssets")}*`)
      .as("apiAssets");
    cy.visit(Cypress.env("assets")).wait("@apiAssets");
    cy.injectAxe();
  });
  it("Has no violations on load", () => {
    cy.checkA11y(); // fail for a11y violations
  });
  it("Has no violations on asset list table", () => {
    cy.checkA11y(".mat-table", { runOnly: ["wcag2a", "wcag2aa"] });
  });
});
