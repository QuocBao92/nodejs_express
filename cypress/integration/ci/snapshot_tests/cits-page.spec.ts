describe("Snapshot-testing: CITs Page", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const citEndpoints = Cypress.env("citEndpoints");

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      it(`Case: cits`, () => {
        cy.viewport(viewport.x, viewport.y);

        // visit CITs page and take a snapshot
        cy.server()
          .route("GET", Cypress.env("host") + citEndpoints.apiViewCITs, `fx:cits/cits`)
          .as("apiViewCITs");
        cy.visit(citEndpoints.pageCITs).wait("@apiViewCITs");

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // click Delete button and take a snapshot
        cy.get(".page-content imo-table tbody").within(() => {
          cy.get("imo-button").contains("Delete").click({ force: true });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        cy.server({
          method: "DELETE",
          status: 204,
          response: {},
        });
        cy.route("DELETE", Cypress.env("host") + citEndpoints.apiDeleteCIT.replace(":id", "0")).as("apiDeleteCIT");

        // click confirm Delete button and take a snapshot
        cy.get("body")
          .find("imo-alert")
          .within(() => {
            cy.get(".confirm:contains(Delete)").click();
          });

        cy.get("button").parents("body").find(".mat-simple-snackbar-action button").click();
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
