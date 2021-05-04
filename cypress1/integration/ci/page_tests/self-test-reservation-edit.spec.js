/// <reference types="Cypress" />

let apiTasks, selfTestEdit, apiTasksSelfTestsId;
const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
let data;
describe("Page-Self Test Reservation Edit", () => {
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
  const keysAssetSelect = ["status", "assetId", "alias", "typeId", "customerId", "regionId", "locationId"];
  let page = 0,
    apiAssets;
  const timeZone = `GMT${Cypress.moment().format("Z")}`;
  before(() => {
    apiTasksSelfTestsId = Cypress.env("apiTasksSelfTestsId");
    selfTestEdit = Cypress.env("selfTestEdit");
    apiAssets = Cypress.env("apiAssets");
  });
  context("initial display", () => {
    it("initial display", () => {
      const task = {
        assets: [],
      };
      cy.server()
        .route("GET", `${apiTasksSelfTestsId}*`)
        .as("apiTasksSelfTestsId");
      cy.visit(Cypress.env("selfTestEdit"))
        .wait("@apiTasksSelfTestsId")
        .then((api) => {
          task.assets = api.response.body.assets;
          cy.request("GET", `${Cypress.env("apiTasksSelfTestsId")}`).then((res) => {
            const { body } = res;
            cy.get(`bridge-table[data-test="asset-selected-table"]`).should("exist");
            cy.wait(500);
            cy.get("bridge-table[data-test='asset-selected-table'] tbody")
              .find("tr")
              .its("length")
              .should("be.eq", task.assets.length);

            //Display check (display) of the number of items in the Target Asset list
            cy.get("bridge-table[data-test='asset-selected-table'] tbody tr").each(($el, i) => {
              keysAssetSelect.forEach((value, index) => {
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
            page = 0;
            cy.get("bridge-pagination[data-test='asset-selected-pagination']")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", `1 to ${Math.min(task.assets.length, 10)} of ${task.assets.length} items`);
            // check value memo
            cy.get("bridge-self-test-reservation-edit-page")
              .find("textarea[data-test='memo']")
              .should("have.value", body.memo);
            // check status memo(Active)
            cy.get("bridge-self-test-reservation-edit-page")
              .find("textarea[data-test='memo']")
              .should("be.enabled");
            // Check the value of Start at
            cy.get("bridge-self-test-reservation-edit-page")
              .find("bridge-radio")
              .last()
              .should("have.attr", "ng-reflect-value", "true");
            // Date value check
            cy.get("bridge-self-test-reservation-edit-page .download-setting")
              .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
              .then(() => {
                const newDate = Cypress.moment(new Date(body.detail.startAt)).format("MM/DD/YYYY") || "";
                cy.get("bridge-date-picker mat-form-field:eq(0) .mat-form-field-infix input").should("have.value", newDate);
              });
            // Time value check
            cy.get("bridge-self-test-reservation-edit-page .download-setting")
              .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
              .then(() => {
                const newTime = Cypress.moment(new Date(body.detail.startAt)).format("hh:mm A") || "";
                cy.get("bridge-time-picker mat-form-field:eq(0) .mat-form-field-infix input").should("have.value", newTime);
              });
            // Time zone value check
            cy.get("bridge-self-test-reservation-edit-page .download-setting")
              .find(".time-zone-group p")
              .should("be.visible", timeZone);
            //  Confirm button status check (activity)
            cy.get("bridge-self-test-reservation-edit-page")
              .find("bridge-button[data-test='confirm-button'] button")
              .should("not.be.disabled");
          });
        });
    });
  });
  context("Target Asset operations", () => {
    it("Click the Select assets button", () => {
      cy.visit(Cypress.env("selfTestEdit"));
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal .header`).then(($el) => {
            cy.wrap($el).should("be.visible", "Select Assets");
          });
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal .cancel-button`).click();
        });
    });

    it("Display after an asset is selected, more than 1 selection", () => {
      const task = {
        assets: [],
      };
      cy.server()
        .route("GET", `${apiTasksSelfTestsId}*`)
        .as("apiTasksSelfTestsId");
      cy.visit(Cypress.env("selfTestEdit"))
        .wait("@apiTasksSelfTestsId")
        .then((api) => {
          task.assets = api.response.body.assets;
          cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(($el) => {
                if (Cypress.$($el).length > 2) {
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                        .click()
                        .then(() => {
                          const data = {};
                          cy
                            .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
                            .find("td")
                            .each(($td, index) => {
                              if (index > 0) cy.wrap($td).within((t) => (data[keysAssetSelect[index - 1]] = t.text()));
                            }),
                            task.assets.push(data);
                        });
                    });
                  cy.wait(500);
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get("bridge-table tbody")
                        .find("tr")
                        .its("length")
                        .should("eq", Math.min(task.assets.length, 10));
                      //Display check (display) of the number of items in the Target Asset list
                      cy.get("bridge-table[data-test='asset-selected-table'] tbody tr").each(($el, i) => {
                        keysAssetSelect.forEach((value, index) => {
                          switch (value) {
                            case "status":
                              cy.wrap($el)
                                .find(`td:eq(${index}) .badge`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("eq", task.assets[i][value].trim());
                              break;
                            default:
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("eq", task.assets[i][value].trim());
                              break;
                          }
                        });
                      });
                      cy.get(`bridge-pagination[data-test="asset-selected-pagination"] nav.pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(task.assets.length / 10) + 2));
                      cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", `1 to ${Math.min(task.assets.length, 10)} of ${task.assets.length} items`);
                    });
                }
              });
            });
        });
    });

    it("Displayed after an asset is selected, 0 selections", () => {
      cy.visit(Cypress.env("selfTestEdit"));
      cy.get("bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                    .click()
                    .then(() => {
                      cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                        .last()
                        .click()
                        .then(() => {
                          // Check the display of the Target Asset list (hide)
                          cy.get("bridge-table[data-test='asset-selected-table'").should("not.exist");
                          // Display check of the number of Assets (non-display)
                          cy.get("bridge-pagination[data-test='asset-selected-pagination'] span.description").should("not.be.visible");
                          // Asset paging display check (non-display)
                          cy.get("bridge-pagination[data-test='asset-selected-pagination']").should("not.be.visible");
                        });
                    });
                });
            });
        });
    });
    it("Click the page 2 button", () => {
      cy.visit(Cypress.env("selfTestEdit"));
      const assetSelect = [];
      cy.get("bridge-button[data-test='asset-modal']")
        .click()
        .then(() => {
          cy.get("mat-sidenav-content")
            .scrollTo("bottom")
            .then(() => {
              cy.wait(500);
              cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=0`).then(({ body }) => {
                cy.wait(500);
                cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
                  .click({ force: true })
                  .then(() => {
                    assetSelect.push(...body.items);
                    cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:eq(2)")
                      .click()
                      .then(() => {
                        cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=10`).then(({ body }) => {
                          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
                            .click()
                            .then(() => {
                              assetSelect.push(...body.items);
                              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:eq(3)")
                                .click()
                                .then(() => {
                                  cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=20`).then(({ body }) => {
                                    cy.get(
                                      `.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`,
                                    )
                                      .click({ force: true })
                                      .then(() => {
                                        assetSelect.push(...body.items);
                                        cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                                          .last()
                                          .click()
                                          .then(() => {
                                            cy.wait(500);
                                            cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                                              .find("tr")
                                              .its("length")
                                              .should("eq", Math.min(10, assetSelect.length));
                                            cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                                              .find("span.description")
                                              .invoke("text")
                                              .then((text) => text.trim())
                                              .should("equal", `1 to ${Math.min(10, assetSelect.length)} of ${assetSelect.length} items`);
                                            cy.get("[data-test='asset-select'] bridge-pagination nav button:eq(2)")
                                              .click()
                                              .then(() => {
                                                cy.wait(500);
                                                cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                                                  .find("tr")
                                                  .its("length")
                                                  .should("eq", Math.min(10, assetSelect.length - 10));
                                                cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                                                  .find("span.description")
                                                  .invoke("text")
                                                  .then((text) => text.trim())
                                                  .should("equal", `11 to 20 of ${assetSelect.length} items`);
                                                cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                                                  .find("tr")
                                                  .its("length")
                                                  .should("eq", Math.min(10, assetSelect.length));
                                                cy.get("bridge-table[data-test='asset-selected-table'] tbody tr").each(($el, i) => {
                                                  keysAsset.forEach((value, index) => {
                                                    switch (value) {
                                                      case "status":
                                                        cy.wrap($el)
                                                          .find(`td:eq(${index}) .badge`)
                                                          .invoke("text")
                                                          .then((text) => text.trim())
                                                          .should("equal", assetSelect[i + 10][value]);
                                                        break;

                                                      default:
                                                        cy.wrap($el)
                                                          .find(`td:eq(${index})`)
                                                          .invoke("text")
                                                          .then((text) => text.trim())
                                                          .should("eq", assetSelect[i + 10][value]);
                                                        break;
                                                    }
                                                  });
                                                });
                                              });
                                          });
                                      });
                                  });
                                });
                            });
                        });
                      });
                  });
              });
            });
        });
    });
    it("Click the > button", () => {
      cy.visit(Cypress.env("selfTestEdit"));
      const assetSelect = [];
      cy.get("bridge-button[data-test='asset-modal']")
        .click()
        .then(() => {
          cy.get("mat-sidenav-content")
            .scrollTo("bottom")
            .then(() => {
              cy.wait(500);
              cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=0`).then(({ body }) => {
                cy.wait(500);
                cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
                  .click({ force: true })
                  .then(() => {
                    assetSelect.push(...body.items);
                    cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:eq(2)")
                      .click()
                      .then(() => {
                        cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=10`).then(({ body }) => {
                          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
                            .click()
                            .then(() => {
                              assetSelect.push(...body.items);
                              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:eq(3)")
                                .click()
                                .then(() => {
                                  cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=20`).then(({ body }) => {
                                    cy.get(
                                      `.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`,
                                    )
                                      .click({ force: true })
                                      .then(() => {
                                        assetSelect.push(...body.items);
                                        cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                                          .last()
                                          .click()
                                          .then(() => {
                                            cy.wait(500);
                                            cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                                              .find("tr")
                                              .its("length")
                                              .should("eq", Math.min(10, assetSelect.length));
                                            cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                                              .find("span.description")
                                              .invoke("text")
                                              .then((text) => text.trim())
                                              .should("equal", `1 to ${Math.min(10, assetSelect.length)} of ${assetSelect.length} items`);
                                            cy.get("[data-test='asset-select'] bridge-pagination nav button.right-arrow")
                                              .click()
                                              .then(() => {
                                                cy.wait(500);
                                                page =
                                                  parseInt(
                                                    Cypress.$(`div[data-test="asset-select"]`)
                                                      .find(".pagination button.selected")
                                                      .text(),
                                                  ) - 1;
                                                assetSelectNext = assetSelect;
                                                cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                                                  .find("tr")
                                                  .its("length")
                                                  .should("eq", Math.min(10, assetSelect.length - 10 * page));
                                                cy.get(`div[data-test="asset-select"] bridge-pagination`)
                                                  .find("span.description")
                                                  .invoke("text")
                                                  .then((text) => text.trim())
                                                  .should(
                                                    "equal",
                                                    `${page * 10 + 1} to ${Math.min((page + 1) * 10, assetSelect.length)} of ${
                                                      assetSelect.length
                                                    } items`,
                                                  );
                                                cy.get(`bridge-table[data-test='asset-selected-table'] tbody tr`).each(($el, i) => {
                                                  keysAsset.forEach((value, index) => {
                                                    switch (value) {
                                                      case "status":
                                                        cy.wrap($el)
                                                          .find(`td:eq(${index}) .badge`)
                                                          .invoke("text")
                                                          .then((text) => text.trim())
                                                          .should("equal", assetSelect[i + 10 * page][value]);
                                                        break;

                                                      default:
                                                        cy.wrap($el)
                                                          .find(`td:eq(${index})`)
                                                          .invoke("text")
                                                          .then((text) => text.trim())
                                                          .should("eq", assetSelect[i + 10 * page][value]);
                                                        break;
                                                    }
                                                  });
                                                });
                                              });
                                          });
                                      });
                                  });
                                });
                            });
                        });
                      });
                  });
              });
            });
        });
    });
    it("Click the < button", () => {
      cy.get("[data-test='asset-select'] bridge-pagination nav button.left-arrow")
        .click()
        .then(() => {
          cy.wait(500);
          page =
            parseInt(
              Cypress.$(`div[data-test="asset-select"]`)
                .find(".pagination button.selected")
                .text(),
            ) - 1;

          cy.get("bridge-table[data-test='asset-selected-table'] tbody")
            .find("tr")
            .its("length")
            .should("eq", Math.min(10, assetSelectNext.length - 10 * page));
          cy.get(`div[data-test="asset-select"] bridge-pagination`)
            .find("span.description")
            .invoke("text")
            .then((text) => text.trim())
            .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, assetSelectNext.length)} of ${assetSelectNext.length} items`);
          cy.get(`bridge-table[data-test='asset-selected-table'] tbody tr`).each(($el, i) => {
            keysAsset.forEach((value, index) => {
              switch (value) {
                case "status":
                  cy.wrap($el)
                    .find(`td:eq(${index}) .badge`)
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("equal", assetSelectNext[i + 10 * page][value]);
                  break;

                default:
                  cy.wrap($el)
                    .find(`td:eq(${index})`)
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("eq", assetSelectNext[i + 10 * page][value]);
                  break;
              }
            });
          });
        });
    });
  });
  context("Self Test Setting operations", () => {
    before(() => {
      cy.visit(Cypress.env("selfTestEdit"));
    });
    it("Select Start at Immediately", () => {
      // Select Start at value check (Immediately)
      cy.get("bridge-self-test-reservation-edit-page .download-setting")
        .find("bridge-radio")
        .first()
        .click()
        .should("have.attr", "ng-reflect-checked", "true")
        .then(() => {
          // Date status check (inactive)
          cy.get("bridge-self-test-reservation-edit-page .download-setting")
            .first()
            .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("have.value", "");
          // Check the status of the Date selection button (inactive)
          cy.get("bridge-self-test-reservation-edit-page ")
            .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
            .first()
            .click()
            .then(() => {
              // Check not show datePicker dialog
              cy.get(".cdk-overlay-container bridge-date-picker-content").should("not.exist");
            });
          // Time status check (inactive)
          cy.get("bridge-self-test-reservation-edit-page .download-setting")
            .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("have.value", "");
          // Check the status of the Time selection button (inactive)
          cy.get("bridge-self-test-reservation-edit-page")
            .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
            .first()
            .click()
            .then(() => {
              // Check not show datePicker dialog
              cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
            });
        });
    });

    it("Select Select Date / Time of Start at", () => {
      cy.request("GET", `${Cypress.env("apiTasksSelfTestsId")}`).then((res) => {
        const { body } = res;
        cy.get("bridge-self-test-reservation-edit-page")
          .find("bridge-radio")
          .last()
          .click();
        // Date status check (activity)
        cy.get("bridge-self-test-reservation-edit-page")
          .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
          .should("be.enabled");
        //Date value check
        cy.get("bridge-self-test-reservation-edit-page")
          .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
          .then(() => {
            const newDate = Cypress.moment(new Date(body.detail.startAt)).format("MM/DD/YYYY") || "";
            cy.get("bridge-date-picker mat-form-field:eq(0) .mat-form-field-infix input").should("have.value", newDate);
          });
        // Check the status of the Date selection button (activity)
        cy.get("bridge-self-test-reservation-edit-page ")
          .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
          .click()
          .then(() => {
            // Check  show datePicker dialog
            cy.get(".cdk-overlay-container mat-datepicker-content").should("exist");
            cy.get("body").click();
          });
        // Time status check (inactive)
        cy.get("bridge-self-test-reservation-edit-page")
          .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
          .should("be.enabled");
        // Time value check
        cy.get("bridge-self-test-reservation-edit-page")
          .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
          .then(() => {
            const newTime = Cypress.moment(new Date(body.detail.startAt)).format("hh:mm A") || "";
            cy.get("bridge-time-picker mat-form-field:eq(0) .mat-form-field-infix input").should("have.value", newTime);
          });
        // Check the status of the Time selection button (inactive)
        cy.get("bridge-self-test-reservation-edit-page")
          .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
          .click()
          .then(() => {
            // Check not show datePicker dialog
            cy.get(".cdk-overlay-container bridge-time-picker-content").should("exist");
            cy.get("body").click();
          });
      });
    });

    it("Enter the date", () => {
      // Date value check
      cy.get("bridge-self-test-reservation-edit-page ")
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(2) td:eq(0)")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar").then(() => {
                cy.wait(200);
                // Time status check (activity)
                cy.get("bridge-self-test-reservation-edit-page .download-setting")
                  .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
                  .should("have.attr", "ng-reflect-disable-control", "false");
                // Check the status of the Time selection button (activity)
                cy.get("bridge-self-test-reservation-edit-page")
                  .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
                  .click()
                  .then(() => {
                    // Check not show datePicker dialog
                    cy.get(".cdk-overlay-container bridge-time-picker-content").should("exist");
                  });
              });
            });
        });
    });
  });
  context("Cancel operations", () => {
    beforeEach(() => {
      cy.visit(Cypress.env("selfTestEdit"));
    });
    it("Click the Cancel button after changing the values on the screen", () => {
      // Confirm that the confirmation dialog is displayed.
      cy.get("bridge-self-test-reservation-edit-page")
        .find("bridge-button[data-test='cancel-button'] button")
        .click()
        .within(() => {
          cy.root()
            .parents("body")
            .find("mat-dialog-container bridge-alert")
            .should("be.visible")
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

    it("Click Cancel button in the confirmation dialog", () => {
      // Confirm that the confirmation dialog is displayed.
      cy.get("bridge-self-test-reservation-edit-page")
        .find("bridge-button[data-test='cancel-button'] button")
        .click()
        .within(() => {
          cy.root()
            .parents("body")
            .find("mat-dialog-container bridge-alert bridge-button")
            .first()
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestEdit"));
            });
        });
    });
  });
  context("Confirm operations", () => {
    beforeEach(() => {
      cy.visit(Cypress.env("selfTestEdit"));
    });
    it("Target Asset not selected", () => {
      // Target Asset not selected
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(($el) => {
            if (Cypress.$($el).length > 2) {
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                        .last()
                        .click()
                        .then(() => {
                          cy.wait(500);
                          // Check the display of the Target Asset list (hide)
                          cy.get("bridge-table[data-test='asset-selected-table'").should("not.exist");
                          // Check status confirm (inactive)
                          cy.get(`bridge-button[data-test="confirm-button"] button`).should("have.disabled", "disabled");
                        });
                    });
                });
            }
          });
        });
    });

    it("When Select Date/Time is selected for Start at, Date is not entered", () => {
      // When Select Date/Time is selected for Start at, Date is not entered
      cy.get("bridge-self-test-reservation-edit-page")
        .find("bridge-radio")
        .last()
        .click()
        .should("have.attr", "ng-reflect-value", "true")
        .then(() => {
          cy.wait(100);
          cy.get("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
            .focus()
            .clear();
          cy.get("body").click();
          // Confirm status check (inactive)
          cy.get("bridge-self-test-reservation-edit-page")
            .find("bridge-button[data-test='confirm-button'] button")
            .should("be.disabled");
        });
    });

    it("Select Target Asset, select Start at Immediately", () => {
      // Select Target Asset
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(() => {
            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
              .click()
              .then(() => {
                cy.wait(500);
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.wait(500);
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                      .last()
                      .click()
                      .then(() => {
                        cy.wait(500);
                        // Start at value check (Immediately)
                        cy.get("bridge-self-test-reservation-edit-page .download-setting")
                          .find("bridge-radio")
                          .first()
                          .click()
                          .should("have.attr", "ng-reflect-checked", "true");
                        //  Confirm button status check (activity)
                        cy.get("bridge-self-test-reservation-edit-page")
                          .find("bridge-button[data-test='confirm-button'] button")
                          .should("not.be.disabled");
                      });
                  });
              });
          });
        });
    });

    it("Select Target Asset, select Select Date/Time for Start at and enter Date", () => {
      // Select Target Asset
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(() => {
            cy.wait(500);
            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
              .click()
              .then(() => {
                cy.wait(500);
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                      .last()
                      .click();
                    // Check the value of Start at
                    cy.get("bridge-self-test-reservation-edit-page")
                      .find("bridge-radio")
                      .last()
                      .click();
                    // Date value check
                    cy.get("bridge-self-test-reservation-edit-page")
                      .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
                      .click()
                      .then(() => {
                        cy.wait(100);
                        cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(2) td:eq(0)").click();
                        //  Confirm button status check (activity)
                        cy.get("bridge-self-test-reservation-edit-page")
                          .find("bridge-button[data-test='confirm-button'] button")
                          .should("not.be.disabled");
                      });
                  });
              });
          });
        });
    });

    it("Check the date and time when click the Confirm button", () => {
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").then(($el) => {
            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
              .click()
              .then(() => {
                cy.wait(500);
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                      .last()
                      .click()
                      .then(() => {
                        // Check the value of Start at
                        cy.get("bridge-self-test-reservation-edit-page")
                          .find("bridge-radio")
                          .last()
                          .click();
                        // Date and Time value check
                        let inputDate = new Date();
                        inputDate.setDate(inputDate.getDate() - 2);
                        const check = Cypress.moment.utc(inputDate);
                        const date = (check.isValid() && check.format("MM/D/YYYY")) || "";
                        cy.get("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
                          .focus()
                          .clear()
                          .type(date)
                          .blur();
                        //  Confirm button status check (activity)
                        cy.get("bridge-self-test-reservation-edit-page")
                          .find("bridge-button[data-test='confirm-button'] button")
                          .last()
                          .click()
                          .then(() => {
                            cy.get("bridge-self-test-reservation-edit-page")
                              .find("fieldset form ul.list-error-valid")
                              .should("exist");
                          });
                      });
                  });
              });
          });
        });
    });
  });
});
describe("Page-Self Test Reservation Edit,Select Assets", () => {
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
  const assetStatus = ["Good", "Error", "Missing"];
  let page = 0,
    apiAssets;
  before(() => {
    selfTestEdit = Cypress.env("selfTestEdit");
    apiAssets = Cypress.env("apiAssets");
    apiTypes = Cypress.env("apiTypes");
    apiRegions = Cypress.env("apiRegions");
    apiCustomers = Cypress.env("apiCustomers");
    apiLocations = Cypress.env("apiLocations");
    cy.server()
      .route("GET", `${apiAssets}*`)
      .as("apiAssets")
      .route("GET", `${selfTestEdit}*`)
      .as("selfTestEdit")
      .route("GET", `${apiTypes}*`)
      .as("apiTypes")
      .route("GET", `${apiRegions}*`)
      .as("apiRegions")
      .route("GET", `${apiCustomers}*`)
      .as("apiCustomers")
      .route("GET", `${apiLocations}*`)
      .as("apiLocations");
  });
  context("Initial display", () => {
    beforeEach(() => {
      cy.visit(Cypress.env("selfTestEdit"));
    });
    it("Display with no arguments", () => {
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          // check Keyword
          cy.get("bridge-side-board")
            .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
            .should("have.value", "");

          // check asset status
          cy.get("bridge-side-board")
            .find("bridge-checkbox-list[data-test='status-checkbox'] mat-checkbox")
            .should("have.attr", "ng-reflect-checked", "false");

          // check model select
          cy.get("bridge-side-board")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .should("have.attr", "ng-reflect-value", "");

          // check region select
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='region-select'] mat-select")
            .should("have.attr", "ng-reflect-value", "");

          // check organization select
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='organization-select'] mat-select")
            .should("have.attr", "ng-reflect-value", "");

          // check location select
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='location-select'] mat-select")
            .should("have.attr", "ng-reflect-value", "");

          cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=0`).then((res) => {
            cy.wait(500);
            cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody")
              .find("tr")
              .its("length")
              .should("be.eq", Math.min(res.body.items.length, 10));

            // check data map with table asset list
            cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr").each(($el, i) => {
              keysAsset.forEach((value, index) => {
                switch (value) {
                  case "status":
                    cy.wrap($el)
                      .find(`td:eq(${index + 1}) .badge`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", res.body.items[i][value]);
                    break;
                  case "location":
                    cy.wrap($el)
                      .find(`td:eq(${index + 1})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", res.body.items[i][value]);
                    break;
                  default:
                    cy.wrap($el)
                      .find(`td:eq(${index + 1})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", res.body.items[i][value]);
                    break;
                }
              });
            });
            numberPage = Math.ceil(res.body.totalCount / 10) - 1;
            page = 0;
            cy.get(".cdk-overlay-container mat-dialog-container bridge-pagination[data-test='bridge-pagination']")
              .find("nav button")
              .its("length")
              .should("be.eq", numberPage);
            cy.get(".cdk-overlay-container mat-dialog-container bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`);

            // on paging init load
            cy.get(".cdk-overlay-container mat-dialog-container bridge-pagination[data-test='bridge-pagination']")
              .find(".pagination button")
              .then((listing) => {
                listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
                if (listingCount > 1) {
                  cy.get("mat-sidenav-content")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.wrap(listing)
                        .not(".left-arrow,.right-arrow")
                        .eq("1")
                        .click()
                        .then(($el) => {
                          page = parseInt(Cypress.$($el).text()) - 1;
                          cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=10`).then((res) => {
                            cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody")
                              .find("tr")
                              .its("length")
                              .should("be.eq", Math.min(res.body.items.length, 10));
                            cy.get(".cdk-overlay-container mat-dialog-container bridge-pagination")
                              .find("span.description")
                              .invoke("text")
                              .then((text) => text.trim())
                              .should(
                                "equal",
                                `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                              );
                          });
                        });
                    });
                }
              });
          });
        });
    });

    it("Display with arguments", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("dataAssets");
      // set/check asset Model
      let modelData;
      let element;
      let resData;
      let page = 0;
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          // set/check value key Keyword
          keyword = "this is alias";

          cy.get("bridge-side-board")
            .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
            .type(keyword);

          cy.get("bridge-side-board")
            .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
            .should("have.value", keyword);

          // set/check asset status
          cy.get("bridge-side-board")
            .find("bridge-checkbox-list[data-test='status-checkbox'] mat-checkbox:eq(0)")
            .click()
            .should("have.attr", "ng-reflect-checked", "true");

          cy.request(`${apiTypes}`).then((res) => {
            if (res.body.length > 0) {
              cy.wait(500);
              cy.get("bridge-side-board")
                .find("bridge-select-multi[data-test='model-select'] mat-select")
                .click()
                .then(() => {
                  cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}']`)
                    .click()
                    .then(() => {
                      modelData = res.body[0].typeId;
                      cy.wait(500);
                      cy.get("body").click();
                      cy.get("bridge-side-board")
                        .find("bridge-select-multi[data-test='model-select'] mat-select")
                        .should("have.attr", "ng-reflect-value", res.body[0].typeId);
                    });
                });
            }
          });
          // submit filter
          cy.get("bridge-side-board")
            .find('bridge-button[data-test="ok"]')
            .click()
            .then(() => {
              cy.wait("@dataAssets").then(({ responseBody }) => {
                element = responseBody.items[0];
                resData = responseBody;
                cy.wait(500);
                cy.get("bridge-table-board bridge-table tbody tr")
                  .first()
                  .then((el) => {
                    cy.wrap(el).as("asset");
                    cy.get("@asset")
                      .find(".tableCell-checked mat-checkbox")
                      .should("have.attr", "ng-reflect-checked", "true");
                    // status
                    cy.wrap(el)
                      .find(" > .tableCell-status")
                      .should("have.text", `${element.status}`);
                    // serial
                    cy.wrap(el)
                      .find(" > .tableCell-serial")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${element.assetId}`);
                    // name
                    cy.wrap(el)
                      .find(" > .tableCell-name")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${element.alias}`);
                    // Model
                    cy.wrap(el)
                      .find(" > .tableCell-model")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${element.typeId}`);
                    // organization
                    cy.wrap(el)
                      .find(" > .tableCell-organization")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${element.organization}`);
                    // region
                    cy.wrap(el)
                      .find(" > .tableCell-region")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${element.region}`);
                    // location
                    cy.wrap(el)
                      .find(" > .tableCell-location")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${element.location}`);
                  });
              });
              cy.get(".footer mat-dialog-actions bridge-button.basic button")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      // check the key word after filter
                      cy.get("bridge-side-board")
                        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
                        .should("have.value", keyword);
                      cy.wait(100);
                      // status is checked by status
                      cy.get("bridge-side-board")
                        .find("bridge-checkbox-list[data-test='status-checkbox'] mat-checkbox:eq(0)")
                        .should("have.attr", "ng-reflect-checked", "true");
                      cy.wait(100);
                      // Model is the value after filter
                      cy.get("bridge-side-board")
                        .find("bridge-select-multi[data-test='model-select'] mat-select")
                        .should("have.attr", "ng-reflect-value", modelData);
                      cy.wait(100);
                      // get Data assets
                      cy.get("bridge-table-board bridge-table tbody tr")
                        .first()
                        .then((el) => {
                          cy.wrap(el).as("asset");
                          cy.get("@asset")
                            .find(".tableCell-checked mat-checkbox")
                            .should("have.attr", "ng-reflect-checked", "true");
                          // status
                          cy.get("@asset")
                            .find(" > .tableCell-status")
                            .should("have.text", `${element.status}`);
                          // serial
                          cy.get("@asset")
                            .find(" > .tableCell-serial")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", `${element.assetId}`);
                          // name
                          cy.get("@asset")
                            .find(" > .tableCell-name")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", `${element.alias}`);
                          // Model
                          cy.get("@asset")
                            .find(" > .tableCell-model")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", `${element.typeId}`);
                          // organization
                          cy.get("@asset")
                            .find(" > .tableCell-organization")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", `${element.organization}`);
                          // region
                          cy.get("@asset")
                            .find(" > .tableCell-region")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", `${element.region}`);
                          // location
                          cy.get("@asset")
                            .find(" > .tableCell-location")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", `${element.location}`);
                          // check total item and pagination
                          numberPage = Math.ceil(resData.totalCount / 10) + 2;
                          cy.get("bridge-modal bridge-pagination[data-test='bridge-pagination']")
                            .find("nav button")
                            .its("length")
                            .should("be.eq", numberPage);
                          cy.get("bridge-modal bridge-pagination")
                            .find("span.description")
                            .invoke("text")
                            .then((text) => text.trim())
                            .should(
                              "equal",
                              `${page * 10 + 1} to ${Math.min((page + 1) * 10, resData.totalCount)} of ${resData.totalCount} items`,
                            );
                        });
                    });
                });
            });
        });
    });
  });

  context("Search filter operations", () => {
    beforeEach(() => {
      cy.visit(Cypress.env("selfTestEdit"));
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
    });
    it("Checking items in each list", () => {
      // Status list check
      cy.get(`bridge-checkbox-list > div`)
        .children()
        .each(($el, i) => {
          expect($el).to.contain(assetStatus[i]);
        });

      // check show multi select Model
      cy.request(`${apiTypes}`).then((res) => {
        cy.get("bridge-side-board")
          .find("bridge-select-multi[data-test='model-select'] mat-select")
          .click()
          .then(() => {
            cy.wait(500);
            // check length show panel chose Model
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", res.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("ALL");
                  } else {
                    expect($otp.text().trim()).to.be.eq(res.body[index - 1].typeId);
                  }
                })
                .then(() => cy.get("body").click());
            });
          });
      });

      // check show multi select Region
      cy.request(`${apiRegions}`).then((res) => {
        cy.get("bridge-side-board")
          .find("bridge-select[data-test='region-select'] mat-select")
          .click()
          .then(() => {
            // check length show panel chose Region
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", res.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("Select a value");
                  } else {
                    expect($otp.text().trim()).to.be.eq(res.body[index - 1].regionId);
                  }
                })
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          });
      });

      // check show multi select Organization
      cy.request(`${apiCustomers}`).then((res) => {
        cy.get("bridge-side-board")
          .find("bridge-select[data-test='organization-select'] mat-select")
          .click()
          .then(() => {
            // check length show panel chose Region
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", res.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("Select a value");
                  } else {
                    expect($otp.text().trim()).to.be.eq(res.body[index - 1].customerId);
                  }
                })
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          });
      });

      // check show multi select Location
      cy.request(`${apiLocations}`).then((res) => {
        cy.get("bridge-side-board")
          .find("bridge-select[data-test='location-select'] mat-select")
          .click()
          .then(() => {
            // check length show panel chose Region
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", res.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("Select a value");
                  }
                })
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          });
      });
    });

    it("Select multiple Model items", () => {
      cy.request(`${apiTypes}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .click({ force: true })
            .then(($el) => {
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all']`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all']`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}']`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[1].typeId}']`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[2].typeId}']`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}']`).click();
              cy.wait(500);
              cy.get("body")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-select-multi")
                    .invoke("attr", "ng-reflect-selected-item")
                    .should("contain", `${res.body[1].typeId},${res.body[2].typeId}`);
                });
            });
        }
      });
    });

    it("Select a single Model item", () => {
      cy.request(`${apiTypes}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[1].typeId}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-select-multi")
                    .invoke("attr", "ng-reflect-selected-item")
                    .should("contain", `${res.body[1].typeId}`);
                });
            });
        }
      });
    });

    it("Select a single Region item", () => {
      cy.request(`${apiRegions}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='region-select'] mat-select")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[1].regionId}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-select")
                    .invoke("attr", "ng-reflect-selected-item")
                    .should("contain", `${res.body[1].regionId}`);
                });
            });
        }
      });
    });

    it("Change Organization item to blank", () => {
      cy.request(`${apiCustomers}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='organization-select'] mat-select")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(0)`)
                .click()
                .then(() => {
                  cy.wait(500);
                  expect(Cypress.$($el).attr("ng-reflect-selected-item")).to.be.eq(undefined);
                  cy.get("bridge-side-board")
                    .find("bridge-select[data-test='location-select'] mat-select")
                    .should("have.attr", "ng-reflect-value", ``)
                    .click()
                    .then(() => {
                      // check length list
                      cy.get(`.cdk-overlay-container .mat-select-panel  mat-option`).then(($el) => {
                        cy.wrap($el).should("have.length", 1);
                      });
                    });
                });
            });
        }
      });
    });

    it("Change Organization item to none-blank", () => {
      cy.request(`${apiCustomers}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='organization-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-side-board")
                    .find("bridge-select[data-test='organization-select'] mat-select")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", res.body[1].customerId);
                  const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", res.body[1].customerId);
                  cy.request(`${apiLocations}`).then((res) => {
                    cy.get("bridge-side-board")
                      .find("bridge-select[data-test='location-select'] mat-select")
                      .should("have.attr", "ng-reflect-value", ``)
                      .click()
                      .then(() => {
                        cy.wait(500);
                        cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
                          cy.wrap($el)
                            .should("have.length", res.body.length + 1)
                            .then(() => cy.get("body").click());
                        });
                      });
                  });
                });
            });
        }
      });
    });

    it("Select a single Location item", () => {
      cy.request(`${apiCustomers}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='organization-select'] mat-select")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(5)`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-select[data-test='organization-select'] mat-select").within(($el) => {
                    expect($el.text().trim()).equal(`${res.body[4].customerId}`);
                  });
                  const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", res.body[4].customerId);
                  cy.request(apiLocations).then((res) => {
                    cy.get("bridge-side-board")
                      .find("bridge-select[data-test='location-select'] mat-select")
                      .click()
                      .then(($el) => {
                        cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(() => {
                          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(1)`)
                            .click()
                            .then(() => {
                              cy.wait(200);
                              cy.wrap($el)
                                .invoke("text")
                                .should("to.be.eq", res.body[0].locationId);
                            });
                        });
                      });
                  });
                });
            });
        }
      });
    });

    it("When clicked the OK button, there were 0 results", () => {
      keyword = "no-item 0001 acb ##887";
      cy.get("bridge-side-board")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .type(keyword)
        .then(() => {
          cy.get("bridge-side-board")
            .find('bridge-button[data-test="ok"]')
            .click();
          cy.request(`${apiAssets}?text=${keyword}&sort=desc&isFilter=true&limit=10&offset=0`).then((res) => {
            cy.get("bridge-table-board bridge-table tbody")
              .find("tr")
              .should("have.length", 0);
            cy.get("bridge-table-board bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `No item`);
          });
        });
    });

    it("When clicked the OK button, there were more than 1 results", () => {
      cy.get("bridge-side-board")
        .find('bridge-button[data-test="ok"]')
        .click();
      cy.request(`${apiAssets}?sort=desc&isFilter=true&limit=10&offset=0`).then(({ body }) => {
        // check number recode return
        cy.wait(500);
        cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody")
          .find("tr")
          .its("length")
          .should("be.eq", Math.min(body.items.length, 10));
        // check data map with table asset list
        cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr").each(($el, i) => {
          keysAsset.forEach((value, index) => {
            switch (value) {
              case "status":
                cy.wrap($el)
                  .find(`td:eq(${index + 1}) .badge`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", body.items[i][value]);
                break;
              case "location":
                cy.wrap($el)
                  .find(`td:eq(${index + 1})`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", body.items[i][value]);
                break;
              default:
                cy.wrap($el)
                  .find(`td:eq(${index + 1})`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", body.items[i][value]);
                break;
            }
          });
        });
        page = 0;
        // check label show description
        cy.get(".cdk-overlay-container mat-dialog-container bridge-pagination")
          .find("span.description")
          .invoke("text")
          .then((text) => text.trim())
          .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
        // check label number button show paging
        numberPage = Math.ceil(body.totalCount / 10) - 1;
        page = 0;
        cy.get("bridge-pagination[data-test='bridge-pagination']")
          .find("nav button")
          .its("length")
          .should("be.eq", numberPage);
      });
    });

    it("Click the Clear button", () => {
      // set/check value key Keyword
      keyword = "this is alias";
      cy.get("bridge-side-board")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .type(keyword);
      // set/check asset status

      cy.get("bridge-side-board")
        .find("bridge-checkbox-list[data-test='status-checkbox'] mat-checkbox:eq(0)")
        .click();

      // set/check asset Model

      cy.request(`${apiTypes}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
        }
      });

      // set/check asset Region

      cy.request(`${apiRegions}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='region-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].regionId}']`).click();
            });
        }
      });

      // set/check asset Organization and to Location

      cy.request(`${apiCustomers}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='organization-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(5)`)
                .contains(res.body[4].customerId)
                .click()
                .then(() => {
                  cy.get("bridge-side-board")
                    .find("bridge-select[data-test='organization-select'] mat-select[ng-reflect-value]")
                    .contains(res.body[4].customerId);
                  const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", res.body[4].customerId);
                  cy.request(`${apiLocations}`).then((locations) => {
                    cy.get("bridge-side-board")
                      .find("bridge-select[data-test='location-select'] mat-select")
                      .click()
                      .then(() => {
                        cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(() => {
                          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(1)`).click();
                        });
                      });
                  });
                });
            });
        }
      });

      // init clear filter
      cy.get("bridge-side-board")
        .find('bridge-button[data-test="clear"]')
        .click();
      // check input hab been clear
      cy.get("bridge-side-board")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .should("have.value", "");
      cy.get("bridge-side-board")
        .find("bridge-checkbox-list[data-test='status-checkbox'] mat-checkbox")
        .should("have.attr", "ng-reflect-checked", "false");
      cy.get("bridge-side-board")
        .find("bridge-select-multi[data-test='model-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.get("bridge-side-board")
        .find("bridge-select[data-test='region-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.get("bridge-side-board")
        .find("bridge-select[data-test='organization-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.get("bridge-side-board")
        .find("bridge-select[data-test='location-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
    });
  });

  context("Sorting operations", () => {
    before(() => {
      cy.visit(Cypress.env("selfTestEdit"));
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button").click();
    });
    const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
    const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";
    const defaultImg = "assets/img/icons/arrows-alt-v-solid.svg";
    const sortsEvent = [
      {
        key: "status",
        name: "Status",
      },
      {
        key: "assetId",
        name: "Serial",
      },
      {
        key: "alias",
        name: "Name",
      },
      {
        key: "typeId",
        name: "Model",
      },
      {
        key: "customerId",
        name: "Organization",
      },
      {
        key: "regionId",
        name: "Region",
      },
      {
        key: "locationId",
        name: "Location",
      },
    ];

    sortsEvent.forEach(({ key, name }) => {
      it(`Click ${name} to set the ascending order`, () => {
        cy.server()
          .route("GET", `${Cypress.env("apiAssets")}*`)
          .as(`sort${key}`);
        cy.wait(1000).then(() => {
          cy.get(`bridge-table > table > thead > tr > th.${key}`)
            .click()
            .then(() => {
              let resData;
              cy.wait(`@sort${key}`).then(({ responseBody }) => {
                resData = responseBody.items[0];
                cy.get("bridge-table-board bridge-table tbody tr")
                  .first()
                  .then((el) => {
                    // status
                    cy.wrap(el)
                      .find(" > .tableCell-status")
                      .should("have.text", `${resData.status}`);
                    // serial
                    cy.wrap(el)
                      .find(" > .tableCell-serial")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.assetId}`);
                    // name
                    cy.wrap(el)
                      .find(" > .tableCell-name")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.alias}`);
                    // Model
                    cy.wrap(el)
                      .find(" > .tableCell-model")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.typeId}`);
                    // organization
                    cy.wrap(el)
                      .find(" > .tableCell-organization")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.organization}`);
                    // region
                    cy.wrap(el)
                      .find(" > .tableCell-region")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.region}`);
                    // location
                    cy.wrap(el)
                      .find(" > .tableCell-location")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.location}`);
                  });
                // check img sort
                cy.get(`bridge-table > table > thead > tr > th.${key}`)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", upImg);
              });
            });
        });
      });
      it(`Click ${name} to set the descending order`, () => {
        cy.server()
          .route("GET", `${Cypress.env("apiAssets")}*`)
          .as(`sort${key}`);
        cy.wait(1000).then(() => {
          cy.get(`bridge-table > table > thead > tr > th.${key}`)
            .click()
            .then(() => {
              let resData;
              cy.wait(`@sort${key}`).then(({ responseBody }) => {
                resData = responseBody.items[0];
                cy.get("bridge-table-board bridge-table tbody tr")
                  .first()
                  .then((el) => {
                    // status
                    cy.wrap(el)
                      .find(" > .tableCell-status")
                      .should("have.text", `${resData.status}`);
                    // serial
                    cy.wrap(el)
                      .find(" > .tableCell-serial")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.assetId}`);
                    // name
                    cy.wrap(el)
                      .find(" > .tableCell-name")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.alias}`);
                    // Model
                    cy.wrap(el)
                      .find(" > .tableCell-model")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.typeId}`);
                    // organization
                    cy.wrap(el)
                      .find(" > .tableCell-organization")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.organization}`);
                    // region
                    cy.wrap(el)
                      .find(" > .tableCell-region")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.region}`);
                    // location
                    cy.wrap(el)
                      .find(" > .tableCell-location")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.location}`);
                  });
                // check img sort
                cy.get(`bridge-table > table > thead > tr > th.${key}`)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", downImg);
              });
            });
        });
      });
      it(`Click ${name} to set the default order `, () => {
        cy.server()
          .route("GET", `${Cypress.env("apiAssets")}*`)
          .as(`sort${key}`);
        cy.wait(1000).then(() => {
          cy.get(`bridge-table > table > thead > tr > th.${key}`)
            .click()
            .then(() => {
              let resData;
              cy.wait(`@sort${key}`).then(({ responseBody }) => {
                resData = responseBody.items[0];
                cy.get("bridge-table-board bridge-table tbody tr")
                  .first()
                  .then((el) => {
                    // status
                    cy.wrap(el)
                      .find(" > .tableCell-status")
                      .should("have.text", `${resData.status}`);
                    // serial
                    cy.wrap(el)
                      .find(" > .tableCell-serial")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.assetId}`);
                    // name
                    cy.wrap(el)
                      .find(" > .tableCell-name")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.alias}`);
                    // Model
                    cy.wrap(el)
                      .find(" > .tableCell-model")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.typeId}`);
                    // organization
                    cy.wrap(el)
                      .find(" > .tableCell-organization")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.organization}`);
                    // region
                    cy.wrap(el)
                      .find(" > .tableCell-region")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.region}`);
                    // location
                    cy.wrap(el)
                      .find(" > .tableCell-location")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.location}`);
                  });
                // check img sort
                cy.get(`bridge-table > table > thead > tr > th.${key}`)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", defaultImg);
              });
            });
        });
      });
    });
  });

  context("Paging operations", () => {
    before(() => {
      cy.visit(Cypress.env("selfTestEdit"));
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button").click();
    });
    it("Click the page 2 button", () => {
      cy.get(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.wrap(listing)
              .not(".left-arrow,.right-arrow")
              .eq("1")
              .click();
            page = 1;
            cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
              cy.wait(500);
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").each(($el, i) => {
                keysAsset.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.wrap($el)
                        .find(`td:eq(${index + 1}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", res.body.items[i][value]);
                      break;
                    default:
                      cy.wrap($el)
                        .find(`td:eq(${index + 1})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", res.body.items[i][value]);
                      break;
                  }
                });
              });
              page = 1;
              cy.get(".cdk-overlay-container bridge-table-board bridge-pagination")
                .find("span.description")
                .invoke("text")
                .then((text) => text.trim())
                .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`);
            });
          }
        });
    });
    it("Click the > button", () => {
      cy.get(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.get(
              ".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination'] .pagination button.right-arrow",
            )
              .click()
              .then(() => {
                cy.wait(500);
                page =
                  parseInt(
                    Cypress.$(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
                      .find(".pagination button.selected")
                      .text(),
                  ) - 1;
                cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").each(($el, i) => {
                    keysAsset.forEach((value, index) => {
                      switch (value) {
                        case "status":
                          cy.wrap($el)
                            .find(`td:eq(${index + 1}) .badge`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", res.body.items[i][value]);
                          break;
                        default:
                          cy.wrap($el)
                            .find(`td:eq(${index + 1})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", res.body.items[i][value]);
                          break;
                      }
                    });
                  });
                  cy.get(".cdk-overlay-container bridge-table-board bridge-pagination")
                    .find("span.description")
                    .invoke("text")
                    .then((text) => text.trim())
                    .should(
                      "equal",
                      `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                    );
                });
              });
          }
        });
    });
    it("Click the < button", () => {
      cy.get(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.get(
              ".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination'] .pagination button.left-arrow",
            )
              .click()
              .then(() => {
                cy.wait(500);
                page =
                  parseInt(
                    Cypress.$(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
                      .find(".pagination button.selected")
                      .text(),
                  ) - 1;
                cy.request(`${apiAssets}??sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr").each(($el, i) => {
                    keysAsset.forEach((value, index) => {
                      switch (value) {
                        case "status":
                          cy.wrap($el)
                            .find(`td:eq(${index + 1}) .badge`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", res.body.items[i][value]);
                          break;
                        default:
                          cy.wrap($el)
                            .find(`td:eq(${index + 1})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", res.body.items[i][value]);
                          break;
                      }
                    });
                  });
                  cy.get(".cdk-overlay-container bridge-table-board bridge-pagination")
                    .find("span.description")
                    .invoke("text")
                    .then((text) => text.trim())
                    .should(
                      "equal",
                      `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                    );
                });
              });
          }
        });
    });
  });
  context("Cancel operations", () => {
    before(() => {
      cy.visit(Cypress.env("selfTestEdit"));
    });
    it("Click the Cancel button", () => {
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .first()
                    .click()
                    .then(() => {
                      cy.get(`bridge-table[data-test="asset-selected-table"]`).should("exist");
                      cy.wait(500);
                      cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                        .find("tr")
                        .its("length")
                        .should("eq", 1);

                      //Display check (display) of the number of items in the Target Asset list
                      cy.get("bridge-table tbody tr").each(($el, i) => {
                        keysAsset.forEach((value, index) => {
                          switch (value) {
                            case "status":
                              cy.wrap($el)
                                .find(`td:eq(${index}) .badge`)
                                .should("be.visible");
                              break;
                            case "location":
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .should("be.visible");
                              break;
                            default:
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .should("be.visible");
                              break;
                          }
                        });
                      });
                      page = 0;
                      cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", `1 to 1 of 1 items`);
                    });
                });
            });
        });
    });
  });
  context("OK operations", () => {
    before(() => {
      cy.visit(Cypress.env("selfTestEdit"));
    });
    it("Click the OK button", () => {
      cy.get("bridge-self-test-reservation-edit-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
                      cy.get("bridge-table[data-test='asset-selected-table']").should("exist");
                    });
                });
            });
        });
    });
  });
});
