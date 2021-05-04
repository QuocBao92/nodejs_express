describe("Story-Edit Calendar", () => {
  interface InitialCalendar {
    name: string;
    calendarType: Array<{
      default: boolean;
      id: number;
      name: string;
    }>;
    description: string;
    startDate: string;
    endDate: string;
    schedule: {
      pattern: {
        repeat: {
          default: string;
          daily: {
            default: string;
            onlyCitWorkingDays: Record<string, unknown>;
            onlyEveryXDays: {
              interval: number;
              isIncludeCitWorkingDays: boolean;
              recurrencePolicy: {
                items: Array<string>;
                default: string;
              };
            };
          };
          weekly: {
            interval: number;
            daysOfWeekSelection: {
              monday: boolean;
              tuesday: boolean;
              wednesday: boolean;
              thursday: boolean;
              friday: boolean;
              saturday: boolean;
              sunday: boolean;
            };
          };
          monthly: {
            default: string;
            repeatOnDayOfWeek: {
              weekNumber: Array<{
                default: boolean;
                name: string;
              }>;
              dayOfWeek: Array<{
                default: boolean;
                name: string;
              }>;
              interval: number;
            };
            repeatOnDayOfNumber: {
              dayNumber: number;
              interval: number;
              isIncludeCitWorkingDays: boolean;
              recurrencePolicy: {
                items: Array<string>;
                default: string;
              };
            };
          };
        };
        leadDays: {
          monday: number;
          tuesday: number;
          wednesday: number;
          thursday: number;
          friday: number;
          saturday: number;
          sunday: number;
        };
      };
      holiday: Holiday[];
    };
  }

  interface Holiday {
    name: string;
    date: string;
    orderOffset: number;
    serviceOffset: number;
    isSkippable: boolean;
  }

  interface SetValue {
    name: string;
    calendarType: string;
    description: string;
    startDate: string;
    endDate: string;
    cits: { [key: string]: any }[];
    schedule: {
      pattern: {
        repeat: {
          daily: {
            onlyCitWorkingDays?: Record<string, unknown>;
            onlyEveryXDays?: {
              interval: number;
              isIncludeCitWorkingDays: boolean;
              recurrencePolicy: string;
            };
          };
          weekly: {
            interval: number;
            daysOfWeekSelection: {
              monday: boolean;
              tuesday: boolean;
              wednesday: boolean;
              thursday: boolean;
              friday: boolean;
              saturday: boolean;
              sunday: boolean;
            };
          };
          monthly: {
            repeatOnDayOfWeek?: {
              weekNumber: string;
              dayOfWeek: string;
              interval: number;
            };
            repeatOnDayOfNumber?: {
              dayNumber: number;
              interval: number;
              isIncludeCitWorkingDays: boolean;
              recurrencePolicy: string;
            };
          };
        };
        leadDays: {
          monday: number;
          tuesday: number;
          wednesday: number;
          thursday: number;
          friday: number;
          saturday: number;
          sunday: number;
        };
      };
      holiday: Holiday[];
    };
  }

  interface GetEditCalendar {
    initialValue: InitialCalendar;
    setValue: SetValue;
  }

  interface CalendarCIT {
    citId: string;
    citName: string;
    citCountry: string;
  }

  const endpoints = Cypress.env("calendarEndpoints");
  let calendarData: GetEditCalendar;

  const visitEditCalendarPage = () => {
    cy.server()
      .route("GET", Cypress.env("host") + endpoints.apiEditCalendar.replace(":id", "*"))
      .as("apiEditCalendar");

    cy.server()
      .route("GET", Cypress.env("host") + endpoints.apiViewCalendars)
      .as("apiViewCalendars");

    cy.visit(endpoints.pageCalendars)
      .wait("@apiViewCalendars")
      .then(() => {
        cy.get("imo-button:contains(Edit)").first().click();
        cy.wait("@apiEditCalendar").then((xhr) => {
          calendarData = xhr.responseBody as GetEditCalendar;
        });
      });
  };

  const confirmDailyDisplay = () => {
    const dailySelected = Object.keys(calendarData.setValue.schedule.pattern.repeat.daily)[0];
    const onlyEveryXDaysValue = calendarData.setValue.schedule.pattern.repeat.daily.onlyEveryXDays;

    // Check radio selected
    cy.get("[data-test=pattern-daily-repeat]").within(() => {
      cy.get("mat-radio-group mat-radio-button").within(($radio) => {
        if (dailySelected === "onlyCitWorkingDays") {
          cy.wrap($radio).get("input[type=radio]").eq(0).should("be.checked");
          cy.wrap($radio).get("input[type=radio]").eq(1).should("not.be.checked");
        } else {
          cy.wrap($radio).get("input[type=radio]").eq(0).should("not.be.checked");
          cy.wrap($radio).get("input[type=radio]").eq(1).should("be.checked");

          // confirm value interval
          cy.get("mat-form-field input[type=text]").should("have.value", onlyEveryXDaysValue?.interval);

          // confirm recurrence
          if (onlyEveryXDaysValue?.recurrencePolicy === "moveNext") {
            cy.wrap($radio).get("input[type=radio]").eq(2).should("be.checked");
          } else if (onlyEveryXDaysValue?.recurrencePolicy === "movePrevious") {
            cy.wrap($radio).get("input[type=radio]").eq(3).should("be.checked");
          } else {
            cy.wrap($radio).get("input[type=radio]").eq(4).should("be.checked");
          }
        }
      });

      // confirm is include cit working day
      if (dailySelected === "onlyEveryXDays") {
        if (onlyEveryXDaysValue?.isIncludeCitWorkingDays) {
          cy.get("mat-checkbox input[type=checkbox]").should("be.checked");
        } else {
          cy.get("mat-checkbox input[type=checkbox]").should("not.be.checked");
        }
      }

      // confirm lead days
      const dayOfWeeks: string[] = Object.keys(calendarData.setValue.schedule.pattern.leadDays);
      const leadDays: number[] = _.toArray(calendarData.setValue.schedule.pattern.leadDays);
      cy.get("imo-lead-days imo-working-day").each(($el, index) => {
        cy.wrap($el).within(() => {
          const day = dayOfWeeks[index]?.charAt(0).toUpperCase().concat(dayOfWeeks[index]?.slice(1));

          cy.get("label > span").should("have.text", day);
          cy.get("imo-form input[type=text]").should("be.visible").should("have.value", leadDays[index]);
        });
      });
    });
  };

  const confirmWeeklyDisplay = () => {
    const frequencyValue = calendarData.setValue.schedule.pattern.repeat.weekly.interval;

    cy.get('input[name="frequency"]')
      .invoke("val")
      .then(($frequency) => {
        expect(Number($frequency)).to.eq(frequencyValue);
      });

    const dayOfWeeks: string[] = Object.keys(calendarData.setValue.schedule.pattern.leadDays);
    const isCITWorkingDayOfWeeks: boolean[] = _.toArray(calendarData.setValue.schedule.pattern.repeat.weekly.daysOfWeekSelection);
    const leadDays: number[] = _.toArray(calendarData.setValue.schedule.pattern.leadDays);

    cy.get("[data-test=pattern-weekly-repeat] imo-lead-days imo-working-day").each(($el, index) => {
      // confirm checkboxes
      if (isCITWorkingDayOfWeeks[index]) {
        cy.wrap($el).find("input[type='checkbox']").should("be.checked");
      } else {
        cy.wrap($el).find("input[type='checkbox']").should("not.be.checked");
      }

      // confirm labels
      cy.wrap($el).find("span[class='label']").contains(dayOfWeeks[index], { matchCase: false });

      // confirm inputs
      cy.wrap($el).within(() => {
        cy.get("imo-form input[type=text]").should("have.value", leadDays[index]);
      });
    });
  };

  const confirmMonthlyDisplay = () => {
    const monthlySelected = Object.keys(calendarData.setValue.schedule.pattern.repeat.monthly)[0];
    const isIncludeCITWorkingDay = calendarData.setValue.schedule.pattern.repeat.monthly.repeatOnDayOfNumber?.isIncludeCitWorkingDays;
    cy.get("[data-test=pattern-monthly-repeat]").within(() => {
      cy.get("mat-radio-group mat-radio-button").within(($radio) => {
        if (monthlySelected === "repeatOnDayOfWeek") {
          const weekNumber = calendarData.setValue.schedule.pattern.repeat.monthly.repeatOnDayOfWeek?.weekNumber;
          const weekNumberValue = weekNumber?.charAt(0).toUpperCase().concat(weekNumber?.slice(1));
          const dayOfWeek = calendarData.setValue.schedule.pattern.repeat.monthly.repeatOnDayOfWeek?.dayOfWeek;
          const dayOfWeekValue = dayOfWeek?.charAt(0).toUpperCase().concat(dayOfWeek?.slice(1));
          const interval = calendarData.setValue.schedule.pattern.repeat.monthly.repeatOnDayOfWeek?.interval;

          cy.wrap($radio).get("input[type=radio]").eq(0).should("be.checked");
          cy.wrap($radio).get("input[type=radio]").eq(1).should("not.be.checked");

          cy.wrap($radio)
            .parents(".repeat-options")
            .within(() => {
              // confirm value of repeat on day of week
              cy.root().get("imo-select").eq(0).should("be.visible").and("have.text", weekNumberValue);

              cy.root().get("imo-select").eq(1).should("be.visible").and("have.text", dayOfWeekValue);

              cy.root().get("imo-form input[type=text]").eq(0).should("be.visible").and("have.value", interval);
            });
        } else {
          const dayNumber = calendarData.setValue.schedule.pattern.repeat.monthly.repeatOnDayOfNumber?.dayNumber;
          const interval = calendarData.setValue.schedule.pattern.repeat.monthly.repeatOnDayOfNumber?.interval;
          const recurrencePolicy = calendarData.setValue.schedule.pattern.repeat.monthly.repeatOnDayOfNumber?.recurrencePolicy;

          cy.wrap($radio).get("input[type=radio]").eq(0).should("not.be.checked");
          cy.wrap($radio).get("input[type=radio]").eq(1).should("be.checked");

          cy.wrap($radio)
            .parents(".repeat-options")
            .within(() => {
              // confirm value of repeat on day of number
              cy.root().get("imo-form input[type=text]").eq(1).should("be.visible").and("have.value", dayNumber);

              cy.root().get("imo-form input[type=text]").eq(2).should("be.visible").and("have.value", interval);
            });

          // confirm recurrence
          if (recurrencePolicy === "moveNext") {
            cy.wrap($radio).get("input[type=radio]").eq(2).should("be.checked");
          } else if (recurrencePolicy === "movePrevious") {
            cy.wrap($radio).get("input[type=radio]").eq(3).should("be.checked");
          } else {
            cy.wrap($radio).get("input[type=radio]").eq(4).should("be.checked");
          }
        }
      });

      // confirm is include cit working day
      if (monthlySelected === "repeatOnDayOfNumber") {
        if (isIncludeCITWorkingDay) {
          cy.get(".include-working-day").get("mat-checkbox input[type=checkbox]").should("be.checked");
        } else {
          cy.get(".include-working-day").get("mat-checkbox input[type=checkbox]").should("not.be.checked");
        }
      }
    });
  };

  const confirmTypeNameDescription = () => {
    //page title should be displayed name of calendar
    cy.get(".page-content").within(() => {
      cy.get(".page-title")
        .should("be.visible")
        .contains(calendarData.setValue.name || calendarData.initialValue.name);
    });

    // type select box should be displayed type of calendar
    const defaultType = calendarData.setValue.calendarType;

    const capitalizedType = defaultType?.charAt(0).toUpperCase().concat(defaultType?.slice(1));
    cy.get("[data-test=type-selection]").within(() => {
      cy.get(".mat-select-value-text").should("have.text", capitalizedType);
      cy.root().get("mat-select").should("have.class", "mat-select-disabled");
    });

    // name input should be displayed name of calendar
    cy.get(".page-content .row").within(() => {
      cy.get("[data-test=input-form]")
        .find("[name=Name]")
        .then(($input) => {
          cy.wrap($input).should("have.value", calendarData.setValue.name || calendarData.initialValue.name);
        });
    });

    // description textarea should be displayed description of calendar
    cy.get(".page-content .row").within(() => {
      cy.get("[data-test=input-form]")
        .find("[name=Description]")
        .then(($textarea) => {
          cy.wrap($textarea).should("have.value", calendarData.setValue.description || calendarData.initialValue.description);
        });
    });
  };

  const confirmHolidaysDetailTable = () => {
    // check headers
    const listHeaders = ["", "Name", "Date", "Day", "Skip", "Order Offset", "Service Offset", "Actions", ""];

    cy.get("[data-test=calendar-holidays-table] table")
      .should("be.visible")
      .within(() => {
        cy.get("th").each(($th, i) => {
          expect($th).to.contain(listHeaders[i]);
        });
      });

    // check data display
    const holidaysData = calendarData.setValue.schedule.holiday;
    if (holidaysData.length) {
      cy.get("[data-test=calendar-holidays-table] table tbody").within(() => {
        // check row
        cy.get("tr").should("have.length", holidaysData.length);

        cy.get("tr").each(($tr, index) => {
          // check name
          cy.wrap($tr)
            .find("td:nth-child(2)")
            .within(($td) => {
              cy.wrap($td)
                .get("input[type=text]")
                .should(($val) => {
                  const name = holidaysData[index].name ? holidaysData[index].name : "";
                  expect($val.val()).to.be.eq(name);
                });
            });

          // check date
          cy.wrap($tr)
            .find("td:nth-child(3)")
            .within(($el) => {
              cy.wrap($el)
                .get("[data-test=date-picker]")
                .should(($td) => {
                  const date = holidaysData[index].date
                    ? Cypress.moment(holidaysData[index].date).format("M-D-YYYY").replace(/-/g, "/")
                    : "";
                  expect($td.val()).to.be.eq(date);
                });
            });

          // check day of week
          cy.wrap($tr)
            .find("td:nth-child(4)")
            .within(($td) => {
              const day = Cypress.moment(holidaysData[index].date).format("dddd");
              expect($td.text().trim()).to.be.eq(day);
            });

          // check skip checkbox
          cy.wrap($tr)
            .find("td:nth-child(5)")
            .within(($td) => {
              const isSkippable = holidaysData[index].isSkippable;
              cy.wrap($td)
                .get("mat-checkbox input[type=checkbox]")
                .should((checkbox) => {
                  expect(checkbox.prop("checked")).to.be.eq(isSkippable);
                });
            });

          // check order offset
          cy.wrap($tr)
            .find("td:nth-child(6)")
            .within(($td) => {
              const orderOffset = !isNaN(holidaysData[index].orderOffset) ? holidaysData[index].orderOffset.toString() : "";
              cy.wrap($td)
                .get("input[type=text]")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq(orderOffset);
                });
            });

          // check service offset
          cy.wrap($tr)
            .find("td:nth-child(7)")
            .within(($td) => {
              const serviceOffset = !isNaN(holidaysData[index].serviceOffset) ? holidaysData[index].serviceOffset.toString() : "";
              cy.wrap($td)
                .get("input[type=text]")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq(serviceOffset);
                });
            });

          // check delete button
          cy.wrap($tr)
            .find("td:nth-child(8)")
            .within(($td) => {
              cy.wrap($td).get("imo-button:contains(Delete)").should("be.visible");
            });
        });
      });
    } else {
      cy.log("No data calendar holiday to display");
    }
  };

  const confirmCITAssigned = () => {
    const listHeadersCIT = ["CIT Name", "Country"];
    const cits: CalendarCIT[] = calendarData.setValue.cits.map((cit) => ({ citId: cit.citId, citName: cit.name, citCountry: cit.country }));
    if (!!cits.length) {
      cy.get("[data-test=calendar-assigned-cits").within(() => {
        // confirm label
        cy.get(".label").should("be.visible").and("have.text", "CIT");

        // confirm button
        cy.get("imo-button button").contains("Select").should("be.visible");

        // confirm header assigned-cits-table
        cy.get("table")
          .should("be.visible")
          .within(() => {
            cy.get("th").each(($th, i) => {
              expect($th).to.contain(listHeadersCIT[i]);
            });
          });

        // confirm data display
        cy.get("table")
          .should("be.visible")
          .within(() => {
            cy.get("tbody > tr").should(($tr) => {
              expect($tr).to.have.length(cits.length);
            });
          });

        cy.get("table tbody")
          .find("tr td:nth-child(1)")
          .each(($td, i) => {
            expect($td.text().trim()).to.be.eq(cits[i].citName);
          });

        cy.get("table tbody")
          .find("tr td:nth-child(2)")
          .each(($td, i) => {
            expect($td.text().trim()).to.be.eq(cits[i].citCountry);
          });
      });
    } else {
      cy.get("[data-test=calendar-assigned-cits").within(() => {
        // confirm label
        cy.get(".label").should("be.visible").and("have.text", "CIT");

        // confirm button
        cy.get("imo-button button").contains("Select").should("be.visible");

        // confirm assigned-cits-table
        cy.get("[data-test=assigned-cits-table]").should("not.be.visible");
      });
    }
  };

  context("initial display edit calendar page", () => {
    before(() => {
      visitEditCalendarPage();
    });
    it("display for type service and emergency", () => {
      if (calendarData.setValue.calendarType !== "holiday") {
        confirmTypeNameDescription();

        // startDate should be displayed startDate of calendar
        cy.get("[data-test=calendar-start-date]")
          .should("be.visible")
          .within(() => {
            const startDate = calendarData.setValue.startDate
              ? Cypress.moment(calendarData.setValue.startDate).format("M/D/YYYY")
              : Cypress.moment().format("M/D/YYYY");
            cy.get("input").invoke("val").should("eq", startDate);
          });

        // endDate should be displayed endDate of calendar
        cy.get("[data-test=calendar-end-date]")
          .should("be.visible")
          .within(() => {
            const endDate = calendarData.setValue.endDate ? Cypress.moment(calendarData.setValue.endDate).format("M/D/YYYY") : "";
            cy.get("input").invoke("val").should("eq", endDate);
          });

        // endType should be correct to endType of calendar
        if (calendarData.setValue.endDate) {
          cy.get("[data-test=calendar-radios] mat-radio-button")
            .first()
            .within(($radio) => {
              cy.wrap($radio)
                .contains("Date")
                .within(() => {
                  cy.get("input[type=radio]").should("be.checked");
                });
            });
        } else {
          cy.get("[data-test=calendar-radios] mat-radio-button")
            .last()
            .within(($radio) => {
              cy.wrap($radio)
                .contains("No end date")
                .within(() => {
                  cy.get("input[type=radio]").should("be.checked");
                });
            });
        }

        // confirm pattern selected
        const patternSelected = Object.keys(calendarData.setValue.schedule.pattern.repeat)[0];
        const capitalizedPatternType = patternSelected?.charAt(0).toUpperCase().concat(patternSelected?.slice(1));
        cy.get("[data-test=calendar-pattern]").within(() => {
          cy.get("[data-test=pattern-selection]")
            .should("have.attr", "ng-reflect-selected-item", patternSelected)
            .within(() => {
              cy.get(".mat-select-value-text").should("have.text", capitalizedPatternType);
            });
        });

        // confirm repeat displayed
        switch (patternSelected) {
          case "daily":
            confirmDailyDisplay();
            break;
          case "weekly":
            confirmWeeklyDisplay();
            break;
          case "monthly":
            confirmMonthlyDisplay();
            break;
          default:
            break;
        }
      }
    });

    it("display for type holiday", () => {
      if (calendarData.setValue.calendarType === "holiday") {
        confirmTypeNameDescription();

        confirmCITAssigned();

        confirmHolidaysDetailTable();
      } else {
        cy.log("not type holiday");
      }
    });

    it("confirm button disable or not", () => {
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").should("not.be.disabled");
        cy.get("imo-button > button").contains("Cancel").should("not.be.disabled");
      });
    });
  });
});
