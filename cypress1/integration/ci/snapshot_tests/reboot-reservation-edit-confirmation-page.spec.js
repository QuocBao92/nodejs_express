describe("Snapshot-testing: Reboot Reservation Edit Confirmation", () => {
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
    date: "10/1/2100",
  };
  const urlParams = {
    taskId: "5ef63584-9fa1-4d94-b83e-cba4d01434d6",
  };
  const apiParams = {
    locations: {
      customerId: "GLORY LTD.",
    },
    tasksRebootsId: {
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
            .route("GET", `${Cypress.env("apiTypes")}*`, `fx:types/sample`)
            .as("getTypes")
            .route("GET", `${Cypress.env("apiRegions")}*`, `fx:regions/sample`)
            .as("getRegions")
            .route("GET", `${Cypress.env("apiCustomers")}*`, `fx:customers/sample`)
            .as("getCustomers")
            .route("GET", `${Cypress.env("apiLocationsRL").replace("${1}", apiParams.locations.customerId)}*`, `fx:locations/sample`)
            .as("getLocations")
            .route(
              "GET",
              `${Cypress.env("apiTasksRebootsIdRL").replace("${1}", apiParams.tasksRebootsId.taskId)}*`,
              `fx:tasks/reboots-id/${fixture}`,
            )
            .as("getTasksRebootsId");
          cy.visit(Cypress.env("rebootEditRL").replace("${1}", urlParams.taskId)).wait(
            ["@getAssets", "@getTypes", "@getRegions", "@getCustomers", "@getTasksRebootsId"],
            { requestTimeout: 10000 },
          );
          cy.wait(1000);

          // input Date
          cy.get("bridge-date-picker[data-test='start-date-dl-picker'] input")
            .clear()
            .type(inputValues.date);

          cy.get("[data-test=confirm-button]").click();
          cy.wait(2000);
          cy.get("body").toMatchImageSnapshot();

          cy.get("[data-test=cancel-button] button").click({ force: true });
          cy.wait(500);
          cy.get("bridge-alert").toMatchImageSnapshot();
        });
      });
    });
  });
});
