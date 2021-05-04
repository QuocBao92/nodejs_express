/// <reference types="Cypress" />

let packagesPage = `packages`;
let page = 0;
const generatorDate = (dateString) => {
  const check = Cypress.moment(dateString);
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
const apiPackagesURL = Cypress.env("apiPackages");
const apiPackagesStatusURL = Cypress.env("apiPackagesStatus");
const visitDataUrl = (key) => {
  cy.server()
    .route("GET", `${apiPackagesURL}*`)
    .as("apiPackages")
    .route("POST", `${apiPackagesStatusURL}*`)
    .as("apiPackagesStatus");
  return cy.visit(Cypress.env(key)).wait(["@apiPackages", "@apiPackagesStatus"]);
};
const reduceFirmwares = (object) => {
  switch (true) {
    case !object || !Array.isArray(object):
      return {};
    default:
      return object.reduce((prev, curr) => {
        prev[curr.name] = curr.version;
        return prev;
      }, {});
  }
};
const modifyPackages = (packages) => {
  return packages.map((pkg) => {
    let uploadStatus;
    let validationStatus;
    switch (pkg.status) {
      case "uploading": {
        uploadStatus = "uploading";
        validationStatus = "waiting";
        break;
      }
      case "validating": {
        uploadStatus = "complete";
        validationStatus = "validating";
        break;
      }
      case "complete": {
        uploadStatus = "complete";
        validationStatus = "complete";
        break;
      }
      case "failure": {
        uploadStatus = "failure";
        validationStatus = "waiting";
        break;
      }
      case "invalid": {
        uploadStatus = "complete";
        validationStatus = "failure";
        break;
      }
    }
    const dataReturn = { ...pkg, uploadStatus, validationStatus, elements: reduceFirmwares(pkg.elements) };
    return { ...dataReturn, status: getStatus(dataReturn) };
  });
};
const getStatus = (object) => {
  switch (true) {
    case !object || (!object.uploadStatus && !object.validationStatus):
      return "";
    case object.uploadStatus === "uploading":
      return "uploading";
    case object.validationStatus === "validating":
      return "validating";
    case object.validationStatus === "failure":
    case object.uploadStatus === "failure":
      return "failure";
    case object.uploadStatus === "complete" && object.validationStatus === "complete":
      return "complete";
    default:
      return "";
  }
};
describe("Page-Package-management", () => {
  let packages = [];
  let apiReturn;
  context("Initial display", () => {
    before(() => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
      });
    });
    it("Initial display", () => {
      cy.get("bridge-package-management-page bridge-package-management-template bridge-search-box bridge-form input").should(
        "have.value",
        "",
      );
      cy.wait(500);
      packages.items.forEach((value, index) => {
        cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
          cy.wrap($tr)
            .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", value.status);
          cy.wrap($tr)
            .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", value.name);
          cy.wrap($tr)
            .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", value.summary);
          cy.wrap($tr)
            .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
            .invoke("text")
            .then((t) => t.trim())
            .should("eq", generatorDate(value.date));
          if (value.status === "complete" || value.status === "failure") {
            cy.wrap($tr)
              .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
              .invoke("text")
              .then((t) => t.trim())
              .should("eq", "Delete");
          } else {
            cy.wrap($tr)
              .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
              .should("have.text", "");
          }
          cy.wrap($tr)
            .find(".ng-trigger-bodyExpansion")
            .should("not.visible");
        });
      });
      cy.get(`bridge-package-management-page bridge-package-management-template bridge-package-table mat-accordion mat-expansion-panel`)
        .its("length")
        .should("eq", Math.min(packages.items.length, 10));
      cy.get(
        `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] .description`,
      )
        .invoke("text")
        .then((t) => t.trim())
        .should("eq", `1 to ${Math.min(packages.items.length, 10)} of ${packages.totalCount} items`);
      const numberPage = Math.ceil(packages.totalCount / 10);
      cy.get(
        `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] nav.pagination button`,
      )
        .its("length")
        .should("eq", Math.min(numberPage, 11) + 2);
    });
  });
  context("Register Package", () => {
    it("Click the browse files link button and select the file as specified", () => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
        cy.server()
          .route("POST", `${Cypress.env("apiPackages")}*`)
          .as("apiPackagesPOST")
          .route("GET", `${apiPackagesURL}*`)
          .as("apiPackages")
          .route("POST", `${apiPackagesStatusURL}*`)
          .as("apiPackagesStatus");
        cy.wait(1000);
        cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button:eq(2)`)
          .click()
          .then(() => {
            cy.get("bridge-package-management-page bridge-package-management-template bridge-upload .select")
              .click()
              .then(() => {
                cy.get("bridge-package-management-page bridge-package-management-template bridge-upload input#file-upload[type=file]")
                  .attachFile("packages/files/e2e-firmware.zip")
                  .then(() => {
                    cy.get("bridge-package-management-page bridge-package-management-template bridge-search-box bridge-form input").should(
                      "have.value",
                      "",
                    );
                    cy.wait("@apiPackagesPOST").then((api) => {
                      const packageId = api.response.body.packageId;
                      const completeURL = Cypress.env("apiPackageCompleteRL").replace("${1}", packageId);
                      cy.server()
                        .route("PUT", `${completeURL}*`)
                        .as("completePUT");
                      cy.wait("@completePUT").then((api) => {
                        cy.wait("@apiPackages").then((api) => {
                          packages = {
                            ...api.response.body,
                            items: modifyPackages(api.response.body.items),
                          };
                          packages.items.forEach((value, index) => {
                            cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.status);
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.name);
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.summary);
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", generatorDate(value.date));
                              if (value.status === "complete" || value.status === "failure") {
                                cy.wrap($tr)
                                  .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                                  .invoke("text")
                                  .then((t) => t.trim())
                                  .should("eq", "Delete");
                              } else {
                                cy.wrap($tr)
                                  .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                                  .should("have.text", "");
                              }
                              cy.wrap($tr)
                                .find(".ng-trigger-bodyExpansion")
                                .should("not.visible");
                            });
                          });

                          let page = 1;
                          cy.get(`body bridge-pagination[data-test="package-pagination"] .description`)
                            .invoke("text")
                            .then((t) => t.trim())
                            .should(
                              "equal",
                              `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.items.length * (page + 1))} of ${
                                packages.totalCount
                              } items`,
                            );
                          const numberPage = Math.ceil(packages.totalCount / 10);
                          cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button`)
                            .its("length")
                            .should("eq", Math.min(numberPage, 11) + 2);
                        });
                      });
                    });
                  });
              });
          });
      });
    });
    it("Click the browse files link button and select the file as non-specified", () => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };

        const oldCount = packages.totalCount;
        cy.server()
          .route("POST", `${Cypress.env("apiPackages")}*`)
          .as("apiPackagesPOST")
          .route("GET", `${apiPackagesURL}*`)
          .as("apiPackages")
          .route("POST", `${apiPackagesStatusURL}*`)
          .as("apiPackagesStatus");
        cy.wait(1000);
        cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button:eq(2)`)
          .click()
          .then(() => {
            cy.get("bridge-package-management-page bridge-package-management-template bridge-upload .select")
              .click()
              .then(() => {
                cy.get("bridge-package-management-page bridge-package-management-template bridge-upload input#file-upload[type=file]")
                  .attachFile("packages/files/e2e-firmware-error.zip")
                  .then(() => {
                    cy.get("bridge-package-management-page bridge-package-management-template bridge-search-box bridge-form input").should(
                      "have.value",
                      "",
                    );
                    cy.wait("@apiPackagesPOST").then((api) => {
                      const packageId = api.response.body.packageId;
                      const completeURL = Cypress.env("apiPackageCompleteRL").replace("${1}", packageId);
                      cy.server()
                        .route("PUT", `${completeURL}*`)
                        .as("completePUT");
                      cy.wait("@completePUT").then((api) => {
                        cy.wait("@apiPackages").then((api) => {
                          packages = {
                            ...api.response.body,
                            items: modifyPackages(api.response.body.items),
                          };
                          packages.items.forEach((value, index) => {
                            cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.status);
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.name);
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", value.summary);
                              cy.wrap($tr)
                                .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", generatorDate(value.date));
                              if (value.status === "complete" || value.status === "failure") {
                                cy.wrap($tr)
                                  .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                                  .invoke("text")
                                  .then((t) => t.trim())
                                  .should("eq", "Delete");
                              } else {
                                cy.wrap($tr)
                                  .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                                  .should("have.text", "");
                              }
                              cy.wrap($tr)
                                .find(".ng-trigger-bodyExpansion")
                                .should("not.visible");
                            });
                          });
                          expect(oldCount).to.be.eq(packages.totalCount);
                          let page = 1;
                          cy.get(`body bridge-pagination[data-test="package-pagination"] .description`)
                            .invoke("text")
                            .then((t) => t.trim())
                            .should(
                              "equal",
                              `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.items.length * (page + 1))} of ${
                                packages.totalCount
                              } items`,
                            );
                          const numberPage = Math.ceil(packages.totalCount / 10);
                          cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button`)
                            .its("length")
                            .should("eq", Math.min(numberPage, 11) + 2);
                        });
                      });
                    });
                  });
              });
          });
      });
    });

    it("Drag the specified files into the Drag files space", () => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
        cy.server()
          .route("POST", `${Cypress.env("apiPackages")}*`)
          .as("apiPackagesPOST")
          .route("GET", `${apiPackagesURL}*`)
          .as("apiPackages")
          .route("POST", `${apiPackagesStatusURL}*`)
          .as("apiPackagesStatus");
        cy.wait(1000);
        cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button:eq(2)`)
          .click()
          .then(() => {
            cy.get(`bridge-upload.upload-area .upload-drop-zone`)
              .attachFile("packages/files/e2e-firmware.zip", {
                subjectType: "drag-n-drop",
              })
              .then(() => {
                cy.get("bridge-package-management-page bridge-package-management-template bridge-search-box bridge-form input").should(
                  "have.value",
                  "",
                );
                cy.wait("@apiPackagesPOST").then((api) => {
                  const packageId = api.response.body.packageId;
                  const completeURL = Cypress.env("apiPackageCompleteRL").replace("${1}", packageId);
                  cy.server()
                    .route("PUT", `${completeURL}*`)
                    .as("completePUT");
                  cy.wait("@completePUT").then((api) => {
                    cy.wait("@apiPackages").then((api) => {
                      packages = {
                        ...api.response.body,
                        items: modifyPackages(api.response.body.items),
                      };
                      packages.items.forEach((value, index) => {
                        cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.status);
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.name);
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.summary);
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", generatorDate(value.date));
                          if (value.status === "complete" || value.status === "failure") {
                            cy.wrap($tr)
                              .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                              .invoke("text")
                              .then((t) => t.trim())
                              .should("eq", "Delete");
                          } else {
                            cy.wrap($tr)
                              .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                              .should("have.text", "");
                          }
                          cy.wrap($tr)
                            .find(".ng-trigger-bodyExpansion")
                            .should("not.visible");
                        });
                      });

                      let page = 1;
                      cy.get(`body bridge-pagination[data-test="package-pagination"] .description`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should(
                          "equal",
                          `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.items.length * (page + 1))} of ${
                            packages.totalCount
                          } items`,
                        );
                      const numberPage = Math.ceil(packages.totalCount / 10);
                      cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button`)
                        .its("length")
                        .should("eq", Math.min(numberPage, 11) + 2);
                    });
                  });
                });
              });
          });
      });
    });
    it("Drag the non-specified files into the Drag files space", () => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };

        const oldCount = packages.totalCount;
        cy.server()
          .route("POST", `${Cypress.env("apiPackages")}*`)
          .as("apiPackagesPOST")
          .route("GET", `${apiPackagesURL}*`)
          .as("apiPackages")
          .route("POST", `${apiPackagesStatusURL}*`)
          .as("apiPackagesStatus");
        cy.wait(1000);
        cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button:eq(2)`)
          .click()
          .then(() => {
            cy.get(`bridge-upload.upload-area .upload-drop-zone`)
              .attachFile("packages/files/e2e-firmware-error.zip", {
                subjectType: "drag-n-drop",
              })
              .then(() => {
                cy.get("bridge-package-management-page bridge-package-management-template bridge-search-box bridge-form input").should(
                  "have.value",
                  "",
                );
                cy.wait("@apiPackagesPOST").then((api) => {
                  const packageId = api.response.body.packageId;
                  const completeURL = Cypress.env("apiPackageCompleteRL").replace("${1}", packageId);
                  cy.server()
                    .route("PUT", `${completeURL}*`)
                    .as("completePUT");
                  cy.wait("@completePUT").then((api) => {
                    cy.wait("@apiPackages").then((api) => {
                      packages = {
                        ...api.response.body,
                        items: modifyPackages(api.response.body.items),
                      };
                      packages.items.forEach((value, index) => {
                        cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.status);
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.name);
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", value.summary);
                          cy.wrap($tr)
                            .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                            .invoke("text")
                            .then((t) => t.trim())
                            .should("eq", generatorDate(value.date));
                          if (value.status === "complete" || value.status === "failure") {
                            cy.wrap($tr)
                              .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                              .invoke("text")
                              .then((t) => t.trim())
                              .should("eq", "Delete");
                          } else {
                            cy.wrap($tr)
                              .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                              .should("have.text", "");
                          }
                          cy.wrap($tr)
                            .find(".ng-trigger-bodyExpansion")
                            .should("not.visible");
                        });
                      });
                      expect(oldCount).to.be.eq(packages.totalCount);
                      let page = 1;
                      cy.get(`body bridge-pagination[data-test="package-pagination"] .description`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should(
                          "equal",
                          `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.items.length * (page + 1))} of ${
                            packages.totalCount
                          } items`,
                        );
                      const numberPage = Math.ceil(packages.totalCount / 10);
                      cy.get(`body bridge-pagination[data-test="package-pagination"] nav.pagination button`)
                        .its("length")
                        .should("eq", Math.min(numberPage, 11) + 2);
                    });
                  });
                });
              });
          });
      });
    });
  });
  context("Search operations", () => {
    it("Enter keywords and click the Search button", () => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
      });
      //  Keyword value check (blank)
      cy.get("bridge-package-management-page bridge-package-management-template bridge-search-box bridge-form input")
        .focus()
        .clear()
        .type("a")
        .blur();
      cy.get("bridge-package-management-page bridge-package-management-template bridge-search-box  bridge-button button")
        .click()
        .then(() => {
          cy.request("GET", apiPackagesURL + "?limit=10&offset=0&text=a").then(({ body }) => {
            packages = {
              ...body,
              items: modifyPackages(body.items),
            };
            if (packages.totalCount > 0) {
              packages.items.forEach((value, index) => {
                cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.status);
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.name);
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.summary);
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", generatorDate(value.date));
                  if (value.status === "complete" || value.status === "failure") {
                    cy.wrap($tr)
                      .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", "Delete");
                  } else {
                    cy.wrap($tr)
                      .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                      .should("have.text", "");
                  }
                  cy.wrap($tr)
                    .find(".ng-trigger-bodyExpansion")
                    .should("not.visible");
                });
                cy.get(
                  `bridge-package-management-page bridge-package-management-template bridge-package-table mat-accordion mat-expansion-panel`,
                )
                  .its("length")
                  .should("eq", Math.min(packages.items.length, 10));
                cy.get(
                  `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] .description`,
                )
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", `1 to ${Math.min(packages.items.length, 10)} of ${packages.totalCount} items`);
                const numberPage = Math.ceil(packages.totalCount / 10);
                cy.get(
                  `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] nav.pagination button`,
                )
                  .its("length")
                  .should("eq", Math.min(numberPage, 11) + 2);
              });
            }
          });
        });
    });
  });
  context("Sorting operations", () => {
    const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
    const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";
    const defaultImg = "assets/img/icons/arrows-alt-v-solid.svg";
    const sortsEvent = [
      {
        key: "status",
        name: "Status",
      },
      {
        key: "name",
        name: "Name",
      },
      {
        key: "summary",
        name: "Summary",
      },
      {
        key: "date",
        name: "Date",
      },
    ];
    sortsEvent.forEach(({ key, name }, index) => {
      // Sort the ascending order
      it(`Click ${name} to set the ascending order`, () => {
        cy.wait(1000);
        cy.get(
          `bridge-package-management-page bridge-package-management-template .mat-header-row[data-test="table-header"] .task-rowpackage-header-${key}`,
        )
          .click()
          .then(($el) => {
            // check img sort
            cy.request(`${apiPackagesURL}?limit=10&offset=0&sortName=${key}&sort=asc`).then(({ body }) => {
              cy.wait(500);
              const dataConvert = {
                ...body,
                items: modifyPackages(body.items),
              };
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", upImg);
              cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(0)`).then(($tr) => {
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].status);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].name);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].summary);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", generatorDate(dataConvert.items[0].date));
                if (dataConvert.items[0].status === "complete" || dataConvert.items[0].status === "failure") {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", "Delete");
                } else {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                    .should("have.text", "");
                }
                cy.wrap($tr)
                  .find(".ng-trigger-bodyExpansion")
                  .should("not.visible");
              });
            });
          });
      });
      // Sort the descending order
      it(`Click ${name} to set the descending order`, () => {
        cy.wait(1000);
        cy.get(
          `bridge-package-management-page bridge-package-management-template .mat-header-row[data-test="table-header"] .task-rowpackage-header-${key}`,
        )
          .click({ force: true })
          .then(($el) => {
            // check img sort
            cy.request(`${apiPackagesURL}?limit=10&offset=0&sortName=${key}&sort=desc`).then(({ body }) => {
              cy.wait(500);
              const dataConvert = {
                ...body,
                items: modifyPackages(body.items),
              };
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", downImg);
              cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(0)`).then(($tr) => {
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].status);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].name);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].summary);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", generatorDate(dataConvert.items[0].date));
                if (dataConvert.items[0].status === "complete" || dataConvert.items[0].status === "failure") {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", "Delete");
                } else {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                    .should("have.text", "");
                }
                cy.wrap($tr)
                  .find(".ng-trigger-bodyExpansion")
                  .should("not.visible");
              });
            });
          });
      });
      // Sort the default order
      it(`Click ${name} to set the default order`, () => {
        cy.wait(1000);
        cy.get(
          `bridge-package-management-page bridge-package-management-template .mat-header-row[data-test="table-header"] .task-rowpackage-header-${key}`,
        )
          .click({ force: true })
          .then(($el) => {
            // check img sort
            cy.wait(1000);
            cy.request(`${apiPackagesURL}?limit=10&offset=0`).then(({ body }) => {
              cy.wait(500);
              const dataConvert = {
                ...body,
                items: modifyPackages(body.items),
              };
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .should("include", defaultImg);
              cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(0)`).then(($tr) => {
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].status);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].name);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", dataConvert.items[0].summary);
                cy.wrap($tr)
                  .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", generatorDate(dataConvert.items[0].date));
                if (dataConvert.items[0].status === "complete" || dataConvert.items[0].status === "failure") {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", "Delete");
                } else {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                    .should("have.text", "");
                }
                cy.wrap($tr)
                  .find(".ng-trigger-bodyExpansion")
                  .should("not.visible");
              });
            });
          });
      });
    });
  });
  context("Delete Package", () => {
    beforeEach(() => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
      });
    });
    it("Click the Delete link button", () => {
      cy.get("[data-test=package-table]").should("be.visible");
      cy.get("[data-test=delete-action]:first").click({ force: true });
      cy.wait(500);
      cy.get("bridge-alert bridge-button.cancel button").should("have.text", "Cancel");
      cy.get("bridge-alert bridge-button.confirm button").should("have.text", "Ok");
      cy.get("bridge-alert .description").should("have.text", "Are you sure to delete this package?");
      cy.get("[data-test=package-table] .ng-trigger-bodyExpansion").should("not.have.visible");
    });
    it("Click the OK button in the confirmation dialog", () => {
      cy.server()
        .route("DELETE", `${apiPackagesURL}/*`)
        .as("apiPackagesDelete");
      cy.get("[data-test=package-table]").should("be.visible");
      cy.get("[data-test=delete-action]:first").click({ force: true });
      cy.get("bridge-alert bridge-button.confirm button")
        .click()
        .then(() => {
          cy.wait("@apiPackagesDelete").then(() => {
            cy.request("GET", apiPackagesURL).then(({ body }) => {
              expect(body.totalCount).to.be.eq(packages.totalCount - 1);
              cy.get("[data-test=package-table] .ng-trigger-bodyExpansion").should("not.have.visible");
            });
          });
        });
    });
    it("Click the Cancel button in the confirmation dialog", () => {
      cy.get("[data-test=package-table]").should("be.visible");
      cy.get("[data-test=delete-action]:first").click({ force: true });
      cy.get("bridge-alert bridge-button.cancel button")
        .click()
        .then(() => {
          cy.request("GET", apiPackagesURL).then(({ body }) => {
            expect(body.totalCount).to.be.eq(packages.totalCount);
            cy.get("[data-test=package-table] .ng-trigger-bodyExpansion").should("not.have.visible");
          });
        });
    });
  });
  context("Accordion operations", () => {
    let itemOpen = [];
    before(() => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
      });
    });
    it("Click the Down Arrow expansion button on the accordion of data with a status of Complete", () => {
      for (let i = 0; i < packages.items.length; i++) {
        const packageSelect = packages.items[i];
        const { elements } = packageSelect;

        if (packageSelect.status === "complete" && elements) {
          itemOpen.push(i);
          cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${i}) mat-expansion-panel-header`).then(($el) => {
            cy.wrap($el)
              .click()
              .then(() => {
                cy.wait(500);
                cy.wrap($el)
                  .parent()
                  .find(".ng-trigger-bodyExpansion")
                  .first()
                  .should("be.visible");
                cy.wrap($el)
                  .parent()
                  .find("bridge-package-expansion")
                  .find(".expansion > div > ul.items:eq(0)")
                  .within(() => {
                    cy.root()
                      .find(" > li:eq(0)")
                      .within(() => {
                        cy.root()
                          .find("span")
                          .last()
                          .should("have.text", packageSelect.description);
                      });
                    cy.root()
                      .find(" > li:eq(1)")
                      .within(() => {
                        cy.root()
                          .find("span")
                          .last()
                          .should("have.text", packageSelect.uploadBy);
                      });
                    cy.root()
                      .find(" > li:eq(2)")
                      .within(() => {
                        cy.root()
                          .find("span")
                          .last()
                          .should("have.text", packageSelect.model);
                      });
                    const argKey = ["CV_AP", "CV_COUNTRY", "MAIN_AP", "SPEC_INFO"];
                    cy.root()
                      .find(" > li:eq(4)")
                      .within(() => {
                        cy.root()
                          .find("ul")
                          .within(() => {
                            cy.root()
                              .find("li")
                              .each(($li, index) => {
                                if (elements[argKey[index]]) {
                                  cy.wrap($li)
                                    .find("span")
                                    .first()
                                    .should("have.text", argKey[index] + ":");
                                  cy.wrap($li)
                                    .find("span")
                                    .last()
                                    .should("have.text", elements[argKey[index]]);
                                }
                              });
                          });
                      });
                  });
                cy.wrap($el)
                  .parent()
                  .find("bridge-package-expansion")
                  .find(".expansion > div > ul.items:eq(1)")
                  .within(() => {
                    cy.root()
                      .find("> li:eq(0)")
                      .within(() => {
                        cy.root()
                          .find("> span")
                          .last()
                          .find("span.icon-text")
                          .should("have.text", packageSelect.status);
                      });
                    cy.root()
                      .find("> li:eq(1)")
                      .within(() => {
                        cy.root()
                          .find("> span")
                          .last()
                          .find("span.icon-text")
                          .should("have.text", packageSelect.status);
                      });
                    cy.root()
                      .find("> li:eq(2)")
                      .within(() => {
                        cy.root()
                          .find("bridge-textarea textarea")
                          .should("have.value", packageSelect.memo);
                      });
                  });
              });
          });
          return false;
        }
      }
    });
    it("Click the Down Arrow expansion button on the accordion of data with a status of Failure", () => {
      for (let i = 0; i < packages.items.length; i++) {
        if (packages.items[i].status === "failure") {
          itemOpen.push(i);
          cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${i}) mat-expansion-panel-header`).then(($el) => {
            cy.wrap($el)
              .click()
              .then(() => {
                cy.wait(500);
                cy.wrap($el)
                  .parent()
                  .find(".ng-trigger-bodyExpansion")
                  .first()
                  .should("be.visible");
                const packageSelect = packages.items[i];
                cy.wrap($el)
                  .parent()
                  .find("bridge-package-expansion")
                  .find(".expansion > div > ul.items:eq(0)")
                  .within(() => {
                    cy.root()
                      .find(" > li:eq(0)")
                      .within(() => {
                        cy.root()
                          .find("span")
                          .last()
                          .should("have.text", packageSelect.uploadBy);
                      });

                    cy.root()
                      .find(" > li:eq(1)")
                      .within(() => {
                        cy.root()
                          .find("span.icon-text")
                          .should("have.text", packageSelect.uploadStatus);
                      });
                    cy.root()
                      .find(" > li:eq(2)")
                      .within(() => {
                        cy.root()
                          .find("span.icon-text")
                          .should("have.text", packageSelect.validationStatus);
                      });
                  });
              });
          });
          return false;
        }
      }
    });
    it("Click the Up Arrow expansion button on an accordion", () => {
      itemOpen.forEach((index) => {
        cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index}) mat-expansion-panel-header`).then(($el) => {
          cy.wrap($el).click();
        });
      });
      cy.wait(1000);
      cy.get("bridge-package-table mat-accordion mat-expansion-panel .ng-trigger-bodyExpansion").should("not.be.visible");
    });
  });
  context("Memo operations", () => {
    beforeEach(() => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
      });
    });
    it("Click the Save button", () => {
      for (let i = 0; i < packages.items.length; i++) {
        if (packages.items[i].status === "complete") {
          cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${i}) mat-expansion-panel-header`).then(($el) => {
            cy.wrap($el)
              .click()
              .then(() => {
                cy.wait(500);
                cy.wrap($el)
                  .parent()
                  .find(".ng-trigger-bodyExpansion")
                  .first()
                  .should("be.visible");
                cy.wrap($el)
                  .parent()
                  .find(".ng-trigger-bodyExpansion .memo bridge-textarea textarea")
                  .focus()
                  .then(($memo) => {
                    cy.wrap($memo)
                      .clear()
                      .type("Update memo")
                      .then(() => {
                        cy.wrap(500);
                        cy.wrap($memo)
                          .blur()
                          .then(() => {
                            cy.wrap(500);
                            cy.wrap($memo)
                              .parent()
                              .find(`.button-area bridge-button[data-test="save"] button`)
                              .click()
                              .then(() => {
                                cy.request("PUT", `${apiPackagesURL}/${packages.items[i].packageId}`, { memo: "Update memo" }).then(() => {
                                  cy.request("GET", `${apiPackagesURL}?limit=10&offset=0`).then(({ body }) => {
                                    const dataPost = packages.items.map((package) => ({
                                      packageId: package.packageId,
                                    }));
                                    expect(body.items[i].memo).to.be.eq("Update memo");
                                  });
                                });
                              });
                          });
                      });
                  });
              });
          });
          return false;
        }
      }
    });

    it("Click the Cancel button", () => {
      for (let i = 0; i < packages.items.length; i++) {
        if (packages.items[i].status === "complete") {
          let memoText;
          cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${i}) mat-expansion-panel-header`).then(($el) => {
            cy.wrap($el)
              .click()
              .then(() => {
                cy.wait(500);
                cy.wrap($el)
                  .parent()
                  .find(".ng-trigger-bodyExpansion")
                  .first()
                  .should("be.visible");
                cy.wrap($el)
                  .parent()
                  .find(".ng-trigger-bodyExpansion .memo bridge-textarea textarea")
                  .focus()
                  .then(($memo) => {
                    memoText = $memo.val();
                    cy.wrap($memo)
                      .clear()
                      .type("not Update memo")
                      .then(() => {
                        cy.wrap(500);
                        cy.wrap($memo)
                          .blur()
                          .then(() => {
                            cy.wrap(500);
                            cy.wrap($memo)
                              .parent()
                              .find(`.button-area bridge-button[data-test="cancel"] button`)
                              .click()
                              .then(() => {
                                cy.wrap(500);
                                cy.wrap($memo).should("have.value", memoText);
                              });
                          });
                      });
                  });
              });
          });
          return false;
        }
      }
    });
  });
  context("Paging operations", () => {
    before(() => {
      apiReturn = visitDataUrl(packagesPage).then((api) => {
        const [apiPackages] = api;
        packages = {
          ...apiPackages.response.body,
          items: modifyPackages(apiPackages.response.body.items),
        };
      });
    });
    it("Click the page 2 button", () => {
      cy.get("bridge-package-management-page bridge-pagination nav button:eq(2)")
        .click()
        .then(() => {
          cy.wait(500);
          cy.request(`${apiPackagesURL}?limit=10&offset=10`).then(({ body }) => {
            cy.wait(500);
            packages = {
              ...body,
              items: modifyPackages(body.items),
            };
            if (packages.totalCount > 0) {
              page = 1;
              packages.items.forEach((value, index) => {
                cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.status);
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.name);
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", value.summary);
                  cy.wrap($tr)
                    .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", generatorDate(value.date));
                  if (value.status === "complete" || value.status === "failure") {
                    cy.wrap($tr)
                      .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                      .invoke("text")
                      .then((t) => t.trim())
                      .should("eq", "Delete");
                  } else {
                    cy.wrap($tr)
                      .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                      .should("have.text", "");
                  }
                  cy.wrap($tr)
                    .find(".ng-trigger-bodyExpansion")
                    .should("not.visible");
                });
              });
              cy.get(
                `bridge-package-management-page bridge-package-management-template bridge-package-table mat-accordion mat-expansion-panel`,
              )
                .its("length")
                .should("eq", Math.min(packages.items.length, 10));
              cy.get(
                `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] .description`,
              )
                .invoke("text")
                .then((t) => t.trim())
                .should("equal", `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`);
              const numberPage = Math.ceil(packages.totalCount / 10);
              cy.get(
                `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] nav.pagination button`,
              )
                .its("length")
                .should("eq", Math.min(numberPage, 11) + 2);
            }
          });
        });
    });
    it("Click the > button", () => {
      cy.get("bridge-pagination")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          cy.get("bridge-pagination .pagination button.right-arrow")
            .click()
            .then(() => {
              cy.wait(500);
              page =
                parseInt(
                  Cypress.$("bridge-pagination")
                    .find(".pagination button.selected")
                    .text(),
                ) - 1;
              cy.request(`${apiPackagesURL}?limit=10&offset=${page * 10}`).then(({ body }) => {
                cy.wait(500);
                packages = {
                  ...body,
                  items: modifyPackages(body.items),
                };
                if (packages.totalCount > 0) {
                  packages.items.forEach((value, index) => {
                    cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", value.status);
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", value.name);
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", value.summary);
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", generatorDate(value.date));
                      if (value.status === "complete" || value.status === "failure") {
                        cy.wrap($tr)
                          .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                          .invoke("text")
                          .then((t) => t.trim())
                          .should("eq", "Delete");
                      } else {
                        cy.wrap($tr)
                          .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                          .should("have.text", "");
                      }
                      cy.wrap($tr)
                        .find(".ng-trigger-bodyExpansion")
                        .should("not.visible");
                    });
                  });
                  cy.get(
                    `bridge-package-management-page bridge-package-management-template bridge-package-table mat-accordion mat-expansion-panel`,
                  )
                    .its("length")
                    .should("eq", Math.min(packages.items.length, 10));
                  cy.get(
                    `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] .description`,
                  )
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`);
                  const numberPage = Math.ceil(packages.totalCount / 10);
                  cy.get(
                    `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] nav.pagination button`,
                  )
                    .its("length")
                    .should("eq", Math.min(numberPage, 11) + 2);
                }
              });
            });
        });
    });
    it("Click the < button", () => {
      cy.get("bridge-pagination")
        .find(".pagination button")
        .then((listing) => {
          listingCount = Cypress.$(listing).not(".left-arrow,.right-arrow").length;
          cy.get("bridge-pagination .pagination button.left-arrow")
            .click()
            .then(() => {
              cy.wait(500);
              page =
                parseInt(
                  Cypress.$("bridge-pagination")
                    .find(".pagination button.selected")
                    .text(),
                ) - 1;
              cy.request(`${apiPackagesURL}?limit=10&offset=${page * 10}`).then(({ body }) => {
                cy.wait(500);
                packages = {
                  ...body,
                  items: modifyPackages(body.items),
                };
                if (packages.totalCount > 0) {
                  packages.items.forEach((value, index) => {
                    cy.get(`bridge-package-table mat-accordion mat-expansion-panel:eq(${index})`).then(($tr) => {
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > [data-test='status'] bridge-badge .icon-text")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", value.status);
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > div:eq(0)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", value.name);
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > div:eq(1)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", value.summary);
                      cy.wrap($tr)
                        .find("mat-expansion-panel-header > .mat-content > span:eq(1)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", generatorDate(value.date));
                      if (value.status === "complete" || value.status === "failure") {
                        cy.wrap($tr)
                          .find("mat-expansion-panel-header > .mat-content [data-test='delete-action']")
                          .invoke("text")
                          .then((t) => t.trim())
                          .should("eq", "Delete");
                      } else {
                        cy.wrap($tr)
                          .find("mat-expansion-panel-header > .mat-content > span:eq(2)")
                          .should("have.text", "");
                      }
                      cy.wrap($tr)
                        .find(".ng-trigger-bodyExpansion")
                        .should("not.visible");
                    });
                  });
                  cy.get(
                    `bridge-package-management-page bridge-package-management-template bridge-package-table mat-accordion mat-expansion-panel`,
                  )
                    .its("length")
                    .should("eq", Math.min(packages.items.length, 10));
                  cy.get(
                    `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] .description`,
                  )
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, packages.totalCount)} of ${packages.totalCount} items`);
                  const numberPage = Math.ceil(packages.totalCount / 10);
                  cy.get(
                    `bridge-package-management-page bridge-package-management-template bridge-pagination[data-test="package-pagination"] nav.pagination button`,
                  )
                    .its("length")
                    .should("eq", Math.min(numberPage, 11) + 2);
                }
              });
            });
        });
    });
  });
});
