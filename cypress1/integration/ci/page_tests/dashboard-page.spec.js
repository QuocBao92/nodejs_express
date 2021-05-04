/// <reference types="Cypress" />

let data = {};
let apiData;
const dashboard = "dashboard";
apiAssetsURL = Cypress.env("apiAssets");
apiTypesURL = Cypress.env("apiTypes");
apiRegionsURL = Cypress.env("apiRegions");
apiCustomersURL = Cypress.env("apiCustomers");
apiAvailabilityURL = Cypress.env("apiAvailability");
apiAssetsMapURL = Cypress.env("apiAssetsMap");
const visitDataUrl = (key) => {
  let page = `${Cypress.env(key)}`;
  cy.server()
    .route("GET", `${apiAvailabilityURL}*`)
    .as("apiAvailability")
    .route("GET", `${apiAssetsMapURL}*`)
    .as("apiAssetsMap")
    .route("GET", `${apiAssetsURL}*`)
    .as("apiAssets")
    .route("GET", `${apiCustomersURL}*`)
    .as("apiCustomers")
    .route("GET", `${apiTypesURL}*`)
    .as("apiTypes")
    .route("GET", `${apiRegionsURL}*`)
    .as("apiRegions");
  return cy.visit(page).wait(["@apiAvailability", "@apiAssetsMap", "@apiAssets", "@apiCustomers", "@apiTypes", "@apiRegions"]);
};
const assetStatus = [
  {
    label: "Good",
    value: "Good",
  },
  {
    label: "Error",
    value: "Error",
  },
  {
    label: "Missing",
    value: "Missing",
  },
];
let apiAvailability, apiAssetsMap, apiAssets, apiCustomers, apiTypes, apiRegions;

describe("Page-Dashboard", () => {
  context("Initial display", () => {
    before(() => {
      visitDataUrl(dashboard).then((api) => {
        const [v1, v2, v3, v4, v5, v6] = api;
        apiAvailability = v1;
        apiAssetsMap = v2;
        apiAssets = v3;
        apiCustomers = v4;
        apiTypes = v5;
        apiRegions = v6;
      });
    });
    it("Display with no arguments", () => {
      //  check Keyword
      cy.get("bridge-asset-filter")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .should("have.value", "");
      // check asset status
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      // check model select
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='model-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      // check region select
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='region-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      // check organization select
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='organization-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      // check location select
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='location-select']")
        .should("have.attr", "ng-reflect-location-disabled", "true");
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='location-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      // Availability の Good 、 Error 、 Missing の 件 数 チ ェ ッ ク
      const { body } = apiAvailability.response;

      body.forEach((element, index) => {
        cy.get(
          `bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test="availability-content-list"] li:eq(${index}) .item-title`,
        ).should("have.text", element.title);
        cy.get(
          `bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test="availability-content-list"] li:eq(${index}) .item-value`,
        ).should("have.text", element.value);
      });
      // Map Asset List display check (non-display)
      cy.get("mat-card-content bridge-map-assets-board .asset-list-group").should("not.have.class", "open");

      const maps = apiAssetsMap.response.body;
      cy.wait(1000);
      maps.map((map) => {
        cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}']`)
          .its("length")
          .should("eq", 1);
        cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should("have.css", "width", "30px");
        cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should("have.css", "height", "48px");
      });
    });
    it("Display with arguments", () => {
      // set/check value key Keyword

      keyword = "GATEWAY";
      const dataCheck = {};
      dataCheck["keyword"] = keyword;
      cy.get("bridge-asset-filter")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .type(keyword);
      cy.get("bridge-asset-filter")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .should("have.value", keyword);

      // set/check asset status

      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select'] mat-select")
        .click()
        .then(() => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${assetStatus[0].value}']`)
            .click()
            .then(() => {
              cy.wait(500);
              cy.get("body").click();
              cy.get("bridge-asset-filter")
                .find("bridge-select-multi[data-test='status-select'] mat-select")
                .should("have.attr", "ng-reflect-value", assetStatus[0].value);
              dataCheck["status"] = assetStatus[0].value;
            });
        });

      // set/check asset Model

      cy.request(`${apiTypesURL}`).then((res) => {
        if (res.body.length > 0) {
          cy.wait(500);
          cy.get("bridge-asset-filter")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                  cy.get("bridge-asset-filter")
                    .find("bridge-select-multi[data-test='model-select'] mat-select")
                    .should("have.attr", "ng-reflect-value", res.body[0].typeId);
                  dataCheck["model"] = res.body[0].typeId;
                });
            });
        }
      });

      // set/check asset Region
      cy.request(`${apiRegionsURL}`).then((res) => {
        if (res.body.length > 0) {
          cy.wait(500);
          cy.get("bridge-asset-filter")
            .find("bridge-select[data-test='region-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[1].regionId}']`)
                .click()
                .then(() => {
                  dataCheck["region"] = res.body[1].regionId;
                });
            });
        }
      });
      // set/check asset Organization
      cy.request(`${apiCustomersURL}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-asset-filter")
            .find("bridge-select[data-test='organization-select']")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("bridge-asset-filter")
                    .find("bridge-select[data-test='organization-select'] mat-select")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", res.body[1].customerId);
                  cy.get("bridge-asset-filter")
                    .find("bridge-select[data-test='location-select']")
                    .should("have.attr", "ng-reflect-location-disabled", `false`);
                  const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", res.body[1].customerId);
                  dataCheck["organization"] = res.body[1].customerId;
                  cy.request(`${apiLocations}`).then((res) => {
                    cy.get("bridge-asset-filter")
                      .find("bridge-select[data-test='location-select']")
                      .click()
                      .then(() => {
                        cy.wait(500);
                        dataCheck["location"] = res.body[0].locationId;
                        cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].locationId}']`)
                          .click()
                          .then(() => {
                            cy.get("bridge-asset-filter")
                              .find('bridge-button[data-test="ok"]')
                              .click();
                            cy.wait(1000);
                            cy.get(`bridge-header bridge-header-tab bridge-header-tab-item[ng-reflect-text="packages"]`)
                              .click()
                              .then(() => {
                                cy.wait(1000);
                                cy.get(`bridge-header bridge-header-tab bridge-header-tab-item[ng-reflect-text="dashboardHeader"]`)
                                  .click()
                                  .then(() => {
                                    cy.wait(1000);
                                    console.log(dataCheck);
                                    cy.get("bridge-asset-filter")
                                      .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
                                      .should("have.value", dataCheck["keyword"]);
                                    // check asset status
                                    cy.get("bridge-asset-filter")
                                      .find("bridge-select-multi[data-test='status-select'] mat-select")
                                      .should("have.attr", "ng-reflect-value", dataCheck["status"]);
                                    // check model select
                                    cy.get("bridge-asset-filter")
                                      .find("bridge-select-multi[data-test='model-select'] mat-select")
                                      .should("have.attr", "ng-reflect-value", dataCheck["model"]);
                                    // check region select
                                    cy.get("bridge-asset-filter")
                                      .find("bridge-select[data-test='region-select'] mat-select")
                                      .should("have.attr", "ng-reflect-value", dataCheck["region"]);
                                    // check organization select
                                    cy.get("bridge-asset-filter")
                                      .find("bridge-select[data-test='organization-select'] mat-select")
                                      .should("have.attr", "ng-reflect-value", dataCheck["organization"]);
                                    // check location select
                                    cy.get("bridge-asset-filter")
                                      .find("bridge-select[data-test='location-select']")
                                      .should("have.attr", "ng-reflect-location-disabled", "false");
                                    cy.get("bridge-asset-filter")
                                      .find("bridge-select[data-test='location-select'] mat-select")
                                      .should("have.attr", "ng-reflect-value", dataCheck["location"]);
                                  });
                              });
                          });
                      });
                  });
                });
            });
        }
      });
    });

    // it("Display with arguments", () => {
    //   //  check Keyword
    //   cy.get("bridge-asset-filter")
    //     .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
    //     .should("have.value", "");
    //   // check asset status
    //   cy.get("bridge-asset-filter")
    //     .find("bridge-select-multi[data-test='status-select'] mat-select")
    //     .should("have.attr", "ng-reflect-value", "");
    //   // check model select
    //   cy.get("bridge-asset-filter")
    //     .find("bridge-select-multi[data-test='model-select'] mat-select")
    //     .should("have.attr", "ng-reflect-value", "");
    //   // check region select
    //   cy.get("bridge-asset-filter")
    //     .find("bridge-select[data-test='region-select'] mat-select")
    //     .should("have.attr", "ng-reflect-value", "");
    //   // check organization select
    //   cy.get("bridge-asset-filter")
    //     .find("bridge-select[data-test='organization-select'] mat-select")
    //     .should("have.attr", "ng-reflect-value", "");
    //   // check location select
    //   cy.get("bridge-asset-filter")
    //     .find("bridge-select[data-test='location-select']")
    //     .should("have.attr", "ng-reflect-location-disabled", "true");
    //   cy.get("bridge-asset-filter")
    //     .find("bridge-select[data-test='location-select'] mat-select")
    //     .should("have.attr", "ng-reflect-value", "");
    //   // Map Asset List display check (non-display)
    //   cy.get("mat-card-content bridge-map-assets-board .asset-list-group").should("not.have.class", "open");
    //   if (apiCustomers.response.body.length > 0) {
    //     cy.get("bridge-asset-filter")
    //       .find("bridge-select[data-test='organization-select']")
    //       .click()
    //       .then(() => {
    //         cy.wait(500);
    //         cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
    //           .click()
    //           .then(() => {
    //             cy.get("body").click();
    //             cy.wait(500);
    //             const locationId = apiCustomers.response.body[1].customerId;
    //             cy.get("bridge-asset-filter")
    //               .find("bridge-select[data-test='location-select']")
    //               .should("have.attr", "ng-reflect-location-disabled", `false`);
    //             cy.get(`bridge-asset-filter bridge-button[data-test="ok"]`)
    //               .click({
    //                 force: true,
    //               })
    //               .then(() => {
    //                 cy.request(`${Cypress.env("apiAssetsMap")}?organization=${locationId}`).then(({ body }) => {
    //                   if (body.length > 0) {
    //                     const maps = body;
    //                     cy.wait(1000);
    //                     maps.map((map) => {
    //                       cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}']`)
    //                         .its("length")
    //                         .should("eq", 1);
    //                       cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should(
    //                         "have.css",
    //                         "width",
    //                         "30px",
    //                       );
    //                       cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should(
    //                         "have.css",
    //                         "height",
    //                         "48px",
    //                       );
    //                     });
    //                   }
    //                 });
    //               });
    //           });
    //       });
    //   }
    // });
  });
  context("Search filter operations", () => {
    before(() => {
      visitDataUrl(dashboard).then((api) => {
        const [v1, v2, v3, v4, v5, v6] = api;
        apiAvailability = v1;
        apiAssetsMap = v2;
        apiAssets = v3;
        apiCustomers = v4;
        apiTypes = v5;
        apiRegions = v6;
      });
      cy.wait(1000);
    });

    it("Checking items in each list", () => {
      // check show multi select Status
      cy.wait(500);
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select']")
        .click()
        .then(() => {
          cy.wait(500);
          // check length show panel chose Status
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
            cy.wrap($el).should("have.length", assetStatus.length + 1);
            // check show string
            cy.wrap($el)
              .each(($otp, index) => {
                if (index === 0) {
                  expect($otp.text().trim()).to.be.eq("ALL");
                } else {
                  expect($otp.text().trim()).to.be.eq(assetStatus[index - 1].label);
                }
              })
              .then(() => cy.get("body").click());
          });
        });

      // check show multi select Model
      if (apiTypes.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select-multi[data-test='model-select'] mat-select")
          .click()
          .then(() => {
            cy.wait(500);
            // check length show panel chose Model
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", apiTypes.response.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("ALL");
                  } else {
                    expect($otp.text().trim()).to.be.eq(apiTypes.response.body[index - 1].typeId);
                  }
                })
                .then(() => cy.get("body").click());
            });
          });
      }
      // check show multi select Region
      if (apiRegions.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='region-select'] mat-select")
          .click()
          .then(() => {
            // check length show panel chose Region
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", apiRegions.response.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("Select region");
                  } else {
                    expect($otp.text().trim()).to.be.eq(apiRegions.response.body[index - 1].regionId);
                  }
                })
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          });
      }
      // check show multi select Organization
      if (apiCustomers.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='organization-select'] mat-select")
          .click()
          .then(() => {
            // check length show panel chose Region
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", apiCustomers.response.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("Select organization");
                  } else {
                    expect($otp.text().trim()).to.be.eq(apiCustomers.response.body[index - 1].customerId);
                  }
                })
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          });
      }
    });
    it("Select multiple Status items", () => {
      cy.wait(500);
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select']")
        .click()
        .then(($el) => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${assetStatus[0].value}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${assetStatus[1].value}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${assetStatus[2].value}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${assetStatus[0].value}']`).click();
          cy.wait(500);
          cy.get("body").click();
          cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `${assetStatus[1].value},${assetStatus[2].value}`);
        });
    });
    it("Select a single Status item", () => {
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="clear"]')
        .click();
      cy.wait(500);
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select']")
        .click()
        .then(($el) => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${assetStatus[1].value}']`)
            .click()
            .then(() => {
              cy.wait(500);
              cy.get("body").click();
              cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `${assetStatus[1].value}`);
            });
        });
    });
    it("Select multiple Model items", () => {
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="clear"]')
        .click();
      if (apiTypes.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select-multi[data-test='model-select']")
          .click()
          .then(($el) => {
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all'`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${apiTypes.response.body[0].typeId}'`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${apiTypes.response.body[1].typeId}'`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${apiTypes.response.body[2].typeId}'`).click();
            cy.wait(500);
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${apiTypes.response.body[0].typeId}'`).click();
            cy.wait(500);
            cy.get("body")
              .click()
              .then(() => {
                cy.wait(500);
                cy.wrap($el).should(
                  "have.attr",
                  "ng-reflect-selected-item",
                  `${apiTypes.response.body[1].typeId},${apiTypes.response.body[2].typeId}`,
                );
              });
          });
      }
    });
    it("Select a single Model item", () => {
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="clear"]')
        .click();
      if (apiTypes.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select-multi[data-test='model-select']")
          .click()
          .then(($el) => {
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${apiTypes.response.body[1].typeId}'`)
              .click()
              .then(() => {
                cy.wait(500);
                cy.get("body").click();
                cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `${apiTypes.response.body[1].typeId}`);
              });
          });
      }
    });
    it("Select a single Region item", () => {
      if (apiRegions.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='region-select']")
          .click()
          .then(($el) => {
            cy.get(
              `.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${apiRegions.response.body[1].regionId}'`,
            ).click();
            cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `${apiRegions.response.body[1].regionId}`);
          });
      }
    });
    it("Change Organization item to blank", () => {
      if (apiCustomers.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='organization-select']")
          .click()
          .then(($el) => {
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(0)`)
              .click()
              .then(() => {
                cy.wait(500);
                expect(Cypress.$($el).attr("ng-reflect-selected-item")).to.be.eq(undefined);
                cy.get("bridge-asset-filter")
                  .find("bridge-select[data-test='location-select']")
                  .should("have.attr", "ng-reflect-selected-item", ``);
                cy.get("bridge-asset-filter")
                  .find("bridge-select[data-test='location-select']")
                  .should("have.attr", "ng-reflect-location-disabled", `true`);
              });
          });
      }
    });
    it("Change Organization item to none-blank", () => {
      if (apiCustomers.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='organization-select']")
          .click()
          .then(($el) => {
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
              .click()
              .then(() => {
                cy.wait(500);
                cy.get("bridge-asset-filter")
                  .find("bridge-select[data-test='organization-select'] mat-select")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", apiCustomers.response.body[1].customerId);
                cy.get("bridge-asset-filter")
                  .find("bridge-select[data-test='location-select']")
                  .should("have.attr", "ng-reflect-location-disabled", `false`);
                const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", apiCustomers.response.body[1].customerId);
                cy.request(`${apiLocations}`).then((res) => {
                  cy.get("bridge-asset-filter")
                    .find("bridge-select[data-test='location-select']")
                    .click()
                    .then(() => {
                      cy.wait(500);
                      cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
                        cy.wrap($el).should("have.length", res.body.length + 1);
                        // check show string
                        cy.wrap($el)
                          .each(($otp, index) => {
                            if (index === 0) {
                              expect($otp.text().trim()).to.be.eq("Select location");
                            } else {
                              expect($otp.text().trim()).to.be.eq(res.body[index - 1].locationId);
                            }
                          })
                          .then(() => cy.get("body").click());
                      });
                    });
                });
              });
          });
      }
    });
    it("Select a single Location item", () => {
      if (apiCustomers.response.body.length > 0) {
        cy.wait(500);
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='organization-select']")
          .click()
          .then(($el) => {
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(2)`)
              .click()
              .then(() => {
                cy.get("bridge-asset-filter")
                  .find("bridge-select[data-test='organization-select'] mat-select")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", apiCustomers.response.body[1].customerId);
                cy.get("bridge-asset-filter")
                  .find("bridge-select[data-test='location-select']")
                  .should("have.attr", "ng-reflect-location-disabled", `false`);
                const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", apiCustomers.response.body[1].customerId);
                cy.request(apiLocations).then((res) => {
                  cy.get("bridge-asset-filter")
                    .find("bridge-select[data-test='location-select']")
                    .click()
                    .then(($el) => {
                      cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(() => {
                        cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(1)`)
                          .click()
                          .then(() => {
                            cy.wrap($el)
                              .invoke("text")
                              .should("to.be.eq", res.body[0].locationId);
                          });
                      });
                    });
                });
              });
          });
      }
    });
    it("When clicked the OK button, there were 0 results", () => {
      keyword = "no-item 0001 acb ##887";
      cy.get("bridge-asset-filter")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .type(keyword)
        .then(() => {
          cy.get("bridge-asset-filter")
            .find('bridge-button[data-test="ok"]')
            .click();
          cy.request(`${apiAvailabilityURL}?text=${keyword}`).then((res) => {
            // Availability の Good 、 Error 、 Missing の 件 数 チ ェ ッ ク
            const { body } = res;

            body.forEach((element, index) => {
              cy.get(
                `bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test="availability-content-list"] li:eq(${index}) .item-title`,
              ).should("have.text", element.title);
              cy.get(
                `bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test="availability-content-list"] li:eq(${index}) .item-value`,
              ).should("have.text", element.value);
            });
          });
          cy.request(`${apiAssetsMapURL}?text=${keyword}`).then((res) => {
            const { body } = res;
            expect(body.length).to.be.eq(0);
          });
        });
    });
    it("When clicked the OK button, there were more than 1 results", () => {
      keyword = "a";
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="clear"]')
        .click();
      cy.wait(500);
      cy.get("bridge-asset-filter")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .type(keyword)
        .then(() => {
          cy.get("bridge-asset-filter")
            .find('bridge-button[data-test="ok"]')
            .click();
          cy.request(`${apiAvailabilityURL}?text=${keyword}`).then((res) => {
            // Availability の Good 、 Error 、 Missing の 件 数 チ ェ ッ ク
            const { body } = res;
            body.forEach((element, index) => {
              cy.get(
                `bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test="availability-content-list"] li:eq(${index}) .item-title`,
              ).should("have.text", element.title);
              cy.get(
                `bridge-dashboard-page bridge-dashboard-template bridge-dashboard-panel bridge-card [data-test="availability-content-list"] li:eq(${index}) .item-value`,
              ).should("have.text", element.value);
            });
          });
          cy.request(`${apiAssetsMapURL}?text=${keyword}`).then(({ body }) => {
            const maps = body;
            cy.wait(1000);
            maps.map((map) => {
              cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}']`)
                .its("length")
                .should("eq", 1);
              cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should("have.css", "width", "30px");
              cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should("have.css", "height", "48px");
            });
          });
        });
    });
    it("Click the Clear button", () => {
      // set/check value key Keyword
      keyword = "GATEWAY";
      cy.get("bridge-asset-filter")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .type(keyword);
      // set/check asset status

      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select'] mat-select")
        .click()
        .then(() => {
          cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${assetStatus[0].value}']`)
            .click()
            .then(() => {
              cy.wait(500);
              cy.get("body").click();
            });
        });

      // set/check asset Model

      cy.request(`${apiTypesURL}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-asset-filter")
            .find("bridge-select-multi[data-test='model-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}']`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
        }
      });

      // set/check asset Region

      cy.request(`${apiRegionsURL}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-asset-filter")
            .find("bridge-select[data-test='region-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].regionId}']`).click();
            });
        }
      });

      // set/check asset Organization and Enable Location

      cy.request(`${apiCustomersURL}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-asset-filter")
            .find("bridge-select[data-test='organization-select'] mat-select")
            .click()
            .then(() => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option`)
                .contains(res.body[1].customerId)
                .click()
                .then(() => {
                  cy.get("bridge-asset-filter")
                    .find("bridge-select[data-test='organization-select'] mat-select[ng-reflect-value]")
                    .contains(res.body[1].customerId);
                  const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", res.body[1].customerId);
                  cy.request(`${apiLocations}`).then((locations) => {
                    cy.get("bridge-asset-filter")
                      .find("bridge-select[data-test='location-select']")
                      .should("have.attr", "ng-reflect-location-disabled", "false");
                    cy.get("bridge-asset-filter")
                      .find("bridge-select[data-test='location-select'] mat-select")
                      .click()
                      .then(() => {
                        cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(() => {
                          cy.get(`.cdk-overlay-container .mat-select-panel mat-option:eq(1)`).click();
                        });
                      });
                  });
                });
            });
        }
      });

      // init clear filter
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="clear"]')
        .click();
      // check input hab been clear
      cy.get("bridge-asset-filter")
        .find("bridge-search-box-without-button[data-test='search-box'] bridge-form input")
        .should("have.value", "");
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='model-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='region-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='organization-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='location-select'] mat-select")
        .should("have.attr", "ng-reflect-value", "");

      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='location-select']")
        .should("have.attr", "ng-reflect-selected-item", ``);
      cy.get("bridge-asset-filter")
        .find("bridge-select[data-test='location-select']")
        .should("have.attr", "ng-reflect-location-disabled", `true`);
    });
  });
  context("Map pin operations", () => {
    before(() => {
      visitDataUrl(dashboard).then((api) => {
        const [v1, v2, v3, v4, v5, v6] = api;
        apiAvailability = v1.response;
        apiAssetsMap = v2.response;
        apiAssets = v3.response;
        apiCustomers = v4.response;
        apiTypes = v5.response;
        apiRegions = v6.response;
      });
    });
    it("Click the pin", () => {
      if (apiAssetsMap.body.length > 0) {
        cy.get(`bridge-maps google-map .map-container div[title='${apiAssetsMap.body[0].title}']`)
          .trigger("click")
          .then(() => {
            cy.wait(500);
            cy.get("mat-card-content .asset-list-group").should("have.class", "open");
            cy.get(`mat-card-content bridge-maps google-map div[title='${apiAssetsMap.body[0].title}'] img`).should(
              "have.css",
              "width",
              "40px",
            );
            cy.get(`mat-card-content bridge-maps google-map div[title='${apiAssetsMap.body[0].title}'] img`).should(
              "have.css",
              "height",
              "64px",
            );
            const keysAsset = ["status", "assetId", "typeId", "organization"];
            cy.get("bridge-maps-board bridge-card mat-card-content .asset-list-group").should("have.class", "open");
            cy.wait(500);
            const assets = apiAssetsMap.body[0].assets;
            cy.get(".asset-list-group bridge-table table tbody tr")
              .its("length")
              .should("eq", assets.length);
            cy.get(".asset-list-group bridge-table table tbody tr").each(($el, $index) => {
              cy.wrap($el)
                .find(`td.tableCell-status`)
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", assets[$index].status);
              cy.wrap($el)
                .find(`td.tableCell-serial`)
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", assets[$index].assetId);
              cy.wrap($el)
                .find(`td.tableCell-model`)
                .invoke("text")
                .then((t) => t.trim())
                .should("eq", assets[$index].typeId);
            });
            // cy.get(".asset-list-group bridge-table table tbody tr").then(($el) => {

            //   $el.each(($tr, $index) => {
            //     keysAsset.forEach(($item) => {
            //       if ($item !== "status") {
            //         cy.wrap($tr)
            //           .find(`td.tableCell-${$item}`)
            //           .invoke("text")
            //           .then((t) => t.trim())
            //           .should("eq", assets[$index][$item]);
            //       }
            //     });
            //   });
            // });
          });
      }
    });
  });
  context("Asset list operations", () => {
    it("Click the x button", () => {
      cy.get("mat-card-content .asset-list-group").should("have.class", "open");
      cy.get("mat-card-content .asset-list-group.open .closeButton")
        .click()
        .then(() => {
          cy.get("mat-card-content .asset-list-group").should("not.have.class", "open");
          const maps = apiAssetsMap.body;
          cy.wait(1000);
          maps.map((map) => {
            cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}']`)
              .its("length")
              .should("eq", 1);
            cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should("have.css", "width", "30px");
            cy.get(`mat-card-content bridge-maps google-map div[title='${map.title}'] img`).should("have.css", "height", "48px");
          });
        });
    });
  });
});
