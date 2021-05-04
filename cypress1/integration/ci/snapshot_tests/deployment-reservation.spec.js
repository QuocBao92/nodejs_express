Cypress.Commands.add("hide", { prevSubject: "element" }, (subject) => {
  subject.css("visibility", "hidden");
});
describe("Snapshot-testing: Deployment Reservation", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const fixtures = ["sample", "long"];
  const inputValues = {
    taskName: "DownloadPackage",
    selectPackageRow: 0,
    selectAssetRow: [0, 1, 4],
    isDownloadPackageImmediately: false,
    downloadPackageDate: "10/2/2000",
    downloadPackageTime: "00:00",
    isInstall: true,
    isInstallImmediately: false,
    installDate: "10/1/2000",
    installTime: "00:00",
  };
  const apiParams = {
    locations: {
      customerId: "GLORY LTD.",
    },
    packagesInvalidAssets: {
      packageId: "0429534a-e9d2-443b-a6b0-71bd1aa512c3",
    },
  };

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route("GET", `${Cypress.env("apiAssets")}*`, `fx:assets/assets/${fixture}`)
            .as("getAssets")
            .route("GET", `${Cypress.env("apiPackages")}*`, `fx:packages/packages/complete.${fixture}`)
            .as("getPackages")
            .route("GET", `${Cypress.env("apiTypes")}*`, `fx:types/sample`)
            .as("getTypes")
            .route("GET", `${Cypress.env("apiRegions")}*`, `fx:regions/sample`)
            .as("getRegions")
            .route("GET", `${Cypress.env("apiCustomers")}*`, `fx:customers/sample`)
            .as("getCustomers")
            .route("GET", `${Cypress.env("apiLocationsRL").replace("${1}", apiParams.locations.customerId)}*`, `fx:locations/sample`)
            .as("getLocations")
            .route(
              "POST",
              `${Cypress.env("apiPackagesInvalidAssetsRL").replace("${1}", apiParams.packagesInvalidAssets.packageId)}*`,
              `fx:packages-invalid-assets/sample`,
            )
            .as("postPackagesInvalidAssets");
          cy.visit(Cypress.env("deploymentsNew")).wait(["@getAssets", "@getPackages", "@getTypes", "@getRegions", "@getCustomers"], {
            requestTimeout: 10000,
          });
          cy.wait(1000);
          cy.get("body").toMatchImageSnapshot();
          cy.get("bridge-header").hide();

          // input Task Name
          cy.get("[id=name]").type(inputValues.taskName);
          // select Package
          cy.get("[data-test=package-modal]").click({ force: true });
          cy.wait(500);
          cy.get("[data-test=package-table]").within(() => {
            cy.get("bridge-expansion-panel")
              .eq(inputValues.selectPackageRow)
              .within(() => {
                cy.get("input[type=radio]").check({ force: true });
              });
          });
          cy.get("mat-dialog-actions > bridge-button > button")
            .contains("OK")
            .click();
          cy.wait(500);
          // select Target Asset
          cy.get("[data-test=asset-modal]").click({ force: true });
          cy.wait(500);
          cy.get("[data-test=asset-table] > tbody").within(() => {
            inputValues.selectAssetRow.forEach((row) => {
              cy.get("[data-test=table-row]")
                .eq(row)
                .within(() => {
                  cy.get("input[type=checkbox]").check({ force: true });
                });
            });
          });
          cy.get("mat-dialog-actions > bridge-button > button")
            .contains("OK")
            .click();
          cy.wait(500);
          // select Select Date/Time of Download Package Setting
          cy.get(`[data-test=start-time-dl-options] input[type=radio][value=${!inputValues.isDownloadPackageImmediately}]`).check({
            force: true,
          });
          // input Date and Time of Download Package Setting
          cy.get("bridge-deployment-reservation-page .download-setting")
            .find("bridge-date-picker[data-test='start-date-dl-picker'] input")
            .type(inputValues.downloadPackageDate);
          cy.get("body").click();
          cy.get("bridge-deployment-reservation-page .download-setting")
            .find("bridge-time-picker[data-test='start-date-dl-picker'] input")
            .type(inputValues.downloadPackageTime);
          // select Select Yes of Install Setting
          cy.get(`[data-test=ins-options] input[type=radio][value=${inputValues.isInstall}]`).check({ force: true });
          // select Select Date/Time of Install Package Setting
          cy.get(`[data-test=start-time-ins-options] input[type=radio][value=${!inputValues.isInstallImmediately}]`).check({ force: true });
          // input Date and Time of Install Package Setting
          cy.get("bridge-date-picker[data-test='expire-ins-date-picker'] input").type(inputValues.installDate);
          cy.get("body").click();
          cy.get("bridge-time-picker[data-test='expire-ins-date-picker'] input").type(inputValues.installTime);

          cy.get("[data-test=confirm-button]")
            .click()
            .then(() => {
              cy.wait("@postPackagesInvalidAssets");
            });
          cy.wait(2000);
          cy.get("body").toMatchImageSnapshot();

          cy.get("[data-test=expansion-row] button").click({ force: true });
          cy.wait(500);
          cy.get("body").toMatchImageSnapshot();

          cy.get("[data-test=cancel-button] button").click({ force: true });
          cy.wait(500);
          cy.get("bridge-alert").toMatchImageSnapshot();
        });
      });
    });
  });
});

describe("Snapshot-testing: Deployment Reservation, Select Package", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const fixtures = ["sample", "long", "empty"];
  const searchFilter = {
    keyword: "firmware",
  };
  const apiParams = {
    locations: {
      customerId: "GLORY LTD.",
    },
    packagesInvalidAssets: {
      packageId: "0429534a-e9d2-443b-a6b0-71bd1aa512c3",
    },
  };

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route("GET", `${Cypress.env("apiAssets")}*`, `fx:assets/assets/sample`)
            .as("getAssets")
            .route("GET", `${Cypress.env("apiPackages")}*`, `fx:packages/packages/complete.${fixture}`)
            .as("getPackages")
            .route("GET", `${Cypress.env("apiTypes")}*`, `fx:types/sample`)
            .as("getTypes")
            .route("GET", `${Cypress.env("apiRegions")}*`, `fx:regions/sample`)
            .as("getRegions")
            .route("GET", `${Cypress.env("apiCustomers")}*`, `fx:customers/sample`)
            .as("getCustomers")
            .route("GET", `${Cypress.env("apiLocationsRL").replace("${1}", apiParams.locations.customerId)}*`, `fx:locations/sample`)
            .as("getLocations")
            .route(
              "POST",
              `${Cypress.env("apiPackagesInvalidAssetsRL").replace("${1}", apiParams.packagesInvalidAssets.packageId)}*`,
              `fx:packages-invalid-assets/sample`,
            )
            .as("postPackagesInvalidAssets");
          cy.visit(Cypress.env("deploymentsNew")).wait(["@getAssets", "@getPackages", "@getTypes", "@getRegions", "@getCustomers"], {
            requestTimeout: 10000,
          });
          cy.wait(1000);
          cy.get("[data-test=package-modal]").click({ force: true });
          cy.wait(500);
          // input Keyword
          cy.get("bridge-search-box")
            .find("bridge-form input")
            .type(searchFilter.keyword);

          if (fixture !== "empty") {
            cy.get("[data-test=package-table]").within(() => {
              cy.get("bridge-expansion-panel")
                .eq(0)
                .within(() => {
                  cy.get("input[type=radio]").check({ force: true });
                });
            });
          }
          cy.wait(500);
          cy.get("bridge-modal").toMatchImageSnapshot();

          if (fixture !== "empty") {
            cy.get("[data-test=package-table]").within(() => {
              cy.get("bridge-expansion-panel")
                .eq(0)
                .within(() => {
                  cy.get("button").click({ force: true });
                });
            });
            cy.wait(500);
            cy.get("bridge-modal").toMatchImageSnapshot();
          }
        });
      });
    });
  });
});

describe("Snapshot-testing: Deployment Reservation, Select Assets", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const fixtures = ["sample", "long", "empty"];
  const searchFilter = {
    keyword: "GATEWAY",
    status: "Good",
    model: "CI10",
    region: "North Japan Region",
    organization: "GLORY LTD.",
    location: "Himeji HQ",
  };
  const apiParams = {
    locations: {
      customerId: searchFilter.organization,
    },
    packagesInvalidAssets: {
      packageId: "0429534a-e9d2-443b-a6b0-71bd1aa512c3",
    },
  };

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route("GET", `${Cypress.env("apiAssets")}*`, `fx:assets/assets/${fixture}`)
            .as("getAssets")
            .route("GET", `${Cypress.env("apiPackages")}*`, `fx:packages/packages/sample`)
            .as("getPackages")
            .route("GET", `${Cypress.env("apiTypes")}*`, `fx:types/sample`)
            .as("getTypes")
            .route("GET", `${Cypress.env("apiRegions")}*`, `fx:regions/sample`)
            .as("getRegions")
            .route("GET", `${Cypress.env("apiCustomers")}*`, `fx:customers/sample`)
            .as("getCustomers")
            .route("GET", `${Cypress.env("apiLocationsRL").replace("${1}", apiParams.locations.customerId)}*`, `fx:locations/sample`)
            .as("getLocations")
            .route(
              "POST",
              `${Cypress.env("apiPackagesInvalidAssetsRL").replace("${1}", apiParams.packagesInvalidAssets.packageId)}*`,
              `fx:packages-invalid-assets/sample`,
            )
            .as("postPackagesInvalidAssets");
          cy.visit(Cypress.env("deploymentsNew")).wait(["@getAssets", "@getPackages", "@getTypes", "@getRegions", "@getCustomers"], {
            requestTimeout: 10000,
          });
          cy.wait(1000);

          cy.get("[data-test=asset-modal]").click({ force: true });
          cy.wait(500);
          // input Keyword
          cy.get("[data-test='search-box'] bridge-form input").type(searchFilter.keyword);
          // select Status
          cy.get("[data-test='status-checkbox']").within(() => {
            cy.get("mat-checkbox")
              .eq(0)
              .within(() => {
                cy.get("input[type=checkbox]").check({ force: true });
              });
          });

          // select Model
          cy.get("[data-test='model-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.model}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          // select Region
          cy.get("[data-test='region-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.region}']`).click();
            });
          // select Organization
          cy.get("[data-test='organization-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.organization}']`).click();
              cy.wait("@getLocations");
            });
          // select Location
          cy.get("[data-test='location-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.location}']`).click();
            });

          cy.get("bridge-side-board").click();
          scrollTo(0, 0);

          if (fixture !== "empty") {
            cy.get("[data-test=asset-table] > tbody").within(() => {
              cy.get("[data-test=table-row]")
                .eq(0)
                .within(() => {
                  cy.get("input[type=checkbox]").check({ force: true });
                });
              cy.get("[data-test=table-row]")
                .eq(1)
                .within(() => {
                  cy.get("input[type=checkbox]").check({ force: true });
                });
              cy.get("[data-test=table-row]")
                .eq(4)
                .within(() => {
                  cy.get("input[type=checkbox]").check({ force: true });
                });
            });
          }
          cy.wait(500);
          cy.get("bridge-modal").toMatchImageSnapshot();
        });
      });
    });
  });
});
