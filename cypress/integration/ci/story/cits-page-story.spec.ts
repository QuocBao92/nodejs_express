describe("Story-CITs", () => {
  interface CIT {
    status?: string;
    id: string;
    name: string;
    cashCenters?: number | string;
    country: string;
    isEditable: boolean;
    isDeletable: boolean;
    totalLocationCount: number | string | null;
  }

  const citEndpoints = Cypress.env("citEndpoints");

  let cits: CIT[] = [];

  const createNewCit = () => {
    const generalFormInputIds = {
      name: "[name=name]",
      country: "[name=country]",
    };

    // Go to Create page
    cy.server()
      .route("GET", Cypress.env("host") + citEndpoints.apiGetCIT)
      .as("apiGetCIT");

    cy.visit(citEndpoints.pageCreateCIT).wait("@apiGetCIT");

    cy.get(".form-group").within(() => {
      cy.get("[data-test=input-form]").find(generalFormInputIds.name).type("New CIT", { delay: 0 });
      cy.get("[data-test=input-form]").find(generalFormInputIds.country).type("Some country", { delay: 0 });
    });

    cy.server()
      .route("POST", Cypress.env("host") + citEndpoints.apiCITSave)
      .as("apiCITSavePost");

    // click save button and request POST
    cy.get(".page-content").within(() => {
      cy.get("imo-button > button").contains("Save").click();
    });
    cy.wait("@apiCITSavePost");

    cy.server()
      .route("GET", Cypress.env("host") + citEndpoints.apiGetCIT)
      .as("apiGetCIT");

    cy.visit(citEndpoints.pageCITs);
  };

  context("list of cits page", () => {
    before(() => {
      cy.server()
        .route("GET", Cypress.env("host") + citEndpoints.apiViewCITs)
        .as("apiViewCITs");
      cy.visit(citEndpoints.pageCITs)
        // .then(() => {
        //   cy.get("body").find("imo-loading .spinner").should("be.visible");
        // })
        .wait("@apiViewCITs")
        .then(({ responseBody }) => {
          const res = responseBody;
          if (Array.isArray(res)) {
            cits = res;
          }
          // cy.get("body").find("imo-loading .spinner").should("not.be.visible");
        });
    });

    context("initial display", () => {
      it("page title should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title").should("be.visible").contains("CIT");
        });
      });

      it("cits table header should be displayed", () => {
        const listHeaders = ["Status", "Name", "Cash Centers", "Country", "Locations", "Actions"];

        cy.get("[data-test=cits-table] table")
          .should("be.visible")
          .within(() => {
            cy.get("th").each(($th, i) => {
              expect($th).to.contain(listHeaders[i]);
            });
          });
      });

      it("cits table should displayed all data", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-table tbody").within(() => {
            cy.get("tr").each(($tr, index) => {
              cy.wrap($tr)
                .find("td:nth-child(1)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(cits[index].status);
                });

              cy.wrap($tr)
                .find("td:nth-child(2)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(cits[index].name);
                });

              cy.wrap($tr)
                .find("td:nth-child(3)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq("");
                });

              cy.wrap($tr)
                .find("td:nth-child(4)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(cits[index].country);
                });

              cy.wrap($tr)
                .find("td:nth-child(5)")
                .within(($td) => {
                  const totalLocationCount = cits[index].totalLocationCount;
                  // If totalLocationCount = 0, should display blank
                  if (!totalLocationCount) {
                    expect($td.text().trim()).to.be.eq("");
                  } else {
                    // If totalLocationCount > 999, it should contains ","
                    if (totalLocationCount > 999) {
                      expect($td.text().trim()).to.contain(",");
                    } else {
                      // otherwise it should display normally
                      expect($td.text().trim()).to.contain(totalLocationCount);
                    }
                  }
                });

              cy.wrap($tr)
                .find("td:nth-child(6)")
                .within(($td) => {
                  if (cits[index].isDeletable) {
                    cy.wrap($td).get("imo-button:contains(Delete)").should("be.visible");
                  } else {
                    cy.wrap($td).get("imo-button:contains(Delete)").should("not.be.visible");
                  }

                  if (cits[index].isEditable) {
                    cy.wrap($td).get("imo-button:contains(Edit)").should("be.visible");
                  } else {
                    cy.wrap($td).get("imo-button:contains(Edit)").should("not.be.visible");
                  }
                });
            });
          });
        });
      });

      it("should display Create CIT button", () => {
        cy.get(".page-content").within(() => {
          cy.root().find("a").contains("Create CIT").should("be.visible");
        });
      });

      it("create CIT button should clickable", () => {
        cy.get(".page-content").within(() => {
          cy.root().find("imo-button button").contains("Create CIT").should("not.be.disabled");
        });
      });

      it("should display scrollbar", () => {
        cy.get("body").within(($body) => {
          const el = $body[0];
          expect(el.scrollHeight).to.greaterThan(el.clientHeight);

          cy.get("imo-table tbody tr:last-of-type").scrollIntoView();
        });
      });

      it("cits table should sorted by name from server-side", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-table tbody").within(() => {
            cy.get("tr").each(($tr, index) => {
              cy.wrap($tr)
                .find("td:nth-child(2)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(cits[index].name);
                });
            });
          });
        });
      });
    });

    context("click delete button", () => {
      before(() => {
        createNewCit();
      });

      it("should display Delete Confirmation Dialog and click cancel button", () => {
        const filteredCIT = Cypress._.findIndex(cits, { isDeletable: true });
        cy.get(".page-content").within(() => {
          cy.get("imo-table tbody").within(() => {
            cy.get("tr").each(($tr, index) => {
              if (index === filteredCIT) {
                cy.wrap($tr)
                  .find("td:nth-child(6)")
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
        cy.request("GET", Cypress.env("host") + citEndpoints.apiViewCITs).then((xhr) => {
          const oldCITS = xhr.body as unknown[];
          const filteredCIT = Cypress._.findIndex(oldCITS, { isDeletable: true });

          cy.get(".page-content").within(() => {
            cy.get("imo-table tbody").within(() => {
              cy.get("tr").each(($tr, index) => {
                if (index === filteredCIT) {
                  cy.wrap($tr)
                    .find("td:nth-child(6)")
                    .within(($td) => {
                      cy.wrap($td)
                        .get("imo-button")
                        .contains("Delete")
                        .should("be.visible")
                        .click()
                        .then(() => {
                          cy.server()
                            .route("GET", Cypress.env("host") + citEndpoints.apiViewCITs)
                            .as("apiViewCITs");
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
                      cy.wait("@apiViewCITs").then((viewReponse) => {
                        const newLength = (viewReponse.responseBody as Array<any>).length;
                        expect(newLength).to.be.eq(oldCITS.length - 1);
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

    context("click Create CIT button", () => {
      it("should go to Create CIT page", () => {
        cy.get(".page-content").find("a").contains("Create CIT").click();
        cy.url().should("include", citEndpoints.pageCreateCIT);
      });
    });

    context("click edit button", () => {
      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + citEndpoints.apiViewCITs)
          .as("apiViewCITs");
        cy.visit(citEndpoints.pageCITs)
          .wait("@apiViewCITs")
          .then(({ responseBody }) => {
            const res = responseBody;
            if (Array.isArray(res)) {
              cits = res;
            }
          });
      });
      it("should go to edit cit page", () => {
        const filteredCIT = Cypress._.findIndex(cits, { isEditable: true });
        cy.get(".page-content imo-table tbody").within(() => {
          cy.get("imo-button").contains("Edit").first().click({ force: true });
          cy.url().should("include", citEndpoints.pageEditCIT + `${cits[filteredCIT].id}`);
        });
      });
    });
  });

  context("special cases of cit table", () => {
    before(() => {
      cy.server()
        .route("GET", Cypress.env("host") + citEndpoints.apiViewCITs, `fx:cits/cits-cases`)
        .as("apiViewCITs");
      cy.visit(citEndpoints.pageCITs)
        .wait("@apiViewCITs")
        .then(({ responseBody }) => {
          const res = responseBody;
          if (Array.isArray(res)) {
            cits = res;
          }
        });
    });

    context("initial display", () => {
      it("should display ellipsis when name too long", () => {
        cy.get("imo-table tbody tr:first-of-type td:nth-child(2) > div").within(($div) => {
          const el = $div[0];
          expect(el.scrollWidth).to.greaterThan(el.clientWidth);
        });
      });

      it("should display tooltip with full CIT name", () => {
        cy.get("imo-table tbody tr:first-of-type td:nth-child(2) > div").within(() => {
          cy.root()
            .click({ force: true })
            .wait(500)
            .then(() => {
              cy.root().parents("body").find(".mat-tooltip").should("have.text", cits[0].name);
            });
        });
      });
    });
  });
});
