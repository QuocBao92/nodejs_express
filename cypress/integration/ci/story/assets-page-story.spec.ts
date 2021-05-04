describe("Story-Assets", () => {
  interface AssetItem {
    assetId: string;
    status: string;
    type: string;
    serial: string;
    companyName: string;
    locationName: string;
    currency: string;
  }
  interface ViewAssetsResponseBody {
    assets: AssetItem[];
  }
  const assetsEndpoints = Cypress.env("assetsEndpoints");
  let assetList: AssetItem[] = [];

  context("list of assets page", () => {
    before(() => {
      cy.server()
        .route("GET", Cypress.env("host") + assetsEndpoints.api.viewAssets, `fx:assets/assets-case`)
        .as("apiViewAssets");
      cy.visit(assetsEndpoints.page.viewAssets)
        .wait("@apiViewAssets")
        .then(({ responseBody }) => {
          const res = responseBody as ViewAssetsResponseBody;
          if (Array.isArray(res.assets)) {
            assetList = res.assets;
          }
        });
    });

    context("initial display", () => {
      it("page title should be displayed", () => {
        cy.get(".page-content").within(() => {
          cy.get(".page-title").should("be.visible").contains("Devices");
        });
      });

      it("assets table header should be displayed", () => {
        const headers = ["Status", "Model", "Serial", "Organisation", "Location", "Currency", "Actions"];

        cy.get("[data-test=assets-table] table")
          .should("be.visible")
          .within(() => {
            cy.get("th").each(($th, i) => {
              expect($th).to.contain(headers[i]);
            });
          });
      });

      it("assets table should displayed all data", () => {
        cy.get(".page-content").within(() => {
          cy.get("imo-table tbody").within(() => {
            cy.get("tr").each(($tr, index) => {
              cy.wrap($tr)
                .find("td:nth-child(1)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(assetList[index].status);
                });

              cy.wrap($tr)
                .find("td:nth-child(2)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(assetList[index].type);
                });

              cy.wrap($tr)
                .find("td:nth-child(3)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(assetList[index].serial);
                });

              cy.wrap($tr)
                .find("td:nth-child(4)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(assetList[index].companyName);
                });

              cy.wrap($tr)
                .find("td:nth-child(5)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(assetList[index].locationName);
                });

              cy.wrap($tr)
                .find("td:nth-child(6)")
                .should(($td) => {
                  expect($td.text().trim()).to.be.eq(assetList[index].currency);
                });
            });
          });
        });
      });

      it("should display scrollbar", () => {
        cy.server()
          .route("GET", Cypress.env("host") + assetsEndpoints.api.viewAssets, `fx:assets/assets`)
          .as("apiViewAssets");
        cy.visit(assetsEndpoints.page.viewAssets).wait("@apiViewAssets");

        cy.get("body").within(($body) => {
          const el = $body[0];
          expect(el.scrollHeight).to.greaterThan(el.clientHeight);
          cy.get("imo-table tbody tr:last-of-type").scrollIntoView();
        });
      });

      it("should display ellipsis when name too long", () => {
        cy.server()
          .route("GET", Cypress.env("host") + assetsEndpoints.api.viewAssets, `fx:assets/assets-special-case`)
          .as("apiViewAssets");
        cy.visit(assetsEndpoints.page.viewAssets).wait("@apiViewAssets");

        cy.get("imo-table tbody tr:first-of-type td:nth-child(2) > div").within(($div) => {
          const el = $div[0];
          expect(el.scrollWidth).to.greaterThan(el.clientWidth);
        });
      });
    });

    context("click setting button", () => {
      before(() => {
        cy.server()
          .route("GET", Cypress.env("host") + assetsEndpoints.api.viewAssets, `fx:assets/assets-case`)
          .as("apiViewAssets");
        cy.visit(assetsEndpoints.page.viewAssets)
          .wait("@apiViewAssets")
          .then(({ responseBody }) => {
            const res = responseBody as ViewAssetsResponseBody;
            if (Array.isArray(res.assets)) {
              assetList = res.assets;
            }
          });
      });
      it("should go to setting asset page", () => {
        cy.get(".page-content imo-table tbody").within(() => {
          cy.get("imo-button").contains("Settings").first().click({ force: true });
          cy.url().should("include", assetsEndpoints.page.settingAsset + `${assetList[0].assetId}`);
        });
      });
    });
  });
});
