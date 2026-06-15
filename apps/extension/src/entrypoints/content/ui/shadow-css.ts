// Extra CSS injected into the Shadow DOM (keyframes + box-sizing baseline). Component styling is
// inline (tokenized 1:1 from Figma); this file only holds what inline styles can't express
// (animations) and a defensive reset inside our isolated root. Host CSS cannot reach here (WXT
// applies `all: initial` to the shadow root; inheritStyles stays false).

export const shadowCss = `
:host { all: initial; }
* { box-sizing: border-box; }
@keyframes grabit-spin { to { transform: rotate(360deg); } }
@keyframes grabit-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.32); }
`;
