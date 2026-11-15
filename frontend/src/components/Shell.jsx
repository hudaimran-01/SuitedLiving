export function Shell({ route, savedCount, lowVision, children }) {
  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="wrap header-inner">
          <a className="brand" href="#/">
            <svg className="mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
              <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="16" r="3" fill="currentColor" />
            </svg>
            <span>SuitedLiving</span>
          </a>
          <nav className="nav" aria-label="Primary">
            <a href="#/discover" aria-current={route.name === "discover" || route.name === "interior" ? "page" : undefined}>
              Homes
            </a>
            <a href="#/compare" aria-current={route.name === "compare" ? "page" : undefined}>
              Compare
              {savedCount > 0 ? <span className="nav-count">{savedCount}</span> : null}
            </a>
            <a
              className="nav-desk"
              href="#/admin"
              aria-current={route.name === "admin" ? "page" : undefined}
            >
              Listing desk
            </a>
          </nav>
        </div>
      </header>
      {lowVision ? (
        <p className="adapt" role="status">
          Text is larger while low vision is part of your search.
        </p>
      ) : null}
      <main id="main" className="wrap page">
        {children}
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <p>
            SuitedLiving reads the home and the block, and leaves gaps visible. It does not certify
            that either is accessible.
          </p>
          <p>
            Homes for sale in Houston and Los Angeles.{" "}
            <a href="#/admin">Listing desk</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
