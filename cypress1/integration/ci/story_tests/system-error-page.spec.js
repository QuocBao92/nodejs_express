/// <reference types="Cypress" />
describe("Page Credentials-expired", () => {
  context("Initial display go to credentials-expired", () => {
    it("go to credentials-expired", () => {
      cy.setCookie("connect.sid", "000-000-00");
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("DataTaskList")
        .route({ response: { status: 401 }, url: `${Cypress.env("apiPackages")}*`, status: 401 })
        .as("Credentials");
      cy.visit(Cypress.env("tasks"));
      cy.wait("@DataTaskList").then(() => {
        cy.get("bridge-header-tab bridge-header-tab-item")
          .eq(2)
          .click({ force: true });
        cy.wait("@Credentials").then(() => {
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("credentialsExpired"));
        });
      });
    });
  });
  context("Initial display not go to credentials-expired", () => {
    it(" not go to credentials-expired", () => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("DataTaskList")
        .route({ response: { status: 200 }, url: `${Cypress.env("apiPackages")}*`, status: 200 })
        .as("Credentials");
      cy.visit(Cypress.env("tasks"));
      cy.wait("@DataTaskList").then(() => {
        cy.get("bridge-header-tab bridge-header-tab-item")
          .eq(2)
          .click({ force: true });
        cy.wait("@Credentials").then(() => {
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("packages"));
        });
      });
    });
  });
});
