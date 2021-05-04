describe("Story-Create CIT", () => {
  interface GetCIT {
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
    pickup: {
      notes: boolean;
      notesCollect: boolean;
      notesCollectRemove: boolean;
      coins: boolean;
      coinsCollect: boolean;
      coinsCollectRemove: boolean;
    };
    delivery: {
      notes: boolean;
      notesReplenish: boolean;
      coins: boolean;
      coinsReplenish: boolean;
    };
    pavementLimit: string;
    workingDays: {
      monday: {
        isWorking: boolean;
        leadDays: number;
      };
      tuesday: {
        isWorking: boolean;
        leadDays: number;
      };
      wednesday: {
        isWorking: boolean;
        leadDays: number;
      };
      thursday: {
        isWorking: boolean;
        leadDays: number;
      };
      friday: {
        isWorking: boolean;
        leadDays: number;
      };
      saturday: {
        isWorking: boolean;
        leadDays: number;
      };
      sunday: {
        isWorking: boolean;
        leadDays: number;
      };
    };
    currencies: Currency[];
    cutOffTime: string;
    orderFormats: string[];
    orderTemplates: OrderTemplate[];
    orderMethods: string[];
    holidayCalendars: Array<HolidayCalendar>;
  }

  interface Currency {
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

  interface OrderTemplate {
    format: string;
    default: boolean;
    templates: Templates[];
  }

  interface Templates {
    id: number | string;
    templateName: string;
    default: boolean;
  }

  interface Location {
    id: string;
    name: string;
  }

  interface Organization {
    id: string;
    name: string;
    locations: Location[];
  }

  interface Locations {
    companyId: string;
    companyName: string;
    locationId: string;
    locationName: string;
  }

  interface CheckedRowLocationTab {
    organization: string;
    location: string;
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

  // prepare variable and function in order to testing
  const endpoints = Cypress.env("citEndpoints");

  const generalFormInputIds = {
    name: "[name=name]",
    reference: "[name=reference]",
    contactName: "[name=contactName]",
    contactPhoneNumber: "[name=contactPhoneNumber]",
    contactEmail: "[name=contactEmail]",
    addressLine1: "[name=addressLine1]",
    addressLine2: "[name=addressLine2]",
    addressLine3: "[name=addressLine3]",
    state: "[name=state]",
    postalCode: "[name=postalCode]",
    country: "[name=country]",
    description: "[name=description]",
    comments: "[name=comments]",
  };

  let citData: GetCIT;

  const typeDataIntoGeneralForm = () => {
    cy.get(".form-group").within(() => {
      cy.get("[data-test=input-form]").find(generalFormInputIds.name).type("Armorguard", { delay: 0 });
      cy.get("[data-test=input-form]").find(generalFormInputIds.contactName).type("John Snow", { delay: 0 });
      cy.get("[data-test=input-form]").find(generalFormInputIds.postalCode).type("0612", { delay: 0 });
      cy.get("[data-test=input-form]").find(generalFormInputIds.country).type("New Zealand", { delay: 0 });
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
        // press cancel button
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

  const capitalizeFirstLetter = (name: string) => {
    return name[0].toUpperCase() + name.slice(1);
  };

  const visitTab = (tabName: string, filledTabs: string[] = []): void => {
    cy.server()
      .route("GET", Cypress.env("host") + endpoints.apiGetCIT)
      .as("apiGetCIT");

    cy.visit(endpoints.pageCreateCIT)
      .wait("@apiGetCIT")
      .then((xhr) => {
        citData = xhr.responseBody as GetCIT;
      });

    if (filledTabs.indexOf("General") > -1) {
      typeDataIntoGeneralForm();
    }

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

  const visitLocationsTab = () => {
    visitTab("Locations", ["General"]);
  };

  // start of testing
  context("initial display", () => {
    before(() => {
      cy.visit(endpoints.pageCreateCIT);
    });

    it("back arrow should be displayed", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon").contains("arrow_back").should("be.visible");
      });
    });

    it("page title should be displayed", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title").should("be.visible").contains("Create CIT");
      });
    });

    it("should have 5 tabs and correct tab name", () => {
      const tabNames = ["General", "Order", "Services", "Locations", "Calendar"];

      cy.get(".mat-tab-group")
        .find(".mat-tab-label")
        .should("be.visible")
        .within(() => {
          cy.get(".mat-tab-label-content").each(($label, i) => {
            expect($label).to.contain(tabNames[i]);
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

  context("click cancel button or back arrow when nothing is selected", () => {
    beforeEach(() => {
      visitGeneralTab();
    });

    it("should redirect to CITs list page without alert dialog when click cancel button", () => {
      cy.get("imo-button").contains("Cancel").click();
      cy.url().should("include", endpoints.pageCITs);
    });

    it("should redirect to CITs list page without alert dialog when click back arrow", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon").contains("arrow_back").click({ force: true });
      });
      cy.url().should("include", endpoints.pageCITs);
    });
  });

  context("click cancel button or back arrow when made any changes and leave without saving", () => {
    const saveStatus = "unsaved";

    it("click cancel button should show the alert dialog and stay at create CIT page if click cancel button of alert dialog", () => {
      visitGeneralTab();
      typeDataIntoGeneralForm();

      cy.get("imo-button > button")
        .contains("Cancel")
        .click()
        .then(() => {
          clickCancelButtonOfDialog(saveStatus);
        });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCreateCIT);
    });

    it("click cancel button should show the alert dialog and redirect to CITs page if click leave button of alert dialog", () => {
      cy.get("imo-button > button")
        .contains("Cancel")
        .click()
        .then(() => {
          clickLeaveButtonOfDialog(saveStatus);
        });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCITs);
    });

    it("click back arrow should show the alert dialog and stay at create CIT page if click cancel button of alert dialog", () => {
      visitGeneralTab();
      typeDataIntoGeneralForm();

      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon")
          .contains("arrow_back")
          .click({ force: true })
          .then(() => {
            clickCancelButtonOfDialog(saveStatus);
          });
      });

      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCreateCIT);
    });

    it("click back arrow should show the alert dialog and redirect to CITs page if click leave button of alert dialog", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon")
          .contains("arrow_back")
          .click({ force: true })
          .then(() => {
            clickLeaveButtonOfDialog(saveStatus);
          });
      });

      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCITs);
    });
  });

  context("click cancel button or back arrow when any changes has been save", () => {
    const saveStatus = "saved";

    it("click cancel button should show the alert dialog and stay at create CIT page if click cancel button of alert dialog", () => {
      visitGeneralTab();
      typeDataIntoGeneralForm();

      cy.server()
        .route("POST", Cypress.env("host") + endpoints.apiCITSave)
        .as("apiCITSavePost");

      // click save button and request POST
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").click();
      });

      cy.wait("@apiCITSavePost").then(() => {
        cy.get("imo-button > button")
          .contains("Cancel")
          .click()
          .then(() => {
            clickCancelButtonOfDialog(saveStatus);
          });
      });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCreateCIT);
    });

    it("click cancel button should show the alert dialog and redirect to CITs list page if click leave button of alert dialog", () => {
      cy.get("imo-button > button")
        .contains("Cancel")
        .click()
        .then(() => {
          clickLeaveButtonOfDialog(saveStatus);
        });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCITs);
    });

    it("click back arrow should show the alert dialog and stay at create CIT page if click cancel button of alert dialog", () => {
      visitGeneralTab();
      typeDataIntoGeneralForm();

      cy.server()
        .route("POST", Cypress.env("host") + endpoints.apiCITSave)
        .as("apiCITSavePost");

      // click save button and request POST
      cy.get(".page-content").within(() => {
        cy.get("imo-button > button").contains("Save").click();
      });

      cy.wait("@apiCITSavePost").then(() => {
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
      cy.url().should("include", endpoints.pageCreateCIT);
    });

    it("click back arrow should show the alert dialog and redirect to CITs list page if click leave button of alert dialog", () => {
      cy.get(".page-content").within(() => {
        cy.get(".page-title > button > mat-icon")
          .contains("arrow_back")
          .click({ force: true })
          .then(() => {
            clickLeaveButtonOfDialog(saveStatus);
          });
      });
      cy.get("mat-dialog-container").should("not.exist");
      cy.url().should("include", endpoints.pageCITs);
    });
  });

  context("General tab", () => {
    before(() => {
      visitGeneralTab();
    });

    context("initial display of general form", () => {
      it("label and input of Name should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Name should be display
          cy.get(".form-group > label").contains("Name").should("be.visible");
          // red asterisk should be display
          cy.get(".form-group").find(".require").first().should("be.visible");
          // input Name should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.name).should("be.visible");
          });
        });
      });

      it("label and input of Reference should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Reference should be display
          cy.get(".form-group > label").contains("Reference").should("be.visible");
          // input Reference should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.reference).should("be.visible");
          });
        });
      });

      it("label and input of Contact Name should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Contact Name should be display
          cy.get(".form-group > div > label").contains("Contact Name").should("be.visible");
          // input Contact Name should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.contactName).should("be.visible");
          });
        });
      });

      it("label and input of Contact Phone Number should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Contact Phone Number should be display
          cy.get(".form-group > div > label").contains("Contact Phone Number").should("be.visible");
          // input Contact Phone Number should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.contactPhoneNumber).should("be.visible");
          });
        });
      });

      it("label and input of Contact Email should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Contact Email should be display
          cy.get(".form-group > label").contains("Contact Email").should("be.visible");
          // input Contact Email should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.contactEmail).should("be.visible");
          });
        });
      });

      it("label and input of Address Line 1 should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Address Line1 should be display
          cy.get(".form-group > label").contains("Address Line1").should("be.visible");
          // input Address Line1 should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.addressLine1).should("be.visible");
          });
        });
      });

      it("label and input of Address Line 2 should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Address Line 2 should be display
          cy.get(".form-group > label").contains("Address Line2").should("be.visible");
          // input Address Line 2 should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.addressLine2).should("be.visible");
          });
        });
      });

      it("label and input of Address Line 3 should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Address Line3 should be display
          cy.get(".form-group > label").contains("Address Line3").should("be.visible");
          // input Address Line3 should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.addressLine3).should("be.visible");
          });
        });
      });

      it("label and input of State should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label State should be display
          cy.get(".form-group > label").contains("State").should("be.visible");
          // input State should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.state).should("be.visible");
          });
        });
      });

      it("label and input of Postal code should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Post code should be display
          cy.get(".form-group > label").contains("Postal code").should("be.visible");
          // input Post code should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.postalCode).should("be.visible");
          });
        });
      });

      it("label and input of Country should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Country should be display
          cy.get(".form-group > label").contains("Country").should("be.visible");
          // red asterisk should be display
          cy.get(".form-group").find(".require").last().should("be.visible");
          // input Country should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.country).should("be.visible");
          });
        });
      });

      it("label and input of Description should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Description should be display
          cy.get(".form-group > label").contains("Description").should("be.visible");
          // input Description should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.description).should("be.visible");
          });
        });
      });

      it("label and input of Comments should be display", () => {
        cy.get("[data-test=general-form]").within(() => {
          // label Comments should be display
          cy.get(".form-group > label").contains("Comments").should("be.visible");
          // input Comments should be display
          cy.get(".form-group").within(() => {
            cy.get("[data-test=input-form]").find(generalFormInputIds.comments).should("be.visible");
          });
        });
      });
    });

    context("max length of all inputs should be 255", () => {
      it("should be limit length by 255 of all inputs", () => {
        const stringWith255Characters =
          // tslint:disable-next-line:max-line-length
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, enim! Eligendi repellendus accusamus aliquam non praesentium cupiditate expedita quisquam labore ducimus incidunt aperiam magni, ad, ap, mid impedit modi blanditiis, doloremque exercitationem.";
        const overlengthString = " And more character...";

        // get and type all input with over 255 characters
        cy.get(".form-group").within(() => {
          cy.get("[data-test=input-form]")
            .find("input")
            .each(($el) => {
              cy.wrap($el).type(stringWith255Characters.concat(overlengthString), { delay: 0 }).invoke("val").should("have.length", 255);
            });
          cy.get("[data-test=input-form]")
            .find("textarea")
            .each(($el) => {
              cy.wrap($el).type(stringWith255Characters.concat(overlengthString), { delay: 0 }).invoke("val").should("have.length", 255);
            });
        });
      });
    });

    context("click save and cancel button", () => {
      before(() => {
        visitGeneralTab();
      });

      it("should be able to click Save button when enter value for Name and Country", () => {
        let citId: string;
        typeDataIntoGeneralForm();

        cy.server()
          .route("POST", Cypress.env("host") + endpoints.apiCITSave)
          .as("apiCITSavePost");

        // click save button and request POST
        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").should("not.be.disabled").click();
          // cy.get("imo-button")
          //   .parents("body")
          //   .find("imo-loading .spinner")
          //   .should("be.visible");

          cy.wait("@apiCITSavePost").then((xhr) => {
            const res = xhr.responseBody;
            if (typeof res === "object") {
              citId = res.citId;
            }

            cy.get("imo-button").parents("body").find("snack-bar-container").should("be.visible").contains("Successfully Created.");

            cy.get("button")
              .parents("body")
              .find(".mat-simple-snackbar-action button")
              .click()
              .then(() => {
                cy.get("imo-button").parents("body").find("snack-bar-container").should("not.be.visible");
                cy.get(".page-title").should("be.visible").contains("Armorguard");
              });

            cy.get("[data-test=input-form]").find(generalFormInputIds.name).type(" ABC");

            cy.server()
              .route("PUT", Cypress.env("host") + endpoints.apiCITSave + "/" + citId)
              .as("apiCITSavePost");

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

                cy.get(".page-title").should("be.visible").contains("Armorguard ABC");
              });
          });
        });
      });

      it("snack-bar should be hidden when transitioning to another screen with the cancel button", () => {
        cy.get("imo-button > button")
          .contains("Cancel")
          .click()
          .then(() => {
            clickLeaveButtonOfDialog("saved");
          });
        cy.get("mat-dialog-container").should("not.exist");
        cy.get("body").find("snack-bar-container").should("not.be.visible");
        cy.url().should("include", endpoints.pageCITs);
      });
    });

    context("should display error message", () => {
      before(() => {
        visitGeneralTab();
      });

      it("click save and return error, should display error message", () => {
        typeDataIntoGeneralForm();

        cy.wait(1000);
        cy.server({
          method: "POST",
          delay: 1000,
          status: 404,
          response: {},
        })
          .route("POST", Cypress.env("host") + endpoints.apiCITSave)
          .as("apiCITSavePost");

        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").should("not.be.disabled").click();
        });

        cy.wait("@apiCITSavePost").then(() => {
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
    });
  });

  context("Services tab", () => {
    before(() => {
      visitServicesTab();
    });

    context("initial display of services form", () => {
      it("label and option of pickup should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=pickup-option]").contains("Pickup").should("be.visible");
        });
      });

      it("label and option of delivery should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=delivery-option]").contains("Delivery").should("be.visible");
        });
      });

      it("label and input of pavement limit should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=pavement-limit]").contains("Pavement Limit").should("be.visible");
        });
      });

      it("label and option of currency should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=currency]").contains("Currency").should("be.visible");
        });
      });
    });

    context("confirm default option and should be able to check request option", () => {
      it("notes of pickup should be checked", () => {
        cy.get("[data-test=pickup-option]").within(() => {
          cy.get("mat-checkbox").should("have.length", 6);

          cy.get("mat-checkbox")
            .contains("Notes")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notes) => {
                if (citData.delivery.notes) {
                  cy.wrap($notes)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($notes)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("collect of notes of pickup should not be checked", () => {
        cy.get("[data-test=pickup-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coinsCollect) => {
                if (citData.pickup.coinsCollect) {
                  cy.wrap($coinsCollect)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($coinsCollect)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("collect remove of notes of pickup should not be checked", () => {
        cy.get("[data-test=pickup-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect Remove")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coinsCollectRemove) => {
                if (citData.pickup.coinsCollectRemove) {
                  cy.wrap($coinsCollectRemove)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($coinsCollectRemove)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("coins of pickup should be checked", () => {
        cy.get("[data-test=pickup-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Coins")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coins) => {
                if (citData.delivery.coins) {
                  cy.wrap($coins)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($coins)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("collect of coins of pickup should not be checked", () => {
        cy.get("[data-test=pickup-coins-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notesCollect) => {
                if (citData.pickup.notesCollect) {
                  cy.wrap($notesCollect)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($notesCollect)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("collect remove of coins of pickup should not be checked", () => {
        cy.get("[data-test=pickup-coins-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect Remove")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notesCollectRemove) => {
                if (citData.pickup.notesCollectRemove) {
                  cy.wrap($notesCollectRemove)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($notesCollectRemove)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("notes of delivery should be checked", () => {
        cy.get("[data-test=delivery-option]").within(() => {
          cy.get("mat-checkbox").should("have.length", 4);

          cy.get("mat-checkbox")
            .contains("Notes")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notes) => {
                if (citData.pickup.notes) {
                  cy.wrap($notes)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($notes)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("replenish of notes of delivery should not be checked", () => {
        cy.get("[data-test=delivery-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Replenish")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coinsReplenish) => {
                if (citData.delivery.coinsReplenish) {
                  cy.wrap($coinsReplenish)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($coinsReplenish)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("coins of delivery should be checked", () => {
        cy.get("[data-test=delivery-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Coins")
            .within(() => {
              cy.get("input[type=checkbox]").then(($coins) => {
                if (citData.pickup.coins) {
                  cy.wrap($coins)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($coins)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });

      it("replenish of coins of delivery should not be checked", () => {
        cy.get("[data-test=delivery-coins-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Replenish")
            .within(() => {
              cy.get("input[type=checkbox]").then(($notesReplenish) => {
                if (citData.delivery.notesReplenish) {
                  cy.wrap($notesReplenish)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($notesReplenish)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });
        });
      });
    });

    context("pavement limit", () => {
      it("should be display value is 0", () => {
        cy.get("[data-test=pavement-limit] Input").should(($Input) => {
          expect($Input.val()).to.be.eq(citData.pavementLimit);
        });
      });

      it("should be able to input pavement limit", () => {
        cy.get("[data-test=pavement-limit] Input")
          .type("{selectall}{backspace}11111")
          .should(($Input) => {
            expect($Input.val()).to.be.eq("11111");
          });
      });

      it("can only input up to 18 digits", () => {
        const expectedValueDigits = "123456781233332323";
        const extraValue = "999";
        cy.get("[data-test=pavement-limit] Input")
          .type("{selectall}{backspace}")
          .type(expectedValueDigits.concat(extraValue))
          .should(($Input) => {
            expect($Input.val()).to.be.eq(expectedValueDigits);
          });
      });
    });

    context("currency", () => {
      it("should display placeholder and table currency should be not display", () => {
        cy.get("[data-test=show-placeholder]").contains("Select Currency").should("be.visible");
        cy.get("[data-test=currency-table]").should("not.be.visible");
      });

      it("should be able to change to another value and check display of header", () => {
        const arrCurrency: any = [];

        citData.currencies.forEach((curr) => {
          arrCurrency.push(`${curr.code} - ${curr.name}`);
        });
        if (arrCurrency.length) {
          arrCurrency.forEach((currencyName: string) => {
            cy.get("[data-test=currency]").within(() => {
              cy.get("mat-select")
                .click({ force: true })
                .parents("body")
                .find("mat-option")
                .contains(`${currencyName}`)
                .click({ force: true });
            });
          });

          const listHeaders = ["", "Select", "Denomination", "Type", "Unit", "Count", ""];

          cy.get("[data-test=denomination-table] table")
            .should("be.visible")
            .within(() => {
              cy.get("th").each(($th, i) => {
                expect($th).to.contain(listHeaders[i]);
              });
            });
        }
      });

      it("confirm default data display table when select currency", () => {
        const arrCurrency: any = [];

        citData.currencies.forEach((curr) => {
          arrCurrency.push(`${curr.code} - ${curr.name}`);
        });

        let denominations: any = [];
        if (arrCurrency.length) {
          const index = 0;
          const currencyName = arrCurrency[index];

          // arrCurrency.first((currencyName: string, index: number) => {
          cy.get("[data-test=currency]").within(() => {
            cy.get("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${currencyName}`)
              .click({ force: true })
              .then(() => {
                denominations = citData.currencies[index].denominations;
                cy.root()
                  .parents("body")
                  .find("[data-test=denomination-table] table")
                  .within(() => {
                    cy.get("tbody tr").should(($tr) => {
                      expect($tr).to.have.length(denominations.length);
                    });

                    cy.get("tbody")
                      .find("tr td:nth-child(2)")
                      .each(($td, i) => {
                        if (denominations[i].selected) {
                          cy.wrap($td).within(() => {
                            cy.get("input[type=checkbox]").should("be.checked");
                          });
                        } else {
                          cy.wrap($td).within(() => {
                            cy.get("input[type=checkbox]").should("not.be.checked");
                          });
                        }
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(3)")
                      .each(($td, i) => {
                        const exponent = citData.currencies[index].denominations[i].exponent;
                        const faceValue = (denominations[i].faceValue * Math.pow(10, exponent)).toFixed(
                          citData.currencies[index].decimalPlaces || 0,
                        );
                        expect($td.text().trim()).to.be.eq(faceValue);
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(4)")
                      .each(($td, i) => {
                        expect($td.text().trim()).to.be.eq(denominations[i].type);
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(5)")
                      .each(($td, i) => {
                        cy.wrap($td).within(() => {
                          cy.get("mat-select").should("have.text", capitalizeFirstLetter(denominations[i].currencyUnits.defaultUnit));
                        });
                        if (denominations[i].selected) {
                          cy.wrap($td).within(() => {
                            cy.get("mat-select").should("not.have.class", "mat-select-disabled");
                          });
                        } else {
                          cy.wrap($td).within(() => {
                            cy.get("mat-select").should("have.class", "mat-select-disabled");
                          });
                        }
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(6)")
                      .each(($td, i) => {
                        cy.wrap($td).within(() => {
                          cy.get(".mat-form-field input").should("have.value", denominations[i].currencyUnits.defaultCount);
                        });
                        if (denominations[i].selected) {
                          cy.wrap($td).within(() => {
                            cy.get("mat-form-field").should("not.have.class", "mat-form-field-disabled");

                            cy.get("mat-form-field input").should("not.be.disabled");
                          });
                        } else {
                          cy.wrap($td).within(() => {
                            cy.get("mat-form-field").should("have.class", "mat-form-field-disabled");

                            cy.get("mat-form-field input").should("be.disabled");
                          });
                        }
                      });
                  });
              });
          });
          // });
        }
      });

      it("should be able to change value currency", () => {
        const arrCurrency: any = [];

        citData.currencies.forEach((curr) => {
          arrCurrency.push(`${curr.code} - ${curr.name}`);
        });

        let denominations: any = [];
        if (arrCurrency.length) {
          const index = 1;
          const currencyName = arrCurrency[index];
          // arrCurrency.forEach((currencyName: string, index: number) => {
          cy.get("[data-test=currency]").within(() => {
            cy.get("mat-select")
              .click({ force: true })
              .parents("body")
              .find("mat-option")
              .contains(`${currencyName}`)
              .click({ force: true })
              .then(() => {
                denominations = citData.currencies[index].denominations;
                cy.root()
                  .parents("body")
                  .find("[data-test=denomination-table] table")
                  .within(() => {
                    cy.get("tbody tr").should(($tr) => {
                      expect($tr).to.have.length(denominations.length);
                    });

                    cy.get("tbody")
                      .find("tr td:nth-child(2)")
                      .each(($td, i) => {
                        if (denominations[i].selected) {
                          cy.wrap($td).within(() => {
                            cy.get("input[type=checkbox]").should("be.checked").click({ force: true });
                            cy.get("input[type=checkbox]").should("not.be.checked").click({ force: true });
                          });
                        } else {
                          cy.wrap($td).within(() => {
                            cy.get("input[type=checkbox]").should("not.be.checked").click({ force: true });
                          });
                        }
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(3)")
                      .each(($td, i) => {
                        const exponent = citData.currencies[index].denominations[i].exponent;
                        const faceValue = (denominations[i].faceValue * Math.pow(10, exponent)).toFixed(
                          citData.currencies[index].decimalPlaces || 0,
                        );
                        expect($td.text().trim()).to.be.eq(faceValue);
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(4)")
                      .each(($td, i) => {
                        expect($td.text().trim()).to.be.eq(denominations[i].type);
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(5)")
                      .each(($td, i) => {
                        const unitOptions = denominations[i].currencyUnits.options;
                        cy.wrap($td).within(() => {
                          cy.get("mat-select").as("unit");

                          unitOptions.forEach((unit: string, index: number) => {
                            cy.get("mat-select")
                              .click({ force: true })
                              .parents("body")
                              .find(`.mat-select-panel-wrap mat-option:eq(${index})`)
                              .click()
                              .then(($option) => {
                                const text = $option.text().trim();
                                cy.get("@unit").should("have.text", capitalizeFirstLetter(text));
                                cy.wrap(unit).should("be.eq", text.toLowerCase());
                              });
                          });
                        });
                      });

                    cy.get("tbody")
                      .find("tr td:nth-child(6)")
                      .each(($td) => {
                        cy.wrap($td).within(() => {
                          cy.get("mat-form-field input")
                            .type("{selectall}{backspace}111111")
                            .should(($Input) => {
                              expect($Input.val()).to.be.eq("111111");
                            });

                          // can only input up to 7 digits
                          cy.get("mat-form-field input")
                            .type("{selectall}{backspace}1234567890")
                            .should(($Input) => {
                              expect($Input.val()).to.be.eq("1234567");
                            });
                        });
                      });
                  });
              });
          });
          // });
        }
      });
    });
  });

  context("Calendar tab", () => {
    before(() => {
      visitCalendarTab();
    });

    context("initial display of calendar form", () => {
      it("label and option of working days should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=working-days-option]").contains("Working days").should("be.visible");
        });
      });

      it("label and input of cut off time should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=cut-off-time]").contains("Cut off time").should("be.visible");
        });
      });

      it("label and select button should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("h5").contains("Holiday calendars").should("be.visible");

          if (citData.holidayCalendars.length) {
            cy.get("imo-expansion-table > div > div.header").should("be.visible");
          } else {
            cy.get("imo-expansion-table > div > div.header").should("not.be.visible");
          }

          cy.get("imo-button").contains("Select").should("be.visible");
        });
      });
    });

    context("confirm default option and should be enable input when checked option", () => {
      it("monday should be checked and can input lead days", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day").should("have.length", Object.keys(citData.workingDays).length);

          // default Monday
          cy.get("imo-working-day")
            .contains("Monday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($monday) => {
                if (citData.workingDays.monday.isWorking) {
                  cy.wrap($monday)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($monday).should("not.be.checked").click({ force: true }).should("be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(0)
            .focus()
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citData.workingDays.monday.leadDays.toString());
              });

              // entered value
              cy.wrap($el)
                .type("{selectall}{leftarrow}11")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("11");
                });
            });

          // Change checked
          cy.get("imo-working-day")
            .contains("Monday")
            .within(() => {
              cy.get("input[type=checkbox]").should("be.checked").click({ force: true }).should("not.be.checked");
            });

          // cannot entered
          cy.get("[data-test=input-form] input").eq(0).should("be.disabled");
        });
      });

      it("tuesday should be checked and can input lead days", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          // default Tuesday
          cy.get("imo-working-day")
            .contains("Tuesday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($tuesday) => {
                if (citData.workingDays.tuesday.isWorking) {
                  cy.wrap($tuesday)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($tuesday).should("not.be.checked").click({ force: true }).should("be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(1)
            .focus()
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citData.workingDays.tuesday.leadDays.toString());
              });

              // entered value
              cy.wrap($el)
                .type("{selectall}{leftarrow}12")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("12");
                });
            });

          // Change checked
          cy.get("imo-working-day")
            .contains("Tuesday")
            .within(() => {
              cy.get("input[type=checkbox]").should("be.checked").click({ force: true }).should("not.be.checked");
            });

          // cannot entered
          cy.get("[data-test=input-form] input").eq(1).should("be.disabled");
        });
      });

      it("wednesday should be checked and can input lead days", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          // default Wednesday
          cy.get("imo-working-day")
            .contains("Wednesday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($wednesday) => {
                if (citData.workingDays.wednesday.isWorking) {
                  cy.wrap($wednesday)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($wednesday).should("not.be.checked").click({ force: true }).should("be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(2)
            .focus()
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citData.workingDays.wednesday.leadDays.toString());
              });

              // entered value
              cy.wrap($el)
                .type("{selectall}{leftarrow}13")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("13");
                });
            });

          // Change checked
          cy.get("imo-working-day")
            .contains("Wednesday")
            .within(() => {
              cy.get("input[type=checkbox]").should("be.checked").click({ force: true }).should("not.be.checked");
            });

          // cannot entered
          cy.get("[data-test=input-form] input").eq(2).should("be.disabled");
        });
      });

      it("thursday should be checked and can input lead days", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          // default Thursday
          cy.get("imo-working-day")
            .contains("Thursday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($thursday) => {
                if (citData.workingDays.thursday.isWorking) {
                  cy.wrap($thursday)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($thursday).should("not.be.checked").click({ force: true }).should("be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(3)
            .focus()
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citData.workingDays.thursday.leadDays.toString());
              });

              // entered value
              cy.wrap($el)
                .type("{selectall}{leftarrow}14")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("14");
                });
            });

          // Change checked
          cy.get("imo-working-day")
            .contains("Thursday")
            .within(() => {
              cy.get("input[type=checkbox]").should("be.checked").click({ force: true }).should("not.be.checked");
            });

          // cannot entered
          cy.get("[data-test=input-form] input").eq(3).should("be.disabled");
        });
      });

      it("friday should be checked and can input lead days", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          // default Friday
          cy.get("imo-working-day")
            .contains("Friday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($friday) => {
                if (citData.workingDays.friday.isWorking) {
                  cy.wrap($friday)
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked");
                } else {
                  cy.wrap($friday).should("not.be.checked").click({ force: true }).should("be.checked");
                }
              });
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(4)
            .focus()
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citData.workingDays.friday.leadDays.toString());
              });

              // entered value
              cy.wrap($el)
                .type("{selectall}{leftarrow}15")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("15");
                });
            });

          // Change checked
          cy.get("imo-working-day")
            .contains("Friday")
            .within(() => {
              cy.get("input[type=checkbox]").should("be.checked").click({ force: true }).should("not.be.checked");
            });

          // cannot entered
          cy.get("[data-test=input-form] input").eq(4).should("be.disabled");
        });
      });

      it("saturday should not be checked and cannot input lead days", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          // default Saturday
          cy.get("imo-working-day")
            .contains("Saturday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($saturday) => {
                if (citData.workingDays.saturday.isWorking) {
                  cy.wrap($saturday).should("be.checked").click({ force: true }).should("not.be.checked");
                } else {
                  cy.wrap($saturday)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });

          // cannot entered
          cy.get("[data-test=input-form] input").eq(5).should("be.disabled");

          // Change checked
          cy.get("imo-working-day")
            .contains("Saturday")
            .within(() => {
              cy.get("input[type=checkbox]").should("not.be.checked").click({ force: true }).should("be.checked");
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(5)
            .focus()
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citData.workingDays.saturday.leadDays.toString());
              });

              // entered value
              cy.wrap($el)
                .type("{selectall}{leftarrow}16")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("16");
                });
            });
        });
      });

      it("sunday should not be checked and cannot input lead days", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          // default Sunday
          cy.get("imo-working-day")
            .contains("Sunday")
            .within(() => {
              cy.get("input[type=checkbox]").then(($sunday) => {
                if (citData.workingDays.sunday.isWorking) {
                  cy.wrap($sunday).should("be.checked").click({ force: true }).should("not.be.checked");
                } else {
                  cy.wrap($sunday)
                    .should("not.be.checked")
                    .click({ force: true })
                    .should("be.checked")
                    .click({ force: true })
                    .should("not.be.checked");
                }
              });
            });

          // cannot entered
          cy.get("[data-test=input-form] input").eq(6).should("be.disabled");

          // Change checked
          cy.get("imo-working-day")
            .contains("Sunday")
            .within(() => {
              cy.get("input[type=checkbox]").should("not.be.checked").click({ force: true }).should("be.checked");
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(6)
            .focus()
            .then(($el) => {
              cy.wrap($el).should(($Input) => {
                // default value
                expect($Input.val()).to.be.eq(citData.workingDays.sunday.leadDays.toString());
              });

              // entered value
              cy.wrap($el)
                .type("{selectall}{leftarrow}17")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("17");
                });
            });
        });
      });

      it("input lead days should can be entered 2 digit and value zero when changed to blank", () => {
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Monday")
            .within(() => {
              cy.get("input[type=checkbox]").click({ force: true }).should("be.checked");
            });

          // can entered
          cy.get("[data-test=input-form] input")
            .eq(0)
            .then(($el) => {
              // entered value
              cy.wrap($el)
                .type("{selectall}{backspace}")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("0");
                });

              cy.wrap($el)
                .type("{selectall}{backspace}!@#$^ana")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("0");
                });

              cy.wrap($el)
                .type("{selectall}{leftarrow}11111")
                .should(($Input) => {
                  expect($Input.val()).to.be.eq("11");
                });
            });
        });
      });
    });

    context("cut off time", () => {
      it("should be display cut off time default value", () => {
        cy.get("[data-test=cut-off-time] input").should("contain.value", citData.cutOffTime);
      });

      it("should be able to select cut off time", () => {
        cy.get("[data-test=cut-off-time]")
          .should("be.visible")
          .within(() => {
            cy.get("button").click();

            cy.get("button").parents("body").find(".time-picker").should("be.visible").contains(".mat-option-text", "12:30 AM").click();

            cy.get("input").should("have.value", "12:30 AM");
          });
      });
    });

    context("holiday calendars", () => {
      it("should be able to select holiday caledars", () => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetHolidayCalendars)
          .as("apiGetHolidayCalendars");

        const holidays: HolidayCalendar[] = [];
        const checkedHolidays: HolidayCalendar[] = [];

        cy.get("imo-button")
          .contains("Select")
          .click()
          .wait("@apiGetHolidayCalendars")
          .then((response) => {
            if (Array.isArray(response.responseBody)) {
              response.responseBody.forEach((calendar) => {
                holidays.push(calendar);
              });
            }

            if (holidays.length) {
              // when there are multiple holiday calendars to choose
              cy.get("button")
                .parents("body")
                .find("mat-dialog-container")
                .should("be.visible")
                .within(() => {
                  // check title, buttons
                  cy.get(".mat-dialog-title").contains("Select Holiday Calendars").should("be.visible");

                  // check button
                  cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled");
                  cy.get("mat-dialog-actions > imo-button > button").contains("Cancel").should("be.visible");

                  // check data of holiday calendars table
                  cy.get("imo-expansion-table.holiday-calendars-table-modal")
                    .should("be.visible")
                    .within(() => {
                      cy.get("imo-expansion-panel")
                        .should("be.visible")
                        .each(($el, index) => {
                          cy.wrap($el).within(() => {
                            // confirm panel open close
                            cy.get("div.panel-open").should("not.be.visible");
                            cy.get("[type='checkbox']").should("not.be.checked").click({ force: true });
                            checkedHolidays.push(holidays[index]);

                            // click to open panel
                            cy.get("[data-test=column]").should("contain.text", holidays[index].calendarName).click({ force: true });
                            cy.get("div.panel-open").should("be.visible");
                          });
                        });
                    });

                  cy.get("button").contains("OK").click({ force: true });
                })
                .then(() => {
                  cy.get("imo-expansion-table imo-expansion-panel")
                    .should("have.length", checkedHolidays.length)
                    .each(($el, index) => {
                      cy.wrap($el).within(() => {
                        cy.get("[data-test=column]").should("contain.text", holidays[index].calendarName).click({ force: true });
                      });
                    });
                });
            } else {
              // when there are no holiday calendar to choose from
              cy.get("mat-dialog-container > imo-alert")
                .should("be.visible")
                .within(() => {
                  cy.get("p.description").should("contain.text", "There was no holiday calendars to choose from.");
                  cy.get("imo-button").contains("OK").click();
                });
            }
          });
      });

      it("should display error when call API GET cit/get-holiday-calendars failed", () => {
        cy.server()
          .route({
            method: "GET",
            url: Cypress.env("host") + endpoints.apiGetHolidayCalendars,
            status: 500,
            delay: 1000,
            response: [],
          })
          .as("apiGetHolidayCalendarsError");

        cy.get("imo-button")
          .contains("Select")
          .click()
          .wait("@apiGetHolidayCalendarsError")
          .then(() => {
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
    });
  });

  context("Order tab", () => {
    const fields = ["Order Format", "File Template", "Order Method"];
    const requiredFields = ["Order Format", "Order Method", "Email", "Port", "User", "Password"];

    before(() => {
      visitTab("Order", ["General"]);
    });

    context("initial display order form", () => {
      fields.forEach((fieldName) => {
        it(`label and option of ${fieldName.toLocaleLowerCase()} should be display`, () => {
          cy.get("imo-cit-order-form").within(() => {
            cy.get("label")
              .contains(fieldName)
              .within(($field) => {
                cy.wrap($field).should("be.visible");
                if (requiredFields.indexOf(fieldName) > -1) {
                  cy.wrap($field).should("contain.text", "*");
                }
              });
          });
        });
      });
    });

    context("order format changes", () => {
      it("should display default value from bff", () => {
        const format = Cypress._.find(citData.orderTemplates, { default: true })?.format.toLocaleUpperCase();
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
      });

      it("should be able to change to another value", () => {
        // get "XML" format
        const format = Cypress._.find(citData.orderTemplates, { default: false })?.format.toLocaleUpperCase();
        const formatDefault = Cypress._.find(citData.orderTemplates, { default: true })?.format.toLocaleUpperCase();
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

          cy.get("label")
            .contains("Order Format")
            .next()
            .find("mat-select")
            .click({ force: true })
            .parents("body")
            .find("mat-option")
            .contains(`${formatDefault}`)
            .click({ force: true });
        });
      });
    });

    context("file template changes", () => {
      it("should display default value from bff", () => {
        const template = Cypress._.find(Cypress._.find(citData.orderTemplates, { default: true })?.templates, {
          default: true,
        })?.templateName;
        cy.get("imo-cit-order-form").within(() => {
          cy.get("label")
            .contains("File Template")
            .next()
            .find("mat-select")
            .click({ force: true })
            .parents("body")
            .find("mat-option")
            .contains(`${template}`)
            .click({ force: true });
        });
      });
    });

    context("order method changes", () => {
      it("should not display extra fields for manual", () => {
        cy.get("imo-cit-order-form").within(() => {
          cy.get("label")
            .contains("Order Method")
            .next()
            .find("mat-select")
            .click({ force: true })
            .parents("body")
            .find("mat-option")
            .contains("Manual", { matchCase: false })
            .click({ force: true });

          cy.get("label").contains("Manual", { matchCase: false }).should("not.be.visible");
        });
      });

      it("should saveable for manual", () => {
        cy.get(".action-buttons imo-button.primary button").should("be.enabled");
      });

      it("should display extra fields for email", () => {
        cy.get("imo-cit-order-form").within(() => {
          cy.get("label")
            .contains("Order Method")
            .next()
            .find("mat-select")
            .click({ force: true })
            .parents("body")
            .find("mat-option")
            .contains("Email", { matchCase: false })
            .click({ force: true });

          cy.get("label")
            .contains("Email Address")
            .within(($field) => {
              cy.wrap($field).should("be.visible");
              if (requiredFields.indexOf($field.text()) > -1) {
                cy.wrap($field).should("contain.text", "*");
              }
            });
        });
      });

      it("should not saveable for email", () => {
        cy.get("[name=order-email]").type("{backspace}");
        cy.get(".action-buttons imo-button.primary button").should("not.be.enabled");
      });

      it("should saveable for email", () => {
        cy.get("[name=order-email]").type("test@email.xyz");
        cy.get(".action-buttons imo-button.primary button").should("be.enabled");
      });

      it("should display extra fields for sftp", () => {
        const sftpFields = ["URL", "Optional Folder", "Port", "User", "Password"];

        cy.get("imo-cit-order-form").within(() => {
          cy.get("label")
            .contains("Order Method")
            .next()
            .find("mat-select")
            .click({ force: true })
            .parents("body")
            .find("mat-option")
            .contains("SFTP", { matchCase: false })
            .click({ force: true });

          sftpFields.forEach((fieldName) => {
            cy.get("label")
              .contains(fieldName)
              .within(($field) => {
                cy.wrap($field).should("be.visible");
                if (requiredFields.indexOf($field.text()) > -1) {
                  cy.wrap($field).should("contain.text", "*");
                }
              });
          });
        });
      });

      it("should not saveable for sftp", () => {
        cy.get("label:contains(URL) + imo-form").find(".mat-input-element").type("{backspace}");
        cy.get(".action-buttons imo-button.primary button").should("not.be.enabled");
      });

      it("should have limit length for each input of sftp", () => {
        const stringWith255Characters =
          // tslint:disable-next-line:max-line-length
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, enim! Eligendi repellendus accusamus aliquam non praesentium cupiditate expedita quisquam labore ducimus incidunt aperiam magni, ad, ap, mid impedit modi blanditiis, doloremque exercitationem.";
        const overlengthString = " And more character...";

        cy.get("label:contains(URL) + imo-form")
          .find(".mat-input-element")
          .type(stringWith255Characters.concat(overlengthString), { delay: 0 })
          .invoke("val")
          .should("have.length", 255);
        cy.get("label:contains(Optional Folder) + imo-form")
          .find(".mat-input-element")
          .type(stringWith255Characters.concat(overlengthString), { delay: 0 })
          .invoke("val")
          .should("have.length", 255);
        cy.get("label:contains(Port) + imo-form").find(".mat-input-element").type("77777").should("contain.value", 65535);
        cy.get("label:contains(User) + imo-form")
          .find(".mat-input-element")
          .type(stringWith255Characters.concat(overlengthString), { delay: 0 })
          .invoke("val")
          .should("have.length", 255);
        cy.get("label:contains(Password) + imo-form")
          .find(".mat-input-element")
          .type(stringWith255Characters.concat(overlengthString), { delay: 0 })
          .invoke("val")
          .should("have.length", 255);
      });

      it("should saveable for sftp", () => {
        cy.get("label:contains(URL) + imo-form").find(".mat-input-element").type("{selectall}{backspace}").type("test@email.xyz");
        cy.get("label:contains(Optional Folder) + imo-form").find(".mat-input-element").type("{selectall}{backspace}");
        cy.get("label:contains(Port) + imo-form")
          .find(".mat-input-element")
          .type("{selectall}{backspace}")
          .type("77777")
          .should("contain.value", 65535);
        cy.get("label:contains(User) + imo-form").find(".mat-input-element").type("{selectall}{backspace}").type("test@email.xyz");
        cy.get("label:contains(Password) + imo-form").find(".mat-input-element").type("{selectall}{backspace}").type("test@email.xyz");
        cy.get(".action-buttons imo-button.primary button").should("be.enabled");
      });
    });
  });

  context("Locations tab", () => {
    let citId: string;
    before(() => {
      visitLocationsTab();
    });

    context("initial display of locations form", () => {
      it("label and button select locations should be display", () => {
        cy.get(".page-content").within(() => {
          cy.get("[data-test=locations-form]").contains("Organisation Location").should("be.visible");

          cy.get("imo-button").contains("Select").should("be.visible");
        });
      });
    });

    context("there are no locations", () => {
      it("Select locations should display location unavailable alert", () => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetRetailerLocations, `fx:create-cit/no-retailer-location`)
          .as("apiSelectedLocations");

        cy.get("[data-test=locations-form]").within(() => {
          cy.get("imo-button")
            .contains("Select")
            .should("be.visible")
            .click({ force: true })
            .wait("@apiSelectedLocations")
            .then(() => {
              // Check dialog Location Unavailable Alert should be visible
              cy.root()
                .parents("body")
                .find("mat-dialog-container > imo-alert")
                .should("be.visible")
                .within(() => {
                  // Check content dialog
                  cy.get(".description").contains("There was no Organisation Location to choose from.");

                  cy.get(".confirm").contains("OK").should("not.be.disabled").click({ force: true });
                });
            });
        });
      });
    });

    context("there are multiple locations", () => {
      it("select location when have more than 0 location", () => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetRetailerLocations)
          .as("apiSelectedLocations");

        let locations: Locations[];
        const checkedRows: CheckedRowLocationTab[] = [];

        cy.get("[data-test=locations-form]").within(() => {
          cy.get("imo-button")
            .contains("Select")
            .should("be.visible")
            .click({ force: true })
            .wait("@apiSelectedLocations")
            .then((response) => {
              locations = [];
              const res = response.responseBody;
              if (Array.isArray(res)) {
                res.map((organization: Organization) => {
                  organization.locations.map((location: Location) => {
                    locations.push({
                      companyId: organization.id,
                      companyName: organization.name,
                      locationId: location.id,
                      locationName: location.name,
                    });
                  });
                });
              }

              cy.get("button")
                .parents("body")
                .find("mat-dialog-container")
                .should("be.visible")
                .within(() => {
                  // Check title, buttons
                  cy.get(".mat-dialog-title").contains("Select Organisation Location").should("be.visible");

                  // check button
                  cy.get("mat-dialog-actions > imo-button > button").contains("Save").should("not.be.disabled");

                  cy.get("mat-dialog-actions > imo-button > button").contains("Cancel").should("be.visible");

                  // Check data modal display
                  cy.get("[data-test=select-locations-modal] table tbody")
                    .find("tr td:nth-child(2)")
                    .each(($td, i) => {
                      expect($td.text().trim()).to.be.eq(locations[i].companyName);
                    });

                  cy.get("[data-test=select-locations-modal] table tbody")
                    .find("tr td:nth-child(3)")
                    .each(($td, i) => {
                      expect($td.text().trim()).to.be.eq(locations[i].locationName);
                    });

                  cy.get("[data-test=select-locations-modal] table tbody")
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

                  // Select locations
                  cy.get("[data-test=select-locations-modal] table tbody")
                    .find("tr td:nth-child(1)")
                    .each(($td) => {
                      cy.wrap($td).within(() => {
                        cy.get("input[type=checkbox]").should("not.be.checked").click({ force: true }).should("be.checked");
                      });
                    })
                    .then(() => {
                      // Get checkedRows
                      cy.get("[data-test=select-locations-modal] mat-checkbox.mat-checkbox-checked").each(($elem) => {
                        const row = {
                          organization: $elem.parents("tr").find("td:eq(1)").text().trim(),
                          location: $elem.parents("tr").find("td:eq(2)").text().trim(),
                        };
                        checkedRows.push(row);
                      });
                    });

                  // Click button OK
                  cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click({ force: true });
                });

              // Confirm locations display after selected
              cy.get("[data-test=locations-table] > table")
                .should("be.visible")
                .within(() => {
                  cy.get("tbody > tr").should(($tr) => {
                    expect($tr).to.have.length(checkedRows.length);
                  });
                });

              cy.get("[data-test=locations-table] table tbody")
                .find("tr td:nth-child(1)")
                .each(($td, i) => {
                  expect($td.text().trim()).to.be.eq(checkedRows[i].organization);
                });

              cy.get("[data-test=locations-table] table tbody")
                .find("tr td:nth-child(2)")
                .each(($td, i) => {
                  expect($td.text().trim()).to.be.eq(checkedRows[i].location);
                });
            });
        });
      });

      it("reselect location and should not display Location Unavailable Alert when have more than 0 location", () => {
        let locations: Locations[];
        const checkedRows: CheckedRowLocationTab[] = [];
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetRetailerLocations)
          .as("apiSelectedLocations");

        cy.get("[data-test=locations-form]").within(() => {
          cy.get("imo-button")
            .contains("Select")
            .should("be.visible")
            .click({ force: true })
            .wait("@apiSelectedLocations")
            .then((response) => {
              locations = [];
              const res = response.responseBody;
              if (Array.isArray(res)) {
                res.map((organization: Organization) => {
                  organization.locations.map((location: Location) => {
                    locations.push({
                      companyId: organization.id,
                      companyName: organization.name,
                      locationId: location.id,
                      locationName: location.name,
                    });
                  });
                });
              }

              cy.get("button")
                .parents("body")
                .find("mat-dialog-container")
                .should("be.visible")
                .within(() => {
                  cy.get("[data-test=select-locations-modal] table tbody")
                    .find("tr td:nth-child(1)")
                    .each(($td) => {
                      cy.wrap($td).within(() => {
                        cy.get("input[type=checkbox]").should("be.checked");
                      });
                    });

                  // Re-select locations
                  cy.get("[data-test=select-locations-modal] table tbody")
                    .find("tr td:nth-child(1)")
                    .each(($td, i) => {
                      if (i === locations.length - 1) {
                        cy.wrap($td).within(() => {
                          cy.get("input[type=checkbox]").should("be.checked").click({ force: true });
                        });
                      }
                    })
                    .then(() => {
                      // Get checkedRows
                      cy.get("[data-test=select-locations-modal] mat-checkbox.mat-checkbox-checked").each(($elem) => {
                        const row = {
                          organization: $elem.parents("tr").find("td:eq(1)").text().trim(),
                          location: $elem.parents("tr").find("td:eq(2)").text().trim(),
                        };
                        checkedRows.push(row);
                      });
                    });

                  // Click button OK
                  cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click({ force: true });
                });

              // Confirm locations display after re-selected
              cy.get("[data-test=locations-table] > table")
                .should("be.visible")
                .within(() => {
                  cy.get("tbody > tr").should(($tr) => {
                    expect($tr).to.have.length(checkedRows.length);
                  });
                });

              cy.get("[data-test=locations-table] table tbody")
                .find("tr td:nth-child(1)")
                .each(($td, i) => {
                  expect($td.text().trim()).to.be.eq(checkedRows[i].organization);
                });

              cy.get("[data-test=locations-table] table tbody")
                .find("tr td:nth-child(2)")
                .each(($td, i) => {
                  expect($td.text().trim()).to.be.eq(checkedRows[i].location);
                });
            });
        });
      });

      it("reselect location after save CIT should call api get retailer locations with citId", () => {
        const checkedRows: CheckedRowLocationTab[] = [];
        let locations: Locations[];
        cy.server()
          .route("POST", Cypress.env("host") + endpoints.apiCITSave, { citId: 1 })
          .as("apiCITSavePost");
        cy.get("imo-button")
          .contains("Save")
          .click({ force: true })
          .wait("@apiCITSavePost")
          .then((xhr) => {
            const res = xhr.responseBody;
            if (typeof res === "object") {
              citId = res.citId;
            }
            cy.server()
              .route("GET", Cypress.env("host") + endpoints.apiGetRetailerLocations + `?citId=${citId}`)
              .as("apiSelectedLocations");
          });
        cy.get("imo-button")
          .contains("Select")
          .should("be.visible")
          .click({ force: true })
          .wait("@apiSelectedLocations")
          .then((response) => {
            locations = [];

            const locationsData = response.responseBody;
            if (Array.isArray(locationsData)) {
              locationsData.map((organization: Organization) => {
                organization.locations.map((location: Location) => {
                  locations.push({
                    companyId: organization.id,
                    companyName: organization.name,
                    locationId: location.id,
                    locationName: location.name,
                  });
                });
              });
            }

            cy.get("button")
              .parents("body")
              .find("mat-dialog-container")
              .should("be.visible")
              .within(() => {
                // Re-select locations (un-select last location)
                cy.get("[data-test=select-locations-modal] table tbody")
                  .find("tr td:nth-child(1)")
                  .each(($td, i) => {
                    if (i === locations.length - 1) {
                      cy.wrap($td).within(() => {
                        cy.get("input[type=checkbox]").should("not.be.checked").click({ force: true });
                      });
                      return false;
                    }
                  })
                  .then(() => {
                    // Get checkedRows
                    cy.get("[data-test=select-locations-modal] mat-checkbox.mat-checkbox-checked").each(($elem) => {
                      const row = {
                        organization: $elem.parents("tr").find("td:eq(1)").text().trim(),
                        location: $elem.parents("tr").find("td:eq(2)").text().trim(),
                      };
                      checkedRows.push(row);
                    });
                  });

                // Click button OK
                cy.get("mat-dialog-actions > imo-button > button").contains("OK").should("not.be.disabled").click({ force: true });
              });

            // Confirm locations display after re-selected
            cy.get("[data-test=locations-table] > table")
              .should("be.visible")
              .within(() => {
                cy.get("tbody > tr").should(($tr) => {
                  expect($tr).to.have.length(checkedRows.length);
                });
              });

            cy.get("[data-test=locations-table] table tbody")
              .find("tr td:nth-child(1)")
              .each(($td, i) => {
                expect($td.text().trim()).to.be.eq(checkedRows[i].organization);
              });

            cy.get("[data-test=locations-table] table tbody")
              .find("tr td:nth-child(2)")
              .each(($td, i) => {
                expect($td.text().trim()).to.be.eq(checkedRows[i].location);
              });
          });
      });

      it("reselect location and should display location unavailable alert dialog when not have any locations", () => {
        // Using fixture datas to special case when reselect has no location
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetRetailerLocations + `?citId=*`, `fx:create-cit/no-retailer-location`)
          .as("apiSelectedLocations");
        cy.get("[data-test=locations-form]").within(() => {
          cy.get("imo-button")
            .contains("Select")
            .should("be.visible")
            .click({ force: true })
            .wait("@apiSelectedLocations")
            .wait(500)
            .then(() => {
              // Check dialog Location Unavailable Alert should be visible
              cy.root()
                .parents("body")
                .find("mat-dialog-container > imo-alert")
                .should("be.visible")
                .within(() => {
                  // Check content dialog
                  cy.get(".description").contains("There was no Organisation Location to choose from.");

                  cy.get(".confirm").contains("OK").should("not.be.disabled").click({ force: true });
                });
            });
        });
      });
    });
  });
});
