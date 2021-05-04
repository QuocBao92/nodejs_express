const viewports = [
  { x: 1600, y: 1000, target: "PC" },
  // { x: 768, y: 1024, target: "iPad (portrait)" },
  // { x: 1024, y: 768, target: "iPad (landscape)" },
  // { x: 375, y: 812, target: "iPhone X (portrait)" },
  // { x: 812, y: 375, target: "iPhone X (landscape)" },
  // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
  // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
];

describe("Snapshot-testing: Create order Page", () => {
  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      it(`Case: create-order`, () => {
        cy.viewport(viewport.x, viewport.y);
        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"), `fx:create-order/organizations`)
          .as("apiOrderStart");
        cy.visit(Cypress.env("createOrder")).wait("@apiOrderStart");

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        cy.get("imo-button").contains("Select").click();
        cy.get("body").toMatchImageSnapshot();

        cy.server()
          .route(
            "GET",
            Cypress.env("host") + Cypress.env("apiSelectedLocationAndCIT") + "?locationId=1&citId=1",
            `fx:create-order/selected-location-and-cit`,
          )
          .as("apiSelectedLocationAndCIT");

        cy.get("mat-dialog-container").within(() => {
          // select a location

          cy.get("tbody").within(() => {
            cy.get("tr:first").click({ force: true });
          });

          // OK button should be visible when location was selcted
          cy.get("mat-dialog-actions > imo-button > button").contains("OK").click();
        });

        cy.wait("@apiSelectedLocationAndCIT");
        cy.get("body").toMatchImageSnapshot();

        // select emergency order date and take a snapshot
        cy.get("mat-radio-group").within(() => {
          cy.get("mat-radio-button:nth-child(2)")
            .contains("Emergency order")
            .within(() => {
              cy.get("input[type=radio]").click({ force: true });
            });
        });

        cy.get("[data-test=select-date-emergency]").within(() => {
          cy.get("button").click();
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
        cy.get("body").type("{esc}");

        // fill Order Detail table, then click Save and take a snapshot
        cy.get("imo-order-detail-table mat-form-field").first().find("input").type("21000");
        cy.get("imo-button").contains("Save").click();

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
