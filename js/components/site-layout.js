export class SiteLayout extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 40rem;
          padding: 1rem;
        }
        .header {
          margin-bottom: 2rem;
        }
        .site-title {
          font-weight: 700;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        .nav-link {
          display: block;
          margin: 0.75rem 0;
          color: var(--menu-color);
        }
        .footer {
          margin-top: 4rem;
          font-size: 0.875rem;
          color: var(--footer-color);
        }
        .divider {
          width: 100%;
          margin: auto;
          margin-bottom: 2rem;
          height: 1px;
          background-color: rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 960px) {
          .header {
            position: fixed;
            top: 1rem;
            right: calc(50% + 20rem + 2rem);
            flex-direction: column;
            margin-bottom: 0;
            text-align: right;
            white-space: nowrap;
          }
          .divider {
            display: none;
          }
        }
      </style>
      <div class="header">
        <div>
          <span class="site-title">Jinwoo Jeong</span>
        </div>
        <div>
          <a class="nav-link" href="/">About</a>
          <a class="nav-link" href="/posts">Posts</a>
          <a class="nav-link" href="https://github.com/jwoo0122" target="_blank">GitHub</a>
        </div>
      </div>
      <div class="divider">
      </div>
      <slot></slot>
      <footer class="footer">
        &copy; <span id="year"></span> Jinwoo Jeong. All rights reserved.
      </footer>
    `;
    shadow.getElementById('year').textContent = new Date().getFullYear();
  }
}
customElements.define('site-layout', SiteLayout);
