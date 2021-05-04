/// <reference types="Cypress" />

const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
const forMatDateTime = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.format("MMM D, YYYY, h:mm:ss A")) || "";
};
const convertText = (taskTypeAfter) => {
  let taskType = "";
  if (taskTypeAfter === "retrievelog") {
    taskType = "Retrieve Log";
  } else if (taskTypeAfter === "selftest") {
    taskType = "Self test";
  } else if (taskTypeAfter === "reboot") {
    taskType = "Reboot";
  } else if (taskTypeAfter === "downloadpackage") {
    taskType = "DownloadPackage";
  } else if (taskTypeAfter === "install") {
    taskType = "Install";
  }
  return taskType || "";
};
describe("Page-Task List", () => {
  context("Initial display", () => {
    let inputDate = new Date();
    inputDate.setDate(inputDate.getDate() + 1);
    const check = Cypress.moment.utc(inputDate);
    const date = (check.isValid() && check.format("M/D/YYYY, h:mm:ss A")) || "";
    let listModelData = [];
    const listStatus = ["ALL", "Scheduled", "InProgress", "Complete", "Failure"];
    const listTaskType = ["ALL", "DownloadPackage", "Install", "RetrieveLog", "Reboot", "SelfTest"];
    before(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("DataTaskList")
        .route("GET", `${Cypress.env("apiTypes")}*`)
        .as("ModelData");
      cy.visit(Cypress.env("tasks"))
        .wait(["@DataTaskList", "@ModelData"])
        .then(([task, model]) => {
          listDataTaskList = task.responseBody;
          listModelData = model.responseBody;
        });
    });
    it("Display with no arguments", () => {
      let totalCount = 0;
      let page = 0;
      let numberPage = 0;
      let resData = [];

      totalCount = listDataTaskList.totalCount;
      numberPage = Math.ceil(totalCount / 10) + 2;
      resData = listDataTaskList.items;

      // keyword
      cy.get("bridge-task-list-filter [data-test='search-box'] input").should("have.value", "");
      // status
      cy.get("[data-test='status-select']").should("attr", "ng-reflect-selected-item", "");
      // taskType
      cy.get("[data-test='type-select']").should("attr", "ng-reflect-selected-item", "");
      // modelList
      cy.get("[data-test='model-select']").should("attr", "ng-reflect-selected-item", "");
      // Schedule Start Date
      cy.get("[data-test='schedule-date'] .range-date-time-picker div")
        .eq(0)
        .within((el) => {
          cy.wrap(el)
            .find("input")
            .should("have.value", "");
        });
      // Schedule End Date
      cy.get("[data-test='schedule-date'] .range-date-time-picker div")
        .eq(0)
        .next()
        .within((el) => {
          cy.wrap(el)
            .find("input")
            .should("have.value", "");
        });

      // Paging display check
      cy.get("bridge-task-table[data-test='task-table']")
        .next("bridge-pagination[data-test='task-pagination']")
        .within((el) => {
          cy.wrap(el)
            .get("div.root > nav > button")
            .its("length")
            .invoke("toString")
            .should("be.eq", `${Math.min(numberPage, 13)}`);
        });
      // Check the number of search results
      cy.get("bridge-pagination[data-test='task-pagination']")
        .find("span.description")
        .invoke("text")
        .then((text) => text.trim())
        .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);

      //  Accordion deployment status check (undeployed)
      cy.get("bridge-form")
        .children("input")
        .should("have.value", "");
      cy.get("bridge-task-list-filter .ok button").click();

      cy.get("bridge-task-table")
        .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header")
        .next(".mat-expansion-panel-content")
        .should("not.exist");
    });

    it("Display with arguments", () => {
      cy.get("body").click();
      const keyword = "e2e";
      // type input word
      cy.wait(500);
      cy.get("bridge-task-list-filter [data-test='search-box'] input").type(keyword);
      // select status
      cy.wait(500);
      cy.get(`bridge-task-list-filter [data-test='status-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container`).within(($el) => {
            cy.wrap($el)
              .find("mat-option:eq(1)")
              .click()
              .then(() => {
                cy.wait(500);
                cy.root()
                  .parents("body")
                  .click();
              });
          });
        });

      // select taskType
      cy.wait(500);
      cy.get(`bridge-task-list-filter [data-test='type-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container`).within(($el) => {
            cy.get(`.mat-option[ng-reflect-value='${listTaskType[1]}']`)
              .click()
              .then(() => {
                cy.wait(500);
                cy.root()
                  .parents("body")
                  .click();
              });
          });
        });
      // select Model
      cy.wait(500);
      cy.get(`bridge-task-list-filter [data-test='model-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container`).within(($el) => {
            cy.get(`mat-option[ng-reflect-value='${listModelData[1].typeId}']`)
              .click()
              .then(() => {
                cy.wait(500);
                cy.root()
                  .parents("body")
                  .click();
              });
          });
        });
      cy.wait(500);
      // select schedule start date
      cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
        .first()
        .focus()
        .type(date)
        .blur();
      cy.wait(500);
      // select schedule end date
      cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
        .last()
        .focus()
        .type(date)
        .blur();
      cy.wait(500);
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("DataTaskFilter");
      cy.get("body").click();
      cy.wait(500);
      cy.get("bridge-task-list-filter .ok button")
        .click()
        .then(() => {
          cy.wait("@DataTaskFilter").then(() => {
            cy.get("bridge-header-tab bridge-header-tab-item[ng-reflect-text='assets'] button").click({ force: true });
            cy.wait(500);
            cy.server()
              .route("GET", `${Cypress.env("apiTasks")}*`)
              .as("DataTaskComeBack");
            cy.get("bridge-header-tab bridge-header-tab-item[ng-reflect-text='tasks'] button").click({ force: true });
            cy.wait(500);
            cy.wait("@DataTaskComeBack").then(() => {
              // input word
              cy.get("bridge-task-list-filter [data-test='search-box'] input").should("have.value", keyword);
              // status
              cy.get(`bridge-select-multi[data-test='status-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", listStatus[1]);
              // taskType
              cy.get(`bridge-select-multi[data-test='type-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", listTaskType[1]);
              // Model
              cy.get(`bridge-select-multi[data-test='model-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", listModelData[1].typeId);
              // schedule start date
              cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
                .first()
                .should("have.value", date);
              // schedule end date
              cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
                .last()
                .should("have.value", date);
            });
          });
        });
    });
  });

  context("Search filter operations", () => {
    let inputDate = new Date();
    inputDate.setDate(inputDate.getDate() + 1);
    const check = Cypress.moment.utc(inputDate);
    const date = (check.isValid() && check.format("M/D/YYYY, h:mm:ss A")) || "";
    let listModelData = [];
    const listStatusLabel = ["ALL", "Scheduled", "Inprogress", "Complete", "Failure"];
    const listStatus = ["ALL", "Scheduled", "InProgress", "Complete", "Failure"];
    const listTaskType = ["ALL", "DownloadPackage", "Install", "Retrieve Log", "Reboot", "Self test"];
    beforeEach(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("DataTaskList")
        .route("GET", `${Cypress.env("apiTypes")}*`)
        .as("ModelData");
      cy.visit(Cypress.env("tasks"))
        .wait(["@DataTaskList", "@ModelData"])
        .then(([task, model]) => {
          listDataTaskList = task.responseBody;
          listModelData = model.responseBody;
        });
    });

    it("Checking items in each list", () => {
      // Status items
      cy.wait(1000);
      cy.get("[data-test='status-select']")
        .click()
        .then(() => {
          cy.get(`.cdk-overlay-container`).within(($el) => {
            cy.get("mat-option").then((el) => {
              cy.wrap(el).each((taskType, i) => {
                cy.wrap(taskType)
                  .find("span.mat-option-text")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("be.eq", listStatusLabel[i]);
              });
            });
            cy.root()
              .parents("body")
              .click();
          });
        });
      // Task Type items
      cy.wait(1000);
      cy.get("[data-test='type-select']")
        .click()
        .then(() => {
          cy.get("mat-option").then((el) => {
            cy.wrap(el).each((taskType, i) => {
              cy.wrap(taskType)
                .find("span.mat-option-text")
                .invoke("text")
                .then((text) => text.trim())
                .should("be.eq", listTaskType[i]);
            });
          });
          cy.wait(400);
          cy.get("body").click();
        });
      // Model items
      cy.wait(400);
      cy.get("[data-test='model-select']")
        .click()
        .then(() => {
          cy.get("mat-option").then((el) => {
            cy.wrap(el).each((taskType, i) => {
              if (i === 0) {
                cy.wrap(taskType)
                  .find("span.mat-option-text")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("be.eq", "ALL");
              } else {
                cy.wrap(taskType)
                  .find("span.mat-option-text")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("be.eq", listModelData[i - 1].typeId);
              }
            });
          });
        });
    });

    it(`Select a single Status item`, () => {
      cy.wait(1000);
      cy.get(`[data-test='status-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listStatus[1]}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option [ng-reflect-state='checked']`)
            .its("length")
            .should("be.eq", 1);

          cy.get("body")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(`bridge-select-multi[data-test='status-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", listStatus[1]);
            });
        });
    });
    it(`Select multiple Status items`, () => {
      cy.wait(1000);
      cy.get(`[data-test='status-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listStatus[1]}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listStatus[2]}']`).click();
          cy.wait(500);

          cy.get(`.cdk-overlay-container  mat-option [ng-reflect-state='checked']`)
            .its("length")
            .should("be.eq", 2);

          cy.get("body")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(`bridge-select-multi[data-test='status-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", `${listStatus[1]},${listStatus[2]}`);
            });
        });
    });

    it(`Select a single Task type item`, () => {
      cy.wait(1000);
      cy.get(`[data-test='type-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listTaskType[1]}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option [ng-reflect-state='checked']`)
            .its("length")
            .should("be.eq", 1);
          cy.get("body")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(`bridge-select-multi[data-test='type-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", listTaskType[1]);
            });
        });
    });
    it(`Select multiple Task type items`, () => {
      cy.wait(1000);
      cy.get(`[data-test='type-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listTaskType[1]}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listTaskType[2]}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container  mat-option [ng-reflect-state='checked']`)
            .its("length")
            .should("be.eq", 2);

          cy.get("body")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(`bridge-select-multi[data-test='type-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", `${listTaskType[1]},${listTaskType[2]}`);
            });
        });
    });

    it(`Select a single Model item`, () => {
      cy.wait(1000);
      cy.get(`[data-test='model-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listModelData[1].typeId}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option [ng-reflect-state='checked']`)
            .its("length")
            .should("be.eq", 1);

          cy.get("body")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(`bridge-select-multi[data-test='model-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", listModelData[1].typeId);
            });
        });
    });
    it(`Select multiple Model items`, () => {
      cy.wait(1000);
      cy.get(`[data-test='model-select']`)
        .click()
        .then(() => {
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listModelData[1].typeId}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container mat-option[ng-reflect-value='${listModelData[2].typeId}']`).click();
          cy.wait(500);
          cy.get(`.cdk-overlay-container  mat-option [ng-reflect-state='checked']`)
            .its("length")
            .should("be.eq", 2);
          cy.get("body")
            .click()
            .then(() => {
              cy.wait(500);
              cy.get(`bridge-select-multi[data-test='model-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", `${listModelData[1].typeId},${listModelData[2].typeId}`);
            });
        });
    });

    it("When clicked the apply button, there were 0 results", () => {
      const keyword = "Search not found #c$";
      // Type keyword
      // before select value filter and click button apply
      cy.wait(500);
      cy.get("bridge-task-list-filter [data-test='search-box'] input").type(keyword);
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("DataTaskFilter");
      cy.get("bridge-task-list-filter .ok button")
        .click()
        .then(() => {
          cy.wait("@DataTaskFilter").then(() => {
            cy.wait(500);
            cy.get("bridge-pagination[data-test='task-pagination']")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", "No item");

            cy.get("bridge-pagination[data-test='task-pagination']").within((el) => {
              cy.wrap(el)
                .get("div.root > nav > button")
                .its("length")
                .should("equal", 3);
            });
          });
        });
    });

    it("When clicked the OK button, there were more than 1 results", () => {
      cy.wait(500);
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("dataSearch");
      const keyword = "e2e";
      // Type keyword
      // before select value filter and click button apply
      cy.get("bridge-task-list-filter [data-test='search-box'] input").type(keyword);
      cy.get("bridge-task-list-filter .ok button")
        .click({ force: true })
        .then(() => {
          cy.wait("@dataSearch").then(({ responseBody }) => {
            cy.wait(500);
            let page = 0;
            let numberPage = Math.ceil(responseBody.totalCount / 10) + 2;
            if (numberPage > 3) {
              cy.get("bridge-task-table [data-test='task-row']")
                .its("length")
                .should("eq", 10);
            } else {
              cy.get("bridge-task-table [data-test='task-row']")
                .its("length")
                .should("eq", responseBody.totalCount);
            }
            cy.get("bridge-pagination[data-test='task-pagination']")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should(
                "eq",
                `${page * 10 + 1} to ${Math.min((page + 1) * 10, responseBody.totalCount)} of ${responseBody.totalCount} items`,
              );

            cy.get("bridge-pagination[data-test='task-pagination']").within((el) => {
              cy.wrap(el)
                .get("div.root > nav > button")
                .its("length")
                .should("equal", Math.min(numberPage, 13));
            });
          });
        });
    });

    it("Enter Schedule start date ", () => {
      cy.get("bridge-task-list-filter .range-date-time-picker div")
        .eq(0)
        .find("mat-datepicker-toggle button")
        .click({ force: true })
        .then(() => {
          cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
            .first()
            .focus()
            .type(date)
            .blur()
            .should("have.value", date)
            .and("not.value", " ");
        });
    });

    it("Enter Schedule end date ", () => {
      cy.get("bridge-task-list-filter .range-date-time-picker div")
        .eq(0)
        .next()
        .find("mat-datepicker-toggle button")
        .click({ force: true })
        .then(() => {
          cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
            .last()
            .focus()
            .type(date)
            .blur()
            .should("have.value", date)
            .and("not.value", " ");
        });
    });

    it("Click the Clear button", () => {
      const keyword = "e2e";
      // type input word
      cy.get("bridge-task-list-filter [data-test='search-box'] input").type(keyword);
      // select status
      cy.get(`[data-test='status-select']`)
        .click()
        .then(() => {
          cy.get(`.cdk-overlay-container`).within(($el) => {
            cy.get(`mat-option[ng-reflect-value='${listStatus[1]}']`).click();
            cy.root()
              .parents("body")
              .click();
            cy.wait(500);
          });
        });

      // select taskType
      cy.get(`[data-test='type-select']`)
        .click()
        .then(() => {
          cy.get(`.cdk-overlay-container`).within(($el) => {
            cy.get(`mat-option[ng-reflect-value='${listTaskType[1]}']`).click();
            cy.root()
              .parents("body")
              .click();
            cy.wait(500);
          });
        });

      // select Model
      cy.get(`[data-test='model-select']`)
        .click()
        .then(() => {
          cy.get(`.cdk-overlay-container`).within(($el) => {
            cy.get(`mat-option[ng-reflect-value='${listModelData[1].typeId}']`).click();
            cy.root()
              .parents("body")
              .click();
            cy.wait(500);
          });
        });
      cy.get("body").click();
      // select schedule start date
      cy.wait(500);
      cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
        .first()
        .focus()
        .type(date)
        .blur();
      // select schedule end date
      cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
        .last()
        .focus()
        .type(date)
        .blur();
      cy.wait(500);

      //  and click button apply , afters click clear
      cy.wait(500);
      cy.get("bridge-task-list-filter .ok button")
        .click()
        .then(() => {
          cy.wait(500);
          cy.get("bridge-task-list-filter .basic button")
            .click()
            .then(() => {
              // input word
              cy.get("bridge-task-list-filter [data-test='search-box'] input").should("have.value", "");
              // status
              cy.get(`bridge-select-multi[data-test='status-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", "");
              // taskType
              cy.get(`bridge-select-multi[data-test='type-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", "");
              // Model
              cy.get(`bridge-select-multi[data-test='model-select']`)
                .invoke("attr", "ng-reflect-selected-item")
                .should("eq", "");
              // schedule start date
              cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
                .first()
                .should("have.value", "");
              // schedule end date
              cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
                .last()
                .should("have.value", "");
            });
        });
    });
  });

  context("Sorting operations", () => {
    before(() => {
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0`)
        .as("DataTaskList");
      cy.visit(Cypress.env("tasks")).wait("@DataTaskList");
    });
    const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
    const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";
    const defaultImg = "assets/img/icons/arrows-alt-v-solid.svg";
    const sourceSort = [
      {
        key: "status",
      },
      {
        key: "name",
      },
      {
        key: "taskType",
      },
      {
        key: "executionSchedule",
      },
      {
        key: "executionStart",
      },
      {
        key: "executionFinish",
      },
    ];
    sourceSort.forEach(({ key }) => {
      // sort ASC
      it(`Click ${key} to set the ascending order`, () => {
        let resData;
        cy.server()
          .route("GET", `${Cypress.env("apiTasks")}*`)
          .as("taskList");
        cy.wait(1000).then(() => {
          cy.get(`bridge-task-table mat-accordion section .${key}`)
            // .as(`sortASC${key}`)
            .click();

          cy.wait("@taskList").then(({ responseBody }) => {
            resData = responseBody.items[0];
            cy.get("bridge-task-table")
              .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header")
              .next(".mat-expansion-panel-content")
              .should("not.exist");

            cy.get("bridge-task-table")
              .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header > .mat-content")
              .first()
              .within((el) => {
                cy.wrap(el)
                  .find(" > span.status")
                  .should("have.text", `${resData.status}`);

                if (resData.taskType === "downloadpackage" || resData.taskType === "install") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", `${resData.name}`);
                } else if (resData.taskType === "reboot") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", ("Reboot " + `${resData.rebootTask.memo}`).trim());
                } else if (resData.taskType === "selftest") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", ("Self test " + `${resData.selfTestTask.memo}`).trim());
                } else if (resData.taskType === "retrievelog") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", `${resData.logTask.logType} ${resData.logTask.memo}`);
                }
                cy.wrap(el)
                  .find(" > [data-test='task-type']")
                  .should("have.text", convertText(`${resData.taskType}`));
                cy.wrap(el)
                  .find(" > :nth-child(4)")
                  .should("have.text", generatorDate(`${resData.startedAt}`));
                cy.wrap(el)
                  .find(" > :nth-child(5)")
                  .should("have.text", generatorDate(`${resData.executionStartedAt}`));
                cy.wrap(el)
                  .find(" > :nth-child(6)")
                  .should("have.text", generatorDate(`${resData.executionFinishedAt}`));
                if (resData.status === "scheduled") {
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .children("a")
                    .eq(0)
                    .children("span")
                    .should("have.class", "edit");
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .children("a")
                    .eq(1)
                    .children("span")
                    .should("have.class", "delete");
                } else {
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .should("not.have.class", "edit");
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .should("not.have.class", "delete");
                }
              });

            cy.get(`bridge-task-table mat-accordion section .${key}`).within(($el) => {
              cy.wait(500);
              // check img sort
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .and("include", upImg);
            });
          });
        });
      });

      // sort DESC
      it(`Click ${key} to set the descending order`, () => {
        let resData;
        cy.server()
          .route("GET", `${Cypress.env("apiTasks")}*`)
          .as("taskList");
        cy.wait(1000).then(() => {
          cy.get(`bridge-task-table mat-accordion section .${key}`)
            // .as(`sortASC${key}`)
            .click();

          cy.wait("@taskList").then(({ responseBody }) => {
            resData = responseBody.items[0];
            cy.get("bridge-task-table")
              .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header")
              .next(".mat-expansion-panel-content")
              .should("not.exist");

            cy.get("bridge-task-table")
              .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header > .mat-content")
              .first()
              .within((el) => {
                cy.wrap(el)
                  .find(" > span.status")
                  .should("have.text", `${resData.status}`);

                if (resData.taskType === "downloadpackage" || resData.taskType === "install") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", `${resData.name}`);
                } else if (resData.taskType === "reboot") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", ("Reboot " + `${resData.rebootTask.memo}`).trim());
                } else if (resData.taskType === "selftest") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", ("Self test " + `${resData.selfTestTask.memo}`).trim());
                } else if (resData.taskType === "retrievelog") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", `${resData.logTask.logType} ${resData.logTask.memo}`);
                }
                cy.wrap(el)
                  .find(" > [data-test='task-type']")
                  .should("have.text", convertText(`${resData.taskType}`));
                cy.wrap(el)
                  .find(" > :nth-child(4)")
                  .should("have.text", generatorDate(`${resData.startedAt}`));
                cy.wrap(el)
                  .find(" > :nth-child(5)")
                  .should("have.text", generatorDate(`${resData.executionStartedAt}`));
                cy.wrap(el)
                  .find(" > :nth-child(6)")
                  .should("have.text", generatorDate(`${resData.executionFinishedAt}`));
                if (resData.status === "scheduled") {
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .children("a")
                    .eq(0)
                    .children("span")
                    .should("have.class", "edit");
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .children("a")
                    .eq(1)
                    .children("span")
                    .should("have.class", "delete");
                } else {
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .should("not.have.class", "edit");
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .should("not.have.class", "delete");
                }
              });

            cy.get(`bridge-task-table mat-accordion section .${key}`).within(($el) => {
              cy.wait(500);
              // check img sort
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .and("include", downImg);
            });
          });
        });
      });

      // sort default
      it(`Click ${key} to set the default order`, () => {
        let resData;
        cy.server()
          .route("GET", `${Cypress.env("apiTasks")}*`)
          .as("taskList");
        cy.wait(1000).then(() => {
          cy.get(`bridge-task-table mat-accordion section .${key}`)
            // .as(`sortASC${key}`)
            .click();

          cy.wait("@taskList").then(({ responseBody }) => {
            resData = responseBody.items[0];
            cy.get("bridge-task-table")
              .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header")
              .next(".mat-expansion-panel-content")
              .should("not.exist");

            cy.get("bridge-task-table")
              .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header > .mat-content")
              .first()
              .within((el) => {
                cy.wrap(el)
                  .find(" > span.status")
                  .should("have.text", `${resData.status}`);

                if (resData.taskType === "downloadpackage" || resData.taskType === "install") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", `${resData.name}`);
                } else if (resData.taskType === "reboot") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", ("Reboot " + `${resData.rebootTask.memo}`).trim());
                } else if (resData.taskType === "selftest") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", ("Self test " + `${resData.selfTestTask.memo}`).trim());
                } else if (resData.taskType === "retrievelog") {
                  cy.wrap(el)
                    .find(" > [data-test='name']")
                    .invoke("text")
                    .then((t) => t.trim())
                    .should("equal", `${resData.logTask.logType} ${resData.logTask.memo}`);
                }
                cy.wrap(el)
                  .find(" > [data-test='task-type']")
                  .should("have.text", convertText(`${resData.taskType}`));
                cy.wrap(el)
                  .find(" > :nth-child(4)")
                  .should("have.text", generatorDate(`${resData.startedAt}`));
                cy.wrap(el)
                  .find(" > :nth-child(5)")
                  .should("have.text", generatorDate(`${resData.executionStartedAt}`));
                cy.wrap(el)
                  .find(" > :nth-child(6)")
                  .should("have.text", generatorDate(`${resData.executionFinishedAt}`));
                if (resData.status === "scheduled") {
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .children("a")
                    .eq(0)
                    .children("span")
                    .should("have.class", "edit");
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .children("a")
                    .eq(1)
                    .children("span")
                    .should("have.class", "delete");
                } else {
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .should("not.have.class", "edit");
                  cy.wrap(el)
                    .find(" > :nth-child(7)")
                    .should("not.have.class", "delete");
                }
              });

            cy.get(`bridge-task-table mat-accordion section .${key}`).within(($el) => {
              cy.wait(500);
              // check img sort
              cy.wrap($el)
                .find("bridge-svg-icon img")
                .should("have.attr", "src")
                .and("include", defaultImg);
            });
          });
        });
      });
    });
  });

  context("Search result operations", () => {
    it("Check to see the Edit and Delete link buttons", () => {
      cy.server().route("POST", `${Cypress.env("apiTasksStatus")}`);
      cy.visit(Cypress.env("tasks"));
      const listKeySearchSTT = [
        {
          key: "Scheduled",
        },
        {
          key: "Inprogress",
        },
        {
          key: "Complete",
        },
        {
          key: "Failure",
        },
      ];
      listKeySearchSTT.map((el) => {
        cy.get("bridge-form")
          .children("input")
          .type(`${el.key}`);
        cy.server()
          .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=${el.key}`)
          .as(`search${el.key}`);
        cy.get("bridge-task-list-filter .ok button").click();
        cy.wait(`@search${el.key}`).then(() => {
          if (el.key === "Scheduled") {
            cy.get('span[data-test="edit-action"]').should("have.class", "edit");
            cy.get('span[data-test="delete-action"]').should("have.class", "delete");
          } else {
            cy.get('span[data-test="edit-action"]').should("not.have.class", "edit");
            cy.get('span[data-test="delete-action"]').should("not.have.class", "delete");
          }
          cy.get("bridge-form")
            .children("input")
            .clear();
        });
      });
    });
  });

  context("Delete Tasks", () => {
    beforeEach(() => {
      cy.server()
        .route("POST", `${Cypress.env("apiTasksStatus")}`)
        .as("apiTasksStatus");
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0`)
        .as("DataTaskList");
      cy.visit(Cypress.env("tasks")).wait(["@apiTasksStatus", "@DataTaskList"]);
      cy.get("bridge-form")
        .children("input")
        .clear();
    });

    it("Click the Delete link button", () => {
      cy.get("span .delete")
        .first()
        .click({ force: true });
      cy.get("mat-dialog-container.mat-dialog-container").should("be.visible");
      cy.get("bridge-alert bridge-button.cancel").should("be.visible");
      cy.get("bridge-alert bridge-button.confirm").should("be.visible");
    });

    const deployment = [
      {
        taskType: "DownloadPackage",
        isInstall: false,
        taskName: "NotInstallBy3Si",
        keySearch: "DownloadPackage",
        type: "deployments",
        title: "without",
      },
      {
        taskType: "Install",
        isInstall: true,
        taskName: "IsInstallBy3Si",
        keySearch: "Install",
        type: "deployments",
        title: "with",
      },
    ];
    const listTaskType = [
      {
        taskType: "Retrieve Log",
        createdBy: "Created By 3si Lucky Star",
        keySearch: "RetrieveLog",
        type: "logs",
      },
      {
        taskType: "Reboot",
        createdBy: "Created By 3si Lucky Star",
        keySearch: "Reboot",
        type: "reboots",
      },
      {
        taskType: "Self test",
        createdBy: "Created By 3si Lucky Star",
        keySearch: "SelfTests",
        type: "selfTests",
      },
    ];
    deployment.map(({ taskType, isInstall, taskName, keySearch, type, title }) => {
      it(`Click the Delete link button in the Download Package task ${title} the Install task, and select Delete in the dialog`, () => {
        let date = new Date();
        let taskItems = {};
        // create record
        cy.get(".top-page-task-list bridge-button")
          .children("button")
          .click();
        cy.wait(500);
        cy.root("bridge-dropdown-menu-item").scrollIntoView();
        cy.get(`bridge-dropdown-menu-item > div`)
          .first()
          .click({ force: true });
        cy.get("input.mat-input-element")
          .first()
          .type(`${taskName}`);
        cy.get("div[data-test='package-select'] bridge-button > button").click({ force: true });
        cy.get("bridge-modal bridge-expansion-table bridge-expansion-panel .expantion-radio")
          .first()
          .click();
        cy.get("bridge-modal .footer bridge-button.primary").click();
        cy.get("bridge-button[data-test='asset-modal'] > button").click({ force: true });
        cy.get("bridge-modal bridge-table > table > tbody > tr > td ")
          .first()
          .click();
        cy.get("mat-dialog-content")
          .next("div.footer")
          .find("bridge-button.primary > button")
          .click();
        let taskSetting = taskType === "DownloadPackage" ? "download-setting" : "install-setting-group";
        date = date.getDate();

        cy.get(`div.download-setting > div.startDate > bridge-radio-group > bridge-radio`)
          .eq(1)
          .click();
        cy.get(`div.download-setting bridge-date-picker bridge-button > button`).click({ force: true });
        cy.get(`mat-month-view > table > tbody > tr > td > div.mat-calendar-body-cell-content:contains(${date})`)
          .first()
          .click({ force: true });

        cy.get(`div.download-setting bridge-time-picker bridge-button > button`).click({ force: true });
        cy.get("bridge-time-picker-content > div > mat-option ")
          .last()
          .click();

        if (taskSetting === "download-setting") {
          cy.get(`div.install-setting > div.install > bridge-radio-group > bridge-radio`)
            .eq(1)
            .click();
        } else {
          cy.get(`div.${taskSetting} > div.startDate > div > bridge-radio`)
            .eq(1)
            .click();
          cy.get(`div.${taskSetting} bridge-date-picker bridge-button > button`).click({ force: true });
          cy.get(`mat-month-view > table > tbody > tr > td > div.mat-calendar-body-cell-content:contains(${date})`)
            .first()
            .click({ force: true });

          cy.get(`div.${taskSetting} bridge-time-picker bridge-button > button`).click({ force: true });
          cy.get("bridge-time-picker-content > div > mat-option ")
            .last()
            .click();
        }

        cy.get("div.task-details > div ")
          .last()
          .find("bridge-button[data-test='confirm-button']")
          .not(".disabled")
          .click();

        cy.wait(1000);
        cy.get("bridge-button[data-test='ok-button'] > button").click();

        // delete record
        cy.get("bridge-form")
          .children("input")
          .type(`${taskName}`);
        cy.server()
          .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=${taskName}`)
          .as(`search${keySearch}`);

        cy.get("bridge-task-list-filter .ok button").click();

        cy.wait(`@search${keySearch}`).then(({ responseBody }) => {
          totalCount = responseBody.totalCount;

          cy.get("bridge-pagination[data-test='task-pagination']")
            .find("span.description")
            .invoke("text")
            .then((text) => text.trim())
            .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);
          let arraySearch = responseBody.items;
          for (let i = 0; i < arraySearch.length; i++) {
            const el = arraySearch[i];
            if (el.name === taskName && el.taskType === "downloadpackage") {
              taskItems.id = el.id;
              taskItems.index = i;
              break;
            }
          }

          cy.server()
            .route("DELETE", `${Cypress.env("apiTasks")}/${type}/${taskItems.id}`)
            .as(`delete${keySearch}`);

          cy.server()
            .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=${taskName}`)
            .as("dataAfterSearch");

          cy.get("span .delete")
            .eq(`${taskItems.index}`)
            .click({ force: true });

          cy.get("bridge-alert bridge-button.confirm").click();
        });

        cy.wait(["@dataAfterSearch", `@delete${keySearch}`]).then(([res, status]) => {
          totalCount = res.responseBody.totalCount;
          let numberPage = Math.ceil(totalCount / 10) + 2;
          if (totalCount === 0) {
            cy.get("bridge-pagination[data-test='task-pagination']")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", "No item");
            numberPage = 3;
          } else {
            cy.get("bridge-pagination[data-test='task-pagination']")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);
          }
          cy.get("bridge-pagination[data-test='task-pagination']").within((el) => {
            cy.wrap(el)
              .get("div.root > nav > button")
              .its("length")
              .should("equal", Math.min(numberPage, 13));
          });
        });
      });
    });
    it(`Click the Delete link button in the Install task and select Delete in the dialog`, () => {
      let date = new Date();
      date = date.getDate();
      let totalCount = 0;
      let page = 0;
      let idRecord;
      cy.get(".top-page-task-list bridge-button")
        .children("button")
        .click();
      cy.wait(500);
      cy.root("bridge-dropdown-menu-item").scrollIntoView();
      cy.get(`bridge-dropdown-menu-item > div:contains("Deployment")`).click({ force: true });
      cy.get("input.mat-input-element")
        .first()
        .type("e2e install");
      cy.get("div[data-test='package-select'] bridge-button > button").click({ force: true });
      cy.get("bridge-modal bridge-expansion-table bridge-expansion-panel .expantion-radio")
        .first()
        .click();
      cy.get("bridge-modal .footer bridge-button.primary").click();
      cy.get("bridge-button[data-test='asset-modal'] > button").click({ force: true });
      cy.get("bridge-modal bridge-table > table > tbody > tr > td ")
        .first()
        .click();
      cy.get("mat-dialog-content")
        .next("div.footer")
        .find("bridge-button.primary > button")
        .click();
      cy.get(`div.download-setting > div.startDate > bridge-radio-group > bridge-radio`)
        .eq(1)
        .click();
      cy.get(`div.download-setting bridge-date-picker bridge-button > button`).click({ force: true });
      cy.get(`mat-month-view > table > tbody > tr > td > div.mat-calendar-body-cell-content:contains(${date})`)
        .first()
        .click({ force: true });

      cy.get(`div.download-setting bridge-time-picker bridge-button > button`).click({ force: true });

      cy.get("bridge-time-picker-content > div > mat-option ")
        .last()
        .click();
      cy.get(`div.install-setting-group > div.startDate > div > bridge-radio`)
        .eq(1)
        .click();
      cy.get(`div.install-setting-group bridge-date-picker bridge-button > button`).click({ force: true });
      cy.get(`mat-month-view > table > tbody > tr > td > div.mat-calendar-body-cell-content:contains(${date})`)
        .first()
        .click({ force: true });

      cy.get(`div.install-setting-group bridge-time-picker bridge-button > button`).click({ force: true });
      cy.get("bridge-time-picker-content > div > mat-option ")
        .last()
        .click();
      cy.get("div.task-details > div ")
        .last()
        .find("bridge-button[data-test='confirm-button']")
        .not(".disabled")
        .click();
      cy.get("bridge-button[data-test='ok-button'] > button").click();
      // delete record
      cy.get("bridge-form")
        .children("input")
        .type(`e2e install`);

      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=e2e install`)
        .as(`searchInstall`);

      cy.get("bridge-task-list-filter .ok button").click();

      cy.wait(`@searchInstall`).then(({ responseBody }) => {
        totalCount = responseBody.totalCount;
        idRecord = responseBody.items[0].id;
        cy.get("bridge-pagination[data-test='task-pagination']")
          .find("span.description")
          .invoke("text")
          .then((text) => text.trim())
          .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);

        cy.get("span .delete")
          .first()
          .click({ force: true });

        cy.server()
          .route("DELETE", `${Cypress.env("apiTasks")}/deployments/${idRecord}`)
          .as(`deleteInstall`)
          .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=e2e install`)
          .as("dataAfterSearch");

        cy.get("bridge-alert bridge-button.confirm")
          .should("be.visible")
          .click();
      });

      cy.wait(["@dataAfterSearch", `@deleteInstall`]).then(([res, status]) => {
        totalCount = res.responseBody.totalCount;
        if (totalCount === 0) {
          cy.get("bridge-pagination[data-test='task-pagination']")
            .find("span.description")
            .invoke("text")
            .then((text) => text.trim())
            .should("eq", "No item");
        } else {
          cy.get("bridge-pagination[data-test='task-pagination']")
            .find("span.description")
            .invoke("text")
            .then((text) => text.trim())
            .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);
        }
      });
    });

    listTaskType.map(({ taskType, createdBy, keySearch, type }) => {
      it(`Click the Delete link button in the ${taskType} task and select Delete in the dialog`, () => {
        let date = new Date();
        date = date.getDate();
        let totalCount = 0;
        let page = 0;
        let idRecord;
        // Create record
        cy.get(".top-page-task-list bridge-button")
          .children("button")
          .click();
        cy.wait(500);
        cy.root("bridge-dropdown-menu-item").scrollIntoView();
        cy.get(`bridge-dropdown-menu-item > div:contains(${taskType})`).click({ force: true });
        cy.get("bridge-button[data-test='asset-modal'] > button").click({ force: true });
        cy.get("bridge-modal bridge-table > table > tbody > tr > td ")
          .first()
          .click();
        cy.get("mat-dialog-content")
          .next("div.footer")
          .find("bridge-button.primary > button")
          .click();
        cy.get("textarea[data-test='memo']").type(`${taskType}` + " " + `${createdBy}`);
        cy.get("div.startDate > div > bridge-radio")
          .eq(1)
          .click();
        cy.get("div.startDate")
          .next("div")
          .find("bridge-date-picker bridge-button > button")
          .click();
        cy.get(`mat-month-view > table > tbody > tr > td > div.mat-calendar-body-cell-content:contains(${date})`)
          .first()
          .click();
        cy.get("div.startDate")
          .next("div")
          .find("bridge-time-picker bridge-button > button")
          .click();
        cy.get("bridge-time-picker-content > div > mat-option ")
          .last()
          .click();
        cy.get("div.task-details > div ")
          .last()
          .find("bridge-button[data-test='confirm-button']")
          .not(".disabled")
          .click();
        cy.get("bridge-button[data-test='ok-button'] > button").click();

        // delete record
        cy.get("bridge-form")
          .children("input")
          .type(`${taskType}` + " " + `${createdBy}`);

        cy.server()
          .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=${taskType}` + " " + `${createdBy}`)
          .as(`search${keySearch}`);

        cy.get("bridge-task-list-filter .ok button").click();

        cy.wait(`@search${keySearch}`).then(({ responseBody }) => {
          totalCount = responseBody.totalCount;
          idRecord = responseBody.items[0].id;
          cy.get("bridge-pagination[data-test='task-pagination']")
            .find("span.description")
            .invoke("text")
            .then((text) => text.trim())
            .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);

          cy.get("span .delete")
            .first()
            .click({ force: true });

          cy.server()
            .route("DELETE", `${Cypress.env("apiTasks")}/${type}/${idRecord}`)
            .as(`delete${keySearch}`);

          cy.server()
            .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=${taskType}` + " " + `${createdBy}`)
            .as("dataAfterSearch");

          cy.get("bridge-alert bridge-button.confirm")
            .should("be.visible")
            .click();
        });

        cy.wait(["@dataAfterSearch", `@delete${keySearch}`]).then(([res, status]) => {
          totalCount = res.responseBody.totalCount;
          let numberPage = Math.ceil(totalCount / 10) + 2;
          if (totalCount === 0) {
            cy.get("bridge-pagination[data-test='task-pagination']")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", "No item");
            numberPage = 3;
          } else {
            cy.get("bridge-pagination[data-test='task-pagination']")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);
          }
          cy.get("bridge-pagination[data-test='task-pagination']").within((el) => {
            cy.wrap(el)
              .get("div.root > nav > button")
              .its("length")
              .should("equal", Math.min(numberPage, 13));
          });
        });
      });
    });

    it("Click the Delete link button and select Cancel in the dialog", () => {
      let totalCount = 0;
      let page = 0;
      cy.get("bridge-form")
        .children("input")
        .type("scheduled");
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=scheduled`)
        .as(`searchScheduled`);

      cy.get("bridge-task-list-filter .ok button").click();

      cy.wait(`@searchScheduled`).then(({ responseBody }) => {
        totalCount = responseBody.totalCount;
        // Check the number of search results
        cy.get("bridge-pagination[data-test='task-pagination']")
          .find("span.description")
          .invoke("text")
          .then((text) => text.trim())
          .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);

        cy.get("span .delete")
          .first()
          .click({ force: true });
        cy.get("bridge-alert bridge-button.cancel")
          .should("be.visible")
          .click();

        cy.get("bridge-pagination[data-test='task-pagination']")
          .find("span.description")
          .invoke("text")
          .then((text) => text.trim())
          .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);
      });
    });
  });

  context("Accordion operations", () => {
    before(() => {
      cy.server()
        .route("POST", `${Cypress.env("apiTasksStatus")}*`)
        .as("apiTasksStatus")
        .route("GET", `${Cypress.env("apiTasks")}*`)
        .as("DataTaskList");
      cy.visit(Cypress.env("tasks")).wait(["@apiTasksStatus", "@DataTaskList"]);
    });

    const keysAsset = ["status", "typeId", "assetId", "alias", "customerId", "regionId", "locationId", "result"];
    const keyPackage = ["name", "summary", "date"];

    it(`Click the Down Arrow expansion button in the Download Package task`, () => {
      cy.get("bridge-form")
        .children("input")
        .clear()
        .type(`e2e Deployment`);
      cy.get("bridge-task-list-filter .ok button").click();
      cy.wait(500);
      cy.request("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=e2e Deployment`).then(({ body }) => {
        if (body.items.length > 0) {
          cy.wait(500);
          const element = body.items[0];
          let createDate = generatorDate(element.createdAt);
          let lastModified = generatorDate(element.updatedAt);
          const strCreateBy = `${createDate} | Created by ${element.createdBy}`;
          const strModified = `${lastModified} | Modified by ${element.updatedBy}`;
          cy.get(`bridge-task-table[data-test='task-table'] > mat-accordion > mat-expansion-panel:eq(0) > mat-expansion-panel-header`)
            .click({ force: true })
            .then(($el) => {
              cy.wait(500);
              cy.wrap($el)
                .parents("mat-expansion-panel")
                .then(($el) => {
                  // Accordion deployment status check (deployment)
                  cy.wrap($el)
                    .find(".ng-trigger-bodyExpansion")
                    .should("have.css", "visibility", "visible")
                    .then(($el) => {
                      cy.wait(500);
                      // Task item check (Created, Last Modified, Related Task, Packages, Target Devices)
                      cy.wrap($el)
                        .find(`ul.items > li:eq(0) span[data-test="created-by"]`)
                        .should("have.text", strCreateBy);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(1) span[data-test="last-modified"]`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", strModified);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(2) button[data-test="relatedTask-modal"]`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", (element.relatedTaskId && "Install") || "");
                      // Target Devices
                      const { downloadPackageTaskAssets, deploymentTaskPackages } = element;
                      if (downloadPackageTaskAssets.length > 0) {
                        cy.wrap($el)
                          .find(`bridge-table[data-test="task-asset-table"]`)
                          .should("have.visible");
                      } else {
                        cy.wrap($el)
                          .find(`bridge-table[data-test="task-asset-table"]`)
                          .should("not.have.visible");
                      }
                      if (deploymentTaskPackages.length > 0) {
                        cy.wrap($el)
                          .find(`bridge-package-table.package-tasks`)
                          .should("have.visible");
                      } else {
                        cy.wrap($el)
                          .find(`bridge-package-table.package-tasks`)
                          .should("not.have.visible");
                      }
                      cy.wrap($el)
                        .find(`bridge-package-table.package-tasks mat-accordion mat-expansion-panel`)
                        .each(($tr, index) => {
                          const package = deploymentTaskPackages[index];
                          cy.wrap($tr)
                            .find(".mat-cell")
                            .each(($td, index) => {
                              console.log(keyPackage[index]);
                              let expectStr = "";
                              if (keyPackage[index] === "date") {
                                expectStr = forMatDateTime(package[keyPackage[index]]);
                              } else {
                                expectStr = package[keyPackage[index]];
                              }
                              cy.wrap($td)
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", expectStr || "");
                            });
                        });
                      //Check the number of Packages
                      cy.wrap($el)
                        .find(`bridge-package-table.package-tasks mat-accordion mat-expansion-panel`)
                        .its("length")
                        .should("eq", deploymentTaskPackages.length);
                      // Check the paging display of Target Devices
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-package-table-pagination"] .description`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", `1 to ${Math.min(deploymentTaskPackages.length, 10)} of ${deploymentTaskPackages.length} items`);
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-package-table-pagination"] nav.pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(deploymentTaskPackages.length / 10) + 2));

                      cy.wrap($el)
                        .find(`bridge-table[data-test="task-asset-table"] table tbody tr`)
                        .each(($tr, index) => {
                          const asset = downloadPackageTaskAssets[index];
                          console.log(asset);
                          cy.wrap($tr)
                            .find("td")
                            .each(($td, index) => {
                              cy.wrap($td)
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("contain", asset[keysAsset[index]] || "");
                            });
                        });
                      // Check the number of Target Devices
                      cy.wrap($el)
                        .find(`bridge-table[data-test="task-asset-table"] table tbody tr`)
                        .its("length")
                        .should("eq", downloadPackageTaskAssets.length);
                      // Check the paging display of Target Devices
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-asset-table-pagination"] .description`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should(
                          "eq",
                          `1 to ${Math.min(downloadPackageTaskAssets.length, 10)} of ${downloadPackageTaskAssets.length} items`,
                        );
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-asset-table-pagination"] .pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(downloadPackageTaskAssets.length / 10) + 2));
                    });
                });
            });
        }
      });
    });

    it(`Click the Down Arrow expansion button in the Install task`, () => {
      cy.get("bridge-form")
        .children("input")
        .clear()
        .type(`e2e Deployment Install`);
      cy.get("bridge-task-list-filter .ok button").click();
      cy.wait(500);
      cy.request("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=e2e Deployment Install`).then(({ body }) => {
        if (body.items.length > 0) {
          cy.wait(500);
          const element = body.items[0];
          let createDate = generatorDate(element.createdAt);
          let lastModified = generatorDate(element.updatedAt);
          const strCreateBy = `${createDate} | Created by ${element.createdBy}`;
          const strModified = `${lastModified} | Modified by ${element.updatedBy}`;
          cy.get(`bridge-task-table[data-test='task-table'] > mat-accordion > mat-expansion-panel:eq(0) > mat-expansion-panel-header`)
            .click({ force: true })
            .then(($el) => {
              cy.wait(500);
              cy.wrap($el)
                .parents("mat-expansion-panel")
                .then(($el) => {
                  // Accordion deployment status check (deployment)
                  cy.wrap($el)
                    .find(".ng-trigger-bodyExpansion")
                    .should("have.css", "visibility", "visible")
                    .then(($el) => {
                      cy.wait(500);
                      // Task item check (Created, Last Modified, Related Task, Packages, Target Devices)
                      cy.wrap($el)
                        .find(`ul.items > li:eq(0) span[data-test="created-by"]`)
                        .should("have.text", strCreateBy);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(1) span[data-test="last-modified"]`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", strModified);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(2) button[data-test="relatedTask-modal"]`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", (element.relatedTaskId && "DownloadPackage") || "");
                      // Target Devices
                      const { downloadPackageTaskAssets, deploymentTaskPackages } = element;
                      if (downloadPackageTaskAssets.length > 0) {
                        cy.wrap($el)
                          .find(`bridge-table[data-test="task-asset-table"]`)
                          .should("have.visible");
                      } else {
                        cy.wrap($el)
                          .find(`bridge-table[data-test="task-asset-table"]`)
                          .should("not.have.visible");
                      }
                      if (deploymentTaskPackages.length > 0) {
                        cy.wrap($el)
                          .find(`bridge-package-table.package-tasks`)
                          .should("have.visible");
                      } else {
                        cy.wrap($el)
                          .find(`bridge-package-table.package-tasks`)
                          .should("not.have.visible");
                      }
                      cy.wrap($el)
                        .find(`bridge-package-table.package-tasks mat-accordion mat-expansion-panel`)
                        .each(($tr, index) => {
                          const package = deploymentTaskPackages[index];
                          cy.wrap($tr)
                            .find(".mat-cell")
                            .each(($td, index) => {
                              console.log(keyPackage[index]);
                              let expectStr = "";
                              if (keyPackage[index] === "date") {
                                expectStr = forMatDateTime(package[keyPackage[index]]);
                              } else {
                                expectStr = package[keyPackage[index]];
                              }
                              cy.wrap($td)
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", expectStr || "");
                            });
                        });
                      //Check the number of Packages
                      cy.wrap($el)
                        .find(`bridge-package-table.package-tasks mat-accordion mat-expansion-panel`)
                        .its("length")
                        .should("eq", deploymentTaskPackages.length);
                      // Check the paging display of Target Devices
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-package-table-pagination"] .description`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", `1 to ${Math.min(deploymentTaskPackages.length, 10)} of ${deploymentTaskPackages.length} items`);
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-package-table-pagination"] nav.pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(deploymentTaskPackages.length / 10) + 2));

                      cy.wrap($el)
                        .find(`bridge-table[data-test="task-asset-table"] table tbody tr`)
                        .each(($tr, index) => {
                          const asset = downloadPackageTaskAssets[index];
                          console.log(asset);
                          cy.wrap($tr)
                            .find("td")
                            .each(($td, index) => {
                              cy.wrap($td)
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("eq", asset[keysAsset[index]] || "");
                            });
                        });
                      // Check the number of Target Devices
                      cy.wrap($el)
                        .find(`bridge-table[data-test="task-asset-table"] table tbody tr`)
                        .its("length")
                        .should("eq", downloadPackageTaskAssets.length);
                      // Check the paging display of Target Devices
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-asset-table-pagination"] .description`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should(
                          "eq",
                          `1 to ${Math.min(downloadPackageTaskAssets.length, 10)} of ${downloadPackageTaskAssets.length} items`,
                        );
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-asset-table-pagination"] .pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(downloadPackageTaskAssets.length / 10) + 2));
                    });
                });
            });
        }
      });
    });

    it(`Click the Down Arrow expansion button in the RetrieveLog task`, () => {
      cy.get("bridge-form")
        .children("input")
        .clear()
        .type(`e2e RetrieveLog`);
      cy.get("bridge-task-list-filter .ok button").click();
      cy.wait(500);
      cy.request("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=e2e RetrieveLog`).then(({ body }) => {
        if (body.items.length > 0) {
          cy.wait(500);
          const element = body.items[0];
          let createDate = generatorDate(element.createdAt);
          let lastModified = generatorDate(element.updatedAt);
          const strCreateBy = `${createDate} | Created by ${element.createdBy}`;
          const strModified = `${lastModified} | Modified by ${element.updatedBy}`;
          cy.get(`bridge-task-table[data-test='task-table'] > mat-accordion > mat-expansion-panel:eq(0) > mat-expansion-panel-header`)
            .click({ force: true })
            .then(($el) => {
              cy.wait(500);
              cy.wrap($el)
                .parents("mat-expansion-panel")
                .then(($el) => {
                  // Accordion deployment status check (deployment)
                  cy.wrap($el)
                    .find(".ng-trigger-bodyExpansion")
                    .should("have.css", "visibility", "visible")
                    .then(($el) => {
                      cy.wait(500);
                      // Task item check (Created, Last Modified, Related Task, Packages, Target Devices)
                      cy.wrap($el)
                        .find(`ul.items > li:eq(0) span[data-test="created-by"]`)
                        .should("have.text", strCreateBy);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(1) span[data-test="last-modified"]`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", strModified);

                      cy.wrap($el)
                        .find(`ul.items > li:eq(4) span[data-test="log-type"]`)
                        .should("have.text", element.logTask.logType);

                      cy.wrap($el)
                        .find(`ul.items > li:eq(5) span[data-test="log-memo"]`)
                        .should("have.text", element.logTask.memo);

                      // Target Devices
                      const { logTaskAssets } = element;
                      if (logTaskAssets.length > 0) {
                        cy.wrap($el)
                          .find(`bridge-table[data-test="task-log-assets-table"]`)
                          .should("have.visible");
                      } else {
                        cy.wrap($el)
                          .find(`bridge-table[data-test="task-log-assets-table"]`)
                          .should("not.have.visible");
                      }
                      cy.wrap($el)
                        .find(`bridge-table[data-test="task-log-assets-table"] table tbody tr`)
                        .each(($tr, index) => {
                          const assets = logTaskAssets[index];
                          cy.wrap($tr)
                            .find("td")
                            .each(($td, index) => {
                              cy.wrap($td)
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("contains", assets[keysAsset[index]] || "");
                            });
                        });
                      // Check the number of Target Devices
                      cy.wrap($el)
                        .find(`bridge-table[data-test="task-log-assets-table"] table tbody tr`)
                        .its("length")
                        .should("eq", logTaskAssets.length);
                      // Check the paging display of Target Devices
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-log-assets-table-pagination"] .description`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", `1 to ${Math.min(logTaskAssets.length, 10)} of ${logTaskAssets.length} items`);
                      cy.wrap($el)
                        .find(`bridge-pagination[data-test="task-log-assets-table-pagination"] .pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(logTaskAssets.length / 10) + 2));
                    });
                });
            });
        }
      });
    });

    it(`Click the Down Arrow expansion button in the Reboot task`, () => {
      cy.get("bridge-form")
        .children("input")
        .clear()
        .type(`e2e Reboot`);
      cy.get("bridge-task-list-filter .ok button").click();
      cy.wait(500);
      cy.request("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=e2e Reboot`).then(({ body }) => {
        if (body.items.length > 0) {
          cy.wait(500);
          const element = body.items[0];

          let createDate = generatorDate(element.createdAt);
          let lastModified = generatorDate(element.updatedAt);
          const strCreateBy = `${createDate} | Created by ${element.createdBy}`;
          const strModified = `${lastModified} | Modified by ${element.updatedBy}`;
          cy.get(`bridge-task-table[data-test='task-table'] > mat-accordion > mat-expansion-panel:eq(0) > mat-expansion-panel-header`)
            .click({ force: true })
            .then(($el) => {
              cy.wait(500);
              cy.wrap($el)
                .parents("mat-expansion-panel")
                .then(($el) => {
                  // Accordion deployment status check (deployment)
                  cy.wrap($el)
                    .find(".ng-trigger-bodyExpansion")
                    .should("have.css", "visibility", "visible")
                    .then(($el) => {
                      cy.wait(500);
                      // Task item check(Created、Last Modified、Target Devices、Memo)
                      cy.wrap($el)
                        .find(`ul.items > li:eq(0) span[data-test="created-by"]`)
                        .should("have.text", strCreateBy);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(1) span[data-test="last-modified"]`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", strModified);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(4) span`)
                        .last()
                        .should("have.text", element.rebootTask.memo);
                      // Target Devices
                      const { rebootTaskAssets } = element;
                      if (rebootTaskAssets.length > 0) {
                        cy.wrap($el)
                          .find(`bridge-table`)
                          .should("have.visible");
                      } else {
                        cy.wrap($el)
                          .find(`bridge-table`)
                          .should("not.have.visible");
                      }
                      cy.wrap($el)
                        .find(`bridge-table table tbody tr`)
                        .each(($tr, index) => {
                          const assets = rebootTaskAssets[index];
                          cy.wrap($tr)
                            .find("td")
                            .each(($td, index) => {
                              cy.wrap($td)
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("contains", assets[keysAsset[index]] || "");
                            });
                        });
                      // Check the number of Target Devices
                      cy.wrap($el)
                        .find(`bridge-table table tbody tr`)
                        .its("length")
                        .should("eq", rebootTaskAssets.length);
                      // Check the paging display of Target Devices
                      cy.wrap($el)
                        .find(`bridge-pagination .description`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", `1 to ${Math.min(rebootTaskAssets.length, 10)} of ${rebootTaskAssets.length} items`);
                      cy.wrap($el)
                        .find(`bridge-pagination .pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(rebootTaskAssets.length / 10) + 2));
                    });
                });
            });
        }
      });
    });

    it(`Click the Down Arrow expansion button in the SelfTest task`, () => {
      cy.get("bridge-form")
        .children("input")
        .clear()
        .type(`e2e SelfTest`);
      cy.get("bridge-task-list-filter .ok button").click();
      cy.wait(500);
      cy.request("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=e2e SelfTest`).then(({ body }) => {
        if (body.items.length > 0) {
          cy.wait(500);
          const element = body.items[0];
          let createDate = generatorDate(element.createdAt);
          let lastModified = generatorDate(element.updatedAt);
          const strCreateBy = `${createDate} | Created by ${element.createdBy}`;
          const strModified = `${lastModified} | Modified by ${element.updatedBy}`;
          cy.get(`bridge-task-table[data-test='task-table'] > mat-accordion > mat-expansion-panel:eq(0) > mat-expansion-panel-header`)
            .click({ force: true })
            .then(($el) => {
              cy.wait(500);
              cy.wrap($el)
                .parents("mat-expansion-panel")
                .then(($el) => {
                  // Accordion deployment status check (deployment)
                  cy.wrap($el)
                    .find(".ng-trigger-bodyExpansion")
                    .should("have.css", "visibility", "visible")
                    .then(($el) => {
                      cy.wait(500);
                      // Task item check (Created、Last Modified、Target Devices、Memo)
                      cy.wrap($el)
                        .find(`ul.items > li:eq(0) span[data-test="created-by"]`)
                        .should("have.text", strCreateBy);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(1) span[data-test="last-modified"]`)
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", strModified);
                      cy.wrap($el)
                        .find(`ul.items > li:eq(4) span`)
                        .last()
                        .should("have.text", element.selfTestTask.memo);
                      // Target Devices
                      const { selfTestTaskAssets } = element;
                      if (selfTestTaskAssets.length > 0) {
                        cy.wrap($el)
                          .find(`bridge-table`)
                          .should("have.visible");
                      } else {
                        cy.wrap($el)
                          .find(`bridge-table`)
                          .should("not.have.visible");
                      }
                      cy.wrap($el)
                        .find(`bridge-table table tbody tr`)
                        .each(($tr, index) => {
                          const assets = selfTestTaskAssets[index];
                          cy.wrap($tr)
                            .find("td")
                            .each(($td, index) => {
                              cy.wrap($td)
                                .invoke("text")
                                .then((t) => t.trim())
                                .should("contains", assets[keysAsset[index]] || "");
                            });
                        });
                      // Check the number of Target Devices
                      cy.wrap($el)
                        .find(`bridge-table table tbody tr`)
                        .its("length")
                        .should("eq", selfTestTaskAssets.length);
                      // Check the paging display of Target Devices
                      cy.wrap($el)
                        .find(`bridge-pagination .description`)
                        .invoke("text")
                        .then((text) => text.trim())
                        .should("eq", `1 to ${Math.min(selfTestTaskAssets.length, 10)} of ${selfTestTaskAssets.length} items`);
                      cy.wrap($el)
                        .find(`bridge-pagination .pagination button`)
                        .its("length")
                        .should("eq", Math.min(10, Math.ceil(selfTestTaskAssets.length / 10) + 2));
                    });
                });
            });
        }
      });
    });

    it("Click the Up Arrow expansion button", () => {
      cy.get(`bridge-task-table[data-test='task-table'] > mat-accordion > mat-expansion-panel[ng-reflect-expanded="true"]`).within(
        ($el) => {
          cy.wrap($el)
            .find("mat-expansion-panel-header")
            .click({ force: true })
            .then(($el) => {
              // Accordion deployment status check (deployment)
              cy.wrap($el)
                .parent()
                .find(".ng-trigger-bodyExpansion")
                .should("have.css", "visibility", "hidden");
            });
        },
      );
    });
  });

  context("Link operations", () => {
    const typeLinkButton = [
      {
        taskType: "Install",
        linkButton: "downloadpackage",
        relatedTaskType: "DownloadPackage",
      },
      {
        taskType: "DownloadPackage",
        linkButton: "install",
        relatedTaskType: "Install",
      },
    ];

    beforeEach(() => {
      cy.server()
        .route("POST", `${Cypress.env("apiTasksStatus")}`)
        .as("apiTasksStatus");
      cy.server()
        .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0`)
        .as("DataTaskList");
      cy.visit(Cypress.env("tasks")).wait(["@apiTasksStatus", "@DataTaskList"]);
      cy.get("bridge-form")
        .children("input")
        .clear();
    });
    typeLinkButton.forEach(({ taskType, linkButton, relatedTaskType }) => {
      // sort ASC
      it(`Click the ${taskType} link button`, () => {
        const taskItemDevices = [];
        const packagesItems = [];
        let page = 0;
        let numberPage = 0;
        let totalCount = 0;
        cy.server()
          .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0&text=${taskType}`)
          .as("searchResult");

        cy.server()
          .route("POST", `${Cypress.env("apiTasksStatus")}`)
          .as("apiTasksStatus");

        cy.get("bridge-form")
          .children("input")
          .type(`${taskType}`);

        cy.get("bridge-task-list-filter .ok button").click();

        cy.wait(["@searchResult", "@apiTasksStatus"]).then(([res, status]) => {
          let relatedItem;
          let indexItem;
          for (let index = 0; index < res.responseBody.items.length; index++) {
            const el = res.responseBody.items[index];
            if (el.relatedTaskId !== null && el.relatedTaskType === relatedTaskType) {
              relatedItem = el;
              indexItem = index;
              break;
            }
          }
          cy.server()
            .route("GET", `${Cypress.env("apiTasks")}/${relatedItem.relatedTaskId}`)
            .as("apiTasks");

          cy.get("bridge-task-table[data-test='task-table'] > mat-accordion > mat-expansion-panel")
            .eq(indexItem)
            .click({ force: true })
            .then((res) => {
              cy.wrap(res)
                .find(`ul.items > li > button.relatedTask`)
                .click({ force: true });
            });

          cy.wait("@apiTasks").then(({ responseBody }) => {
            let listTargetDevices = linkButton === "install" ? responseBody.installTaskAssets : responseBody.downloadPackageTaskAssets;
            packagesItems.push(
              responseBody.deploymentTaskPackages[0].name,
              responseBody.deploymentTaskPackages[0].summary,
              forMatDateTime(responseBody.deploymentTaskPackages[0].date),
              "",
            );
            totalCount = listTargetDevices.length;
            numberPage = Math.ceil(totalCount / 10) + 2;
            taskItemDevices.push(
              listTargetDevices[0].status,
              listTargetDevices[0].typeId,
              listTargetDevices[0].assetId,
              listTargetDevices[0].alias,
              listTargetDevices[0].customerId,
              listTargetDevices[0].regionId,
              listTargetDevices[0].locationId,
              listTargetDevices[0].result || "",
            );
            // Task item check (Task Name, Status, Task Type, Last Modified, Created by)
            cy.get("mat-dialog-content > ul.items > li.item > span[data-test=last-modified]")
              .eq(0)
              .should("have.text", responseBody.name);

            cy.get("mat-dialog-content > ul.items > li.item > span[data-test=status]").should("have.text", responseBody.status);

            cy.get("mat-dialog-content > ul.items > li.item > span[data-test=last-modified]")
              .eq(1)
              .should("have.text", responseBody.taskType);

            cy.get("mat-dialog-content > ul.items > li.item > span[data-test=last-modified]")
              .eq(2)
              .should("have.text", generatorDate(responseBody.updatedAt));

            cy.get("mat-dialog-content > ul.items > li.item > span[data-test=created-by]").should("have.text", responseBody.createdBy);

            // Package items check (Name, Summary, Date)
            cy.get("mat-dialog-content > ul.items > li.item > div[data-test=packages] > bridge-package-table")
              .find("mat-expansion-panel-header > span.mat-content")
              .children()
              .each((el, i) => {
                expect(el).to.contain(packagesItems[i]);
              });

            // Check the number of Packages
            cy.get("mat-dialog-content > ul.items > li.item > div[data-test=packages] > bridge-pagination").within((el) => {
              cy.wrap(el)
                .get("div.root > nav > button")
                .its("length")
                .should("be.eq", 3);
            });

            // Checking the paging display of Packages
            cy.get("mat-dialog-content > ul.items > li.item > div[data-test=packages] > bridge-pagination")
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", "1 to 1 of 1 items");

            // Target Devices item check (Status, Model, Serial, Name, Organization, Region, Location, Result)
            cy.get("mat-dialog-content > ul.items > li.item > div[data-test=targets] > bridge-table > table > tbody > tr > td").each(
              (dataDevices, i) => {
                expect(dataDevices).to.contain(taskItemDevices[i]);
              },
            );

            // Paging display check
            cy.get("mat-dialog-content > ul.items > li.item > div[data-test=targets] > bridge-pagination").within((el) => {
              cy.wrap(el)
                .get("div.root > nav > button")
                .its("length")
                .invoke("toString")
                .should("be.eq", `${Math.min(numberPage, 13)}`);
            });

            //  Check the number of Target Devices
            cy.get(
              "mat-dialog-content > ul.items > li.item > div[data-test=targets] > bridge-pagination[data-test='task-asset-table-pagination']",
            )
              .find("span.description")
              .invoke("text")
              .then((text) => text.trim())
              .should("eq", `${page * 10 + 1} to ${Math.min((page + 1) * 10, totalCount)} of ${totalCount} items`);
          });
        });
      });
    });
  });

  context("Paging operations", () => {
    before(() => {
      cy.server()
        .route("POST", `${Cypress.env("apiTasksStatus")}`)
        .as("apiTasksStatus")
        .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0`)
        .as("DataTaskList");
      cy.visit(Cypress.env("tasks")).wait(["@apiTasksStatus", "@DataTaskList"]);
    });
    const handleClickPage = [
      {
        action: "page 2",
        alias: "page2",
      },
      {
        action: ">",
        alias: "pageNext",
      },
      {
        action: "<",
        alias: "pagePrevious",
      },
    ];

    handleClickPage.forEach(({ action, alias }) => {
      page = 0;
      it(`Click the ${action} button`, () => {
        cy.request("GET", `${Cypress.env("apiTasks")}?limit=10&offset=0`).then((res) => {
          cy.wait(500);
          totalCount = res.body.totalCount;
          numberPage = Math.ceil(totalCount / 10) + 2;
          if (numberPage > 3) {
            cy.get("bridge-task-table")
              .next("bridge-pagination[data-test='task-pagination']")
              .within(() => {
                cy.root().scrollIntoView();
                if (`${action}` === "page 2") {
                  cy.server()
                    .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=10`)
                    .as(`${alias}`);
                  cy.get("div.root > nav > button")
                    .eq(2)
                    .click();
                  page++;
                } else if (`${action}` === ">") {
                  cy.server()
                    .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=20`)
                    .as(`${alias}`);
                  cy.get("div.root > nav > button")
                    .last()
                    .click();
                  page++;
                } else if (`${action}` === "<") {
                  cy.server()
                    .route("GET", `${Cypress.env("apiTasks")}?limit=10&offset=10`)
                    .as(`${alias}`);
                  cy.get("div.root > nav > button")
                    .first()
                    .click();
                  page--;
                }
                const currentOffsetStart = page * 10 + 1;
                const currentOffsetEnd = Math.min((page + 1) * 10, totalCount);
                // Check the number of search results
                cy.get("span.description")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", `${currentOffsetStart} to ${currentOffsetEnd} of ${totalCount} items`);
              });
          }
        });
        // Item check of search results (Status, Name, TaskType,
        //  ExecutionSchedule, ExecutionStart, ExecutionFinish, Actions)
        cy.wait(`@${alias}`).then(({ responseBody }) => {
          let resData = responseBody.items;
          cy.get("bridge-task-table")
            .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header > .mat-content")
            .first()
            .children()
            .within((res) => {
              cy.get(res[0]).should("have.text", `${resData[0].status}`);
              if (resData[0].taskType === "downloadpackage" || resData[0].taskType === "install") {
                cy.get(res[1])
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("equal", `${resData[0].name}`);
              } else if (resData[0].taskType === "reboot") {
                cy.get(res[1])
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("equal", ("Reboot " + `${resData[0].rebootTask.memo}`).trim());
              } else if (resData[0].taskType === "selftest") {
                cy.get(res[1])
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("equal", ("Self test " + `${resData[0].selfTestTask.memo}`).trim());
              } else if (resData[0].taskType === "retrievelog") {
                cy.get(res[1]).should("have.text", " " + `${resData[0].logTask.logType}` + " " + `${resData[0].logTask.memo}` + " ");
              }
              cy.get(res[2]).should("have.text", convertText(`${resData[0].taskType}`));
              cy.get(res[3]).should("have.text", generatorDate(`${resData[0].startedAt}`));
              cy.get(res[4]).should("have.text", generatorDate(`${resData[0].executionStartedAt}`));
              cy.get(res[5]).should("have.text", generatorDate(`${resData[0].executionFinishedAt}`));
              if (resData[0].status === "scheduled") {
                cy.get(res[6])
                  .children("a")
                  .eq(0)
                  .children("span")
                  .should("have.class", "edit");
                cy.get(res[6])
                  .children("a")
                  .eq(1)
                  .children("span")
                  .should("have.class", "delete");
              } else {
                cy.get(res[6]).should("not.have.class", "edit");
                cy.get(res[6]).should("not.have.class", "delete");
              }
            });
        });

        //  Accordion deployment status check (undeployed)
        cy.get("bridge-task-table")
          .find("mat-expansion-panel[data-test='task-row'] > mat-expansion-panel-header")
          .next(".mat-expansion-panel-content")
          .should("not.exist");
      });
    });
  });
});
