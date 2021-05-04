/// <reference types="Cypress" />
const { of } = require("rxjs");
const { TokenService } = require("../../../../src/app/services/token/token.service");

const mockRoute = {
  navigate: (url) => cy.visit(url[0]),
};
describe("Languages-story", () => {
  context("Display of page show user setting languages", () => {
    it("Display of page show languages ja of user info", () => {
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
        cy.visit(
          Cypress.env("dashboard") +
            "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
        );
        const sv = new TokenService(mockAuthJa, mockRoute);
        sv.clear();
        sv.handleGetUserInfo().subscribe(() => {
          // Check session storage language (ja)
          const temp = sessionStorage.getItem("language");
          cy.wrap(temp).should("contain", "ja");
        });
      });
    });
    it("Display of page show languages en of user info", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUserInfo")}?applicationId=3`,
        headers: {
          Authorization: "Bearer e2e-bridge-token",
        },
      }).then(({ body }) => {
        const mockAuthEn = {
          getUserInfo: () => {
            return of({ ...body, language: "en" });
          },
        };
        cy.visit(
          Cypress.env("dashboard") +
            "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
        );
        const sv = new TokenService(mockAuthEn, mockRoute);
        sv.clear();
        sv.handleGetUserInfo().subscribe(() => {
          // Check session storage language (ja)
          const temp = sessionStorage.getItem("language");
          cy.wrap(temp).should("contain", "en");
        });
      });
    });
  });

  context("Display of page select languages menu header", () => {
    sessionStorage.setItem("language", "en");
    it("Display of page select ja", () => {
      cy.visit(
        Cypress.env("dashboard") +
          "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
      );
      cy.get("bridge-home bridge-header bridge-svg-icon")
        .click()
        .then(() => {
          cy.wait(1000);
          cy.get("bridge-dropdown-menu bridge-dropdown-menu-item")
            .eq(2)
            .click()
            .then(() => {
              // Check session storage language (ja)
              cy.window().then((window) => expect(window.sessionStorage.getItem("language")).to.be.eq("ja"));
            });
        });
    });

    it("Display of page select en", () => {
      cy.visit(
        Cypress.env("dashboard") +
          "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
      );
      cy.get("bridge-home bridge-header bridge-svg-icon")
        .click()
        .then(() => {
          cy.wait(1000);
          cy.get("bridge-dropdown-menu bridge-dropdown-menu-item")
            .eq(3)
            .click()
            .then(() => {
              // Check session storage language (en)
              cy.window().then((window) => expect(window.sessionStorage.getItem("language")).to.be.eq("en"));
            });
        });
    });
  });

  context("Display of page show languages refresh page", () => {
    sessionStorage.setItem("language", "en");
    it("Display of page select ja and refresh page", () => {
      cy.visit(
        Cypress.env("dashboard") +
          "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
      );
      cy.get("bridge-home bridge-header bridge-svg-icon")
        .click()
        .then(() => {
          cy.wait(1000);
          cy.get("bridge-dropdown-menu bridge-dropdown-menu-item")
            .eq(2)
            .click()
            .then(() => {
              // Check session storage language (ja)
              cy.visit(Cypress.env("dashboard"));
              cy.window().then((window) => expect(window.sessionStorage.getItem("language")).to.be.eq("ja"));
            });
        });
    });

    it("Display of page select en and refresh page", () => {
      cy.visit(
        Cypress.env("dashboard") +
          "?code=aEBJw6bDlR01M2peMMO1GCzDpcKQw5zDmDpJwoDCpis8eV3DjMKBdMO8w6cxwqFtw7PCh0dCaMO_EAXCu8KcVhvCh8KtCnh1w5BUYHzCkz7DsMKwwrJAbkIkdhPCmsOUwqDDlcKIYBXDrMKeSGDDhMKtw7FdR11JJsKzw7HDr8OXwooLw5_DsMKewoUtaXQWCMK8OMO2w6FxXMKFImhDw47Cn8O8OA3DqgzDozBkwrU1w5oHw6g0Dl_DlsOPw4JYwofDgMOpw5kAw4XDpAHCmcOUw7zCgiDCthzCqsK9cMOxAQTCnMOew69RwqHCjwl0JEvCp8OweFRSSW17YcOlwo1rw6DDoUjDkcKLw6vCjsKKw7RSwo_CjhQQwqPClMK6&applicationId=3",
      );
      cy.get("bridge-home bridge-header bridge-svg-icon")
        .click()
        .then(() => {
          cy.wait(1000);
          cy.get("bridge-dropdown-menu bridge-dropdown-menu-item")
            .eq(3)
            .click()
            .then(() => {
              // Check session storage language (en)
              cy.visit(Cypress.env("dashboard"));
              cy.window().then((window) => expect(window.sessionStorage.getItem("language")).to.be.eq("en"));
            });
        });
    });
  });
});
