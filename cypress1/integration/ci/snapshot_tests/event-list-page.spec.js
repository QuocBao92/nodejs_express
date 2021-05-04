describe("Snapshot-testing: Event List", () => {
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
  const urlParams = {
    typeId: "CI10",
    assetId: "100000",
  };
  const searchFilter = {
    date: "10/1/2020, 12:00:00 PM",
    eventSource: "Bridge",
    eventType: "downloadPackage",
    importance: "Information",
  };
  const apiParams = {
    assetDetail: {
      ...urlParams,
    },
    assetFirmwares: {
      ...urlParams,
    },
    assetInventory: {
      ...urlParams,
    },
    assetEvents: {
      ...urlParams,
    },
    assetStatus: {
      ...urlParams,
    },
    assetEvents: {
      ...urlParams,
    },
  };

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route(
              "GET",
              `${Cypress.env("apiAssetDetailRL")
                .replace("${1}", apiParams.assetDetail.typeId)
                .replace("${2}", apiParams.assetDetail.assetId)}*`,
              `fx:asset/detail/sample`,
            )
            .as("getAssetDetail")
            .route(
              "GET",
              `${Cypress.env("apiAssetFirmwaresRL")
                .replace("${1}", apiParams.assetFirmwares.typeId)
                .replace("${2}", apiParams.assetFirmwares.assetId)}*`,
              `fx:asset/firmware/sample`,
            )
            .as("getAssetFirmwares")
            .route(
              "GET",
              `${Cypress.env("apiAssetInventoryRL")
                .replace("${1}", apiParams.assetInventory.typeId)
                .replace("${2}", apiParams.assetInventory.assetId)}*`,
              `fx:asset/inventory/sample`,
            )
            .as("getAssetInventory")
            .route(
              "GET",
              `${Cypress.env("apiAssetEventsRL")
                .replace("${1}", apiParams.assetEvents.typeId)
                .replace("${2}", apiParams.assetEvents.assetId)}*`,
              `fx:asset/events/${fixture}`,
            )
            .as("getAssetEvents")
            .route(
              "GET",
              `${Cypress.env("apiAssetStatusRL")
                .replace("${1}", apiParams.assetStatus.typeId)
                .replace("${2}", apiParams.assetStatus.assetId)}*`,
              `fx:asset/status/good`,
            )
            .as("getAssetStatus")
            .route("GET", `${Cypress.env("apiEventTypes")}*`, `fx:event-types/sample`)
            .as("getEventTypes");
          cy.visit(
            Cypress.env("assetDetailRL")
              .replace("${1}", urlParams.typeId)
              .replace("${2}", urlParams.assetId),
          ).wait(["@getAssetDetail", "@getAssetFirmwares", "@getAssetInventory", "@getAssetEvents"], { requestTimeout: 10000 });
          cy.get("bridge-event-list-board bridge-button").click();
          cy.wait(2000);
          // input Start Date
          cy.get("bridge-event-list-filter")
            .find("bridge-range-date-time-picker mat-form-field:eq(0) input")
            .type(searchFilter.date);
          // input Finish Date
          cy.get("bridge-event-list-filter")
            .find("bridge-range-date-time-picker mat-form-field:eq(1) input")
            .type(searchFilter.date);
          // select Event Source
          cy.get("bridge-event-list-filter")
            .find("bridge-select[data-test='source-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.eventSource}']`).click();
              cy.wait("@getEventTypes");
            });
          // select Event Type
          cy.get("bridge-event-list-filter")
            .find("bridge-select[data-test='type-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.eventType}']`).click();
            });
          // select Importance
          cy.get("bridge-event-list-filter")
            .find("bridge-select[data-test='importance-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${searchFilter.importance}']`).click();
            });

          cy.wait(500);
          cy.get("body").toMatchImageSnapshot();
        });
      });
    });
  });
});
