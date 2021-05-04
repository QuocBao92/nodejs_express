describe("Story-Asset Story", () => {
  beforeEach(() => {
    cy.server()
      .route("GET", `${Cypress.env("apiAssets")}*`)
      .as("apiAssets")
      .route("GET", `${Cypress.env("apiTypes")}*`)
      .as("apiTypes")
      .route("GET", `${Cypress.env("apiRegions")}*`)
      .as("apiRegions")
      .route("GET", `${Cypress.env("apiCustomers")}*`)
      .as("apiCustomers");
    cy.visit(Cypress.env("assets")).wait(["@apiAssets", "@apiTypes", "@apiRegions", "@apiCustomers"]);
  });
  context("Browse Asset Detail", () => {
    it("Click the Asset in the Asset List search results to go to the Asset Detail", () => {
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="ok"]')
        .click()
        .then(() => {
          cy.request(`${Cypress.env("apiAssets")}?sort=desc&isFilter=true&limit=10&offset=0`).then(({ body }) => {
            cy.wait(1000);
            if (body.items.length > 0) {
              cy.get("bridge-table tbody tr:eq(0)")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
                });
            }
          });
        });
    });
    it("Click the Back to asset list link button in Asset Detail to return to the Asset List", () => {
      cy.request(`${Cypress.env("apiAssets")}?sort=desc&isFilter=true&limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        if (body.items.length > 0) {
          cy.get("bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
              cy.get("bridge-asset-detail-page bridge-asset-detail-template .back-button .back-text")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assets"));
                });
            });
        }
      });
    });
  });
  context("Transition to Reboot task", () => {
    it("Click the Reboot button in Asset Detail to go to Create New Reboot", () => {
      cy.request(`${Cypress.env("apiAssets")}?limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        if (body.items.length > 0) {
          cy.get("bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
              cy.get("bridge-card .none-list li:eq(0) bridge-button button")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("rebootNew"));
                });
            });
        }
      });
    });
    it("Click the Self test button in Asset Detail to go to Create New Self Test", () => {
      cy.request(`${Cypress.env("apiAssets")}?limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        if (body.items.length > 0) {
          cy.get("bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
              cy.get("bridge-card .none-list li:eq(1) bridge-button button")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
                });
            });
        }
      });
    });
    it("Click the Update button in Asset Detail to go to Create New Deployment", () => {
      cy.request(`${Cypress.env("apiAssets")}?limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        if (body.items.length > 0) {
          cy.get("bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
              cy.get("bridge-card .none-list li:eq(2) bridge-button button")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
                });
            });
        }
      });
    });
    it("Click the Log Collection button in Asset Detail to go to Create New Retrieve Log", () => {
      cy.request(`${Cypress.env("apiAssets")}?limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        if (body.items.length > 0) {
          cy.get("bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
              cy.get("bridge-card .none-list li:eq(3) bridge-button button")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("logsNew"));
                });
            });
        }
      });
    });
  });
  context("Browse Event List", () => {
    it("Click the View All button in Asset Detail to go to Event List", () => {
      cy.request(`${Cypress.env("apiAssets")}?limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        if (body.items.length > 0) {
          cy.get("bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
              cy.get("bridge-event-list-board bridge-button")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetEvents"));
                });
            });
        }
      });
    });
    it("Click the Back to Asset Detail link button in Event List to return to the Asset Detail", () => {
      cy.request(`${Cypress.env("apiAssets")}?limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        if (body.items.length > 0) {
          cy.get("bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
              cy.get("bridge-event-list-board bridge-button")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetEvents"));
                  cy.get("bridge-event-list-page bridge-event-list-template mat-sidenav-content .back-button .back-text")
                    .click()
                    .then(() => {
                      cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assetDetail"));
                    });
                });
            });
        }
      });
    });
  });
});
