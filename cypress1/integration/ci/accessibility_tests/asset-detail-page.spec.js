describe.skip("Accessibility-Asset detail", () => {
  beforeEach(() => {
    cy.server()
      .route("GET", Cypress.env("apiAssetDetail"))
      .as("assets")
      .route("GET", Cypress.env("apiAssetStatus"))
      .as("status")
      .route("GET", "/api/assets/*/*/events")
      .as("events")
      .route("GET", Cypress.env("apiAssetFirmwares"))
      .as("firmwares")
      .route("GET", Cypress.env("apiAssetInventory"))
      .as("inventory");
    cy.visit(Cypress.env("assetDetail")).wait(["@assets", "@status", "@events", "@firmwares", "@inventory"]);
    cy.injectAxe();
  });

  it("Has no violations on load", () => {
    cy.get("[data-test=firmware-title]").click({ force: true });
    cy.get("[data-test=inventory-title]").click({ force: true });
    cy.checkA11y(); // fail for a11y violations
  });
});
