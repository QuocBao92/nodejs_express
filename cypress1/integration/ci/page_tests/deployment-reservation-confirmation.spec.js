/// <reference types="Cypress" />

let apiTasks, deploymentsNew;
const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
describe("Page-Deployment Reservation Confirmation", () => {
  const keysPackage = ["name", "summary", "date", "status", ""];
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
  let page = 0,
    apiAssets;
  const timeZone = `GMT${Cypress.moment().format("Z")}`;
  const downloadDate = new Date();
  const installDate = new Date();
  before(() => {
    apiAssetDetail = Cypress.env("apiAssetDetail");
    apiTasks = Cypress.env("apiTasks");
    apiPackages = Cypress.env("apiPackages");
    deploymentsNew = Cypress.env("deploymentsNew");
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
        package: [],
      };
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);
      const taskName = "Task Name";
      cy.get("bridge-deployment-reservation-page .task-details")
        .find(".mat-form-field input:eq(0)")
        .type(taskName)
        .should("have.value", taskName);
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal mat-radio-button:eq(0) label`)
            .click()
            .then(() => {
              const data = {};
              cy
                .get("bridge-expansion-table bridge-expansion-panel .expanstion-panel-row:eq(0)")
                .find("div.column")
                .each(($div, index) => {
                  cy.wrap($div).within((t) => (data[keysPackage[index]] = t.text()));
                }),
                task.package.push(data);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              const data = {};
              cy
                .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .find("td")
                .each(($td, index) => {
                  if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                }),
                task.assets.push(data);
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });

      // Check the Start at value of Download Package Settings
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click();
      downloadDate.setDate(downloadDate.getDate() + 3);
      let check = Cypress.moment.utc(downloadDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      // Check the Start at value of Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click();
      installDate.setDate(installDate.getDate() + 5);
      check = Cypress.moment.utc(installDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click()
        .then(() => {
          cy.wait(500);
          cy.get("bridge-expansion-panel[data-test='expansion-row']")
            .its("length")
            .should("eq", 1);
          // Package list item check (Name, Summary, Date, Status)
          cy.get("bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
            keysPackage.forEach((value, index) => {
              switch (value) {
                case "name":
                  cy.wrap($el)
                    .find(`div[data-test='column']:eq(0)`)
                    .invoke("text")
                    .should("equal", task.package[i].name);
                  break;
                case "summary":
                  cy.wrap($el)
                    .find(`div[data-test='column']:eq(1)`)
                    .invoke("text")
                    .should("equal", task.package[i].summary);
                  break;
                case "date":
                  cy.wrap($el)
                    .find(`div[data-test='column']:eq(2)`)
                    .invoke("text")
                    .should("equal", task.package[i].date);
                  break;
                case "status":
                  cy.wrap($el)
                    .find(`div[data-test='column']:eq(3)`)
                    .invoke("text")
                    .should("equal", task.package[i].status);
                  break;
                default:
                  break;
              }
            });
          });
          cy.wait(500);
          cy.get("[data-test='asset-selected-table'] bridge-table tbody")
            .find("tr")
            .its("length")
            .should("eq", 1);
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
          cy.get("[data-test='asset-selected-table'] bridge-pagination[data-test='asset-pagination']")
            .find("span.description")
            .invoke("text")
            .then((text) => text.trim())
            .should("equal", `1 to 1 of 1 items`);

          cy.get(".download-setting bridge-radio-group")
            .find("input")
            .should("have.disabled", "disabled");

          cy.get(".download-setting bridge-radio-group")
            .find("bridge-radio:eq(0)")
            .should("have.attr", "ng-reflect-checked", "false");

          cy.get(".download-setting bridge-radio-group")
            .find("bridge-radio:eq(1)")
            .should("have.attr", "ng-reflect-checked", "true");

          cy.get(".download-setting")
            .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("not.have.value", "");

          cy.get(".download-setting")
            .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("not.have.value", "");

          cy.get(".download-setting")
            .find(".time-zone-group p")
            .should("have.text", timeZone);

          cy.get(".install-setting bridge-radio-group")
            .find("input")
            .should("have.disabled", "disabled");

          cy.get(".install-setting bridge-radio-group")
            .find("bridge-radio:eq(0)")
            .should("have.attr", "ng-reflect-checked", "true");

          cy.get(".install-setting bridge-radio-group")
            .find("bridge-radio:eq(1)")
            .should("have.attr", "ng-reflect-checked", "false");

          cy.get(".install-setting-group bridge-radio-group")
            .find("input")
            .should("have.disabled", "disabled");

          cy.get(".install-setting-group bridge-radio-group")
            .find("bridge-radio:eq(0)")
            .should("have.attr", "ng-reflect-checked", "false");

          cy.get(".install-setting-group bridge-radio-group")
            .find("bridge-radio:eq(1)")
            .should("have.attr", "ng-reflect-checked", "true");

          cy.get(".install-setting-group")
            .find("bridge-date-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("not.have.value", "");

          cy.get(".install-setting-group")
            .find("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("not.have.value", "");

          cy.get(".install-setting-group")
            .find(".time-zone-group p")
            .should("have.text", timeZone);
        });
    });
  });

  context("Sorting operations", () => {
    before(() => {
      const task = {
        assets: [],
        package: [],
      };
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);
      const taskName = "Task Name";
      cy.get("bridge-deployment-reservation-page .task-details")
        .find(".mat-form-field input:eq(0)")
        .type(taskName)
        .should("have.value", taskName);
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal mat-radio-button:eq(0) label`)
            .click()
            .then(() => {
              const data = {};
              cy
                .get("bridge-expansion-table bridge-expansion-panel .expanstion-panel-row:eq(0)")
                .find("div.column")
                .each(($div, index) => {
                  cy.wrap($div).within((t) => (data[keysPackage[index]] = t.text()));
                }),
                task.package.push(data);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              const data = {};
              cy
                .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .find("td")
                .each(($td, index) => {
                  if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                }),
                task.assets.push(data);
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });

      // Check the Start at value of Download Package Settings
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click();
      downloadDate.setDate(downloadDate.getDate() + 3);
      let check = Cypress.moment.utc(downloadDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      // Check the Start at value of Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click();
      installDate.setDate(installDate.getDate() + 5);
      check = Cypress.moment.utc(installDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click();
      cy.wait(3000);
    });
    const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
    const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";
    const defaultImg = "assets/img/icons/arrows-alt-v-solid.svg";
    const sortsEvent = [
      {
        key: "name",
        name: "Name",
      },
      {
        key: "summary",
        name: "Summary",
      },
      {
        key: "date",
        name: "Date",
      },
      {
        key: "status",
        name: "Status",
      },
    ];

    sortsEvent.forEach(({ key, name }, index) => {
      // Sort the ascending order
      it(`Click ${name} to set the ascending order`, () => {
        cy.get(`.table-header-${key}`).then(($el) => {
          cy.wait(1000);
          cy.wrap($el)
            .find("button")
            .click({ force: true })
            .then(($el) => {
              // check img sort
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", upImg);
            });
        });
      });
      // Sort the descending order
      it(`Click ${name} to set the descending order`, () => {
        cy.get(`.table-header-${key}`).then(($el) => {
          cy.wait(1000);
          cy.wrap($el)
            .find("button")
            .click({ force: true })
            .then(($el) => {
              // check img sort
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", downImg);
            });
        });
      });
      // Sort the default order
      it(`Click ${name} to set the default order `, () => {
        cy.get(`.table-header-${key}`).then(($el) => {
          cy.wait(1000);
          cy.wrap($el)
            .find("button")
            .click({ force: true })
            .wait(500)
            .then(($el) => {
              // check img sort
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", defaultImg);
            });
        });
      });
    });
  });

  context("Accordion operations", () => {
    it("Click the Down Arrow expansion button on an accordion", () => {
      const task = {
        assets: [],
        package: [],
      };
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);
      const taskName = "Task Name";
      cy.get("bridge-deployment-reservation-page .task-details")
        .find(".mat-form-field input:eq(0)")
        .type(taskName)
        .should("have.value", taskName);
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal mat-radio-button:eq(0) label`)
            .click()
            .then(() => {
              const data = {};
              cy
                .get("bridge-expansion-table bridge-expansion-panel .expanstion-panel-row:eq(0)")
                .find("div.column")
                .each(($div, index) => {
                  cy.wrap($div).within((t) => (data[keysPackage[index]] = t.text()));
                }),
                task.package.push(data);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              const data = {};
              cy
                .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .find("td")
                .each(($td, index) => {
                  if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                }),
                task.assets.push(data);
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });

      // Check the Start at value of Download Package Settings
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click();
      downloadDate.setDate(downloadDate.getDate() + 3);
      let check = Cypress.moment.utc(downloadDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      // Check the Start at value of Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click();
      installDate.setDate(installDate.getDate() + 5);
      check = Cypress.moment.utc(installDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      // Click confirm
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click()
        .then(() => {
          cy.wait(1000);
          cy.get("bridge-deployment-reservation-confirmation-page").then(() => {
            // Click the Down Arrow
            cy.get(".expanstion-panel-row")
              .find(".toggle")
              .click()
              .then(() => {
                cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("be.visible");
                // Package check (Description, Upload by, Model, Firmware, Upload Status, Validation Status, Memo)
                cy.get("bridge-expansion-panel[data-test='expansion-row']:eq(0) div.body").then(($el) => {
                  cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                    .find("> li:eq(0) span:eq(1)")
                    .should("be.visible");
                  cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                    .find("> li:eq(1) span:eq(1)")
                    .should("be.visible");
                  cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                    .find("> li:eq(2) span:eq(1)")
                    .should("be.visible");
                  cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                    .find("> li:eq(4)")
                    .should("be.visible");
                  cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                    .find("> li:eq(0) span:eq(1)")
                    .should("be.visible");
                  cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                    .find("> li:eq(1) span:eq(1)")
                    .should("be.visible");
                  cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                    .find("> li:eq(2) .memo")
                    .should("be.visible");
                });
              });
          });
        });
    });

    it("Click Up Arrow expansion button on an accordion", () => {
      // Click the Up Arrow
      cy.get(".expanstion-panel-row")
        .find(".toggle")
        .click()
        .then(() => {
          cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");
        });
    });
  });

  context("Cancel operations", () => {
    it("Click the Cancel button after changing the values on the screen", () => {
      const task = {
        assets: [],
        package: [],
      };
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);
      const taskName = "Task Name";
      cy.get("bridge-deployment-reservation-page .task-details")
        .find(".mat-form-field input:eq(0)")
        .type(taskName)
        .should("have.value", taskName);
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal mat-radio-button:eq(0) label`)
            .click()
            .then(() => {
              const data = {};
              cy
                .get("bridge-expansion-table bridge-expansion-panel .expanstion-panel-row:eq(0)")
                .find("div.column")
                .each(($div, index) => {
                  cy.wrap($div).within((t) => (data[keysPackage[index]] = t.text()));
                }),
                task.package.push(data);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              const data = {};
              cy
                .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .find("td")
                .each(($td, index) => {
                  if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                }),
                task.assets.push(data);
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });

      // Check the Start at value of Download Package Settings
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click();
      downloadDate.setDate(downloadDate.getDate() + 3);
      let check = Cypress.moment.utc(downloadDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      // Check the Start at value of Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click();
      installDate.setDate(installDate.getDate() + 5);
      check = Cypress.moment.utc(installDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click()
        .then(() => {
          cy.get("bridge-deployment-reservation-confirmation-page")
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
    });

    it("Click Cancel button in the confirmation dialog", () => {
      const task = {
        assets: [],
        package: [],
      };
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);
      const taskName = "Task Name";
      cy.get("bridge-deployment-reservation-page .task-details")
        .find(".mat-form-field input:eq(0)")
        .type(taskName)
        .should("have.value", taskName);
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal mat-radio-button:eq(0) label`)
            .click()
            .then(() => {
              const data = {};
              cy
                .get("bridge-expansion-table bridge-expansion-panel .expanstion-panel-row:eq(0)")
                .find("div.column")
                .each(($div, index) => {
                  cy.wrap($div).within((t) => (data[keysPackage[index]] = t.text()));
                }),
                task.package.push(data);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              const data = {};
              cy
                .get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                .find("td")
                .each(($td, index) => {
                  if (index > 0) cy.wrap($td).within((t) => (data[keysAsset[index - 1]] = t.text()));
                }),
                task.assets.push(data);
              cy.wait(500);
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click();
            });
        });

      // Check the Start at value of Download Package Settings
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click();
      downloadDate.setDate(downloadDate.getDate() + 3);
      let check = Cypress.moment.utc(downloadDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      // Check the Start at value of Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click();
      installDate.setDate(installDate.getDate() + 5);
      check = Cypress.moment.utc(installDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      // select date
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      // select time
      cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)").click();
              });
            });
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click()
        .then(() => {
          cy.get("bridge-deployment-reservation-confirmation-page")
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
                      cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNewConfirm"));
                    });
                });
            });
        });
    });
  });
});
