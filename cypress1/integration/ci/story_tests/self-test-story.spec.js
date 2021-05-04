describe("Story - Task Self test", () => {
  let page = `${Cypress.env("tasks")}`;
  context("Registering Self test task from the Task List", () => {
    beforeEach(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("apiTasks")
        .route("POST", `${Cypress.env("apiTasksStatus")}*`)
        .as("apiTasksStatus");
      cy.visit(page).wait(["@apiTasks", "@apiTasksStatus"]);
    });
    it("Click the Cancel button in Create New Self test to go to Task List", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template .matMenu bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(3) > div")
            .click()
            .then(() => {
              cy.wait(500);
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
              cy.get("bridge-button[data-test='cancel-button']")
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
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(3) > div")
            .click()
            .then(() => {
              cy.wait(500);
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
              cy.get("form").then(($form) => {
                cy.wrap($form)
                  .find("textarea[name='memo']")
                  .focus()
                  .then(($el) => {
                    cy.wrap($el)
                      .type("New Self test")
                      .then(() => {
                        cy.wrap($el).blur();
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
                    cy.get("bridge-button[data-test='cancel-button']")
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
    it("Click the Back button in Confirmation to go to Create New Self test", () => {
      cy.wait(500);
      cy.get("bridge-task-list-page bridge-task-list-template .matMenu bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(3) > div")
            .click()
            .then(() => {
              cy.wait(500);
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
              cy.get("form").then(($form) => {
                cy.wrap($form)
                  .find("textarea[name='memo']")
                  .focus()
                  .then(($el) => {
                    cy.wrap($el)
                      .type("New Self test")
                      .then(() => {
                        cy.wrap($el).blur();
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
                    cy.get("bridge-button[data-test='back-button']")
                      .click()
                      .then(() => {
                        cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
                      });
                  });
              });
            });
        });
    });
    it("Register Task", () => {
      cy.wait(500);
      const taskName = "New Self test - " + new Date().getTime();
      const task = {
        taskName,
        download: "",
        assets: [],
      };
      cy.get("bridge-task-list-page bridge-task-list-template .matMenu bridge-button button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(".cdk-overlay-container .mat-menu-content bridge-dropdown-menu-item:eq(3) > div")
            .click()
            .then(() => {
              cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
              cy.get("form").then(($form) => {
                cy.wrap($form)
                  .find("textarea[name='memo']")
                  .focus()
                  .then(($el) => {
                    cy.wrap($el)
                      .type(task.taskName)
                      .then(() => {
                        cy.wrap($el).blur();
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
                  .find(".task-setting bridge-radio:eq(1)")
                  .click()
                  .then(() => {
                    cy.wrap($form)
                      .find(".task-setting bridge-date-picker bridge-button button")
                      .click()
                      .then(() => {
                        cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                          .click()
                          .then(() => {
                            cy.wrap($form)
                              .find(".task-setting bridge-time-picker bridge-button button")
                              .click()
                              .then(() => {
                                cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                                  .scrollTo("bottom")
                                  .then(() => {
                                    cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                                      cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 2})`)
                                        .click()
                                        .then(() => {
                                          task.download = Cypress.$(".task-setting bridge-time-picker").attr("ng-reflect-default");
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
                            .should("contains", task.taskName);

                          cy.get(
                            "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header span[data-test='task-type']",
                          )
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("eq", "Self test");
                        });
                      });
                  });
              });
            });
        });
    });
  });
  context("Registering Self test task from the Asset Detail", () => {
    beforeEach(() => {
      cy.visit(`${Cypress.env("assetDetailEventHasData")}`);
    });
    it("Click the Cancel button in Create New Self test to go to Task List", () => {
      cy.wait(500);
      cy.get(
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(1) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
          cy.get("bridge-button[data-test='cancel-button']")
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
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(1) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
          cy.get("form").then(($form) => {
            cy.wrap($form)
              .find("textarea[name='memo']")
              .focus()
              .then(($el) => {
                cy.wrap($el)
                  .type("New Self test")
                  .then(() => {
                    cy.wrap($el).blur();
                  });
              });
            cy.wrap($form)
              .find("bridge-button[data-test='confirm-button']")
              .click()
              .then(() => {
                cy.get("bridge-button[data-test='cancel-button']")
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
    it("Click the Back button in Confirmation to go to Create New Self test", () => {
      cy.get(
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(1) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
          cy.get("form").then(($form) => {
            cy.wrap($form)
              .find("textarea[name='memo']")
              .focus()
              .then(($el) => {
                cy.wrap($el)
                  .type("New Self test")
                  .then(() => {
                    cy.wrap($el).blur();
                  });
              });
            cy.wrap($form)
              .find("bridge-button[data-test='confirm-button']")
              .click()
              .then(() => {
                cy.get("bridge-button[data-test='back-button']")
                  .click()
                  .then(() => {
                    cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
                  });
              });
          });
        });
    });
    it("Register Task", () => {
      const taskName = "New Self test - " + new Date().getTime();
      const task = {
        taskName,
        download: "",
        assets: [],
      };
      cy.wait(500);
      cy.get(
        "bridge-asset-detail-page bridge-asset-detail-template bridge-detail-basis-board bridge-card ul.none-list li:eq(1) bridge-button",
      )
        .click()
        .then(() => {
          cy.wait(500);
          cy.location("href").should("eq", Cypress.config("baseUrl") + Cypress.env("selfTestNew"));
          cy.get("form").then(($form) => {
            cy.wrap($form)
              .find("textarea[name='memo']")
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
              .find(".task-setting bridge-radio:eq(1)")
              .click()
              .then(() => {
                cy.wrap($form)
                  .find(".task-setting bridge-date-picker bridge-button button")
                  .click()
                  .then(() => {
                    cy.get(".cdk-overlay-container mat-datepicker-content mat-month-view table tbody tr td.mat-calendar-body-active")
                      .click()
                      .then(() => {
                        cy.wrap($form)
                          .find(".task-setting bridge-time-picker bridge-button button")
                          .click()
                          .then(() => {
                            cy.get(".cdk-overlay-container bridge-time-picker-content .time-picker")
                              .scrollTo("bottom")
                              .then(() => {
                                cy.get(".cdk-overlay-container bridge-time-picker-content mat-option").then(($el) => {
                                  cy.get(`.cdk-overlay-container bridge-time-picker-content mat-option:eq(${$el.length - 2})`)
                                    .click()
                                    .then(() => {
                                      task.download = Cypress.$(".task-setting bridge-time-picker").attr("ng-reflect-default");
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
                        .should("contains", task.taskName);

                      cy.get(
                        "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header span[data-test='task-type']",
                      )
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", "Self test");
                    });
                  });
              });
          });
        });
    });
  });
  context("Editing Self test task", () => {
    beforeEach(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("apiTasks")
        .route("POST", `${Cypress.env("apiTasksStatus")}*`)
        .as("apiTasksStatus");
      cy.visit(page).wait(["@apiTasks", "@apiTasksStatus"]);
    });
    it("Click the Cancel button in Edit Self test to go to Task List", () => {
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
                  const urlEdit = Cypress.env("apiTasksSelfTestsIdRL").replace("${1}", taskId);
                  cy.request(urlEdit).then(({ body }) => {
                    cy.wait(500);
                    cy.get("bridge-button[data-test='cancel-button']")
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
                  const urlEdit = Cypress.env("apiTasksSelfTestsIdRL").replace("${1}", taskId);
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
    it("Click the Back button in Confirmation to go to Edit Self test", () => {
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
                  const apiTasksSelfTestsIdRL = Cypress.env("apiTasksSelfTestsIdRL").replace("${1}", taskId);
                  cy.request(apiTasksSelfTestsIdRL).then(({ body }) => {
                    cy.wait(500);
                    cy.get("bridge-button[data-test='confirm-button']")
                      .click()
                      .then(() => {
                        cy.wait(500);
                        cy.get("bridge-button[data-test='back-button']")
                          .click()
                          .then(() => {
                            cy.wait(500);
                            const selfTestEditRL = Cypress.env("selfTestEditRL").replace("${1}", body.id);
                            cy.location("href").should("eq", Cypress.config("baseUrl") + selfTestEditRL);
                          });
                      });
                  });
                });
              });
          });
      });
    });

    it("Edit Task", () => {
      const taskName = "New Self test - " + new Date().getTime();
      const task = {
        taskName,
        download: "",
        assets: [],
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
                  const apiTasksSelfTestsIdRL = Cypress.env("apiTasksSelfTestsIdRL").replace("${1}", taskId);
                  cy.request(apiTasksSelfTestsIdRL).then(({ body }) => {
                    cy.wait(500);
                    cy.get("form").then(($form) => {
                      cy.wrap($form)
                        .find("textarea[name='memo']")
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
                                            task.download = Cypress.$(".task-setting bridge-time-picker").attr("ng-reflect-default");
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
                                  .should("contains", task.taskName);

                                cy.get(
                                  "bridge-task-table mat-accordion > [data-test='task-row']:eq(0) mat-expansion-panel-header span[data-test='task-type']",
                                )
                                  .invoke("text")
                                  .then((text) => text.trim())
                                  .should("eq", "Self test");
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
  context("Deleting Self test task", () => {
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
        .route("DELETE", `/api/tasks/selfTests/*`)
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
});
