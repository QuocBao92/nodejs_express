describe.skip("Accessibility-Deployments new page", () => {
  beforeEach(() => {
    cy.server()
      .route("GET", Cypress.env("apiAssets"), `fx:assets/list/sample`)
      .as("getAssets");
    cy.server()
      .route("GET", Cypress.env("apiPackages"), `fx:packages/sample`)
      .as("getPackages");
    cy.visit(Cypress.env("deploymentsNew"));
    cy.injectAxe();
  });
  it("Has no violations on load", () => {
    cy.checkA11y(); // fail for a11y violations
  });
  it("Has no violations on packages list view in modal", () => {
    cy.get("[data-test=package-modal]").click({ force: true });
    cy.wait("@getPackages");
    cy.checkA11y("[data-test=package-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });
  it("Has no violations on package select in modal view", () => {
    cy.get("[data-test=package-modal]").click({ force: true });

    cy.get("bridge-expansion-panel:first")
      .should("be.visible")
      .find("input[type=checkbox]")
      .check({ force: true })
      .wait("@getPackages");
    cy.checkA11y("[data-test=package-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });

  it("Has no violations on assets list view in modal", () => {
    cy.get("[data-test=asset-modal]").click({ force: true });
    cy.wait("@getAssets");
    cy.checkA11y("[data-test=asset-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });

  it("Has no violations on asset select in modal view", () => {
    cy.get("[data-test=asset-modal]").click({ force: true });

    cy.get("[data-test=asset-table] > tbody")
      .within(() => {
        cy.get("tr > td.checked:first > .mat-checkbox")
          .find("input[type=checkbox]")
          .check({ force: true });
      })
      .wait("@getAssets");
    cy.checkA11y("[data-test=asset-table]", { runOnly: ["wcag2a", "wcag2aa"] });
  });

  it("Has no violations on package and assets selection ", () => {
    cy.get("[data-test=package-modal]").click({ force: true });

    cy.get("[data-test=package-table]")
      .within(() => {
        cy.get("bridge-expansion-panel")
          .as("row")
          .each((_, i) => {
            if (i > 5) {
              return false;
            }
            cy.get("@row")
              .eq(i)
              .within(() => {
                cy.get("input[type=checkbox]").check({ force: true });
              });
          });
      })
      .wait("@getPackages");

    cy.get("mat-dialog-actions > bridge-button > button")
      .contains("OK")
      .click();

    cy.get("[data-test=asset-modal]").click({ force: true });

    cy.get("[data-test=asset-table] > tbody")
      .within(() => {
        cy.get("[data-test=table-row]")
          .as("row")
          .each((_, i) => {
            if (i > 5) {
              return false;
            }
            cy.get("@row")
              .eq(i)
              .within(() => {
                cy.get("input[type=checkbox]").check({ force: true });
              });
          });
      })
      .wait("@getAssets");

    cy.get("mat-dialog-actions > bridge-button > button")
      .contains("OK")
      .click();

    cy.checkA11y();
  });

  it("Has no violations on date select", () => {
    cy.get("[data-test=start-time-options] input[type=radio][value=true]").check({ force: true });
    cy.get("[data-test=expire-time-options] input[type=radio][value=true]").check({ force: true });
    cy.checkA11y();
  });

  it("Has no violations on date select calender", () => {
    cy.get("[data-test=start-time-options] input[type=radio][value=true]").check({ force: true });
    cy.get("[data-test=start-time-picker] bridge-date-picker")
      .find("button")
      .click();
    cy.checkA11y(".mat-calendar", { runOnly: ["wcag2a", "wcag2aa"] });
  });

  it("Has no violations on time select", () => {
    cy.get("[data-test=start-time-options] input[type=radio][value=true]").check({ force: true });
    cy.get("[data-test=start-time-picker] bridge-time-picker")
      .find("button")
      .click();
    cy.checkA11y();
  });

  it("Has no violations on confirm", () => {
    cy.get("[id=name]").type("test reservation");

    cy.get("[data-test=package-modal]").click({ force: true });
    cy.get("[data-test=package-table]")
      .within(() => {
        cy.get("bridge-expansion-panel")
          .as("row")
          .each((_, i) => {
            if (i > 5) {
              return false;
            }
            cy.get("@row")
              .eq(i)
              .within(() => {
                cy.get("input[type=checkbox]").check({ force: true });
              });
          });
      })
      .wait("@getPackages");

    cy.get("mat-dialog-actions > bridge-button > button")
      .contains("OK")
      .click();

    cy.get("[data-test=asset-modal]").click({ force: true });

    cy.get("[data-test=asset-table] > tbody")
      .within(() => {
        cy.get("[data-test=table-row]")
          .as("row")
          .each((_, i) => {
            if (i > 5) {
              return false;
            }
            cy.get("@row")
              .eq(i)
              .within(() => {
                cy.get("input[type=checkbox]").check({ force: true });
              });
          });
      })
      .wait("@getAssets");

    cy.get("mat-dialog-actions > bridge-button > button")
      .contains("OK")
      .click();

    const remainder = 30 - (Cypress.moment().format("m") % 30);
    const startTime = Cypress.moment()
      .add(remainder, "minutes")
      .format("LT");
    const endTime = Cypress.moment()
      .add(remainder + 30, "minutes")
      .format("LT");

    cy.get("[data-test=start-time-options] input[type=radio][value=true]").check({ force: true });
    cy.get("[data-test=start-time-picker] bridge-date-picker input").type(Cypress.moment().format("M/D/YYYY"));

    cy.get("[data-test=expire-time-options] input[type=radio][value=true]").check({ force: true });
    cy.get("[data-test=expire-time-picker] bridge-date-picker input").type(Cypress.moment().format("M/D/YYYY"));
    cy.get("[data-test=start-time-picker] bridge-time-picker")
      .find("button")
      .click()
      .parents("body")
      .find(".time-picker")
      .contains(".mat-option-text", startTime)
      .click();

    cy.get("[data-test=expire-time-picker] bridge-time-picker")
      .find("button")
      .click()
      .parents("body")
      .find(".time-picker")
      .contains(".mat-option-text", endTime)
      .click();

    cy.get("[data-test=confirm-button]").click();
    cy.checkA11y("[data-test=confirmation]", { runOnly: ["wcag2a", "wcag2aa"] });
  });
});
