describe("Story-Edit CIT", () => {
  interface Templates {
    id: number | string;
    templateName: string;
    default: boolean;
  }

  interface Locations {
    companyId: string;
    companyName: string;
    locationId: string | number;
    locationName: string;
  }

  interface Location {
    id: string | number;
    name: string;
  }

  interface Organization {
    companyId: string;
    companyName: string;
    locations: Location[];
  }

  interface OrderTemplate {
    format: string;
    default: boolean;
    templates: Templates[];
  }

  interface Pickup {
    notes: boolean;
    notesCollect: boolean;
    notesCollectRemove: boolean;
    coins: boolean;
    coinsCollect: boolean;
    coinsCollectRemove: boolean;
  }

  interface Delivery {
    notes: boolean;
    notesReplenish: boolean;
    coins: boolean;
    coinsReplenish: boolean;
  }

  interface RetailerLocations {
    companyId: string;
    companyName: string;
    locations: Location[];
  }

  interface SFTPMethod {
    url: string;
    optionalFolder: string;
    port: number | string;
    user: string;
    password: string;
  }

  interface EmailMethod {
    emailAddress: string;
  }

  interface CurrencyInit {
    code: string;
    name?: string;
    decimalPlaces?: number;
    denominations: DenominationInit[];
  }

  interface DenominationInit {
    selected: boolean;
    faceValue: number;
    type: string;
    symbol?: string;
    exponent: number;
    currencyUnits: CurrencyUnits;
  }

  interface CurrencyUnits {
    options: string[];
    defaultUnit: string;
    defaultCount: number;
  }

  interface Currency {
    code: string;
    name?: string;
    symbol?: string;
    decimalPlaces?: number;
    denominations: Denomination[];
  }

  interface Denomination {
    faceValue: number;
    type: string;
    unit: string;
    quantityPerUnit: number;
    symbol?: string;
    exponent: number;
  }

  interface HolidayCalendar {
    calendarId: number;
    calendarName: string;
    holidays: Array<HolidayItem>;
  }

  interface HolidayItem {
    name: string;
    date: string;
    isSkippable: boolean;
    orderOffset: number;
    serviceOffset: number;
  }

  interface GetEditCIT {
    initialValue: {
      name: string;
      reference: string;
      contactName: string;
      contactPhoneNumber: string;
      contactEmail: string;
      addressLine1: string;
      addressLine2: string;
      addressLine3: string;
      state: string;
      postalCode: string;
      country: string;
      description: string;
      comments: string;
      pickup: Pickup;
      delivery: Delivery;
      pavementLimit: string;
      workingDays: {
        [key: string]: {
          isWorking: boolean;
          leadDays: number;
        };
      };
      cutOffTime: string;
      orderFormats: string[];
      orderTemplates: OrderTemplate[];
      orderMethods: string[];
      retailerLocations: RetailerLocations[];
      currencies: CurrencyInit[];
      holidayCalendars: Array<HolidayCalendar>;
    };
    setValue: {
      name: string;
      reference: string;
      contactName: string;
      contactPhoneNumber: string;
      contactEmail: string;
      addressLine1: string;
      addressLine2: string;
      addressLine3: string;
      state: string;
      postalCode: string;
      country: string;
      description: string;
      comments: string;
      pickup: Pickup;
      delivery: Delivery;
      pavementLimit: string;
      workingDays: {
        [key: string]: {
          isWorking: boolean;
          leadDays: number;
        };
      };
      cutOffTime: string;
      orderPolicy: {
        orderFormat: string;
        orderTemplateId: string;
        orderTemplateName: string;
        orderMethod: string;
        manual: unknown;
        email?: EmailMethod;
        sftp?: SFTPMethod;
      };
      retailerLocations: RetailerLocations[];
      currencies: Currency[];
      holidayCalendars: Array<HolidayCalendar>;
    };
  }

  const endpoints = Cypress.env("citEndpoints");

  let citEditData: GetEditCIT;

  const visitTab = (tabName: string): void => {
    cy.server()
      .route("GET", Cypress.env("host") + endpoints.apiGetEditCIT + "1")
      .as("apiGetEditCIT");

    cy.visit(endpoints.pageEditCIT + "1")
      .wait("@apiGetEditCIT")
      .then((xhr) => {
        citEditData = xhr.responseBody as GetEditCIT;
      });

    cy.get(".page-content").within(() => {
      cy.get(".mat-tab-label-content").contains(tabName).click();
    });
  };

  const visitGeneralTab = (): void => {
    visitTab("General");
  };

  const visitServicesTab = (): void => {
    visitTab("Services");
  };

  const visitCalendarTab = () => {
    visitTab("Calendar");
  };

  const visitLocationsTab = (): void => {
    visitTab("Locations");
  };

  const visitOrderTab = (): void => {
    visitTab("Order");
  };

  context("initial display edit cit page", () => {
    context("display of general form", () => {
      before(() => {
        visitGeneralTab();
      });

      it("page title should be displayed name of cit", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title")
            .should("be.visible")
            .contains(citEditData.setValue.name || citEditData.initialValue.name);
        });
      });

      it("confirm button disable or not", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").should("not.be.disabled");

          cy.get("imo-button > button").contains("Cancel").should("not.be.disabled");
        });
      });

      it("confirm input should be display value from api", () => {
        cy.get("[data-test=input-form]").within(() => {
          cy.get("input").then(($input) => {
            cy.wrap($input)
              .eq(0)
              .should("have.value", citEditData.setValue.name || citEditData.initialValue.name);

            cy.wrap($input)
              .eq(1)
              .should("have.value", citEditData.setValue.reference || citEditData.initialValue.reference);
            cy.wrap($input)
              .eq(2)
              .should("have.value", citEditData.setValue.contactName || citEditData.initialValue.contactName);

            cy.wrap($input)
              .eq(3)
              .should("have.value", citEditData.setValue.contactPhoneNumber || citEditData.initialValue.contactPhoneNumber);

            cy.wrap($input)
              .eq(4)
              .should("have.value", citEditData.setValue.contactEmail || citEditData.initialValue.contactEmail);

            cy.wrap($input)
              .eq(5)
              .should("have.value", citEditData.setValue.addressLine1 || citEditData.initialValue.addressLine1);

            cy.wrap($input)
              .eq(6)
              .should("have.value", citEditData.setValue.addressLine2 || citEditData.initialValue.addressLine2);

            cy.wrap($input)
              .eq(7)
              .should("have.value", citEditData.setValue.addressLine3 || citEditData.initialValue.addressLine3);

            cy.wrap($input)
              .eq(8)
              .should("have.value", citEditData.setValue.state || citEditData.initialValue.state);

            cy.wrap($input)
              .eq(9)
              .should("have.value", citEditData.setValue.postalCode || citEditData.initialValue.postalCode);

            cy.wrap($input)
              .eq(10)
              .should("have.value", citEditData.setValue.country || citEditData.initialValue.country);
          });
        });
        cy.get("[data-test=input-form]").within(() => {
          cy.get("textarea").then(($text) => {
            cy.wrap($text)
              .eq(0)
              .should("have.value", citEditData.setValue.description || citEditData.initialValue.description);

            cy.wrap($text)
              .eq(1)
              .should("have.value", citEditData.setValue.comments || citEditData.initialValue.comments);
          });
        });
      });
    });

    context("display of order form", () => {
      before(() => {
        visitOrderTab();
      });

      it("confirm order format should display value from api", () => {
        if (citEditData.setValue.orderPolicy.orderFormat) {
          cy.get("imo-cit-order-form").within(() => {
            cy.get("label")
              .contains("Order Format")
              .next()
              .find("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${citEditData.setValue.orderPolicy.orderFormat?.toLocaleUpperCase()}`)
              .click({ force: true });
          });
        } else {
          const format = Cypress._.find(citEditData.initialValue.orderTemplates, { default: true })?.format.toLocaleUpperCase();
          cy.get("imo-cit-order-form").within(() => {
            cy.get("label")
              .contains("Order Format")
              .next()
              .find("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${format}`)
              .click({ force: true });
          });
        }
      });

      it("confirm order method should display value from api", () => {
        if (!citEditData.setValue.orderPolicy?.orderMethod) {
          cy.get("imo-cit-order-form").within(() => {
            cy.get("label")
              .contains("Order Method")
              .next()
              .find("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${citEditData.initialValue.orderMethods[0].toLocaleUpperCase()}`)
              .click({ force: true });
          });
        } else {
          cy.get("imo-cit-order-form").within(() => {
            cy.get("label")
              .contains("Order Method")
              .next()
              .find("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${citEditData.setValue.orderPolicy.orderMethod?.toLocaleUpperCase()}`)
              .click({ force: true })
              .then(() => {
                if (citEditData.setValue.orderPolicy.orderMethod.toLocaleUpperCase() === "EMAIL") {
                  const emailAddress = citEditData.setValue.orderPolicy.email?.emailAddress;
                  cy.get(".order-email textarea").should("have.value", emailAddress);
                } else if (citEditData.setValue.orderPolicy.orderMethod.toLocaleUpperCase() === "SFTP") {
                  cy.get("imo-sftp-form").within(() => {
                    // URL
                    cy.get("imo-form")
                      .eq(0)
                      .within(() => {
                        cy.get("input").should("have.value", citEditData.setValue.orderPolicy.sftp?.url.trim());
                      });

                    // Optional Folder
                    cy.get("imo-form")
                      .eq(1)
                      .within(() => {
                        cy.get("input").should("have.value", citEditData.setValue.orderPolicy.sftp?.optionalFolder.trim());
                      });

                    // Port
                    cy.get("imo-form")
                      .eq(2)
                      .within(() => {
                        cy.get("input").should("have.value", citEditData.setValue.orderPolicy.sftp?.port.toString().trim());
                      });

                    // User
                    cy.get("imo-form")
                      .eq(3)
                      .within(() => {
                        cy.get("input").should("have.value", citEditData.setValue.orderPolicy.sftp?.user.trim());
                      });

                    // User
                    cy.get("imo-form")
                      .eq(4)
                      .within(() => {
                        cy.get("input").should("have.value", citEditData.setValue.orderPolicy.sftp?.password.trim());
                      });
                  });
                }
              });
          });
        }
      });

      it("confirm file template should display value form api", () => {
        if (!citEditData.setValue.orderPolicy?.orderTemplateId) {
          const template = Cypress._.find(Cypress._.find(citEditData.initialValue.orderTemplates, { default: true })?.templates, {
            default: true,
          });

          cy.get("imo-cit-order-form").within(() => {
            cy.get("label")
              .contains("File Template")
              .next()
              .find("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${template?.templateName}`)
              .click({ force: true });
          });
        } else {
          const template = Cypress._.find(
            Cypress._.find(citEditData.initialValue.orderTemplates, { format: citEditData.setValue.orderPolicy.orderFormat })?.templates,
            { id: citEditData.setValue.orderPolicy.orderTemplateId },
          );

          cy.get("imo-cit-order-form").within(() => {
            cy.get("label")
              .contains("File Template")
              .next()
              .find("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${template?.templateName}`)
              .click({ force: true });
          });
        }
      });
    });

    context("display of services form", () => {
      before(() => {
        visitServicesTab();
      });

      it("confirm notes of pickup with data from api", () => {
        cy.get("[data-test=pickup-option]").within(() => {
          cy.get("mat-checkbox").should("have.length", 6);

          cy.get("mat-checkbox")
            .contains("Notes")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notes) => {
                if (citEditData.setValue.delivery.notes) {
                  cy.wrap($notes).should("be.checked");
                } else {
                  cy.wrap($notes).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm collect of notes of pickup with data from api", () => {
        cy.get("[data-test=pickup-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coinsCollect) => {
                if (citEditData.setValue.pickup.coinsCollect) {
                  cy.wrap($coinsCollect).should("be.checked");
                } else {
                  cy.wrap($coinsCollect).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm collect remove of notes of pickup with data from api", () => {
        cy.get("[data-test=pickup-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect Remove")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coinsCollectRemove) => {
                if (citEditData.setValue.pickup.coinsCollectRemove) {
                  cy.wrap($coinsCollectRemove).should("be.checked");
                } else {
                  cy.wrap($coinsCollectRemove).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm coins of pickup with data from api", () => {
        cy.get("[data-test=pickup-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Coins")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coins) => {
                if (citEditData.setValue.delivery.coins) {
                  cy.wrap($coins).should("be.checked");
                } else {
                  cy.wrap($coins).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm collect of coins of pickup with data from api", () => {
        cy.get("[data-test=pickup-coins-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notesCollect) => {
                if (citEditData.setValue.pickup.notesCollect) {
                  cy.wrap($notesCollect).should("be.checked");
                } else {
                  cy.wrap($notesCollect).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm collect remove of coins of pickup with data from api", () => {
        cy.get("[data-test=pickup-coins-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect Remove")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notesCollectRemove) => {
                if (citEditData.setValue.pickup.notesCollectRemove) {
                  cy.wrap($notesCollectRemove).should("be.checked");
                } else {
                  cy.wrap($notesCollectRemove).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm notes of delivery with data from api", () => {
        cy.get("[data-test=delivery-option]").within(() => {
          cy.get("mat-checkbox").should("have.length", 4);

          cy.get("mat-checkbox")
            .contains("Notes")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notes) => {
                if (citEditData.setValue.pickup.notes) {
                  cy.wrap($notes).should("be.checked");
                } else {
                  cy.wrap($notes).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm replenish of notes of delivery with data from api", () => {
        cy.get("[data-test=delivery-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Replenish")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coinsReplenish) => {
                if (citEditData.setValue.delivery.coinsReplenish) {
                  cy.wrap($coinsReplenish).should("be.checked");
                } else {
                  cy.wrap($coinsReplenish).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm coins of delivery with data from api", () => {
        cy.get("[data-test=delivery-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Coins")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coins) => {
                if (citEditData.setValue.pickup.coins) {
                  cy.wrap($coins).should("be.checked");
                } else {
                  cy.wrap($coins).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm replenish of coins of delivery with data from api", () => {
        cy.get("[data-test=delivery-coins-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Replenish")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notesReplenish) => {
                if (citEditData.setValue.delivery.notesReplenish) {
                  cy.wrap($notesReplenish).should("be.checked");
                } else {
                  cy.wrap($notesReplenish).should("not.be.checked");
                }
              });
            });
        });
      });

      it("confirm pavement limit with data from api", () => {
        cy.get("[data-test=pavement-limit]").within(() => {
          cy.get("input").should("have.value", citEditData.setValue.pavementLimit || citEditData.initialValue.pavementLimit);
        });
      });

      it("currency should same value from api", () => {
        cy.get("[data-test=currency-picker]").invoke("text").should("include", citEditData.setValue.currencies[0]?.code);
      });

      it("selected denomination should checked as api response", () => {
        cy.get("[data-test=denomination-table]").within(() => {
          citEditData.setValue.currencies[0]?.denominations.forEach((denomination) => {
            const faceValueToFixed = (denomination.faceValue * Math.pow(10, denomination.exponent)).toFixed(
              citEditData.setValue.currencies[0]?.decimalPlaces || 0,
            );

            cy.get(`tbody tr:contains(${faceValueToFixed})`)
              .should("be.visible")
              .then(($tr) => {
                cy.wrap($tr).find("input[type=checkbox]").should("be.checked");
                cy.wrap($tr).find("td").contains(denomination.type, { matchCase: false }).should("be.visible");
                cy.wrap($tr).find("imo-form input").should("have.value", denomination.quantityPerUnit);
                cy.wrap($tr)
                  .find("imo-select .mat-select-value-text > span")
                  .should("have.text", denomination.unit.charAt(0).toUpperCase() + denomination.unit.slice(1));
              });
          });
        });
      });
    });

    context("display of locations form", () => {
      before(() => {
        visitLocationsTab();
      });
      it("confirm locations table with data from api", () => {
        const locations: Locations[] = [];

        citEditData.setValue.retailerLocations.map((organization: Organization) => {
          organization.locations.map((location: Location) => {
            locations.push({
              companyId: organization.companyId,
              companyName: organization.companyName,
              locationId: location.id,
              locationName: location.name,
            });
          });
        });
        cy.get("[data-test=locations-table] > table")
          .should("be.visible")
          .within(() => {
            cy.get("tbody > tr").should(($tr) => {
              expect($tr).to.have.length(locations.length);
            });
          });

        cy.get("[data-test=locations-table] table tbody")
          .find("tr td:nth-child(1)")
          .each(($td, i) => {
            expect($td.text().trim()).to.be.eq(locations[i].companyName);
          });

        cy.get("[data-test=locations-table] table tbody")
          .find("tr td:nth-child(2)")
          .each(($td, i) => {
            expect($td.text().trim()).to.be.eq(locations[i].locationName);
          });
      });
    });

    context("display of calendar form", () => {
      before(() => {
        visitCalendarTab();
      });

      it("confirm monday display with data from api", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Monday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($monday) => {
                if (citEditData.setValue.workingDays.monday.isWorking) {
                  cy.wrap($monday).should("be.checked");
                } else {
                  cy.wrap($monday).should("not.be.checked");
                }
              });
            });

          cy.get("[data-test=input-form] input")
            .eq(0)
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                expect($Input.val()).to.be.eq(citEditData.setValue.workingDays.monday.leadDays.toString());
              });
            });
        });
      });

      it("confirm tuesday display with data from api", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Tuesday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($tuesday) => {
                if (citEditData.setValue.workingDays.tuesday.isWorking) {
                  cy.wrap($tuesday).should("be.checked");
                } else {
                  cy.wrap($tuesday).should("not.be.checked");
                }
              });
            });

          cy.get("[data-test=input-form] input")
            .eq(1)
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citEditData.setValue.workingDays.tuesday.leadDays.toString());
              });
            });
        });
      });

      it("confirm wednesday display with data from api", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Wednesday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($wednesday) => {
                if (citEditData.setValue.workingDays.wednesday.isWorking) {
                  cy.wrap($wednesday).should("be.checked");
                } else {
                  cy.wrap($wednesday).should("not.be.checked");
                }
              });
            });

          cy.get("[data-test=input-form] input")
            .eq(2)
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citEditData.setValue.workingDays.wednesday.leadDays.toString());
              });
            });
        });
      });

      it("confirm thursday display with data from api", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Thursday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($thursday) => {
                if (citEditData.setValue.workingDays.thursday.isWorking) {
                  cy.wrap($thursday).should("be.checked");
                } else {
                  cy.wrap($thursday).should("not.be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(3)
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citEditData.setValue.workingDays.thursday.leadDays.toString());
              });
            });
        });
      });

      it("confirm friday display with data from api", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Friday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($friday) => {
                if (citEditData.setValue.workingDays.friday.isWorking) {
                  cy.wrap($friday).should("be.checked");
                } else {
                  cy.wrap($friday).should("not.be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(4)
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citEditData.setValue.workingDays.friday.leadDays.toString());
              });
            });
        });
      });

      it("confirm saturday display with data from api", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Saturday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($saturday) => {
                if (citEditData.setValue.workingDays.saturday.isWorking) {
                  cy.wrap($saturday).should("be.checked");
                } else {
                  cy.wrap($saturday).should("not.be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(5)
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citEditData.setValue.workingDays.saturday.leadDays.toString());
              });
            });
        });
      });

      it("confirm sunday display with data from api", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Sunday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($sunday) => {
                if (citEditData.setValue.workingDays.sunday.isWorking) {
                  cy.wrap($sunday).should("be.checked");
                } else {
                  cy.wrap($sunday).should("not.be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(6)
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citEditData.setValue.workingDays.sunday.leadDays.toString());
              });
            });
        });
      });

      it("confirm cut off time display with data from api", () => {
        cy.get("[data-test=cut-off-time] input").should("contain.value", citEditData.setValue.cutOffTime);
      });

      it("confirm holiday calendars table with data from api", () => {
        let checkedHolidays: HolidayCalendar[] = [];
        if (citEditData.setValue.holidayCalendars.length) {
          checkedHolidays = [...citEditData.setValue.holidayCalendars];

          cy.get("imo-expansion-table imo-expansion-panel")
            .should("have.length", checkedHolidays.length)
            .each(($el, panelIndex) => {
              cy.wrap($el).within(() => {
                cy.get("[data-test=column]").should("contain.text", checkedHolidays[panelIndex].calendarName).click({ force: true });
                cy.get("div.ng-trigger-bodyExpansion")
                  .should("be.visible")
                  .within(() => {
                    if (panelIndex === 0) {
                      // should check the headers name for one time
                      const headers = ["", "Name", "Date", "Day", "Skip", "Order Offset", "Service Offset", ""];

                      cy.get("table")
                        .should("be.visible")
                        .find("thead tr th")
                        .each(($th, i) => {
                          cy.wrap($th).should("contain.text", headers[i]);
                        });
                    }

                    cy.get("table")
                      .find("tbody tr")
                      .each(($tr, rowIndex) => {
                        const colName = $tr.find("td:nth-child(2)").text().trim();
                        const responseName = checkedHolidays[panelIndex].holidays[rowIndex].name;
                        expect(colName).to.be.eq(responseName);
                      });

                    cy.get("table")
                      .find("tbody tr")
                      .each(($tr, rowIndex) => {
                        const colDate = $tr.find("td:nth-child(3)").text().trim();
                        const responseDate = checkedHolidays[panelIndex].holidays[rowIndex].date;
                        expect(colDate).to.be.eq(responseDate);
                      });

                    cy.get("table")
                      .find("tbody tr")
                      .each(($tr, rowIndex) => {
                        const colDay = $tr.find("td:nth-child(4)").text().trim();
                        const responseDay = Cypress.moment(checkedHolidays[panelIndex].holidays[rowIndex].date).format("dddd");
                        expect(colDay).to.be.eq(responseDay);
                      });

                    cy.get("table")
                      .find("tbody tr")
                      .each(($tr, rowIndex) => {
                        const colSkip = $tr.find("td:nth-child(5)").text().trim();
                        const responseSkip = checkedHolidays[panelIndex].holidays[rowIndex].isSkippable ? "Skip" : "";
                        expect(colSkip).to.be.eq(responseSkip);
                      });

                    cy.get("table")
                      .find("tbody tr")
                      .each(($tr, rowIndex) => {
                        const colOrder = $tr.find("td:nth-child(6)").text().trim();
                        const responseOrder = checkedHolidays[panelIndex].holidays[rowIndex].orderOffset;

                        if (checkedHolidays[panelIndex].holidays[rowIndex].isSkippable) {
                          expect(colOrder).to.be.eq("");
                        } else {
                          expect(Number(colOrder)).to.be.eq(responseOrder);
                        }
                      });

                    cy.get("table")
                      .find("tbody tr")
                      .each(($tr, rowIndex) => {
                        const colService = $tr.find("td:nth-child(7)").text().trim();
                        const responseService = checkedHolidays[panelIndex].holidays[rowIndex].serviceOffset;

                        if (checkedHolidays[panelIndex].holidays[rowIndex].isSkippable) {
                          expect(colService).to.be.eq("");
                        } else {
                          expect(Number(colService)).to.be.eq(responseService);
                        }
                      });
                  });
              });
            });

          // click Select button, selected holiday should be checked
          cy.server()
            .route("GET", Cypress.env("host") + endpoints.apiGetHolidayCalendars)
            .as("apiGetHolidayCalendars");

          cy.get("imo-button")
            .contains("Select")
            .click()
            .wait("@apiGetHolidayCalendars")
            .then((response) => {
              const calendarIndex: number[] = [];
              let calendars: HolidayCalendar[];
              if (Array.isArray(response.responseBody)) {
                calendars = [...response.responseBody];

                checkedHolidays.forEach((cal) => {
                  const index = Cypress._.findIndex(calendars, { calendarId: cal.calendarId });
                  if (index > -1) {
                    calendarIndex.push(index);
                  }
                });
              }

              if (calendarIndex.length) {
                cy.get("button")
                  .parents("body")
                  .find("mat-dialog-container")
                  .should("be.visible")
                  .within(() => {
                    cy.get("imo-expansion-table.holiday-calendars-table-modal")
                      .should("be.visible")
                      .within(() => {
                        cy.get("imo-expansion-panel")
                          .should("be.visible")
                          .each(($el, index) => {
                            cy.wrap($el).within(() => {
                              if (Cypress._.includes(calendarIndex, index)) {
                                cy.get("[type='checkbox']").should("be.checked");
                              } else {
                                cy.get("[type='checkbox']").should("not.be.checked");
                              }
                              cy.get("[data-test=column]").should("contain.text", calendars[index].calendarName).click();
                            });
                          });
                      });
                  });
              }

              cy.get("imo-button").contains("OK").click();
            });
        }
      });
    });
  });
});
