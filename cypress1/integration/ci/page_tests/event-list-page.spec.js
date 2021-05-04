/// <reference types="Cypress" />

const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
let apiAssetEvents;
let page = 0,
  numberPage,
  listingCount;
describe("Page-Event List", () => {
  const eventSource = [
    {
      label: "Asset",
      value: "Asset",
    },
    {
      label: "Bridge",
      value: "Bridge",
    },
  ];
  const eventType = [
    {
      label: "downloadPackage",
      value: "downloadPackage",
    },
    {
      label: "install",
      value: "install",
    },
    {
      label: "logs",
      value: "logs",
    },
    {
      label: "reboots",
      value: "reboots",
    },
    {
      label: "selftests",
      value: "selftests",
    },
  ];
  const importance = [
    {
      label: "Information",
      value: "Information",
    },
    {
      label: "Error",
      value: "Error",
    },
  ];
  const infoImg = "assets/img/icons/info-circle-solid.svg";
  const errorImg = "assets/img/icons/times-circle-regular.svg";
  const keysEvent = ["date", "eventSource", "subject", "importance"];
  before(() => {
    apiAssetEvents = Cypress.env("apiAssetEvents");
    cy.server()
      .route("GET", `${apiAssetEvents}*`)
      .as("apiAssetEvents");
    cy.visit(Cypress.env("assetEvents")).wait("@apiAssetEvents");
  });
  context("initial display", () => {
    it("Initial display", () => {
      // check Title value
      cy.get("bridge-event-list-page")
        .find(".title")
        .should("be.visible")
        .contains("Event List: CI10 (100000)");
      // check Date From blank
      cy.get("bridge-event-list-filter")
        .find("bridge-range-date-time-picker[data-test='date-time'] .mat-form-field-infix input")
        .first()
        .should("have.value", "");
      // check Date To blank
      cy.get("bridge-event-list-filter")
        .find("bridge-range-date-time-picker[data-test='date-time'] .mat-form-field-infix input")
        .last()
        .should("have.value", "");
      // check EventSource blank
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='source-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      // check EventType blank
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='type-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      // check EventType disabled
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='type-select']")
        .should("have.attr", "ng-reflect-location-disabled", "true");
      // check Importance blank
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='importance-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.request(`${apiAssetEvents}?limit=10&offset=0`).then((res) => {
        cy.wait(1000);
        cy.get("bridge-event-list-table tbody")
          .find("tr")
          .its("length")
          .should("be.eq", Math.min(res.body.items.length, 10));
        // on paging init load
        cy.get("bridge-pagination[data-test='event-pagination']")
          .find(".pagination button")
          .then((listing) => {
            listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
            if (listingCount > 1) {
              cy.window()
                .scrollTo("bottom")
                .then(() => {
                  cy.wrap(listing)
                    .not(".left-arrow,.right-arrow")
                    .eq("0")
                    .click();
                  // page = Math.ceil(res.body.totalCount / 10) - 1;
                  cy.request(`${apiAssetEvents}?limit=10&offset=0`).then((res) => {
                    cy.get("bridge-event-list-table tbody tr").each(($el, i) => {
                      keysEvent.forEach((value, index) => {
                        switch (value) {
                          case "date":
                            cy.wrap($el)
                              .find(`td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", generatorDate(res.body.items[i][value]));
                            break;
                          case "importance":
                            cy.wrap($el)
                              .find(`td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", res.body.items[i][value]);
                            let typeImportance = "error";
                            typeImportance = res.body.items[i][value] ? "information" : "error";
                            if (typeImportance === "information") {
                              cy.wrap($el)
                                .find("bridge-svg-icon img")
                                .should("have.attr", "src")
                                .should("include", infoImg);
                            } else {
                              cy.wrap($el)
                                .find("bridge-svg-icon img")
                                .should("have.attr", "src")
                                .should("include", errorImg);
                            }
                            break;
                          default:
                            cy.wrap($el)
                              .find(`td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", res.body.items[i][value]);
                            break;
                        }
                      });
                    });
                    cy.get("bridge-pagination")
                      .find("span.description")
                      .invoke("text")
                      .then((text) => text.trim())
                      .should(
                        "eq",
                        `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                      );
                    numberPage = Math.ceil(res.body.totalCount / 10) + 2;
                    cy.get("bridge-pagination[data-test='event-pagination']")
                      .find("nav button")
                      .its("length")
                      .should("be.eq", Math.min(numberPage, 13));
                  });
                });
            }
          });
      });
    });
  });
  context("Search filter operations", () => {
    it("Checking items in each list", () => {
      // check show multi select EventSource
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='source-select'] mat-select")
        .click()
        .then(() => {
          // check length show panel chose EventSource
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
            cy.wrap($el).should("have.length", eventSource.length + 1);
            // check show string
            cy.wrap($el)
              .each(($otp, index) => {
                if (index === 0) {
                  expect($otp.text().trim()).to.be.eq("Select event source");
                } else {
                  expect($otp.text().trim()).to.be.eq(eventSource[index - 1].label);
                }
              })
              .then(() => cy.get("body").click());
          });
        });

      // check show multi select Importance
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='importance-select'] mat-select")
        .click()
        .then(() => {
          cy.wait(500);
          // check length show panel chose Importance
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
            cy.wrap($el).should("have.length", importance.length + 1);
            // check show string
            cy.wrap($el)
              .each(($otp, index) => {
                if (index === 0) {
                  expect($otp.text().trim()).to.be.eq("Select importance");
                } else {
                  expect($otp.text().trim()).to.be.eq(importance[index - 1].label);
                }
              })
              .then(() => cy.get("body").click());
          });
        });
    });

    it("Change the start Date", () => {
      cy.get("bridge-range-date-time-picker mat-form-field:eq(0) .mat-form-field-suffix")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container ngx-mat-datetime-content ngx-mat-calendar ngx-mat-month-view tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container ngx-mat-datetime-content ngx-mat-calendar")
                .invoke("attr", "ng-reflect-selected")
                .then((value) => {
                  cy.get(".cdk-overlay-container ngx-mat-datetime-content .actions button")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      const check = Cypress.moment.utc(value);
                      const dateTime = (check.isValid() && check.format("M/D/YYYY, h:mm:ss A")) || "";
                      cy.get("bridge-range-date-time-picker mat-form-field:eq(0) input")
                        .first()
                        .should("have.value", dateTime);
                    });
                });
            });
        });
    });

    it("Change the finish Date", () => {
      let inputDate = new Date();
      inputDate.setDate(inputDate.getDate() + 1);
      const check = Cypress.moment.utc(inputDate);
      const date = (check.isValid() && check.format("M/D/YYYY, h:mm:ss A")) || "";
      cy.get("bridge-range-date-time-picker[data-test='date-time'] mat-form-field .mat-form-field-infix input")
        .last()
        .focus()
        .type(date)
        .blur()
        .should("have.value", date);
      cy.wait(100);
    });

    it("Change Event Source item to blank", () => {
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='source-select']")
        .click()
        .then(($el) => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(0)`)
            .click()
            .then(() => {
              cy.wait(500);
              expect(Cypress.$($el).attr("ng-reflect-selected-item")).to.be.eq(undefined);
              cy.get("bridge-event-list-filter")
                .find("bridge-select[data-test='type-select']")
                .should("have.attr", "ng-reflect-selected-item", ``);
              cy.get("bridge-event-list-filter")
                .find("bridge-select[data-test='type-select']")
                .should("have.attr", "ng-reflect-location-disabled", `true`);
            });
        });
    });

    it("Change Event Source item to none-blank", () => {
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='source-select']")
        .click()
        .then(($el) => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
            .click()
            .then(() => {
              cy.wait(100);
              cy.get("bridge-event-list-filter")
                .find("bridge-select[data-test='type-select']")
                .should("have.attr", "ng-reflect-location-disabled", `false`);
              cy.get("bridge-event-list-filter")
                .find("bridge-select[data-test='type-select']")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
                    cy.wrap($el).should("have.length", eventType.length + 1);
                    // check show string
                    cy.wrap($el)
                      .each(($otp, index) => {
                        if (index === 0) {
                          expect($otp.text().trim()).to.be.eq("Select event type");
                        } else {
                          expect($otp.text().trim()).to.be.eq(eventType[index - 1].label);
                        }
                      })
                      .then(() => cy.get("body").click());
                  });
                });
            });
        });
    });

    it("Select a single EventType item", () => {
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='source-select']")
        .click()
        .then(($el) => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
            .click()
            .then(() => {
              cy.wait(100);
              cy.get("bridge-event-list-filter")
                .find("bridge-select[data-test='type-select']")
                .should("have.attr", "ng-reflect-location-disabled", `false`);
              cy.get("bridge-event-list-filter")
                .find("bridge-select[data-test='type-select']")
                .click()
                .then(($el) => {
                  cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(() => {
                    cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
                      .click()
                      .then(() => {
                        cy.wrap($el)
                          .invoke("text")
                          .should("to.be.eq", "install");
                      });
                  });
                });
            });
        });
    });

    it("Select a single Importance item", () => {
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='importance-select']")
        .click()
        .then(($el) => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='Information`).click();
          cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `Information`);
        });
    });
    it("When clicked the OK button, there were 0 results", () => {
      cy.server()
        .route("GET", `${apiAssetEvents}*`)
        .as("apiAssetEvents");
      let inputDate = new Date();
      inputDate.setDate(inputDate.getDate() + 1);
      const check = Cypress.moment.utc(inputDate);
      const date = (check.isValid() && check.format("M/D/YYYY")) || "";
      cy.get("bridge-range-date-time-picker[data-test='date-time'] mat-form-field .mat-form-field-infix input")
        .first()
        .focus()
        .clear()
        .type(date)
        .blur()
        .then(() => {
          cy.wait(1000);
          cy.get("bridge-event-list-filter")
            .find('bridge-button[data-test="ok"]')
            .click()
            .then(() => {
              cy.wait("@apiAssetEvents").then(({ responseBody }) => {
                numberPage = Math.ceil(responseBody.totalCount / 10) + 3;
                cy.get(`bridge-pagination[data-test="event-pagination"] nav.pagination button`)
                  .its("length")
                  .should("eq", numberPage);
                cy.get("bridge-pagination")
                  .find("span.description")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", `No item`);
              });
            });
        });
    });
    it("When clicked the OK button, there were more than 1 results", () => {
      cy.get("bridge-event-list-filter")
        .find('bridge-button[data-test="clear"]')
        .click();
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='source-select']")
        .click()
        .then(() => {
          cy.get(".cdk-overlay-container .cdk-overlay-pane mat-option:eq(1)")
            .click()
            .then(() => {
              cy.get("bridge-event-list-filter")
                .find('bridge-button[data-test="ok"]')
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.request(`${apiAssetEvents}?eventSource=Asset&lang=en&limit=10&offset=0`).then(({ body }) => {
                    // check number recode return
                    cy.wait(500);
                    cy.get("bridge-event-list-table tbody")
                      .find("tr")
                      .its("length")
                      .should("eq", body.items.length);
                    // check data map with table event list
                    cy.get("bridge-event-list-table tbody tr").each(($el, i) => {
                      keysEvent.forEach((value, index) => {
                        switch (value) {
                          case "date":
                            cy.wrap($el)
                              .find(`td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", generatorDate(body.items[i][value]));
                            break;
                          case "importance":
                            cy.wrap($el)
                              .find(`td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);

                            if (body.items[i].information === "information") {
                              cy.wrap($el)
                                .find("bridge-svg-icon img")
                                .should("have.attr", "src")
                                .should("include", infoImg);
                            } else if (body.items[i].information === "error") {
                              cy.wrap($el)
                                .find("bridge-svg-icon img")
                                .should("have.attr", "src")
                                .should("include", errorImg);
                            }
                            break;
                          default:
                            cy.wrap($el)
                              .find(`td:eq(${index})`)
                              .invoke("text")
                              .then((text) => text.trim())
                              .should("equal", body.items[i][value]);
                            break;
                        }
                      });
                    });
                    page = 0;
                    // check label show description
                    cy.get("bridge-pagination")
                      .find("span.description")
                      .invoke("text")
                      .then((text) => text.trim())
                      .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
                    // check label number button show paging
                    numberPage = Math.ceil(body.totalCount / 10) + 2;
                    page = 0;
                    cy.get("bridge-pagination[data-test='event-pagination']")
                      .find("nav button")
                      .its("length")
                      .should("be.eq", Math.min(numberPage, 13));
                  });
                });
            });
        });
    });
    it("Click the Clear button", () => {
      cy.wait(500);
      cy.get("bridge-range-date-time-picker mat-form-field:eq(0) .mat-form-field-suffix")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container ngx-mat-datetime-content ngx-mat-calendar ngx-mat-month-view tbody tr td.mat-calendar-body-active")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(".cdk-overlay-container ngx-mat-datetime-content .actions button")
                .click()
                .then(() => {
                  cy.get("bridge-range-date-time-picker mat-form-field:eq(1) .mat-form-field-suffix")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get(
                        ".cdk-overlay-container ngx-mat-datetime-content ngx-mat-calendar ngx-mat-month-view tbody tr td.mat-calendar-body-active",
                      )
                        .click()
                        .then(() => {
                          cy.wait(500);
                          cy.get(".cdk-overlay-container ngx-mat-datetime-content .actions button").click();
                        });
                    });
                });
            });
        });

      // set/check asset EventSource and Enable Event Type
      cy.wait(500);
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='source-select'] mat-select")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`).click();
        });
      cy.wait(500);
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='type-select'] mat-select")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`).click();
        });
      cy.wait(500);
      cy.get("bridge-event-list-filter")
        .find("bridge-select[data-test='importance-select'] mat-select")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(1)`).click();
          cy.wait(500);
        });
      // init clear filter
      cy.get("bridge-event-list-filter")
        .find('bridge-button[data-test="clear"]')
        .click()
        .then(() => {
          // check Date From
          cy.get("bridge-event-list-filter")
            .find("bridge-range-date-time-picker[data-test='date-time'] .mat-form-field-infix input")
            .first()
            .should("have.value", "");
          // check Date To
          cy.get("bridge-event-list-filter")
            .find("bridge-range-date-time-picker[data-test='date-time'] .mat-form-field-infix input")
            .last()
            .should("have.value", "");
          // check EventSource
          cy.get("bridge-event-list-filter")
            .find("bridge-select[data-test='source-select'] mat-select")
            .should("have.attr", "ng-reflect-value", "");
          // check EventType
          cy.get("bridge-event-list-filter")
            .find("bridge-select[data-test='type-select'] mat-select")
            .should("have.attr", "ng-reflect-value", "");
          // check EventType is disabled
          cy.get("bridge-event-list-filter")
            .find("bridge-select[data-test='type-select']")
            .should("have.attr", "ng-reflect-location-disabled", "true");
          // check Importance
          cy.get("bridge-event-list-filter")
            .find("bridge-select[data-test='importance-select'] mat-select")
            .should("have.attr", "ng-reflect-value", "");
        });
    });
  });
  context("Paging operations", () => {
    it("Click the page 2 button", () => {
      cy.get("bridge-pagination[data-test='event-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.window()
              .scrollTo("bottom")
              .then(() => {
                cy.wrap(listing)
                  .not(".left-arrow,.right-arrow")
                  .eq("1")
                  .click()
                  .then(() => {
                    page = 1;
                    cy.request(`${apiAssetEvents}?lang=en&limit=10&offset=10`).then(({ body }) => {
                      cy.wait(1000);
                      cy.get("bridge-event-list-table tbody tr").each(($el, i) => {
                        cy.get("bridge-event-list-table tbody")
                          .find("tr")
                          .its("length")
                          .should("eq", body.items.length);
                        keysEvent.forEach((value, index) => {
                          switch (value) {
                            case "date":
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("equal", generatorDate(body.items[i][value]));
                              break;
                            case "importance":
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("equal", body.items[i][value]);
                              if (body.items[i].information === "information") {
                                cy.wrap($el)
                                  .find("bridge-svg-icon img")
                                  .should("have.attr", "src")
                                  .should("include", infoImg);
                              } else if (body.items[i].information === "error") {
                                cy.wrap($el)
                                  .find("bridge-svg-icon img")
                                  .should("have.attr", "src")
                                  .should("include", errorImg);
                              }
                              break;
                            default:
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("equal", body.items[i][value]);
                              break;
                          }
                        });
                      });
                      numberPage = Math.ceil(body.totalCount / 10) + 2;
                      page = 1;
                      cy.get("bridge-pagination[data-test='event-pagination']")
                        .find("nav button")
                        .its("length")
                        .should("be.eq", Math.min(numberPage, 13));
                      cy.get("bridge-pagination")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
                    });
                  });
              });
          }
        });
    });
    it("Click the < button", () => {
      cy.wait(500);
      cy.get("bridge-pagination[data-test='event-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.get("bridge-pagination[data-test='event-pagination'] .pagination button.left-arrow")
              .click()
              .then(() => {
                page =
                  parseInt(
                    Cypress.$("bridge-pagination[data-test='event-pagination']")
                      .find(".pagination button.selected")
                      .text(),
                  ) - 1;
                cy.request(`${apiAssetEvents}?lang=en&limit=10&offset=${page * 10}`).then(({ body }) => {
                  cy.wait(1000);
                  cy.get("bridge-event-list-table tbody tr").each(($el, i) => {
                    cy.get("bridge-event-list-table tbody")
                      .find("tr")
                      .its("length")
                      .should("eq", body.items.length);
                    keysEvent.forEach((value, index) => {
                      switch (value) {
                        case "date":
                          cy.wrap($el)
                            .find(`td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", generatorDate(body.items[i][value]));
                          break;
                        case "importance":
                          cy.wrap($el)
                            .find(`td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body.items[i][value]);
                          if (body.items[i].information === "information") {
                            cy.wrap($el)
                              .find("bridge-svg-icon img")
                              .should("have.attr", "src")
                              .should("include", infoImg);
                          } else if (body.items[i].information === "error") {
                            cy.wrap($el)
                              .find("bridge-svg-icon img")
                              .should("have.attr", "src")
                              .should("include", errorImg);
                          }
                          break;
                        default:
                          cy.wrap($el)
                            .find(`td:eq(${index}).ng-star-inserted`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body.items[i][value]);
                          break;
                      }
                    });
                  });
                  cy.wait(500);
                  numberPage = Math.ceil(body.totalCount / 10) + 2;
                  cy.get("bridge-pagination[data-test='event-pagination']")
                    .find("nav button")
                    .its("length")
                    .should("be.eq", Math.min(numberPage, 13));
                  cy.get("bridge-pagination")
                    .find("span.description")
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
                });
              });
          }
        });
    });
    it("Click the > button", () => {
      cy.wait(500);
      cy.get("bridge-pagination[data-test='event-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.get("bridge-pagination[data-test='event-pagination'] .pagination button.right-arrow")
              .click()
              .then(() => {
                page =
                  parseInt(
                    Cypress.$("bridge-pagination[data-test='event-pagination']")
                      .find(".pagination button.selected")
                      .text(),
                  ) - 1;
                cy.request(`${apiAssetEvents}?lang=en&limit=10&offset=${page * 10}`).then(({ body }) => {
                  cy.wait(1000);
                  cy.get("bridge-event-list-table tbody tr").each(($el, i) => {
                    cy.get("bridge-event-list-table tbody")
                      .find("tr")
                      .its("length")
                      .should("eq", body.items.length);
                    keysEvent.forEach((value, index) => {
                      switch (value) {
                        case "date":
                          cy.wrap($el)
                            .find(`td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", generatorDate(body.items[i][value]));
                          break;
                        case "importance":
                          cy.wrap($el)
                            .find(`td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body.items[i][value]);
                          if (body.items[i].information === "information") {
                            cy.wrap($el)
                              .find("bridge-svg-icon img")
                              .should("have.attr", "src")
                              .should("include", infoImg);
                          } else if (body.items[i].information === "error") {
                            cy.wrap($el)
                              .find("bridge-svg-icon img")
                              .should("have.attr", "src")
                              .should("include", errorImg);
                          }
                          break;
                        default:
                          cy.wrap($el)
                            .find(`td:eq(${index}).ng-star-inserted`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body.items[i][value]);
                          break;
                      }
                    });
                  });
                  cy.wait(500);
                  numberPage = Math.ceil(body.totalCount / 10) + 2;
                  cy.get("bridge-pagination[data-test='event-pagination']")
                    .find("nav button")
                    .its("length")
                    .should("be.eq", Math.min(numberPage, 13));
                  cy.get("bridge-pagination")
                    .find("span.description")
                    .invoke("text")
                    .then((text) => text.trim())
                    .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, body.totalCount)} of ${body.totalCount} items`);
                });
              });
          }
        });
    });
  });
});
