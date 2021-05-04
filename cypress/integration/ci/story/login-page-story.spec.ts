describe("Story-Login", () => {
  before(() => {
    cy.visit("/").then(() => {
      cy.wait(500);
      if (!Cypress._.includes(cy.url(), Cypress.env("loginEndpoints").pageLogin)) {
        cy.visit(Cypress.env("loginEndpoints").pageLogin);
      }
    });
  });

  context("initial display", () => {
    it("should get and redirect to login page", () => {
      cy.url().should("contain", Cypress.env("loginEndpoints").pageLogin);
    });

    it("should display IMO for header", () => {
      cy.get("h1").contains("IMO").should("be.visible");
    });

    it("should display username label and input", () => {
      cy.get("p").contains("User name").should("be.visible").next().find("input").should("be.visible").and("not.be.disabled");
    });

    it("should display password label and input", () => {
      cy.get("p").contains("Password").should("be.visible").next().find("input").should("be.visible").and("not.be.disabled");
    });

    it("should disabled login button by default", () => {
      cy.get("button").contains("login", { matchCase: false }).should("be.visible").and("be.disabled");
    });
  });

  context("fill and actions", () => {
    it("input invalid min length of username and password", () => {
      cy.get("p").contains("User name", { matchCase: false }).next().find("input").type("test");
      cy.get("p").contains("Password", { matchCase: false }).next().find("input").type("test.password");
      cy.get("button").contains("login", { matchCase: false }).and("be.disabled");
    });

    it("submit login but invalid username or password", () => {
      cy.server()
        .route("POST", Cypress.env("host") + Cypress.env("loginEndpoints").apiAuth)
        .as("apiAuth");
      cy.get("p").contains("User name", { matchCase: false }).next().find("input").type(".user");
      cy.get("button").contains("login", { matchCase: false }).click();
      cy.wait("@apiAuth").then(() => {
        cy.get("div.error-form").should("be.visible").find("a").should("have.text", "Incorrect User name or Password");
      });
    });

    it("correcting input value then submit login", () => {
      cy.get("p").contains("User name", { matchCase: false }).next().find("input").type("{selectAll}").type("username");
      cy.get("p").contains("Password", { matchCase: false }).next().find("input").type("{selectAll}").type("password");
      cy.get("button").contains("login", { matchCase: false }).and("not.be.disabled");
    });

    it("should go to dashboard when login success", () => {
      const dashboardUrl = "/sample";
      cy.server()
        .route("POST", Cypress.env("host") + Cypress.env("loginEndpoints").apiAuth)
        .as("apiAuth");

      cy.get("button").contains("login", { matchCase: false }).click();
      cy.wait("@apiAuth").then(() => {
        cy.getCookie("connect.sid").should("exist");
      });
      cy.url().should("contain", dashboardUrl);
    });
  });
});
