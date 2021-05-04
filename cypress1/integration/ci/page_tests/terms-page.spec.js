/// <reference types="Cypress" />
describe("terms-page", () => {
  context("Page-terms and conditions,View in modal window", () => {
    before(() => {
      cy.visit(Cypress.env("termConditions"));
    });
    it("Initial display", () => {
      cy.get("bridge-terms .content[data-test='content']").should("be.visible");
      cy.get("mat-checkbox[data-test='agree-check']").should("have.class", "mat-checkbox-disabled");
      cy.get(".buttons [data-test='agree-button'] button").should("be.disabled");
    });
  });

  context("Scroll down the terms of service to the bottom", () => {
    before(() => {
      cy.visit(Cypress.env("termConditions"));
    });
    it("Scroll operations", () => {
      cy.get("bridge-terms .content[data-test='content']").scrollTo("bottom");
      cy.get("mat-checkbox[data-test='agree-check']").should("not.have.class", "mat-checkbox-disabled");
    });
  });

  context("Click the I agree checkbox", () => {
    before(() => {
      cy.visit(Cypress.env("termConditions"));
    });

    it("Checkbox operations", () => {
      cy.get("bridge-terms .content[data-test='content']").scrollTo("bottom");
      cy.get("mat-checkbox")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".buttons [data-test='agree-button']")
            .invoke("attr", "ng-reflect-is-disabled")
            .should("eq", "false");
        });
    });
  });
  context("Click the Cancel button", () => {
    before(() => {
      cy.visit(Cypress.env("termConditions"));
    });

    it("Cancel operations", () => {
      cy.get("bridge-terms .content[data-test='content']").scrollTo("bottom");
      cy.get("mat-checkbox").click();
      cy.get(".buttons [data-test='cancel-button']").click();
      cy.window()
        .its("sessionStorage")
        .invoke("getItem", "email")
        .should("not.exist");
    });
  });
  context("Click the I Agree button", () => {
    before(() => {
      cy.visit(Cypress.env("termConditions"));
    });

    it("I Agree operations", () => {
      cy.get("bridge-terms .content[data-test='content']").scrollTo("bottom");
      cy.get("mat-checkbox").click();
      cy.get(".buttons [data-test='agree-button'] button")
        .click({ force: true })
        .then(() => {
          cy.url().should("include", Cypress.env("dashboard"));
        });
    });
  });
});
