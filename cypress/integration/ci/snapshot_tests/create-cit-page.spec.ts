describe("Snapshot-testing: Create CIT Page", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

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

  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetCIT, `fx:create-cit/create-cit`)
          .as("apiGetCIT");
        cy.visit(endpoints.pageCreateCIT);
      });

      it(`Case: create CIT general tab`, () => {
        cy.viewport(viewport.x, viewport.y);

        cy.wait("@apiGetCIT");
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // select General tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("General").click();
        });
        // type data into general form
        cy.get(".form-group").within(() => {
          cy.get("[data-test=input-form]").find(generalFormInputIds.name).type("Armorguard", { delay: 0 });
          cy.get("[data-test=input-form]").find(generalFormInputIds.contactName).type("John Snow", { delay: 0 });
          cy.get("[data-test=input-form]").find(generalFormInputIds.postalCode).type("0612", { delay: 0 });
          cy.get("[data-test=input-form]").find(generalFormInputIds.country).type("New Zealand", { delay: 0 });
        });
        // click save button
        cy.server()
          .route("POST", Cypress.env("host") + endpoints.apiCITSave)
          .as("apiCITSavePost");

        cy.get(".page-content").within(() => {
          cy.get("imo-button > button").contains("Save").click();
        });

        cy.wait("@apiCITSavePost").then(() => {
          cy.get("button").parents("body").find(".mat-simple-snackbar-action button").click();
          cy.get("body").toMatchImageSnapshot();
        });
      });

      it(`Case: create CIT services tab`, () => {
        cy.viewport(viewport.x, viewport.y);

        // select Services tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Services").click();
        });

        cy.get("body").toMatchImageSnapshot();

        // type data into services form
        cy.get("[data-test=pickup-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Collect Remove")
            .within(() => {
              cy.get("input[type=checkbox]").click({ force: true });
            });
        });

        cy.get("[data-test=delivery-notes-option]").within(() => {
          cy.get("mat-checkbox")
            .contains("Replenish")
            .within(() => {
              cy.get("input[type=checkbox]").click({ force: true });
            });
        });
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // select a currency and take a snapshot
        cy.get("[data-test=currency-picker]").within(() => {
          cy.get("mat-select").click({ force: true }).parents("body").find("mat-option").first().click({ force: true });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: create CIT calendar tab`, () => {
        cy.viewport(viewport.x, viewport.y);

        // select Calendar tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Calendar").click();
        });

        cy.get("body").toMatchImageSnapshot();

        // type data into calendar form
        cy.get("[data-test=working-days-option]").within(() => {
          cy.get("imo-working-day")
            .contains("Monday")
            .within(() => {
              cy.get("input[type=checkbox]").click({ force: true });
            });

          cy.get("imo-working-day")
            .contains("Saturday")
            .within(() => {
              cy.get("input[type=checkbox]").click({ force: true });
            });
        });

        cy.get("[data-test=cut-off-time]").within(() => {
          cy.get("button").click();
          cy.get("button").parents("body").find(".time-picker").contains(".mat-option-text", "12:30 AM").click();
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // click select button
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetHolidayCalendars, `fx:create-cit/cit-holiday-calendars`)
          .as("apiGetHolidayCalendars");

        cy.get("imo-button").contains("Select").click().wait("@apiGetHolidayCalendars");

        // check data of holiday calendars table
        cy.get("imo-expansion-table.holiday-calendars-table-modal").within(() => {
          cy.get("imo-expansion-panel").each(($el) => {
            cy.wrap($el).within(() => {
              cy.get("[type='checkbox']").click({ force: true });
              // click to open panel
              cy.get("[data-test=column]").eq(0).click({ force: true });
            });
          });
        });
        cy.get("body").toMatchImageSnapshot();

        // after select holiday
        cy.get("button").contains("OK").click({ force: true });
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: create CIT order tab`, () => {
        cy.viewport(viewport.x, viewport.y);

        // select Order tab
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Order").click();
        });

        // take a snapshot when orderMethod is manual.
        cy.get("body").toMatchImageSnapshot();

        // type data into Order form - Order Email and take a snapshot
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
          cy.get("[name=order-email]").type("test@email.xyz");
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // type data into Order form - SFTP and take a snapshot
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

          cy.get("label:contains(URL) + imo-form").find(".mat-input-element").type("test@email.xyz");
          cy.get("label:contains(Optional Folder) + imo-form").find(".mat-input-element").type("/user/test@email.xyz");
          cy.get("label:contains(Port) + imo-form").find(".mat-input-element").type("77777");
          cy.get("label:contains(User) + imo-form").find(".mat-input-element").type("test@email.xyz");
          cy.get("label:contains(Password) + imo-form").find(".mat-input-element").type("test@email.xyz");
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });

      it(`Case: create CIT locations tab`, () => {
        cy.viewport(viewport.x, viewport.y);
        cy.wait(100);

        // select Locations tab and take a snapshot
        cy.get(".page-content").within(() => {
          cy.get(".mat-tab-label-content").contains("Locations").click();
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // click Select button when have more than 0 location, check all locations and take a snapshot
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetRetailerLocations + "?citId=*", `fx:create-cit/retailer-locations`)
          .as("apiSelectedLocations");

        cy.get("[data-test=locations-form]").within(() => {
          cy.get("imo-button").contains("Select").click({ force: true });
          cy.wait("@apiSelectedLocations");

          cy.root()
            .parents("body")
            .find("mat-dialog-container")
            .within(() => {
              // select locations
              cy.get("[data-test=select-locations-modal] table tbody")
                .find("tr td:nth-child(1)")
                .each(($td) => {
                  cy.wrap($td).within(() => {
                    cy.get("input[type=checkbox]").click({ force: true });
                  });
                });
            });
        });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // Click button OK and take a snapshot
        cy.get("mat-dialog-actions > imo-button > button").contains("OK").click({ force: true });

        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();

        // click Select button when not have any locations and take a snapshot
        cy.server()
          .route("GET", Cypress.env("host") + endpoints.apiGetRetailerLocations + "?citId=*", [])
          .as("apiSelectedLocations");

        cy.get("imo-button").contains("Select").click({ force: true });
        cy.wait("@apiSelectedLocations");
        cy.get("body").toMatchImageSnapshot();

        // click OK button of dialog and take a snapshot
        cy.get("imo-alert > imo-button > button").contains("OK").click({ force: true });
        cy.wait(100);
        cy.get("body").toMatchImageSnapshot();
      });
    });
  });
});
