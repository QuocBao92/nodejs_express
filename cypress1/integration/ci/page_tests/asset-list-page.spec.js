const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
describe("Page - Assets List", () => {
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
  const keysAsset = ["status", "assetId", "alias", "typeId", "organization", "region", "location", "ipAddress", "installationDate"];
  let page = 0,
    keyword,
    numberPage,
    listingCount,
    apiAssets,
    apiTypes,
    apiRegions,
    apiCustomers;
  before(() => {
    apiAssets = Cypress.env("apiAssets");
    apiTypes = Cypress.env("apiTypes");
    apiRegions = Cypress.env("apiRegions");
    apiCustomers = Cypress.env("apiCustomers");
    cy.server()
      .route("GET", `${apiAssets}*`)
      .as("apiAssets")
      .route("GET", `${apiTypes}*`)
      .as("apiTypes")
      .route("GET", `${apiRegions}*`)
      .as("apiRegions")
      .route("GET", `${apiCustomers}*`)
      .as("apiCustomers");
    cy.visit(Cypress.env("assets")).wait(["@apiAssets", "@apiTypes", "@apiRegions", "@apiCustomers"]);
  });

  context("Initial display", () => {
    it("Display with no arguments", () => {
      // check Keyword
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
      cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=0`).then((res) => {
        cy.wait(500);
        cy.get("bridge-table tbody")
          .find("tr")
          .its("length")
          .should("be.eq", Math.min(res.body.items.length, 10));
        // check data map with table asset list
        cy.get("bridge-table tbody tr").each(($el, i) => {
          keysAsset.forEach((value, index) => {
            switch (value) {
              case "status":
                cy.wrap($el)
                  .find(`td:eq(${index}) .badge`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", res.body.items[i][value]);
                break;
              case "installationDate":
                cy.wrap($el)
                  .find(`td:eq(${index})`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", generatorDate(res.body.items[i][value]));
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
        numberPage = Math.ceil(res.body.totalCount / 10) + 2;
        page = 0;
        cy.get("bridge-pagination[data-test='bridge-pagination']")
          .find("nav button")
          .its("length")
          .should("be.eq", numberPage);
        cy.get("bridge-pagination")
          .find("span.description")
          .invoke("text")
          .then((text) => text.trim())
          .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`);

        // on paging init load
        cy.get("bridge-pagination[data-test='bridge-pagination']")
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
                    .then(($el) => {
                      page = parseInt(Cypress.$($el).text()) - 1;
                      cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=10`).then((res) => {
                        cy.get("bridge-table tbody")
                          .find("tr")
                          .its("length")
                          .should("be.eq", Math.min(res.body.items.length, 10));
                        cy.get("bridge-pagination")
                          .find("span.description")
                          .invoke("text")
                          .then((text) => text.trim())
                          .should(
                            "equal",
                            `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                          );
                      });
                    });
                });
            }
          });
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

      cy.request(`${apiTypes}`).then((res) => {
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
      cy.request(`${apiRegions}`).then((res) => {
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
      cy.request(`${apiCustomers}`).then((res) => {
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
                                cy.get(`bridge-header bridge-header-tab bridge-header-tab-item[ng-reflect-text="assets"]`)
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
  });
  context("Search filter operations", () => {
    afterEach(() => {
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="clear"]')
        .click();
    });
    it("Checking items in each list", () => {
      // check show multi select Status
      cy.get("bridge-asset-filter")
        .find("bridge-select-multi[data-test='status-select'] mat-select")
        .click()
        .then(() => {
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
      cy.request(`${apiTypes}`).then((res) => {
        cy.get("bridge-asset-filter")
          .find("bridge-select-multi[data-test='model-select'] mat-select")
          .click()
          .then(() => {
            cy.wait(500);
            // check length show panel chose Model
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", res.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("ALL");
                  } else {
                    expect($otp.text().trim()).to.be.eq(res.body[index - 1].typeId);
                  }
                })
                .then(() => cy.get("body").click());
            });
          });
      });
      // check show multi select Region
      cy.request(`${apiRegions}`).then((res) => {
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='region-select'] mat-select")
          .click()
          .then(() => {
            // check length show panel chose Region
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", res.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("Select region");
                  } else {
                    expect($otp.text().trim()).to.be.eq(res.body[index - 1].regionId);
                  }
                })
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          });
      });
      // check show multi select Organization
      cy.request(`${apiCustomers}`).then((res) => {
        cy.get("bridge-asset-filter")
          .find("bridge-select[data-test='organization-select'] mat-select")
          .click()
          .then(() => {
            // check length show panel chose Region
            cy.get(`.cdk-overlay-container .mat-select-panel mat-option`).then(($el) => {
              cy.wrap($el).should("have.length", res.body.length + 1);
              // check show string
              cy.wrap($el)
                .each(($otp, index) => {
                  if (index === 0) {
                    expect($otp.text().trim()).to.be.eq("Select organization");
                  } else {
                    expect($otp.text().trim()).to.be.eq(res.body[index - 1].customerId);
                  }
                })
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                });
            });
          });
      });
    });
    it("Select multiple Status items", () => {
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
      cy.request(`${apiTypes}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-asset-filter")
            .find("bridge-select-multi[data-test='model-select']")
            .click()
            .then(($el) => {
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all'`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='all`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}'`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[1].typeId}'`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[2].typeId}'`).click();
              cy.wait(500);
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[0].typeId}'`).click();
              cy.wait(500);
              cy.get("body")
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `${res.body[1].typeId},${res.body[2].typeId}`);
                });
            });
        }
      });
    });
    it("Select a single Model item", () => {
      cy.request(`${apiTypes}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-asset-filter")
            .find("bridge-select-multi[data-test='model-select']")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[1].typeId}'`)
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.get("body").click();
                  cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `${res.body[1].typeId}`);
                });
            });
        }
      });
    });
    it("Select a single Region item", () => {
      cy.request(`${apiRegions}`).then((res) => {
        if (res.body.length > 0) {
          cy.get("bridge-asset-filter")
            .find("bridge-select[data-test='region-select']")
            .click()
            .then(($el) => {
              cy.get(`.cdk-overlay-container .mat-select-panel mat-option[ng-reflect-value='${res.body[1].regionId}'`).click();
              cy.wrap($el).should("have.attr", "ng-reflect-selected-item", `${res.body[1].regionId}`);
            });
        }
      });
    });
    it("Change Organization item to blank", () => {
      cy.request(`${apiCustomers}`).then((res) => {
        if (res.body.length > 0) {
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
    });
    it("Change Organization item to none-blank", () => {
      cy.request(`${apiCustomers}`).then((res) => {
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
    });
    it("Select a single Location item", () => {
      cy.request(`${apiCustomers}`).then((res) => {
        if (res.body.length > 0) {
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
                    .should("eq", res.body[1].customerId);
                  cy.get("bridge-asset-filter")
                    .find("bridge-select[data-test='location-select']")
                    .should("have.attr", "ng-reflect-location-disabled", `false`);
                  const apiLocations = Cypress.env("apiLocationsRL").replace("${1}", res.body[1].customerId);
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
          cy.request(`${apiAssets}?text=${keyword}&sort=desc&isFilter=true&limit=10&offset=0`).then((res) => {
            cy.get("bridge-table tbody")
              .find("tr")
              .should("have.length", 0);
            cy.get("bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("equal", `No item`);
          });
        });
    });
    it("When clicked the OK button, there were more than 1 results", () => {
      cy.get("bridge-asset-filter")
        .find('bridge-button[data-test="ok"]')
        .click();
      cy.request(`${apiAssets}?sort=desc&isFilter=true&limit=10&offset=0`).then(({ body }) => {
        // check number recode return
        cy.wait(500);
        cy.get("bridge-table tbody")
          .find("tr")
          .its("length")
          .should("be.eq", Math.min(body.items.length, 10));
        // check data map with table asset list
        cy.get("bridge-table tbody tr").each(($el, i) => {
          keysAsset.forEach((value, index) => {
            switch (value) {
              case "status":
                cy.wrap($el)
                  .find(`td:eq(${index}) .badge`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", body.items[i][value]);
                break;
              case "installationDate":
                cy.wrap($el)
                  .find(`td:eq(${index})`)
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("equal", generatorDate(body.items[i][value]));
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
        cy.get("bridge-pagination[data-test='bridge-pagination']")
          .find("nav button")
          .its("length")
          .should("be.eq", numberPage);
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

      cy.request(`${apiTypes}`).then((res) => {
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

      cy.request(`${apiRegions}`).then((res) => {
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

      cy.request(`${apiCustomers}`).then((res) => {
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
  context("Sorting operations", () => {
    before(() => {
      cy.visit(Cypress.env("assets"));
    });

    const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
    const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";
    const defaultImg = "assets/img/icons/arrows-alt-v-solid.svg";
    const sortsEvent = [
      {
        key: "status",
        name: "Status",
      },
      {
        key: "assetId",
        name: "Serial",
      },
      {
        key: "alias",
        name: "Name",
      },
      {
        key: "typeId",
        name: "Model",
      },
      {
        key: "customerId",
        name: "Organization",
      },
      {
        key: "regionId",
        name: "Region",
      },
      {
        key: "locationId",
        name: "Location",
      },
      {
        key: "ipAddress",
        name: "IP Address",
      },
      {
        key: "installationDate",
        name: "Installation Date",
      },
    ];
    sortsEvent.forEach(({ key, name }) => {
      it(`Click ${name} to set the ascending order`, () => {
        cy.server()
          .route("GET", `${apiAssets}*`)
          .as("apiAssetsFilter");
        cy.wait(1000).then(() => {
          cy.get(`bridge-table thead .${key}`)
            .click()
            .then(($el) => {
              cy.wait("@apiAssetsFilter").then((api) => {
                const response = api.response;
                cy.wrap($el).should("have.class", "sorted-select");
                // check img sort
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", upImg);
                cy.wait(1000);

                keysAsset.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", response.body.items[0][value]);
                      break;
                    case "installationDate":
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", generatorDate(response.body.items[0][value]));
                      break;
                    default:
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", response.body.items[0][value]);
                      break;
                  }
                });
              });
            });
        });
      });
      it(`Click ${name} to set the descending order`, () => {
        cy.server()
          .route("GET", `${apiAssets}*`)
          .as("apiAssetsFilter");
        cy.wait(1000).then(() => {
          cy.get(`bridge-table thead .${key}`)
            .click()
            .then(($el) => {
              cy.wait("@apiAssetsFilter").then((api) => {
                const response = api.response;
                cy.wrap($el).should("have.class", "sorted-select");
                // check img sort
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", downImg);
                keysAsset.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", response.body.items[0][value]);
                      break;
                    case "installationDate":
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", generatorDate(response.body.items[0][value]));
                      break;
                    default:
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", response.body.items[0][value]);
                      break;
                  }
                });
              });
            });
        });
      });
      it(`Click ${name} to set the default order `, () => {
        cy.server()
          .route("GET", `${apiAssets}*`)
          .as("apiAssetsFilter");
        cy.wait(1000).then(() => {
          cy.get(`bridge-table thead .${key}`)
            .click()
            .then(($el) => {
              cy.wait("@apiAssetsFilter").then((api) => {
                const response = api.response;
                cy.wrap($el).should("have.not.class", "sorted-select");
                // check img sort
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", defaultImg);
                keysAsset.forEach((value, index) => {
                  switch (value) {
                    case "status":
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index}) .badge`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", response.body.items[0][value]);
                      break;
                    case "installationDate":
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", generatorDate(response.body.items[0][value]));
                      break;
                    default:
                      cy.get(`bridge-table tbody tr:eq(0)`)
                        .find(`td:eq(${index})`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("equal", response.body.items[0][value]);
                      break;
                  }
                });
              });
            });
        });
      });
    });
  });
  context("Paging operations", () => {
    it("Click the page 2 button", () => {
      cy.get("bridge-pagination[data-test='bridge-pagination']")
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
                  .click();
                page = 1;
                cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
                  cy.wait(500);
                  cy.get("bridge-table tbody")
                    .find("tr")
                    .its("length")
                    .should("be.eq", Math.min(res.body.items.length, 10));
                  cy.get("bridge-table tbody tr").each(($el, i) => {
                    keysAsset.forEach((value, index) => {
                      switch (value) {
                        case "status":
                          cy.wrap($el)
                            .find(`td:eq(${index}) .badge`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", res.body.items[i][value]);
                          break;
                        case "installationDate":
                          cy.wrap($el)
                            .find(`td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", generatorDate(res.body.items[i][value]));
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
                  numberPage = Math.ceil(res.body.totalCount / 10) + 2;
                  page = 1;
                  cy.get("bridge-pagination[data-test='bridge-pagination']")
                    .find("nav button")
                    .its("length")
                    .should("be.eq", Math.min(numberPage, 13));
                  cy.get("bridge-pagination")
                    .find("span.description")
                    .invoke("text")
                    .then((text) => text.trim())
                    .should(
                      "equal",
                      `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                    );
                });
              });
          }
        });
    });
    it("Click the > button", () => {
      cy.get("bridge-pagination[data-test='bridge-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.window()
              .scrollTo("bottom")
              .then(() => {
                cy.get("bridge-pagination[data-test='bridge-pagination'] .pagination button.right-arrow")
                  .click()
                  .then(() => {
                    cy.wait(500);
                    page =
                      parseInt(
                        Cypress.$("bridge-pagination[data-test='bridge-pagination']")
                          .find(".pagination button.selected")
                          .text(),
                      ) - 1;
                    cy.request(`${apiAssets}?sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
                      cy.wait(500);
                      cy.get("bridge-table tbody")
                        .find("tr")
                        .its("length")
                        .should("be.eq", Math.min(res.body.items.length, 10));
                      cy.get("bridge-table tbody tr").each(($el, i) => {
                        keysAsset.forEach((value, index) => {
                          switch (value) {
                            case "status":
                              cy.wrap($el)
                                .find(`td:eq(${index}) .badge`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("equal", res.body.items[i][value]);
                              break;
                            case "installationDate":
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("equal", generatorDate(res.body.items[i][value]));
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
                      numberPage = Math.ceil(res.body.totalCount / 10) + 2;

                      cy.get("bridge-pagination[data-test='bridge-pagination']")
                        .find("nav button")
                        .its("length")
                        .should("be.eq", Math.min(numberPage, 13));
                      cy.get("bridge-pagination")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should(
                          "equal",
                          `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                        );
                    });
                  });
              });
          }
        });
    });
    it("Click the < button", () => {
      cy.get("bridge-pagination[data-test='bridge-pagination']")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          if (listingCount > 1) {
            cy.window()
              .scrollTo("bottom")
              .then(() => {
                cy.get("bridge-pagination[data-test='bridge-pagination'] .pagination button.left-arrow")
                  .click()
                  .then(() => {
                    cy.wait(500);
                    page =
                      parseInt(
                        Cypress.$("bridge-pagination[data-test='bridge-pagination']")
                          .find(".pagination button.selected")
                          .text(),
                      ) - 1;
                    cy.request(`${apiAssets}??sort=desc&isFilter=false&limit=10&offset=${page * 10}`).then((res) => {
                      cy.wait(500);
                      cy.get("bridge-table tbody")
                        .find("tr")
                        .its("length")
                        .should("be.eq", Math.min(res.body.items.length, 10));
                      cy.get("bridge-table tbody tr").each(($el, i) => {
                        keysAsset.forEach((value, index) => {
                          switch (value) {
                            case "status":
                              cy.wrap($el)
                                .find(`td:eq(${index}) .badge`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("equal", res.body.items[i][value]);
                              break;
                            case "installationDate":
                              cy.wrap($el)
                                .find(`td:eq(${index})`)
                                .invoke("text")
                                .then((text) => text.trim())
                                .should("equal", generatorDate(res.body.items[i][value]));
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
                      numberPage = Math.ceil(res.body.totalCount / 10) + 2;
                      cy.get("bridge-pagination[data-test='bridge-pagination']")
                        .find("nav button")
                        .its("length")
                        .should("be.eq", Math.min(numberPage, 13));
                      cy.get("bridge-pagination")
                        .find("span.description")
                        .invoke("text")
                        .then((text) => text.trim())
                        .should(
                          "equal",
                          `${page * 10 + 1} to ${Math.min((page + 1) * 10, res.body.totalCount)} of ${res.body.totalCount} items`,
                        );
                    });
                  });
              });
          }
        });
    });
  });
});
