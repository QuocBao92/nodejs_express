const cypress = require("cypress");
const fse = require("fs-extra");
const { merge } = require("mochawesome-merge");
const generator = require("mochawesome-report-generator");

/**
 * Run E2E test by Cypress.
 * Then generate test report.
 */
async function runTests() {
  await fse.remove("cypress/report");
  await cypress.run({
    spec: "cypress/integration/**/*.spec.ts",
  });
  const jsonReport = await merge({
    reportDir: "cypress/report",
  });
  await generator.create(jsonReport, {
    reportDir: "cypress/report",
    reportTitle: "IMO E2E All Test",
  });
  await fse.writeJson("cypress/report/mochawesome-stat.json", jsonReport, { spaces: 2 });
}

runTests();
