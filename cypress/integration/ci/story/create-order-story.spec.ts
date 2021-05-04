import { Moment } from "moment";

describe("Story-Create an Order", () => {
  interface Location {
    id: string;
    name: string;
    citId: string;
    citName: string;
    pavementLimit: string;
  }

  interface Organization {
    id: string;
    name: string;
    locations: Location[];
  }

  interface OrganizationLocation {
    organizationId: string;
    organizationName: string;
    locationId: string;
    locationName: string;
    citId: string;
    citName: string;
    pavementLimit: string;
  }

  type Denomination = {
    currencyCode: string;
    type: string;
    faceValue: number;
    exponent: number;
    symbol: string;
  };

  type ResponseOrderDetail = {
    currencyCode: string;
    decimalPlaces: number;
    symbol: string;
    denominations: Denomination[];
  };

  interface OrderDetail {
    currency: string;
    denomination: string;
  }

  interface CITWorkingDays {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }

  interface CITHolidays {
    name: string;
    date: string;
    isSkippable: boolean;
    orderOffset: number;
    serviceOffset: number;
  }

  interface CITCalendar {
    workingDays: CITWorkingDays;
    holidays: CITHolidays[];
  }

  interface SelectedLocationAndCIT {
    currencyDenominations: ResponseOrderDetail;
    calendars: {
      citCalendars: CITCalendar;
    };
  }

  const standardDefaultDate = Cypress.moment().add(1, "day");
  const standardDefaultYear = standardDefaultDate.format("YYYY");
  const standardDefaultMonth = standardDefaultDate.format("MMM").toUpperCase();
  const standardDefaultDay = standardDefaultDate.format("D");

  context("there are multiple organization", () => {
    let organzationLocation: OrganizationLocation[];

    before(() => {
      cy.server()
        .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
        .as("apiOrderStart");
      cy.visit(Cypress.env("createOrder"))
        .wait("@apiOrderStart")
        .then((xhr) => {
          const res = xhr.responseBody;
          if (Array.isArray(res)) {
            res.map((organization: Organization) => {
              organization.locations.map((location: Location) => {
                organzationLocation.push({
                  organizationId: organization.id,
                  organizationName: organization.name,
                  locationId: location.id,
                  locationName: location.name,
                  citId: location.citId,
                  citName: location.citName,
                  pavementLimit: location.pavementLimit,
                });
              });
            });
          }
        });
    });

    context("initial display", () => {
      before("wait for start-API response", () => {
        cy.wait(1000);
      });

      it("back arrow should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title > button > mat-icon").contains("arrow_back").should("be.visible");
        });
      });

      it("page title should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title").should("be.visible").contains("Create order");
        });
      });

      it("order number should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=order-number]").should("not.be.visible");
        });
      });

      it("selected organization-location table should not be visible", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=company-location-table] > table").should("not.be.visible");
        });
      });

      it("select location button should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-button").contains("Select").should("be.visible");
        });
      });

      it("select date should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=select-date]").should("not.be.visible");
        });
      });

      it("pickup option should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=pickup-option]").should("not.be.visible");
        });
      });

      it("order detail should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=order-detail]").should("not.be.visible");
        });
      });

      it("confirm button disable or not", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").should("be.disabled");
          cy.get("imo-button > button").contains("Cancel").should("not.be.disabled");
          cy.get("imo-button > button").contains("Print").should("be.disabled");
          cy.get("imo-button > button").contains("Request").should("be.disabled");
        });
      });
    });

    context("select organization and location", () => {
      organzationLocation = [];

      it("should be displayed organization-location select dialog", () => {
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                cy.get(".mat-dialog-title").contains("Select Organisation Location");

                cy.get(".mat-table")
                  .should("be.visible")
                  .find("tr")
                  .its("length")
                  .should("be.eq", organzationLocation.length + 1);

                // confirm OK button disable when no location selected
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("be.disabled");

                // press cancel button without select a location
                cy.get("mat-dialog-actions > imo-button > button").contains("Cancel").click();
              });
          });
      });

      it("press cancel button without select a location", () => {
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // press cancel button without select a location
                cy.get("mat-dialog-actions > imo-button > button").contains("Cancel").click();
              });
          });

        // confirm selected organization & location table (when no location selected)
        cy.get("[data-test=company-location-table] > table").should("not.be.visible");
      });

      it("select a location", () => {
        // open select organization and location dialog and select a location
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // select a location
                cy.get(".mat-table")
                  .should("be.visible")
                  .then(() => {
                    cy.get("tbody")
                      .as("row")
                      .each((_, i) => {
                        cy.get("@row")
                          .eq(i)
                          .within(() => {
                            cy.get("tr:first").click({ force: true });
                          });
                      });
                  });

                // OK button should be abled when location was selected
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click();
              });
            // loading is displayed until API returns
            // cy.get("imo-button")
            //   .parents("body")
            //   .find("imo-loading .spinner")
            //   .should("be.visible")
          });

        // confirm selected organization & location table (when a location selected)
        cy.get("[data-test=company-location-table] table tbody").should(($tbody) => {
          expect($tbody).to.have.length(1);
        });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(1)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].organizationName);
          });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(2)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].locationName);
          });

        // confirm button should not be disabled
        cy.get("imo-button > button").contains("Save").should("not.be.disabled");
      });

      it("Re-select location and should be displayed confirm change location dialog", () => {
        // Re-select location and should be displayed confirm change location dialog
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(($target) => {
            // Check imo alert should be visible
            cy.wrap($target)
              .parents("body")
              .find("mat-dialog-container > imo-alert")
              .should("be.visible")
              .within(() => {
                // Check content in dialog
                cy.get(".description").contains("Changing the location will clear all existing selections.");

                cy.get(".confirm").contains("OK").should("not.be.disabled");

                // Click cancel button and should not do anything
                cy.get(".cancel").contains("Cancel").should("be.visible").click();
              });
          });

        // confirm selected organization & location table (when click button cancel)
        cy.get("[data-test=company-location-table] table tbody").should(($tbody) => {
          expect($tbody).to.have.length(1);
        });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(1)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].organizationName);
          });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(2)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].locationName);
          });

        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(($target) => {
            // Check imo alert should be visible
            cy.wrap($target)
              .parents("body")
              .find("mat-dialog-container > imo-alert")
              .should("be.visible")
              .within(() => {
                // Check content in dialog
                cy.get(".description").contains("Changing the location will clear all existing selections.");

                cy.get(".cancel").contains("Cancel").should("be.visible");

                // Click ok button and displayed Select Organisation Location dialog
                cy.get(".confirm").contains("OK").should("not.be.disabled").click();
              });

            cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("be.disabled");

            cy.get("mat-dialog-container  .mat-table")
              .should("be.visible")
              .within(() => {
                cy.get("tbody")
                  .as("row")
                  .each((_, i) => {
                    cy.get("@row")
                      .eq(i)
                      .within(() => {
                        // Check first radio should be checked
                        cy.get("tr:first").within(() => {
                          cy.get("input[type=radio]").should("be.checked");
                        });

                        // Select second row
                        cy.get("tr:nth-child(2)").click({ force: true });
                      });
                  });
              });

            // OK button should be abled when location was selected
            cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click({ force: true });
          });

        // confirm selected organization & location table (when click button OK)
        cy.get("[data-test=company-location-table] > table")
          .should("be.visible")
          .within(() => {
            cy.get("tbody").should(($tbody) => {
              expect($tbody).to.have.length(1);
            });

            cy.get("tr").within(() => {
              cy.get("td")
                .eq(0)
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(organzationLocation[1].organizationName);
                });

              cy.get("td")
                .eq(1)
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(organzationLocation[1].locationName);
                });
            });
          });
      });
    });

    context("items displayed after location is selected", () => {
      let orderdetails: OrderDetail[];
      let CITCalendar: CITCalendar;
      organzationLocation = [];

      const isRestrictedDate = (emergencyDate: Moment) => {
        // array contains CIT's holidays
        const holidays: string[] = CITCalendar.holidays?.map((holiday) => holiday.date);
        // array contains CIT's non working days (value === false)
        const nonWorkingDays: string[] = Object.keys(Cypress._.pickBy(CITCalendar.workingDays, (value) => !value));

        const isHoliday: boolean = Cypress._.includes(holidays, emergencyDate.format("YYYY-MM-DD"));
        const isNonWorkingDay: boolean = Cypress._.includes(
          nonWorkingDays,
          emergencyDate.format("dddd").charAt(0).toLowerCase() + emergencyDate.format("dddd").slice(1),
        );

        if (isHoliday || isNonWorkingDay) {
          return true;
        }

        return false;
      };

      before("", () => {
        cy.wait(100);
        orderdetails = [];
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.root()
              .find("imo-alert")
              .within(($alert) => {
                if ($alert.is(":visible")) {
                  cy.root().find("imo-button > button").contains("OK").click().wait(100);
                }
              });

            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                let orgLocIndex = 0;

                // select a location
                cy.get(".mat-table tbody").within(() => {
                  cy.get("tr:first")
                    .then(($tr) => {
                      let $element;
                      if ($tr.find(":input[type=radio]").is(":checked")) {
                        $element = $tr.next();
                      } else {
                        $element = $tr;
                      }

                      orgLocIndex = $element.index();

                      const route = {
                        alias: "apiSelectedLocationAndCIT",
                        method: "GET",
                        url:
                          `${Cypress.env("host")}` +
                          `${Cypress.env("apiSelectedLocationAndCIT")}?locationId=${organzationLocation[orgLocIndex].locationId}&citId=${
                            organzationLocation[orgLocIndex].citId
                          }`,
                      };
                      cy.server().route(route.method, route.url).as(route.alias);
                      return cy.wrap($element);
                    })
                    .click({ force: true });
                });

                // OK button should be enabled when location was selected
                cy.get("mat-dialog-actions > imo-button > button")
                  .contains("OK")
                  .click({ force: true })
                  .then(() => {
                    cy.wait("@apiSelectedLocationAndCIT").then((xhr) => {
                      const res = xhr.responseBody as SelectedLocationAndCIT;

                      if (Array.isArray(res.currencyDenominations)) {
                        res.currencyDenominations.map((resOrderDetail: ResponseOrderDetail) => {
                          resOrderDetail.denominations.map((denomination: Denomination) => {
                            orderdetails.push({
                              currency: resOrderDetail.currencyCode,
                              denomination: (denomination.faceValue * Math.pow(10, denomination.exponent)).toFixed(2).toString(),
                            });
                          });
                        });
                      }

                      if (res.calendars?.citCalendars) {
                        CITCalendar = res.calendars.citCalendars;
                      }
                    });
                  });
              });
          });
      });

      it("should be displayed citName", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=cit-name]")
            .should("be.visible")
            .then((name) => {
              expect(name.text().trim()).to.be.eq(organzationLocation[0].citName);
            });
        });
      });

      it("should be displayed select a date radio button and should be checked standard order", () => {
        cy.get("mat-radio-group")
          .should("be.visible")
          .within(() => {
            cy.get("mat-radio-button").should("have.length", 2);

            cy.get("mat-radio-button:nth-child(1)")
              .contains("Standard order")
              .within(() => {
                cy.get("input[type=radio]").should("be.checked");
              });

            cy.get("mat-radio-button:nth-child(2)")
              .contains("Emergency order")
              .within(() => {
                cy.get("input[type=radio]").should("not.be.checked").click({ force: true });
              });
          });
      });

      it("standard select input should be displayed tomorrow's date", () => {
        const expectDay = standardDefaultDate.format("M") + "/" + standardDefaultDay + "/" + standardDefaultYear;
        cy.get("[data-test=select-date-standard]").within(() => {
          cy.get("[data-test=date-picker]").should("have.value", expectDay);
        });
      });

      it("should be able to select standard order date and disable emergency order date", () => {
        cy.get("[data-test=select-date] mat-radio-group")
          .should("be.visible")
          .within(() => {
            cy.get("mat-radio-button:nth-child(1)")
              .contains("Standard order")
              .within(() => {
                cy.get("input[type=radio]").should("not.be.checked").click({ force: true }).wait(500);
              });
          });

        cy.get("[data-test=select-date-standard]")
          .should("be.visible")
          .within(() => {
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
              .contains(".mat-calendar-body-cell-content", standardDefaultYear)
              .click();

            // select month after select year
            cy.get("button")
              .parents("body")
              .find(".mat-calendar")
              .should("be.visible")
              .contains(".mat-calendar-body-cell-content", standardDefaultMonth)
              .click();

            // select day after select month and year
            cy.get("button")
              .parents("body")
              .find(".mat-calendar")
              .should("be.visible")
              .contains(".mat-calendar-body-cell-content", standardDefaultDay)
              .click();
          });
        cy.get("[data-test=select-date-emergency]").within(() => {
          cy.get("mat-datepicker-toggle > button").should("be.disabled");
          cy.get("mat-form-field input").should("be.disabled");
        });
      });

      it("emergency select input should be displayed today's date (should be next possible date if today is restricted)", () => {
        let emergencyDefaultDate = Cypress.moment();

        while (isRestrictedDate(emergencyDefaultDate)) {
          emergencyDefaultDate = emergencyDefaultDate.add(1, "day");
        }

        const emergencyDefaultYear = emergencyDefaultDate.format("YYYY");
        const emergencyDefaultMonth = emergencyDefaultDate.format("M");
        const emergencyDefaultDay = emergencyDefaultDate.format("D");

        const expectDay = emergencyDefaultMonth + "/" + emergencyDefaultDay + "/" + emergencyDefaultYear;
        cy.get("[data-test=select-date-emergency]").within(() => {
          cy.get("[data-test=date-picker]").should("have.value", expectDay);
        });
      });

      it("should be able to select emergency order date (date which not be restricted) and disable standard order date", () => {
        cy.get("mat-radio-group")
          .should("be.visible")
          .within(() => {
            cy.get("mat-radio-button:nth-child(2)")
              .contains("Emergency order")
              .within(() => {
                cy.get("input[type=radio]").should("not.be.checked").click({ force: true }).wait(500);
              });
          });
        cy.get("[data-test=select-date-emergency]").should("be.visible");

        let newEmergencyDate = Cypress.moment();

        const checkRestrictedDayIsInactive = (restrictedDate: Moment) => {
          const restrictedDay = restrictedDate.format("D");
          cy.get(".emergency-date").then(($el) => {
            cy.wrap($el).find("mat-datepicker-toggle button").click();

            cy.get(".cdk-overlay-container mat-calendar mat-month-view table")
              .find(`div.mat-calendar-body-cell-content:contains(${restrictedDay})`)
              .parent()
              .should("have.attr", "aria-disabled", "true")
              .and("have.class", "mat-calendar-body-disabled");
          });

          cy.get("body").type("{esc}");
        };

        while (isRestrictedDate(newEmergencyDate)) {
          checkRestrictedDayIsInactive(newEmergencyDate);
          newEmergencyDate = newEmergencyDate.add(1, "day");
        }

        const newEmergencyYear = newEmergencyDate.format("YYYY");
        const newEmergencyMonth = newEmergencyDate.format("MMM").toUpperCase();
        const newEmergencyDay = newEmergencyDate.format("D");

        cy.get("[data-test=select-date-emergency]").within(() => {
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
            .contains(".mat-calendar-body-cell-content", newEmergencyYear)
            .click();

          // select month after select year
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .should("be.visible")
            .contains(".mat-calendar-body-cell-content", newEmergencyMonth)
            .click();

          // select day after select month and year
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .should("be.visible")
            .contains(".mat-calendar-body-cell-content", newEmergencyDay)
            .click();
        });

        cy.get("[data-test=select-date-standard]").within(() => {
          cy.get("mat-datepicker-toggle > button").should("be.disabled");
          cy.get("mat-form-field input").should("be.disabled");
        });
      });

      it("should be able to check request option", () => {
        cy.get("imo-checkbox-list")
          .should("be.visible")
          .within(() => {
            cy.get("mat-checkbox").should("have.length", 2);

            cy.get("mat-checkbox")
              .contains("Request coin pickup")
              .within(() => {
                cy.get("input[type=checkbox]")
                  .should("not.be.checked")
                  .click({ force: true })
                  .should("be.checked")
                  .click({ force: true })
                  .should("not.be.checked");
              });

            cy.get("mat-checkbox")
              .contains("Request note pickup")
              .within(() => {
                cy.get("input[type=checkbox]")
                  .should("not.be.checked")
                  .click({ force: true })
                  .should("be.checked")
                  .click({ force: true })
                  .should("not.be.checked");
              });
          });
      });

      it("should be displayed Order Detail", () => {
        const listItem = [
          "Currency",
          "Denomination",
          "Type",
          "Current Inventory",
          "Desired Inventory",
          "Suggested Need",
          "Pack Size",
          "Suggested Order",
          "Actual Order",
          "Actual Order Value",
        ];
        cy.get("[data-test=order-detail-table] table")
          .should("be.visible")
          .within(() => {
            cy.get("th").each(($th, i) => {
              expect($th).to.contain(listItem[i]);
            });
          });
      });

      it("Order Detail should have denominations that returns API ", () => {
        cy.get("[data-test=order-detail-table] table tbody")
          .find("tr td:nth-child(1)")
          .each(($td, i) => {
            expect($td.text().trim()).to.be.eq(orderdetails[i].currency);
          });

        cy.get("[data-test=order-detail-table] table tbody")
          .find("tr td:nth-child(2)")
          .each(($td, i) => {
            expect($td.text().trim()).to.be.eq(orderdetails[i].denomination);
          });
      });

      it("Should be able to Input Actual Order", () => {
        cy.get("[data-test=order-detail-table] table tr td Input")
          .eq(0)
          .type("{selectall}{backspace}")
          .type("111111")
          .should(($Input) => {
            expect($Input.val()).to.be.eq("111111");
          });
      });

      it("Actual Order can only input up to 7 digits", () => {
        cy.get("[data-test=order-detail-table] table tr td Input")
          .eq(0)
          .type("{selectall}{backspace}")
          .type("12345678")
          .should(($Input) => {
            expect($Input.val()).to.be.eq("1234567");
          });
      });

      it("0 should be displayed when a character is entered in Actual Order", () => {
        cy.get("[data-test=order-detail-table] table tr td Input")
          .eq(1)
          .type("{selectall}{backspace}")
          .type("abc")
          .should(($Input) => {
            expect($Input.val()).to.be.eq("0");
          });
      });

      it("0 should be displayed when nothing is entered in Actual Order", () => {
        cy.get("[data-test=order-detail-table] table tr td Input")
          .eq(1)
          .type("{selectall}{backspace}")
          .clear()
          .should(($Input) => {
            expect($Input.val()).to.be.eq("0");
          });
      });

      it("Should be focused next Input when the enter key is pressed expect the last row", () => {
        const maxlength = orderdetails.length;
        cy.get("[data-test=order-detail-table] table tr Input")
          .as("Input")
          .each((_, i) => {
            if (i !== maxlength - 1) {
              const n = i + 1;
              cy.get("@Input")
                .eq(i)
                .type("{enter}")
                .then(() => {
                  cy.get("@Input").eq(n).should("be.focused");
                });
            }
          });
      });

      it("If it is the last row in the table, pressing enter will not move the cursor.", () => {
        const maxlength = orderdetails.length;
        cy.get("[data-test=order-detail-table] table tr Input")
          .as("Input")
          .each((_, i) => {
            if (i === maxlength - 1) {
              cy.get("@Input")
                .eq(i)
                .type("{enter}")
                .then(() => {
                  cy.get("@Input").eq(i).should("be.focused");
                });
            }
          });
      });

      it("Should be display Actual Order Value when the Actual Order Input", () => {
        const actualOrder = "1099";
        let actualOrderValue: number;
        cy.get("[data-test=order-detail-table] table tr td Input")
          .eq(1)
          .type(actualOrder)
          .then(() => {
            cy.get("[data-test=order-detail-table] table tbody tr td:nth-child(1)")
              .eq(1)
              .then(() => {});
            cy.get("[data-test=order-detail-table] table tbody tr td:nth-child(2)")
              .eq(1)
              .then(($value) => {
                const denomination = $value.text();
                actualOrderValue = Number(actualOrder) * Number(denomination);
              });
            cy.get("[data-test=order-detail-table] table tbody tr td:nth-child(10)")
              .eq(1)
              .then(($value) => {
                expect($value.text().substr(2).trim()).to.be.eq(
                  actualOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                );
              });
          });
      });

      it("should be displayed print button and after press it orderNumber should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=order-print]")
            .should("be.visible")
            .then((print) => {
              expect(print.text().trim()).to.be.eq("Print");
            });
        });
      });

      it("should be displayed request button and after press it orderNumber should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=order-request]")
            .should("be.visible")
            .then((req) => {
              expect(req.text().trim()).to.be.eq("Request");
            });
        });
      });
    });

    context("if order currency denominations is empty", () => {
      organzationLocation = [];

      beforeEach("", () => {
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.root()
              .find("imo-alert")
              .within(($alert) => {
                if ($alert.is(":visible")) {
                  cy.root().find("imo-button > button").contains("OK").click().wait(100);
                }
              });

            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                let orgLocIndex = 0;

                // select a location
                cy.get(".mat-table tbody").within(() => {
                  cy.get("tr:first")
                    .then(($tr) => {
                      let $element;
                      if ($tr.find(":input[type=radio]").is(":checked")) {
                        $element = $tr;
                      } else {
                        $element = $tr;
                      }

                      orgLocIndex = $element.index();

                      const route = {
                        alias: "apiSelectedLocationAndCIT",
                        method: "GET",
                        url:
                          `${Cypress.env("host")}` +
                          `${Cypress.env("apiSelectedLocationAndCIT")}?locationId=${organzationLocation[orgLocIndex].locationId}&citId=${
                            organzationLocation[orgLocIndex].citId
                          }`,
                        response: {
                          currencyDenominations: [],
                          calendars: {
                            citCalendars: {
                              holidays: [],
                              workingDays: {
                                monday: true,
                                tuesday: true,
                                wednesday: true,
                                thursday: true,
                                friday: true,
                                saturday: false,
                                sunday: false,
                              },
                            },
                          },
                        },
                      };
                      cy.server().route(route.method, route.url, route.response).as(route.alias);
                      return cy.wrap($element);
                    })
                    .click({ force: true });
                });

                // OK button should be enabled when location was selected
                cy.get("mat-dialog-actions > imo-button > button")
                  .contains("OK")
                  .click({ force: true })
                  .then(() => {
                    cy.wait("@apiSelectedLocationAndCIT").then(() => {});
                  });
              });
          });
      });

      it("should not be able to click print, save and request button", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").should("be.disabled");
          cy.get("imo-button > button").contains("Cancel").should("not.be.disabled");
          cy.get("imo-button > button").contains("Print").should("be.disabled");
          cy.get("imo-button > button").contains("Request").should("be.disabled");
        });
      });
    });

    context("press save and cancel button", () => {
      let orderdetails: OrderDetail[];
      organzationLocation = [];

      beforeEach("", () => {
        orderdetails = [];
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.root()
              .find("imo-alert")
              .within(($alert) => {
                if ($alert.is(":visible")) {
                  cy.root().find("imo-button > button").contains("OK").click().wait(100);
                }
              });

            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                let orgLocIndex = 0;

                // select a location
                cy.get(".mat-table tbody").within(() => {
                  cy.get("tr:first")
                    .then(($tr) => {
                      let $element;
                      if ($tr.find(":input[type=radio]").is(":checked")) {
                        $element = $tr;
                      } else {
                        $element = $tr;
                      }

                      orgLocIndex = $element.index();

                      const route = {
                        alias: "apiSelectedLocationAndCIT",
                        method: "GET",
                        url:
                          `${Cypress.env("host")}` +
                          `${Cypress.env("apiSelectedLocationAndCIT")}?locationId=${organzationLocation[orgLocIndex].locationId}&citId=${
                            organzationLocation[orgLocIndex].citId
                          }`,
                      };
                      cy.server().route(route.method, route.url).as(route.alias);
                      return cy.wrap($element);
                    })
                    .click({ force: true });
                });

                // OK button should be enabled when location was selected
                cy.get("mat-dialog-actions > imo-button > button")
                  .contains("OK")
                  .click({ force: true })
                  .then(() => {
                    cy.wait("@apiSelectedLocationAndCIT").then((xhr) => {
                      const res = xhr.responseBody as SelectedLocationAndCIT;

                      if (Array.isArray(res.currencyDenominations)) {
                        res.currencyDenominations.map((resOrderDetail: ResponseOrderDetail) => {
                          resOrderDetail.denominations.map((denomination: Denomination) => {
                            orderdetails.push({
                              currency: resOrderDetail.currencyCode,
                              denomination: (denomination.faceValue * Math.pow(10, denomination.exponent)).toFixed(2).toString(),
                            });
                          });
                        });
                      }
                    });
                  });
              });
          });
      });

      it("should be able to click save and cancel button", () => {
        let orderNumber: string;
        cy.get("[data-test=order-detail-table] table tr td Input").eq(1).type("{selectall}{backspace}").type("10");

        cy.server()
          .route("POST", Cypress.env("host") + Cypress.env("apiOrderSave"))
          .as("apiOrderSavePost");

        // click save button and request POST
        cy.get("imo-button").contains("Save").click();
        // cy.get("imo-button")
        //   .parents("body")
        //   .find("imo-loading .spinner")
        //   .should("be.visible");

        cy.wait("@apiOrderSavePost").then((xhr) => {
          const res = xhr.responseBody;
          if (typeof res === "object") {
            orderNumber = res.orderNumber;
          }
          cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Created.");

          cy.get("button")
            .parents("body")
            .find(".mat-simple-snackbar-action button")
            .click()
            .then(() => {
              cy.get("imo-button").parents("body").find("snack-bar-container").should("not.be.visible");
              cy.get("[data-test=order-number]").contains(orderNumber).should("be.visible");
            });

          cy.server()
            .route("PUT", +Cypress.env("apiOrderSave") + "/" + orderNumber)
            .as("apiOrderSavePut");

          // click save button and request PUT
          cy.get("imo-button")
            .contains("Save")
            .click()
            .then(() => {
              // cy.get("imo-button")
              //   .parents("body")
              //   .find("imo-loading .spinner")
              //   .should("be.visible");

              cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Updated.");

              cy.get("button")
                .parents("body")
                .find(".mat-simple-snackbar-action button")
                .click()
                .then(() => {
                  cy.get("imo-button").parents("body").find("snack-bar-container").should("not.be.visible");
                });
            });
        });

        // press cancel button
        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiViewOrders"))
          .as("apiViewOrders");

        cy.get("imo-button")
          .contains("Cancel")
          .click()
          .wait("@apiViewOrders")
          .then(() => {
            cy.url().should("include", Cypress.env("pageOrders"));
          });

        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
          .as("apiOrderStart");
        cy.visit(Cypress.env("createOrder")).wait("@apiOrderStart");

        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // select a location
                cy.get(".mat-table").then(() => {
                  cy.get("tbody")
                    .as("row")
                    .each((_, i) => {
                      cy.get("@row")
                        .eq(i)
                        .within(() => {
                          cy.get("tr:first").click({ force: true });
                        });
                    });
                });
              });
            cy.get("mat-dialog-actions > imo-button > button").contains("OK").click();
          });

        it("snack-bar should be hidden when transitioning to another screen with the cancel button", () => {
          cy.get("[data-test=order-detail-table] table tr td textarea").eq(1).type("{selectall}{backspace}").type("10");

          cy.server()
            .route("POST", Cypress.env("host") + Cypress.env("apiOrderSave"))
            .as("apiOrderSavePost");

          // click save button and request POST and display snack-bar
          cy.get("imo-button").contains("Save").click();

          cy.wait("@apiOrderSavePost").then((xhr) => {
            const res = xhr.responseBody;
            if (typeof res === "object") {
              orderNumber = res.orderNumber;
            }
            cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Created.");
          });

          // Press the cancel button with the snack-bar displayed and leave the screen
          cy.get("imo-button")
            .contains("Cancel")
            .click()
            .then(() => {
              cy.get("button")
                .parents("body")
                .find("mat-dialog-container")
                .within(() => {
                  cy.get(".description").contains("Are you sure you want to leave this page?");
                  cy.get(".confirm").contains("Yes").click();
                });
            });

          // Check the display on the Orders screen
          cy.url().should("include", Cypress.env("pageOrders"));

          cy.get("body").find("snack-bar-container").should("not.be.visible");

          // return to create-order screen
          cy.server()
            .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
            .as("apiOrderStart");
          cy.visit(Cypress.env("createOrder")).wait("@apiOrderStart");
        });
      });
    });

    context("click cancel button when nothing selected", () => {
      it("should redirect to Orders page without alert dialog", () => {
        cy.visit(Cypress.env("createOrder"));
        cy.get("imo-button").contains("Cancel").click();
        cy.url().should("include", Cypress.env("pageOrders"));
      });

      it("should redirect to Orders list page without alert dialog when click back arrow", () => {
        cy.visit(Cypress.env("createOrder"));
        cy.get(".page-content").within(() => {
          cy.get(".page-title > button > mat-icon").contains("arrow_back").click({ force: true });
        });
        cy.url().should("include", Cypress.env("pageOrders"));
      });
    });

    context("click cancel button when made any changes and leave without saving", () => {
      beforeEach("", () => {
        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
          .as("apiOrderStart");
        cy.visit(Cypress.env("createOrder")).wait("@apiOrderStart");
      });

      it("should show the alert dialog and stay at create order page if click cancel button", () => {
        // open select organization and location daialog and select a location
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // select a location
                cy.get(".mat-table").then(() => {
                  cy.get("tbody")
                    .as("row")
                    .each((_, i) => {
                      cy.get("@row")
                        .eq(i)
                        .within(() => {
                          cy.get("tr:first").click({ force: true });
                        });
                    });
                });
                // OK button should be abled when location was selcted
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click();
              });
            // loading is displayed until API returns
            // cy.get("imo-button")
            //   .parents("body")
            //   .find("imo-loading .spinner")
            //   .should("be.visible")
          });
        // press cancel button
        cy.get("imo-button")
          .contains("Cancel")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                cy.get(".description").contains("Are you sure you want to leave this page? All changes will be lost.");
                cy.get(".confirm").contains("Yes").should("be.visible");
                // press No button
                cy.get(".cancel").contains("No").should("be.visible").click();
              });
          });
        cy.get("mat-dialog-container").should("not.exist");
        cy.url().should("include", "/create-order");
      });

      it("should show the alert dialog and redirect to Orders page if click leave button", () => {
        // open select organization and location daialog and select a location
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // select a location
                cy.get(".mat-table").then(() => {
                  cy.get("tbody")
                    .as("row")
                    .each((_, i) => {
                      cy.get("@row")
                        .eq(i)
                        .within(() => {
                          cy.get("tr:first").click({ force: true });
                        });
                    });
                });
                // OK button should be abled when location was selcted
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click();
              });
            // loading is displayed until API returns
            // cy.get("imo-button")
            //   .parents("body")
            //   .find("imo-loading .spinner")
            //   .should("be.visible")
          });
        // press cancel button
        cy.get("imo-button")
          .contains("Cancel")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                cy.get(".description").contains("Are you sure you want to leave this page? All changes will be lost.");
                cy.get(".cancel").contains("No").should("be.visible");
                // press Yes button
                cy.get(".confirm").contains("Yes").should("be.visible").click();
              });
          });
        cy.get("mat-dialog-container").should("not.exist");
        cy.url().should("include", Cypress.env("pageOrders"));
      });
    });

    context("press print button", () => {
      let orderdetails: OrderDetail[];
      organzationLocation = [];

      beforeEach("", () => {
        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
          .as("apiOrderStart");
        cy.visit(Cypress.env("createOrder")).wait("@apiOrderStart");
        orderdetails = [];
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                let orgLocIndex = 0;

                // select a location
                cy.get(".mat-table tbody").within(() => {
                  cy.get("tr:first")
                    .then(($tr) => {
                      let $element;
                      if ($tr.find(":input[type=radio]").is(":checked")) {
                        $element = $tr.next();
                      } else {
                        $element = $tr;
                      }

                      orgLocIndex = $element.index();
                      const route = {
                        alias: "apiSelectedLocationAndCIT",
                        method: "GET",
                        url:
                          `${Cypress.env("host")}` +
                          `${Cypress.env("apiSelectedLocationAndCIT")}?locationId=${organzationLocation[orgLocIndex].locationId}&citId=${
                            organzationLocation[orgLocIndex].citId
                          }`,
                      };
                      cy.server().route(route.method, route.url).as(route.alias);
                      return cy.wrap($element);
                    })
                    .click({ force: true });
                });

                // OK button should be enabled when location was selected
                cy.get("mat-dialog-actions > imo-button > button")
                  .contains("OK")
                  .click({ force: true })
                  .then(() => {
                    cy.wait("@apiSelectedLocationAndCIT").then((xhr) => {
                      const res = xhr.responseBody as SelectedLocationAndCIT;

                      if (Array.isArray(res.currencyDenominations)) {
                        res.currencyDenominations.map((resOrderDetail: ResponseOrderDetail) => {
                          resOrderDetail.denominations.map((denomination: Denomination) => {
                            orderdetails.push({
                              currency: resOrderDetail.currencyCode,
                              denomination: (denomination.faceValue * Math.pow(10, denomination.exponent)).toFixed(2).toString(),
                            });
                          });
                        });
                      }
                    });
                  });
              });
          });
      });

      it("press print button and orderNumber is displayed", () => {
        let orderNumber: string;
        cy.server()
          .route("POST", Cypress.env("host") + Cypress.env("apiOrderSave"))
          .as("apiOrderSavePost");

        // click print button and request POST create-order-save
        cy.get("imo-button").contains("Print").click({ force: true });
        cy.wait("@apiOrderSavePost").then((xhr) => {
          const res = xhr.responseBody;
          if (typeof res === "object") {
            orderNumber = res.orderNumber;
          }

          cy.server().route("POST", Cypress.env("host") + Cypress.env("apiPrintOrder") + "/" + orderNumber + "/create");

          cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Created");

          cy.get("button")
            .parents("body")
            .find(".mat-simple-snackbar-action button")
            .click()
            .then(() => {
              cy.get("imo-button").parents("body").find("snack-bar-container").should("not.be.visible");
              cy.get("[data-test=order-number]").contains(orderNumber).should("be.visible");
            });

          cy.server()
            .route("PUT", +Cypress.env("apiOrderSave") + "/" + orderNumber)
            .as("apiOrderSavePut");

          // click print button and request PUT
          cy.get("imo-button")
            .contains("Print")
            .click({ force: true })
            .then(() => {
              cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Updated");

              cy.get("button")
                .parents("body")
                .find(".mat-simple-snackbar-action button")
                .click()
                .then(() => {
                  cy.get("imo-button").parents("body").find("snack-bar-container").should("not.be.visible");
                });
            });
        });
      });
    });

    context("press request button", () => {
      let orderdetails: OrderDetail[];
      organzationLocation = [];

      beforeEach("", () => {
        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
          .as("apiOrderStart");
        cy.visit(Cypress.env("createOrder")).wait("@apiOrderStart");
        orderdetails = [];
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                let orgLocIndex = 0;

                // select a location
                cy.get(".mat-table tbody").within(() => {
                  cy.get("tr:first")
                    .then(($tr) => {
                      let $element;
                      if ($tr.find(":input[type=radio]").is(":checked")) {
                        $element = $tr.next();
                      } else {
                        $element = $tr;
                      }

                      orgLocIndex = $element.index();

                      const route = {
                        alias: "apiSelectedLocationAndCIT",
                        method: "GET",
                        url:
                          `${Cypress.env("host")}` +
                          `${Cypress.env("apiSelectedLocationAndCIT")}?locationId=${organzationLocation[orgLocIndex].locationId}&citId=${
                            organzationLocation[orgLocIndex].citId
                          }`,
                      };
                      cy.server().route(route.method, route.url).as(route.alias);
                      return cy.wrap($element);
                    })
                    .click({ force: true });
                });

                // OK button should be enabled when location was selected
                cy.get("mat-dialog-actions > imo-button > button")
                  .contains("OK")
                  .click({ force: true })
                  .then(() => {
                    cy.wait("@apiSelectedLocationAndCIT").then((xhr) => {
                      const res = xhr.responseBody as SelectedLocationAndCIT;

                      if (Array.isArray(res.currencyDenominations)) {
                        res.currencyDenominations.map((resOrderDetail: ResponseOrderDetail) => {
                          resOrderDetail.denominations.map((denomination: Denomination) => {
                            orderdetails.push({
                              currency: resOrderDetail.currencyCode,
                              denomination: (denomination.faceValue * Math.pow(10, denomination.exponent)).toFixed(2).toString(),
                            });
                          });
                        });
                      }
                    });
                  });
              });
          });
      });

      it("press request button and orderNumber is displayed", () => {
        let orderNumber: string;
        cy.server()
          .route("POST", Cypress.env("host") + Cypress.env("apiOrderSave"))
          .as("apiOrderSavePost");

        // click request button and request POST create-order-save
        cy.get("imo-button").contains("Request").click({ force: true });
        cy.wait("@apiOrderSavePost").then((xhr) => {
          const res = xhr.responseBody;
          if (typeof res === "object") {
            orderNumber = res.orderNumber;
          }
          cy.server().route("PUT", Cypress.env("host") + Cypress.env("apiRequestOrder") + "/" + orderNumber);
          cy.url().should("include", Cypress.env("pageOrders"));
        });
      });
    });
  });

  context("should display error message", () => {
    it("click save and return error, should display error message", () => {
      cy.server()
        .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
        .as("apiOrderStart");

      cy.visit(Cypress.env("createOrder")).wait("@apiOrderStart");

      cy.get("imo-button")
        .contains("Select")
        .click()
        .then(() => {
          cy.get("button")
            .parents("body")
            .find("mat-dialog-container")
            .within(() => {
              // select a location
              cy.get(".mat-table tbody tr:first").click({ force: true });

              // OK button should be abled when location was selcted
              cy.get("mat-dialog-actions > imo-button > button").contains("OK").click({ force: true });
            });
        })
        .then(() => {
          cy.wait(1000);
          cy.server({
            method: "POST",
            delay: 1000,
            status: 404,
            response: {},
          })
            .route("POST", Cypress.env("host") + Cypress.env("apiOrderSave"))
            .as("apiOrderSave");

          // press Save button
          cy.get("imo-button").contains("Save").click();

          cy.wait("@apiOrderSave").then(() => {
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

    it("click save when enter total value over pavement limit", () => {
      const organzationLocations: OrganizationLocation[] = [];

      cy.server()
        .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"))
        .as("apiOrderStart");

      cy.visit(Cypress.env("createOrder"))
        .wait("@apiOrderStart")
        .then((xhr) => {
          const res = xhr.responseBody;

          if (typeof res === "object") {
            res.map((organization: Organization) => {
              organization.locations.map((location: Location) => {
                organzationLocations.push({
                  organizationId: organization.id,
                  organizationName: organization.name,
                  locationId: location.id,
                  locationName: location.name,
                  citId: location.citId,
                  citName: location.citName,
                  pavementLimit: location.pavementLimit,
                });
              });
            });
          }
        })
        .then(() => {
          let totalValue = 0;

          if (organzationLocations.length) {
            cy.get("imo-button")
              .contains("Select")
              .click()
              .then(() => {
                cy.get("button")
                  .parents("body")
                  .find("mat-dialog-container")
                  .within(() => {
                    // select a location
                    cy.get(".mat-table tbody tr:first").click({ force: true });

                    // OK button should be abled when location was selcted
                    cy.get("mat-dialog-actions > imo-button > button").contains("OK").click({ force: true });
                  });
              })
              .then(() => {
                cy.get("imo-order-detail-table tbody tr td.mat-column-actualOrderInputField").first().find("input").type("9999999");

                // Get total value of order
                cy.get("imo-order-detail-table tbody tr td.mat-column-actualOrderValue").within(($rows) => {
                  totalValue = Cypress._.reduce(
                    $rows,
                    (prev, curr) => {
                      return prev + Number(curr.innerText.replace(/[^0-9.]/g, ""));
                    },
                    0,
                  );
                });

                // press Save button
                cy.get("imo-button").contains("Save").click();
              })
              .then(() => {
                const { pavementLimit } = Cypress._.first(organzationLocations) || { pavementLimit: 0 };

                if (Number(pavementLimit) > 0 && totalValue > Number(pavementLimit)) {
                  cy.get("button")
                    .parents("body")
                    .find("mat-dialog-container")
                    .should("be.visible")
                    .within(() => {
                      cy.get(".description").contains(
                        "Order value exceeds the CIT pavement limit of :pavementLimit".replace(`:pavementLimit`, `${pavementLimit}`),
                      );
                      cy.get(".confirm").contains("OK").should("be.visible").click();
                    });
                  cy.get("mat-dialog-container").should("not.exist");
                }
              });
          }
        });
    });
  });

  context("there is only one organization", () => {
    let organzationLocation: OrganizationLocation[] = [];
    beforeEach(() => {
      cy.server()
        .route("GET", Cypress.env("host") + Cypress.env("apiOrderStart"), `fx:create-order/organization`)
        .as("apiOrderStart");

      cy.visit(Cypress.env("createOrder"))
        .wait("@apiOrderStart")
        .then((xhr) => {
          organzationLocation = [];
          const res = xhr.responseBody;
          if (typeof res === "object") {
            res.map((organization: Organization) => {
              organization.locations.map((location: Location) => {
                organzationLocation.push({
                  organizationId: organization.id,
                  organizationName: organization.name,
                  locationId: location.id,
                  locationName: location.name,
                  citId: location.citId,
                  citName: location.citName,
                  pavementLimit: location.pavementLimit,
                });
              });
            });
          }
        });
    });

    context("initial display", () => {
      it("page title should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title").should("be.visible").contains("Create order");
        });
      });

      it("order number should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=order-number]").should("not.be.visible");
        });
      });

      it("orgenization-location table should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=company-location-table] table tbody")
            .find("tr td:nth-child(1)")
            .should(($td) => {
              expect($td.text().trim()).to.be.eq(organzationLocation[0].organizationName);
            });

          cy.get("[data-test=company-location-table] table tbody")
            .find("tr td:nth-child(2)")
            .should(($td) => {
              expect($td.text().trim()).to.have.length(0);
            });
        });
      });

      it("select location button should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-button").contains("Select").should("be.visible");
        });
      });

      it("select date should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=select-date]").should("not.be.visible");
        });
      });

      it("pickup option should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=pickup-option]").should("not.be.visible");
        });
      });

      it("order detail should not be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=order-detail]").should("not.be.visible");
        });
      });

      it("confirm button disable or not", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").should("be.disabled");

          cy.get("imo-button > button").contains("Cancel").should("not.be.disabled");
        });
      });
    });

    context("select location", () => {
      it("should be displayed organization-location select dialog", () => {
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                cy.get(".mat-dialog-title").contains("Select Location");

                cy.get(".mat-table")
                  .should("be.visible")
                  .find("tr")
                  .its("length")
                  .should("be.eq", organzationLocation.length + 1);

                // confirm OK button disable when no location selected
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("be.disabled");

                // press cancel button without select a location
                cy.get("mat-dialog-actions > imo-button > button").contains("Cancel").click();
              });
          });
      });

      it("press cancel button without select a location", () => {
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // press cancel button without select a location
                cy.get("mat-dialog-actions > imo-button > button").contains("Cancel").click();
              });
          });

        // confirm selected organization & location table (when no location selected)
        cy.get("[data-test=company-location-table] table")
          .find("tr td:nth-child(1)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].organizationName);
          });

        cy.get("[data-test=company-location-table] table")
          .find("tr td:nth-child(2)")
          .should(($td) => {
            expect($td.text().trim()).to.have.length(0);
          });
      });

      it("select a location", () => {
        // open select organization and location dialog and select a location
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // select a location
                cy.get(".mat-table")
                  .should("be.visible")
                  .then(() => {
                    cy.get("tbody")
                      .as("row")
                      .each((_, i) => {
                        cy.get("@row")
                          .eq(i)
                          .within(() => {
                            cy.get("tr:first").click({ force: true });
                          });
                      });
                  });
                // OK button should be abled when location was selected
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click();
              });
            // loading is displayed until API returns
            // cy.get("imo-button")
            //   .parents("body")
            //   .find("imo-loading .spinner")
            //   .should("be.visible")
          });

        // confirm selected organization & location table (when a location selected)
        cy.get("[data-test=company-location-table] table tbody").should(($tbody) => {
          expect($tbody).to.have.length(1);
        });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(1)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].organizationName);
          });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(2)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].locationName);
          });

        // confirm button disable or not
        cy.get("imo-button > button").contains("Save").should("not.be.disabled");

        // select date should be displayed
        cy.get(".page-content").within(() => {
          cy.get("[data-test=select-date]").should("be.visible");
        });

        // pickup option should be displayed
        cy.get(".page-content").within(() => {
          cy.get("[data-test=pickup-option]").should("be.visible");
        });

        // order detail should be displayed"
        cy.get(".page-content").within(() => {
          cy.get("[data-test=order-detail]").should("be.visible");
        });
      });

      it("Re-select location and should be displayed confirm change location dialog", () => {
        // open select organization and location dialog and select a location
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(() => {
            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .within(() => {
                // select a location
                cy.get(".mat-table").then(() => {
                  cy.get("tbody")
                    .as("row")
                    .each((_, i) => {
                      cy.get("@row")
                        .eq(i)
                        .within(() => {
                          cy.get("tr:first").click({ force: true });
                        });
                    });
                });
                // OK button should be abled when location was selected
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").click().wait(100);
              });
          });

        // Re-select location and should be displayed confirm change location dialog
        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(($target) => {
            // Check imo alert should be visible
            cy.wrap($target)
              .parents("body")
              .find("mat-dialog-container > imo-alert")
              .should("be.visible")
              .within(() => {
                // Check content in dialog
                cy.get(".description").contains("Changing the location will clear all existing selections.");

                cy.get(".confirm").contains("OK").should("not.be.disabled");

                // Click cancel button and should not do anything
                cy.get(".cancel").contains("Cancel").should("be.visible").click();
              });
          });

        // confirm selected organization & location table (when click button cancel)
        cy.get("[data-test=company-location-table] table tbody").should(($tbody) => {
          expect($tbody).to.have.length(1);
        });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(1)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].organizationName);
          });

        cy.get("[data-test=company-location-table] table tbody")
          .find("tr td:nth-child(2)")
          .should(($td) => {
            expect($td.text().trim()).to.be.eq(organzationLocation[0].locationName);
          });

        cy.get("imo-button")
          .contains("Select")
          .click()
          .then(($target) => {
            // Check imo alert should be visible
            cy.wrap($target)
              .parents("body")
              .find("mat-dialog-container > imo-alert")
              .should("be.visible")
              .within(() => {
                // Check content in dialog
                cy.get(".description").contains("Changing the location will clear all existing selections.");

                cy.get(".cancel").contains("Cancel").should("be.visible");

                // Click ok button and displayed Select Organisation Location dialog
                cy.get(".confirm").contains("OK").should("not.be.disabled").click();
              });

            cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("be.disabled");

            cy.get("mat-dialog-container  .mat-table")
              .should("be.visible")
              .within(() => {
                cy.get("tbody")
                  .as("row")
                  .each((_, i) => {
                    cy.get("@row")
                      .eq(i)
                      .within(() => {
                        // Check first radio should be checked
                        cy.get("tr:first").within(() => {
                          cy.get("input[type=radio]").should("be.checked");
                        });

                        // Select second row
                        cy.get("tr:nth-child(2)").click({ force: true });
                      });
                  });
              });

            // OK button should be abled when location was selected
            cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click();
          });

        // confirm selected organization & location table (when click button OK)
        cy.get("[data-test=company-location-table] > table")
          .should("be.visible")
          .within(() => {
            cy.get("tbody").should(($tbody) => {
              expect($tbody).to.have.length(1);
            });

            cy.get("tr").within(() => {
              cy.get("td")
                .eq(0)
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(organzationLocation[1].organizationName);
                });

              cy.get("td")
                .eq(1)
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(organzationLocation[1].locationName);
                });
            });
          });
      });
    });
  });
});
