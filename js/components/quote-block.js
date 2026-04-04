export class QuoteBlock extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const variant = this.getAttribute('variant') || 'default';

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          margin: 1rem 0;
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
        }
        :host(.default) {
          background: var(--quote-bg);
        }
        :host(.disclaimer) {
          background: var(--quote-disclaimer-bg);
        }
        .bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 0.25rem;
          height: 100%;
        }
        :host(.default) .bar {
          background: var(--quote-bar);
        }
        :host(.disclaimer) .bar {
          background: var(--quote-disclaimer-bar);
        }
      </style>
      <div class="bar"></div>
      <slot></slot>
    `;

    this.classList.add(variant);
  }
}

customElements.define('quote-block', QuoteBlock);
