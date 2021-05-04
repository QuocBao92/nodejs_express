describe("Snapshot-testing: Assets List", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const fixtures = ["sample", "long", "empty"];
  const searchFilter = {
    keyword: "GATEWAY",
    status: "Good",
    model: "CI10",
    region: "North Japan Region",
    organization: "GLORY LTD.",
    location: "Himeji HQ",
  };
  const apiParams = {
    locations: {
      customerId: searchFilter.organization,
    },
  };

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route("GET", `${Cypress.env("apiAssets")}*`, `fx:assets/assets/${fixture}`)
            .as("getAssets")
            .route("GET", `${Cypress.env("apiTypes")}*`, `fx:types/sample`)
            .as("getTypes")
            .route("GET", `${Cypress.env("apiRegions")}*`, `fx:regions/sample`)
            .as("getRegions")
            .route("GET", `${Cypress.env("apiCustomers")}*`, `fx:customers/sample`)
            .as("getCustomers")
            .route("GET", `${Cypress.env("apiLocationsRL").replace("${1}", apiParams.locations.customerId)}*`, `fx:locations/sample`)
            .as("getLocations")
            .route("POST", `${Cypress.env("apiAssetsStatus")}*`, `fx:assets/status/sample`)
            .as("postAssetsStatus");
          cy.visit(Cypress.env("assets")).wait(["@getAssets", "@getTypes", "@getRegions", "@getCustomers", "@postAssetsStatus"], {
            requestTimeout: 10000,
          });
          cy.wait(1000);
          // input Keyword
          cy.get("[data-test='search-box'] bridge-form input").type(searchFilter.keyword);
          // select Status
          cy.get("[data-test='status-select']")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.status}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          // select Model
          cy.get("[data-test='model-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.model}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          // select Region
          cy.get("[data-test='region-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.region}']`).click();
            });
          // select Organization
          cy.get("[data-test='organization-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.organization}']`).click();
              cy.wait("@getLocations");
            });
          // select Location
          cy.get("[data-test='location-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.location}']`).click();
            });

          cy.wait(500);
          cy.get("body").toMatchImageSnapshot();
        });
      });
    });
  });
});
