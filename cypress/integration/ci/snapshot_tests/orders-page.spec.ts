describe("Snapshot-testing: Orders Page", () => {
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
      it(`Case: Orders`, () => {
        cy.viewport(viewport.x, viewport.y);

        // visit Orders page with mock data and take a snapshot
        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiViewOrders"), `fx:orders/orders`)
          .as("apiViewOrders");
        cy.visit(Cypress.env("pageOrders")).wait("@apiViewOrders");

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // filter by order number and take a snapshot
        const keyword = "1";
        cy.server()
          .route(`${Cypress.env("host") + Cypress.env("apiViewOrders")}*`, `fx:orders/filter-orders-by-orderNumber`)
          .as("apiFilter");

        // select status
        cy.get("[data-test=filter-item] > label")
          .contains("Status")
          .parent()
          .find("imo-select-multi .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option")
              .first()
              .click()
              .then(() => {
                cy.get("body").type("{esc}");
              });
          });

        // input value for Order number
        cy.get("[data-test=filter-item] > label")
          .contains("Order Number")
          .next()
          .find("input")
          .type("{selectall}{backspace}")
          .type(keyword);

        // select CIT
        cy.get("[data-test=filter-item] > label")
          .contains("CIT")
          .parent()
          .find("imo-select .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option")
              .last()
              .click()
              .then(() => {
                cy.get("body").click();
              });
          });

        // select Organisation
        cy.get("[data-test=filter-item] > label")
          .contains("Organisation")
          .parent()
          .find("imo-select .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option")
              .last()
              .click()
              .then(() => {
                cy.get("body").click();
              });
          });

        // select Location
        cy.get("[data-test=filter-item] > label")
          .contains("Location")
          .parent()
          .find("imo-select .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option")
              .last()
              .click()
              .then(() => {
                cy.get("body").click();
              });
          });

        // select Placed date
        const startDate = Cypress.moment("2021-01-20");
        const startYearSelect = startDate.format("YYYY");
        const startMonthSelect = startDate.format("MMM").toUpperCase();
        const startDaySelect = startDate.format("D");
        const endDaySelect = startDate.clone().add(1, "day").format("D");
        cy.get("[data-test=filter-item] > label")
          .contains("Placed date")
          .parent()
          .find(".date-range-input > imo-date-picker")
          .each(($datepicker, index) => {
            cy.wrap($datepicker).within(() => {
              cy.get("mat-datepicker-toggle button").click();
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
              cy.get("button")
                .parents("body")
                .find(".mat-calendar")
                .contains(".mat-calendar-body-cell-content", index ? endDaySelect : startDaySelect)
                .click();
            });
          });

        // select Service date
        cy.get("[data-test=filter-item] > label")
          .contains("Service date")
          .parent()
          .find(".date-range-input > imo-date-picker")
          .each(($datepicker, index) => {
            cy.wrap($datepicker).within(() => {
              cy.get("mat-datepicker-toggle button").click();
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
              cy.get("button")
                .parents("body")
                .find(".mat-calendar")
                .contains(".mat-calendar-body-cell-content", index ? endDaySelect : startDaySelect)
                .click();
            });
          });

        // click Apply button
        cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });
        cy.wait("@apiFilter");

        cy.get("body").toMatchImageSnapshot();

        // Click Checkbox Display only Emergency
        cy.get("[data-test=clear-button]").click();
        cy.get("imo-checkbox-list .mat-checkbox-inner-container").click({ force: true });
        cy.server()
          .route(
            `${Cypress.env("host") + Cypress.env("apiViewOrders")}?sortColumn=placeDate&sort=desc&isEmergency=true`,
            `fx:orders/filter-order-by-emergency`,
          )
          .as("apiFilterEmergency");
        cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });
        cy.wait("@apiFilterEmergency");
        cy.get("body").toMatchImageSnapshot();

        // sort by status ASC and take a snapshot
        cy.get("[data-test=clear-button]").click();
        cy.server()
          .route(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?sortColumn=status&sort=asc`, `fx:orders/sort-by-status-asc`)
          .as("apiSort");

        // click sort status column
        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el).contains("Status").click();
          cy.wait("@apiSort");
        });
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
