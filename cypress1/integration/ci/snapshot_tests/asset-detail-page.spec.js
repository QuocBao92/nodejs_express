Cypress.Commands.add("hide", { prevSubject: "element" }, (subject) => {
  subject.css("visibility", "hidden");
});
const viewports = [
  { x: 1600, y: 1000, target: "PC" },
  // { x: 768, y: 1024, target: "iPad (portrait)" },
  // { x: 1024, y: 768, target: "iPad (landscape)" },
  // { x: 375, y: 812, target: "iPhone X (portrait)" },
  // { x: 812, y: 375, target: "iPhone X (landscape)" },
  // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
  // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
];

viewports.forEach((viewport) => {
  const statusfixtures = ["error", "good", "missing"];
  const fixtures = ["sample", "long", "empty"];
  const urlParams = {
    typeId: "CI10",
    assetId: "100000",
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
  };

  describe("Snapshot-testing: Assets Detail", () => {
    context(`Device: ${viewport.target}`, () => {
      statusfixtures.forEach((fixture) => {
        it(`Case: ${fixture} status data`, () => {
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
              `fx:asset/events/sample`,
            )
            .as("getAssetEvents")
            .route(
              "GET",
              `${Cypress.env("apiAssetStatusRL")
                .replace("${1}", apiParams.assetStatus.typeId)
                .replace("${2}", apiParams.assetStatus.assetId)}*`,
              `fx:asset/status/${fixture}`,
            )
            .as("getAssetStatus");
          cy.visit(
            Cypress.env("assetDetailRL")
              .replace("${1}", urlParams.typeId)
              .replace("${2}", urlParams.assetId),
          ).wait(["@getAssetDetail", "@getAssetFirmwares", "@getAssetInventory", "@getAssetEvents"], { requestTimeout: 10000 });

          cy.wait(1000);
          cy.get("body").toMatchImageSnapshot();

          cy.get("bridge-header").hide();
          cy.get("[data-test=firmware-title]").click({ force: true });
          cy.get("[data-test=inventory-title]").click({ force: true });
          cy.wait(500);
          cy.get("body").toMatchImageSnapshot();
        });
      });

      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route(
              "GET",
              `${Cypress.env("apiAssetDetailRL")
                .replace("${1}", apiParams.assetDetail.typeId)
                .replace("${2}", apiParams.assetDetail.assetId)}*`,
              `fx:asset/detail/${fixture}`,
            )
            .as("getAssetDetail")
            .route(
              "GET",
              `${Cypress.env("apiAssetFirmwaresRL")
                .replace("${1}", apiParams.assetFirmwares.typeId)
                .replace("${2}", apiParams.assetFirmwares.assetId)}*`,
              `fx:asset/firmware/${fixture}`,
            )
            .as("getAssetFirmwares")
            .route(
              "GET",
              `${Cypress.env("apiAssetInventoryRL")
                .replace("${1}", apiParams.assetInventory.typeId)
                .replace("${2}", apiParams.assetInventory.assetId)}*`,
              `fx:asset/inventory/${fixture}`,
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
              `fx:asset/status/error.${fixture}`,
            )
            .as("getAssetStatus");
          cy.visit(
            Cypress.env("assetDetailRL")
              .replace("${1}", urlParams.typeId)
              .replace("${2}", urlParams.assetId),
          ).wait(["@getAssetDetail", "@getAssetFirmwares", "@getAssetInventory", "@getAssetEvents"], { requestTimeout: 10000 });
          cy.wait(1000);
          cy.get("body").toMatchImageSnapshot();

          cy.get("bridge-header").hide();
          cy.get("[data-test=firmware-title]").click({ force: true });
          cy.get("[data-test=inventory-title]").click({ force: true });
          cy.wait(500);
          cy.get("[data-test=asset-detail]").toMatchImageSnapshot();

          cy.wait(500);
          cy.get("[data-test=asset-info] textarea").click({ force: true });
          cy.get("body").toMatchImageSnapshot();
        });
      });
    });
  });
});
