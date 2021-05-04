/// <reference types="Cypress" />

const generatorDate = (dateString) => {
  const check = Cypress.moment(dateString);
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};

const timeZone = `GMT${Cypress.moment().format("Z")}`;

let packagesInvalidAssetsRL, apiTasksDeploymentsIdRL, apiAssets, apiPackages, apiTypes, apiRegions, apiCustomers, apiLocations;

let packages, assetSelectNext, page, assets, downloadPackageDetail, installDetail, numberPage, taskAssets, taskPackage, visitData;

let task = {};
let checkAssets;
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

const keysPackage = ["name", "summary", "date", "status"];

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

describe("Page-Deployment Reservation Edit", () => {
  context("Initial display", () => {
    it("The Status of the Download Package is Scheduled", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[2].response.body.packages;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;
        taskAssets = api[2].response.body.assets;
        // Task Name status check (activity)
        cy.get(`input[name="deploymentName"]`)
          .should(`not.have.disabled`)
          .should(`not.have.value`, "");
        // Package list display check (display)
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table`).should(`exist`);
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .its("length")
          .should("eq", 1);

        // check Name
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(1)")
          .find(">div")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", packages.name);
        // check Summary
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(2)")
          .find(">div")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", packages.summary);
        // check Date
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(3)")
          .find(">div")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", generatorDate(packages.date));
        // check Status
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(4)")
          .find(">div bridge-badge .icon-text")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", packages.status);
        // Package paging display check (display)
        cy.get(`bridge-pagination[data-test="package-selected-pagination"] .description`)
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", "1 to 1 of 1 items");
        cy.get(`bridge-pagination[data-test="package-selected-pagination"] nav.pagination button`)
          .its("length")
          .should("eq", 3);
        // Select package display check (display)
        cy.get(`bridge-button[data-test="package-modal"]`).should("exist");

        // Display check (display) of Target Asset list

        cy.get(`bridge-table[data-test="asset-selected-table"]`).should("exist");

        // Item check of Target Asset list (Status, Serial, Name, Model, Organization, Region, Location)
        cy.get(`bridge-table[data-test="asset-selected-table"] tbody tr`)
          .its("length")
          .should("eq", taskAssets.length);
        cy.get(`bridge-table[data-test="asset-selected-table"] tbody tr`).each(($el, i) => {
          keysAsset.forEach((value, index) => {
            switch (value) {
              case "status":
                cy.wrap($el)
                  .find(`td:eq(${index}) .badge`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", taskAssets[i][value]);
                break;
              default:
                cy.wrap($el)
                  .find(`td:eq(${index})`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", taskAssets[i][value]);
                break;
            }
          });
        });
        // Display check (display) of the number of items in the Target Asset list
        cy.get(`bridge-pagination[data-test="asset-selected-pagination"] .description`)
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", `1 to ${Math.min(taskAssets.length, 10)} of ${taskAssets.length} items`);
        // Display check (display) of paging of Target Asset list
        cy.get(`bridge-pagination[data-test="asset-selected-pagination"] nav.pagination button`)
          .its("length")
          .should("eq", Math.min(taskAssets.length, 7) + 2);
        // Display check (display) of Select assets
        cy.get(`bridge-button[data-test="asset-modal"]`).should("exist");

        // Download Package Settings status check

        cy.get(`.download-setting bridge-radio`)
          .invoke("attr", "ng-reflect-disabled")
          .should("eq", "false");

        // Check the Start at value of Download Package Settings
        cy.get(`.download-setting bridge-radio`)
          .first()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");
        cy.get(`.download-setting bridge-radio`)
          .last()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "true");
        // Check the Date value of Download Package Settings
        let check = Cypress.moment.utc(downloadPackageDetail.startAt, "YYYY-MM-DD HH:mm:ss");
        let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
        cy.get(".download-setting bridge-date-picker input")
          .invoke("val")
          .then((t) => {
            const check1 = Cypress.moment.utc(t);
            return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
          })
          .should("eq", date);
        cy.get(".download-setting bridge-time-picker input").should("have.value", (check.isValid() && check.format("hh:mm A")) || "");
        // Time zone value check
        cy.get(".download-setting")
          .find(".time-zone-group p")
          .should("be.visible", timeZone);

        // Check the Start at value of Install Settings
        cy.get(`.install-setting .install bridge-radio`)
          .first()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "true");

        cy.get(`.install-setting .install bridge-radio`)
          .last()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");

        cy.get(`.install-setting .install-setting-group bridge-radio`)
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");
        cy.get(`.install-setting .install-setting-group bridge-radio`)
          .first()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");
        cy.get(`.install-setting .install-setting-group bridge-radio`)
          .last()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "true");

        // Check the Date value of Install Settings
        check = Cypress.moment.utc(installDetail.startAt, "YYYY-MM-DD HH:mm:ss");
        date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
        cy.get(".install-setting .install-setting-group bridge-date-picker input")
          .invoke("val")
          .then((t) => {
            const check1 = Cypress.moment.utc(t);
            return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
          })
          .should("eq", date);
        cy.get(".install-setting .install-setting-group bridge-time-picker input").should(
          "have.value",
          (check.isValid() && check.format("hh:mm A")) || "",
        );
        // Time zone value check
        cy.get(".install-setting .install-setting-group")
          .find(".time-zone-group p")
          .should("be.visible", timeZone);
        cy.get("bridge-button[data-test='confirm-button']").should("have.attr", "ng-reflect-is-disabled", "false");
      });
    });

    it("The Status of the Download Package is not Scheduled", () => {
      visitData = visitDataUrl("deploymentsEditNotScheduled");

      visitData.then((api) => {
        packages = api[2].response.body.packages;
        assets = api[2].response.body.assets;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;

        // Task Name status check (inactive)
        cy.get(`input[name="deploymentName"]`)
          .should(`have.disabled`)
          .should(`not.have.value`, "");
        // Package list display check (inactive)
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table`).should(`exist`);
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .its("length")
          .should("eq", 1);

        // check Name
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(1)")
          .find(">div")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", packages.name);
        // check Summary
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(2)")
          .find(">div")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", packages.summary);
        // check Date
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(3)")
          .find(">div")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", generatorDate(packages.date));
        // check Status
        cy.get(`[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`)
          .first()
          .find(`[class="expanstion-panel-row"]`)
          .find(">div:eq(4)")
          .find(">div bridge-badge .icon-text")
          .first()
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", packages.status);
        // Package paging display check (display)
        cy.get(`bridge-pagination[data-test="package-selected-pagination"] .description`)
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", "1 to 1 of 1 items");
        cy.get(`bridge-pagination[data-test="package-selected-pagination"] nav.pagination button`)
          .its("length")
          .should("eq", 3);
        // Select package display check (display)
        cy.get(`bridge-button[data-test="package-modal"]`).should("not.exist");

        // Display check (display) of Target Asset list

        cy.get(`bridge-table[data-test="asset-selected-table"]`).should("exist");

        // Item check of Target Asset list (Status, Serial, Name, Model, Organization, Region, Location)
        cy.get(`bridge-table[data-test="asset-selected-table"] tbody tr`)
          .its("length")
          .should("eq", assets.length);
        cy.get(`bridge-table[data-test="asset-selected-table"] tbody tr`).each(($el, i) => {
          keysAsset.forEach((value, index) => {
            switch (value) {
              case "status":
                cy.wrap($el)
                  .find(`td:eq(${index}) .badge`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", assets[i][value]);
                break;
              default:
                cy.wrap($el)
                  .find(`td:eq(${index})`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", assets[i][value]);
                break;
            }
          });
        });
        // Display check (display) of the number of items in the Target Asset list
        cy.get(`bridge-pagination[data-test="asset-selected-pagination"] .description`)
          .invoke("text")
          .then((t) => t.trim())
          .should("eq", `1 to ${Math.min(assets.length, 10)} of ${assets.length} items`);
        // Display check (display) of paging of Target Asset list
        cy.get(`bridge-pagination[data-test="asset-selected-pagination"] nav.pagination button`)
          .its("length")
          .should("eq", Math.min(assets.length, 7) + 2);
        // Display check (display) of Select assets
        cy.get(`bridge-button[data-test="asset-modal"]`).should("not.exist");

        // Download Package Settings status check

        cy.get(`.download-setting bridge-radio`)
          .invoke("attr", "ng-reflect-disabled")
          .should("eq", "true");

        // Check the Start at value of Download Package Settings
        cy.get(`.download-setting bridge-radio`)
          .first()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");
        cy.get(`.download-setting bridge-radio`)
          .last()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "true");
        // Check the Date value of Download Package Settings
        let check = Cypress.moment.utc(downloadPackageDetail.startAt, "YYYY-MM-DD HH:mm:ss");
        let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
        cy.get(".download-setting bridge-date-picker input")
          .invoke("val")
          .then((t) => {
            const check1 = Cypress.moment.utc(t);
            return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
          })
          .should("eq", date);
        cy.get(".download-setting bridge-time-picker input").should("have.value", (check.isValid() && check.format("hh:mm A")) || "");
        // Time zone value check
        cy.get(".download-setting")
          .find(".time-zone-group p")
          .should("be.visible", timeZone);

        // Check the Start at value of Install Settings
        cy.get(`.install-setting .install bridge-radio`)
          .first()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "true");

        cy.get(`.install-setting .install bridge-radio`)
          .last()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");

        cy.get(`.install-setting .install-setting-group bridge-radio`)
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");
        cy.get(`.install-setting .install-setting-group bridge-radio`)
          .first()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "false");
        cy.get(`.install-setting .install-setting-group bridge-radio`)
          .last()
          .invoke("attr", "ng-reflect-checked")
          .should("eq", "true");

        // Check the Date value of Install Settings
        check = Cypress.moment.utc(installDetail.startAt, "YYYY-MM-DD HH:mm:ss");
        date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
        cy.get(".install-setting .install-setting-group bridge-date-picker input")
          .invoke("val")
          .then((t) => {
            const check1 = Cypress.moment.utc(t);
            return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
          })
          .should("eq", date);
        cy.get(".install-setting .install-setting-group bridge-time-picker input").should(
          "have.value",
          (check.isValid() && check.format("hh:mm A")) || "",
        );
        // Time zone value check
        cy.get(".install-setting .install-setting-group")
          .find(".time-zone-group p")
          .should("be.visible", timeZone);
        cy.get("bridge-button[data-test='confirm-button']").should("have.attr", "ng-reflect-is-disabled", "false");
      });
    });
  });

  context("Package operations", () => {
    it("Click the Select package button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      cy.get("bridge-button[data-test='package-modal'] button")
        .click()
        .wait(500)
        .then(() => {
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal").should("exist");
          cy.get(".cdk-overlay-container mat-dialog-container .mat-dialog-title").should("have.text", "Select Packages");
        });
    });

    it("Display after the package is selected", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[1].response.body;
        assets = api[2].response.body.assets;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;
      });
      let packageSelect;
      cy.get("form").then(($form) => {
        cy.wrap($form)
          .find("bridge-button[data-test='package-modal']")
          .click()
          .then(() => {
            cy.wait(500);
            if (packages.items.length > 0) {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-expansion-panel mat-radio-button:eq(1) label").click();
              packageSelect = packages.items[1];
            }
            cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)")
              .click()
              .then(() => {
                cy.wait(1000);
                // check Name
                cy.get(
                  `[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`,
                )
                  .first()
                  .find(`[class="expanstion-panel-row"]`)
                  .find(">div:eq(1)")
                  .find(">div")
                  .first()
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", packageSelect.name);
                // check Summary
                cy.get(
                  `[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`,
                )
                  .first()
                  .find(`[class="expanstion-panel-row"]`)
                  .find(">div:eq(2)")
                  .find(">div")
                  .first()
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", packageSelect.summary);
                // check Date
                cy.get(
                  `[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`,
                )
                  .first()
                  .find(`[class="expanstion-panel-row"]`)
                  .find(">div:eq(3)")
                  .find(">div")
                  .first()
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", generatorDate(packageSelect.date));
                // check Status
                cy.get(
                  `[data-test="package-select"] [data-test="package-selected-block"] bridge-expansion-table [data-test="expansion-row"]`,
                )
                  .first()
                  .find(`[class="expanstion-panel-row"]`)
                  .find(">div:eq(4)")
                  .find(">div bridge-badge .icon-text")
                  .first()
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", packageSelect.status);
                // Package paging display check (display)
                cy.get(`bridge-pagination[data-test="package-selected-pagination"] .description`)
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", "1 to 1 of 1 items");
                cy.get(`bridge-pagination[data-test="package-selected-pagination"] nav.pagination button`)
                  .its("length")
                  .should("eq", 3);
                // Select package display check (display)
              });
          });
      });
    });

    sortsEvent.forEach(({ key, name }, index) => {
      // Sort the ascending order
      it(`Click ${name} to set the ascending order`, () => {
        cy.wait(1000);
        cy.get(`div[data-test="package-select"] bridge-expansion-table .header .table-header-${key} button`)
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
        cy.get(`div[data-test="package-select"] bridge-expansion-table .header .table-header-${key} button`)
          .click({ force: true })
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
        cy.get(`div[data-test="package-select"] bridge-expansion-table .header .table-header-${key} button`)
          .click({ force: true })
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
        packages = api[1].response.body;
        task = api[2].response.body;
        const packageSelect = task.packages;
        cy.get("form").then(($form) => {
          cy.wait(1000);
          cy.get(`div[data-test="package-select"] bridge-expansion-table [data-test="expansion-row"]:eq(0)`).scrollIntoView();
          cy.get(`div[data-test="package-select"] bridge-expansion-table [data-test="expansion-row"]:eq(0) button.expanstion-panel-row`)
            .click()
            .then(($el) => {
              cy.wait(1000);
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
      cy.get(`div[data-test="package-select"] bridge-expansion-table [data-test="expansion-row"]:eq(0) button.expanstion-panel-row`)
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

  context("Target Asset operations", () => {
    it("Click the Select assets button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
      });
      cy.get("bridge-button[data-test='asset-modal'] button")
        .click()
        .wait(500)
        .then(() => {
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal").should("exist");
          cy.get(".cdk-overlay-container mat-dialog-container .mat-dialog-title").should("have.text", "Select Assets");
        });
    });

    it("Display after an asset is selected, more than 1 selection", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        task.assets = api[2].response.body.assets;
      });
      cy.get("bridge-button[data-test='asset-modal'] button")
        .click()
        .wait(500)
        .then(() => {
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal").should("exist");
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                .click()
                .then(() => {
                  task.assets.push({
                    ...assets.items[1],
                    customerId: assets.items[1].organization,
                    locationId: assets.items[1].location,
                    regionId: assets.items[1].region,
                  });
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .last()
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get("bridge-table[data-test='asset-selected-table'] tbody")
                        .find("tr")
                        .its("length")
                        .should("eq", Math.min(task.assets.length, 10));
                      //Display check (display) of the number of items in the Target Asset list

                      cy.get("bridge-table tbody tr").each(($el, i) => {
                        console.log(i);
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
                                .should("eq", task.assets[i][value]);
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
                        .should("equal", `1 to ${Math.min(10, task.assets.length)} of ${task.assets.length} items`);
                    });
                });
            });
        });
    });

    it("Displayed after an asset is selected, 0 selections", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      cy.get("bridge-button[data-test='asset-modal'] button")
        .click()
        .wait(500)
        .then(() => {
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal").should("exist");
          cy.wait(500);
          cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                .click()
                .then(() => {
                  // Check the display of the Asset list (hide)
                  cy.get(`.cdk-overlay-container mat-dialog-container tbody tr td mat-checkbox input[aria-checked="true"]`)
                    .should("not.exist")
                    .then(($el) => {
                      cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                        .last()
                        .click()
                        .then(() => {
                          cy.wait(500);
                          // Display check of the number of Assets (non-display)
                          cy.get("bridge-table[data-test='asset-selected-table']").should("not.exist");
                          // Asset paging display check (non-display)
                          cy.get(`bridge-pagination[data-test="asset-selected-pagination"]`).should("not.exist");
                        });
                    });
                });
            });
        });
    });

    it("Click the page 2 button", () => {
      visitDataUrl("deploymentsEditScheduled");
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
                                                keysAssetShow.forEach((value, index) => {
                                                  switch (value) {
                                                    case "status":
                                                      cy.get("bridge-table[data-test='asset-selected-table'] tbody tr:eq(0)")
                                                        .find(`td:eq(${index}) .badge`)
                                                        .invoke("text")
                                                        .then((text) => text.trim())
                                                        .should("equal", assetSelect[10][value]);
                                                      break;

                                                    default:
                                                      cy.get("bridge-table[data-test='asset-selected-table'] tbody tr:eq(0)")
                                                        .find(`td:eq(${index})`)
                                                        .invoke("text")
                                                        .then((text) => text.trim())
                                                        .should("eq", assetSelect[10][value]);
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

    it("Click the > button", () => {
      visitDataUrl("deploymentsEditScheduled");
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

                                                keysAssetShow.forEach((value, index) => {
                                                  switch (value) {
                                                    case "status":
                                                      cy.get("bridge-table[data-test='asset-selected-table'] tbody tr:eq(0)")
                                                        .find(`td:eq(${index}) .badge`)
                                                        .invoke("text")
                                                        .then((text) => text.trim())
                                                        .should("equal", assetSelect[10 * page][value]);
                                                      break;

                                                    default:
                                                      cy.get("bridge-table[data-test='asset-selected-table'] tbody tr:eq(0)")
                                                        .find(`td:eq(${index})`)
                                                        .invoke("text")
                                                        .then((text) => text.trim())
                                                        .should("eq", assetSelect[10 * page][value]);
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
          keysAssetShow.forEach((value, index) => {
            switch (value) {
              case "status":
                cy.get("bridge-table[data-test='asset-selected-table'] tbody tr:eq(0)")
                  .find(`td:eq(${index}) .badge`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", assetSelectNext[10 * page][value]);
                break;

              default:
                cy.get("bridge-table[data-test='asset-selected-table'] tbody tr:eq(0)")
                  .find(`td:eq(${index})`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", assetSelectNext[10 * page][value]);
                break;
            }
          });
        });
    });
  });

  context("Download Package Setting operations", () => {
    it("Select Start at Immediately", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[2].response.body.packages;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;
        taskAssets = api[2].response.body.assets;
      });
      cy.get(`.download-setting bridge-radio`)
        .first()
        .click()

        .then(() => {
          cy.get(".download-setting bridge-date-picker input").should("have.disabled", "disabled");
          cy.get(".download-setting bridge-time-picker input").should("have.disabled", "disabled");
          cy.get(".download-setting bridge-date-picker input").should("have.value", "");
          cy.get(".download-setting bridge-time-picker input").should("have.value", "");
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
        });
    });

    it("Select Start at Select Date/Time", () => {
      cy.get(`.download-setting bridge-radio`)
        .last()
        .click()
        .then(() => {
          cy.get(".download-setting bridge-date-picker input").should("not.have.disabled");
          cy.get(".download-setting bridge-time-picker input").should("not.have.disabled");
          let check = Cypress.moment.utc(downloadPackageDetail.startAt, "YYYY-MM-DD HH:mm:ss");
          let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
          cy.get(".download-setting bridge-date-picker input")
            .invoke("val")
            .then((t) => {
              const check1 = Cypress.moment.utc(t);
              return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
            })
            .should("eq", date);
          cy.get(".download-setting bridge-time-picker input").should("have.value", (check.isValid() && check.format("hh:mm A")) || "");
          cy.get(".download-setting")
            .first()
            .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
            .click()
            .then(() => {
              // Check  show datePicker dialog
              cy.get(".cdk-overlay-container mat-datepicker-content").should("exist");
              cy.get("body").click();
            });
          cy.get(".download-setting")
            .first()
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
      cy.get(`.download-setting bridge-radio`)
        .last()
        .click()
        .then(() => {
          cy.get(".download-setting bridge-date-picker input").should("not.have.disabled");
          cy.get(".download-setting bridge-time-picker input").should("not.have.disabled");
          let check = Cypress.moment.utc(downloadPackageDetail.startAt, "YYYY-MM-DD HH:mm:ss");
          let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
          cy.get(".download-setting bridge-date-picker input")
            .invoke("val")
            .then((t) => {
              const check1 = Cypress.moment.utc(t);
              return (check1.isValid() && check1.local().format("MM/D/YYYY")) || "";
            })
            .should("eq", date);
          cy.get(".download-setting bridge-time-picker input").should("have.value", (check.isValid() && check.format("hh:mm A")) || "");
          cy.get(".download-setting")
            .first()
            .find("bridge-date-picker[data-test='start-date-dl-picker'] bridge-button button")
            .click()
            .then(() => {
              // Check  show datePicker dialog
              cy.get(".cdk-overlay-container mat-datepicker-content").should("exist");
              cy.get("body").click();
            });
          cy.get(".download-setting")
            .first()
            .find("bridge-time-picker[data-test='start-date-dl-picker'] bridge-button button")
            .click()
            .then(() => {
              // Check not show datePicker dialog
              cy.get(".cdk-overlay-container bridge-time-picker-content").should("exist");
              cy.get("body").click();
            });
        });
    });
  });

  context("Install Setting operations", () => {
    it("Select Install Yes", () => {
      visitData = visitDataUrl("deploymentsEditNotInstall");
      visitData.then((api) => {
        packages = api[2].response.body.packages;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;
        taskAssets = api[2].response.body.assets;
      });
      cy.get(".install-setting .install bridge-radio")
        .first()
        .click()
        .then(() => {
          cy.get(".install-setting .install-setting-group .startDate bridge-radio input").should("not.have.disabled");
          cy.get(".install-setting .install-setting-group bridge-date-picker input").should("have.disabled", "disabled");
          cy.get(".install-setting .install-setting-group bridge-time-picker input").should("have.disabled", "disabled");
          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-date-picker bridge-button button")
            .click()
            .then(() => {
              // Check  show datePicker dialog
              cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
            });
          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-time-picker bridge-button button")
            .click()
            .then(() => {
              // Check not show datePicker dialog
              cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
            });
        });
    });

    it("Select Install No", () => {
      cy.get(".install-setting .install bridge-radio")
        .last()
        .click()
        .then(() => {
          cy.get(".install-setting .install-setting-group bridge-date-picker input").should("have.disabled", "disabled");
          cy.get(".install-setting .install-setting-group bridge-time-picker input").should("have.disabled", "disabled");
          cy.get(".install-setting .install-setting-group .startDate bridge-radio input").should("have.disabled", "disabled");
          cy.get(".install-setting .install-setting-group .startDate bridge-radio")
            .first()
            .should("have.attr", "ng-reflect-checked", "true");
          cy.get(".install-setting .install-setting-group .startDate bridge-radio")
            .last()
            .should("have.attr", "ng-reflect-checked", "false");
          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-date-picker bridge-button button")
            .click()
            .then(() => {
              // Check  show datePicker dialog
              cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
              cy.get("body").click();
            });
          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-time-picker bridge-button button")
            .click()
            .then(() => {
              // Check not show datePicker dialog
              cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
              cy.get("body").click();
            });
        });
    });

    it("Select Start at Immediately", () => {
      visitData = visitDataUrl("deploymentsEditNotInstall");
      visitData.then((api) => {
        packages = api[2].response.body.packages;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;
        taskAssets = api[2].response.body.assets;
      });
      cy.get(".install-setting .install bridge-radio")
        .first()
        .click()
        .then(() => {
          cy.get(".install-setting .install-setting-group .startDate bridge-radio input").should("not.have.disabled");
          cy.get(".install-setting .install-setting-group .startDate bridge-radio")
            .first()
            .click()
            .then(() => {
              cy.get(".install-setting .install-setting-group bridge-date-picker input").should("have.disabled", "disabled");
              cy.get(".install-setting .install-setting-group bridge-time-picker input").should("have.disabled", "disabled");
            });

          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-date-picker bridge-button button")
            .click()
            .then(() => {
              // Check  show datePicker dialog
              cy.get(".cdk-overlay-container mat-datepicker-content").should("not.exist");
              cy.get("body").click();
            });
          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-time-picker bridge-button button")
            .click()
            .then(() => {
              // Check not show datePicker dialog
              cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
            });
        });
    });

    it("Select Start at Select Date/Time", () => {
      cy.get(".install-setting .install bridge-radio")
        .first()
        .click()
        .then(() => {
          cy.get(".install-setting .install-setting-group .startDate bridge-radio input").should("not.have.disabled");
          cy.get(".install-setting .install-setting-group .startDate bridge-radio")
            .last()
            .click()
            .then(() => {
              cy.get(".install-setting .install-setting-group bridge-date-picker input").should("not.have.disabled");
              cy.get(".install-setting .install-setting-group bridge-time-picker input").should("have.disabled", "disabled");
            });

          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-date-picker bridge-button button")
            .click()
            .then(() => {
              // Check  show datePicker dialog
              cy.get(".cdk-overlay-container mat-datepicker-content").should("exist");
              cy.get("body").click();
            });
          cy.get(".install-setting .install-setting-group")
            .first()
            .find("bridge-time-picker bridge-button button")
            .click()
            .then(() => {
              // Check not show datePicker dialog
              cy.get(".cdk-overlay-container bridge-time-picker-content").should("not.exist");
            });
        });
    });

    it("Enter the date", () => {
      cy.get(".install-setting .install-setting-group")
        .first()
        .find("bridge-date-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container mat-datepicker-content")
            .should("exist")
            .then(() => {
              cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                .click()
                .then(() => {
                  cy.get(".install-setting .install-setting-group bridge-time-picker input").should("not.have.disabled");
                  cy.get(".install-setting .install-setting-group bridge-time-picker bridge-button button")
                    .click()
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content").should("exist");
                    });
                });
            });
          cy.get("body").click();
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

  context("Confirm operations", () => {
    it("Task Name not entered", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      cy.get(`input[name="deploymentName"]`)
        .clear()
        .blur()
        .then(() => {
          cy.get(`bridge-button[data-test="confirm-button"] button`).should("have.disabled", "disabled");
        });
    });

    it("Target Asset not selected", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      cy.get("bridge-button[data-test='asset-modal'] button")
        .click()
        .wait(500)
        .then(() => {
          cy.get(".cdk-overlay-container mat-dialog-container bridge-modal").should("exist");
          cy.get(".cdk-overlay-container mat-dialog-container .mat-dialog-title").should("have.text", "Select Assets");
          cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
            .click()
            .then(() => {
              cy.get(
                `.cdk-overlay-container mat-dialog-container bridge-modal bridge-table tbody tr td mat-checkbox[ng-reflect-checked="true"]`,
              ).then(($el) => {
                if ($el.length > 0) {
                  cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
                    .click()
                    .then(() => {
                      cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                    });
                } else {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                }
                cy.wait(500);
                cy.get(`bridge-button[data-test="confirm-button"] button`).should("have.disabled", "disabled");
              });
            });
        });
    });

    it("When Select Date/Time is selected for Start at in the Download Package Setting, Date is not entered", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .blur();
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("have.disabled");
    });

    it("When Select Date/Time is selected for Start at in Install Setting, Date is not entered", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .focus()
        .clear()
        .blur();
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("have.disabled");
    });

    it("Enter Task Name, select Package, select Target Asset, Start at Immediately in Download Package Setting, Start at Immediately in Install Setting", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
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
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
        cy.get(`.download-setting bridge-radio`)
          .first()
          .click();
        cy.get(".install-setting .install-setting-group bridge-radio")
          .first()
          .click();
        cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
      });
    });

    it("Enter Task Name, select Package, select Target Asset, select Select Date/Time for Start at Download Package Setting and enter Date, select Immediately for Start at Install Setting", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
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
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
        cy.get(`.download-setting bridge-radio`)
          .last()
          .click()
          .then(() => {
            cy.get(".download-setting bridge-date-picker bridge-button button")
              .click()
              .then(() => {
                cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                  .click()
                  .then(() => {
                    cy.get(".download-setting bridge-time-picker bridge-button button")
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                          .scrollTo("bottom")
                          .then(() => {
                            cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                              cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 2})`).click();
                            });
                          });
                      });
                  });
              });
          });
        cy.get(".install-setting .install-setting-group bridge-radio")
          .first()
          .click();
        cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
      });
    });

    it("Enter Task Name, select Package, select Target Asset, Start at Download Package Setting is Immediately, Start at Install Setting is Select Date/Time, and enter Date", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
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
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
      });
      cy.get(`.download-setting bridge-radio`)
        .first()
        .click();
      cy.get(".install-setting .install bridge-radio")
        .first()
        .click();
      cy.get(".install-setting .install-setting-group bridge-radio")
        .last()
        .click();
      cy.get(".install-setting .install-setting-group bridge-date-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".install-setting .install-setting-group bridge-time-picker bridge-button button")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 1})`).click();
                      });
                    });
                });
            });
        });
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
    });

    it("Enter Task Name, select Package, select Target Asset, Download Package Setting Start at Select Date/Time and enter the date, Install Setting Start at Select Date/Time and enter the date", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
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
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
      });
      cy.get(`.download-setting bridge-radio`)
        .last()
        .click();
      cy.get(".install-setting .install bridge-radio")
        .first()
        .click();

      cy.get(".download-setting bridge-date-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".download-setting bridge-time-picker bridge-button button")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 2})`).click();
                      });
                    });
                });
            });
        });
      cy.get(".install-setting .install-setting-group bridge-radio")
        .last()
        .click();
      cy.get(".install-setting .install-setting-group bridge-date-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".install-setting .install-setting-group bridge-time-picker bridge-button button")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                    .scrollTo("bottom")
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 1})`).click();
                      });
                    });
                });
            });
        });
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
    });

    it("Check the consistency between Package and Asset when click the Confirm button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        taskPackage = api[2].response.body.packages;
        packages = api[1].response.body;
        assets = api[0].response.body;
        downloadPackageDetail = api[2].response.body.downloadPackageDetail;
        installDetail = api[2].response.body.installDetail;
        taskAssets = api[2].response.body.assets;
      });
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            if (packages.items.length > 0) {
              cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(1)")
                .click()
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                });
            }
          });
        cy.wrap($form)
          .find("bridge-button[data-test='asset-modal']")
          .click()
          .then(() => {
            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
              .click()
              .then(() => {
                cy.get(`.cdk-overlay-container mat-dialog-container bridge-modal bridge-table thead tr th mat-checkbox label`)
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
      });
      cy.get(`.download-setting bridge-radio`)
        .first()
        .click();
      cy.get(`.install-setting .install bridge-radio`)
        .last()
        .click();
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
      cy.get(`bridge-button[data-test="confirm-button"] button`)
        .click()
        .then(() => {
          const { packageId } = packages.items[0];
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
      visitData = visitDataUrl("deploymentsEditScheduled");
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
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
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
      });
      cy.get(`.download-setting bridge-radio`)
        .last()
        .click();
      cy.get(".install-setting .install bridge-radio")
        .last()
        .click();

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 1);
      let check = Cypress.moment.utc(currentDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();

      cy.get(".download-setting bridge-time-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("top")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option")
                .first()
                .click();
            });
        });
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
      cy.get(`bridge-button[data-test="confirm-button"] button`)
        .click()
        .then(() => {
          cy.get("ul.list-error-valid li:eq(0)")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", "Start at Download must be equal or greater to the current date");
        });
    });

    it("Check the date and time in the Install Setting when click the Confirm button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
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
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
      });
      cy.get(`.download-setting bridge-radio`)
        .first()
        .click();
      cy.get(".install-setting .install bridge-radio")
        .first()
        .click();

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 5);
      let check = Cypress.moment.utc(currentDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      cy.get(".install-setting .install-setting-group bridge-radio")
        .last()
        .click();
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();
      cy.get(".install-setting .install-setting-group bridge-time-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 1})`).click();
              });
            });
        });
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
      cy.get(`bridge-button[data-test="confirm-button"] button`)
        .click()
        .then(() => {
          cy.get("ul.list-error-valid li:eq(0)")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", "Start at Install must be equal or greater to the current date");
        });
    });

    it("Check the date and time in the Download Package Setting and Install Setting when click the Confirm button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      const taskName = "New Deployment - " + new Date().getTime();
      cy.wait(500);
      cy.get("form").then(($form) => {
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
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
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
                cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                  });
              });
          });
      });
      cy.get(`.download-setting bridge-radio`)
        .last()
        .click();
      cy.get(".install-setting .install bridge-radio")
        .first()
        .click();

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 5);
      let check = Cypress.moment.utc(currentDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      let date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      cy.get(".download-setting bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();

      cy.get(".download-setting bridge-time-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 2})`).click();
              });
            });
        });

      cy.get(".install-setting .install-setting-group bridge-radio")
        .last()
        .click();
      currentDate.setDate(currentDate.getDate() - 8);
      check = Cypress.moment.utc(currentDate.toISOString(), "YYYY-MM-DD HH:mm:ss");
      date = (check.isValid() && check.local().format("MM/D/YYYY")) || "";
      cy.get(".install-setting .install-setting-group bridge-date-picker input")
        .clear()
        .focus()
        .type(date)
        .blur();

      cy.get(".install-setting .install-setting-group bridge-time-picker bridge-button button")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
            .scrollTo("bottom")
            .then(() => {
              cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 1})`).click();
              });
            });
        });
      cy.get(`bridge-button[data-test="confirm-button"] button`).should("not.have.disabled");
      cy.get(`bridge-button[data-test="confirm-button"] button`)
        .click()
        .then(() => {
          cy.get("ul.list-error-valid li:eq(0)")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", "Start at Install must be equal or greater to the current date");
          cy.get("ul.list-error-valid li:eq(1)")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", "Start at Install must be greater than Start at Download");
        });
    });
  });
});

describe("Page-Deployment Reservation Edit,Select Packages", () => {
  context("Initial display", () => {
    it("Display with arguments", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[1].response.body;
        taskPackage = api[2].response.body.packages;
        page = 0;
        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click()
            .then(() => {
              cy.wait(500);
              //  Keyword value check (blank)
              cy.get(".cdk-overlay-container bridge-search-box bridge-form input").should("have.value", "");
              packages.items.forEach((value, index) => {
                cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(${index})`).then(($tr) => {
                  cy.wrap($tr)
                    .find(".expantion-radio mat-radio-button")
                    .should("have.attr", "ng-reflect-checked", (value.packageId === taskPackage.packageId).toString());
                  cy.wrap($tr)
                    .find(" .header > button > div:eq(1) > div")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.name);
                  cy.wrap($tr)
                    .find(" .header > button > div:eq(2) > div")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.summary);
                  cy.wrap($tr)
                    .find(" .header > button > div:eq(3) > div")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", generatorDate(value.date));
                  cy.wrap($tr)
                    .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.status);
                  cy.wrap($tr)

                    .find(".ng-trigger-bodyExpansion")
                    .should("not.visible");
                });
              });
              cy.get(`.cdk-overlay-container bridge-expansion-table bridge-expansion-panel`)
                .its("length")
                .should("eq", Math.min(10), packages.items.length);
              cy.get(`.cdk-overlay-container bridge-pagination .description`)
                .invoke("text")
                .then((t) => t.trim())
                .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`);
            });
        });
      });
    });
  });

  context("Search operations", () => {
    it("Enter keywords and click the Search button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[1].response.body;
        taskPackage = api[2].response.body.packages;
        page = 0;
        cy.wait(1000);
        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click()
            .then(() => {
              cy.wait(500);
              //  Keyword value check (blank)
              cy.get(".cdk-overlay-container bridge-search-box bridge-form input")
                .focus()
                .clear()
                .type("a")
                .blur();
              cy.get(".cdk-overlay-container bridge-search-box  bridge-button button")
                .click()
                .then(() => {
                  cy.request("GET", apiPackages + "?limit=10&offset=0&status=Complete&sort=desc&text=a").then(({ body }) => {
                    packages = body;
                    if (packages.totalCount > 0) {
                      cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                        .find(".expantion-radio mat-radio-button")
                        .should("have.attr", "ng-reflect-checked", (packages.items[0].packageId === taskPackage.packageId).toString());
                      cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                        .find(" .header > button > div:eq(1) > div")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", packages.items[0].name);
                      cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                        .find(" .header > button > div:eq(2) > div")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", packages.items[0].summary);
                      cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                        .find(" .header > button > div:eq(3) > div")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", generatorDate(packages.items[0].date));
                      cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                        .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", packages.items[0].status);
                      cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                        .find(".ng-trigger-bodyExpansion")
                        .should("not.visible");

                      cy.get(`.cdk-overlay-container bridge-expansion-table bridge-expansion-panel`)
                        .its("length")
                        .should("eq", Math.min(10), packages.items.length);
                      cy.get(`.cdk-overlay-container bridge-pagination .description`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should(
                          "equal",
                          `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`,
                        );
                    }
                  });
                });
            });
        });
      });
    });
  });
  context("Sorting operations", () => {
    before(() => {
      visitData = visitDataUrl("deploymentsEditScheduled").then((api) => {
        packages = api[1].response.body;
        taskPackage = api[2].response.body.packages;
        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click();
        });
        cy.wait(500);
      });
    });
    sortsEvent.forEach(({ key, name }, index) => {
      // Sort the ascending order
      it(`Click ${name} to set the ascending order`, () => {
        cy.wait(1000);
        cy.get(`.cdk-overlay-container .table-header-${key} button`)
          .click({ force: true })
          .then(($el) => {
            // check img sort
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete&sortName=${key}&sort=asc`).then(({ body }) => {
              cy.wait(500);
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", upImg);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(".expantion-radio mat-radio-button")
                .should("have.attr", "ng-reflect-checked", (body.items[0].packageId === taskPackage.packageId).toString());
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(1) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].name);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(2) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].summary);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(3) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", generatorDate(body.items[0].date));
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].status);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(".ng-trigger-bodyExpansion")
                .should("not.visible");
            });
          });
      });
      // Sort the descending order

      it(`Click ${name} to set the descending order`, () => {
        cy.wait(1000);
        cy.get(`.cdk-overlay-container .table-header-${key} button`)
          .click({ force: true })
          .then(($el) => {
            // check img sort
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete&sortName=${key}&sort=desc`).then(({ body }) => {
              cy.wait(500);
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", downImg);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(".expantion-radio mat-radio-button")
                .should("have.attr", "ng-reflect-checked", (body.items[0].packageId === taskPackage.packageId).toString());
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(1) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].name);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(2) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].summary);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(3) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", generatorDate(body.items[0].date));
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].status);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(".ng-trigger-bodyExpansion")
                .should("not.visible");
            });
          });
      });
      // Sort the default order
      it(`Click ${name} to set the default order`, () => {
        cy.wait(1000);
        cy.get(`.cdk-overlay-container .table-header-${key} button`)
          .click({ force: true })
          .then(($el) => {
            // check img sort
            cy.wait(1000);
            cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
              cy.wait(500);
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", defaultImg);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(".expantion-radio mat-radio-button")
                .should("have.attr", "ng-reflect-checked", (body.items[0].packageId === taskPackage.packageId).toString());
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(1) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].name);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(2) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].summary);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(3) > div")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", generatorDate(body.items[0].date));
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", body.items[0].status);
              cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(0)`)
                .find(".ng-trigger-bodyExpansion")
                .should("not.visible");
              // });
            });
          });
        if (index === sortsEvent.length - 1) {
          cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
        }
      });
    });

    it("Click the Down Arrow expansion button on an accordion", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        const packageSelect = api[1].response.body.items[0];
        cy.wait(1000);
        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click()
            .then(() => {
              cy.wait(1000);
              cy.get(`.cdk-overlay-container mat-dialog-container [data-test="expansion-row"]:eq(0)`).scrollIntoView();
              cy.get(`.cdk-overlay-container mat-dialog-container [data-test="expansion-row"]:eq(0) button.expanstion-panel-row`)
                .click()
                .then(($el) => {
                  cy.wait(1000);
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
    });
    it("Click the Up Arrow expansion button on an accordion", () => {
      cy.get(`.cdk-overlay-container mat-dialog-container [data-test="expansion-row"]:eq(0) button.expanstion-panel-row`)
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

  context("Paging operations", () => {
    it("Click the page 2 button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[1].response.body;
        taskPackage = api[2].response.body.packages;
        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal bridge-pagination nav button:eq(2)")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.request(`${apiPackages}?limit=10&offset=10&status=Complete&sort=desc`).then(({ body }) => {
                    cy.wait(500);
                    packages = body;
                    const page = 1;
                    packages.items.forEach((value, index) => {
                      cy.get(`.cdk-overlay-container bridge-expansion-table  bridge-expansion-panel:eq(${index})`).then(($tr) => {
                        cy.wrap($tr)
                          .find(".expantion-radio mat-radio-button")
                          .should("have.attr", "ng-reflect-checked", (value.packageId === taskPackage.packageId).toString());
                        cy.wrap($tr)
                          .find(" .header > button > div:eq(1) > div")
                          .invoke("text")
                          .then((t) => t.trim())
                          .should("eq", value.name);
                        cy.wrap($tr)
                          .find(" .header > button > div:eq(2) > div")
                          .invoke("text")
                          .then((t) => t.trim())
                          .should("eq", value.summary);
                        cy.wrap($tr)
                          .find(" .header > button > div:eq(3) > div")
                          .invoke("text")
                          .then((t) => t.trim())
                          .should("eq", generatorDate(value.date));
                        cy.wrap($tr)
                          .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                          .invoke("text")
                          .then((t) => t.trim())
                          .should("eq", value.status);
                        cy.wrap($tr)

                          .find(".ng-trigger-bodyExpansion")
                          .should("not.visible");
                      });
                    });
                    cy.get(`.cdk-overlay-container bridge-expansion-table bridge-expansion-panel`)
                      .its("length")
                      .should("eq", Math.min(10), packages.items.length);
                    numberPage = Math.ceil(packages.totalCount / 10) + 2;
                    cy.get(".cdk-overlay-container bridge-pagination")
                      .find("nav button")
                      .its("length")
                      .should("be.eq", Math.min(numberPage, 7));
                    cy.get(`.cdk-overlay-container bridge-pagination .description`)
                      .invoke("text")
                      .then((t) => t.trim())
                      .should(
                        "equal",
                        `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`,
                      );
                  });
                });
            });
        });
      });
    });

    it("Click the > button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[1].response.body;
        taskPackage = api[2].response.body.packages;
        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container bridge-pagination")
                .find(".pagination button")
                .then((listing) => {
                  listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
                  if (listingCount > 1) {
                    cy.get(".cdk-overlay-container bridge-pagination .pagination button.right-arrow")
                      .click()
                      .then(() => {
                        cy.wait(500);
                        page =
                          parseInt(
                            Cypress.$(".cdk-overlay-container bridge-pagination")
                              .find(".pagination button.selected")
                              .text(),
                          ) - 1;
                        cy.request(`${apiPackages}?limit=10&offset=${page * 10}&status=Complete&sort=desc`).then(({ body }) => {
                          cy.wait(500);
                          packages = body;
                          packages.items.forEach((value, index) => {
                            cy.get(`.cdk-overlay-container bridge-expansion-table bridge-expansion-panel:eq(${index})`).then(($tr) => {
                              cy.wrap($tr)
                                .find(".expantion-radio mat-radio-button")
                                .should("have.attr", "ng-reflect-checked", (value.packageId === taskPackage.packageId).toString());
                              cy.wrap($tr)
                                .find(" .header > button > div:eq(1) > div")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.name);
                              cy.wrap($tr)
                                .find(" .header > button > div:eq(2) > div")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.summary);
                              cy.wrap($tr)
                                .find(" .header > button > div:eq(3) > div")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", generatorDate(value.date));
                              cy.wrap($tr)
                                .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.status);
                              cy.wrap($tr)
                                .find(".ng-trigger-bodyExpansion")
                                .should("not.visible");
                            });
                          });
                          cy.get(`.cdk-overlay-container bridge-expansion-table bridge-expansion-panel`)
                            .its("length")
                            .should("eq", Math.min(10), packages.items.length);
                          numberPage = Math.ceil(packages.totalCount / 10) + 2;
                          cy.get(".cdk-overlay-container bridge-pagination")
                            .find("nav button")
                            .its("length")
                            .should("be.eq", Math.min(numberPage, 7));
                          cy.get(`.cdk-overlay-container bridge-pagination .description`)
                            .invoke("text")
                            .then((t) => t.trim())
                            .should(
                              "equal",
                              `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`,
                            );
                        });
                      });
                  }
                });
            });
        });
      });
    });

    it("Click the < button", () => {
      cy.get("form").then(($form) => {
        cy.wrap($form).then(() => {
          cy.get(".cdk-overlay-container bridge-pagination")
            .find(".pagination button")
            .then((listing) => {
              listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
              if (listingCount > 1) {
                cy.get(".cdk-overlay-container bridge-pagination .pagination button.left-arrow")
                  .click()
                  .then(() => {
                    cy.wait(500);
                    page =
                      parseInt(
                        Cypress.$(".cdk-overlay-container bridge-pagination")
                          .find(".pagination button.selected")
                          .text(),
                      ) - 1;
                    cy.request(`${apiPackages}?limit=10&offset=${page * 10}&status=Complete&sort=desc`).then(({ body }) => {
                      cy.wait(500);
                      packages = body;
                      packages.items.forEach((value, index) => {
                        cy.get(`.cdk-overlay-container bridge-expansion-table bridge-expansion-panel:eq(${index})`).then(($tr) => {
                          cy.wrap($tr)
                            .find(".expantion-radio mat-radio-button")
                            .should("have.attr", "ng-reflect-checked", (value.packageId === taskPackage.packageId).toString());
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(1) > div")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.name);
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(2) > div")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.summary);
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(3) > div")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", generatorDate(value.date));
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.status);
                          cy.wrap($tr)

                            .find(".ng-trigger-bodyExpansion")
                            .should("not.visible");
                        });
                      });
                      cy.get(`.cdk-overlay-container bridge-expansion-table bridge-expansion-panel`)
                        .its("length")
                        .should("eq", Math.min(10), packages.items.length);
                      numberPage = Math.ceil(packages.totalCount / 10) + 2;
                      cy.get(".cdk-overlay-container bridge-pagination")
                        .find("nav button")
                        .its("length")
                        .should("be.eq", Math.min(numberPage, 7));
                      cy.get(`.cdk-overlay-container bridge-pagination .description`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should(
                          "equal",
                          `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`,
                        );
                    });
                  });
              }
            });
        });
      });
    });
  });

  context("Cancel operations", () => {
    it("Click the Cancel button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[1].response.body;
        taskPackage = api[2].response.body.packages;

        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click()
            .then(() => {
              if (packages.items.length > 2) {
                cy.get(".cdk-overlay-container mat-dialog-container bridge-expansion-panel mat-radio-button:eq(1)")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(0) button")
                      .click()
                      .then(() => {
                        expect(taskPackage.packageId).to.be.not.eq(packages.items[2].packageId);
                      });
                  });
              }
            });
        });
      });
    });
  });

  context("OK operations", () => {
    it("Click the OK button", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        packages = api[1].response.body;
        taskPackage = api[2].response.body.packages;

        cy.get("form").then(($form) => {
          cy.wrap($form)
            .find("bridge-button[data-test='package-modal']")
            .click()
            .then(() => {
              if (packages.items.length > 2) {
                cy.get(".cdk-overlay-container mat-dialog-container bridge-expansion-panel mat-radio-button:eq(1)")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1) button")
                      .click()
                      .then(() => {
                        cy.wait(500);
                        taskPackage = packages.items[1];
                        cy.get(`div[data-test="package-select"] bridge-expansion-table bridge-expansion-panel:eq(0)`).then(($tr) => {
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(1) > div")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", taskPackage.name);
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(2) > div")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", taskPackage.summary);
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(3) > div")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", generatorDate(taskPackage.date));
                          cy.wrap($tr)
                            .find(" .header > button > div:eq(4) > div bridge-badge .icon-text")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", taskPackage.status);
                          cy.wrap($tr)
                            .find(".ng-trigger-bodyExpansion")
                            .should("not.visible");
                        });
                      });
                  });
              }
            });
        });
      });
    });
  });
});

describe("Page-Deployment Reservation Edit,Select Assets", () => {
  let eventTypes, regions;
  const assetStatus = ["Good", "Error", "Missing"];
  context("Initial display", () => {
    it("Display with no arguments", () => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        taskAssets = api[2].response.body.assets;

        cy.get("bridge-button[data-test='asset-modal'].basic button")
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

            cy.wait(500);
            cy.get(".cdk-overlay-container bridge-table tbody")
              .find("tr")
              .its("length")
              .should("be.eq", Math.min(assets.items.length, 10));

            // check data map with table asset list
            cy.get(".cdk-overlay-container bridge-table tbody tr").each(($el, i) => {
              keysAssetShow.forEach((value, index) => {
                switch (value) {
                  case "status":
                    cy.wrap($el)
                      .find(`td:eq(${index + 1}) .badge`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", assets.items[i][value]);
                    break;

                  default:
                    cy.wrap($el)
                      .find(`td:eq(${index + 1})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", assets.items[i][value]);
                    break;
                }
              });
            });
            numberPage = Math.ceil(assets.totalCount / 10) - 1;
            page = 0;
            cy.get(".cdk-overlay-container bridge-pagination")
              .find("nav button")
              .its("length")
              .should("be.eq", numberPage);
            cy.get(".cdk-overlay-container bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, assets.totalCount)} of ${assets.totalCount} items`);

            // on paging init load
            cy.get(".cdk-overlay-container bridge-pagination")
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
                            cy.get(".cdk-overlay-container bridge-table tbody")
                              .find("tr")
                              .its("length")
                              .should("be.eq", Math.min(res.body.items.length, 10));
                            cy.get(".cdk-overlay-container bridge-pagination")
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
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        taskAssets = api[2].response.body.assets;
        eventTypes = api[3].response.body;
        regions = api[4].response.body;
        customers = api[5].response.body;
        checkAssets = taskAssets.map((item) => item.typeId + "_" + item.assetId);
        cy.get("bridge-button[data-test='asset-modal'].basic button")
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

            const check = checkAssets.includes(assets.items[0].typeId + "_" + assets.items[0].assetId);
            cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
              .find(`.tableCell-checked mat-checkbox`)
              .invoke("attr", "ng-reflect-checked")
              .should("eq", check.toString());
            keysAssetShow.forEach((value, index) => {
              switch (value) {
                case "status":
                  cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                    .find(`td:eq(${index + 1}) .badge`)
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("equal", assets.items[0][value]);
                  break;
                default:
                  cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                    .find(`td:eq(${index + 1})`)
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("equal", assets.items[0][value]);
                  break;
              }
            });

            cy.wait(1000);
            cy.get("bridge-side-board")
              .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
              .type("a")
              .then(() => {
                cy.get(`bridge-checkbox-list[data-test="status-checkbox"]`)
                  .find("mat-checkbox:eq(0)")
                  .click();
                if (eventTypes.length > 0) {
                  cy.get("bridge-side-board")
                    .find("bridge-select-multi[data-test='model-select'] mat-select")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(1)`)
                        .click()
                        .then(() => {
                          cy.wait(500);
                          cy.get(".cdk-overlay-container bridge-table")
                            .first()
                            .click({
                              force: true,
                            })
                            .then(() => {
                              cy.wait(500);
                              cy.get("bridge-side-board")
                                .find('bridge-button[data-test="ok"]')
                                .click({
                                  force: true,
                                });
                              cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                                .first()
                                .click({
                                  force: true,
                                })
                                .then(() => {
                                  cy.wait(500);
                                  cy.get("bridge-button[data-test='asset-modal'].basic button")
                                    .click()
                                    .then(() => {
                                      cy.wait(1000);
                                      // check Keyword
                                      cy.get("bridge-side-board")
                                        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
                                        .should("have.value", "a");

                                      // check asset status
                                      cy.get("bridge-side-board")
                                        .find("bridge-checkbox-list[data-test='status-checkbox'] mat-checkbox:eq(0)")
                                        .should("have.attr", "ng-reflect-checked", "true");

                                      // check model select
                                      cy.get("bridge-side-board")
                                        .find("bridge-select-multi[data-test='model-select']")
                                        .should("have.attr", "ng-reflect-selected-item", eventTypes[0].typeId);

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
                                      cy.request(
                                        `${apiAssets}?typeId=CI10&status=Good&text=a&sort=desc&isFilter=true&limit=10&offset=0`,
                                      ).then(({ body }) => {
                                        const check = checkAssets.includes(body.items[0].typeId + "_" + body.items[0].assetId);
                                        cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                                          .find(`.tableCell-checked mat-checkbox`)
                                          .invoke("attr", "ng-reflect-checked")
                                          .should("eq", check.toString());
                                        keysAssetShow.forEach((value, index) => {
                                          switch (value) {
                                            case "status":
                                              cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                                                .find(`td:eq(${index + 1}) .badge`)
                                                .invoke("text")
                                                .then((text) => text.trim())
                                                .should("equal", body.items[0][value]);
                                              break;
                                            default:
                                              cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                                                .find(`td:eq(${index + 1})`)
                                                .invoke("text")
                                                .then((text) => text.trim())
                                                .should("equal", body.items[0][value]);
                                              break;
                                          }
                                        });
                                      });
                                    });
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

  context("Search filter operations", () => {
    before(() => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        taskAssets = api[2].response.body.assets;
        eventTypes = api[3].response.body;
        regions = api[4].response.body;
        customers = api[5].response.body;
        assets = api[0].response.body;
      });
      cy.get("bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
    });
    afterEach(() => {
      cy.get(".cdk-overlay-container bridge-modal .mat-dialog-title").click({
        force: true,
      });
      cy.wait(500);
    });
    it("Checking items in each list", () => {
      // Status list check
      cy.get(`bridge-checkbox-list > div`)
        .children()
        .each(($el, i) => {
          expect($el).to.contain(assetStatus[i]);
        });
      // check show multi select Model

      cy.get("bridge-side-board")
        .find("bridge-select-multi[data-test='model-select'] mat-select")
        .click()
        .then(() => {
          cy.wait(500);
          // check length show panel chose Model
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
            cy.wrap($el).should("have.length", eventTypes.length + 1);
            // check show string
            cy.wrap($el)
              .each(($otp, index) => {
                if (index === 0) {
                  expect($otp.text().trim()).to.be.eq("ALL");
                } else {
                  expect($otp.text().trim()).to.be.eq(eventTypes[index - 1].typeId);
                }
              })
              .then(() => cy.get("body").click());
          });
        });

      // check show multi select Region

      cy.get("bridge-side-board")
        .find("bridge-select[data-test='region-select'] mat-select")
        .click()
        .then(() => {
          // check length show panel chose Region
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
            cy.wrap($el).should("have.length", regions.length + 1);
            // check show string
            cy.wrap($el)
              .each(($otp, index) => {
                if (index === 0) {
                  expect($otp.text().trim()).to.be.eq("Select a value");
                } else {
                  expect($otp.text().trim()).to.be.eq(regions[index - 1].regionId);
                }
              })
              .then(() => {
                cy.wait(500);
                cy.get("body").click();
              });
          });
        });
      // check show multi select Organization

      cy.get("bridge-side-board")
        .find("bridge-select[data-test='organization-select'] mat-select")
        .click()
        .then(() => {
          // check length show panel chose Region
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
            cy.wrap($el).should("have.length", customers.length + 1);
            // check show string
            cy.wrap($el)
              .each(($otp, index) => {
                if (index === 0) {
                  expect($otp.text().trim()).to.be.eq("Select a value");
                } else {
                  expect($otp.text().trim()).to.be.eq(customers[index - 1].customerId);
                }
              })
              .then(() => {
                cy.wait(500);
                cy.get("body").click();
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

    it("Select a single Model item", () => {
      if (eventTypes.length > 0) {
        cy.get("bridge-side-board")
          .find("bridge-select-multi[data-test='model-select'] mat-select")
          .click()
          .then(() => {
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${eventTypes[1].typeId}`)
              .click()
              .then(() => {
                cy.wait(500);
                cy.get("bridge-select-multi")
                  .invoke("attr", "ng-reflect-selected-item")
                  .should("contain", `${eventTypes[1].typeId}`);
              });
          });
      }
    });

    it("Select multiple Model items", () => {
      if (eventTypes.length > 0) {
        cy.get("bridge-side-board")
          .find("bridge-select-multi[data-test='model-select'] mat-select")
          .click({ force: true })
          .then(() => {
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all'`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${eventTypes[0].typeId}`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${eventTypes[1].typeId}`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${eventTypes[2].typeId}`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${eventTypes[0].typeId}`).click();
            cy.wait(500);
            cy.get("body")
              .click()
              .then(() => {
                cy.wait(500);
                cy.get("bridge-select-multi")
                  .invoke("attr", "ng-reflect-selected-item")
                  .should("contain", `${eventTypes[1].typeId},${eventTypes[2].typeId}`);
              });
          });
      }
    });

    it("Select a single Region item", () => {
      if (regions.length > 0) {
        cy.get("bridge-side-board")
          .find("bridge-select[data-test='region-select'] mat-select")
          .click()
          .then(() => {
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${regions[1].regionId}']`)
              .click()
              .then(() => {
                cy.wait(500);
                cy.get("bridge-select[data-test='region-select']")
                  .invoke("attr", "ng-reflect-selected-item")
                  .should("contains", `${regions[1].regionId}`);
              });
          });
      }
    });

    it("Change Organization item to blank", () => {
      cy.get("bridge-side-board")
        .find("bridge-select[data-test='organization-select'] mat-select")
        .click()
        .then(($el) => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(0)`)
            .click()
            .then(() => {
              cy.wait(500);
              cy.get("bridge-select[data-test='organization-select']")
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", undefined);
              cy.get("bridge-select[data-test='location-select']")
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", "");
            });
        });
    });

    it("Change Organization item to none-blank ", () => {
      if (customers.length > 0) {
        cy.get("bridge-side-board")
          .find("bridge-select[data-test='organization-select'] mat-select")
          .click()
          .then(($el) => {
            cy.get(`.cdk-overlay-container .mat-select-panel  mat-option:eq(1)`)
              .click()
              .then(() => {
                cy.wait(500);
                cy.get("bridge-select[data-test='organization-select']")
                  .invoke("attr", "ng-reflect-selected-item")
                  .should("eq", customers[0].customerId);
                cy.get("bridge-select[data-test='location-select']")
                  .invoke("attr", "ng-reflect-selected-item")
                  .should("eq", "");
              });
          });
      }
    });

    it("Select a single Location item", () => {
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsEditScheduled")).wait("@apiAssets");
      cy.get("bridge-button[data-test='asset-modal'].basic button")
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
      cy.visit(Cypress.env("deploymentsEditScheduled")).wait("@apiAssets");
      cy.get("bridge-button[data-test='asset-modal'].basic button")
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsEditScheduled")).wait("@apiAssets");
      cy.get("bridge-button[data-test='asset-modal'].basic button")
        .click()
        .wait(500);
      cy.get("bridge-side-board")
        .find('bridge-button[data-test="ok"]')
        .click({
          force: true,
        });
      cy.request(`${apiAssets}?sort=desc&isFilter=true&limit=10&offset=0`).then(({ body }) => {
        // check number recode return
        cy.wait(500);
        cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody")
          .find("tr")
          .its("length")
          .should("be.eq", Math.min(body.items.length, 10));
        // check data map with table asset list

        keysAssetShow.forEach((value, index) => {
          switch (value) {
            case "status":
              cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                .find(`td:eq(${index + 1}) .badge`)
                .invoke("text")
                .then((text) => text.trim())
                .should("equal", body.items[0][value]);
              break;

            default:
              cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                .find(`td:eq(${index + 1})`)
                .invoke("text")
                .then((text) => text.trim())
                .should("equal", body.items[0][value]);
              break;
          }
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
      cy.server()
        .route("GET", `${apiAssets}*`)
        .as("apiAssets");
      cy.visit(Cypress.env("deploymentsEditScheduled")).wait("@apiAssets");
      cy.get("bridge-button[data-test='asset-modal'].basic button")
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
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        taskAssets = api[2].response.body.assets;
        checkAssets = taskAssets.map((item) => item.typeId + "_" + item.assetId);
      });
      cy.get("bridge-button[data-test='asset-modal'].basic button").click();
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
        cy.wait(1000).then(() => {
          cy.get(`.cdk-overlay-container bridge-table table[data-test="asset-table"] thead .${key}`)
            .click()
            .then(($el) => {
              cy.request(`${apiAssets}?sortName=${key}&sort=asc&isFilter=false&limit=10&offset=0`).then(({ body }) => {
                cy.wait(500);
                cy.wrap($el).should("have.class", "sorted-select");
                // check img sort
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", upImg);
                const check = checkAssets.includes(body.items[0].typeId + "_" + body.items[0].assetId);
                cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                  .find(`.tableCell-checked mat-checkbox`)
                  .invoke("attr", "ng-reflect-checked")
                  .should("eq", check.toString());
                keysAssetShow.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                        .find(`td:eq(${index + 1}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[0][value]);
                      break;
                    default:
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                        .find(`td:eq(${index + 1})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[0][value]);
                      break;
                  }
                });
              });
            });
        });
      });
      it(`Click ${name} to set the descending order`, () => {
        cy.wait(1000).then(() => {
          cy.get(`.cdk-overlay-container bridge-table table[data-test="asset-table"] thead .${key}`)
            .click()
            .then(($el) => {
              cy.request(`${apiAssets}?sortName=${key}&sort=desc&isFilter=false&limit=10&offset=0`).then(({ body }) => {
                cy.wait(500);
                cy.wrap($el).should("have.class", "sorted-select");
                // check img sort
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", downImg);
                const check = checkAssets.includes(body.items[0].typeId + "_" + body.items[0].assetId);
                cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                  .find(`.tableCell-checked mat-checkbox`)
                  .invoke("attr", "ng-reflect-checked")
                  .should("eq", check.toString());
                keysAssetShow.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                        .find(`td:eq(${index + 1}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[0][value]);
                      break;
                    default:
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                        .find(`td:eq(${index + 1})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[0][value]);
                      break;
                  }
                });
              });
            });
        });
      });
      it(`Click ${name} to set the default order `, () => {
        cy.wait(1000).then(() => {
          cy.get(`.cdk-overlay-container bridge-table table[data-test="asset-table"] thead .${key}`)
            .click()
            .then(($el) => {
              cy.request(`${apiAssets}?isFilter=false&limit=10&offset=0`).then(({ body }) => {
                cy.wait(500);
                cy.wrap($el).should("have.not.class", "sorted-select");
                // check img sort
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", defaultImg);
                const check = checkAssets.includes(body.items[0].typeId + "_" + body.items[0].assetId);
                cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                  .find(`.tableCell-checked mat-checkbox`)
                  .invoke("attr", "ng-reflect-checked")
                  .should("eq", check.toString());
                keysAssetShow.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                        .find(`td:eq(${index + 1}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[0][value]);
                      break;
                    default:
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-table tbody tr:eq(0)")
                        .find(`td:eq(${index + 1})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", body.items[0][value]);
                      break;
                  }
                });
              });
            });
        });
      });
    });
  });

  context("Paging operations", () => {
    before(() => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        taskAssets = api[2].response.body.assets;
      });
      cy.get("bridge-button[data-test='asset-modal'].basic button").click();
    });

    it("Click the page 2 button", () => {
      cy.get(".cdk-overlay-container bridge-pagination")
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
              cy.get(".cdk-overlay-container  bridge-table tbody")
                .find("tr")
                .its("length")
                .should("be.eq", Math.min(res.body.items.length, 10));
              keysAssetShow.forEach((value, index) => {
                switch (value) {
                  case "status":
                    cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                      .find(`td:eq(${index + 1}) .badge`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", res.body.items[0][value]);
                    break;
                  default:
                    cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                      .find(`td:eq(${index + 1})`)
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", res.body.items[0][value]);
                    break;
                }
              });
              numberPage = Math.ceil(res.body.totalCount / 10) + 2;
              page = 1;
              cy.get(".cdk-overlay-container bridge-pagination")
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
      cy.get(".cdk-overlay-container bridge-pagination")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.get(".cdk-overlay-container bridge-pagination .pagination button.right-arrow")
              .click()
              .then(() => {
                cy.wait(500);
                page =
                  parseInt(
                    Cypress.$(".cdk-overlay-container bridge-pagination")
                      .find(".pagination button.selected")
                      .text(),
                  ) - 1;
                cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody")
                    .find("tr")
                    .its("length")
                    .should("be.eq", Math.min(res.body.items.length, 10));

                  keysAssetShow.forEach((value, index) => {
                    switch (value) {
                      case "status":
                        cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                          .find(`td:eq(${index + 1}) .badge`)
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", res.body.items[0][value]);
                        break;
                      default:
                        cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                          .find(`td:eq(${index + 1})`)
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", res.body.items[0][value]);
                        break;
                    }
                  });
                  numberPage = Math.ceil(res.body.totalCount / 10) + 2;

                  cy.get(".cdk-overlay-container bridge-pagination")
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
      cy.get(".cdk-overlay-container bridge-pagination")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.get(".cdk-overlay-container bridge-pagination .pagination button.left-arrow")
              .click()
              .then(() => {
                cy.wait(500);
                page =
                  parseInt(
                    Cypress.$(".cdk-overlay-container bridge-pagination")
                      .find(".pagination button.selected")
                      .text(),
                  ) - 1;
                cy.request(`${apiAssets}??sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
                  cy.wait(500);
                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody")
                    .find("tr")
                    .its("length")
                    .should("be.eq", Math.min(res.body.items.length, 10));

                  keysAssetShow.forEach((value, index) => {
                    switch (value) {
                      case "status":
                        cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                          .find(`td:eq(${index + 1}) .badge`)
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", res.body.items[0][value]);
                        break;
                      default:
                        cy.get(".cdk-overlay-container bridge-table tbody tr:eq(0)")
                          .find(`td:eq(${index + 1})`)
                          .invoke("text")
                          .then((text) => text.trim())
                          .should("equal", res.body.items[0][value]);
                        break;
                    }
                  });

                  numberPage = Math.ceil(res.body.totalCount / 10) + 2;
                  cy.get(".cdk-overlay-container bridge-pagination")
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
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        taskAssets = api[2].response.body.assets;
      });
    });

    it("Click the Cancel button", () => {
      cy.get("bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container bridge-table thead tr th mat-checkbox label`)
            .click({ force: true })
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-modal")
                .invoke("attr", "ng-reflect-selected")
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button")
                    .first()
                    .click()
                    .then(() => {
                      cy.get(".cdk-overlay-container bridge-table[data-test='asset-selected-table']").should("not.exist");
                    });
                });
            });
        });
    });
  });

  context("OK operations", () => {
    before(() => {
      visitData = visitDataUrl("deploymentsEditScheduled");
      visitData.then((api) => {
        assets = api[0].response.body;
        taskAssets = api[2].response.body.assets;
      });
    });

    it("Click the OK button", () => {
      cy.get("bridge-button[data-test='asset-modal'].basic button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container bridge-table thead tr th mat-checkbox label`)
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
