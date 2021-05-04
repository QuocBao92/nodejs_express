describe("Story - Task Deployment", () => {
  let page = `${Cypress.env("tasks")}`;

  context("Registering Deployment task from the Task List", () => {
    beforeEach(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("apiTasks")
        .route("POST", `${Cypress.env("apiTasksStatus")}*`)
        .as("apiTasksStatus");
      cy.visit(page).wait(["@apiTasks", "@apiTasksStatus"]);
    });
    it("Click the Cancel button in Create New Deployment to go to Task List", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template .matMenu bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(0) > div")
            .click()
            .then(() => {
              cy.wait(500);
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
              cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template bridge-button[data-test='cancel-button']")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks") + "?toTasks=cancel");
                });
            });
        });
    });
    it("Click the Cancel button in Confirmation to go to Task List", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template .matMenu bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(0) > div")
            .click()
            .then(() => {
              cy.wait(500);
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
              cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template form").then(($form) => {
                cy.wrap($form)
                  .find("mat-form-field input[name='deploymentName']")
                  .focus()
                  .then(($el) => {
                    cy.wrap($el)
                      .type("New Deployment")
                      .then(() => {
                        cy.wrap($el).blur();
                      });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='package-modal']")
                  .click()
                  .then(() => {
                    cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
                      cy.wait(500);
                      if (body.items.length > 0) {
                        cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(0)")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                          });
                      }
                    });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='asset-modal']")
                  .click()
                  .then(() => {
                    cy.request(`${Cypress.env("apiAssets")}?isFilter=false&limit=10&offset=0`).then(({ body }) => {
                      cy.wait(500);
                      if (body.items.length > 0) {
                        cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                              .click()
                              .then(() => {
                                cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                              });
                          });
                      }
                    });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='confirm-button']")
                  .click()
                  .then(() => {
                    cy.get(
                      "bridge-deployment-reservation-confirmation-page bridge-deployment-reservation-confirmation-template bridge-button[data-test='cancel-button']",
                    )
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-dialog-container bridge-alert bridge-button.confirm")
                          .click()
                          .then(() => {
                            cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks"));
                          });
                      });
                  });
              });
            });
        });
    });
    it("Click the Back button in Confirmation to go to Create New Deployment", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template .matMenu bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(0) > div")
            .click()
            .then(() => {
              cy.wait(500);
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
              cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template form").then(($form) => {
                cy.wrap($form)
                  .find("mat-form-field input[name='deploymentName']")
                  .focus()
                  .then(($el) => {
                    cy.wrap($el)
                      .type("New Deployment")
                      .then(() => {
                        cy.wrap($el).blur();
                      });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='package-modal']")
                  .click()
                  .then(() => {
                    cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
                      cy.wait(500);
                      if (body.items.length > 0) {
                        cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(0)")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                          });
                      }
                    });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='asset-modal']")
                  .click()
                  .then(() => {
                    cy.request(`${Cypress.env("apiAssets")}?isFilter=false&limit=10&offset=0`).then(({ body }) => {
                      cy.wait(500);
                      if (body.items.length > 0) {
                        cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                              .click()
                              .then(() => {
                                cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                              });
                          });
                      }
                    });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='confirm-button']")
                  .click()
                  .then(() => {
                    cy.get(
                      "bridge-deployment-reservation-confirmation-page bridge-deployment-reservation-confirmation-template bridge-button[data-test='back-button']",
                    )
                      .click()
                      .then(() => {
                        cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
                      });
                  });
              });
            });
        });
    });
    it("Register Task", () => {
      cy.wait(500);
      const taskName = "New Deployment - " + new Date().getTime();
      const task = {
        taskName,
        download: "",
        install: "",
        assets: [],
        package: {},
      };
      cy.get("bridge-task-list-page bridge-task-list-template .matMenu bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(0) > div")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
              cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template form").then(($form) => {
                cy.wrap($form)
                  .find("mat-form-field input[name='deploymentName']")
                  .focus()
                  .then(($el) => {
                    cy.wrap($el)
                      .type(task.taskName)
                      .then(() => {
                        cy.wrap($el).blur();
                      });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='package-modal']")
                  .click()
                  .then(() => {
                    cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
                      cy.wait(500);
                      if (body.items.length > 0) {
                        cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(0)")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                            task.package = body.items[0];
                          });
                      }
                    });
                  });
                cy.wrap($form)
                  .find("bridge-button[data-test='asset-modal']")
                  .click()
                  .then(() => {
                    cy.request(`${Cypress.env("apiAssets")}?isFilter=false&limit=10&offset=0`).then(({ body }) => {
                      cy.wait(500);
                      if (body.items.length > 0) {
                        cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0)")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(0) td:eq(0) mat-checkbox")
                              .click()
                              .then(() => {
                                cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                                task.assets = [body.items[0]];
                              });
                          });
                      }
                    });
                  });

                cy.wrap($form)
                  .find(".download-setting bridge-radio-group bridge-radio:eq(1)")
                  .click()
                  .then(() => {
                    cy.wrap($form)
                      .find(".download-setting bridge-date-picker bridge-button button")
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                          .click()
                          .then(() => {
                            cy.wrap($form)
                              .find(".download-setting bridge-time-picker bridge-button button")
                              .click()
                              .then(() => {
                                cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                                  .scrollTo("bottom")
                                  .then(() => {
                                    cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                                      cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 2})`)
                                        .click()
                                        .then(() => {
                                          task.download = Cypress.$(".download-setting bridge-time-picker").attr("ng-reflect-default");
                                        });
                                    });
                                  });
                              });
                          });
                      });
                  });
                cy.wrap($form)
                  .find(".install-setting .install-setting-group bridge-radio:eq(1)")
                  .click()
                  .then(() => {
                    cy.wrap($form)
                      .find(".install-setting .install-setting-group bridge-date-picker bridge-button button")
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                          .click()
                          .then(() => {
                            cy.wrap($form)
                              .find(".install-setting .install-setting-group bridge-time-picker bridge-button button")
                              .click()
                              .then(() => {
                                cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                                  .scrollTo("bottom")
                                  .then(() => {
                                    cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                                      cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 1})`)
                                        .click()
                                        .then(() => {
                                          task.install = Cypress.$(".install-setting .install-setting-group bridge-time-picker").attr(
                                            "ng-reflect-default",
                                          );
                                        });
                                    });
                                  });
                              });
                          });
                      });
                  });

                cy.wrap($form)
                  .find("bridge-button[data-test='confirm-button']")
                  .click()
                  .then(() => {
                    cy.get(
                      "bridge-deployment-reservation-confirmation-page bridge-deployment-reservation-confirmation-template bridge-button[data-test='ok-button']",
                    )
                      .click()
                      .then(() => {
                        cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks") + "?page=1");
                        cy.request(`${Cypress.env("apiTasks")}?limit=10&offset=0`).then(({ body }) => {
                          cy.wait(500);
                          cy.get(
                            "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header [data-test='status'] .icon-text",
                          )
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("eq", body.items[0].status);
                          cy.get(
                            "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header div[data-test='name']",
                          )
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("eq", task.taskName);

                          cy.get(
                            "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header span[data-test='task-type']",
                          ).contains(new RegExp("DownloadPackage|Install", "g"));

                          cy.get(
                            "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header [data-test='status'] .icon-text",
                          )
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("eq", body.items[1].status);
                          cy.get(
                            "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header div[data-test='name']",
                          )
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("eq", task.taskName);
                          cy.get(
                            "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header span[data-test='task-type']",
                          ).contains(new RegExp("DownloadPackage|Install", "g"));
                        });
                      });
                  });
              });
            });
        });
    });
  });
  context("Registering Deployment task from the Asset Detail", () => {
    beforeEach(() => {
      cy.visit(`${Cypress.env("assetDetailEventHasData")}`);
    });
    it("Click the Cancel button in Create New Deployment to go to Task List", () => {
      cy.wait(500);
      cy.get(
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(2) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
          cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template bridge-button[data-test='cancel-button']")
            .click()
            .then(() => {
              cy.get(".cdk-overlay-container mat-dialog-container bridge-alert bridge-button.confirm")
                .click()
                .then(() => {
                  cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks") + "?toTasks=cancel");
                });
            });
        });
    });
    it("Click the Cancel button in Confirmation to go to Task List", () => {
      cy.wait(500);
      cy.get(
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(2) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
          cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template form").then(($form) => {
            cy.wrap($form)
              .find("mat-form-field input[name='deploymentName']")
              .focus()
              .then(($el) => {
                cy.wrap($el)
                  .type("New Deployment")
                  .then(() => {
                    cy.wrap($el).blur();
                  });
              });
            cy.wrap($form)
              .find("bridge-button[data-test='package-modal']")
              .click()
              .then(() => {
                cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
                  cy.wait(500);
                  if (body.items.length > 0) {
                    cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(0)")
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                      });
                  }
                });
              });
            cy.wrap($form)
              .find("bridge-button[data-test='confirm-button']")
              .click()
              .then(() => {
                cy.get(
                  "bridge-deployment-reservation-confirmation-page bridge-deployment-reservation-confirmation-template bridge-button[data-test='cancel-button']",
                )
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-dialog-container bridge-alert bridge-button.confirm")
                      .click()
                      .then(() => {
                        cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks"));
                      });
                  });
              });
          });
        });
    });
    it("Click the Back button in Confirmation to go to Create New Deployment", () => {
      cy.get(
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(2) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
          cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template form").then(($form) => {
            cy.wrap($form)
              .find("mat-form-field input[name='deploymentName']")
              .focus()
              .then(($el) => {
                cy.wrap($el)
                  .type("New Deployment")
                  .then(() => {
                    cy.wrap($el).blur();
                  });
              });
            cy.wrap($form)
              .find("bridge-button[data-test='package-modal']")
              .click()
              .then(() => {
                cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
                  cy.wait(500);
                  if (body.items.length > 0) {
                    cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(0)")
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                      });
                  }
                });
              });

            cy.wrap($form)
              .find("bridge-button[data-test='confirm-button']")
              .click()
              .then(() => {
                cy.get(
                  "bridge-deployment-reservation-confirmation-page bridge-deployment-reservation-confirmation-template bridge-button[data-test='back-button']",
                )
                  .click()
                  .then(() => {
                    cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
                  });
              });
          });
        });
    });
    it("Register Task", () => {
      const taskName = "New Deployment - " + new Date().getTime();
      const task = {
        taskName,
        download: "",
        install: "",
        assets: [],
        package: {},
      };
      cy.wait(500);
      cy.get(
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(2) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("deploymentsNew"));
          cy.get("bridge-deployment-reservation-page bridge-deployment-reservation-template form").then(($form) => {
            cy.wrap($form)
              .find("mat-form-field input[name='deploymentName']")
              .focus()
              .then(($el) => {
                cy.wrap($el)
                  .type(task.taskName)
                  .then(() => {
                    cy.wrap($el).blur();
                  });
              });
            cy.wait(500);
            cy.wrap($form)
              .find("bridge-button[data-test='package-modal']")
              .click()
              .then(() => {
                cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
                  cy.wait(500);
                  if (body.items.length > 0) {
                    cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(0)")
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                        task.package = body.items[0];
                      });
                  }
                });
              });
            cy.wait(500);
            cy.wrap($form)
              .find(".download-setting bridge-radio-group bridge-radio:eq(1)")
              .click()
              .then(() => {
                cy.wrap($form)
                  .find(".download-setting bridge-date-picker bridge-button button")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                      .click()
                      .then(() => {
                        cy.wrap($form)
                          .find(".download-setting bridge-time-picker bridge-button button")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                              .scrollTo("bottom")
                              .then(() => {
                                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                                  cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 2})`)
                                    .click()
                                    .then(() => {
                                      task.download = Cypress.$(".download-setting bridge-time-picker").attr("ng-reflect-default");
                                    });
                                });
                              });
                          });
                      });
                  });
              });
            cy.wait(500);
            cy.wrap($form)
              .find(".install-setting .install-setting-group bridge-radio:eq(1)")
              .click()
              .then(() => {
                cy.wrap($form)
                  .find(".install-setting .install-setting-group bridge-date-picker bridge-button button")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                      .click()
                      .then(() => {
                        cy.wrap($form)
                          .find(".install-setting .install-setting-group bridge-time-picker bridge-button button")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                              .scrollTo("bottom")
                              .then(() => {
                                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                                  cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 1})`)
                                    .click()
                                    .then(() => {
                                      task.install = Cypress.$(".install-setting .install-setting-group bridge-time-picker").attr(
                                        "ng-reflect-default",
                                      );
                                    });
                                });
                              });
                          });
                      });
                  });
              });
            cy.wait(500);
            cy.wrap($form)
              .find("bridge-button[data-test='confirm-button']")
              .click()
              .then(() => {
                cy.get(
                  "bridge-deployment-reservation-confirmation-page bridge-deployment-reservation-confirmation-template bridge-button[data-test='ok-button']",
                )
                  .click()
                  .then(() => {
                    cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks") + "?page=1");
                    cy.request(`${Cypress.env("apiTasks")}?limit=10&offset=0`).then(({ body }) => {
                      cy.wait(500);
                      cy.get(
                        "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header [data-test='status'] .icon-text",
                      )
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", body.items[0].status);
                      cy.get(
                        "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header div[data-test='name']",
                      )
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", task.taskName);

                      cy.get(
                        "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header span[data-test='task-type']",
                      ).contains(new RegExp("DownloadPackage|Install", "g"));

                      cy.get(
                        "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header [data-test='status'] .icon-text",
                      )
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", body.items[1].status);
                      cy.get(
                        "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header div[data-test='name']",
                      )
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", task.taskName);
                      cy.get(
                        "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header span[data-test='task-type']",
                      ).contains(new RegExp("DownloadPackage|Install", "g"));
                    });
                  });
              });
          });
        });
    });
  });
  context("Editing Deployment task", () => {
    beforeEach(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("apiTasks")
        .route("POST", `${Cypress.env("apiTasksStatus")}*`)
        .as("apiTasksStatus");
      cy.visit(page).wait(["@apiTasks", "@apiTasksStatus"]);
    });
    it("Click the Cancel button in Edit Deployment to go to Task List", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template").then(($el) => {
        cy.wrap($el)
          .find("bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header")
          .then(($panel) => {
            cy.wrap($panel)
              .find(".edit[data-test='edit-action']")
              .click()
              .then(() => {
                cy.location("href").then((url) => {
                  const arrayLink = url.split("/");
                  const taskId = arrayLink[arrayLink.length - 1];
                  const urlEdit = Cypress.env("apiTasksDeploymentsIdRL").replace("${1}", taskId);
                  cy.request(urlEdit).then(({ body }) => {
                    cy.wait(500);
                    cy.get(
                      "bridge-deployment-reservation-edit-page bridge-deployment-reservation-edit-template bridge-button[data-test='cancel-button']",
                    )
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-dialog-container bridge-alert bridge-button.confirm")
                          .click()
                          .then(() => {
                            cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks") + "?toTasks=cancel");
                          });
                      });
                  });
                });
              });
          });
      });
    });

    it("Click the Cancel button in Confirmation to go to Task List", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template").then(($el) => {
        cy.wrap($el)
          .find("bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header")
          .then(($panel) => {
            cy.wrap($panel)
              .find(".edit[data-test='edit-action']")
              .click()
              .then(() => {
                cy.location("href").then((url) => {
                  const arrayLink = url.split("/");
                  const taskId = arrayLink[arrayLink.length - 1];
                  const urlEdit = Cypress.env("apiTasksDeploymentsIdRL").replace("${1}", taskId);
                  cy.request(urlEdit).then(({ body }) => {
                    cy.wait(500);
                    cy.get("bridge-button[data-test='confirm-button']")
                      .click()
                      .then(() => {
                        cy.wait(500);
                        cy.get("bridge-button[data-test='cancel-button']")
                          .click()
                          .then(() => {
                            cy.wait(500);
                            cy.get(".cdk-overlay-container mat-dialog-container bridge-alert bridge-button.confirm")
                              .click()
                              .then(() => {
                                cy.wait(500);
                                cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks"));
                              });
                          });
                      });
                  });
                });
              });
          });
      });
    });
    it("Click the Back button in Confirmation to go to Edit Deployment", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template").then(($el) => {
        cy.wrap($el)
          .find("bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header")
          .then(($panel) => {
            cy.wrap($panel)
              .find(".edit[data-test='edit-action']")
              .click()
              .then(() => {
                cy.location("href").then((url) => {
                  const arrayLink = url.split("/");
                  const taskId = arrayLink[arrayLink.length - 1];
                  const apiTasksDeploymentsIdRL = Cypress.env("apiTasksDeploymentsIdRL").replace("${1}", taskId);
                  cy.request(apiTasksDeploymentsIdRL).then(({ body }) => {
                    cy.wait(500);
                    cy.get("bridge-button[data-test='confirm-button']")
                      .click()
                      .then(() => {
                        cy.wait(500);
                        cy.get("bridge-button[data-test='back-button']")
                          .click()
                          .then(() => {
                            cy.wait(500);
                            const deploymentsEditRL = Cypress.env("deploymentsEditRL").replace("${1}", body.id);
                            cy.location("href").should("eq", Cypress.config("baseUrl") + deploymentsEditRL);
                          });
                      });
                  });
                });
              });
          });
      });
    });

    it("Edit Task", () => {
      const taskName = "New Deployment - " + new Date().getTime();
      const task = {
        taskName,
        download: "",
        install: "",
        assets: [],
        package: {},
      };
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template").then(($el) => {
        cy.wrap($el)
          .find("bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header")
          .then(($panel) => {
            cy.wrap($panel)
              .find(".edit[data-test='edit-action']")
              .click()
              .then(() => {
                cy.location("href").then((url) => {
                  const arrayLink = url.split("/");
                  const taskId = arrayLink[arrayLink.length - 1];
                  const apiTasksDeploymentsIdRL = Cypress.env("apiTasksDeploymentsIdRL").replace("${1}", taskId);
                  cy.request(apiTasksDeploymentsIdRL).then(({ body }) => {
                    cy.wait(500);
                    cy.get("bridge-deployment-reservation-edit-page bridge-deployment-reservation-edit-template form").then(($form) => {
                      cy.wrap($form)
                        .find("mat-form-field input[name='deploymentName']")
                        .focus()
                        .then(($el) => {
                          cy.wrap($el)
                            .clear()
                            .type(task.taskName)
                            .then(() => {
                              cy.wrap($el).blur();
                            });
                        });
                      cy.wrap($form)
                        .find("bridge-button[data-test='package-modal']")
                        .click()
                        .then(() => {
                          cy.request(`${Cypress.env("apiPackages")}?limit=10&offset=0&status=Complete`).then(({ body }) => {
                            cy.wait(500);
                            if (body.items.length > 0) {
                              cy.get(".cdk-overlay-container bridge-expansion-table mat-radio-button:eq(1)")
                                .click()
                                .then(() => {
                                  cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                                  task.package = body.items[1];
                                });
                            }
                          });
                        });
                      cy.wrap($form)
                        .find("bridge-button[data-test='asset-modal']")
                        .click()
                        .then(() => {
                          cy.request(`${Cypress.env("apiAssets")}?isFilter=false&limit=10&offset=0`).then(({ body }) => {
                            cy.wait(500);
                            if (body.items.length > 0) {
                              cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1)")
                                .click()
                                .then(() => {
                                  cy.get(".cdk-overlay-container bridge-table-board bridge-table tbody tr:eq(1) td:eq(0) mat-checkbox")
                                    .click()
                                    .then(() => {
                                      cy.get(".cdk-overlay-container mat-dialog-container mat-dialog-actions bridge-button:eq(1)").click();
                                      task.assets = [body.items[0], body.items[1]];
                                    });
                                });
                            }
                          });
                        });

                      cy.wrap($form)
                        .find(".download-setting bridge-date-picker bridge-button button")
                        .click()
                        .then(() => {
                          cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                            .click()
                            .then(() => {
                              cy.wrap($form)
                                .find(".download-setting bridge-time-picker bridge-button button")
                                .click()
                                .then(() => {
                                  cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                                    .scrollTo("bottom")
                                    .then(() => {
                                      cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                                        cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 1})`)
                                          .click()
                                          .then(() => {
                                            task.download = Cypress.$(".download-setting bridge-time-picker").attr("ng-reflect-default");
                                          });
                                      });
                                    });
                                });
                            });
                        });

                      cy.wrap($form)
                        .find(".install-setting .install-setting-group bridge-radio:eq(0)")
                        .click();
                      cy.wrap($form)
                        .find("bridge-button[data-test='confirm-button']")
                        .click()
                        .then(() => {
                          cy.get("bridge-button[data-test='ok-button']")
                            .click()
                            .then(() => {
                              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("tasks") + "?page=1");
                              cy.request(`${Cypress.env("apiTasks")}?limit=10&offset=0`).then(({ body }) => {
                                cy.wait(500);
                                cy.get(
                                  "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header [data-test='status'] .icon-text",
                                )
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("eq", body.items[0].status);
                                cy.get(
                                  "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header div[data-test='name']",
                                )
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("eq", task.taskName);

                                cy.get(
                                  "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header span[data-test='task-type']",
                                ).contains(new RegExp("DownloadPackage|Install", "g"));

                                cy.get(
                                  "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header [data-test='status'] .icon-text",
                                )
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("eq", body.items[1].status);
                                cy.get(
                                  "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header div[data-test='name']",
                                )
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("eq", task.taskName);
                                cy.get(
                                  "bridge-task-table mat-accordion > [data-test='task-row']:eq(1) mat-expansion-panel-header span[data-test='task-type']",
                                ).contains(new RegExp("DownloadPackage|Install", "g"));
                              });
                            });
                        });
                    });
                  });
                });
              });
          });
      });
    });
  });
  context("Deleting Deployment task", () => {
    before(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("apiTasks")
        .route("POST", `${Cypress.env("apiTasksStatus")}*`)
        .as("apiTasksStatus");
      cy.visit(page).wait(["@apiTasks", "@apiTasksStatus"]);
    });
    it("Delete Task", () => {
      cy.wait(500);
      cy.server()
        .route("DELETE", `/api/tasks/deployments/*`)
        .as("apiDeleteTasks");
      cy.request(`${Cypress.env("apiTasks")}?limit=10&offset=0`).then(({ body }) => {
        const beforeCount = body.totalCount;
        cy.get("bridge-task-list-page bridge-task-list-template").then(($el) => {
          cy.wrap($el)
            .find("bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header")
            .then(($panel) => {
              cy.wrap($panel)
                .find(".delete[data-test='delete-action']")
                .click({
                  force: true,
                })
                .then(() => {
                  cy.get(".cdk-overlay-container mat-dialog-container bridge-alert bridge-button:eq(1)")
                    .click()
                    .then(($el) => {
                      cy.wait("@apiDeleteTasks");
                      cy.request(`${Cypress.env("apiTasks")}?limit=10&offset=0`).then(({ body }) => {
                        expect(beforeCount - 1).to.be.eq(body.totalCount);
                      });
                    });
                });
            });
        });
      });
    });
  });
  context("Browse Related Task", () => {
    beforeEach(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("apiTasks")
        .route("POST", `${Cypress.env("apiTasksStatus")}*`)
        .as("apiTasksStatus");
      cy.visit(page).wait(["@apiTasks", "@apiTasksStatus"]);
    });
    it("Click the Download Package link button in Task List to go to Related Task", () => {
      cy.request(`${Cypress.env("apiTasks")}?limit=10&offset=0`).then(({ body }) => {
        for (var i = 0; i < body.items.length; ++i) {
          if (
            !!body.items[i].relatedTaskId &&
            body.items[i].taskType === "downloadpackage" &&
            body.items[i].relatedTaskType === "Install"
          ) {
            cy.get("bridge-task-table mat-accordion > [data-test='task-row']:eq(" + i + ")").then(($el) => {
              cy.wrap($el)
                .find("mat-expansion-panel-header")
                .first()
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.wrap($el)
                    .find("bridge-task-expansion button[data-test='relatedTask-modal']")
                    .click()
                    .then(() => {
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-modal mat-dialog-content > ul.items li.item:eq(0)")
                        .find("span:eq(1)")
                        .should("have.text", body.items[i].name);
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-modal mat-dialog-content > ul.items li.item:eq(1)")
                        .find("span:eq(1) bridge-badge .icon-text")
                        .should("have.text", body.items[i].status);
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-modal mat-dialog-content > ul.items li.item:eq(2)")
                        .find("span:eq(1)")
                        .invoke("text")
                        .then((text) => text.toLowerCase())
                        .should("eq", body.items[i].relatedTaskType.toLowerCase());
                    });
                });
            });
            break;
          }
        }
      });
    });
    it("Click the Install link button in Task List to go to Related Task", () => {
      cy.request(`${Cypress.env("apiTasks")}?limit=10&offset=0`).then(({ body }) => {
        for (var i = 0; i < body.items.length; ++i) {
          if (
            !!body.items[i].relatedTaskId &&
            body.items[i].taskType === "install" &&
            body.items[i].relatedTaskType === "DownloadPackage"
          ) {
            cy.get("bridge-task-table mat-accordion > [data-test='task-row']:eq(" + i + ")").then(($el) => {
              cy.wrap($el)
                .find("mat-expansion-panel-header")
                .first()
                .click()
                .then(() => {
                  cy.wait(500);
                  cy.wrap($el)
                    .find("bridge-task-expansion button[data-test='relatedTask-modal']")
                    .click()
                    .then(() => {
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-modal mat-dialog-content > ul.items li.item:eq(0)")
                        .find("span:eq(1)")
                        .should("have.text", body.items[i].name);
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-modal mat-dialog-content > ul.items li.item:eq(1)")
                        .find("span:eq(1) bridge-badge .icon-text")
                        .should("have.text", body.items[i].status);
                      cy.get(".cdk-overlay-container mat-dialog-container bridge-modal mat-dialog-content > ul.items li.item:eq(2)")
                        .find("span:eq(1)")
                        .invoke("text")
                        .then((text) => text.toLowerCase())
                        .should("eq", body.items[i].relatedTaskType.toLowerCase());
                    });
                });
            });
            break;
          }
        }
      });
    });
  });
});
