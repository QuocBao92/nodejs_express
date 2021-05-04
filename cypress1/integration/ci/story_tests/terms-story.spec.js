/// <reference types="Cypress" />
const { TokenService } = require("../../../../src/app/services/token/token.service");
const { of } = require("rxjs");
const mockRoute = {
  navigate: (url) => cy.visit(url[0]),
};
describe("Story-terms and conditions", () => {
  context("Display of terms and conditions", () => {
    it("Display of terms and conditions", () => {
      cy.visit(
        Cypress.env("dashboard") +
          "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
      );

      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUserInfo")}?applicationId=3`,
        headers: {
          Authorization: "Bearer e2e-bridge-token",
        },
      }).then(({ body }) => {
        const mockAuthJa = {
          getUserInfo: () => {
            return of({ ...body, firstLoginDate: null, language: "en" });
          },
        };

        const sv = new TokenService(mockAuthJa, mockRoute);
        sv.clear();
        sv.handleGetUserInfo().subscribe(() => {
          cy.wait(1000);
          cy.get("bridge-terms .content[data-test='content']").scrollTo("bottom");
          cy.get("mat-checkbox").click();
          cy.get(".buttons [data-test='agree-button'] button")
            .click({ force: true })
            .then(() => {
              cy.url().should("include", Cypress.env("dashboard"));
            });
        });
      });
    });
  });

  context("Skip displaying terms and conditions", () => {
    it("Skip displaying terms and conditions", () => {
      cy.visit(
        Cypress.env("dashboard") +
          "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
      );

      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUserInfo")}?applicationId=3`,
        headers: {
          Authorization: "Bearer e2e-bridge-token",
        },
      }).then(({ body }) => {
        const mockAuthJa = {
          getUserInfo: () => {
            return of(body);
          },
        };
        const sv = new TokenService(mockAuthJa, mockRoute);
        sv.clear();
        sv.handleGetUserInfo().subscribe(() => {
          cy.wait(1000);
          cy.get("bridge-term-conditions-page").should("not.exist");
          cy.url().should("include", Cypress.env("dashboard"));
          cy.window().then((window) => expect(window.sessionStorage.getItem("firstLoginDate")).to.be.eq(body.firstLoginDate));
        });
      });
    });
  });
});
