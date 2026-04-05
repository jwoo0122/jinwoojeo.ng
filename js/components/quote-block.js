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
          padding: 0.3rem 1rem;
          color: var(--text-muted);
        }
        .bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 0.1rem;
          height: 100%;
          background: var(--quote-bar);
        }
      </style>
      <div class="bar"></div>
      <slot></slot>
    `;

    this.classList.add(variant);
  }
}

customElements.define('quote-block', QuoteBlock);
