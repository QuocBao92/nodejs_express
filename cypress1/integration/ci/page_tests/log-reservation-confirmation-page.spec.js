/// <reference types="Cypress" />

let apiTasks, apiTasksLogs, logsNew;
const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
describe("Page-Log Reservation Confirmation", () => {
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
  let page = 0,
    apiAssets;
  const timeZone = `GMT${Cypress.moment().format("Z")}`;
  before(() => {
    apiAssetDetail = Cypress.env("apiAssetDetail");
    apiTasks = Cypress.env("apiTasks");
    apiTasksLogs = Cypress.env("apiTasksLogs");
    logsNew = Cypress.env("logsNew");
    apiAssets = Cypress.env("apiAssets");
    apiTypes = Cypress.env("apiTypes");
    apiRegions = Cypress.env("apiRegions");
    apiCustomers = Cypress.env("apiCustomers");
    apiLocations = Cypress.env("apiLocations");
  });
  context("initial display", () => {
    it("initial display", () => {
      const task = {
        assets: [],
      };
      cy.visit(Cypress.env("logsNew"));
      cy.get("bridge-log-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          // select assets
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(($el) => {
            if (Cypress.$($el).length > 2) {
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                    .click()
                    .then(() => {
                      const data = {};
                      cy
                        .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                        .find("td")
                        .each(($td, index) => {
                          if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                        }),
                        task.assets.push(data);
                    });
                });
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
              // set memo
              const memo = "test button cancel";
              cy.get("bridge-log-reservation-page")
                .find("fieldset form textarea[data-test='memo']")
                .type(memo);
              // Check the value of Start at
              cy.get("bridge-log-reservation-page")
                .find("bridge-radio")
                .last()
                .click();
              // Date / Time value check
              cy.get("bridge-log-reservation-page")
                .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                    .click()
                    .then(() => {
                      cy.get(".download-setting bridge-time-picker bridge-button button")
                        .click()
                        .then(() => {
                          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                            .scrollTo("bottom")
                            .then(() => {
                              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                                cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option`)
                                  .last()
                                  .click();
                              });
                            });
                        });
                    });
                });

              //  Confirm button status check (activity)
              cy.get("bridge-log-reservation-page")
                .find("bridge-button[data-test='confirm-button'] button")
                .last()
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("[data-test='asset-selected-table'] bridge-table tbody")
                    .find("tr")
                    .its("length")
                    .should("be.eq", task.assets.length);
                  //Display check (display) of the number of items in the Target Asset list
                  cy.get("[data-test='asset-selected-table'] bridge-table tbody tr").each(($el, i) => {
                    keysAsset.forEach((value, index) => {
                      switch (value) {
                        case "status":
                          cy.wrap($el)
                            .find(`td:eq(${index}) .badge`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", task.assets[i][value].trim());
                          break;
                        default:
                          cy.wrap($el)
                            .find(`td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", task.assets[i][value].trim());
                          break;
                      }
                    });
                  });
                  cy.get(`bridge-pagination[data-test="asset-pagination"] nav.pagination button`)
                    .its("length")
                    .should("eq", Math.min(10, Math.ceil(task.assets.length / 10) + 2));
                  cy.get("bridge-pagination[data-test='asset-pagination']")
                    .find("span.description")
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("eq", `1 to ${Math.min(task.assets.length, 10)} of ${task.assets.length} items`);
                  cy.get(".download-setting bridge-radio-group")
                    .find("input")
                    .should("have.disabled", "disabled");

                  cy.get(".download-setting bridge-radio-group")
                    .find("bridge-radio:eq(0)")
                    .should("have.attr", "ng-reflect-checked", "false");

                  cy.get(".download-setting bridge-radio-group")
                    .find("bridge-radio:eq(1)")
                    .should("have.attr", "ng-reflect-checked", "true");

                  cy.get("bridge-log-reservation-confirmation-page")
                    .find("[data-test='task-memo']")
                    .should("not.have.text", "test edit confirm");

                  cy.get(".download-setting")
                    .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
                    .should("have.disabled", "disabled")
                    .should("not.have.value", "");
                  cy.get(".download-setting")
                    .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
                    .should("be.enabled");
                  cy.get(".download-setting")
                    .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
                    .should("have.disabled", "disabled")
                    .should("not.have.value", "");
                  cy.get(".download-setting")
                    .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
                    .should("be.enabled", "enabled");
                  cy.get(".download-setting")
                    .find(".time-zone-group p")
                    .should("be.visible", timeZone);
                });
            }
          });
        });
    });
  });
  context("Cancel operations", () => {
    it("Click the Cancel button after changing the values on the screen", () => {
      const task = {
        assets: [],
      };
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("logsNew")).wait("@apiAssets");
      cy.get("bridge-log-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          // select assets
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(($el) => {
            if (Cypress.$($el).length > 2) {
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                    .click()
                    .then(() => {
                      const data = {};
                      cy
                        .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                        .find("td")
                        .each(($td, index) => {
                          if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                        }),
                        task.assets.push(data);
                    });
                });
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
              // set memo
              const memo = "test button cancel";
              cy.get("bridge-log-reservation-page")
                .find("fieldset form textarea[data-test='memo']")
                .type(memo)
                .should("have.value", "test button cancel");
              // Check the value of Start at
              cy.get("bridge-log-reservation-page")
                .find("bridge-radio")
                .last()
                .click()
                .should("have.attr", "ng-reflect-value", "true");
              // Date / Time value check
              cy.get("bridge-log-reservation-page")
                .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                    .click()
                    .then(() => {
                      cy.get(".download-setting bridge-time-picker bridge-button button")
                        .click()
                        .then(() => {
                          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                            .scrollTo("bottom")
                            .then(() => {
                              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                                cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option`)
                                  .last()
                                  .click()
                                  .then(() => {
                                    cy.get(".download-setting bridge-time-picker")
                                      .invoke("attr", "ng-reflect-default")
                                      .then((value) => {
                                        const check = Cypress.moment.utc(value);
                                        const date = (check.isValid() && check.format("M/D/YYYY")) || "";
                                        cy.get("bridge-date-picker mat-form-field:eq(0) .mat-form-field-infix input")
                                          .first()
                                          .should("have.value", date);
                                        const time = (check.isValid() && check.format("h:mm A")) || "";
                                        cy.get("bridge-time-picker mat-form-field:eq(0) .mat-form-field-infix input")
                                          .first()
                                          .should("have.value", time);
                                      });
                                  });
                              });
                            });
                        });
                    });
                });

              //  Confirm button status check (activity)
              cy.get("bridge-log-reservation-page")
                .find("bridge-button[data-test='confirm-button'] button")
                .last()
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-log-reservation-confirmation-page")
                    .find("bridge-button[data-test='cancel-button'] button")
                    .click()
                    .within(() => {
                      cy.root()
                        .parents("body")
                        .find("mat-dialog-container bridge-alert")
                        .should("exist")
                        .within(() => {
                          cy.get(".description").contains("Are you sure to leave from this page?");
                          cy.get("bridge-button")
                            .first()
                            .should("be.visible");
                          cy.get("bridge-button")
                            .last()
                            .should("be.visible");
                        });
                    });
                });
            }
          });
        });
    });
    it("Click Cancel button in the confirmation dialog", () => {
      const task = {
        assets: [],
      };
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("logsNew")).wait("@apiAssets");
      cy.get("bridge-log-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          // select assets
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(($el) => {
            if (Cypress.$($el).length > 2) {
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                    .click()
                    .then(() => {
                      const data = {};
                      cy
                        .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                        .find("td")
                        .each(($td, index) => {
                          if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                        }),
                        task.assets.push(data);
                    });
                });
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
              // set memo
              const memo = "test button cancel";
              cy.get("bridge-log-reservation-page")
                .find("fieldset form textarea[data-test='memo']")
                .type(memo)
                .should("have.value", "test button cancel");
              // Check the value of Start at
              cy.get("bridge-log-reservation-page")
                .find("bridge-radio")
                .last()
                .click()
                .should("have.attr", "ng-reflect-value", "true");
              // Date / Time value check
              cy.get("bridge-log-reservation-page")
                .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                    .click()
                    .then(() => {
                      cy.get(".download-setting bridge-time-picker bridge-button button")
                        .click()
                        .then(() => {
                          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                            .scrollTo("bottom")
                            .then(() => {
                              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                                cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option`)
                                  .last()
                                  .click()
                                  .then(() => {
                                    cy.get(".download-setting bridge-time-picker")
                                      .invoke("attr", "ng-reflect-default")
                                      .then((value) => {
                                        const check = Cypress.moment.utc(value);
                                        const date = (check.isValid() && check.format("M/D/YYYY")) || "";
                                        cy.get("bridge-date-picker mat-form-field:eq(0) .mat-form-field-infix input")
                                          .first()
                                          .should("have.value", date);
                                        const time = (check.isValid() && check.format("h:mm A")) || "";
                                        cy.get("bridge-time-picker mat-form-field:eq(0) .mat-form-field-infix input")
                                          .first()
                                          .should("have.value", time);
                                      });
                                  });
                              });
                            });
                        });
                    });
                });

              //  Confirm button status check (activity)
              cy.get("bridge-log-reservation-page")
                .find("bridge-button[data-test='confirm-button'] button")
                .last()
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-log-reservation-confirmation-page")
                    .find("bridge-button[data-test='cancel-button'] button")
                    .click()
                    .within(() => {
                      cy.root()
                        .parents("body")
                        .find("mat-dialog-container bridge-alert")
                        .should("exist")
                        .within(() => {
                          cy.get("bridge-button")
                            .first()
                            .click()
                            .then(() => {
                              cy.root()
                                .parents("body")
                                .find("mat-dialog-container bridge-alert")
                                .should("not.exist");
                              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("logsNewConfirm"));
                            });
                        });
                    });
                });
            }
          });
        });
    });
  });
});
