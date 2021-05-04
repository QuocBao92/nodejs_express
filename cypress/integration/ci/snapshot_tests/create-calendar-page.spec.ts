export interface CIT {
  citId: string;
  name: string;
  country: string;
}

describe("Snapshot-testing: Create Calendar Page", () => {
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

  const changeDateRange = () => {
    const startDefaultDate = Cypress.moment("2020-11-26");
    const startDefaultYear = startDefaultDate.format("YYYY");
    const startDefaultMonth = startDefaultDate.format("MMM").toUpperCase();

    // change startDate
    cy.get("[data-test=calendar-start-date]").within(() => {
      cy.get("button").click();

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
        .contains(".mat-calendar-body-cell-content", startDefaultYear)
        .click();

      // select month after select year
      cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startDefaultMonth).click();

      // select day after select month and year
      cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", "15").click();
    });

    // change endType
    cy.get("[data-test=calendar-radios] mat-radio-button")
      .first()
      .within(($radio) => {
        cy.wrap($radio)
          .contains("Date")
          .within(() => {
            cy.get("input[type=radio]").click({ force: true });
          });
      });

    // change endDate
    cy.get("[data-test=calendar-end-date]").within(() => {
      cy.get("button").click();

      cy.get("button")
        .parents("body")
        .find(".mat-calendar")
        .should("be.visible")
        .find(".mat-calendar-next-button")
        .click()
        .siblings(".mat-calendar-previous-button")
        .click()
        .siblings(".mat-calendar-period-button")
        .click()
        .parents(".mat-calendar")
        .contains(".mat-calendar-body-cell-content", startDefaultYear)
        .click();

      // select month after select year
      cy.get("button")
        .parents("body")
        .find(".mat-calendar")
        .should("be.visible")
        .contains(".mat-calendar-body-cell-content", startDefaultMonth)
        .click();

      // select day after select month and year
      cy.get("button").parents("body").find(".mat-calendar").should("be.visible").contains(".mat-calendar-body-cell-content", "20").click();
    });
  };

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetCalendar, `fx:create-calendar/create-calendar`)
          .as("apiGetCalendar");
        cy.visit(endpoints.pageCreateCalendar).wait("@apiGetCalendar");
      });

      it(`Case: Create Calendar page`, () => {
        cy.viewport(viewport.x, viewport.y);

        // weekly pattern is default and take a snapshot
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        cy.get("[data-test=type-selection]")
          .contains("Service")
          .click()
          .then(() => {
            cy.get("mat-select").parents("body").find("mat-option").last().click({ force: true });
          });
        cy.get("[data-test=input-form]").find("[name=Name]").type("Calendar 001", { delay: 0 });
        cy.get("[data-test=input-form]").find("[name=Description]").type("Description of Calendar 001", { delay: 0 });
        changeDateRange();

        // select daily pattern and take a snapshot
        cy.get("[data-test=pattern-selection]")
          .contains("Weekly")
          .click()
          .then(() => {
            cy.get("mat-select").parents("body").find("mat-option:contains(Daily)").click();
          });
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // select monthly pattern and take a snapshot
        cy.get("[data-test=pattern-selection]")
          .contains("Daily")
          .click()
          .then(() => {
            cy.get("mat-select").parents("body").find("mat-option:contains(Monthly)").click();
          });
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // Select type holiday and take a snapshot
        cy.get("[data-test=type-selection]")
          .contains("Emergency")
          .click()
          .then(() => {
            cy.get("mat-select").parents("body").find("mat-option").eq(1).click({ force: true });
          });
        const defaultDate = Cypress.moment("2021-01-01");
        const year = defaultDate.format("YYYY");
        const monthSelect = defaultDate.format("MMM").toUpperCase();
        let day = defaultDate.format("D");

        cy.get("[data-test=calendar-holidays-table]").within(() => {
          cy.root()
            .parents("[data-test=calendar-holidays]")
            .find("button")
            .contains("Add Holiday")
            .click({ force: true })
            .then(() => {
              cy.get("table tbody").within(() => {
                cy.get("tr").each(($tr) => {
                  cy.wrap($tr)
                    .find("td:nth-child(2)")
                    .within(($td) => {
                      // Input holiday name
                      cy.wrap($td).get("input[type=text]").type(`{selectall}{backspace}`).type("New Year's Day");
                    });

                  cy.wrap($tr)
                    .find("td:nth-child(3)")
                    .within(() => {
                      cy.get("button").click();

                      // select year
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
                        .contains(".mat-calendar-body-cell-content", year)
                        .click();

                      // select month after select year
                      cy.get("button")
                        .parents("body")
                        .find(".mat-calendar")
                        .contains(".mat-calendar-body-cell-content", monthSelect)
                        .click();

                      // select day after select month and year
                      cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", day).click();
                      day = defaultDate.add(1, "day").format("D");
                    });

                  cy.wrap($tr)
                    .find("td:nth-child(6)")
                    .within(($td) => {
                      const orderOffset = "11";
                      cy.wrap($td).get("input[type=text]").type(`{selectall}{backspace}${orderOffset}`);
                    });

                  cy.wrap($tr)
                    .find("td:nth-child(7)")
                    .within(($td) => {
                      const serviceOffset = "22";
                      cy.wrap($td).get("input[type=text]").type(`{selectall}{backspace}${serviceOffset}`);
                    });
                });
              });
            });
        });
        cy.get("body").toMatchImageSnapshot();

        // Click select button and take a snapshot
        const response: CIT[] = [{ citId: "0", name: "Armorguard", country: "New Zealand" }];

        cy.server()
          .route({
            method: "GET",
            url: Cypress.env("host") + endpoints.apiGetCIT,
            response,
            status: 200,
          })
          .as("apiGetCIT");
        cy.get("imo-button").contains("Select").click({ force: true }).wait("@apiGetCIT");
        cy.get("body").toMatchImageSnapshot();

        // Select cits and take a snapshot
        cy.get("[data-test=assigned-cits-table] table tbody")
          .find("tr td:nth-child(1)")
          .each(($td) => {
            cy.wrap($td).within(() => {
              cy.get("input[type=checkbox]").click({ force: true });
            });
          });

        cy.get("imo-button").contains("OK").click();
        cy.get("body").toMatchImageSnapshot();

        // Click select button again and an error is occur
        cy.server()
          .route({
            method: "GET",
            url: Cypress.env("host") + endpoints.apiGetCIT,
            response: { statusCode: 500, message: "error" },
            status: 500,
          })
          .as("apiGetCITError");
        cy.get("imo-button").contains("Select").click({ force: true }).wait("@apiGetCITError");
        cy.get("body").toMatchImageSnapshot();
        cy.get("imo-button").contains("OK").click();

        // click save button
        cy.get("[data-test=type-selection]")
          .contains("Holiday")
          .click()
          .then(() => {
            cy.get("mat-select").parents("body").find("mat-option").eq(0).click({ force: true });
          });

        cy.server()
          .route({
            method: "POST",
            url: Cypress.env("host") + endpoints.apiCalendarSave,
            response: { calendarId: "1" },
            status: 201,
          })
          .as("apiCalendarSavePost");

        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").click({ force: true });
        });

        cy.wait("@apiCalendarSavePost").then(() => {
          cy.get("button").parents("body").find(".mat-simple-snackbar-action button").click();
          cy.get("body").toMatchImageSnapshot();
        });
      });
    });
  });
});
