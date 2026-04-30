export const BLOG_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F4F7F6" />
          <stop offset="100%" stop-color="#E5ECE6" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <rect x="120" y="140" width="960" height="520" rx="32" fill="#ffffff" fill-opacity="0.82" />
      <rect x="200" y="240" width="440" height="28" rx="14" fill="#1F8A84" fill-opacity="0.88" />
      <rect x="200" y="300" width="700" height="18" rx="9" fill="#64748b" fill-opacity="0.55" />
      <rect x="200" y="340" width="620" height="18" rx="9" fill="#64748b" fill-opacity="0.38" />
      <rect x="200" y="380" width="660" height="18" rx="9" fill="#64748b" fill-opacity="0.38" />
      <circle cx="925" cy="320" r="92" fill="#1F8A84" fill-opacity="0.12" />
      <path d="M865 400c38-62 86-112 144-150 24 18 46 40 66 66-44 58-92 106-146 146-24-14-45-34-64-62Z" fill="#1F8A84" fill-opacity="0.22" />
      <text x="200" y="470" font-family="Georgia, serif" font-size="46" fill="#0f172a">Sacred Homes Journal</text>
      <text x="200" y="528" font-family="Arial, sans-serif" font-size="28" fill="#475569">Stories, travel notes, and local insights</text>
    </svg>
  `);
