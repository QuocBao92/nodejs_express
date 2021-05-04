Cypress.Commands.add("hide", { prevSubject: "element" }, (subject) => {
  subject.css("visibility", "hidden");
});
describe("Snapshot-testing: Package-management", () => {
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

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route("GET", `${Cypress.env("apiPackages")}*`, `fx:packages/packages/${fixture}`)
            .as("getPackages")
            .route("POST", `${Cypress.env("apiPackagesStatus")}*`, `fx:packages/status/${fixture}`)
            .as("postPackagesStatus");
          cy.visit(Cypress.env("packages")).wait(["@getPackages", "@postPackagesStatus"], { requestTimeout: 10000 });
          cy.wait(1000);
          // input Keyword
          cy.get("bridge-search-box")
            .find("bridge-form input")
            .type(searchFilter.keyword);

          cy.wait(500);
          cy.get("body").toMatchImageSnapshot();
          cy.get("bridge-header").hide();

          if (fixture !== "empty") {
            cy.get("[data-test=row-header]")
              .eq(0)
              .click();
            cy.wait(500);
            cy.get("[data-test=row-header]")
              .eq(1)
              .click();
            cy.wait(500);
            cy.get("body").toMatchImageSnapshot();

            cy.get("bridge-textarea:first textarea").click();
            cy.wait(500);
            cy.get("body").toMatchImageSnapshot();

            cy.get("[data-test=delete-action]:nth(0)").click({ force: true });
            cy.wait(500);
            cy.get("bridge-alert").toMatchImageSnapshot();
          }
        });
      });
    });
  });
});
