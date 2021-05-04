import moment = require("moment");

describe("Story-Orders", () => {
  interface OrderItem {
    status: string;
    isAutomated: boolean | string;
    orderNumber: string;
    placeDate: string;
    serviceDate: string;
    citName: string;
    citCutOffTime: string;
    companyName: string;
    locationName: string;
    orderValue: string;
    currencyCode: string;
    isEmergency: boolean;
  }

  interface Company {
    id: number;
    name: string;
    locations: Array<{
      id: number;
      name: string;
    }>;
  }

  interface CIT {
    id: string;
    status: string;
    name: string;
    country: string;
    isEditable?: boolean;
    totalLocationCount?: number;
    isDeletable?: boolean;
  }

  interface GetFilterItems {
    orderStatuses: string[];
    companies: Company[];
    cits: CIT[];
  }

  interface GetOrdersRes {
    sortField: SortField;
    orders: OrderItem[];
  }

  interface SortField {
    column: string;
    orderBy: string;
  }

  const capitalizeFirstLetter = (name: string) => {
    return name[0].toUpperCase() + name.slice(1);
  };

  let getOrdersRes: GetOrdersRes;
  let orders: OrderItem[] = [];

  const startDate = Cypress.moment("2021/1/18");
  const startYearSelect = startDate.format("YYYY");
  const startMonthSelect = startDate.format("MMM").toUpperCase();
  const startMonthNumber = startDate.format("M");
  const startMonthNumberParam = startDate.format("MM");
  const startDaySelect = startDate.format("D");

  const endDate = startDate.clone().add(2, "days");
  const endYearSelect = endDate.format("YYYY");
  const endMonthSelect = endDate.format("MMM").toUpperCase();
  const endMonthNumber = endDate.format("M");
  const endMonthNumberParam = endDate.format("MM");
  const endDaySelect = endDate.format("D");

  const upImg = "assets/img/icons/long-arrow-alt-up-solid.svg";
  const downImg = "assets/img/icons/long-arrow-alt-down-solid.svg";
  const defaultImg = "assets/img/icons/arrows-alt-v-solid.svg";

  const tableColumns = [
    {
      name: "Status",
      value: "status",
    },
    {
      name: "Type",
      value: "type",
    },
    {
      name: "Order number",
      value: "orderNumber",
    },
    {
      name: "Place date",
      value: "placeDate",
    },
    {
      name: "Service date",
      value: "serviceDate",
    },
    {
      name: "CIT",
      value: "cit",
    },
    {
      name: "Cut off time",
      value: "cutOffTime",
    },
    {
      name: "Organisation",
      value: "company",
    },
    {
      name: "Location",
      value: "location",
    },
    {
      name: "Order value",
      value: "orderValue",
    },
  ];

  const headerLabels = [
    "Status",
    "Type",
    "Order number",
    "Place date",
    "Service date",
    "CIT",
    "Cut off time",
    "Organisation",
    "Location",
    "Order value",
  ];

  context("list of order page", () => {
    before(() => {
      cy.server()
        .route("GET", Cypress.env("host") + Cypress.env("apiViewOrders"))
        .as("apiViewOrders");
      cy.visit(Cypress.env("pageOrders"))
        .wait("@apiViewOrders")
        .then(({ responseBody }) => {
          getOrdersRes = responseBody as GetOrdersRes;
          if (Array.isArray(getOrdersRes.orders)) {
            orders = getOrdersRes.orders;
          }
        });
    });

    context("initial display", () => {
      it("page title should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title").should("be.visible").contains("Order");
        });
      });

      it("order list table header should be displayed", () => {
        const listHeaders = [
          "Status",
          "Type",
          "Order number",
          "Place date",
          "Service date",
          "CIT",
          "Cut off time",
          "Organisation",
          "Location",
          "Order value",
          "Actions",
        ];

        cy.get("[data-test=order-list-table] table")
          .should("be.visible")
          .within(() => {
            cy.get("th").each(($th, i) => {
              expect($th).to.contain(listHeaders[i]);
            });
          });
      });

      it("order list table should displayed all data", () => {
        if (orders.length) {
          cy.get(".page-content").within(() => {
            cy.get("imo-table tbody").within(() => {
              cy.get("tr").each(($tr, index) => {
                cy.wrap($tr)
                  .find("td:nth-child(1)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(orders[index].status);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(2)")
                  .should(($td) => {
                    const isAutomated = orders[index].isAutomated;
                    if (isAutomated) {
                      expect($td.text().trim()).to.be.eq("Automatic");
                    } else {
                      expect($td.text().trim()).to.be.eq("Manual");
                    }
                  });

                cy.wrap($tr)
                  .find("td:nth-child(3)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(orders[index].orderNumber);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(4)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(
                      (orders[index].placeDate = moment(new Date(orders[index].placeDate)).format("MM/DD/YYYY")),
                    );
                  });

                cy.wrap($tr)
                  .find("td:nth-child(5)")
                  .should(($td) => {
                    const serviceDate = moment(new Date(orders[index].serviceDate)).format("MM/DD/YYYY");
                    const isEmergency = orders[index].isEmergency ? " Emergency" : "";
                    expect($td.text().trim()).to.be.eq(serviceDate + isEmergency);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(6)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(orders[index].citName);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(7)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(orders[index].citCutOffTime);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(8)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(orders[index].companyName);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(9)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq(orders[index].locationName);
                  });

                cy.wrap($tr)
                  .find("td:nth-child(10)")
                  .should(($td) => {
                    if (!Cypress._.toNumber(orders[index].orderValue)) {
                      expect($td.text().trim()).to.contain("0.00");
                    } else if (Cypress._.toNumber(orders[index].orderValue) > 999) {
                      expect($td.text().trim()).to.contain(",");
                      expect($td.text().trim()).to.contain(".");
                    } else {
                      expect($td.text().trim()).not.to.contain(",");
                      expect($td.text().trim()).to.contain(".");
                    }
                  });

                cy.wrap($tr)
                  .find("td:nth-child(11)")
                  .should(($td) => {
                    expect($td.text().trim()).to.be.eq("Edit");
                  });
              });
            });
          });
        } else {
          cy.log("No data to display");
        }
      });

      it("should display Create Order button", () => {
        cy.get(".page-content").within(() => {
          cy.root().find("a").contains("Create Order").should("be.visible");
        });
      });

      it("should display arrow back button", () => {
        cy.get("imo-order-list-page").within(() => {
          cy.root().find(".page-content .page-header .mat-icon").should("be.visible");
        });
      });

      it("should display order filters", () => {
        cy.get("[data-test=table-filter]").within(() => {
          // confirm label, input and placeholder
          // Status
          cy.get("label").contains("Status");
          cy.get("imo-select-multi mat-select").should("be.visible").and("have.attr", "aria-label", "Select Status");

          // Order number
          cy.get("label").contains("Order Number");
          cy.get("input").should("be.visible").and("have.attr", "placeholder", "Search by Number");

          // CIT
          cy.get("label").contains("CIT");
          cy.get("imo-select [data-test=show-placeholder]").eq(0).should("be.visible").and("have.text", "Select CIT");

          // Organisation
          cy.get("label").contains("CIT");
          cy.get("imo-select [data-test=show-placeholder]").eq(1).should("be.visible").and("have.text", "Select Organisation");

          // Organisation
          cy.get("label").contains("Location");
          cy.get("imo-select [data-test=show-placeholder]").eq(2).should("be.visible").and("have.text", "Select Location");

          // Placed date
          cy.get("label").contains("Placed date");
          cy.get(".date-range-input imo-date-picker input")
            .eq(0)
            .should("be.visible")
            .and("have.attr", "ng-reflect-placeholder", "Select date");
          cy.get(".date-range-input imo-date-picker input")
            .eq(1)
            .should("be.visible")
            .and("have.attr", "ng-reflect-placeholder", "Select date");

          // Service date
          cy.get("label").contains("Service date");
          cy.get(".date-range-input imo-date-picker input")
            .eq(2)
            .should("be.visible")
            .and("have.attr", "ng-reflect-placeholder", "Select date");
          cy.get(".date-range-input imo-date-picker input")
            .eq(3)
            .should("be.visible")
            .and("have.attr", "ng-reflect-placeholder", "Select date");

          // Display only Emergency
          cy.get("[data-test=filter-item]").within(() => {
            cy.get("mat-checkbox .label").contains("Display only Emergency").should("be.visible");
            cy.get("mat-checkbox input[type=checkbox]").should("be.visible").and("not.be.checked");
          });

          // confirm button
          // Clear button
          cy.get("[data-test=clear-button]").should("be.visible").and("not.be.disabled");

          // Apply button
          cy.get("[data-test=apply-button]").should("be.visible").and("not.be.disabled");
        });
      });

      it("should display default sort", () => {
        const column = Cypress._.find(tableColumns, { value: getOrdersRes.sortField.column });
        if (column) {
          // Sort
          cy.get(`imo-table table thead tr th`).within(($el) => {
            cy.wrap($el)
              .contains(column.name)
              .then(($el) => {
                cy.wrap($el)
                  .find("imo-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", getOrdersRes.sortField.orderBy === "asc" ? upImg : downImg);
              });
          });

          // check data
          headerLabels.forEach((value, index) => {
            switch (value) {
              case "Place date":
                cy.get("imo-table table")
                  .find(`tbody tr:eq(0) td:eq(${index})`)
                  .invoke("text")
                  .then((date) => date.trim())
                  .should("equal", moment(orders[0].placeDate).format("MM/DD/YYYY"));
                break;
              case "Order number":
                cy.get("imo-table table")
                  .find(`tbody tr:eq(0) td:eq(${index})`)
                  .invoke("text")
                  .then((orderNumber) => orderNumber.trim())
                  .should("equal", orders[0].orderNumber);
                break;
            }
          });
        }
      });
    });

    context("filter", () => {
      it("by status", () => {
        const statuses: string[] = ["ALL"];
        cy.request(`${Cypress.env("host") + Cypress.env("apiOrdersFilterItems")}`).then((res) => {
          (res.body.orderStatuses as string[]).forEach((status: string) => {
            statuses.push(status);
          });

          statuses.forEach((status, index) => {
            cy.get("[data-test=filter-item]")
              .eq(0)
              .within(() => {
                cy.get("mat-select")
                  .click({ force: true })
                  .parents("body")
                  .find(".mat-select-panel-wrap")
                  .within(() => {
                    cy.get("mat-option")
                      .should("have.length", statuses.length)
                      .contains(capitalizeFirstLetter(status))
                      .click({ force: true });
                    cy.root().parents("body").type("{esc}");
                  });

                if (index == 0) {
                  // confirm value when select all
                  cy.get("mat-select-trigger").should(($input) => {
                    expect($input.text().trim()).to.be.include("Created");
                  });

                  cy.get("mat-select-trigger span").should(($input) => {
                    expect($input.text().trim()).to.be.include("(+1 other)");
                  });
                } else {
                  // confirm value when select
                  cy.get("mat-select-trigger").should(($input) => {
                    expect($input.text().trim()).to.be.include(capitalizeFirstLetter(status));
                  });
                }
              });

            // Apply button
            cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });

            // confirm request
            const statusReq = status === "ALL" ? `requested,created` : status.toLowerCase();
            const requested = "requested";
            const created = "created";
            cy.request(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?status=${statusReq}`).then((res) => {
              if (!!res.body?.orders?.length) {
                cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
                res.body.orders.forEach((order: OrderItem) => {
                  if (order.status === requested) {
                    expect(order.status).to.include(requested);
                  } else {
                    expect(order.status).to.include(created);
                  }
                });
              } else {
                cy.log("No data to display");
              }
            });

            // Clear button
            cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
          });
        });
      });

      it("by order Number", () => {
        const input = "1";
        cy.get("[data-test=table-filter]").within(() => {
          // input value
          cy.get("input")
            .eq(0)
            .type("{selectall}{backspace}")
            .type(input)
            .should(($Input) => {
              expect($Input.val()).to.be.eq(input);
            });
        });

        // Apply button
        cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });

        // confirm request
        cy.request(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?orderNumber=${input}`).then((res) => {
          if (!!res.body?.orders?.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
            res.body.orders.forEach((order: OrderItem) => {
              expect(order.orderNumber).to.include(input);
            });
          } else {
            cy.log("No data to display");
          }
        });

        // Clear button
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
        cy.get("[data-test=table-filter]").within(() => {
          // confirm value
          cy.get("input").should(($Input) => {
            expect($Input.val()).to.be.eq("");
          });
        });
      });

      it("by CIT", () => {
        const cits: string[] = [];
        const ids: string[] = [];
        cy.request(`${Cypress.env("host") + Cypress.env("apiOrdersFilterItems")}`).then((res) => {
          if (res.body.cits && res.body.cits.length) {
            res.body.cits.forEach((cit: CIT) => {
              cits.push(cit.name);
              ids.push(cit.id);
            });

            cits.forEach((cit: string, index: number) => {
              cy.get("[data-test=filter-item]")
                .eq(2)
                .within(() => {
                  cy.get("mat-select")
                    .click({ force: true })
                    .parents("body")
                    .find(`.mat-select-panel-wrap mat-option:eq(${index + 1})`)
                    .click()
                    .then(($option) => {
                      const text = $option.text().trim();
                      cy.get("mat-select").should("have.text", text);
                      cy.wrap(cit).should("be.eq", text);
                    });
                });

              // Apply button
              cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });

              // confirm request
              cy.request(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?citId=${ids[index]}`).then((res) => {
                if (!!res.body?.orders?.length) {
                  cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
                  res.body.orders.forEach((order: OrderItem) => {
                    expect(order.citName).to.include(cit);
                  });
                } else {
                  cy.log("No data to display");
                }
              });

              // Clear button
              cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
            });
          }
        });
      });

      it("by organisation and location", () => {
        // confirm location disable select before select organisation
        cy.get("[data-test=filter-item]")
          .eq(4)
          .within(() => {
            cy.get("mat-select").should("have.attr", "aria-disabled", "true");
          });

        let companies: string[] = [];
        let locations: string[] = [];

        cy.request(`${Cypress.env("host") + Cypress.env("apiOrdersFilterItems")}`).then((res) => {
          if (res.body.companies && res.body.companies.length) {
            companies = res.body.companies.map((cit: CIT) => cit.name);

            companies.forEach((comp: string, index: number) => {
              cy.get("[data-test=filter-item]")
                .eq(3)
                .within(() => {
                  cy.get("mat-select")
                    .click({ force: true })
                    .parents("body")
                    .find(`.mat-select-panel-wrap mat-option:eq(${index + 1})`)
                    .click()
                    .then(($option) => {
                      const text = $option.text().trim();
                      cy.get("mat-select").should("have.text", text);
                      cy.wrap(comp).should("be.eq", text);

                      const company = Cypress._.find(res.body.companies as Company[], { name: comp });
                      if (company) {
                        locations = company.locations.map((location) => location.name);
                        if (locations.length) {
                          locations.forEach((location: string, index: number) => {
                            cy.root()
                              .parents("[data-test=table-filter]")
                              .find("[data-test=filter-item]")
                              .eq(4)
                              .within(() => {
                                // confirm location enable select after select organisation
                                cy.get("mat-select")
                                  .should("have.attr", "aria-disabled", "false")
                                  .click({ force: true })
                                  .parents("body")
                                  .find(`.mat-select-panel-wrap mat-option:eq(${index + 1})`)
                                  .click()
                                  .then(($option) => {
                                    const loc = $option.text().trim();
                                    cy.get("mat-select").should("have.text", loc);
                                    cy.wrap(location).should("be.eq", loc);
                                  });
                              });
                          });
                        }
                      }
                    });
                });
            });
          }
          // Apply button
          cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });
          const company = res.body.companies[res.body.companies.length - 1];
          const location = company.locations[company.locations.length - 1];
          // confirm request
          cy.request(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?companyId=${company.id}&locationId=${location.id}`).then(
            (res) => {
              if (!!res.body?.orders?.length) {
                cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
                res.body.orders.forEach((order: OrderItem) => {
                  expect(order.companyName).to.include(companies[companies.length - 1]);
                  expect(order.locationName).to.include(locations[locations.length - 1]);
                });
              } else {
                cy.log("No data to display");
              }
            },
          );

          // Clear button
          cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
        });
      });

      it("by Placed Date", () => {
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
        const startDateParam = `${startYearSelect}-${startMonthNumberParam}-${startDate.clone().add(4, "days").format("DD")}`;
        const endDateParam = `${endYearSelect}-${endMonthNumberParam}-${startDate.clone().add(-1, "days").format("DD")}`;

        // select start Date: 2021/1/18
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(0).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startMonthSelect).click();

          // select day after select month and year
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startDaySelect)
            .wait(500)
            .click()
            .then(() => {
              cy.get("imo-date-picker mat-form-field input").should(($Input) => {
                expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDaySelect}/${startYearSelect}`);
              });
            });
        });

        // select end Date: 2021/1/20
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(1).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", endYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endMonthSelect).click();

          // select day after select month and year
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", endDaySelect)
            .click()
            .then(() => {
              cy.get("imo-date-picker mat-form-field input")
                .eq(1)
                .should(($Input) => {
                  expect($Input.val()).to.be.eq(`${endMonthNumber}/${endDaySelect}/${endYearSelect}`);
                });
            });
        });

        // select start Date: start Date: 2021/1/18 to 2021/1/22 greater than end Date: 2021/1/20
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(0).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startDate.clone().add(4, "days").format("D"))
            .click()
            .then(() => {
              cy.get("imo-date-picker mat-form-field input").should(($Input) => {
                // start Date: 2021/1/22
                expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDate.clone().add(4, "days").format("D")}/${startYearSelect}`);
              });

              cy.get("imo-date-picker mat-form-field input")
                .eq(1)
                .should(($Input) => {
                  // end Date: 2021/1/23
                  expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDate.clone().add(5, "days").format("D")}/${startYearSelect}`);
                });
            });
        });

        // check limit can not select end date is less than start date
        cy.get("[data-test=table-filter]").then((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(1).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startDate.clone().add(4, "days").format("D"))
            .wait(500)
            .then(() => {
              cy.get(".cdk-overlay-container mat-calendar mat-month-view table")
                .find("tbody tr:eq(3) td:eq(0)")
                .should("have.attr", "aria-disabled", "true");
            });
          cy.get(".cdk-overlay-container mat-calendar mat-month-view table").find("tbody tr:eq(3) td:eq(6)").click();
        });

        // click apply button
        cy.get("[data-test=apply-button").click();
        cy.request(
          `${Cypress.env("host") + Cypress.env("apiViewOrders")}?startPlacedDate=${startDateParam}&endPlacedDate=${endDateParam}`,
        ).then((res) => {
          if (!!res.body?.orders?.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
          } else {
            cy.log("No data to display");
          }
        });

        // click clear button
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
        cy.request(`${Cypress.env("host") + Cypress.env("apiViewOrders")}`).then((res) => {
          if (!!res.body?.orders?.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
          } else {
            cy.log("No data to display");
          }
        });
        cy.get("[data-test='table-filter'] imo-date-picker mat-form-field .mat-form-field-infix input").should(
          "have.attr",
          "placeholder",
          "Select date",
        );
      });

      it("by Service Date", () => {
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
        const startDateParam = `${startYearSelect}-${startMonthNumberParam}-${startDate.clone().add(4, "days").format("DD")}`;
        const endDateParam = `${endYearSelect}-${endMonthNumberParam}-${startDate.clone().add(-1, "days").format("DD")}`;

        // select start Date: 2021/1/18
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(2).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startMonthSelect).click();

          // select day after select month and year
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startDaySelect)
            .click()
            .then(() => {
              cy.get("imo-date-picker mat-form-field input")
                .eq(2)
                .should(($Input) => {
                  expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDaySelect}/${startYearSelect}`);
                });
            });
        });

        // select end Date: 2021/1/20
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(3).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", endYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endMonthSelect).click();

          // select day after select month and year
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", endDaySelect)
            .click()
            .then(() => {
              cy.get("imo-date-picker mat-form-field input")
                .eq(3)
                .should(($Input) => {
                  expect($Input.val()).to.be.eq(`${endMonthNumber}/${endDaySelect}/${endYearSelect}`);
                });
            });
        });

        // select start Date: start Date: 2021/1/18 to 2021/1/22 greater than end Date: 2021/1/20
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(2).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startDate.clone().add(4, "days").format("D"))
            .click()
            .then(() => {
              cy.get("imo-date-picker mat-form-field input")
                .eq(2)
                .should(($Input) => {
                  // start Date: 2021/1/22
                  expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDate.clone().add(4, "days").format("D")}/${startYearSelect}`);
                });

              cy.get("imo-date-picker mat-form-field input")
                .eq(3)
                .should(($Input) => {
                  // end Date: 2021/1/23
                  expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDate.clone().add(5, "days").format("D")}/${startYearSelect}`);
                });
            });
        });

        // check limit can not select end date is less than start date
        cy.get("[data-test=table-filter]").then((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(3).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startDate.clone().add(4, "days").format("D"))
            .then(() => {
              cy.get(".cdk-overlay-container mat-calendar mat-month-view table")
                .find("tbody tr:eq(3) td:eq(0)")
                .should("have.attr", "aria-disabled", "true");
            });
          cy.get(".cdk-overlay-container mat-calendar mat-month-view table").find("tbody tr:eq(3) td:eq(6)").click();
        });

        // click apply button
        cy.get("[data-test=apply-button").click();
        cy.request(
          `${Cypress.env("host") + Cypress.env("apiViewOrders")}?startServiceDate=${startDateParam}&endServiceDate=${endDateParam}`,
        ).then((res) => {
          if (!!res.body?.orders?.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
          } else {
            cy.log("No data to display");
          }
        });

        // click clear button
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
        cy.request(`${Cypress.env("host") + Cypress.env("apiViewOrders")}`).then((res) => {
          if (!!res.body?.orders?.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
          } else {
            cy.log("No data to display");
          }
        });
        cy.get("[data-test='table-filter'] imo-date-picker mat-form-field .mat-form-field-infix input").should(
          "have.attr",
          "placeholder",
          "Select date",
        );
      });

      it("only Emergency", () => {
        cy.get("[data-test=filter-item]").within(() => {
          cy.get("input[type=checkbox]").click({ force: true }).should("be.checked");
        });

        // Apply button
        cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });

        // confirm request
        cy.request(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?isEmergency=true`).then((res) => {
          console.log("===", res.body.orders.length);
          if (!!res.body?.orders?.length) {
            cy.get("imo-table tbody").find("tr").should("have.length", res.body.orders.length);
            res.body.orders.forEach((order: OrderItem) => {
              expect(order.isEmergency).to.be.true;
            });
          } else {
            cy.log("No data to display");
          }
        });

        // Clear button
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });
        cy.get("[data-test=filter-item]").within(() => {
          cy.get("input[type=checkbox]").should("not.be.checked");
        });
      });
    });

    context("Sorting operations", () => {
      tableColumns.forEach(({ name, value }) => {
        // sort ASC
        it(`Click ${name} to set ascending order`, () => {
          cy.get(`imo-table table thead tr th`).within(($el) => {
            cy.server()
              .route(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?sortColumn=${value}&sort=asc`)
              .as("apiSortAsc");

            cy.wrap($el)
              .contains(name)
              .click()
              .then(($el) => {
                cy.wait("@apiSortAsc").then((res) => {
                  const orderRes = res?.response.body as GetOrdersRes;
                  const body: OrderItem[] = orderRes.orders;
                  cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);

                  if (body.length) {
                    headerLabels.forEach((value, index) => {
                      switch (value) {
                        case "Status":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].status);
                          break;

                        case "Place date":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", moment(body[0].placeDate).format("MM/DD/YYYY"));
                          break;

                        case "Cut off time":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].citCutOffTime);
                          break;
                        default:
                          break;
                      }
                    });
                  }
                });
              });
          });
        });

        // sort DESC
        it(`Click ${name} to set descending order`, () => {
          cy.get(`imo-table table thead tr th`).within(($el) => {
            cy.server()
              .route(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?sortColumn=${value}&sort=desc`)
              .as("apiSortDesc");

            cy.wrap($el)
              .contains(name)
              .click()
              .then(($el) => {
                cy.wait("@apiSortDesc").then((res) => {
                  const orderRes = res?.response.body as GetOrdersRes;
                  const body: OrderItem[] = orderRes.orders;
                  cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", downImg);

                  if (body.length) {
                    headerLabels.forEach((value, index) => {
                      switch (value) {
                        case "Order number":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].orderNumber);
                          break;

                        case "CIT":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].citName);
                          break;

                        case "Organisation":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].companyName);
                          break;
                        default:
                          break;
                      }
                    });
                  }
                });
              });
          });
        });

        // sort Default
        it(`Click ${name} to set default order`, () => {
          // skip checking default sorted column
          const defaultSortedColumn = Cypress._.find(tableColumns, { value: getOrdersRes.sortField.column });

          if (name === defaultSortedColumn?.name) {
            cy.log(`Skip checking ${name} column because it is default sorted column`);
            return false;
          }

          cy.get(`imo-table table thead tr th`).within(($el) => {
            cy.server()
              .route(`${Cypress.env("host") + Cypress.env("apiViewOrders")}`)
              .as("apiViewOrders");

            cy.wrap($el)
              .contains(name)
              .click()
              .then(($el) => {
                cy.wait("@apiViewOrders").then((res) => {
                  const orderRes = res?.response.body as GetOrdersRes;
                  const body: OrderItem[] = orderRes.orders;
                  cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", defaultImg);

                  if (body.length) {
                    headerLabels.forEach((value, index) => {
                      switch (value) {
                        case "Service date":
                          const serviceDate = moment(body[0].serviceDate).format("MM/DD/YYYY");
                          const isEmergency = body[0].isEmergency ? " Emergency" : "";
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", serviceDate + isEmergency);
                          break;
                        case "Location":
                          cy.wrap($el)
                            .parents("imo-table")
                            .find(`tbody tr:eq(0) td:eq(${index})`)
                            .invoke("text")
                            .then((text) => text.trim())
                            .should("equal", body[0].locationName);
                          break;

                        default:
                          break;
                      }
                    });
                  }
                });
              });
          });
        });
      });

      it("Actions not have sorting", () => {
        cy.get("imo-table table thead tr th").within(($el) => {
          cy.wrap($el).contains("Action").should("not.have.class", "sortable");
        });
      });
    });

    context("click buttons", () => {
      it("confirm filter after click apply button", () => {
        // filter status
        cy.get("[data-test=filter-item]")
          .eq(0)
          .within(() => {
            cy.get("mat-select")
              .click({ force: true })
              .parents("body")
              .find(".mat-select-panel-wrap")
              .within(() => {
                cy.get("mat-option").contains("Created").click({ force: true });
                cy.root().parents("body").type("{esc}");
              });
          });

        const input = "1";
        // filter order number
        cy.get("[data-test=table-filter]").within(() => {
          cy.get("input").eq(0).type("{selectall}{backspace}").type(input);
        });

        // Input placed date
        // select start Date: 2021/1/18
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(0).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startMonthSelect).click();

          // select day after select month and year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startDaySelect).click();
        });

        // select end Date: 2021/1/20
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(1).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", endYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endMonthSelect).click();

          // select day after select month and year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endDaySelect).click();
        });

        // Apply button
        cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });

        // confirm filter after apply
        // Status
        cy.get("mat-select-trigger").should(($input) => {
          expect($input.text().trim()).to.be.include("Created");
        });

        // Order number
        cy.get("[data-test=table-filter]").within(() => {
          cy.get("input")
            .eq(0)
            .should(($Input) => {
              expect($Input.val()).to.be.eq(input);
            });
        });

        // Place start date
        cy.get("imo-date-picker mat-form-field input")
          .eq(0)
          .should(($Input) => {
            expect($Input.val()).to.be.eq(`${startMonthNumber}/${startDaySelect}/${startYearSelect}`);
          });

        // Place end date
        cy.get("imo-date-picker mat-form-field input")
          .eq(1)
          .should(($Input) => {
            expect($Input.val()).to.be.eq(`${endMonthNumber}/${endDaySelect}/${endYearSelect}`);
          });
      });

      it("confirm filter and sorting after click apply button", () => {
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });

        let filterItem: GetFilterItems;

        cy.request(`${Cypress.env("host") + Cypress.env("apiOrdersFilterItems")}`).then((res) => {
          filterItem = res.body;
        });

        // CIT
        cy.get("[data-test=filter-item]")
          .eq(2)
          .within(() => {
            cy.get("mat-select").click({ force: true }).parents("body").find(`.mat-select-panel-wrap mat-option:eq(1)`).click();
          });

        // organisation
        cy.get("[data-test=filter-item]")
          .eq(3)
          .within(() => {
            cy.get("mat-select").click({ force: true }).parents("body").find(`.mat-select-panel-wrap mat-option:eq(1)`).click();
          });

        // locations
        cy.get("[data-test=filter-item]")
          .eq(4)
          .within(() => {
            cy.get("mat-select").click({ force: true }).parents("body").find(`.mat-select-panel-wrap mat-option:eq(1)`).click();
          });

        // is Emergency
        cy.get("[data-test=filter-item]").within(() => {
          cy.get("input[type=checkbox]").click({ force: true });
        });

        // sorting
        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.server()
            .route(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?sortColumn=orderNumber&sort=asc`)
            .as("apiSortAsc");

          cy.wrap($el)
            .contains("Order number")
            .click()
            .then(($el) => {
              cy.wait("@apiSortAsc").then(() => {
                cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
              });
            });
        });

        // Apply button
        cy.get("[data-test=apply-button] button").contains("Apply").click({ force: true });

        // confirm filter after apply
        // CIT
        cy.get("[data-test=filter-item]")
          .eq(2)
          .within(() => {
            cy.get("mat-select").then(($option) => {
              const text = $option.text().trim();
              cy.get("mat-select").should("have.text", text);
              cy.wrap(filterItem.cits[0].name).should("be.eq", text);
            });
          });

        // organisation
        cy.get("[data-test=filter-item]")
          .eq(3)
          .within(() => {
            cy.get("mat-select").then(($option) => {
              const text = $option.text().trim();
              cy.wrap(filterItem.companies[0].name).should("be.eq", text);
            });
          });

        // locations
        cy.get("[data-test=filter-item]")
          .eq(4)
          .within(() => {
            cy.get("mat-select").then(($option) => {
              const text = $option.text().trim();
              cy.wrap(filterItem.companies[0].locations[0].name).should("be.eq", text);
            });
          });

        // is Emergency
        cy.get("[data-test=filter-item]").within(() => {
          cy.get("input[type=checkbox]").should("be.checked");
        });

        // Sort
        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el)
            .contains("Order number")
            .then(($el) => {
              cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
            });
        });
      });

      it("go to create order page and confirm status filter and sorting when back orders page", () => {
        let filterItem: GetFilterItems;

        cy.request(`${Cypress.env("host") + Cypress.env("apiOrdersFilterItems")}`).then((res) => {
          filterItem = res.body;
        });

        cy.get(".page-content").find("a").contains("Create Order").click({ force: true });
        cy.url().should("include", Cypress.env("createOrder"));

        // confirm filter and sort should keeping when back orders page
        cy.get("button.back-arrow").click({ force: true });

        // CIT
        cy.get("[data-test=filter-item]")
          .eq(2)
          .within(() => {
            cy.get("mat-select").then(($option) => {
              const text = $option.text().trim();
              cy.get("mat-select").should("have.text", text);
              cy.wrap(filterItem.cits[0].name).should("be.eq", text);
            });
          });

        // organisation
        cy.get("[data-test=filter-item]")
          .eq(3)
          .within(() => {
            cy.get("mat-select").then(($option) => {
              const text = $option.text().trim();
              cy.wrap(filterItem.companies[0].name).should("be.eq", text);
            });
          });

        // locations
        cy.get("[data-test=filter-item]")
          .eq(4)
          .within(() => {
            cy.get("mat-select").then(($option) => {
              const text = $option.text().trim();
              cy.wrap(filterItem.companies[0].locations[0].name).should("be.eq", text);
            });
          });

        // is Emergency
        cy.get("[data-test=filter-item]").within(() => {
          cy.get("input[type=checkbox]").should("be.checked");
        });

        // Sort
        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el)
            .contains("Order number")
            .then(($el) => {
              cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", upImg);
            });
        });
      });

      it("confirm filters after click clear button", () => {
        // Click clear
        cy.get("[data-test=clear-button] button").contains("Clear").click({ force: true });

        // CIT
        cy.get("label").contains("CIT");
        cy.get("imo-select [data-test=show-placeholder]").eq(0).should("be.visible").and("have.text", "Select CIT");

        // Organisation
        cy.get("label").contains("CIT");
        cy.get("imo-select [data-test=show-placeholder]").eq(1).should("be.visible").and("have.text", "Select Organisation");

        // Organisation
        cy.get("label").contains("Location");
        cy.get("imo-select [data-test=show-placeholder]").eq(2).should("be.visible").and("have.text", "Select Location");
      });

      it("go to sample page when not apply and confirm filters should not keeping", () => {
        cy.server()
          .route("GET", Cypress.env("host") + Cypress.env("apiViewOrders"))
          .as("apiViewOrders");
        cy.visit(Cypress.env("pageOrders")).wait("@apiViewOrders");

        const input = "1";
        cy.get("[data-test=table-filter]").within(() => {
          // input value
          cy.get("input").eq(0).type("{selectall}{backspace}").type(input);
        });

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.server()
            .route(`${Cypress.env("host") + Cypress.env("apiViewOrders")}?sortColumn=orderNumber&sort=desc`)
            .as("apiSortDesc");

          cy.wrap($el)
            .contains("Order number")
            .click()
            .click()
            .then(($el) => {
              cy.wait("@apiSortDesc").then(() => {
                cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", downImg);
              });
            });
        });

        cy.get("[data-test=filter-item]")
          .eq(0)
          .within(() => {
            cy.get("mat-select")
              .click({ force: true })
              .parents("body")
              .find(".mat-select-panel-wrap")
              .within(() => {
                cy.get("mat-option").contains("Created").click({ force: true });
                cy.root().parents("body").type("{esc}");
              });
          });

        cy.get("[data-test=filter-item]")
          .eq(2)
          .within(() => {
            cy.get("mat-select").click({ force: true }).parents("body").find(`.mat-select-panel-wrap mat-option:eq(1)`).click();
          });

        // Input service date
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(2).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", startYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startMonthSelect).click();

          // select day after select month and year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", startDaySelect).click();
        });

        // select end Date: 2021/1/20
        cy.get("[data-test=table-filter]").within((el) => {
          cy.wrap(el).find("mat-datepicker-toggle button").eq(3).click();
          cy.get("button")
            .parents("body")
            .find(".mat-calendar")
            .find(".mat-calendar-next-button")
            .click()
            .siblings(".mat-calendar-previous-button")
            .click()
            .siblings(".mat-calendar-period-button")
            .click()
            .parents(".mat-calendar")
            .contains(".mat-calendar-body-cell-content", endYearSelect)
            .click();

          // select month after select year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endMonthSelect).click();

          // select day after select month and year
          cy.get("button").parents("body").find(".mat-calendar").contains(".mat-calendar-body-cell-content", endDaySelect).click();
        });

        cy.get("imo-order-list-page").find(".page-header button mat-icon").click({ force: true });
        cy.url().should("not.contain", Cypress.env("pageOrders"));

        // confirm filter should not keeping when back orders page
        cy.get("imo-sample a").contains("Orders").click({ force: true });

        // Status
        cy.get("imo-select-multi mat-select").should("be.visible").and("have.attr", "aria-label", "Select Status");

        // Order number
        cy.get("label").contains("Order Number");
        cy.get("input").eq(0).should("be.visible").and("have.attr", "placeholder", "Search by Number");

        // CIT
        cy.get("label").contains("CIT");
        cy.get("imo-select [data-test=show-placeholder]").eq(0).should("be.visible").and("have.text", "Select CIT");

        cy.get(`imo-table table thead tr th`).within(($el) => {
          cy.wrap($el)
            .contains("Order number")
            .then(($el) => {
              cy.wrap($el).find("imo-svg-icon img").should("have.attr", "src").should("include", downImg);
            });
        });
      });
    });

    context("click edit button", () => {
      const orderEndpoints = {
        apiViewOrders: Cypress.env("apiViewOrders"),
        pageOrders: Cypress.env("pageOrders"),
        pageEditOrder: Cypress.env("pageEditOrder"),
      };

      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + orderEndpoints.apiViewOrders)
          .as("apiViewOrders");
        cy.visit(orderEndpoints.pageOrders)
          .wait("@apiViewOrders")
          .then(({ responseBody }) => {
            const res = responseBody;
            if (Array.isArray(res)) {
              orders = res;
            }
          });
      });

      it("should go to edit order page", () => {
        const filteredOrder = Cypress._.findIndex(orders, {}); // { isEditable: true });
        cy.get(".page-content imo-table tbody").within(() => {
          cy.get("imo-button").contains("Edit").first().click({ force: true });
          cy.url().should("include", orderEndpoints.pageEditOrder + `${orders[filteredOrder].orderNumber}`);
        });
      });
    });
  });
});
