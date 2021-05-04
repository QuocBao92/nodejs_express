describe("Snapshot-testing: Edit Calendar Page", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const endpoints = Cypress.env("calendarEndpoints");

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiEditCalendar.replace(":id", "*"), `fx:edit-calendar/edit-calendar`)
          .as("apiEditCalendar");
        cy.visit(endpoints.pageEditCalendar.replace(":id", "1")).wait("@apiEditCalendar");
      });

      it(`Case: Edit Calendar page`, () => {
        cy.viewport(viewport.x, viewport.y);

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: Edit Calendar page holiday type`, () => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiEditCalendar.replace(":id", "*"), `fx:edit-calendar/edit-calendar-holiday`)
          .as("apiEditCalendarHoliday");
        cy.visit(endpoints.pageEditCalendar.replace(":id", "1")).wait("@apiEditCalendarHoliday");

        cy.viewport(viewport.x, viewport.y);

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
