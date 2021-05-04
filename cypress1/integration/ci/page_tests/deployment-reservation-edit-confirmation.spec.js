/// <reference types="Cypress" />
const timeZone = `GMT${Cypress.moment().format("Z")}`;
let packagesInvalidAssetsRL, apiTasksDeploymentsIdRL, apiAssets, apiPackages, apiTypes, apiRegions, apiCustomers, apiLocations;
let packages, page, assets, numberPage, taskPackage, visitData;
let task = {};
const keysAsset = ["status", "assetId", "alias", "typeId", "customerId", "regionId", "locationId"];
const keysAssetShow = ["status", "assetId", "alias", "typeId", "organization", "region", "location"];
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
const generatorDate = (dateString) => {
  const check = Cypress.moment(dateString);
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
const visitDataUrl = (key) => {
  const urlArg = Cypress.env(key).split("/");
  apiTasksDeploymentsIdRL = Cypress.env("apiTasksDeploymentsIdRL").replace("${1}", urlArg[3]);
  apiAssets = Cypress.env("apiAssets");
  apiPackages = Cypress.env("apiPackages");
  apiTypes = Cypress.env("apiTypes");
  apiRegions = Cypress.env("apiRegions");
  apiCustomers = Cypress.env("apiCustomers");
  apiLocations = Cypress.env("apiLocations");
  cy.server()
    .route("GET", `${apiAssets}*`)
    .as("apiAssets")
    .route("GET", `${apiPackages}*`)
    .as("apiPackages")
    .route("GET", `${apiTypes}*`)
    .as("apiTypes")
    .route("GET", `${apiRegions}*`)
    .as("apiRegions")
    .route("GET", `${apiCustomers}*`)
    .as("apiCustomers")
    .route("GET", `${apiTasksDeploymentsIdRL}*`)
    .as("apiTasksDeploymentsIdRL")
    .as("events");
  return cy
    .visit(Cypress.env(key))
    .wait(["@apiAssets", "@apiPackages", "@apiTasksDeploymentsIdRL", "@apiTypes", "@apiRegions", "@apiCustomers"], {
      requestTimeout: 10000,
    });
};
describe(`Page-Deployment Reservation Edit Confirmation`, () => {
  context(`Initial display`, () => {
    it("Initial display", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body.assets;
        task = api[2].response.body;
        packages = api[1].response.body;
        const downloadDate = new Date();
        const installDate = new Date();

        downloadDate.setDate(downloadDate.getDate() + 3);
        let check = Cypress.moment.utc(downloadDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
        let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
        cy.get(".download-setting bridge-date-picker input")
          .clear()
          .type(date)
          .blur();

        installDate.setDate(installDate.getDate() + 5);
        check = Cypress.moment.utc(installDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
        date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
        cy.get(".install-setting .install-setting-group bridge-date-picker input")
          .clear()
          .type(date)
          .blur();

        const downloadTime = Cypress.$(".download-setting bridge-time-picker input").val();
        const installTime = Cypress.$(".install-setting .install-setting-group bridge-time-picker input").val();
        const { packageId } = task.packages;
        const assetPost = [];
        cy.get(`bridge-table[data-test="asset-selected-table"] tbody tr`).each(($el) => {
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
        cy.get(`bridge-button[data-test="confirm-button"]`)
          .click()
          .then(() => {
            packagesInvalidAssetsRL = Cypress.env("apiPackagesInvalidAssetsRL").replace("${1}", packageId);
            cy.request("POST", packagesInvalidAssetsRL, assetPost).then(({ body }) => {
              console.log(body);
              cy.wait(500);
              cy.get(`div[data-test="deployment-name"]`)
                .invoke(`text`)
                .then((t) => t.trim())
                .should(`eq`, task.name);
              cy.get(`[data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
                .first()
                .find(`[class="expanstion-panel-row"]`)
                .find(">div:eq(1)")
                .find(">div")
                .first()
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", task.packages.name);
              // check Summary
              cy.get(`[data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
                .first()
                .find(`[class="expanstion-panel-row"]`)
                .find(">div:eq(2)")
                .find(">div")
                .first()
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", task.packages.summary);
              // check Date
              cy.get(`[data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
                .first()
                .find(`[class="expanstion-panel-row"]`)
                .find(">div:eq(3)")
                .find(">div")
                .first()
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", generatorDate(task.packages.date));
              cy.get(`bridge-pagination[data-test="package-pagination"] .description`)
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", "1 to 1 of 1 items");
              cy.get(`bridge-pagination[data-test="package-pagination"] nav.pagination button`)
                .its("length")
                .should("eq", 3);
              // Item check of Target Asset list (Status, Serial, Name, Model, Organization, Region, Location)
              cy.get(`[data-test="asset-selected-table"] bridge-table table tbody tr`)
                .its("length")
                .should("eq", task.assets.length);
              cy.get(`[data-test="asset-selected-table"] bridge-table table tbody tr`).each(($el, i) => {
                keysAsset.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.wrap($el)
                        .find(`td:eq(${index}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", task.assets[i][value]);
                      break;
                    default:
                      cy.wrap($el)
                        .find(`td:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", task.assets[i][value]);
                      break;
                  }
                });
              });
              // Display check (display) of the number of items in the Target Asset list
              cy.get(`bridge-pagination[data-test="asset-pagination"] .description`)
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", `1 to ${Math.min(task.assets.length, 10)} of ${task.assets.length} items`);
              // Display check (display) of paging of Target Asset list
              cy.get(`bridge-pagination[data-test="asset-pagination"] nav.pagination button`)
                .its("length")
                .should("eq", Math.min(task.assets.length, 7) + 2);

              // Check the Date value of Download Package Settings
              let check = Cypress.moment.utc(downloadDate, "YYYY-MM-DD HH:mm:ss");
              let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
              cy.get(".download-setting bridge-date-picker input")
                .invoke("val")
                .then((t) => {
                  const check1 = Cypress.moment.utc(t);
                  return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
                })
                .should("eq", date);
              cy.get(".download-setting bridge-time-picker input").should("have.value", downloadTime);
              check = Cypress.moment.utc(installDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
              date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
              cy.get(".install-setting .install-setting-group bridge-date-picker input")
                .invoke("val")
                .then((t) => {
                  const check1 = Cypress.moment.utc(t);
                  return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
                })
                .should("eq", date);
              cy.get(".install-setting .install-setting-group bridge-time-picker input").should("have.value", installTime);

              cy.get(".download-setting bridge-radio").should("have.attr", "ng-reflect-disabled", "true");
              cy.get(".download-setting bridge-date-picker input").should("have.disabled", "disabled");
              cy.get(".download-setting bridge-time-picker input").should("have.disabled", "disabled");

              cy.get(".download-setting")
                .first()
                .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
                .click()
                .then(() => {
                  // Check  show datePicker dialog
                  cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
                });
              cy.get(".download-setting")
                .first()
                .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
                .click()
                .then(() => {
                  // Check not show datePicker dialog
                  cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
                });
              cy.get(".install-setting bridge-radio").should("have.attr", "ng-reflect-disabled", "true");
              cy.get(".install-setting .install-setting-group .startDate bridge-radio input").should("have.disabled", "disabled");
              cy.get(".install-setting .install-setting-group bridge-date-picker input").should("have.disabled", "disabled");
              cy.get(".install-setting .install-setting-group bridge-time-picker input").should("have.disabled", "disabled");
            });
          });
      });
    });
  });

  context("Sorting operations", () => {
    sortsEvent.forEach(({ key, name }, index) => {
      // Sort the ascending order
      it(`Click ${name} to set the ascending order`, () => {
        cy.wait(1000);
        cy.get(`div[data-test="package-selected-block"] bridge-expansion-table .header .table-header-${key} button`)
          .click({ force: true })
          .then(($el) => {
            // check img sort
            cy.wrap($el)
              .find("bridge-svg-icon img")
              .should("have.attr", "src")
              .should("include", upImg);
            // });
          });
      });
      // Sort the descending order
      it(`Click ${name} to set the descending order`, () => {
        cy.wait(1000);
        cy.get(`div[data-test="package-selected-block"] bridge-expansion-table .header .table-header-${key} button`)
          .click()
          .then(($el) => {
            // check img sort
            cy.wait(1000);
            cy.wrap($el)
              .find("bridge-svg-icon img")
              .should("have.attr", "src")
              .should("include", downImg);
            // });
          });
      });
      // Sort the default order
      it(`Click ${name} to set the default order`, () => {
        cy.wait(1000);
        cy.get(`div[data-test="package-selected-block"] bridge-expansion-table .header .table-header-${key} button`)
          .click()
          .then(($el) => {
            // check img sort
            cy.wait(1000);
            cy.wrap($el)
              .find("bridge-svg-icon img")
              .should("have.attr", "src")
              .should("include", defaultImg);
            // });
          });
      });
    });
  });

  context("Accordion operations", () => {
    it("Click the Down Arrow expansion button on an accordion", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        console.log(api);
        cy.wait(1000);
        const packageSelect = api[2].response.body.packages;
        cy.wait(1000);
        cy.get("form").then(($form) => {
          cy.get(`div[data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]:eq(0)`).scrollIntoView();
          cy.get(
            `div[data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]:eq(0) button.expanstion-panel-row`,
          )
            .click()
            .then(($el) => {
              //  Accordion deployment status check (deployment)
              cy.wrap($el)
                .parents(`[data-test="expansion-row"]`)
                .find(".ng-trigger-bodyExpansion")
                .first()
                .should("be.visible");
              cy.wrap($el)
                .parents(`[data-test="expansion-row"]`)
                .find("bridge-package-expansion")
                .find(".expansion > div > ul.items:eq(0)")
                .within(() => {
                  cy.root()
                    .find(" > li:eq(0)")
                    .within(() => {
                      cy.root()
                        .find("span")
                        .last()
                        .should("have.text", packageSelect.description);
                    });
                  cy.root()
                    .find(" > li:eq(1)")
                    .within(() => {
                      cy.root()
                        .find("span")
                        .last()
                        .should("have.text", packageSelect.uploadBy);
                    });
                  cy.root()
                    .find(" > li:eq(2)")
                    .within(() => {
                      cy.root()
                        .find("span")
                        .last()
                        .should("have.text", packageSelect.model);
                    });
                  const { elements } = packageSelect;
                  if (elements.length > 0) {
                    cy.root()
                      .find(" > li:eq(4)")
                      .within(() => {
                        cy.root()
                          .find("ul")
                          .within(() => {
                            cy.root()
                              .find("li")
                              .each(($li, index) => {
                                cy.wrap($li)
                                  .find("span")
                                  .first()
                                  .should("have.text", elements[index].name + ":");
                                cy.wrap($li)
                                  .find("span")
                                  .last()
                                  .should("have.text", elements[index].version);
                              });
                          });
                      });
                  }
                });
              cy.wrap($el)
                .parents(`[data-test="expansion-row"]`)
                .find("bridge-package-expansion")
                .find(".expansion > div > ul.items:eq(1)")
                .within(() => {
                  cy.root()
                    .find("> li:eq(0)")
                    .within(() => {
                      cy.root()
                        .find("> span")
                        .last()
                        .find("span.icon-text")
                        .should("have.text", packageSelect.status);
                    });
                  cy.root()
                    .find("> li:eq(1)")
                    .within(() => {
                      cy.root()
                        .find("> span")
                        .last()
                        .find("span.icon-text")
                        .should("have.text", packageSelect.status);
                    });
                  cy.root()
                    .find("> li:eq(2)")
                    .within(() => {
                      cy.root()
                        .find(".memo")
                        .should("have.text", packageSelect.memo);
                    });
                });
            });
        });
      });
    });
    it("Click the Up Arrow expansion button on an accordion", () => {
      cy.get(`div[data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]:eq(0) button.expanstion-panel-row`)
        .click()
        .then(($el) => {
          cy.wrap($el)
            .parents(`[data-test="expansion-row"]`)
            .find(".ng-trigger-bodyExpansion")
            .first()
            .should("not.be.visible");
        });
    });
  });

  context("Cancel operations", () => {
    it("Click the Cancel button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[2].response.body.packages;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;
        taskAssets = api[2].response.body.assets;
      });
      cy.get("bridge-button[data-test='cancel-button']")
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
      cy.get("body")
        .find("mat-dialog-container bridge-alert")
        .should("exist")
        .within(() => {
          cy.get("bridge-button")
            .first()
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsEditScheduled"));
            });
        });
    });
  });
});
