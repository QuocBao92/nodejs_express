Cypress.Commands.add("hide", { prevSubject: "element" }, (subject) => {
  subject.css("visibility", "hidden");
});
describe("Snapshot-testing: Deployment Reservation Edit Confirmation", () => {
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
    downloadPackageDate: "10/1/2100",
    installDate: "10/2/2100",
  };
  const urlParams = {
    taskId: "5ef63584-9fa1-4d94-b83e-cba4d01434d6",
  };
  const apiParams = {
    locations: {
      customerId: "GLORY LTD.",
    },
    packagesInvalidAssets: {
      packageId: "0429534a-e9d2-443b-a6b0-71bd1aa512c3",
    },
    tasksDeploymentsId: {
      taskId: urlParams.taskId,
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
            .as("postPackagesInvalidAssets")
            .route(
              "GET",
              `${Cypress.env("apiTasksDeploymentsIdRL").replace("${1}", apiParams.tasksDeploymentsId.taskId)}*`,
              `fx:tasks/deployments-id/${fixture}`,
            )
            .as("getTasksDeploymentsId");
          cy.visit(Cypress.env("deploymentsEditRL").replace("${1}", urlParams.taskId)).wait(
            ["@getAssets", "@getPackages", "@getTypes", "@getRegions", "@getCustomers", "@getTasksDeploymentsId"],
            { requestTimeout: 10000 },
          );
          cy.wait(1000);

          // input Date of Download Package Setting
          cy.get(".download-setting bridge-date-picker input")
            .clear()
            .type(inputValues.downloadPackageDate);
          // input Date of Install Package Setting
          cy.get(".install-setting .install-setting-group bridge-date-picker input")
            .clear()
            .type(inputValues.installDate);

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
