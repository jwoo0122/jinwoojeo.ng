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
          width: fit-content;
        }
        .header {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .site-title {
          margin: 0 0 0.7rem 0;
          font-weight: 500;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        .nav-link {
          margin: 0 0 0.85rem 0;
          color: var(--text-muted);
          font-weight: 500;
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
        .content {
          max-width: 34rem;
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
          .footer {
            grid-column: 2;
          }
        }
      </style>
      <div class="header">
        <div>
          <h4 class="site-title">정 진우</h4>
        </div>
        <div>
          <a href="/"><h4 class="nav-link">인사</h4></a>
          <a href="/posts"><h4 class="nav-link" href="/posts">생각한 것들</h4></a>
          <a href="https://github.com/jwoo0122" target="_blank"><h4 class="nav-link">GitHub ↗</h4></a>
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
