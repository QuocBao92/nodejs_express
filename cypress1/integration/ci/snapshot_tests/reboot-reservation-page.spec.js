Cypress.Commands.add("hide", { prevSubject: "element" }, (subject) => {
  subject.css("visibility", "hidden");
});
describe("Snapshot-testing: Reboot Reservation", () => {
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
    selectAssetRow: [0, 1, 4],
    memo: "memo",
    isImmediately: false,
    date: "10/1/2000",
    time: "00:00",
  };
  const apiParams = {
    locations: {
      customerId: "GLORY LTD.",
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
            .as("getLocations");
          cy.visit(Cypress.env("rebootNew")).wait(["@getAssets", "@getTypes", "@getRegions", "@getCustomers"], { requestTimeout: 10000 });
          cy.wait(1000);
          cy.get("body").toMatchImageSnapshot();
          cy.get("bridge-header").hide();

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
          // input Memo
          cy.get("[data-test=memo]").type(inputValues.memo);
          // select Select Date/Time
          cy.get(`[data-test=start-time-options] input[type=radio][value=${!inputValues.isImmediately}]`).check({ force: true });
          // input Date and Time
          cy.get("bridge-date-picker[data-test='start-date-dl-picker']").type(inputValues.date);
          cy.get("body").click();
          cy.get("bridge-time-picker[data-test='start-date-dl-picker']").type(inputValues.time);

          cy.get("[data-test=confirm-button]").click();
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
