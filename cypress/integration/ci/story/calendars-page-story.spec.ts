describe("Story-Calendars", () => {
  interface ViewCalendarApiRes {
    sortField: {
      column: string;
      orderBy: string;
    };
    calendars: CalendarItem[];
  }
  interface CalendarItem {
    calendarId: string;
    name: string;
    type: string;
    startDate?: string;
    endDate?: string;
    isEditable?: boolean;
    isDeletable?: boolean;
  }

  interface FilterItems {
    calendarTypes: Array<CalendarType>;
  }

  interface CalendarType {
    id: number;
    type: string;
  }

  let filterItems: FilterItems;
  let calendarTypes: string[] = ["ALL"];
  let viewCalendarApiRes: ViewCalendarApiRes;
  let calendars: CalendarItem[] = [];

  const calendarEndpoints = Cypress.env("calendarEndpoints");

  const startDate = Cypress.moment("2021-01-10");
  const startYearSelect = startDate.format("YYYY");
  const startMonthSelect = startDate.format("MMM").toUpperCase();
  const startMonthNumber = startDate.format("M");
  const startDaySelect = startDate.format("D");

  const endDate = startDate.clone().add(5, "days");
  const endYearSelect = endDate.format("YYYY");
  const endMonthSelect = endDate.format("MMM").toUpperCase();
  const endMonthNumber = endDate.format("M");
  const endDaySelect = endDate.format("D");

  const selectStartDate = () => {
    const date = `${startMonthNumber}/${startDaySelect}/${startYearSelect}`;

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
        cy.get("button")
          .parents("body")
          .find(".mat-calendar")
          .contains(".mat-calendar-body-cell-content", startDaySelect)
          .click()
          .then(() => {
            cy.get("imo-date-picker mat-form-field input").should(($Input) => {
              expect($Input.val()).to.be.eq(date);
            });
          });
      });
  };

  const selectEndDate = () => {
    const date = `${endMonthNumber}/${endDaySelect}/${endYearSelect}`;

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
          .contains(".mat-calendar-body-cell-content", endYearSelect)
          .click();

        // select month after select year
        cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endMonthSelect).click();

        // select day after select month and year
        cy.get("button")
          .parents("body")
          .find(".mat-calendar")
          .contains(".mat-calendar-body-cell-content", endDaySelect)
          .click()
          .then(() => {
            cy.get("imo-date-picker mat-form-field input").should(($Input) => {
              expect($Input.val()).to.be.eq(date);
            });
          });
      });
  };

  context("list of calendar page", () => {
    before(() => {
      const routeForFilters = {
        alias: "GET view-calenders/filter-items",
        method: "GET",
        url: Cypress.env("host") + calendarEndpoints.apiGetFilterItems,
      };

      const route = {
        alias: "GET view-calenders/start",
        method: "GET",
        url: Cypress.env("host") + calendarEndpoints.apiViewCalendars,
      };

      cy.server().route(routeForFilters.method, routeForFilters.url).as(routeForFilters.alias);
      cy.server().route(route.method, route.url).as(route.alias);
      cy.visit(calendarEndpoints.pageCalendars)
        .wait(["@" + routeForFilters.alias, "@" + route.alias])
        .then(([xhrFilter, xhrCalendars]) => {
          filterItems = xhrFilter.responseBody as FilterItems;
          viewCalendarApiRes = xhrCalendars.responseBody as ViewCalendarApiRes;

          calendarTypes = calendarTypes.concat(filterItems.calendarTypes.map((t) => t.type.charAt(0).toUpperCase() + t.type.slice(1)));
          calendars = viewCalendarApiRes.calendars.map((calendar) => ({
            ...calendar,
            id: calendar.calendarId,
            isEditable: true,
            isDeletable: calendar.isDeletable,
          }));
        });
    });

    context("initial display", () => {
      it("page title should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title").should("be.visible").contains("Calendar");
        });
      });

      it("calendar list table header should be displayed", () => {
        const listHeaders = ["Name", "Type", "Start date", "End date", "Actions"];

        cy.get("[data-test=calendars-table] table")
          .should("be.visible")
          .within(() => {
            cy.get("th").each(($th, i) => {
              expect($th).to.contain(listHeaders[i]);
            });
          });
      });

      it("calendar list table should displayed all data", () => {
        if (calendars.length) {
          cy.get(".page-content").within(() => {
            cy.get("imo-table tbody").within(() => {
              cy.get("tr").each(($tr, index) => {
                cy.wrap($tr)
                  .find("td:nth-child(1)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(calendars[index].name);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(2)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(calendars[index].type);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(3)")
                  .should(($td) => {
                    const startDate = calendars[index].startDate ? Cypress.moment(calendars[index].startDate).format("MM/DD/YYYY") : "";
                    expect($td.text().trim()).to.be.eq(startDate);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(4)")
                  .should(($td) => {
                    const endDate = calendars[index].endDate ? Cypress.moment(calendars[index].endDate).format("MM/DD/YYYY") : "";
                    expect($td.text().trim()).to.be.eq(endDate);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(5)")
                  .within(($td) => {
                    if (calendars[index].isDeletable) {
                      cy.wrap($td).get("imo-button:contains(Delete)").should("be.visible");
                    } else {
                      cy.wrap($td).get("imo-button:contains(Delete)").should("not.be.visible");
                    }

                    if (calendars[index].isEditable) {
                      cy.wrap($td).get("imo-button:contains(Edit)").should("be.visible");
                    } else {
                      cy.wrap($td).get("imo-button:contains(Edit)").should("not.be.visible");
                    }
                  });
              });
            });
          });
        } else {
          cy.log("No data to display");
        }
      });

      it("should display Create Calendar button", () => {
        cy.get(".page-content").within(() => {
          cy.root().find("a").contains("Create Calendar").should("be.visible");
        });
      });

      it("should display arrow back button", () => {
        cy.get("imo-calendars-page").within(() => {
          cy.root().find(".page-content .page-header .mat-icon").should("be.visible");
        });
      });

      it("should display calendar filter no argument", () => {
        // Search name
        cy.get("[data-test='search-name'] input").should("have.value", "");
        cy.get("[data-test='search-name'] input").should("have.attr", "placeholder", "Search by name");

        // Type
        cy.get("[data-test='select-type'] mat-select").should("have.attr", "aria-label", "Select Type");
        cy.get("[data-test='select-type'] mat-select-trigger").should("not.be.visible");

        // Start date
        cy.get("[data-test='select-start-date']").within((el) => {
          cy.wrap(el).find("input").should("have.value", "");
        });
        cy.get("[data-test='select-start-date'] input").should("have.attr", "placeholder", "Select date");

        // End date
        cy.get("[data-test='select-end-date']").within((el) => {
          cy.wrap(el).find("input").should("have.value", "");
        });
        cy.get("[data-test='select-end-date'] input").should("have.attr", "placeholder", "Select date");

        // Clear button
        cy.get("[data-test='clear-button']").should("be.visible");

        // Apply button
        cy.get("[data-test='apply-button']").should("be.visible");
      });

      it("should display calendar filter with argument", () => {
        // search name
        const keyword = "calendar";
        cy.get("[data-test='search-name'] input").type(keyword);
        cy.get("[data-test='search-name'] input").should("have.value", keyword);

        // Type
        cy.get("imo-select-multi .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option")
              .should("have.length", calendarTypes.length)
              .each((option, index) => {
                cy.wrap(option).find("span.mat-option-text").should("have.text", calendarTypes[index]);
              });

            calendarTypes.forEach((type, index) => {
              if (index > 0) {
                cy.get(`mat-option:contains(${type})`).click();
              }
            });
          });

        cy.get("body")
          .type(`{esc}`)
          .then(() => {
            cy.get("[data-test='select-type'] mat-select-trigger").should("contain.text", calendarTypes[1]);
            cy.get("[data-test='select-type'] mat-select-trigger span").should("contain.text", `(+${calendarTypes.length - 2} others)`); // -2 because seleted type and "ALL"
          });

        // Start date
        selectStartDate();

        // End date
        selectEndDate();

        // select start date is after the end date
        const newStartDate = endDate.clone().add(1, "day");
        const newStartDaySelect = newStartDate.format("D");
        const newStartMonthNumber = newStartDate.format("M");
        const newStartYearSelect = newStartDate.format("YYYY");

        const newEndDate = newStartDate.clone().add(1, "day");
        const newEndDaySelect = newEndDate.format("D");
        const newEndMonthNumber = newEndDate.format("M");
        const newEndYearSelect = newEndDate.format("YYYY");

        cy.get(".calendar-filter-date")
          .first()
          .within((el) => {
            cy.wrap(el).find("mat-datepicker-toggle button").click();
            cy.get("button")
              .parents("body")
              .find(".mat-calendar")
              // select start date after end date 1 day
              .contains(".mat-calendar-body-cell-content", newStartDaySelect)
              .click()
              .then(() => {
                cy.get("imo-date-picker mat-form-field input")
                  .first()
                  .should(($Input) => {
                    expect($Input.val()).to.be.eq(`${newStartMonthNumber}/${newStartDaySelect}/${newStartYearSelect}`);
                  });
              });
          });

        cy.get(".calendar-filter-date")
          .last()
          .within(() => {
            cy.get("imo-date-picker mat-form-field input")
              .last()
              .should(($input) => {
                // new end date should be after the old end date 2 days
                expect($input.val()).to.be.eq(`${newEndMonthNumber}/${newEndDaySelect}/${newEndYearSelect}`);
              });
          });

        // check limit start of end date should be after the new start date
        cy.get(".calendar-filter-date")
          .last()
          .then((el) => {
            cy.wrap(el).find("mat-datepicker-toggle button").click();

            cy.get(".cdk-overlay-container mat-calendar mat-month-view table")
              .find(`div.mat-calendar-body-cell-content:contains(${newStartDaySelect})`)
              .parent()
              .should("have.attr", "aria-disabled", "true")
              .and("have.class", "mat-calendar-body-disabled");

            // select end date to close the date picker
            cy.get(".cdk-overlay-container mat-calendar mat-month-view table")
              .find(`div.mat-calendar-body-cell-content:contains(${newEndDaySelect})`)
              .first()
              .click();
          });
      });
    });

    context("Filter", () => {
      it("by Name", () => {
        cy.get("[data-test='clear-button']").click();
        const keyword = "calendar";
        cy.get("[data-test='search-name']").type(keyword);
        cy.get("[data-test='apply-button']").click();
        cy.request(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}?name=${keyword}`).then((res) => {
          viewCalendarApiRes = res?.body;
          if (!!viewCalendarApiRes.calendars.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", viewCalendarApiRes.calendars.length);
            viewCalendarApiRes.calendars.forEach((calendar: CalendarItem) => {
              expect(calendar.name).to.include(keyword);
            });
          } else {
            cy.log("No data to display");
          }
        });
      });

      it("by Type", () => {
        cy.get("[data-test='clear-button']").click();

        calendarTypes.forEach((type, index) => {
          cy.get("imo-select-multi .mat-select")
            .click()
            .then(() => {
              cy.get("mat-option")
                .contains(type)
                .click()
                .then(() => {
                  cy.get("body")
                    .type("{esc}")
                    .then(() => {
                      cy.get("[data-test='apply-button']").click();
                      let url =
                        index === 0
                          ? Cypress.env("host") + calendarEndpoints.apiViewCalendars + "?calendarTypeId=1,2,3"
                          : Cypress.env("host") +
                            calendarEndpoints.apiViewCalendars +
                            `?calendarTypeId=${filterItems.calendarTypes[index - 1].id.toString()}`;

                      cy.request(`${url}`).then((res) => {
                        viewCalendarApiRes = res.body as ViewCalendarApiRes;
                        if (!!viewCalendarApiRes.calendars.length) {
                          cy.get("imo-table tbody").find("tr").should("have.length", viewCalendarApiRes.calendars.length);
                          if (index > 0) {
                            const calendars: CalendarItem[] = viewCalendarApiRes.calendars;
                            calendars.forEach((calendar: CalendarItem) => {
                              expect(calendar.type).contain(type.charAt(0).toLowerCase() + type.slice(1));
                            });
                          }
                        } else {
                          cy.log("No data to display");
                        }
                      });
                    });
                });
            });
          cy.get("[data-test='clear-button']").click();
        });
      });

      it("by Start date", () => {
        cy.get("[data-test='clear-button']").click();
        const dateParam = `${startYearSelect}-${startMonthNumber}-${startDaySelect}`;
        const date = `${startMonthNumber}/${startDaySelect}/${startYearSelect}`;

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
            cy.get("button")
              .parents("body")
              .find(".mat-calendar")
              .contains(".mat-calendar-body-cell-content", startDaySelect)
              .click()
              .then(() => {
                cy.get("imo-date-picker mat-form-field input").should(($Input) => {
                  expect($Input.val()).to.be.eq(date);
                });
              });
          });

        cy.get("[data-test='apply-button']").click();
        cy.request(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}?startDate=${dateParam}`).then((res) => {
          viewCalendarApiRes = res?.body as ViewCalendarApiRes;
          if (!!viewCalendarApiRes.calendars.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", viewCalendarApiRes.calendars.length);
          } else {
            cy.log("No data to display");
          }
        });
      });

      it("by End date", () => {
        cy.get("[data-test='clear-button']").click();
        const dateParam = `${endYearSelect}-${endMonthNumber}-${endDaySelect}`;
        const date = `${endMonthNumber}/${endDaySelect}/${endYearSelect}`;

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
              .contains(".mat-calendar-body-cell-content", endYearSelect)
              .click();

            // select month after select year
            cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endMonthSelect).click();

            // select day after select month and year
            cy.get("button")
              .parents("body")
              .find(".mat-calendar")
              .contains(".mat-calendar-body-cell-content", endDaySelect)
              .click()
              .then(() => {
                cy.get("imo-date-picker mat-form-field input").should(($Input) => {
                  expect($Input.val()).to.be.eq(date);
                });
              });
          });

        cy.get("[data-test='apply-button']").click();
        cy.request(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}?endDate=${dateParam}`).then((res) => {
          viewCalendarApiRes = res?.body as ViewCalendarApiRes;
          if (!!viewCalendarApiRes.calendars.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", viewCalendarApiRes.calendars.length);
          } else {
            cy.log("No data to display");
          }
        });
        cy.get("[data-test='clear-button']").click();
      });

      it("by all filters", () => {
        cy.get("[data-test='clear-button']").click();

        // input Name
        const keyword = "calendar";
        cy.get("[data-test='search-name']").type(keyword);

        // select Type: Emergency
        cy.get("imo-select-multi .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option:contains('Emergency')")
              .click()
              .then(() => {
                cy.get("body").type("{esc}");
              });
          });
        const calendarId = filterItems.calendarTypes
          .filter((t) => t.type === "emergency")
          .shift()
          ?.id.toString();

        // select date range
        selectStartDate();
        selectEndDate();

        let url = `${
          Cypress.env("host") + calendarEndpoints.apiViewCalendars
        }?name=${keyword}&calendarTypeId=${calendarId}&startDate=${startDate.format("YYYY-MM-DD")}&endDate=${endDate.format("YYYY-MM-DD")}`;

        cy.get("[data-test='apply-button']").click();
        cy.request(url).then((res) => {
          viewCalendarApiRes = res?.body as ViewCalendarApiRes;
          if (viewCalendarApiRes?.calendars.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", viewCalendarApiRes?.calendars.length);
            viewCalendarApiRes?.calendars.forEach((calendar: CalendarItem) => {
              expect(calendar.name).to.include(keyword);
              expect(calendar.type).to.eq("emergency");
            });
          } else {
            cy.log("No data to display");
          }
        });
      });

      it("click clear button should display the list unfiltered", () => {
        const url = Cypress.env("host") + calendarEndpoints.apiViewCalendars;

        cy.get("[data-test='clear-button']").click();
        cy.request(url).then((res) => {
          viewCalendarApiRes = res?.body as ViewCalendarApiRes;
          if (viewCalendarApiRes.calendars.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", viewCalendarApiRes.calendars.length);
          } else {
            cy.log("No data to display");
          }
        });

        // check display of filters
        // Search name
        cy.get("[data-test='search-name'] input").should("have.value", "");
        cy.get("[data-test='search-name'] input").should("have.attr", "placeholder", "Search by name");

        // Type
        cy.get("[data-test='select-type'] mat-select").should("have.attr", "aria-label", "Select Type");
        cy.get("[data-test='select-type'] mat-select-trigger").should("not.be.visible");

        // Start date
        cy.get("[data-test='select-start-date']").within((el) => {
          cy.wrap(el).find("input").should("have.value", "");
        });
        cy.get("[data-test='select-start-date'] input").should("have.attr", "placeholder", "Select date");

        // End date
        cy.get("[data-test='select-end-date']").within((el) => {
          cy.wrap(el).find("input").should("have.value", "");
        });
        cy.get("[data-test='select-end-date'] input").should("have.attr", "placeholder", "Select date");
      });
    });

    context("Sorting operations", () => {
      const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
      const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";
      const defaultImg = "assets/img/icons/arrows-alt-v-solid.svg";
      const sortColumns = [
        {
          key: "Name",
          name: "name",
        },
        {
          key: "Type",
          name: "type",
        },
        {
          key: "Start date",
          name: "startDate",
        },
        {
          key: "End date",
          name: "endDate",
        },
      ];

      const keyCalendar = ["Name", "Type", "Start date", "End date"];

      sortColumns.forEach(({ key, name }) => {
        if (name != "name") {
          // sort ASC
          it(`Click ${key} to set ascending calendar`, () => {
            cy.get(`imo-table table thead tr th`).within(($el) => {
              cy.server()
                .route(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}?sortColumn=${name}&sort=asc`)
                .as("apiSortAsc");

              cy.wrap($el)
                .contains(key)
                .click()
                .then(($el) => {
                  cy.wait("@apiSortAsc").then((res) => {
                    viewCalendarApiRes = res?.responseBody as ViewCalendarApiRes;
                    const body: CalendarItem[] = viewCalendarApiRes?.calendars;
                    cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
                    if (body.length) {
                      keyCalendar.forEach((value, index) => {
                        switch (value) {
                          case "Name":
                            cy.wrap($el)
                              .parents("imo-table")
                              .find(`tbody tr:eq(0) td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body[0].name);
                            break;
                          case "Type":
                            cy.wrap($el)
                              .parents("imo-table")
                              .find(`tbody tr:eq(0) td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body[0].type);
                            break;
                          case "Start date":
                            const startDate = body[0].startDate ? Cypress.moment(body[0].startDate).format("MM/DD/YYYY") : "";
                            cy.wrap($el)
                              .parents("imo-table")
                              .find(`tbody tr:eq(0) td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", startDate);
                            break;
                          case "End date":
                            const endDate = body[0].endDate ? Cypress.moment(body[0].endDate).format("MM/DD/YYYY") : "";
                            cy.wrap($el)
                              .parents("imo-table")
                              .find(`tbody tr:eq(0) td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", endDate);
                          default:
                            break;
                        }
                      });
                    } else {
                      cy.log("No data to display");
                    }
                  });
                });
            });
          });
        }
        // sort DESC
        it(`Click ${key} to set descending calendar`, () => {
          cy.get(`imo-table table thead tr th`).within(($el) => {
            cy.server()
              .route(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}?sortColumn=${name}&sort=desc`)
              .as("apiSortDesc");

            cy.wrap($el)
              .contains(key)
              .click()
              .then(($el) => {
                cy.wait("@apiSortDesc").then((res) => {
                  viewCalendarApiRes = res?.responseBody as ViewCalendarApiRes;
                  const body: CalendarItem[] = viewCalendarApiRes?.calendars;
                  cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", downImg);
                  if (body.length) {
                    keyCalendar.forEach((value, index) => {
                      switch (value) {
                        case "Name":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].name);
                          break;
                        case "Type":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].type);
                          break;
                        case "Start date":
                          const startDate = body[0].startDate ? Cypress.moment(body[0].startDate).format("MM/DD/YYYY") : "";
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", startDate);
                          break;
                        case "End date":
                          const endDate = body[0].endDate ? Cypress.moment(body[0].endDate).format("MM/DD/YYYY") : "";
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", endDate);
                          break;
                        default:
                          break;
                      }
                    });
                  } else {
                    cy.log("No data to display");
                  }
                });
              });
          });
        });

        // sort Default
        it(`Click ${key} to set default calendar`, () => {
          cy.get(`imo-table table thead tr th`).within(($el) => {
            cy.server()
              .route(`${Cypress.env("host") + calendarEndpoints.apiViewCalendars}`)
              .as("apiCalendarsStart");

            cy.wrap($el)
              .contains(key)
              .click()
              .then(($el) => {
                cy.wait("@apiCalendarsStart").then((res) => {
                  viewCalendarApiRes = res?.responseBody as ViewCalendarApiRes;
                  const body: CalendarItem[] = viewCalendarApiRes?.calendars;
                  if (name != "name") {
                    cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", defaultImg);
                  } else {
                    cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
                  }
                  if (body.length) {
                    keyCalendar.forEach((value, index) => {
                      switch (value) {
                        case "Name":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].name);
                          break;
                        case "Type":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].type);
                          break;
                        case "Start date":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].startDate ? Cypress.moment(body[0].startDate, "YYYY-MM-DD").format("MM/DD/YYYY") : "");
                          break;
                        case "End date":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].endDate ? Cypress.moment(body[0].endDate, "YYYY-MM-DD").format("MM/DD/YYYY") : "");
                          break;
                        default:
                          break;
                      }
                    });
                  } else {
                    cy.log("No data to display");
                  }
                });
              });
          });
        });
      });
    });

    context("Combination of filter and sort", () => {
      const keyword = "calendar";

      it("should display a list with name filtered", () => {
        // input Name
        cy.get("[data-test='search-name']").type(keyword);

        const routeForFilter = {
          alias: `GET view-calenders/start?name=${keyword}`,
          method: "GET",
          url: `${Cypress.env("host") + calendarEndpoints.apiViewCalendars}?name=${keyword}&sortColumn=name&sort=asc`,
        };
        cy.server().route(routeForFilter.method, routeForFilter.url).as(routeForFilter.alias);

        cy.get("[data-test='apply-button']").click();
        cy.wait("@" + routeForFilter.alias).then((xhr) => {
          const res = xhr?.responseBody as ViewCalendarApiRes;
          if (res.calendars.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", res.calendars.length);
            res.calendars.forEach((calendar: CalendarItem) => {
              expect(calendar.name).to.include(keyword);
            });
          } else {
            cy.log("No data to display");
          }
        });
      });

      it("should display a list with name filtered and start date sorted", () => {
        // sort start date ASC
        const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
        const sortColumn = [
          {
            key: "Start date",
            name: "startDate",
          },
        ];

        const keyCalendar = ["Name", "Type", "Start date", "End date"];

        sortColumn.forEach(({ key, name }) => {
          cy.get(`imo-table table thead tr th`).within(($el) => {
            const routeForSort = {
              alias: `GET view-calenders/start?name=${keyword}&sortColumn=${name}&sort=asc`,
              method: "GET",
              url: `${Cypress.env("host") + calendarEndpoints.apiViewCalendars}?name=${keyword}&sortColumn=${name}&sort=asc`,
            };
            cy.server().route(routeForSort.method, routeForSort.url).as(routeForSort.alias);

            cy.wrap($el)
              .contains(key)
              .click()
              .then(($el) => {
                cy.wait("@" + routeForSort.alias).then((res) => {
                  viewCalendarApiRes = res?.responseBody as ViewCalendarApiRes;
                  const body = viewCalendarApiRes.calendars;
                  cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
                  if (body.length) {
                    keyCalendar.forEach((value, index) => {
                      switch (value) {
                        case "Name":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].name);
                          break;
                        case "Type":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].type);
                          break;
                        case "Start date":
                          const startDate = body[0].startDate ? Cypress.moment(body[0].startDate).format("MM/DD/YYYY") : "";
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", startDate);
                          break;
                        case "End date":
                          const endDate = body[0].endDate ? Cypress.moment(body[0].endDate).format("MM/DD/YYYY") : "";
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", endDate);
                        default:
                          break;
                      }
                    });
                  } else {
                    cy.log("No data to display");
                  }
                });
              });
          });
        });
      });
    });

    context("click buttons", () => {
      it("should go to create calendar page when click create calendar button and keep filter,sorting when back to calendars page", () => {
        const input = "calendar";
        const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";

        // input Name
        cy.get("[data-test=search-name]").within(() => {
          cy.get("input").type("{selectall}{backspace}").type(input);
        });

        // select Type
        cy.get("imo-select-multi .mat-select")
          .click()
          .then(() => {
            cy.get("mat-option:contains('Holiday')")
              .click()
              .then(() => {
                cy.get("body").type("{esc}");
              });
          });

        // pick date range
        selectStartDate();
        selectEndDate();

        cy.get("[data-test='apply-button']").click();

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.server()
            .route(
              "GET",
              `${
                Cypress.env("host") + calendarEndpoints.apiViewCalendars
              }?name=calendar&calendarTypeId=2&startDate=2021-01-10&endDate=2021-01-15&sortColumn=name&sort=asc`,
            )
            .as("apiSortAsc");

          cy.wrap($el)
            .contains("Name")
            .click()
            .then(($el) => {
              cy.wait("@apiSortAsc").then(() => {
                cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
              });
            });
        });

        cy.get(".page-content").find("a").contains("Create Calendar").click({ force: true });
        cy.url().should("include", calendarEndpoints.pageCreateCalendar);

        // confirm filter and sort should be keeped when back to calendars page
        cy.get("button.back-arrow").click({ force: true });
        cy.wait("@apiSortAsc");

        // check value of Name
        cy.get("[data-test=search-name]").within(() => {
          cy.get("input").should(($Input) => {
            expect($Input.val()).to.be.eq(input);
          });
        });

        // check value of Type
        cy.get("[data-test='select-type'] mat-select-trigger").should("contain.text", "Holiday");

        // check value of start date
        cy.get("imo-date-picker mat-form-field input")
          .first()
          .should(($Input) => {
            expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDaySelect}/${startYearSelect}`);
          });

        // check value of end date
        cy.get("imo-date-picker mat-form-field input")
          .last()
          .should(($Input) => {
            expect($Input.val()).to.be.eq(`${endMonthNumber}/${endDaySelect}/${endYearSelect}`);
          });

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el)
            .contains("Name")
            .then(($el) => {
              cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
            });
        });
      });

      it("should go to sample page when click arrow back button and keep filter, sorting when back calendars page", () => {
        const input = "calendar";
        const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";

        // input new value of Name but no click Apply button, should remain old value "calendar"
        cy.get("[data-test=search-name]").within(() => {
          cy.get("input").type("{selectall}{backspace}").type("Test searching");
        });

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.server()
            .route(
              "GET",
              `${
                Cypress.env("host") + calendarEndpoints.apiViewCalendars
              }?name=calendar&calendarTypeId=2&startDate=2021-01-10&endDate=2021-01-15&sortColumn=type&sort=desc`,
            )
            .as("apiSortDesc");

          cy.wrap($el)
            .contains("Type")
            .click()
            .click()
            .then(($el) => {
              cy.wait("@apiSortDesc");
              cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", downImg);
            });
        });

        cy.get("imo-calendars-page").find(".page-header button mat-icon").click({ force: true });
        cy.url().should("not.contain", calendarEndpoints.pageCalendars);

        // confirm filter and sort should keeping when back calendars page
        cy.get("imo-sample a").contains("Calendar").click({ force: true });
        cy.wait("@apiSortDesc");

        // check input value of Name
        cy.get("[data-test=search-name]").within(() => {
          cy.get("input").should(($Input) => {
            expect($Input.val()).to.be.eq(input);
          });
        });

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el)
            .contains("Type")
            .then(($el) => {
              cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", downImg);
            });
        });
      });
    });

    context("click delete button", () => {
      before(() => {
        const routeForFilters = {
          alias: "GET view-calenders/filter-items",
          method: "GET",
          url: Cypress.env("host") + calendarEndpoints.apiGetFilterItems,
        };

        const route = {
          alias: "GET view-calenders/start",
          method: "GET",
          url: Cypress.env("host") + calendarEndpoints.apiViewCalendars,
        };

        cy.server().route(routeForFilters.method, routeForFilters.url).as(routeForFilters.alias);
        cy.server().route(route.method, route.url).as(route.alias);
        cy.visit(calendarEndpoints.pageCalendars)
          .wait(["@" + routeForFilters.alias, "@" + route.alias])
          .then(([xhrFilter, xhrCalendars]) => {
            filterItems = xhrFilter.responseBody as FilterItems;
            viewCalendarApiRes = xhrCalendars.responseBody as ViewCalendarApiRes;
            calendars = viewCalendarApiRes.calendars;

            calendarTypes = calendarTypes.concat(filterItems.calendarTypes.map((t) => t.type.charAt(0).toUpperCase() + t.type.slice(1)));
            calendars = calendars.map((calendar) => ({
              ...calendar,
              id: calendar.calendarId,
              isEditable: true,
              isDeletable: calendar.isDeletable,
            }));
          });
      });

      it("should display Delete Confirmation Dialog and click cancel button.", () => {
        const filteredCalendars = Cypress._.findIndex(calendars, { isDeletable: true });
        cy.get(".page-content").within(() => {
          cy.get("imo-table tbody").within(() => {
            cy.get("tr").each(($tr, index) => {
              if (index === filteredCalendars) {
                cy.wrap($tr)
                  .find("td:nth-child(5)")
                  .within(($td) => {
                    cy.wrap($td)
                      .get("imo-button")
                      .contains("Delete")
                      .should("be.visible")
                      .click()
                      .then(() => {
                        cy.root()
                          .parents("body")
                          .find("imo-alert")
                          .within(() => {
                            // Confirm dialog content
                            cy.get(".description").contains("Are you sure you want to delete?");
                            cy.get(".confirm").contains("Delete").should("be.visible");
                            cy.get(".cancel").contains("Cancel").should("be.visible").click();
                          });
                      });
                  });
                return false;
              }
            });
          });
        });
      });

      it("should display Delete Confirmation Dialog and click delete button", () => {
        cy.request("GET", Cypress.env("host") + calendarEndpoints.apiViewCalendars).then((xhr) => {
          const oldList = xhr.body as unknown[];
          const filteredCalendars = Cypress._.findIndex(oldList, { isDeletable: true });

          cy.get(".page-content").within(() => {
            cy.get("imo-table tbody").within(() => {
              cy.get("tr").each(($tr, index) => {
                if (index === filteredCalendars) {
                  cy.wrap($tr)
                    .find("td:nth-child(5)")
                    .within(($td) => {
                      cy.wrap($td)
                        .get("imo-button")
                        .contains("Delete")
                        .should("be.visible")
                        .click()
                        .then(() => {
                          cy.server()
                            .route("GET", Cypress.env("host") + calendarEndpoints.apiViewCalendars)
                            .as("apiViewCalendars");
                          cy.root()
                            .parents("body")
                            .find("imo-alert")
                            .within(() => {
                              // Confirm dialog content
                              cy.get(".description").contains("Are you sure you want to delete?");
                              cy.get(".cancel").contains("Cancel").should("be.visible");
                              cy.get(".confirm").contains("Delete").should("be.visible").click();
                            });
                        });

                      // Confirm data row should be delete in table
                      cy.wait("@apiViewCalendars").then((viewReponse) => {
                        const newLength = (viewReponse.responseBody as Array<any>).length;
                        expect(newLength).to.be.eq(oldList.length - 1);
                      });
                    });
                  return false;
                }
              });
            });
          });
        });
      });
    });

    context("click edit button", () => {
      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + calendarEndpoints.apiViewCalendars)
          .as("apiViewCalendars");
        cy.visit(calendarEndpoints.pageCalendars)
          .wait("@apiViewCalendars")
          .then(({ responseBody }) => {
            const res = responseBody;
            if (Array.isArray(res)) {
              calendars = res.map((calendar) => ({
                ...calendar,
                id: calendar.calendarId,
                isEditable: true,
                isDeletable: false,
              }));
            }
          });
      });

      it("should go to edit calendars page", () => {
        const filteredCalendars = Cypress._.findIndex(calendars, { isEditable: true });
        cy.get(".page-content imo-table tbody").within(() => {
          cy.get("imo-button").contains("Edit").first().click({ force: true });
          cy.url().should("include", calendarEndpoints.pageEditCalendar.replace(":id", `${calendars[filteredCalendars].calendarId}`));
        });
      });
    });
  });
});
