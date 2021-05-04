describe("Snapshot-testing: Assets Page", () => {
  const viewPorts = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];
  const assetsEndpoints = Cypress.env("assetsEndpoints");

  viewPorts.forEach((viewPort) => {
    context(`Device: ${viewPort.target}`, () => {
      it(`Case: assets`, () => {
        cy.viewport(viewPort.x, viewPort.y);
        cy.server()
          .route("GET", Cypress.env("host") + assetsEndpoints.api.viewAssets, `fx:assets/assets`)
          .as("apiViewAssets");
        cy.visit(assetsEndpoints.page.viewAssets).wait("@apiViewAssets");
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
