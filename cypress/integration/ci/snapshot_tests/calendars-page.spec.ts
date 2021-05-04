describe("Snapshot-testing: Calendars Page", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const calendarEndpoints = Cypress.env("calendarEndpoints");

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      it(`Case: Calendars`, () => {
        cy.viewport(viewport.x, viewport.y);

        const route = {
          alias: "GET view-calender/start",
          method: "GET",
          url: Cypress.env("host") + calendarEndpoints.apiViewCalendars,
          response: `fx:calendars/calendars.json`,
        };

        // visit Calendars page with mock data and take a snapshot
        cy.server().route(route.method, route.url, route.response).as(route.alias);
        cy.visit(calendarEndpoints.pageCalendars).wait("@" + route.alias);

        cy.wait(10);
        cy.get("body").toMatchImageSnapshot();

        cy.server()
          .route(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}*`, `fx:calendars/filter-calendars-by-name`)
          .as("apiFilter");

        // filter by Name and take a snapshot
        const keyword = "789";
        cy.get("[data-test='search-name']").type(keyword);

        // select type
        const type = "service";
        cy.get("imo-select-multi .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option")
              .contains(type, { matchCase: false })
              .click()
              .then(() => {
                cy.get("body").click();
              });
          });

        // select date range
        const startDate = Cypress.moment("2020-11-01");
        const startYearSelect = startDate.format("YYYY");
        const startMonthSelect = startDate.format("MMM").toUpperCase();
        const startDaySelect = startDate.format("D");
        const endDaySelect = startDate.clone().add(1, "day").format("D");

        cy.get(".calendar-filter-date")
          .first()
          .within((el) => {
            cy.wrap(el).find("mat-datepicker-toggle button").click();
            cy.get("button")
              .parents("body")
              .find(".mat-calendar")
              .find(".mat-calendar-next-button")
              .click()
              .siblings(".mat-calendar-previous-button")
              .click()
              .siblings(".mat-calendar-period-button")
              .click()
              .parents(".mat-calendar")
              .contains(".mat-calendar-body-cell-content", startYearSelect)
              .click();

            // select month after select year
            cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startMonthSelect).click();

            // select day after select month and year
            cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startDaySelect).click();
          });
        cy.get(".calendar-filter-date")
          .last()
          .within((el) => {
            cy.wrap(el).find("mat-datepicker-toggle button").click();
            cy.get("button")
              .parents("body")
              .find(".mat-calendar")
              .find(".mat-calendar-next-button")
              .click()
              .siblings(".mat-calendar-previous-button")
              .click()
              .siblings(".mat-calendar-period-button")
              .click()
              .parents(".mat-calendar")
              .contains(".mat-calendar-body-cell-content", startYearSelect)
              .click();

            // select month after select year
            cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startMonthSelect).click();

            // select day after select month and year
            cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endDaySelect).click();
          });

        cy.get("[data-test='apply-button']").click();
        cy.wait("@apiFilter");
        cy.get("body").toMatchImageSnapshot();
        cy.get("[data-test='clear-button']").click();
        // sort by Name desc and take a snapshot
        cy.server()
          .route(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}*`, `fx:calendars/sort-by-name-desc`)
          .as("apiSortDesc");

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el).contains("Name").click();
        });
        cy.wait("@apiSortDesc");
        cy.get("body").toMatchImageSnapshot();

        // sort by Name default and take a snapshot
        cy.server()
          .route(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}*`, `fx:calendars/calendars`)
          .as("apiSort");

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el).contains("Name").click();
        });
        cy.wait("@apiSort");
        cy.get("body").toMatchImageSnapshot();

        // click Delete button and take a snapshot
        cy.server({
          method: "GET",
          status: 200,
          response: {
            cits: [],
          },
        })
          .route("GET", Cypress.env("host") + calendarEndpoints.apiCalendarDetail.replace(":id", "123"))
          .as("GET /calendars/:calendarId");

        cy.get(".page-content imo-table tbody").within(() => {
          cy.get("imo-button").contains("Delete").click({ force: true });
        });
        cy.wait("@GET /calendars/:calendarId");

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        cy.server({
          method: "DELETE",
          status: 204,
          response: {},
        });
        cy.route("DELETE", Cypress.env("host") + calendarEndpoints.apiDeleteCalendar.replace(":id", "123")).as("apiDeleteCalendar");

        // click confirm Delete button and take a snapshot
        cy.wait(100);
        cy.get("body")
          .find("imo-alert")
          .within(() => {
            cy.get(".confirm:contains(Delete)").click();
          });

        cy.get("button").parents("body").find(".mat-simple-snackbar-action button").click();
        cy.wait("@apiDeleteCalendar");
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
