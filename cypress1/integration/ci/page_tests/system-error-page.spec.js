/// <reference types="Cypress" />

let data = {};
const assetNoData = "assetNoData";
const permissionError = "permissionError";
const credentialsExpired = "credentialsExpired";
const visitDataUrl = (key) => {
  return cy.visit(Cypress.env(key));
};
const imageNoFound = "assets/img/icons/info-circle-solid.svg";
const imagePermission = "assets/img/icons/exclamation-triangle-solid.svg";
const imageCredentials = "assets/img/icons/exclamation-triangle-solid.svg";
describe("Page-System Error,no-data", () => {
  before(() => {
    visitDataUrl(assetNoData);
  });
  context("Initial display", () => {
    it("Initial display", () => {
      // Icon display check
      cy.get("bridge-no-data-page bridge-system-error bridge-svg-icon img")
        .invoke("attr", "src")
        .should("eq", imageNoFound);
      // Title value check (Data Not Found)
      cy.get("bridge-no-data-page bridge-system-error h2.title").should("have.text", "Data Not Found");
      // Message value check (Your requested data is not found.)
      cy.get("bridge-no-data-page bridge-system-error p.content").should("have.text", "Your requested data is not found.");
      // Link message check (Back to list)
      cy.get("bridge-no-data-page bridge-system-error .link span").should("have.text", "Back to list");
    });
  });
  context("Link operations", () => {
    it("Click the Back to list link button", () => {
      cy.get("bridge-no-data-page bridge-system-error .link a")
        .click()
        .then(() => {
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("assets"));
        });
    });
  });
});

describe("Page-System Error,permission-error", () => {
  before(() => {
    visitDataUrl(permissionError);
  });
  context("Initial display", () => {
    it("Initial display", () => {
      // Icon display check
      cy.get("bridge-permission-error-page bridge-system-error bridge-svg-icon img")
        .invoke("attr", "src")
        .should("eq", imagePermission);
      // Title value check (You need permission)
      cy.get("bridge-permission-error-page bridge-system-error h2.title").should("have.text", "You need permission");
      // Check the value of the message (You have not permission to perform this action. Ask for access, or switch to an account with permission.)
      cy.get("bridge-permission-error-page bridge-system-error p.content").should(
        "have.text",
        "You have not permission to perform this action. Ask for access, or switch to an account with permission.",
      );
      //  Link message check (Back to portal, Login)
      cy.get("bridge-permission-error-page bridge-system-error .link a:eq(0) span").should("have.text", "Login");
    });
  });

  context("Link operations", () => {
    it("Click the Login link button", () => {
      visitDataUrl(permissionError);
      cy.get("bridge-permission-error-page bridge-system-error .link a:eq(0)")
        .click()
        .then(() => {
          cy.location("href").should("eq", Cypress.config("baseUrl") + "/logout");
        });
    });
  });
});

describe("Page Credentials-expired", () => {
  before(() => {
    visitDataUrl(credentialsExpired);
  });
  context("Initial display", () => {
    it("Initial display", () => {
      // Icon display check
      cy.get("bridge-credentials-expired-page bridge-system-error bridge-svg-icon img")
        .invoke("attr", "src")
        .should("eq", imageCredentials);
      // Title value check (Session Expired)
      cy.get("bridge-credentials-expired-page bridge-system-error h2.title").should("have.text", "Session Expired");
      // Check the value of the message (Your session has expired due to inactivity. Please login again to continue working.)
      cy.get("bridge-credentials-expired-page bridge-system-error p.content").should(
        "have.text",
        "Your session has expired due to inactivity. Please login again to continue working.",
      );
      //  Link message check (Login)
      cy.get("bridge-credentials-expired-page bridge-system-error .link a span").should("have.text", "Login");
    });
  });

  context("Link operations", () => {
    it("Click the Login link button", () => {
      visitDataUrl(credentialsExpired);
      cy.get("bridge-credentials-expired-page bridge-system-error .link a")
        .click()
        .then(() => {
          cy.location("href").should("eq", Cypress.config("baseUrl") + "/logout");
        });
    });
  });
});
