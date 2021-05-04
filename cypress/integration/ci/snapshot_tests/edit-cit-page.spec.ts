interface CIT {
  country: string;
  id: string | number;
  isDeletable: boolean;
  isEditable: boolean;
  name: string;
  status: string;
  totalLocationCount: number;
}

describe("Snapshot-testing: Edit CIT Page", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const endpoints = Cypress.env("citEndpoints");

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetEditCIT + "*", `fx:edit-cit/edit-cit`)
          .as("apiGetEditCit");
        cy.visit(endpoints.pageEditCIT + "*").wait("@apiGetEditCit");
      });

      it(`Case: edit CIT general tab`, () => {
        cy.viewport(viewport.x, viewport.y);
        // select General tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("General").click({ force: true });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: edit CIT order tab`, () => {
        cy.viewport(viewport.x, viewport.y);
        // select Order tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Order").click({ force: true });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: edit CIT services tab`, () => {
        cy.viewport(viewport.x, viewport.y);
        // select Services tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Services").click({ force: true });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: edit CIT locations tab`, () => {
        cy.viewport(viewport.x, viewport.y);
        // select Locations tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Locations").click({ force: true });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: edit CIT calendar tab`, () => {
        cy.viewport(viewport.x, viewport.y);
        // select Calendar tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Calendar").click({ force: true });
        });

        // open panels
        cy.get("imo-expansion-table imo-expansion-panel").each(($el) => {
          cy.wrap($el).within(() => {
            cy.get("[data-test=column]").click({ force: true });
          });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
