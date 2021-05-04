export interface Chainable<Subject> {
  uploadFile(...args: any[]): any;

  hide(): any;
  /**
   * Take snapshot and then assert to match previous one
   */
  toMatchSnapshot(): Chainable<any>;
  /**
   * Take snapshot as image and then assert to match previous one.
   */
  toMatchImageSnapshot(): Chainable<any>;

  /**
   * Custom command to select DOM element by data-cy attribute.
   * @example cy.dataCy('greeting')
   */
  dataCy(value: string): Chainable<Element>;
  injectAxe(): Chainable<EventEmitter>;
  checkA11y(...args: any[]): Chainable<EventEmitter>;
}
