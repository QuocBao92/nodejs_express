/// <reference types="Cypress" />
describe("Story - ContectMenu story", () => {
  let page = `${Cypress.env("dashboard")}`;
  context("Change Password", () => {
    it("Click Change Password and Button Ok", () => {
      cy.server()
        .route("POST", `${Cypress.env("apiChangePassword")}*`, `fx:changePassword/sample`)
        .as("postChangePassword");
      cy.visit(page);
      cy.wait(500);
      cy.get("bridge-header bridge-svg-icon")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get("bridge-dropdown-menu bridge-dropdown-menu-item:eq(1)")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get("bridge-alert").should("be.visible");
              cy.get("bridge-alert bridge-button.cancel").should("be.visible");
              cy.get("bridge-alert bridge-button.confirm").should("be.visible");
              cy.wait(500);
              cy.get("bridge-alert bridge-button.confirm")
                .click({ force: true })
                .then(() => {
                  cy.wait("@postChangePassword");
                });
              cy.wait(1000);
              cy.get("bridge-alert").should("be.visible");
              cy.get("bridge-alert bridge-button.confirm")
                .should("be.visible")
                .click({ force: true })
                .then(() => {
                  cy.get("bridge-alert").should("not.be.visible");
                });
            });
        });
    });
    it("Click Change Password and Button Cancel", () => {
      cy.visit(page);
      cy.wait(500);
      cy.get("bridge-header bridge-svg-icon")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get("bridge-dropdown-menu bridge-dropdown-menu-item:eq(1)")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get("bridge-alert bridge-button.cancel")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-alert").should("not.be.visible");
                });
            });
        });
    });
  });
});
