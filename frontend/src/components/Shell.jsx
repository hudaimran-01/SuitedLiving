export function Shell({ route, savedCount, lowVision, children }) {
  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="wrap header-inner">
          <a className="brand" href="#/">
            <img className="mark" src="/logo.png" alt="" width="42" height="42" />
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
