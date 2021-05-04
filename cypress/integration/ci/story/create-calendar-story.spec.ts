describe("Story-Create Calendar", () => {
  interface Pattern {
    repeat: RepeatDetail;
    leadDays: {
      monday: number;
      tuesday: number;
      wednesday: number;
      thursday: number;
      friday: number;
      saturday: number;
      sunday: number;
    };
  }

  interface RepeatDetail {
    default?: string;
    daily: DailyPattern;
    weekly: WeeklyPattern;
    monthly: MonthlyPattern;
  }

  interface DailyPattern {
    default?: string;
    onlyCitWorkingDays?: unknown;
    onlyEveryXDays?: RepeatOnDay;
  }

  interface WeeklyPattern {
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
  }

  interface MonthlyPattern {
    default?: string;
    repeatOnDayOfWeek?: {
      interval: number;
      weekNumber: Array<{ default: boolean; name: string }>;
      dayOfWeek: Array<{ default: boolean; name: string }>;
    };
    repeatOnDayOfNumber?: RepeatOnDayOfMonth;
  }

  interface InitOptions {
    options: string[];
    default: string;
  }

  interface RepeatOnDay {
    interval: number;
    isIncludeCitWorkingDays: boolean;
    recurrencePolicy: InitOptions;
  }

  interface RepeatOnDayOfMonth extends RepeatOnDay {
    dayNumber: number;
  }

  interface Holiday {
    name: string;
    date: string;
    isSkippable: boolean;
    orderOffset: number;
    serviceOffset: number;
  }

  interface GetCalendar {
    calendarId?: string;
    calendarType: Array<{ default: boolean; id: number; name: string }>;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    schedule: {
      pattern: Pattern;
      holiday: Holiday[];
    };
  }

  interface CalendarCIT {
    citId: string;
    citName: string;
    citCountry: string;
  }

  interface CheckedRowCIT {
    citName: string;
    citCountry: string;
  }

  const endpoints = Cypress.env("calendarEndpoints");
  let calendarData: GetCalendar;

  const visitCreateCalendarPage = () => {
    cy.server()
      .route("GET", Cypress.env("host") + endpoints.apiGetCalendar)
      .as("apiGetCalendar");
    cy.visit(endpoints.pageCreateCalendar)
      .wait("@apiGetCalendar")
      .then((xhr) => {
        calendarData = xhr.responseBody as GetCalendar;
      });
  };

  const clickCancelButtonOfDialog = (status: string) => {
    const alertDescription =
      status === "unsaved" ? "Are you sure you want to cancel? All changes will be lost." : "Are you sure you want to cancel?";
    cy.get("button")
      .parents("body")
      .find("mat-dialog-container")
      .should("be.visible")
      .within(() => {
        cy.get(".description").contains(alertDescription);
        cy.get(".confirm").contains("Yes").should("be.visible");
        // press No button
        cy.get(".cancel").contains("No").should("be.visible").click();
      });
  };

  const clickLeaveButtonOfDialog = (status: string) => {
    const alertDescription =
      status === "unsaved" ? "Are you sure you want to cancel? All changes will be lost." : "Are you sure you want to cancel?";
    cy.get("button")
      .parents("body")
      .find("mat-dialog-container")
      .should("be.visible")
      .within(() => {
        cy.get(".description").contains(alertDescription);
        cy.get(".cancel").contains("No").should("be.visible");
        // press Yes button
        cy.get(".confirm").contains("Yes").should("be.visible").click();
      });
  };

  const changeDateRange = () => {
    // check validation of dateRange
    cy.get("[data-test=calendar-radios] mat-radio-button")
      .first()
      .within(($radio) => {
        cy.wrap($radio)
          .contains("Date")
          .within(() => {
            cy.get("input[type=radio]").should("not.be.checked").click({ force: true });
          });
      });

    // click type endDate but when not have data, Save button should be disable
    cy.get(".page-content").within(() => {
      cy.get("imo-button > button").contains("Save").should("be.disabled");
    });

    cy.get("[data-test=calendar-radios] mat-radio-button")
      .last()
      .within(($radio) => {
        cy.wrap($radio)
          .contains("No end date")
          .within(() => {
            cy.get("input[type=radio]").should("not.be.checked").click({ force: true });
          });
      });

    const startDefaultDate = !calendarData.startDate ? Cypress.moment() : Cypress.moment(calendarData.startDate);
    const startDefaultYear = startDefaultDate.format("YYYY");
    const startDefaultMonth = startDefaultDate.format("MMM").toUpperCase();

    // change startDate
    cy.get("[data-test=calendar-start-date]").within(() => {
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
      cy.get("button").parents("body").find(".mat-calendar").should("be.visible").contains(".mat-calendar-body-cell-content", "15").click();
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
  context("initial display", () => {
    before("wait for start-API response", () => {
      visitCreateCalendarPage();
    });

    it("back arrow should be displayed", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon").contains("arrow_back").should("be.visible");
      });
    });

    it("page title should be displayed", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title").should("be.visible").contains("Create Calendar");
      });
    });

    it("type select box should be displayed", () => {
      const defaultType = Cypress._.find(calendarData.calendarType, { default: true })?.name;
      const capitalizedType = defaultType?.charAt(0).toUpperCase().concat(defaultType?.slice(1));

      cy.get(".page-content .row").within(() => {
        cy.get("p:contains('Type')").should("be.visible");
        cy.get("p:contains('Type') span").should("be.visible");
        cy.get("[data-test=type-selection]").contains(`${capitalizedType}`).should("be.visible");
      });
    });

    it("name input should be displayed", () => {
      cy.get(".page-content .row").within(() => {
        cy.get("p:contains('Name')").should("be.visible");
        cy.get("p:contains('Name') span").should("be.visible");
        cy.get("[data-test=input-form]").find("[name=Name]").should("be.visible");
      });
    });

    it("description textarea should be displayed", () => {
      cy.get(".page-content .row").within(() => {
        cy.get("p:contains('Description')").should("be.visible");
        cy.get("p:contains('Description') span").should("not.be.visible");
        cy.get("[data-test=input-form]").find("[name=Description]").should("be.visible");
      });
    });

    it("start datepicker should be displayed", () => {
      cy.get("[data-test=calendar-start-date]")
        .should("be.visible")
        .within(() => {
          const startDate = calendarData.startDate
            ? Cypress.moment(calendarData.startDate, "YYYY-MM-DD").format("M/D/YYYY")
            : Cypress.moment().format("M/D/YYYY");
          cy.get("input").invoke("val").should("eq", startDate);
        });
    });

    it("end datepicker should be displayed", () => {
      cy.get("[data-test=calendar-end-date]")
        .should("be.visible")
        .within(() => {
          cy.get("input").invoke("val").should("eq", "");
        });
    });

    it("endType radio buttons should be displayed", () => {
      cy.get("[data-test=calendar-radios] mat-radio-button")
        .first()
        .within(($radio) => {
          cy.wrap($radio)
            .contains("Date")
            .within(() => {
              cy.get("input[type=radio]").should("not.be.checked");
            });
        });

      cy.get("[data-test=calendar-radios] mat-radio-button")
        .last()
        .within(($radio) => {
          cy.wrap($radio)
            .contains("No end date")
            .within(() => {
              cy.get("input[type=radio]").should("be.checked");
            });
        });
    });

    it("weekly should be default pattern", () => {
      const defaultPattern = calendarData.schedule.pattern.repeat.default;
      const capitalizedDefaultPattern = defaultPattern?.charAt(0).toUpperCase().concat(defaultPattern?.slice(1));

      cy.get(".page-content .row").within(() => {
        cy.get("h4:contains('Pattern')").should("be.visible");
        cy.get("[data-test=pattern-selection]").contains(`${capitalizedDefaultPattern}`).should("be.visible");
      });
    });

    it("should repeat every 1 week", () => {
      cy.get('input[name="frequency"]')
        .invoke("val")
        .then((frequency) => {
          expect(Number(frequency)).to.eq(1);
        });
    });

    it("lead days should be displayed", () => {
      const dayofWeeks: string[] = Object.keys(calendarData.schedule.pattern.leadDays);
      const isCITWorkingDayOfWeeks: boolean[] = _.toArray(calendarData.schedule.pattern.repeat.weekly.daysOfWeekSelection);
      const leadDays: number[] = _.toArray(calendarData.schedule.pattern.leadDays);

      cy.get("[data-test=pattern-weekly-repeat] imo-lead-days imo-working-day").each(($el, index) => {
        // Test checkboxes
        if (isCITWorkingDayOfWeeks[index]) {
          cy.wrap($el).find("input[type='checkbox']").should("be.visible").should("be.checked");
        } else {
          cy.wrap($el).find("input[type='checkbox']").should("be.visible").should("not.be.checked");
        }

        // Test labels
        cy.wrap($el).find("span[class='label']").should("be.visible").contains(dayofWeeks[index], { matchCase: false });

        // Test inputs
        cy.wrap($el)
          .find("input[type='text']")
          .should("be.visible")
          .invoke("val")
          .then((leadDay) => {
            expect(Number(leadDay)).to.eq(leadDays[index]);
          });
      });
    });

    it("confirm button disable or not", () => {
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").should("be.disabled");
        cy.get("imo-button > button").contains("Cancel").should("not.be.disabled");
      });
    });
  });

  context("max length of name and description should be 255", () => {
    before("", () => {
      visitCreateCalendarPage();
    });

    it("max length of name and description inputs should be 255", () => {
      const stringWith255Characters =
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, enim! Eligendi repellendus accusamus aliquam non praesentium cupiditate expedita quisquam labore ducimus incidunt aperiam magni, ad, ap, mid impedit modi blanditiis, doloremque exercitationem.";
      const overlengthString = " And more character...";

      cy.get(".page-content .row").within(() => {
        cy.get("[data-test=input-form]")
          .find("[name=Name]")
          .type(stringWith255Characters.concat(overlengthString), { delay: 0 })
          .invoke("val")
          .should("have.length", 255);

        cy.get("[data-test=input-form]")
          .find("[name=Description]")
          .type(stringWith255Characters.concat(overlengthString), { delay: 0 })
          .invoke("val")
          .should("have.length", 255);
      });
    });
  });

  context("should be able to select monthly pattern", () => {
    before("", () => {
      visitCreateCalendarPage();
    });

    it("should be able to change repeat options", () => {
      const defaultPattern = calendarData.schedule.pattern.repeat.default;
      cy.get("[data-test=pattern-selection]")
        .contains(`${defaultPattern}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Monthly)").click();
        });

      cy.get("[data-test=pattern-monthly-repeat]").within(() => {
        cy.get("div.repeat-options")
          .should("be.visible")
          .within(() => {
            cy.get("mat-radio-group").within(() => {
              const defaultMontlyRepeat = calendarData.schedule.pattern.repeat.monthly.default;
              switch (defaultMontlyRepeat) {
                case "repeatOnDayOfWeek":
                  cy.get("mat-radio-button:nth-child(1)")
                    .contains("On the")
                    .within(() => {
                      cy.get("input[type=radio]").should("be.checked");
                    });

                  cy.get("mat-radio-button:nth-child(2)")
                    .contains("On day")
                    .within(() => {
                      cy.get("input[type=radio]").should("not.be.checked");
                    });
                  break;
                case "repeatOnDayOfNumber":
                  cy.get("mat-radio-button:nth-child(1)")
                    .contains("On the")
                    .within(() => {
                      cy.get("input[type=radio]").should("not.be.checked");
                    });

                  cy.get("mat-radio-button:nth-child(2)")
                    .contains("On day")
                    .within(() => {
                      cy.get("input[type=radio]").should("be.checked");
                    });
                  break;
              }
            });

            cy.get("mat-radio-group").within(() => {
              cy.get("mat-radio-button:nth-child(1)")
                .contains("On the")
                .within(() => {
                  cy.get("input[type=radio]").click({ force: true });
                });
            });

            cy.get("[data-test=position-day-selection]")
              .click()
              .then(() => {
                cy.get("mat-select").parents("body").find("mat-option").last().click();
              });

            cy.get("[data-test=week-day-selection]")
              .click()
              .then(() => {
                cy.get("mat-select")
                  .parents("body")
                  .find("mat-option")
                  .contains("Wednesday" || "wednesday")
                  .click();
              });

            cy.get("input[name='dayOfWeekRepeat']").type("{selectall}").type("999").invoke("val").should("eq", "99");

            cy.get("mat-radio-group").within(() => {
              cy.get("mat-radio-button:nth-child(2)")
                .contains("On day")
                .within(() => {
                  cy.get("input[type=radio]").should("not.be.checked").click({ force: true });
                });
            });

            cy.get("input[name='dayNumber']").type("{selectall}").type("25");

            cy.get("input[name='dayOfNumberRepeat']").type("{selectall}").type("3");
          });
      });
    });

    it("should be able to change recurrence policy", () => {
      cy.get("[data-test=pattern-monthly-repeat]").within(() => {
        cy.get("div.include-working-day")
          .should("be.visible")
          .within(() => {
            const isIncludeCitWorkingDays = calendarData.schedule.pattern.repeat.monthly.repeatOnDayOfNumber?.isIncludeCitWorkingDays;
            if (isIncludeCitWorkingDays) {
              cy.get("input[type='checkbox']").should("be.checked").click({ force: true });
            } else {
              cy.get("input[type='checkbox']").should("not.be.checked").click({ force: true });
            }

            const defaultRecurrencePolicy = calendarData.schedule.pattern.repeat.monthly.repeatOnDayOfNumber?.recurrencePolicy.default;
            cy.get("div imo-radio mat-radio-group mat-radio-button").within(($radio) => {
              switch (defaultRecurrencePolicy) {
                case "moveNext":
                  cy.wrap($radio).contains("Move to next working day").find("input[type=radio]").should("be.checked");
                  cy.wrap($radio).contains("Move to previous working day").find("input[type=radio]").should("not.be.checked");
                  cy.wrap($radio).contains("Move to nearest working day").find("input[type=radio]").should("not.be.checked");
                  break;
                case "movePrevious":
                  cy.wrap($radio).contains("Move to next working day").find("input[type=radio]").should("not.be.checked");
                  cy.wrap($radio).contains("Move to previous working day").find("input[type=radio]").should("be.checked");
                  cy.wrap($radio).contains("Move to nearest working day").find("input[type=radio]").should("not.be.checked");
                  break;
                case "moveNearest":
                  cy.wrap($radio).contains("Move to next working day").find("input[type=radio]").should("not.be.checked");
                  cy.wrap($radio).contains("Move to previous working day").find("input[type=radio]").should("not.be.checked");
                  cy.wrap($radio).contains("Move to nearest working day").find("input[type=radio]").should("be.checked");
                  break;
              }
              cy.wrap($radio).contains("Move to nearest working day").find("input[type=radio]").click({ force: true });
            });
          });
      });
    });

    it("should be able to change lead days", () => {
      cy.get("[data-test=pattern-monthly-repeat]").within(() => {
        cy.get("div imo-lead-days imo-working-day").each(($el) => {
          cy.wrap($el).find("input[type='text']").type("{selectall}").type("999").invoke("val").should("eq", "99");
        });
      });
    });
  });

  context("should be able to select daily pattern", () => {
    before("", () => {
      visitCreateCalendarPage();
    });

    it("should be able to change repeat options", () => {
      const defaultPattern = calendarData.schedule.pattern.repeat.default;
      cy.get("[data-test=pattern-selection]")
        .contains(`${defaultPattern}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Daily)").click();
        });

      cy.get("[data-test=pattern-daily-repeat]").within(() => {
        cy.get("mat-radio-group").within(() => {
          const defaultDailyRepeat = calendarData.schedule.pattern.repeat.daily.default;
          switch (defaultDailyRepeat) {
            case "onlyCitWorkingDays":
              cy.get("mat-radio-button:nth-child(1)")
                .contains("Every defined CIT working day")
                .within(() => {
                  cy.get("input[type=radio]").should("be.checked");
                });

              cy.get("mat-radio-button:nth-child(2)")
                .contains("Every")
                .within(() => {
                  cy.get("input[type=radio]").should("not.be.checked");
                });
              cy.get("mat-radio-button:nth-child(2)").contains("Every").click({ force: true });
              break;

            case "onlyEveryXDays":
              cy.get("mat-radio-button:nth-child(1)")
                .contains("Every defined CIT working day")
                .within(() => {
                  cy.get("input[type=radio]").should("not.be.checked");
                });

              cy.get("mat-radio-button:nth-child(2)")
                .contains("Every")
                .within(() => {
                  cy.get("input[type=radio]").should("be.checked");
                });
              break;
          }
        });
      });
    });

    it("should be able to change recurrence policy", () => {
      cy.get("div.include-working-day")
        .should("be.visible")
        .within(() => {
          const isIncludeCitWorkingDays = calendarData.schedule.pattern.repeat.daily.onlyEveryXDays?.isIncludeCitWorkingDays;
          if (isIncludeCitWorkingDays) {
            cy.get("input[type='checkbox']").should("be.checked").click({ force: true });
          } else {
            cy.get("input[type='checkbox']").should("not.be.checked").click({ force: true });
          }

          const defaultRecurrencePolicy = calendarData.schedule.pattern.repeat.daily.onlyEveryXDays?.recurrencePolicy.default;
          cy.get("div imo-radio mat-radio-group mat-radio-button").within(($radio) => {
            switch (defaultRecurrencePolicy) {
              case "moveNext":
                cy.wrap($radio).contains("Move to next working day").find("input[type=radio]").should("be.checked");
                cy.wrap($radio).contains("Move to previous working day").find("input[type=radio]").should("not.be.checked");
                cy.wrap($radio).contains("Move to nearest working day").find("input[type=radio]").should("not.be.checked");
                break;
              case "movePrevious":
                cy.wrap($radio).contains("Move to next working day").find("input[type=radio]").should("not.be.checked");
                cy.wrap($radio).contains("Move to previous working day").find("input[type=radio]").should("be.checked");
                cy.wrap($radio).contains("Move to nearest working day").find("input[type=radio]").should("not.be.checked");
                break;
              case "moveNearest":
                cy.wrap($radio).contains("Move to next working day").find("input[type=radio]").should("not.be.checked");
                cy.wrap($radio).contains("Move to previous working day").find("input[type=radio]").should("not.be.checked");
                cy.wrap($radio).contains("Move to nearest working day").find("input[type=radio]").should("be.checked");
                break;
            }
            cy.wrap($radio).contains("Move to previous working day").find("input[type=radio]").click({ force: true });
          });
        });
    });

    it("should be able to change lead days", () => {
      cy.get("[data-test=pattern-daily-repeat]").within(() => {
        cy.get("div imo-lead-days imo-working-day").each(($el) => {
          cy.wrap($el).find("input[type='text']").type("{selectall}").type("999").invoke("val").should("eq", "99");
        });
      });
    });
  });

  context("click cancel button or back arrow when nothing is selected", () => {
    beforeEach(() => {
      visitCreateCalendarPage();
    });

    it("should redirect to Calendars list page without alert dialog when click cancel button", () => {
      cy.get("imo-button").contains("Cancel").click({ force: true });
      cy.url().should("include", endpoints.pageCalendars);
    });

    it("should redirect to Calendars list page without alert dialog when click back arrow", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon").contains("arrow_back").click({ force: true });
      });
      cy.url().should("include", endpoints.pageCalendars);
    });
  });

  context("click cancel button or back arrow when made any changes and leave without saving", () => {
    const saveStatus = "unsaved";

    it("click cancel button should show the alert dialog and stay at create Calendar page if click cancel button of alert dialog", () => {
      visitCreateCalendarPage();

      cy.get("[data-test=input-form]").find("[name=Name]").type("Caledar 001", { delay: 0 });

      cy.get("imo-button > button")
        .contains("Cancel")
        .click()
        .then(() => {
          clickCancelButtonOfDialog(saveStatus);
        });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCreateCalendar);
    });

    it("click cancel button should show the alert dialog and redirect to Calendars page if click leave button of alert dialog", () => {
      cy.get("imo-button > button")
        .contains("Cancel")
        .click()
        .then(() => {
          clickLeaveButtonOfDialog(saveStatus);
        });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCalendars);
    });

    it("click back arrow should show the alert dialog and stay at create Calendar page if click cancel button of alert dialog", () => {
      visitCreateCalendarPage();
      cy.get("[data-test=input-form]").find("[name=Name]").type("Caledar 001", { delay: 0 });

      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon")
          .contains("arrow_back")
          .click({ force: true })
          .then(() => {
            clickCancelButtonOfDialog(saveStatus);
          });
      });

      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCreateCalendar);
    });

    it("click back arrow should show the alert dialog and redirect to Calendars page if click leave button of alert dialog", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon")
          .contains("arrow_back")
          .click({ force: true })
          .then(() => {
            clickLeaveButtonOfDialog(saveStatus);
          });
      });

      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCalendars);
    });
  });

  context("click cancel button or back arrow when any changes has been save", () => {
    const saveStatus = "saved";

    it("click cancel button should show the alert dialog and stay at create Calendar page if click cancel button of alert dialog", () => {
      visitCreateCalendarPage();
      cy.get("[data-test=input-form]").find("[name=Name]").type("Caledar 001", { delay: 0 });
      // Change pattern to Daily
      const defaultPattern = calendarData.schedule.pattern.repeat.default;
      cy.get("[data-test=pattern-selection]")
        .contains(`${defaultPattern}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Daily)").click();
        });

      cy.server()
        .route("POST", Cypress.env("host") + endpoints.apiCalendarSave)
        .as("apiCalendarSavePost");

      // click save button and request POST
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").click();
      });

      cy.wait("@apiCalendarSavePost").then(() => {
        cy.get("imo-button > button")
          .contains("Cancel")
          .click()
          .then(() => {
            clickCancelButtonOfDialog(saveStatus);
          });
      });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCreateCalendar);
    });

    it("click cancel button should show the alert dialog and redirect to Calendars list page if click leave button of alert dialog", () => {
      cy.get("imo-button > button")
        .contains("Cancel")
        .click()
        .then(() => {
          clickLeaveButtonOfDialog(saveStatus);
        });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCalendars);
    });

    it("click back arrow should show the alert dialog and stay at create Calendar page if click cancel button of alert dialog", () => {
      visitCreateCalendarPage();
      cy.get("[data-test=input-form]").find("[name=Name]").type("Caledar 001", { delay: 0 });
      // Change pattern to Daily
      const defaultPattern = calendarData.schedule.pattern.repeat.default;
      cy.get("[data-test=pattern-selection]")
        .contains(`${defaultPattern}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Daily)").click();
        });

      cy.server()
        .route("POST", Cypress.env("host") + endpoints.apiCalendarSave)
        .as("apiCalendarSavePost");

      // click save button and request POST
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").click();
      });

      cy.wait("@apiCalendarSavePost").then(() => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title > button > mat-icon")
            .contains("arrow_back")
            .click({ force: true })
            .then(() => {
              clickCancelButtonOfDialog(saveStatus);
            });
        });
      });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCreateCalendar);
    });

    it("click back arrow should show the alert dialog and redirect to Calendars list page if click leave button of alert dialog", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon")
          .contains("arrow_back")
          .click({ force: true })
          .then(() => {
            clickLeaveButtonOfDialog(saveStatus);
          });
      });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCalendars);
    });
  });

  context("should be able to manipulate inputs and save", () => {
    let calendarId: string | undefined;

    before(() => {
      visitCreateCalendarPage();
    });

    it("should be able to call POST api", () => {
      const calendarTypes = [...calendarData.calendarType].map((type) => type.name);
      if (calendarTypes.length) {
        const defaultType = _.find(calendarData.calendarType, { default: true })?.name;
        cy.get("[data-test=type-selection]")
          .contains(`${defaultType}`, { matchCase: false })
          .click()
          .then(() => {
            cy.get("mat-select").parents("body").find("mat-option").last().click({ force: true });
          });
      }

      cy.get("[data-test=input-form]").find("[name=Name]").type("Caledar 001", { delay: 0 });
      cy.get("[data-test=input-form]").find("[name=Description]").type("Description of Caledar 001", { delay: 0 });
      changeDateRange();
      const defaultPattern = calendarData.schedule.pattern.repeat.default;
      cy.get("[data-test=pattern-selection]")
        .contains(`${defaultPattern}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Daily)").click();
        });

      cy.server()
        .route("POST", Cypress.env("host") + endpoints.apiCalendarSave)
        .as("apiCalendarSavePost");

      // click save button and request POST
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").click();
      });

      cy.wait("@apiCalendarSavePost").then((xhr) => {
        const res = xhr.responseBody as GetCalendar;
        calendarId = res.calendarId;
      });
      cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Created.");

      cy.get(".page-content").within(() => {
        cy.get(".page-title").should("be.visible").contains("Caledar 001");
      });

      cy.get("[data-test=type-selection]").find("mat-select").should("have.class", "mat-select-disabled");
    });

    it("should be able to call PUT api", () => {
      cy.get("[data-test=input-form]").find("[name=Name]").type(" updated", { delay: 0 });
      cy.get("[data-test=input-form]").find("[name=Description]").type(" updated", { delay: 0 });
      cy.get("[data-test=calendar-radios] mat-radio-button")
        .last()
        .within(($radio) => {
          cy.wrap($radio)
            .contains("No end date")
            .within(() => {
              cy.get("input[type=radio]").should("not.be.checked").click({ force: true });
            });
        });

      cy.server()
        .route("PUT", Cypress.env("host") + endpoints.apiCalendarSave + "/" + calendarId)
        .as("apiCalendarSavePut");

      // click save button and request PUT
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").click();
      });

      cy.wait("@apiCalendarSavePut");
      cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Updated.");

      cy.get(".page-content").within(() => {
        cy.get(".page-title").should("be.visible").contains("Caledar 001 updated");
      });

      cy.get("imo-button > button")
        .contains("Cancel")
        .click()
        .then(() => {
          clickLeaveButtonOfDialog("saved");
        });

      cy.get("mat-dialog-container").should("not.exist");
      cy.get("body").find("snack-bar-container").should("not.be.visible");
    });
  });

  context("should display error message", () => {
    beforeEach("", () => {
      visitCreateCalendarPage();
    });

    it("click select CITs and return error, should display error message", () => {
      const defaultType = Cypress._.find(calendarData.calendarType, { default: true })?.name;
      cy.get("[data-test=type-selection]")
        .contains(`${defaultType}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Holiday)").click();
        });

      cy.server({
        method: "GET",
        delay: 1000,
        status: 500,
        response: {},
      })
        .route("GET", Cypress.env("host") + endpoints.apiGetCIT)
        .as("apiGetCIT");

      // press Select button
      cy.get("imo-button").contains("Select").click({ force: true });

      cy.wait("@apiGetCIT").then(() => {
        cy.get("imo-button")
          .parents("body")
          .find("mat-dialog-container")
          .should("be.visible")
          .within(() => {
            cy.get(".mat-dialog-title").contains("Error Title");

            cy.get(".mat-dialog-content").contains("Something went wrong. Try again!");

            cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click();
          });
      });
    });

    it("click save and return error, should display error message", () => {
      cy.get("[data-test=input-form]").find("[name=Name]").type("Caledar 001", { delay: 0 });
      const defaultPattern = calendarData.schedule.pattern.repeat.default;
      cy.get("[data-test=pattern-selection]")
        .contains(`${defaultPattern}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Daily)").click();
        });

      cy.server({
        method: "POST",
        delay: 1000,
        status: 404,
        response: {},
      })
        .route("POST", Cypress.env("host") + endpoints.apiCalendarSave)
        .as("apiCalendarSave");

      // press Save button
      cy.get("imo-button").contains("Save").click();

      cy.wait("@apiCalendarSave").then(() => {
        cy.get("imo-button")
          .parents("body")
          .find("mat-dialog-container")
          .should("be.visible")
          .within(() => {
            cy.get(".mat-dialog-title").contains("Error Title");

            cy.get(".mat-dialog-content").contains("Something went wrong. Try again!");

            // OK button should be abled when location was selected
            cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click();
          });
      });
    });
  });

  context("should be able to select holiday type", () => {
    before("", () => {
      visitCreateCalendarPage();
    });

    it("CIT labels and button select should be display, CIT assigned table should not display", () => {
      const defaultType = Cypress._.find(calendarData.calendarType, { default: true })?.name;
      cy.get("[data-test=type-selection]")
        .contains(`${defaultType}`, { matchCase: false })
        .click()
        .then(() => {
          cy.get("mat-select").parents("body").find("mat-option:contains(Holiday)").click();
        });

      cy.get("[data-test=calendar-assigned-cits").within(() => {
        // confirm label
        cy.get(".label").should("be.visible").and("have.text", "CIT");

        // confirm button
        cy.get("imo-button button").contains("Select").should("be.visible");

        // confirm assigned-cits-table
        cy.get("[data-test=assigned-cits-table]").should("not.be.visible");
      });
    });

    it("click select button should display dialog select cit", () => {
      cy.server()
        .route("GET", Cypress.env("host") + endpoints.apiGetCIT)
        .as("apiGetCIT");

      let cits: CalendarCIT[] = [];
      const checkedRows: CheckedRowCIT[] = [];
      const listHeadersCIT = ["", "CIT Name", "Country"];
      cy.get("[data-test=calendar-assigned-cits]").within(() => {
        cy.get("imo-button")
          .contains("Select")
          .click({ force: true })
          .wait("@apiGetCIT")
          .then((response) => {
            const res = response.responseBody;
            if (Array.isArray(res)) {
              cits = res.map((cit) => ({ citId: cit.citId, citName: cit.name, citCountry: cit.country }));
            }

            // confirm dialog
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                // confirm title
                cy.get(".mat-dialog-title").contains("Select CIT").should("be.visible");

                // confirm buttons
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled");

                cy.get("mat-dialog-actions > imo-button > button").contains("Cancel").should("be.visible");

                // confirm header
                cy.get("[data-test=assigned-cits-table] table")
                  .should("be.visible")
                  .within(() => {
                    cy.get("th").each(($th, i) => {
                      expect($th).to.contain(listHeadersCIT[i]);
                    });
                  });

                // confirm data display
                cy.get("[data-test=assigned-cits-table] table tbody")
                  .find("tr td:nth-child(2)")
                  .each(($td, i) => {
                    expect($td.text().trim()).to.be.eq(cits[i].citName);
                  });

                cy.get("[data-test=assigned-cits-table] table tbody")
                  .find("tr td:nth-child(3)")
                  .each(($td, i) => {
                    expect($td.text().trim()).to.be.eq(cits[i].citCountry);
                  });

                cy.get("[data-test=assigned-cits-table] table tbody")
                  .find("tr td:nth-child(1)")
                  .each(($td) => {
                    cy.wrap($td).within(() => {
                      cy.get("input[type=checkbox]")
                        .should("not.be.checked")
                        .click({ force: true })
                        .should("be.checked")
                        .click({ force: true })
                        .should("not.be.checked");
                    });
                  });

                // Select cits
                cy.get("[data-test=assigned-cits-table] table tbody")
                  .find("tr td:nth-child(1)")
                  .each(($td) => {
                    cy.wrap($td).within(() => {
                      cy.get("input[type=checkbox]").should("not.be.checked").click({ force: true }).should("be.checked");
                    });
                  })
                  .then(() => {
                    // Get checkedRows
                    cy.get("[data-test=assigned-cits-table] mat-checkbox.mat-checkbox-checked").each(($elem) => {
                      const row = {
                        citName: $elem.parents("tr").find("td:eq(1)").text().trim(),
                        citCountry: $elem.parents("tr").find("td:eq(2)").text().trim(),
                      };
                      checkedRows.push(row);
                    });
                  });

                // Click button OK
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").click({ force: true });
              });

            // confirm cits table display after selected
            cy.get("table")
              .should("be.visible")
              .within(() => {
                cy.get("tbody > tr").should(($tr) => {
                  expect($tr).to.have.length(checkedRows.length);
                });
              });

            cy.get("table tbody")
              .find("tr td:nth-child(1)")
              .each(($td, i) => {
                expect($td.text().trim()).to.be.eq(checkedRows[i].citName);
              });

            cy.get("table tbody")
              .find("tr td:nth-child(2)")
              .each(($td, i) => {
                expect($td.text().trim()).to.be.eq(checkedRows[i].citCountry);
              });
          });
      });
    });

    it("re-select cits should display dialog select cit with data checked", () => {
      cy.server()
        .route("GET", Cypress.env("host") + endpoints.apiGetCIT)
        .as("apiGetCIT");

      let cits: CalendarCIT[] = [];
      const checkedRows: CheckedRowCIT[] = [];
      cy.get("[data-test=calendar-assigned-cits]").within(() => {
        cy.get("imo-button")
          .contains("Select")
          .click({ force: true })
          .wait("@apiGetCIT")
          .then((response) => {
            const res = response.responseBody;
            if (Array.isArray(res)) {
              cits = res.map((cit) => ({ citId: cit.citId, citName: cit.name, citCountry: cit.country }));
            }

            // confirm dialog
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                // confirm data display
                cy.get("[data-test=assigned-cits-table] table tbody")
                  .find("tr td:nth-child(1)")
                  .each(($td) => {
                    cy.wrap($td).within(() => {
                      cy.get("input[type=checkbox]").should("be.checked");
                    });
                  });

                // Re-select locations
                cy.get("[data-test=assigned-cits-table] table tbody")
                  .find("tr td:nth-child(1)")
                  .each(($td, i) => {
                    if (i === cits.length - 1) {
                      cy.wrap($td).within(() => {
                        cy.get("input[type=checkbox]").should("be.checked").click({ force: true });
                      });
                    }
                  })
                  .then(() => {
                    // Get checkedRows
                    cy.get("[data-test=assigned-cits-table] mat-checkbox.mat-checkbox-checked").each(($elem) => {
                      const row = {
                        citName: $elem.parents("tr").find("td:eq(1)").text().trim(),
                        citCountry: $elem.parents("tr").find("td:eq(2)").text().trim(),
                      };
                      checkedRows.push(row);
                    });
                  });

                // Click button OK
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").click({ force: true });
              });

            // confirm cits table display after selected
            cy.get("table")
              .should("be.visible")
              .within(() => {
                cy.get("tbody > tr").should(($tr) => {
                  expect($tr).to.have.length(checkedRows.length);
                });
              });

            cy.get("table tbody")
              .find("tr td:nth-child(1)")
              .each(($td, i) => {
                expect($td.text().trim()).to.be.eq(checkedRows[i].citName);
              });

            cy.get("table tbody")
              .find("tr td:nth-child(2)")
              .each(($td, i) => {
                expect($td.text().trim()).to.be.eq(checkedRows[i].citCountry);
              });
          });
      });
    });

    it("calendar holidays table header should be displayed", () => {
      const listHeaders = ["", "Name", "Date", "Day", "Skip", "Order Offset", "Service Offset", "Actions", ""];

      cy.get("[data-test=calendar-holidays-table] table")
        .should("be.visible")
        .within(() => {
          cy.get("th").each(($th, i) => {
            expect($th).to.contain(listHeaders[i]);
          });
        });
    });

    it("calendar holidays table should display all data", () => {
      const holidaysData = calendarData.schedule.holiday;
      if (holidaysData.length) {
        cy.get("[data-test=calendar-holidays-table] table tbody").within(() => {
          cy.get("tr").each(($tr, index) => {
            cy.wrap($tr)
              .find("td:nth-child(2)")
              .should(($td) => {
                const name = holidaysData[index].name ? holidaysData[index].name : "";
                expect($td.text().trim()).to.be.eq(name);
              });

            cy.wrap($tr)
              .find("td:nth-child(3)")
              .should(($td) => {
                const date = holidaysData[index].date ? holidaysData[index].date : "";
                expect($td.text().trim()).to.be.eq(date);
              });

            cy.wrap($tr)
              .find("td:nth-child(5) [type=checkbox]")
              .should(holidaysData[index].isSkippable ? "be.checked" : "not.be.checked");

            cy.wrap($tr)
              .find("td:nth-child(6)")
              .should(($td) => {
                const orderOffset = holidaysData[index].orderOffset ? holidaysData[index].orderOffset : "";
                expect($td.text().trim()).to.be.eq(orderOffset);
              });

            cy.wrap($tr)
              .find("td:nth-child(7)")
              .should(($td) => {
                const serviceOffset = holidaysData[index].serviceOffset ? holidaysData[index].serviceOffset : "";
                expect($td.text().trim()).to.be.eq(serviceOffset);
              });

            cy.wrap($tr)
              .find("td:nth-child(8)")
              .within(($td) => {
                cy.wrap($td).get("imo-button:contains(Delete)").should("be.visible");
              });
          });
        });
      } else {
        cy.log("No data to display");
      }
    });

    it("should able to add new calendar holiday", () => {
      const stringWith255Characters =
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, enim! Eligendi repellendus accusamus aliquam non praesentium cupiditate expedita quisquam labore ducimus incidunt aperiam magni, ad, ap, mid impedit modi blanditiis, doloremque exercitationem.";
      const overLengthString = " And more character...";

      const defaultDate = Cypress.moment().add(1, "days");
      const year = defaultDate.format("YYYY");
      const monthSelect = defaultDate.format("MMM").toUpperCase();
      const monthNumber = defaultDate.format("M");
      const day = defaultDate.format("D");
      const placeholder = {
        name: "Input name",
        date: "Select date",
      };

      const offset = {
        min: "-99",
        max: "99",
      };

      cy.get("[data-test=calendar-holidays-table]").within(() => {
        const holidaysData = calendarData.schedule.holiday;
        if (holidaysData.length) {
          cy.get("button").contains("Delete").click();
        }

        cy.root()
          .parents("[data-test=calendar-holidays]")
          .find("button")
          .contains("Add Holiday")
          .should("be.visible")
          .click({ force: true })
          .then(() => {
            cy.get("table tbody").within(() => {
              cy.get("tr").each(($tr) => {
                cy.wrap($tr)
                  .find("td:nth-child(2)")
                  .within(($td) => {
                    // confirm placeholder of input name
                    cy.wrap($td).get("input[type=text]").should("have.attr", "placeholder", placeholder.name);

                    // Input holiday name
                    cy.wrap($td)
                      .get("input[type=text]")
                      .type("New Year's Day")
                      .should(($Input) => {
                        expect($Input.val()).to.be.eq("New Year's Day");
                      });

                    // confirm max length input
                    cy.wrap($td)
                      .get("input[type=text]")
                      .type(`{selectall}{backspace}`)
                      .type(`${stringWith255Characters + overLengthString}`)
                      .should(($Input) => {
                        expect($Input.val()).to.have.length.of.at.most(255);
                      });
                  });

                cy.wrap($tr)
                  .find("td:nth-child(3)")
                  .within(($td) => {
                    // confirm placeholder of input name
                    cy.wrap($td).get("[data-test=date-picker]").should("have.attr", "placeholder", placeholder.date);

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
                    cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", monthSelect).click();

                    // select day after select month and year
                    cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", day).click();

                    // confirm date after select
                    cy.get("[data-test=date-picker]").should(($Input) => {
                      expect($Input.val()).to.be.eq(`${monthNumber}/${day}/${year}`);
                    });
                  });

                // confirm day of week after select date
                cy.wrap($tr)
                  .find("td:nth-child(4)")
                  .within(($td) => {
                    const day = Cypress.moment().add(1, "days").format("dddd");
                    expect($td.text().trim()).to.be.eq(day);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(5) mat-checkbox")
                  .click()
                  .then(($el) => {
                    cy.wrap($tr).find("td:nth-child(6) input[type=text]").should("not.be.enabled");
                    cy.wrap($tr).find("td:nth-child(7) input[type=text]").should("not.be.enabled");
                    return cy.wrap($el);
                  })
                  .click()
                  .then(() => {
                    cy.wrap($tr).find("td:nth-child(6) input[type=text]").should("be.enabled");
                    cy.wrap($tr).find("td:nth-child(7) input[type=text]").should("be.enabled");
                  });

                cy.wrap($tr)
                  .find("td:nth-child(6)")
                  .within(($td) => {
                    const orderOffset = "11";
                    cy.wrap($td)
                      .get("input[type=text]")
                      .type(`{selectall}{backspace}`)
                      .type(`${orderOffset}`)
                      .should(($Input) => {
                        expect($Input.val()).to.be.eq(orderOffset);
                      });

                    // confirm min offset can input
                    const checkMinOrderOffset = "-999";
                    cy.wrap($td)
                      .get("input[type=text]")
                      .type(`{selectall}{backspace}`)
                      .type(`${checkMinOrderOffset}`)
                      .should(($Input) => {
                        expect($Input.val()).to.be.eq(offset.min);
                      });
                  });

                cy.wrap($tr)
                  .find("td:nth-child(7)")
                  .within(($td) => {
                    const serviceOffset = "22";
                    cy.wrap($td)
                      .get("input[type=text]")
                      .type(`{selectall}{backspace}`)
                      .type(`${serviceOffset}`)
                      .should(($Input) => {
                        expect($Input.val()).to.be.eq(serviceOffset);
                      });

                    // confirm max offset can input
                    const checkMaxServiceOffset = "999";
                    cy.wrap($td)
                      .get("input[type=text]")
                      .type(`{selectall}{backspace}`)
                      .type(`${checkMaxServiceOffset}`)
                      .should(($Input) => {
                        expect($Input.val()).to.be.eq(offset.max);
                      });
                  });

                // confirm table after click delete holiday
                cy.wrap($tr).should(($tr) => {
                  expect($tr).to.have.length(1);
                });

                cy.wrap($tr)
                  .find("td:nth-child(8)")
                  .within(($td) => {
                    cy.wrap($td).get("imo-button:contains(Delete)").should("be.visible").click();
                  });

                cy.wrap($tr).should(($tr) => {
                  expect($tr).to.have.length(0);
                });
              });
            });
          });
      });
    });
  });
});
