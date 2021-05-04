describe("Story-Package", () => {
  let page = `${Cypress.env("packages")}`;
  before(() => {
    cy.server()
      .route("GET", `${Cypress.env("apiPackages")}*`)
      .as("apiPackages")
      .route("GET", `${Cypress.env("apiPackagesStatus")}*`)
      .as("apiPackagesStatus");
    cy.visit(page).wait(["@apiPackages"]);
  });
  context("Register Package", () => {
    it("Register Package", () => {
      cy.wait(1000);
      cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0`).then(({ body }) => {
        const { totalCount } = body;
        cy.get("bridge-package-management-page bridge-package-management-template bridge-upload .select")
          .click()
          .then(() => {
            cy.get("bridge-package-management-page bridge-package-management-template bridge-upload input#file-upload[type=file]")
              .attachFile("packages/files/e2e-firmware.zip")
              .then(() => {
                cy.wait(1000);
                cy.get("#toast-container").within(() => {
                  cy.visit(page);
                  cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0`).then(({ body }) => {
                    expect(body.totalCount).to.be.eq(totalCount + 1);
                  });
                });
              });
          });
      });
    });
  });
  context("Delete Package", () => {
    it("Delete package", () => {
      // open packages page
      cy.visit(page);
      cy.wait(1000);
      cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0`).then(({ body }) => {
        cy.wait(1000);
        const { totalCount } = body;
        cy.get("[data-test=package-table]").should("be.visible");
        cy.get("[data-test=delete-action]:first")
          .click({ force: true })
          .wait(1000)
          .then(() => {
            cy.get("[data-test=delete-action]:first")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                cy.wait(100);
                cy.get(".confirm")
                  .click()
                  .then(() => {
                    cy.server()
                      .route("DELETE", `/api/packages/*`)
                      .as("apiPackagesDelete");
                    cy.wait("@apiPackagesDelete");
                    cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0`).then(({ body }) => {
                      cy.wait(1000);
                      expect(body.totalCount).to.be.eq(totalCount - 1);
                    });
                  });
              });
          });
      });
    });
  });
});
