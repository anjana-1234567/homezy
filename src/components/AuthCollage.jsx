// NEW FILE  ->  src/components/AuthCollage.jsx
// Decorative illustration used on the Login and Register pages.
// Pure UI: no data, no API calls.

function Person({ x, y, w, h, k, hair, s, p }) {
  return (
    <use
      href="#hz-person"
      x={x}
      y={y}
      width={w}
      height={h}
      style={{ "--k": k, "--h": hair, "--s": s, "--p": p }}
    />
  );
}

function AuthCollage() {
  return (
    <div className="collage" aria-hidden="true">
      <div className="collage-room">
        <svg viewBox="0 0 440 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <symbol id="hz-person" viewBox="0 0 60 120">
              <rect x="14" y="76" width="14" height="40" rx="5" className="pl" />
              <rect x="32" y="76" width="14" height="40" rx="5" className="pl" />
              <rect x="12" y="34" width="36" height="46" rx="13" className="ps" />
              <rect x="3" y="38" width="11" height="36" rx="5.5" className="ps" />
              <rect x="46" y="38" width="11" height="36" rx="5.5" className="ps" />
              <rect x="26" y="28" width="8" height="10" className="pk" />
              <circle cx="30" cy="18" r="14" className="pk" />
              <path d="M15 17a15 15 0 0 1 30 0c-5-6-25-6-30 0z" className="ph" />
            </symbol>
          </defs>

          <rect width="440" height="360" fill="#f3ebe0" />
          <rect y="268" width="440" height="92" fill="#cdb490" />
          <rect x="330" y="26" width="92" height="150" rx="3" fill="#dff1ff" />
          <path
            d="M330 26h92v150h-92zM376 26v150M330 100h92"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
          />
          <rect x="56" y="38" width="120" height="36" rx="9" fill="#fff" />
          <path d="M70 62h92" stroke="#d5dbe3" strokeWidth="3" />
          <rect x="196" y="96" width="110" height="6" fill="#b08d62" />
          <rect x="206" y="78" width="14" height="18" rx="2" className="cl-sa" />
          <rect x="226" y="82" width="10" height="14" rx="2" fill="#6fbf8b" />
          <rect x="246" y="76" width="16" height="20" rx="2" fill="#fff" />
          <rect x="206" y="190" width="76" height="80" rx="7" fill="#eceff3" />
          <circle cx="244" cy="238" r="25" fill="#cfd6dd" stroke="#fff" strokeWidth="5" />
          <circle cx="244" cy="238" r="14" fill="#9fb0c3" />
          <rect x="344" y="150" width="14" height="76" rx="7" className="cl-sd" />

          <Person x={76} y={136} w={66} h={132} k="#d9a37c" hair="#2a1a14" s="var(--ac)" p="#2b1d16" />
          <Person x={146} y={148} w={58} h={120} k="#c98f68" hair="#1c1410" s="#2b6cb0" p="#2b2f3a" />
          <Person x={296} y={126} w={62} h={124} k="#e8b48a" hair="#3b2416" s="#20242c" p="#20242c" />
          <Person x={352} y={152} w={54} h={108} k="#e8b48a" hair="#1f1410" s="#e9b6c8" p="#e9b6c8" />
          <rect x="344" y="216" width="76" height="64" rx="12" className="cl-sd" />
          <Person x={96} y={196} w={104} h={208} k="#e8b48a" hair="#1f1410" s="#f2f0e6" p="#3b4a63" />
          <rect x="168" y="262" width="22" height="36" rx="4" fill="#1f1f2a" />
          <rect x="170" y="265" width="18" height="28" rx="2" className="cl-sa" />
        </svg>

        <span className="collage-tag" style={{ left: "15%", top: "26%" }}>
          Plumbing
        </span>
        <span className="collage-tag" style={{ left: "33%", top: "38%" }}>
          Appliance repair
        </span>
        <span className="collage-tag" style={{ left: "62%", top: "27%" }}>
          Beauty &amp; wellness
        </span>
      </div>

      <div className="collage-phone">
        <div className="cp-head">
          <b>&#8962; Homezy</b>
          <span>&#128205;</span>
        </div>
        <div className="cp-search">Search for services</div>
        <div className="cp-grid">
          <i>&#128688;</i>
          <i>&#9889;</i>
          <i>&#129529;</i>
          <i>&#10052;&#65039;</i>
        </div>
        <div className="cp-card">
          <small>Trusted professionals</small>
          <b>Book in minutes</b>
        </div>
        <div className="cp-btn">Book now</div>
      </div>

      <div className="collage-svc">
        <small>SERVICE</small>
        <b>AC Service &amp; Repair</b>
      </div>

      <div className="collage-brand">
        <u>H</u>
        <span>Homezy</span>
      </div>
    </div>
  );
}

export default AuthCollage;