import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__left">
        <span className="footer__status-dot" aria-hidden="true" />
        <span className="footer__text">All processing runs locally</span>
      </div>
      <div className="footer__right">
        TOOLBOX v1.0
      </div>
    </footer>
  );
}
