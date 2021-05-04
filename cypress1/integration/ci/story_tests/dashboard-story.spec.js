describe("Story - Dashboard story", () => {
  let page = `${Cypress.env("dashboard")}`;
  before(() => {
    cy.server()
      .route("GET", `${Cypress.env("apiAvailability")}*`)
      .as("apiAvailability")
      .route("GET", `${Cypress.env("apiAssetsMap")}*`)
      .as("apiAssetsMap")
      .route("GET", `${Cypress.env("apiAssets")}*`)
      .as("apiAssets")
      .route("GET", `${Cypress.env("apiCustomers")}*`)
      .as("apiCustomers")
      .route("GET", `${Cypress.env("apiTypes")}*`)
      .as("apiTypes")
      .route("GET", `${Cypress.env("apiRegions")}*`)
      .as("apiRegions");
    cy.visit(page).wait(["@apiAvailability", "@apiAssetsMap", "@apiAssets", "@apiCustomers", "@apiTypes", "@apiRegions"]);
  });
  context("Browse Asset Detail", () => {
    it("Click the Good button in Availability to go to the Asset List", () => {
      cy.wait(500);
      cy.get(
        "bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test='availability-content-list'] li:eq(0)",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assets"));
          cy.get("bridge-asset-filter bridge-select-multi[data-test='status-select']").should(
            "have.attr",
            "ng-reflect-selected-item",
            "Good",
          );
        });
    });
    it("Click the Error button in Availability to go to the Asset List", () => {
      cy.visit(page);
      cy.wait(500);
      cy.get(
        "bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test='availability-content-list'] li:eq(1)",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assets"));
          cy.get("bridge-asset-filter bridge-select-multi[data-test='status-select']").should(
            "have.attr",
            "ng-reflect-selected-item",
            "Error",
          );
        });
    });
    it("Click the Missing button in Availability to go to the Asset List", () => {
      cy.visit(page);
      cy.wait(500);
      cy.get(
        "bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test='availability-content-list'] li:eq(2)",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assets"));
          cy.get("bridge-asset-filter bridge-select-multi[data-test='status-select']").should(
            "have.attr",
            "ng-reflect-selected-item",
            "Missing",
          );
        });
    });
    it("Click the Asset in the Asset List in the Map to go to the Asset Detail", () => {
      cy.visit(page);
      cy.wait(500);
      cy.request(`${Cypress.env("apiAssetsMap")}`).then(({ body }) => {
        if (body.length > 0) {
          cy.get(`bridge-maps google-map .map-container div[title='${body[0].title}']`)
            .trigger("click")
            .then(() => {
              cy.wait(500);
              cy.get("mat-card-content .asset-list-group").should("have.class", "open");
              if (body[0].assets.length > 0) {
                cy.get("mat-card-content .asset-list-group bridge-table tbody tr:eq(0)")
                  .click()
                  .then(() => {
                    const { typeId, assetId } = body[0].assets[0];
                    cy.location("href").should("eq", Cypress.config("baseUrl") + `/assets/${typeId}/${assetId}?pev=dashboard`);
                  });
              }
            });
        }
      });
    });
    it("Click the view more link button in the Map to go to the Asset List", () => {
      cy.visit(page);
      cy.wait(500);
      cy.request(`${Cypress.env("apiAssetsMap")}`).then(({ body }) => {
        if (body.length > 0) {
          cy.get(`bridge-maps google-map .map-container div[title='${body[0].title}']`)
            .trigger("click")
            .then(() => {
              cy.wait(500);
              cy.get("mat-card-content .asset-list-group").should("have.class", "open");
              if (body[0].assets.length > 0) {
                cy.get("mat-card-content .asset-list-group .viewMore")
                  .click()
                  .then(() => {
                    cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assets"));
                    cy.get("bridge-asset-filter bridge-select[data-test='region-select']").should(
                      "have.attr",
                      "ng-reflect-selected-item",
                      body[0].title,
                    );
                  });
              }
            });
        }
      });
    });
  });
});
