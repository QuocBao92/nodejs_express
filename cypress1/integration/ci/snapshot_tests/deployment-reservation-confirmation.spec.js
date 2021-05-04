Cypress.Commands.add("hide", { prevSubject: "element" }, (subject) => {
  subject.css("visibility", "hidden");
});
describe("Snapshot-testing: Deployment Reservation Confirmation", () => {
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
    downloadPackageDate: "10/1/2100",
    downloadPackageTime: "00:00",
    isInstall: true,
    isInstallImmediately: false,
    installDate: "10/2/2100",
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
              `fx:packages-invalid-assets/empty`,
            )
            .as("postPackagesInvalidAssets");
          cy.visit(Cypress.env("deploymentsNew")).wait(["@getAssets", "@getPackages", "@getTypes", "@getRegions", "@getCustomers"], {
            requestTimeout: 10000,
          });
          cy.wait(1000);

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
          cy.get("bridge-header").hide();

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
