export class BlogImage extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const src = this.getAttribute('src');
    const alt = this.getAttribute('alt') || '';

    shadow.innerHTML = `
      <style>
        :host {
        }
        img {
          max-width: 100%;
        }
      </style>
      <img src="/images/${src}" alt="${alt}" loading="lazy">
    `;
  }
}

customElements.define('blog-image', BlogImage);
