/// <reference types="Cypress" />
const generatorDate = (dateString) => {
  const check = Cypress.moment.utc(dateString, "YYYY-MM-DD HH:mm:ss");
  return (check.isValid() && check.local().format("MMM D, YYYY, h:mm:ss A")) || "";
};
let data = {};
let apiAssetEvents, apiAssetFirmwares, apiAssetInventory, apiAssetDetail;
const visitDataUrl = (key) => {
  const urlArg = Cypress.env(key).split("/");
  apiAssetEvents = Cypress.env("apiAssetEventsRL")
    .replace("${1}", urlArg[2])
    .replace("${2}", urlArg[3]);
  apiAssetFirmwares = Cypress.env("apiAssetFirmwaresRL")
    .replace("${1}", urlArg[2])
    .replace("${2}", urlArg[3]);
  apiAssetInventory = Cypress.env("apiAssetInventoryRL")
    .replace("${1}", urlArg[2])
    .replace("${2}", urlArg[3]);
  apiAssetDetail = Cypress.env("apiAssetDetailRL")
    .replace("${1}", urlArg[2])
    .replace("${2}", urlArg[3]);
  apiAssetStatus = Cypress.env("apiAssetStatusRL")
    .replace("${1}", urlArg[2])
    .replace("${2}", urlArg[3]);
  cy.server()
    .route("GET", `${apiAssetDetail}*`)
    .as("assets")
    .route("GET", `${apiAssetFirmwares}*`)
    .as("firmwares")
    .route("GET", `${apiAssetInventory}*`)
    .as("inventory")
    .route("GET", `${apiAssetEvents}*`)
    .as("events")
    .route("GET", `${apiAssetStatus}*`)
    .as("status");
  return cy.visit(Cypress.env(key)).wait(["@assets", "@firmwares", "@inventory", "@status"], { requestTimeout: 10000 });
};
let mockData = {};
let eventData = [];
describe("Page-Assets Detail List, Basis Board", () => {
  context("Initial display", () => {
    it("Serial Status is Good and there is URL image", () => {
      visitDataUrl("assetDetailGoodHasImage");
      cy.request(`${apiAssetDetail}`).then((res) => {
        const { body } = res;
        const checkInfos = [
          {
            key: "assetId",
            value: body.assetId,
            query: "have.text",
            selector: "bridge-card .subtitle .subtitle-text",
          },
          {
            key: "status",
            value: body.status,
            query: "have.text",
            selector: "bridge-card .subtitle bridge-badge .badge",
          },
          {
            key: "typeId",
            value: body.typeId,
            query: "have.text",
            selector: "bridge-flex-list bridge-flex-list-item:eq(0) li div:eq(1)",
          },
          {
            key: "installationDate",
            value: body.installationDate,
            query: "have.text",
            selector: "bridge-flex-list bridge-flex-list-item:eq(1) li div:eq(1)",
          },
          {
            key: "name",
            value: body.alias,
            query: "have.text",
            selector: "bridge-flex-list bridge-flex-list-item:eq(2) li div:eq(1)",
          },
          {
            key: "region",
            value: body.region,
            query: "have.text",
            selector: "bridge-flex-list bridge-flex-list-item:eq(3) li div:eq(1)",
          },
          {
            key: "organization",
            value: body.organization,
            query: "have.text",
            selector: "bridge-flex-list bridge-flex-list-item:eq(4) li div:eq(1)",
          },
          {
            key: "location",
            value: body.location,
            query: "have.text",
            selector: "bridge-flex-list bridge-flex-list-item:eq(5) li div:eq(1)",
          },
          {
            key: "note",
            value: body.note,
            query: "have.value",
            selector: "bridge-flex-list ul > li bridge-textarea textarea",
          },
        ];
        checkInfos.forEach((info) => {
          if (info.key === "installationDate") {
            cy.get(info.selector).should(info.query, (info.value && generatorDate(info.value)) || "");
          } else {
            cy.get(info.selector).should(info.query, info.value || "");
          }
        });
        cy.get("bridge-detail-basis-board .content-img img").should("have.attr", "src", body.imageUrl);
        // check Component Device
        cy.request(`${apiAssetStatus}?lang=en`).then((res) => {
          cy.wait(500);
          const subAssets = res.body.subAssets;
          cy.get("bridge-flex-list ul.items > li[data-test='asset-device']")
            .find("div:eq(1) li")
            .then(($el) => {
              cy.wrap($el).each(($li, $index) => {
                cy.wrap($li)
                  .find("div:eq(0)")
                  .should("have.text", subAssets[$index].typeId);
                cy.wrap($li)
                  .find("div:eq(1) bridge-badge div")
                  .should("have.text", subAssets[$index].status);
              });
            });
        });
      });
    });
    it("Serial Status is Good and there is no URL image", () => {
      visitDataUrl("assetDetailGoodNoImage");
      // check status
      cy.get("bridge-card .subtitle bridge-badge .badge").should("have.text", "good");
      // check image
      cy.get("bridge-detail-basis-board .content-img img").should(
        "have.attr",
        "src",
        `${Cypress.config("baseUrl")}/assets/img/noimage.png`,
      );
    });
    it("Serial status is missing and the component device has data", () => {
      visitDataUrl("assetDetailMissingHasDevice");
      cy.wait(500);
      cy.get("bridge-card .subtitle bridge-badge .badge").should("have.text", "missing");
      // To Do will
      cy.request(`${apiAssetDetail}`).then(({ body }) => {
        cy.wait(500);
        cy.request(`${apiAssetStatus}?lang=en`).then(({ body }) => {
          cy.wait(500);
          const subAssets = body.subAssets;
          cy.get("bridge-flex-list ul > li[data-test='asset-device']")
            .find("div:eq(1) li")
            .then(($el) => {
              cy.wrap($el).each(($li, $index) => {
                cy.wrap($li)
                  .find("div:eq(0)")
                  .should("have.text", subAssets[$index].typeId);
                cy.wrap($li)
                  .find("div:eq(1) bridge-badge div")
                  .should("have.text", subAssets[$index].status);
              });
            });
        });
      });
    });
    it("Serial status is missing and the component device does not have data", () => {
      visitDataUrl("assetDetailMissingNoDevice");
      cy.wait(500);
      cy.get("bridge-card .subtitle bridge-badge .badge").should("have.text", "missing");
      cy.request(`${apiAssetStatus}?lang=en`).then((res) => {
        cy.wait(500);
        cy.get("bridge-flex-list ul > li[data-test='asset-device']").should("not.exist");
      });
    });

    it("Serial status is Error", () => {
      visitDataUrl("assetDetailError");
      cy.wait(500);
      cy.get("bridge-card .subtitle bridge-badge .badge").should("have.text", "error");
      cy.request(`${apiAssetStatus}?lang=en`).then(({ body }) => {
        const subAssets = body.subAssets;
        cy.get("bridge-flex-list ul > li[data-test='asset-device']").should("exist");
        cy.get("bridge-flex-list ul > li[data-test='asset-device']")
          .find("div:eq(1) li")
          .then(($el) => {
            cy.wrap($el).each(($li, $index) => {
              cy.wrap($li)
                .find("div:eq(0)")
                .should("have.text", subAssets[$index].typeId);
              cy.wrap($li)
                .find("div:eq(1) bridge-badge div")
                .should("have.text", subAssets[$index].status);
            });
          });
      });
    });
  });
});
describe("Page-Assets Detail List, Error Board", () => {
  context("Initial display", () => {
    it("Serial status is Good", () => {
      visitDataUrl("assetDetailSerialStatusGood");
      cy.wait(500);
      cy.get("bridge-card .subtitle bridge-badge .badge").should("have.text", "good");
      cy.request(`${apiAssetStatus}?lang=en`).then(({ body }) => {
        cy.wait(500);
        cy.get("bridge-asset-detail-page bridge-asset-detail-template bridge-error-board").should("not.exist");
      });
    });
    it("Serial status is Missing", () => {
      visitDataUrl("assetDetailSerialStatusMissing");
      cy.wait(500);
      cy.get("bridge-card .subtitle bridge-badge .badge").should("have.text", "missing");
      cy.request(`${apiAssetStatus}?lang=en`).then(({ body }) => {
        cy.wait(500);
        cy.get("bridge-asset-detail-page bridge-asset-detail-template bridge-error-board").should("not.exist");
      });
    });
    it("Serial status is Error", () => {
      visitDataUrl("assetDetailSerialStatusError");
      cy.wait(500);
      cy.get("bridge-card .subtitle bridge-badge .badge").should("have.text", "error");
      cy.get("bridge-asset-detail-page bridge-asset-detail-template bridge-error-board").should("exist");
      cy.request(`${apiAssetStatus}?lang=en`).then(({ body }) => {
        cy.wait(500);
        const subAssetsError = body.subAssets.filter((res) => res.status === "error");
        cy.get("bridge-asset-detail-page bridge-asset-detail-template bridge-error-board .error").then(($el) => {
          cy.wrap($el).should("have.length", subAssetsError.length);
          cy.wrap($el).each(($it, $index) => {
            cy.wrap($it)
              .find(".code")
              .should("have.text", `${subAssetsError[$index].typeId}:${subAssetsError[$index].errorCode}`);
            cy.wrap($it)
              .find(".message")
              .should("have.text", subAssetsError[$index].errorMessage);
          });
        });
      });
    });
  });
});
describe("Page-Assets Detail List, Firmware Versions Board", () => {
  context("Initial display", () => {
    it("Initial display", () => {
      visitDataUrl("assetDetailFirmwaresNoData");
      cy.wait(500);
      cy.get("mat-accordion[data-test='asset-firmware'] .mat-expansion-panel").should("not.have.class", "mat-expanded");
    });
  });
  context("Accordion operations", () => {
    it("Click the Down Arrow expansion button on an accordion that has no data", () => {
      visitDataUrl("assetDetailFirmwaresNoData");
      cy.wait(500);
      cy.get("mat-accordion[data-test='asset-firmware'] mat-expansion-panel")
        .click()
        .then(($el) => {
          cy.wait(500);
          cy.request("GET", apiAssetFirmwares).then((res) => {
            cy.wrap($el).should("have.class", "mat-expanded");
            cy.wrap($el)
              .find("bridge-firmware-board [data-test='no-data-text']")
              .invoke("text")
              .then((t) => t.trim())
              .should("eq", "Data is not available.");
          });
        });
    });

    it("Click the Down Arrow expansion button on an accordion that has data", () => {
      visitDataUrl("assetDetailFirmwaresHasData");
      cy.wait(500);
      cy.get("mat-accordion[data-test='asset-firmware'] .mat-expansion-panel").should("not.have.class", "mat-expanded");
      cy.get("mat-accordion[data-test='asset-firmware'] mat-expansion-panel")
        .click()
        .then(($el) => {
          cy.wait(500);
          cy.request("GET", apiAssetFirmwares).then((res) => {
            cy.wait(500);
            const { body } = res;
            cy.wrap($el).should("have.class", "mat-expanded");
            cy.wrap($el)
              .find("bridge-flex-list bridge-firmware-board .firmware[data-test='firmware-version']")
              .its("length")
              .should("eq", body.length);
            cy.wrap($el)
              .find("bridge-flex-list bridge-firmware-board .firmware[data-test='firmware-version']")
              .each(($el, $index) => {
                cy.wrap($el)
                  .find("h3")
                  .invoke("text")
                  .then((t) => t.trim())
                  .should("eq", `${body[$index].typeId} (${body[$index].assetId})`);
                cy.wrap($el)
                  .find(".list-view li")
                  .its("length")
                  .should("eq", body[$index].versions.length);
                cy.wrap($el)
                  .find(".list-view li")
                  .then(($li) => {
                    cy.wrap($li).each(($item, $indexItem) => {
                      cy.wrap($item)
                        .find("> div:eq(0)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", `${body[$index].versions[$indexItem].name}:`);
                      cy.wrap($item)
                        .find("> div:eq(1)")
                        .invoke("text")
                        .then((t) => t.trim())
                        .should("eq", `${body[$index].versions[$indexItem].version}`);
                    });
                  });
              });
          });
        });
    });
    it("Click the Up Arrow expansion button", () => {
      cy.get("mat-accordion[data-test='asset-firmware'] .mat-expansion-panel").should("have.class", "mat-expanded");
      cy.get("mat-accordion[data-test='asset-firmware'] mat-expansion-panel")
        .click()
        .then(($el) => {
          cy.get("mat-accordion[data-test='asset-firmware'] mat-expansion-panel mat-expansion-panel-header")
            .click({ force: true })
            .then(() => {
              cy.wait(500);
              cy.wrap($el).should("not.have.class", "mat-expanded");
            });
        });
    });
  });
});

describe("Page-Assets Detail List, Inventory Board", () => {
  context("Initial display", () => {
    it("The status of the unit meets all the statuses", () => {
      visitDataUrl("assetDetail");
      cy.request("GET", `${apiAssetInventory}`).then((res) => {
        const inventory = res.body.subAssets;
        const status = [];
        inventory.map((asset) => {
          asset.cashUnits.map((unit) => {
            if (unit.status !== "exist") {
              status.push(unit.status === "unknown" ? "na" : unit.status);
            }
          });
        });
        const uniqStatus = [...new Set(status)];
        cy.get("[data-test=inventory-titles] > span").each(($item, i) => {
          expect(
            $item
              .text()
              .toLowerCase()
              .replace(/\s/g, ""),
          ).to.contain(uniqStatus[i]);
        });
      });
    });
  });
  context("Accordion operations", () => {
    it("Click the Down Arrow expansion button on an accordion that has no data", () => {
      visitDataUrl("assetDetailNoDataInventory");
      cy.get("mat-accordion[data-test='asset-inventory'] .mat-expansion-panel").should("not.have.class", "mat-expanded");
      cy.get("mat-accordion[data-test='asset-inventory'] mat-expansion-panel")
        .click()
        .then(($el) => {
          cy.wait(500);
          cy.request("GET", apiAssetInventory).then((res) => {
            cy.wrap($el).should("have.class", "mat-expanded");
            cy.wrap($el)
              .find("bridge-inventory-board [data-test='no-data-text']")
              .invoke("text")
              .then((t) => t.trim())
              .should("eq", "Data is not available.");
          });
        });
    });
    it("Click the Down Arrow expansion button on an accordion that has data", () => {
      visitDataUrl("assetDetailFirmwaresHasData");
      cy.get("mat-accordion[data-test='asset-inventory'] .mat-expansion-panel").should("not.have.class", "mat-expanded");
      cy.get("mat-accordion[data-test='asset-inventory'] mat-expansion-panel")
        .click()
        .then(($el) => {
          cy.wait(500);
          cy.request("GET", `${apiAssetInventory}`).then((res) => {
            cy.wait(1000);
            cy.wrap($el).should("have.class", "mat-expanded");
            cy.wrap($el)
              .find("bridge-flex-list bridge-inventory-board .inventory-board[data-test='inventory']")
              .within(() => {
                cy.get("li:nth-child(1)").within(() => {
                  cy.get("p").should("contain.text", "Currency");
                  cy.get("h2").should("contain.text", "EUR");
                });
                cy.get("li:nth-child(2)").within(() => {
                  cy.get("p").should("contain.text", "Total Value");
                  cy.get("h2").should("contain.text", "€");
                });
              });
            cy.wrap($el)
              .find("bridge-flex-list bridge-inventory-board .inventory-board[data-test='inventory']")
              .within(() => {
                cy.get("[data-test=inventory-card]:nth-child(1)").within(() => {
                  cy.get(".subAssets").should("have.text", res.body.subAssets[0].typeId);
                  cy.get("bridge-inventory-item").each(($item, i) => {
                    const cashUnit = res.body.subAssets[0].cashUnits[i];

                    expect($item.find("[data-test=inventory-unit]").text()).to.contain(cashUnit.unit);
                    expect($item.find("[data-test=inventory-total]").text());
                    expect(
                      $item
                        .find("[data-test=inventory-status]")
                        .text()
                        .toLowerCase()
                        .replace(/\s/g, ""),
                    ).to.contain(cashUnit.status !== "exist" ? (cashUnit.status === "unknown" ? "na" : cashUnit.status) : "");
                  });
                });
              });
          });
        });
    });

    it("Click the Up Arrow expansion button", () => {
      cy.get("mat-accordion[data-test='asset-inventory'] mat-expansion-panel").should("have.class", "mat-expanded");
      cy.get("mat-accordion[data-test='asset-inventory'] mat-expansion-panel")
        .click()
        .then(($el) => {
          cy.get("mat-accordion[data-test='asset-inventory'] mat-expansion-panel mat-expansion-panel-header")
            .click()
            .then(() => {
              cy.wait(500);
              cy.wrap($el).should("not.have.class", "mat-expanded");
            });
        });
    });
  });
});

describe("Page-Assets Detail List, Events Board", () => {
  context("Initial display", () => {
    it("should have filter button ", () => {
      visitDataUrl("assetDetailEventHasData");
      const filterBtns = ["All", "Asset", "Bridge"];
      cy.get("bridge-event-list-board bridge-button-toggle")
        .find("button")
        .each(($li, i) => {
          expect($li).to.contain(filterBtns[i]);
        });
    });
    // Check selected All
    it("should be selected an 'All' filter", () => {
      cy.get("bridge-event-list-board bridge-button-toggle")
        .find("button:nth-child(1)")
        .should("contain", "All")
        .should("have.attr", "aria-pressed")
        .should("contain", "true");
    });
    // Check icon
    it("should have icon ", () => {
      cy.get("bridge-event-list-board .event-list")
        .find("mat-list:nth-child(1)[data-test='event'] div.event img")
        .should("be.visible");
    });
    // Check subject
    it("should have subject ", () => {
      cy.get("bridge-event-list-board .event-list")
        .find("mat-list:nth-child(1)[data-test='event'] div.event .message")
        .should("be.visible");
    });
    // Check datetime
    it("should have datetime", () => {
      cy.get("bridge-event-list-board .event-list")
        .find("mat-list:nth-child(1) div.event > p.datetime")
        .should("be.visible");
    });
  });

  context("Tab operations", () => {
    const iconImg = "assets/img/icons/info-circle-solid.svg";
    describe("Asset event no data", () => {
      it("Select the All tab with no data", () => {
        visitDataUrl("assetDetailEventHasNoData");
        cy.wait(500);
        cy.get("bridge-button-toggle .button-toggle-container");
        cy.get("ul.button-toggle-container")
          .children()
          .within(($els) => {
            if ($els.length === 3) {
              cy.wrap($els[0]).click();
              cy.get(".event-list bridge-event-list-board").should("not.have.class", "mat-list");
            }
          });
      });

      it("Select the Asset tab with no data", () => {
        visitDataUrl("assetDetailEventHasNoData");
        cy.wait(500);
        cy.get("bridge-button-toggle .button-toggle-container");
        cy.get("ul.button-toggle-container")
          .children()
          .within(($els) => {
            if ($els.length === 3) {
              cy.wrap($els[1]).click();
              cy.get(".event-list bridge-event-list-board").should("not.have.class", "mat-list");
            }
          });
      });

      it("Select the Bridge tab with no data", () => {
        visitDataUrl("assetDetailEventHasNoData");
        cy.wait(500);
        cy.get("bridge-button-toggle .button-toggle-container");
        cy.get("ul.button-toggle-container")
          .children()
          .within(($els) => {
            if ($els.length === 3) {
              cy.wrap($els[2]).click();
              cy.get(".event-list bridge-event-list-board").should("not.have.class", "mat-list");
            }
          });
      });
    });

    describe("Asset Event has data", () => {
      it("Select the All tab with data", () => {
        visitDataUrl("assetDetailEventHasData");
        cy.wait(500);
        cy.get("bridge-event-list-board bridge-button-toggle")
          .find("button:eq(0)")
          .click()
          .then(() => {
            cy.request("GET", `${apiAssetEvents}?lang=en&limit=10&offset=0`).then(({ body }) => {
              cy.wait(500);
              cy.get("bridge-event-list-board bridge-event-list mat-list[data-test='event'] mat-list-item").should(
                "have.length",
                Math.min(body.items.length, 10),
              );
              cy.get("bridge-event-list-board bridge-event-list mat-list[data-test='event'] mat-list-item").each(($el, $index) => {
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", iconImg);
                cy.wrap($el)
                  .find(".message")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", body.items[$index].subject);
                cy.wrap($el)
                  .find(".datetime")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", generatorDate(body.items[$index].date));
              });
            });
          });
      });

      it("Select the Asset tab with data", () => {
        visitDataUrl("assetDetailEventHasData");
        cy.wait(500);
        cy.get("bridge-event-list-board bridge-button-toggle")
          .find("button:eq(1)")
          .click()
          .then(() => {
            cy.request("GET", `${apiAssetEvents}?eventSource=Asset&lang=en&limit=10&offset=0`).then(({ body }) => {
              cy.wait(500);
              cy.get("bridge-event-list-board bridge-event-list mat-list[data-test='event'] mat-list-item").should(
                "have.length",
                Math.min(body.items.length, 10),
              );
              cy.get("bridge-event-list-board bridge-event-list mat-list[data-test='event'] mat-list-item").each(($el, $index) => {
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", iconImg);
                cy.wrap($el)
                  .find(".message")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", body.items[$index].subject);
                cy.wrap($el)
                  .find(".datetime")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", generatorDate(body.items[$index].date));
              });
            });
          });
      });

      it("Select the Bridge tab with data", () => {
        visitDataUrl("assetDetailEventHasData");
        cy.wait(500);
        cy.get("bridge-event-list-board bridge-button-toggle")
          .find("button:eq(2)")
          .click()
          .then(() => {
            cy.request("GET", `${apiAssetEvents}?eventSource=Bridge&lang=en&limit=10&offset=0`).then(({ body }) => {
              cy.wait(500);
              cy.get("bridge-event-list-board bridge-event-list mat-list[data-test='event'] mat-list-item").should(
                "have.length",
                Math.min(body.items.length, 10),
              );
              cy.get("bridge-event-list-board bridge-event-list mat-list[data-test='event'] mat-list-item").each(($el, $index) => {
                cy.wrap($el)
                  .find("bridge-svg-icon img")
                  .should("have.attr", "src")
                  .should("include", iconImg);
                cy.wrap($el)
                  .find(".message")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", body.items[$index].subject);
                cy.wrap($el)
                  .find(".datetime")
                  .invoke("text")
                  .then((text) => text.trim())
                  .should("eq", generatorDate(body.items[$index].date));
              });
            });
          });
      });
    });
  });
});
