describe("Snapshot-testing: Login Page", () => {
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
      it(`Case: Login`, () => {
        cy.viewport(viewport.x, viewport.y);

        cy.visit(Cypress.env("loginEndpoints").pageLogin);

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        cy.get("p:contains(User name)").next().find("input").type("wrongUsername");
        cy.get("p:contains(Password)").next().find("input").type("password");

        cy.server()
          .route({
            method: "POST",
            status: 401,
            url: Cypress.env("host") + Cypress.env("loginEndpoints").apiAuth,
          })
          .as("apiAuth");
        cy.get("button:contains(Login)").click();

        cy.wait("@apiAuth");
        cy.get("body").toMatchImageSnapshot();

        cy.server()
          .route({
            method: "POST",
            status: 201,
            headers: {
              "Set-Cookie": "connect.sid=somethingGreatHere",
            },
            url: Cypress.env("host") + Cypress.env("loginEndpoints").apiAuth,
          })
          .as("apiAuth");

        cy.get("p:contains(User name)").next().find("input").type("{selectAll}").type("username");
        cy.get("button:contains(Login)").click();

        cy.wait("@apiAuth");
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
