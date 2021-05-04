describe("Snapshot-testing: System Error,no-data", () => {
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
    context(`Device: ${viewport.target}`, () => {
      it(`Case: no-data`, () => {
        cy.visit(Cypress.env("assetNoData"));
        cy.wait(1000);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});

describe("Snapshot-testing: System Error,permission-error", () => {
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
    context(`Device: ${viewport.target}`, () => {
      it(`Case: permission-error`, () => {
        cy.visit(Cypress.env("permissionError"));
        cy.wait(1000);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});

describe("Snapshot-testing: Credentials Expired", () => {
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
    context(`Device: ${viewport.target}`, () => {
      it(`Case: credentials-expired`, () => {
        cy.visit(Cypress.env("credentialsExpired"));
        cy.wait(1000);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
