declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Take snapshot and then assert to match previous one
     */
    toMatchSnapshot(): Chainable<any>;
    /**
     * Take snapshot as image and then assert to match previous one.
     */
    toMatchImageSnapshot(): Chainable<any>;
  }
}
