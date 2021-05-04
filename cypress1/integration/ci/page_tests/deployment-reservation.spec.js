const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
const timeZone = `GMT${Cypress.moment().format("Z")}`;

describe("Page-Deployment Reservation", () => {
  const keysPackage = ["name", "summary", "date", "status"];
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
  before(() => {
    apiAssetDetail = Cypress.env("apiAssetDetail");
    apiPackages = Cypress.env("apiPackages");
    apiTasks = Cypress.env("apiTasks");
    deploymentsNew = Cypress.env("deploymentsNew");
    apiAssets = Cypress.env("apiAssets");
    apiTypes = Cypress.env("apiTypes");
    apiRegions = Cypress.env("apiRegions");
    apiCustomers = Cypress.env("apiCustomers");
    apiLocations = Cypress.env("apiLocations");
  });
  context("Initial display", () => {
    const downloadDate = new Date();
    const installDate = new Date();
    it("Displayed when transitioning from the Task List", () => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("apiTasks");
      cy.visit(Cypress.env("tasks")).wait("@apiTasks");
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-button.mat-menu-trigger button")
        .click({ force: true })
        .then(($el) => {
          cy.get(".cdk-overlay-container div.mat-menu-panel bridge-dropdown-menu-item:nth-child(1) div")
            .click()
            .then(() => {
              cy.get("bridge-deployment-reservation-page").within(() => {
                // Check task name
                cy.get("fieldset .task-details")
                  .find(".mat-form-field input")
                  .eq(0)
                  .should("have.value", "");

                // Check Package list
                cy.get("mat-dialog-container bridge-button[data-test='package-modal']").should("not.be.visible");

                cy.get("bridge-pagination[data-test='package-selected-pagination'] .page-item").should("not.be.visible");

                cy.get("bridge-pagination[data-test='package-selected-pagination'] .pagination").should("not.be.visible");

                // Check asset list
                cy.get("mat-dialog-container bridge-button[data-test='asset-modal']").should("not.be.visible");

                cy.get("bridge-pagination[data-test='asset-selected-pagination'] .page-item").should("not.be.visible");

                cy.get("bridge-pagination[data-test='asset-selected-pagination'] .pagination").should("not.be.visible");

                cy.get(".download-setting").within(() => {
                  // Check the value of Start at in Download Package Settings (Immediately)
                  cy.get("bridge-radio label > div")
                    .eq(0)
                    .should("have.class", "checked");

                  // Check the Date status of Download Package Settings (inactive)
                  cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the Date value of Download Package Settings (blank)
                  cy.get("bridge-date-picker input.mat-input-element").should("have.value", "");

                  // Check the status of the Date selection button in Download Package Settings (inactive)
                  cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the Timne status of Download Package Settings (inactive)
                  cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the Timne value of Download Package Settings (blank)
                  cy.get("bridge-time-picker input.mat-input-element").should("have.value", "");

                  // Check the status of the Timne selection button in Download Package Settings (inactive)
                  cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the time zone value of Download Package Settings
                  cy.get(".time-zone-group p")
                    .contains(timeZone)
                    .should("be.visible");
                });

                cy.get(".install-setting").within(() => {
                  // Check the value of Install in Install Settings (Yes)
                  cy.get(".install bridge-radio label > div")
                    .eq(0)
                    .should("have.class", "checked");

                  cy.get(".install-setting-group").within(() => {
                    // Check the value of Start at in  Install Settings (Immediately)
                    cy.get("bridge-radio label > div")
                      .eq(0)
                      .should("have.class", "checked");

                    // Check the Date status of  Install Settings (inactive)
                    cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the Date value of  Install Settings (blank)
                    cy.get("bridge-date-picker input.mat-input-element").should("have.value", "");

                    // Check the status of the Date selection button in  Install Settings (inactive)
                    cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the Timne status of  Install Settings (inactive)
                    cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the Timne value of  Install Settings (blank)
                    cy.get("bridge-time-picker input.mat-input-element").should("have.value", "");

                    // Check the status of the Timne selection button in  Install Settings (inactive)
                    cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the time zone value of  Install Settings
                    cy.get(".time-zone-group p").should("have.text", timeZone);
                  });
                });
                // Check the status of the Confirm button (inactive)
                cy.get("bridge-button[data-test='confirm-button']").should("have.attr", "ng-reflect-is-disabled", "true");
              });
            });
        });
    });

    it("Displayed when transitioning from the Asset Detail", () => {
      const task = {
        assets: [],
      };
      cy.server()
        .route("GET", `${Cypress.env("apiAssetDetail")}*`)
        .as("apiAssetDetail");
      cy.visit(Cypress.env("assetDetail"))
        .wait("@apiAssetDetail")
        .then((api) => {
          cy.wait(500);
          task.assets.push(api.response.body);
          cy.get("[data-test='asset-basis'] div.buttons li")
            .eq(2)
            .click()
            .then(() => {
              cy.wait(500);
              cy.get("bridge-deployment-reservation-page").within(() => {
                // Check task name
                cy.get("fieldset .task-details")
                  .find(".mat-form-field input")
                  .eq(0)
                  .should("have.value", "");

                // Check Package list
                cy.get("mat-dialog-container bridge-button[data-test='package-modal']").should("not.be.visible");

                cy.get("bridge-pagination[data-test='package-selected-pagination'] .page-item").should("not.be.visible");

                cy.get("bridge-pagination[data-test='package-selected-pagination'] .pagination").should("not.be.visible");

                // Check asset list
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
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", task.assets[0][value]);
                        break;
                      case "location":
                        cy.wrap($el)
                          .find(`td:eq(${index})`)
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", task.assets[0][value]);
                        break;
                      default:
                        cy.wrap($el)
                          .find(`td:eq(${index})`)
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", task.assets[0][value]);
                        break;
                    }
                  });
                });
                page = 0;
                cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                  .find("span.description")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", "1 to 1 of 1 items");

                cy.get(".download-setting").within(() => {
                  // Check the value of Start at in Download Package Settings (Immediately)
                  cy.get("bridge-radio label > div")
                    .eq(0)
                    .should("have.class", "checked");

                  // Check the Date status of Download Package Settings (inactive)
                  cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the Date value of Download Package Settings (blank)
                  cy.get("bridge-date-picker input.mat-input-element").should("have.value", "");

                  // Check the status of the Date selection button in Download Package Settings (inactive)
                  cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the Timne status of Download Package Settings (inactive)
                  cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the Timne value of Download Package Settings (blank)
                  cy.get("bridge-time-picker input.mat-input-element").should("have.value", "");

                  // Check the status of the Timne selection button in Download Package Settings (inactive)
                  cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                  // Check the time zone value of Download Package Settings
                  cy.get(".time-zone-group p")
                    .contains(timeZone)
                    .should("be.visible");
                });

                cy.get(".install-setting").within(() => {
                  // Check the value of Install in Install Settings (Yes)
                  cy.get(".install bridge-radio label > div")
                    .eq(0)
                    .should("have.class", "checked");

                  cy.get(".install-setting-group").within(() => {
                    // Check the value of Start at in  Install Settings (Immediately)
                    cy.get("bridge-radio label > div")
                      .eq(0)
                      .should("have.class", "checked");

                    // Check the Date status of  Install Settings (inactive)
                    cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the Date value of  Install Settings (blank)
                    cy.get("bridge-date-picker input.mat-input-element").should("have.value", "");

                    // Check the status of the Date selection button in  Install Settings (inactive)
                    cy.get("bridge-date-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the Timne status of  Install Settings (inactive)
                    cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the Timne value of  Install Settings (blank)
                    cy.get("bridge-time-picker input.mat-input-element").should("have.value", "");

                    // Check the status of the Timne selection button in  Install Settings (inactive)
                    cy.get("bridge-time-picker").should("have.attr", "ng-reflect-disabled", "true");

                    // Check the time zone value of  Install Settings
                    cy.get(".time-zone-group p")
                      .contains(timeZone)
                      .should("be.visible");
                  });
                });
                // Check the status of the Confirm button (inactive)
                cy.get("bridge-button[data-test='confirm-button']").should("have.attr", "ng-reflect-is-disabled", "true");
              });
            });
        });
    });

    it("Displayed when transitioning from the Confirmation", () => {
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
      let dateDownload = (check.isValid() && check.local().format("M/D/YYYY")) || "";
      let timeDownload;
      // select date
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(dateDownload)
        .blur();
      // select time
      cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)")
                  .click()
                  .then((value) => {
                    let check = Cypress.moment.utc(value);
                    timeDownload = (check.isValid() && check.format("h:mm A")) || "";
                  });
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
      dateInstall = (check.isValid() && check.local().format("M/D/YYYY")) || "";
      let timeInstall;
      // select date
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(dateInstall)
        .blur();
      // select time
      cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)")
                  .click()
                  .then((value) => {
                    let check = Cypress.moment.utc(value);
                    timeInstall = (check.isValid() && check.format("h:mm A")) || "";
                  });
              });
            });
        });
      // Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .click()
        .then(() => {
          cy.wait(500);
          // Click back deployment new
          cy.get("bridge-deployment-reservation-confirmation-page")
            .find("bridge-button[data-test='back-button'] button")
            .click()
            .then(() => {
              cy.wait(500);
              // check task name
              cy.get("bridge-deployment-reservation-page .task-details")
                .find(".mat-form-field input")
                .eq(0)
                .should("have.value", taskName);
              // check package
              cy.get("bridge-deployment-reservation-page bridge-expansion-panel[data-test='expansion-row']")
                .its("length")
                .should("eq", 1);
              cy.get("bridge-deployment-reservation-page bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
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
              cy.get("bridge-deployment-reservation-page bridge-pagination[data-test='package-selected-pagination']")
                .find("span.description")
                .invoke("text")
                .then((text) => text.trim())
                .should("equal", "1 to 1 of 1 items");
              numberPage = Math.ceil(task.package.length / 10) + 2;
              cy.get("bridge-deployment-reservation-page bridge-pagination[data-test='package-selected-pagination']")
                .find("nav button")
                .its("length")
                .should("be.eq", Math.min(numberPage, 9));

              // check asset
              cy.get("bridge-deployment-reservation-page bridge-table[data-test='asset-selected-table'] tbody")
                .find("tr")
                .its("length")
                .should("eq", 1);
              //Display check (display) of the number of items in the Target Asset list
              cy.get("bridge-deployment-reservation-page bridge-table[data-test='asset-selected-table'] tbody tr").each(($el, i) => {
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
              cy.get("bridge-deployment-reservation-page bridge-pagination[data-test='asset-selected-pagination']")
                .find("span.description")
                .invoke("text")
                .then((text) => text.trim())
                .should("equal", `1 to 1 of 1 items`);
              numberPage = Math.ceil(task.assets.length / 10) + 2;
              cy.get("bridge-deployment-reservation-page bridge-pagination[data-test='asset-selected-pagination']")
                .find("nav button")
                .its("length")
                .should("be.eq", Math.min(numberPage, 9));

              // check download setting
              cy.get(".download-setting").within(() => {
                // Check the Start at value of Download Package Settings
                cy.get("bridge-radio")
                  .eq(1)
                  .should("have.attr", "ng-reflect-value", "true");
                // check date value Download Package Settings
                cy.get("bridge-date-picker mat-form-field:eq(0) .mat-form-field-infix input")
                  .first()
                  .should("have.value", dateDownload);
                // check time value Download Package Settings
                cy.get("bridge-time-picker mat-form-field:eq(0) .mat-form-field-infix input")
                  .first()
                  .should("have.value", timeDownload);
                // Time zone value check
                cy.get(".time-zone-group")
                  .find("p")
                  .should("have.text", timeZone);
              });

              // Check the Install value in Install Settings
              cy.get("bridge-deployment-reservation-page .install-setting")
                .find("bridge-radio")
                .eq(0)
                .should("have.attr", "ng-reflect-value", "true");

              cy.get("bridge-deployment-reservation-page .install-setting-group").within(() => {
                // Check the Start at value of Install Settings
                cy.get("bridge-radio")
                  .eq(1)
                  .should("have.attr", "ng-reflect-value", "true");
                // check date value of Install Settings
                cy.get("bridge-date-picker mat-form-field:eq(0) .mat-form-field-infix input")
                  .first()
                  .should("have.value", dateInstall);
                // check time value of Install Settings
                cy.get("bridge-time-picker mat-form-field:eq(0) .mat-form-field-infix input")
                  .first()
                  .should("have.value", timeInstall);
                // Time zone value check
                cy.get(".time-zone-group")
                  .find("p")
                  .should("have.text", timeZone);
              });

              // Confirm button status check (activity)
              cy.get("bridge-deployment-reservation-page")
                .find("bridge-button[data-test='confirm-button'] button")
                .should("not.be.disabled");
            });
        });
    });
  });

  context("Package operations", () => {
    before(() => {
      cy.visit(Cypress.env("deploymentsNew"));
    });
    // Check Package list
    it("Click the Select package button", () => {
      cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
        cy.get("bridge-button[data-test='package-modal'] button")
          .click()
          .wait(500);
        cy.get("mat-dialog-container").should("be.visible");
      });
    });

    // Display after the package is selected
    it("Display after the package is selected", () => {
      const task = {
        package: [],
      };
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
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
      cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
        const { body } = res;
        //  Package list display check
        cy.get("bridge-deployment-reservation-page").within(() => {
          cy.get("bridge-expansion-panel[data-test='expansion-row']")
            .its("length")
            .should("be.eq", 1);
        });

        // Package list item check (Name, Summary, Date, Status)
        cy.get("bridge-expansion-table bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
          keysPackage.forEach((value, index) => {
            switch (value) {
              case "name":
                cy.wrap($el)
                  .find(`div[data-test='column']:eq(${index})`)
                  .invoke("text")
                  .should("equal", task.package[0].name);
                break;
              case "summary":
                cy.wrap($el)
                  .find(`div[data-test='column']:eq(${index})`)
                  .invoke("text")
                  .should("equal", task.package[0].summary);
                break;
              case "date":
                cy.wrap($el)
                  .find(`div[data-test='column']:eq(${index})`)
                  .invoke("text")
                  .should("equal", task.package[0].date);
                break;
              case "status":
                cy.wrap($el)
                  .find(`div[data-test='column']:eq(${index})`)
                  .invoke("text")
                  .should("equal", task.package[0].status);
                break;
              default:
                break;
            }
          });
        });

        //  Package list accordion expansion check (unexpanded)
        cy.get("bridge-expansion-table").within(() => {
          cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");
        });

        // check of the number of packages
        cy.get("bridge-pagination")
          .find("span.description")
          .invoke("text")
          .then((text) => text.trim())
          .should("equal", `1 to 1 of 1 items`);

        // Package paging display check
        cy.get("bridge-deployment-reservation-page bridge-pagination")
          .find("nav button")
          .its("length")
          .should("be.eq", 3);
      });
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

    // Click the Down Arrow and Up Arrow expansion button on an accordion
    it("Click the Down Arrow expansion button on an accordion", () => {
      cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
        const { body } = res;
        // Click the Down Arrow
        cy.get(".expanstion-panel-row:eq(0)")
          .find(".toggle")
          .click()
          .then(() => {
            cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("be.visible");
            // Package item check (Description, Upload by, Model, Firmware, Upload Status, Validation Status, Memo)
            cy.get("bridge-expansion-panel[data-test='expansion-row']:eq(0) div.body").then(($el) => {
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(0) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].description);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(1) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].uploadBy);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(2) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].model);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(4)")
                .within(() => {
                  cy.get("ul li").each(($item, $indexItem) => {
                    cy.wrap($item)
                      .find("span")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${body.items[0].elements[$indexItem].name}:${body.items[0].elements[$indexItem].version}`);
                  });
                });
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                .find("> li:eq(0) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].status);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                .find("> li:eq(1) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].status);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                .find("> li:eq(2) .memo")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].memo);
            });
          });
      });
    });
    it("Click the Up Arrow expansion button on an accordion", () => {
      // Click the Up Arrow
      cy.get(".expanstion-panel-row:eq(0)")
        .find(".toggle")
        .click()
        .then(() => {
          cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");
        });
    });
  });

  context("Target Asset operations", () => {
    it("Click the Select assets button", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal`).then(($el) => {
            cy.wrap($el)
              .find("header")
              .should("exist");
            cy.wrap($el)
              .find("table[data-test='asset-table']")
              .should("exist");
          });
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal .cancel-button`).click();
        });
    });

    it("Display after an asset is selected, more than 1 selection", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
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
                      cy.request(`${apiAssets}?assets?isFilter=false&limit=10&offset=0`).then(({ body }) => {
                        cy.wait(500);
                        cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                          .find("tr")
                          .its("length")
                          .should("eq", Math.min(body.items.length, 10));
                        //Display check (display) of the number of items in the Target Asset list
                        cy.get("bridge-table tbody tr").each(($el, i) => {
                          keysAsset.forEach((value, index) => {
                            switch (value) {
                              case "status":
                                cy.wrap($el)
                                  .find(`td:eq(${index}) .badge`)
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("equal", body.items[i][value]);
                                break;
                              case "location":
                                cy.wrap($el)
                                  .find(`td:eq(${index})`)
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("equal", body.items[i][value]);
                                break;
                              default:
                                cy.wrap($el)
                                  .find(`td:eq(${index})`)
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("equal", body.items[i][value]);
                                break;
                            }
                          });
                        });
                        page = 0;
                        cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                          .find("nav button")
                          .its("length")
                          .should("be.eq", Math.min(body.items.length / 10) + 2);
                        cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                          .find("span.description")
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of 10 items`);
                      });
                    });
                });
            });
        });
    });

    it("Displayed after an asset is selected, 0 selections", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
            .invoke("attr", "ng-reflect-selected")
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click()
                .then(() => {
                  cy.request(`${apiAssets}?assets?isFilter=false&limit=10&offset=0`).then(() => {
                    cy.wait(500);
                    cy.get("bridge-table[data-test='asset-selected-table'] tbody").should("not.be.visible");
                    //Display check (display) of the number of items in the Target Asset list
                    cy.get("bridge-table tbody tr").should("not.be.visible");
                    cy.get("bridge-pagination[data-test='asset-selected-pagination']").should("not.be.visible");
                  });
                });
            });
        });
    });

    it("Click the page 2 button", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
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

  context("Download Package Setting operations", () => {
    it("Select Start at Immediately", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          // Check not show datePicker dialog
          cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
        });
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          // Check not show datePicker dialog
          cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
        });
    });

    it("Select Select Date/Time of Start at", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      // Date status check (activity)
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .eq(1)
        .click()
        .should("have.attr", "ng-reflect-checked", "true");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
        .should("not.have.disabled")
        .should("have.value", "");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          // Check  show datePicker dialog
          cy.get(".cdk-overlay-container mat-datepicker-content").should("exist");
          cy.get("body").click();
        });
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          // Check not show datePicker dialog
          cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
        });
    });

    it("Enter the date", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      // Check the value of Start at
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click()
        .should("have.attr", "ng-reflect-value", "true");
      // Date value check
      cy.get("bridge-deployment-reservation-page ")
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(1) td:eq(0)")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar")
                .invoke("attr", "ng-reflect-selected")
                .then((value) => {
                  cy.wait(500);
                  const check = Cypress.moment.utc(value);
                  const dateTime = (check.isValid() && check.format("M/D/YYYY")) || "";
                  cy.get("bridge-date-picker mat-form-field:eq(0) .mat-form-field-infix input")
                    .eq(0)
                    .should("have.value", dateTime);
                });
            });
        });
      // Time status check (activity)
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.attr", "ng-reflect-disable-control", "false");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.attr", "ng-reflect-placeholder", "Time");
      // Check the status of the Time selection button (activity)
      cy.get("bridge-deployment-reservation-page .download-setting")
        .eq(0)
        .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          // Check not show datePicker dialog
          cy.get(".cdk-overlay-container bridge-time-picker-content").should("exist");
        });
    });
  });

  context("Install Setting operations", () => {
    it("Select Install Yes", () => {
      cy.visit(Cypress.env("deploymentsNew"));
      // Check the value of Install in Install Settings (Yes)
      cy.get(".install bridge-radio label > div")
        .eq(0)
        .click()
        .should("have.class", "checked");

      // Check the value of Start at in  Install Settings (Immediately)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(0)
        .click()
        .should("have.attr", "ng-reflect-disabled", "false");

      // Date status check (inactive) and Date value check (blank)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");

      // Check the status of the Date selection button (inactive)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
        });

      // Time status check (inactive) and Time value check (blank)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");

      // Check the status of the Time selection button (inactive)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
        });
    });

    it("Select Install No", () => {
      cy.visit(Cypress.env("deploymentsNew"));
      // Check the value of Install in Install Settings (No)
      cy.get(".install bridge-radio label > div")
        .eq(1)
        .click()
        .should("have.class", "checked");

      // Check the value of Start at in  Install Settings (Immediately)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(0)
        .click()
        .should("have.attr", "ng-reflect-disabled", "true");

      // Date status check (inactive) and Date value check (blank)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");

      // Check the status of the Date selection button (inactive)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
        });

      // Time status check (inactive) and Time value check (blank)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");

      // Check the status of the Time selection button (inactive)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .first()
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
        });
    });

    it("Select Start at Immediately", () => {
      cy.visit(Cypress.env("deploymentsNew"));
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(0)
        .click()
        .then(() => {
          // Date status check (inactive) and Date value check (blank)
          cy.get("bridge-deployment-reservation-page .install-setting-group")
            .first()
            .find("bridge-date-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("have.value", "");
          // Check the status of the Date selection button (inactive)
          cy.get("bridge-deployment-reservation-page .install-setting-group")
            .first()
            .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
            });
          // Time status check (inactive) and Time value check (blank)
          cy.get("bridge-deployment-reservation-page .install-setting-group")
            .first()
            .find("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
            .should("have.disabled", "disabled")
            .should("have.value", "");
          // Check the status of the Time selection button (inactive)
          cy.get("bridge-deployment-reservation-page .install-setting-group")
            .first()
            .find("bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
            });
        });
    });

    it("Select Date/Time of Start at", () => {
      cy.visit(Cypress.env("deploymentsNew"));
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click()
        .should("have.attr", "ng-reflect-checked", "true");

      // Date status check (activity) and Date value check (blank)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .eq(0)
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("not.have.disabled")
        .should("have.value", "");

      // Check the status of the Date selection button (activity)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .eq(0)
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container mat-datepicker-content").should("exist");
          cy.get("body").click();
        });

      // Time status check (inactive) and Time value check (blank)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .eq(0)
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.disabled", "disabled")
        .should("have.value", "");

      // Check the status of the Time selection button (inactive)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .eq(0)
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
        });
    });

    it("Enter the date", () => {
      cy.visit(Cypress.env("deploymentsNew"));
      // Check the value of Start at
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click();
      // select date
      cy.get("bridge-deployment-reservation-page ")
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(1) td:eq(0)").click();
        });
      // Time status check (activity)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.attr", "ng-reflect-disable-control", "false");
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field .mat-form-field-infix input")
        .should("have.attr", "ng-reflect-placeholder", "Time");
      // Check the status of the Time selection button (activity)
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .eq(0)
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          // Check not show datePicker dialog
          cy.get(".cdk-overlay-container bridge-time-picker-content").should("exist");
        });
    });
  });

  context("Cancel operations", () => {
    it("Click the Cancel button after changing the values on the screen", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);
      // taskName value check
      const taskName = "test button cancel";
      cy.get("bridge-deployment-reservation-page")
        .find("fieldset .task-details .mat-form-field input")
        .eq(0)
        .type(taskName)
        .should("have.value", taskName);

      // Confirm that the confirmation dialog is displayed.
      cy.get("bridge-deployment-reservation-page")
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

    it("Click Cancel button in the confirmation dialog", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);

      // taskName value check
      const taskName = "test button cancel";
      cy.get("bridge-deployment-reservation-page")
        .find("fieldset .task-details .mat-form-field input")
        .eq(0)
        .type(taskName)
        .should("have.value", taskName);

      // Confirm that the confirmation dialog is displayed.
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='cancel-button'] button")
        .click()
        .within(() => {
          cy.root()
            .parents("body")
            .find("mat-dialog-container bridge-alert bridge-button")
            .first()
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
            });
        });
    });
  });

  context("Confirm operations", () => {
    it("Task Name not entered", () => {
      cy.visit(Cypress.env("deploymentsNew"));
      // Task Name not selected
      const taskName = "";
      cy.get("bridge-deployment-reservation-page .task-details")
        .find(".mat-form-field input:eq(0)")
        .should("have.value", taskName);
      cy.wait(100);
      // Confirm status check (inactive)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] .primary disabled button")
        .should("not.be.enabled");
    });

    it("Package not entered", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages"]);

      // Package not selected
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
            .invoke("attr", "ng-reflect-selected")
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click()
                .then(() => {
                  cy.wait(100);
                  // Confirm status check (inactive)

                  cy.get("bridge-deployment-reservation-page")
                    .find("bridge-button[data-test='confirm-button'] .primary disabled button")
                    .should("not.be.enabled");
                });
            });
        });
    });

    it("Target Asset not selected", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");

      // Target Asset not selected
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
            .invoke("attr", "ng-reflect-selected")
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                .last()
                .click()
                .then(() => {
                  cy.wait(100);
                  // Confirm status check (inactive)

                  cy.get("bridge-deployment-reservation-page")
                    .find("bridge-button[data-test='confirm-button'] .primary disabled button")
                    .should("not.be.enabled");
                });
            });
        });
    });

    it("When Select Date/Time is selected for Start at in the Download Package Setting, Date is not entered", () => {
      cy.visit(Cypress.env("deploymentsNew"));

      // When Select Date/Time is selected for Start at in the Download Package Setting, Date is not entered
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .last()
        .click()
        .should("have.attr", "ng-reflect-value", "true")
        .then(() => {
          cy.wait(100);

          // Confirm status check (inactive)
          cy.get("bridge-deployment-reservation-page")
            .find("bridge-button[data-test='confirm-button'] .primary disabled button")
            .should("not.be.enabled");
        });
    });

    it("When Select Date/Time is selected for Start at in Install Setting, Date is not entered", () => {
      cy.visit(Cypress.env("deploymentsNew"));

      // When Select Date/Time is selected for Start at in Install Setting, Date is not entered
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .last()
        .click()
        .should("have.attr", "ng-reflect-value", "true")
        .then(() => {
          cy.wait(100);

          // Confirm status check (inactive)
          cy.get("bridge-deployment-reservation-page")
            .find("bridge-button[data-test='confirm-button'] .primary disabled button")
            .should("not.be.enabled");
        });
    });

    it("Enter Task Name, select Package, select Target Asset, Start at Immediately in Download Package Setting, Start at Immediately in Install Setting", () => {
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
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });
      // Start at Immediately in Download Package Setting
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-checked", "true");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-value", "false");

      // Start at Immediately in Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-checked", "true");
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-value", "false");

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button']")
        .should("have.attr", "ng-reflect-is-disabled", "false");
    });

    it("Enter Task Name, select Package, select Target Asset, select Select Date/Time for Start at Download Package Setting and enter Date, select Immediately for Start at Install Setting", () => {
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
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });
      // select Select Date/Time for Start at Download Package Setting and enter Date
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click()
        .should("have.attr", "ng-reflect-value", "true");
      // Date value check
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(1) td:eq(0)").click();
        });

      // Start at Immediately in Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-checked", "true");
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-value", "false");

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button']")
        .should("have.attr", "ng-reflect-is-disabled", "false");
    });

    it("Enter Task Name, select Package, select Target Asset, Start at Download Package Setting is Immediately, Start at Install Setting is Select Date/Time, and enter Date", () => {
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
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });

      // Start at Download Package Setting is Immediately
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-checked", "true");
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .first()
        .should("have.attr", "ng-reflect-value", "false");

      // Start at Install Setting is Select Date/Time, and enter Date
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click()
        .should("have.attr", "ng-reflect-value", "true");
      // Date value check
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(1) td:eq(0)").click();
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button']")
        .should("have.attr", "ng-reflect-is-disabled", "false");
    });

    it("Enter Task Name, select Package, select Target Asset, Download Package Setting Start at Select Date/Time and enter the date, Install Setting Start at Select Date/Time and enter the date", () => {
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
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click();
                });
            });
        });

      // select Select Date/Time for Start at Download Package Setting and enter Date
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-radio")
        .eq(1)
        .click()
        .should("have.attr", "ng-reflect-value", "true");
      // Date value check
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(1) td:eq(0)").click();
        });

      // Install Setting Start at Select Date/Time and enter the date
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .eq(1)
        .click()
        .should("have.attr", "ng-reflect-value", "true");
      // Date value check
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-calendar mat-month-view tbody tr:eq(1) td:eq(0)").click();
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button']")
        .should("have.attr", "ng-reflect-is-disabled", "false");
    });

    it("Check the consistency between Package and Asset when click the Confirm button", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      visitData = cy.visit(Cypress.env("deploymentsNew")).wait(["@apiPackages", "@apiAssets"]);
      visitData.then((res) => {
        package = res[0].response.body.packages;
        packages = res[0].response.body;
        assets = res[1].response.body;
      });
      const taskName = "New Deployment";
      cy.wait(500);
      cy.get("bridge-deployment-reservation-page").then(($form) => {
        cy.wrap($form)
          .find("mat-form-field input[name='deploymentName']")
          .focus()
          .then(($el) => {
            cy.wrap($el)
              .clear()
              .type(taskName)
              .then(() => {
                cy.wrap($el).blur();
              });
          });
        cy.wrap($form)
          .find("bridge-button[data-test='package-modal']")
          .click()
          .then(() => {
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
              cy.wait(500);
              const { body } = res;
              if (body.items.length > 0) {
                cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(1)")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              }
            });
          });
        cy.wrap($form)
          .find("bridge-button[data-test='asset-modal']")
          .click()
          .then(() => {
            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
              .click()
              .then(() => {
                cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
      });
      cy.get(".download-setting bridge-radio")
        .first()
        .click();
      cy.get(".install-setting .install bridge-radio")
        .last()
        .click();
      cy.get("bridge-button[data-test='confirm-button'] button").should("not.have.disabled");
      cy.get("bridge-button[data-test='confirm-button'] button")
        .click()
        .then(() => {
          const { packageId } = packages.items[0];
          const assetPost = [];
          cy.get("bridge-table[data-test='asset-selected-table'] tbody tr").each(($el) => {
            assetPost.push({
              assetId: Cypress.$($el)
                .find("> td:eq(1)")
                .text()
                .trim(),
              typeId: Cypress.$($el)
                .find("> td:eq(3)")
                .text()
                .trim(),
            });
          });
          packagesInvalidAssetsRL = Cypress.env("apiPackagesInvalidAssetsRL").replace("${1}", packageId);
          cy.request("POST", packagesInvalidAssetsRL, assetPost).then(({ body }) => {
            if (body.length > 0) {
              cy.get("ul.list-error-valid li")
                .its("length")
                .should("eq", body.length);
              cy.get("ul.list-error-valid li").each(($li, index) => {
                const { assetId, typeId } = body[index];
                const message = `Match the selected asset(${assetId} / ${typeId}) with the target model in the package`;
                cy.wrap($li)
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", message);
              });
            }
          });
        });
    });

    it("Check the date and time in the Download Package Setting when click the Confirm button", () => {
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
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get("bridge-expansion-panel[data-test='expansion-row']")
                        .its("length")
                        .should("eq", 1);
                      cy.get("bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
                        keysPackage.forEach((value, index) => {
                          switch (value) {
                            case "name":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "summary":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "date":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "status":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            default:
                              break;
                          }
                        });
                      });
                      cy.get("bridge-pagination[data-test='package-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", "1 to 1 of 1 items");
                    });
                });
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
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
                      cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", `1 to 1 of 1 items`);
                    });
                });
            });
        });
      // Check the value of Start at
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .last()
        .click()
        .should("have.attr", "ng-reflect-value", "true");

      // Date value check
      cy.get("bridge-deployment-reservation-page ")
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(0)`)
                          .click()
                          .then(() => {
                            cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker']")
                              .invoke("attr", "ng-reflect-default")
                              .then((value) => {
                                const check = Cypress.moment.utc(value);
                                const date = (check.isValid() && check.format("M/D/YYYY")) || "";
                                cy.get(
                                  "bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", date);
                                const time = (check.isValid() && check.format("h:mm A")) || "";
                                cy.get(
                                  "bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", time);
                              });
                          });
                      });
                    });
                });
            });
        });
      cy.wait(100);

      // Time value check
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)")
            .click()
            .then((value) => {
              cy.wait(500);
              const check = Cypress.moment.utc(value);
              const dateTime = (check.isValid() && check.format("h:mm A")) || "";
              cy.get("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field:eq(0) .mat-form-field-infix input").should(
                "have.value",
                dateTime,
              );
            });
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click()
        .then(() => {
          cy.get("bridge-deployment-reservation-page")
            .find("fieldset form ul.list-error-valid")
            .should("exist");
        });
    });

    it("Check the date and time in the Install Setting when click the Confirm button", () => {
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
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get("bridge-expansion-panel[data-test='expansion-row']")
                        .its("length")
                        .should("eq", 1);
                      cy.get("bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
                        keysPackage.forEach((value, index) => {
                          switch (value) {
                            case "name":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "summary":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "date":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "status":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            default:
                              break;
                          }
                        });
                      });
                      cy.get("bridge-pagination[data-test='package-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", "1 to 1 of 1 items");
                    });
                });
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
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
                      cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", `1 to 1 of 1 items`);
                    });
                });
            });
        });
      // Check the value of Start at
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .last()
        .click()
        .should("have.attr", "ng-reflect-value", "true");

      // Date value check
      cy.get("bridge-deployment-reservation-page ")
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(0)`)
                          .click()
                          .then(() => {
                            cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker']")
                              .invoke("attr", "ng-reflect-default")
                              .then((value) => {
                                const check = Cypress.moment.utc(value);
                                const date = (check.isValid() && check.format("M/D/YYYY")) || "";
                                cy.get(
                                  "bridge-date-picker[data-test='expire-ins-date-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", date);
                                const time = (check.isValid() && check.format("h:mm A")) || "";
                                cy.get(
                                  "bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", time);
                              });
                          });
                      });
                    });
                });
            });
        });
      cy.wait(100);

      // Time value check
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)")
            .click()
            .then((value) => {
              cy.wait(500);
              const check = Cypress.moment.utc(value);
              const dateTime = (check.isValid() && check.format("h:mm A")) || "";
              cy.get("bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field:eq(0) .mat-form-field-infix input").should(
                "have.value",
                dateTime,
              );
            });
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click()
        .then(() => {
          cy.get("bridge-deployment-reservation-page")
            .find("fieldset form ul.list-error-valid")
            .should("exist");
        });
    });

    it("Check the date and time in the Download Package Setting and Install Setting when click the Confirm button", () => {
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
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get("bridge-expansion-panel[data-test='expansion-row']")
                        .its("length")
                        .should("eq", 1);
                      cy.get("bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
                        keysPackage.forEach((value, index) => {
                          switch (value) {
                            case "name":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "summary":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "date":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            case "status":
                              cy.wrap($el)
                                .find(`div[data-test='column']:eq(${index})`)
                                .should("be.visible");
                              break;
                            default:
                              break;
                          }
                        });
                      });
                      cy.get("bridge-pagination[data-test='package-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", "1 to 1 of 1 items");
                    });
                });
            });
        });
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
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
                      cy.get("bridge-pagination[data-test='asset-selected-pagination']")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", `1 to 1 of 1 items`);
                    });
                });
            });
        });
      // Check the value of Start at Download Package Setting
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-radio")
        .last()
        .click()
        .should("have.attr", "ng-reflect-value", "true");

      // Date value check
      cy.get("bridge-deployment-reservation-page ")
        .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(0)`)
                          .click()
                          .then(() => {
                            cy.get(".download-setting bridge-time-picker[data-test='start-date-dl-picker']")
                              .invoke("attr", "ng-reflect-default")
                              .then((value) => {
                                const check = Cypress.moment.utc(value);
                                const date = (check.isValid() && check.format("M/D/YYYY")) || "";
                                cy.get(
                                  "bridge-date-picker[data-test='start-date-dl-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", date);
                                const time = (check.isValid() && check.format("h:mm A")) || "";
                                cy.get(
                                  "bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", time);
                              });
                          });
                      });
                    });
                });
            });
        });
      cy.wait(100);

      // Check the value of Start at Install Setting
      cy.get("bridge-deployment-reservation-page .install-setting-group")
        .find("bridge-radio")
        .last()
        .click()
        .should("have.attr", "ng-reflect-value", "true");

      // Date value check
      cy.get("bridge-deployment-reservation-page ")
        .find("bridge-date-picker[data-test='expire-ins-date-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker'] bridge-button button")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(() => {
                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(0)`)
                          .click()
                          .then(() => {
                            cy.get(".install-setting-group bridge-time-picker[data-test='expire-ins-date-picker']")
                              .invoke("attr", "ng-reflect-default")
                              .then((value) => {
                                const check = Cypress.moment.utc(value);
                                const date = (check.isValid() && check.format("M/D/YYYY")) || "";
                                cy.get(
                                  "bridge-date-picker[data-test='expire-ins-date-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", date);
                                const time = (check.isValid() && check.format("h:mm A")) || "";
                                cy.get(
                                  "bridge-time-picker[data-test='expire-ins-date-picker'] mat-form-field:eq(0) .mat-form-field-infix input",
                                )
                                  .first()
                                  .should("have.value", time);
                              });
                          });
                      });
                    });
                });
            });
        });
      cy.wait(100);

      // Time value check
      cy.get("bridge-deployment-reservation-page .download-setting")
        .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-time-picker-content mat-option:eq(0)")
            .click()
            .then((value) => {
              cy.wait(500);
              const check = Cypress.moment.utc(value);
              const dateTime = (check.isValid() && check.format("h:mm A")) || "";
              cy.get("bridge-time-picker[data-test='start-date-dl-picker'] mat-form-field:eq(0) .mat-form-field-infix input").should(
                "have.value",
                dateTime,
              );
            });
        });

      //  Confirm button status check (activity)
      cy.get("bridge-deployment-reservation-page")
        .find("bridge-button[data-test='confirm-button'] button")
        .last()
        .click()
        .then(() => {
          cy.get("bridge-deployment-reservation-page")
            .find("fieldset form ul.list-error-valid")
            .should("exist");
        });
    });
  });
});

describe("Page-Deployment Reservation,Select Packages", () => {
  const keysPackage = ["name", "summary", "date", "status"];
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
  let listingCount;
  before(() => {
    apiAssetDetail = Cypress.env("apiAssetDetail");
    apiPackages = Cypress.env("apiPackages");
    apiTasks = Cypress.env("apiTasks");
    deploymentsNew = Cypress.env("deploymentsNew");
    apiAssets = Cypress.env("apiAssets");
    apiTypes = Cypress.env("apiTypes");
    apiRegions = Cypress.env("apiRegions");
    apiCustomers = Cypress.env("apiCustomers");
    apiLocations = Cypress.env("apiLocations");
  });
  context("Initial display", () => {
    it("Display with no arguments", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
            const { body } = res;
            // check Keyword
            cy.get("bridge-package-table-board")
              .find("bridge-search-box bridge-form input")
              .should("have.value", "");

            //  Package list display check
            cy.get("mat-dialog-container").within(() => {
              cy.get("bridge-expansion-panel[data-test='expansion-row']")
                .its("length")
                .should("be.eq", Math.min(body.items.length, 10));
            });

            // -Check the selection of RadioButton in the search result package (selected)
            cy.get("mat-dialog-container").within(() => {
              cy.get("bridge-expansion-panel[data-test='expansion-row']")
                .find("mat-radio-button")
                .should("have.attr", "ng-reflect-checked", "false");
            });

            // Package list item check (Name, Summary, Date, Status)
            cy.get("bridge-modal bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
              keysPackage.forEach((value, index) => {
                switch (value) {
                  case "name":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", body.items[i][value]);
                    break;
                  case "summary":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", body.items[i][value]);
                    break;
                  case "date":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", generatorDate(body.items[i][value]));
                    break;
                  case "status":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", body.items[i][value]);
                    break;
                  default:
                    break;
                }
              });
            });

            //  Package list accordion expansion check (unexpanded)
            cy.get("mat-dialog-container").within(() => {
              cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");
            });

            numberPage = Math.ceil(body.totalCount / 10) + 2;
            page = 0;
            // check of the number of packages
            cy.get("bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);

            // Package paging display check
            cy.get("bridge-modal bridge-pagination")
              .find("nav button")
              .its("length")
              .should("be.eq", numberPage);

            // on paging init load
            cy.get("bridge-pagination")
              .find(".pagination button")
              .then((listing) => {
                listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
                if (listingCount > 1) {
                  cy.get("mat-dialog-content")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.wrap(listing)
                        .not(".left-arrow,.right-arrow")
                        .eq("1")
                        .click()
                        .then(($el) => {
                          page = parseInt(Cypress.$($el).text()) - 1;
                          cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((r) => {
                            cy.get("bridge-expansion-panel[data-test='expansion-row']")
                              .its("length")
                              .should("be.eq", Math.min(r.body.items.length, 10));
                            cy.get("bridge-pagination")
                              .find("span.description")
                              .invoke("text")
                              .then((text) => text.trim())
                              .should(
                                "equal",
                                `${page * 10 + 1} to ${Math.min((page + 1) * 10, r.body.totalCount)} of ${r.body.totalCount} items`,
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
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
            const { body } = res;
            // check Keyword
            cy.get("bridge-package-table-board")
              .find("bridge-search-box bridge-form input")
              .should("have.value", "");

            //  Package list display check
            cy.get("mat-dialog-container").within(() => {
              cy.get("bridge-expansion-panel[data-test='expansion-row']")
                .its("length")
                .should("be.eq", Math.min(body.items.length, 10));
            });

            // -Check the selection of RadioButton in the search result package (not selected)
            cy.get("mat-dialog-container").within(() => {
              cy.get("bridge-expansion-panel[data-test='expansion-row']")
                .find("mat-radio-button")
                .eq(0)
                .click()
                .should("have.attr", "ng-reflect-checked", "true");
            });

            // Package list item check (Name, Summary, Date, Status)
            cy.get("bridge-modal bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
              keysPackage.forEach((value, index) => {
                switch (value) {
                  case "name":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", body.items[i][value]);
                    break;
                  case "summary":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", body.items[i][value]);
                    break;
                  case "date":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", generatorDate(body.items[i][value]));
                    break;
                  case "status":
                    cy.wrap($el)
                      .find(`div[data-test='column']:eq(${index})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", body.items[i][value]);
                    break;
                  default:
                    break;
                }
              });
            });

            //  Package list accordion expansion check (unexpanded)
            cy.get("mat-dialog-container").within(() => {
              cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");
            });

            numberPage = Math.ceil(body.totalCount / 10) + 2;
            page = 0;
            // check of the number of packages
            cy.get("bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);

            // Package paging display check
            cy.get("bridge-modal bridge-pagination")
              .find("nav button")
              .its("length")
              .should("be.eq", numberPage);

            // on paging init load
            cy.get("bridge-pagination")
              .find(".pagination button")
              .then((listing) => {
                listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
                if (listingCount > 1) {
                  cy.get("mat-dialog-content")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.wrap(listing)
                        .not(".left-arrow,.right-arrow")
                        .eq("1")
                        .click()
                        .then(($el) => {
                          page = parseInt(Cypress.$($el).text()) - 1;
                          cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((r) => {
                            cy.get("bridge-expansion-panel[data-test='expansion-row']")
                              .its("length")
                              .should("be.eq", Math.min(r.body.items.length, 10));
                            cy.get("bridge-pagination")
                              .find("span.description")
                              .invoke("text")
                              .then((text) => text.trim())
                              .should(
                                "equal",
                                `${page * 10 + 1} to ${Math.min((page + 1) * 10, r.body.totalCount)} of ${r.body.totalCount} items`,
                              );
                          });
                        });
                    });
                }
              });
          });
        });
    });
  });

  context("Search operations", () => {
    it("Enter keywords and click the Search button", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
            const { body } = res;
            // check Keyword
            keyword = "e2e debug patch";
            cy.get("bridge-package-table-board")
              .find("bridge-search-box bridge-form input")
              .type(keyword)
              .should("have.value", keyword);
            // submit filter
            cy.get("bridge-package-table-board bridge-search-box")
              .find("bridge-button button")
              .click();
            cy.request(`${apiPackages}?limit=10&offset=0&status=Complete&sort=desc&text=${keyword}`).then((res) => {
              if (res.body.items.length > 0) {
                cy.wait(500);
                cy.get("bridge-expansion-panel[data-test='expansion-row']").should("have.length", Math.min(10, res.body.items.length));
                numberPage = Math.ceil(res.body.totalCount / 10) + 2;
                cy.get("bridge-modal bridge-pagination")
                  .find("nav button")
                  .its("length")
                  .should("be.eq", numberPage);
                page = 0;
                cy.get("bridge-pagination")
                  .find("span.description")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`);
              }
            });
          });
        });
    });
  });

  context("Sorting operations", () => {
    before(() => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button").click();
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

    sortsEvent.forEach(({ key, name }) => {
      // sort ASC
      it(`Click ${name} to set the ascending order`, () => {
        cy.server()
          .route("GET", `${Cypress.env("apiPackages")}*`)
          .as(`sort${key}`);
        cy.wait(1000).then(() => {
          cy.get(`bridge-expansion-table .table-header-${key}`)
            .click()
            .then(() => {
              let resData;
              cy.wait(`@sort${key}`).then(({ responseBody }) => {
                resData = responseBody.items[0];
                cy.get("bridge-expansion-table bridge-expansion-panel")
                  .first()
                  .then((el) => {
                    cy.wait(1000);
                    // name
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(1)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.name}`);
                    // summary
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(2)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.summary}`);
                    // date
                    cy.wrap(el)
                      .find(" .expanstion-panel-row > div:eq(3)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", generatorDate(resData.date));
                    // status
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(4)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.status}`);
                  });
                // check img sort
                cy.get(`bridge-expansion-table .table-header-${key}`)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", upImg);
              });
            });
        });
      });
      // sort DESC
      it(`Click ${name} to set the descending order`, () => {
        cy.server()
          .route("GET", `${Cypress.env("apiPackages")}*`)
          .as(`sort${key}`);
        cy.wait(1000).then(() => {
          cy.get(`bridge-expansion-table .table-header-${key}`)
            .click()
            .then(() => {
              let resData;
              cy.wait(`@sort${key}`).then(({ responseBody }) => {
                resData = responseBody.items[0];
                cy.get("bridge-expansion-table bridge-expansion-panel")
                  .first()
                  .then((el) => {
                    cy.wait(1000);
                    // name
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(1)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.name}`);
                    // summary
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(2)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.summary}`);
                    // date
                    cy.wrap(el)
                      .find(" .expanstion-panel-row > div:eq(3)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", generatorDate(resData.date));
                    // status
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(4)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.status}`);
                  });
                // check img sort
                cy.get(`bridge-expansion-table .table-header-${key}`)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", downImg);
              });
            });
        });
      });
      // sort default
      it(`Click ${name} to set the default order`, () => {
        cy.server()
          .route("GET", `${Cypress.env("apiPackages")}*`)
          .as(`sort${key}`);
        cy.wait(1000).then(() => {
          cy.get(`bridge-expansion-table .table-header-${key}`)
            .click()
            .then(() => {
              let resData;
              cy.wait(`@sort${key}`).then(({ responseBody }) => {
                resData = responseBody.items[0];
                cy.get("bridge-expansion-table bridge-expansion-panel")
                  .first()
                  .then((el) => {
                    cy.wait(1000);
                    // name
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(1)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.name}`);
                    // summary
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(2)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.summary}`);
                    // date
                    cy.wrap(el)
                      .find(" .expanstion-panel-row > div:eq(3)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", generatorDate(resData.date));
                    // status
                    cy.wrap(el)
                      .find(".expanstion-panel-row > div:eq(4)")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${resData.status}`);
                  });
                // check img sort
                cy.get(`bridge-expansion-table .table-header-${key}`)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", defaultImg);
              });
            });
        });
      });
    });
  });

  context("Accordion operations", () => {
    before(() => {
      cy.visit(Cypress.env("deploymentsNew"));
      cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
        cy.get("bridge-button[data-test='package-modal'] button")
          .click()
          .wait(500);
      });
    });
    // Click the Down Arrow and Up Arrow expansion button on an accordion
    it("Click the Down Arrow expansion button on an accordion", () => {
      cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then((res) => {
        const { body } = res;
        // Click the Down Arrow
        cy.get(".expanstion-panel-row:eq(0)")
          .find(".toggle")
          .click()
          .then(() => {
            cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("be.visible");
            // Package item check (Description, Upload by, Model, Firmware, Upload Status, Validation Status, Memo)
            cy.get("bridge-expansion-panel[data-test='expansion-row']:eq(0) div.body").then(($el) => {
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(0) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].description);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(1) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].uploadBy);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(2) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].model);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(0)")
                .find("> li:eq(4)")
                .within(() => {
                  cy.get("ul li").each(($item, $indexItem) => {
                    cy.wrap($item)
                      .find("span")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", `${body.items[0].elements[$indexItem].name}:${body.items[0].elements[$indexItem].version}`);
                  });
                });
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                .find("> li:eq(0) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].status);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                .find("> li:eq(1) span:eq(1)")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].status);
              cy.get("bridge-package-expansion:eq(0) .expansion ul:eq(2)")
                .find("> li:eq(2) .memo")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].memo);
            });
          });
      });
    });

    it("Click  Up Arrow expansion button on an accordion", () => {
      // Click the Up Arrow
      cy.get(".expanstion-panel-row:eq(0)")
        .find(".toggle")
        .click()
        .then(() => {
          cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");
        });
    });
  });

  context("Paging operations", () => {
    it("Click the page 2 button", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .wait(1000)
        .then(() => {
          cy.get("mat-dialog-content")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:eq(2)")
                .click()
                .then(() => {
                  cy.wait(3000);
                  cy.request(`${Cypress.env("apiPackages")}?limit=10&status=Complete&offset=10`).then(({ body }) => {
                    cy.wait(500);
                    cy.get("bridge-expansion-table[data-test='package-table']")
                      .find("bridge-expansion-panel[data-test='expansion-row']")
                      .its("length")
                      .should("eq", Math.min(body.items.length, 10));
                    // Package list item check (Name, Summary, Date, Status)
                    cy.get("bridge-modal bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
                      keysPackage.forEach((value, index) => {
                        switch (value) {
                          case "name":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);
                            break;
                          case "summary":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);
                            break;
                          case "date":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", generatorDate(body.items[i][value]));
                            break;
                          case "status":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);
                            break;
                          default:
                            break;
                        }
                      });
                    });
                    // Accordion deployment status check (undeployed)
                    cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");

                    page = 1;
                    // check of the number of packages
                    cy.get("bridge-pagination")
                      .find("span.description")
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
                  });
                });
            });
        });
    });

    it("Click the > button", () => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .wait(1000)
        .then(() => {
          // Click the > button
          cy.get("mat-dialog-content")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:last-child")
                .click()
                .then(() => {
                  cy.wait(3000);
                  cy.request(`${Cypress.env("apiPackages")}?limit=10&status=Complete&offset=10`).then(({ body }) => {
                    cy.wait(500);
                    cy.get("bridge-expansion-table[data-test='package-table']")
                      .find("bridge-expansion-panel[data-test='expansion-row']")
                      .its("length")
                      .should("eq", Math.min(body.items.length, 10));
                    // Package list item check (Name, Summary, Date, Status)
                    cy.get("bridge-modal bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
                      keysPackage.forEach((value, index) => {
                        switch (value) {
                          case "name":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);
                            break;
                          case "summary":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);
                            break;
                          case "date":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", generatorDate(body.items[i][value]));
                            break;
                          case "status":
                            cy.wrap($el)
                              .find(`div[data-test='column']:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);
                            break;
                          default:
                            break;
                        }
                      });
                    });
                    // Accordion deployment status check (undeployed)
                    cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");

                    page = 1;
                    // check of the number of packages
                    cy.get("bridge-pagination")
                      .find("span.description")
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
                  });
                });
            });
        });
    });

    it("Click the < button", () => {
      // Click the > button
      cy.wait(1000);
      cy.get("mat-dialog-content").then(() => {
        cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:eq(0)")
          .click()
          .then(() => {
            cy.wait(3000);
            cy.request(`${Cypress.env("apiPackages")}?limit=10&status=Complete&offset=0`).then(({ body }) => {
              cy.wait(500);
              cy.get("bridge-expansion-table[data-test='package-table']")
                .find("bridge-expansion-panel[data-test='expansion-row']")
                .its("length")
                .should("eq", Math.min(body.items.length, 10));
              // Package list item check (Name, Summary, Date, Status)
              cy.get("bridge-modal bridge-expansion-panel[data-test='expansion-row']").each(($el, i) => {
                keysPackage.forEach((value, index) => {
                  switch (value) {
                    case "name":
                      cy.wrap($el)
                        .find(`div[data-test='column']:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[i][value]);
                      break;
                    case "summary":
                      cy.wrap($el)
                        .find(`div[data-test='column']:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[i][value]);
                      break;
                    case "date":
                      cy.wrap($el)
                        .find(`div[data-test='column']:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", generatorDate(body.items[i][value]));
                      break;
                    case "status":
                      cy.wrap($el)
                        .find(`div[data-test='column']:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[i][value]);
                      break;
                    default:
                      break;
                  }
                });
              });
              // Accordion deployment status check (undeployed)
              cy.get("bridge-expansion-panel[data-test='expansion-row'] div.body").should("not.be.visible");

              page = 0;
              // check of the number of packages
              cy.get("bridge-pagination")
                .find("span.description")
                .invoke("text")
                .then((text) => text.trim())
                .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
            });
          });
      });
    });
  });

  context("Cancel operations", () => {
    before(() => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
    });
    it("Click the Cancel button", () => {
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(
            `.cdk-overlay-container mat-dialog-container bridge-expansion-panel[data-test='expansion-row']:eq(0) mat-radio-button label`,
          )
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .first()
                    .click()
                    .then(() => {
                      cy.get("bridge-expansion-table[data-test='package-table']").should("not.exist");
                    });
                });
            });
        });
    });
  });

  context("OK operations", () => {
    before(() => {
      cy.server()
        .route("GET", `${apiPackages}*`)
        .as("apiPackages");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiPackages");
    });
    it("Click the OK button", () => {
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='package-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(
            `.cdk-overlay-container mat-dialog-container bridge-expansion-panel[data-test='expansion-row']:eq(0) mat-radio-button label`,
          )
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
                      cy.get("bridge-expansion-table[data-test='package-table']").should("exist");
                    });
                });
            });
        });
    });
  });
});

describe("Page-Deployment Reservation,Select Assets", () => {
  const assetStatus = ["Good", "Error", "Missing"];
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
  let page = 0,
    listingCount,
    apiAssets,
    numberPage;
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
  context("Initial display", () => {
    it("Display with no arguments", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
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
            cy.get("bridge-table tbody")
              .find("tr")
              .its("length")
              .should("be.eq", Math.min(res.body.items.length, 10));

            // check data map with table asset list
            cy.get("bridge-table tbody tr").each(($el, i) => {
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
            cy.get("bridge-pagination[data-test='bridge-pagination']")
              .find("nav button")
              .its("length")
              .should("be.eq", numberPage);
            cy.get("bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`);

            // on paging init load
            cy.get("bridge-pagination[data-test='bridge-pagination']")
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
                            cy.get("bridge-table tbody")
                              .find("tr")
                              .its("length")
                              .should("be.eq", Math.min(res.body.items.length, 10));
                            cy.get("bridge-pagination")
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
      cy.visit(Cypress.env("deploymentsNew")).wait("@dataAssets");
      // set check asset Model
      let modelData;
      let element;
      let resData;
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          // set check value key Keyword
          keyword = "this is alias";

          cy.get("bridge-side-board")
            .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
            .type(keyword);

          cy.get("bridge-side-board")
            .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
            .should("have.value", keyword);

          // set check asset status
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
                      .should("have.attr", "ng-reflect-checked", "false");
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
                  cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      // check the key word after filter
                      cy.get("bridge-side-board")
                        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
                        .should("have.value", keyword);
                      // status is checked by status
                      cy.get("bridge-side-board")
                        .find("bridge-checkbox-list[data-test='status-checkbox'] mat-checkbox:eq(0)")
                        .should("have.attr", "ng-reflect-checked", "true");
                      // Model is the value after filter
                      cy.get("bridge-side-board")
                        .find("bridge-select-multi[data-test='model-select'] mat-select")
                        .should("have.attr", "ng-reflect-value", modelData);
                      // get Data assets
                      cy.get("bridge-table-board bridge-table tbody tr")
                        .first()
                        .then((el) => {
                          cy.wrap(el).as("asset");
                          cy.get("@asset")
                            .find(".tableCell-checked mat-checkbox")
                            .should("have.attr", "ng-reflect-checked", "false");
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
                          page = 0;
                          cy.get("bridge-pagination[data-test='bridge-pagination']")
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
    it("Checking items in each list", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);

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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
      cy.request(`${apiTypes}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .click({ force: true })
            .then(() => {
              cy.wait(500);
              cy.get(".cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all']").click();
              cy.wait(500);
              cy.get(".cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all']").click();
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
      cy.request(`${apiTypes}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .click()
            .then(() => {
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
      cy.request(`${apiRegions}`).then(({ body }) => {
        if (body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='region-select'] mat-select")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${body[1].regionId}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-select[data-test='region-select']")
                    .invoke("attr", "ng-reflect-selected-item")
                    .should("contains", `${body[1].regionId}`);
                });
            });
        }
      });
    });

    it("Change Organization item to blank", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
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

    it("Change Organization item to none-blank ", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
      cy.request(`${apiCustomers}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-side-board")
            .find("bridge-select[data-test='organization-select'] mat-select")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel  mat-option:eq(1)`)
                .click()
                .then(() => {
                  cy.wait(500);
                  // check value organization
                  cy.get("bridge-select[data-test='organization-select'] mat-select")
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("to.be.eq", res.body[0].customerId);

                  cy.get("bridge-side-board")
                    // check value location
                    .find("bridge-select[data-test='location-select'] mat-select")
                    .should("have.attr", "ng-reflect-value", ``)
                    .click()
                    .then(() => {
                      // check length list location
                      cy.get(`.cdk-overlay-container .mat-select-panel  mat-option`).then(($el) => {
                        cy.wrap($el).should("have.length", 1);
                      });
                    });
                });
            });
        }
      });
    });

    it("Select a single Location item", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
      keyword = "no-item 0001 acb ##887";
      cy.get("bridge-side-board")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .type(keyword)
        .then(() => {
          cy.get("bridge-side-board")
            .find('bridge-button[data-test="ok"]')
            .click();
          cy.request(`${apiAssets}?text=${keyword}&sort=desc&isFilter=true&limit=10&offset=0`).then((res) => {
            cy.get("bridge-table tbody")
              .find("tr")
              .should("have.length", 0);
            cy.get("bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `No item`);
          });
        });
    });

    it("When clicked the OK button, there were more than 1 results", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
      cy.get("bridge-side-board")
        .find('bridge-button[data-test="ok"]')
        .click();
      cy.request(`${apiAssets}?sort=desc&isFilter=true&limit=10&offset=0`).then(({ body }) => {
        // check number recode return
        cy.wait(500);
        cy.get("bridge-table tbody")
          .find("tr")
          .its("length")
          .should("be.eq", Math.min(body.items.length, 10));
        // check data map with table asset list
        cy.get("bridge-table tbody tr").each(($el, i) => {
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
        cy.get("bridge-pagination")
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button").click();
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
      // sort ASC
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
                    cy.wait(500);
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
      // sort DESC
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
                    cy.wait(500);
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
      // sort default
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
                    cy.wait(500);
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button").click();
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
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody")
                .find("tr")
                .its("length")
                .should("be.eq", Math.min(res.body.items.length, 10));
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
              numberPage = Math.ceil(res.body.totalCount / 10) + 2;
              page = 1;
              cy.get(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
                .find("nav button")
                .its("length")
                .should("be.eq", Math.min(numberPage, 9));
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
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody")
                    .find("tr")
                    .its("length")
                    .should("be.eq", Math.min(res.body.items.length, 10));
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
                  numberPage = Math.ceil(res.body.totalCount / 10) + 2;

                  cy.get(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
                    .find("nav button")
                    .its("length")
                    .should("be.eq", Math.min(numberPage, 9));
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
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody")
                    .find("tr")
                    .its("length")
                    .should("be.eq", Math.min(res.body.items.length, 10));
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
                  numberPage = Math.ceil(res.body.totalCount / 10) + 2;
                  cy.get(".cdk-overlay-container bridge-table-board bridge-pagination[data-test='bridge-pagination']")
                    .find("nav button")
                    .its("length")
                    .should("be.eq", Math.min(numberPage, 9));
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
    });
    it("Click the Cancel button", () => {
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
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
                      cy.get("bridge-table[data-test='asset-selected-table']").should("not.exist");
                    });
                });
            });
        });
    });
  });
  context("OK operations", () => {
    before(() => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsNew")).wait("@apiAssets");
    });
    it("Click the OK button", () => {
      cy.get("bridge-deployment-reservation-page bridge-button[data-test='asset-modal'].basic button")
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
