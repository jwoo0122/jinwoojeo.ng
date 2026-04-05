export class SiteLayout extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          padding: 1rem;
        }
        .header {
          font-size: 1.2rem;
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
          color: var(--text-muted);
        }
        .footer {
          margin-top: 4rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .divider {
          width: 100%;
          margin: auto;
          margin-bottom: 2rem;
          height: 1px;
          background-color: var(--border-muted);
        }

        @media (min-width: 960px) {
          :host {
            display: grid;
            grid-template-columns: auto auto;
            column-gap: 2rem;
            width: fit-content;
            margin-top: 3rem;
          }
          .header {
            position: sticky;
            top: 1rem;
            align-self: start;
            text-align: right;
            white-space: nowrap;
            margin-bottom: 0;
          }
          .divider {
            display: none;
          }
          .content {
            max-width: 40rem;
          }
          .footer {
            grid-column: 2;
          }
        }
      </style>
      <div class="header">
        <div>
          <span class="site-title">정 진우</span>
        </div>
        <div>
          <a class="nav-link" href="/">소개</a>
          <a class="nav-link" href="/posts">기록</a>
          <a class="nav-link" href="https://github.com/jwoo0122" target="_blank">GitHub</a>
        </div>
      </div>
      <div class="divider">
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <footer class="footer">
        &copy; <span id="year"></span> Jinwoo Jeong. All rights reserved.
      </footer>
    `;
    shadow.getElementById('year').textContent = new Date().getFullYear();
  }
}
customElements.define('site-layout', SiteLayout);
