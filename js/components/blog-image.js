export class BlogImage extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const src = this.getAttribute('src');
    const alt = this.getAttribute('alt') || '';

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 1.5rem auto;
          text-align: center;
        }
        img {
          max-width: 100%;
          border-radius: 0.375rem;
        }
      </style>
      <img src="/images/${src}" alt="${alt}" loading="lazy">
    `;
  }
}

customElements.define('blog-image', BlogImage);
