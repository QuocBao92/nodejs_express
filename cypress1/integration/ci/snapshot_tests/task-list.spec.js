Cypress.Commands.add("hide", { prevSubject: "element" }, (subject) => {
  subject.css("visibility", "hidden");
});
describe("Snapshot-testing: Task List", () => {
  const viewports = [
    { x: 1600, y: 1000, target: "PC" },
    // { x: 768, y: 1024, target: "iPad (portrait)" },
    // { x: 1024, y: 768, target: "iPad (landscape)" },
    // { x: 375, y: 812, target: "iPhone X (portrait)" },
    // { x: 812, y: 375, target: "iPhone X (landscape)" },
    // { x: 414, y: 736, target: "iPhone 8 (portrait)" },
    // { x: 736, y: 414, target: "iPhone 8 (landscape)" },
  ];

  const fixtures = ["sample", "long", "empty"];
  const statusfixtures = ["scheduled", "inprogress", "failure", "complete"];
  const searchFilter = {
    keyword: "DownloadPackage",
  };
  const apiParams = {
    tasksRelated: {
      taskId: "5ef63584-9fa1-4d94-b83e-cba4d01434d6",
    },
  };
  let inputDate = new Date();
  inputDate.setDate(inputDate.getDate() + 1);
  const check = Cypress.moment.utc(inputDate);
  const date = (check.isValid() && check.format("MM/D/YYYY, h:mm:ss A")) || "";
  viewports.forEach((viewport) => {
    context(`Device: ${viewport.target}`, () => {
      fixtures.forEach((fixture) => {
        it(`Case: ${fixture} data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route("GET", `${Cypress.env("apiTasks")}*`, `fx:tasks/tasks/${fixture}`)
            .as("getTasks")
            .route("POST", `${Cypress.env("apiTasksStatus")}*`, `fx:tasks/status/sample`)
            .as("postTasksStatus")
            .route("GET", `${Cypress.env("apiTypes")}*`, `fx:tasks/types/sample`)
            .as("getTasksType")
            .route(
              "GET",
              `${Cypress.env("apiTasksRelatedRL").replace("${1}", apiParams.tasksRelated.taskId)}*`,
              `fx:tasks/related/complete.${fixture}`,
            )
            .as("getTasksRelated");
          cy.visit(Cypress.env("tasks")).wait(["@getTasks", "@getTasksType", "@postTasksStatus"], { requestTimeout: 10000 });
          cy.wait(1000);
          // input Keyword
          cy.get("bridge-task-list-filter")
            .find("bridge-form input")
            .type(searchFilter.keyword);
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
                      .click(0, 0);
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
                cy.get(`.mat-option:eq(1)`)
                  .click()
                  .then(() => {
                    cy.wait(500);
                    cy.root()
                      .parents("body")
                      .click(0, 0);
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
                cy.get(`mat-option:eq(1)`)
                  .click()
                  .then(() => {
                    cy.wait(500);
                    cy.root()
                      .parents("body")
                      .click(0, 0);
                  });
              });
            });
          cy.wait(500);
          // select schedule start date
          cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
            .first()
            .focus()
            .type(date);
          cy.wait(500);
          // select schedule end date
          cy.get("bridge-range-date-time-picker mat-form-field .mat-form-field-infix input")
            .last()
            .focus()
            .type(date);
          cy.wait(500);
          cy.get("body").toMatchImageSnapshot();
          cy.get("bridge-header").hide();

          if (fixture !== "empty") {
            cy.get("[data-test=task-row]")
              .eq(0)
              .click();
            cy.wait(500);
            cy.get("[data-test=task-row]")
              .eq(1)
              .click();
            cy.wait(500);
            cy.get("[data-test=task-row]")
              .eq(5)
              .click();
            cy.wait(500);
            cy.get("[data-test=task-row]")
              .eq(6)
              .click();
            cy.wait(500);
            cy.get("[data-test=task-row]")
              .eq(7)
              .click();
            cy.wait(500);
            cy.get("[data-test=task-row]")
              .eq(9)
              .click();
            cy.wait(500);
            cy.get("body").toMatchImageSnapshot();

            cy.get("[data-test=relatedTask-modal]")
              .eq(0)
              .click();
            cy.wait(1000);
            cy.get("bridge-modal").toMatchImageSnapshot();

            cy.get("bridge-button > button")
              .contains("×")
              .click();
            cy.wait(500);
            cy.get("[data-test=delete-action]")
              .eq(0)
              .click({ force: true });
            cy.wait(500);
            cy.get("bridge-alert").toMatchImageSnapshot();
          }
        });
      });

      statusfixtures.forEach((fixture) => {
        it(`Case: ${fixture} status data`, () => {
          cy.viewport(viewport.x, viewport.y);
          cy.server()
            .route("GET", `${Cypress.env("apiTasks")}*`, `fx:tasks/tasks/sample`)
            .as("getTasks")
            .route("POST", `${Cypress.env("apiTasksStatus")}*`, `fx:tasks/status/sample`)
            .as("postTasksStatus")
            .route(
              "GET",
              `${Cypress.env("apiTasksRelatedRL").replace("${1}", apiParams.tasksRelated.taskId)}*`,
              `fx:tasks/related/${fixture}`,
            )
            .as("getTasksRelated");
          cy.visit(Cypress.env("tasks")).wait(["@getTasks", "@postTasksStatus"], { requestTimeout: 10000 });
          cy.wait(1000);
          cy.get("[data-test=task-row]")
            .eq(0)
            .click();
          cy.wait(500);
          cy.get("[data-test=relatedTask-modal]")
            .eq(0)
            .click();
          cy.wait(1000);
          cy.get("bridge-modal").toMatchImageSnapshot();
        });
      });
    });
  });
});
