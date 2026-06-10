/* ============================================
   가림약국 키우기 — 치비 캐릭터 SVG
   표지(다 해먹는 2회차 동네약사) 기반 캐주얼화
   ============================================ */

const CHARS = (() => {
  const SKIN = "#ffe3c9", SKIN_SH = "#f7c9a3", BLUSH = "#ffb3a0";

  /* 공통: 얼굴 (눈/입/볼) */
  function face(cx, cy, opt = {}) {
    const eyeY = cy + 1.5, dx = opt.eyeGap || 5.2;
    const eyes = opt.closedEyes
      ? `<path d="M${cx - dx - 2} ${eyeY} q2 2 4 0" stroke="#4a3f35" stroke-width="1.4" fill="none" stroke-linecap="round"/>
         <path d="M${cx + dx - 2} ${eyeY} q2 2 4 0" stroke="#4a3f35" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      : `<circle cx="${cx - dx}" cy="${eyeY}" r="1.7" fill="#4a3f35"/>
         <circle cx="${cx + dx}" cy="${eyeY}" r="1.7" fill="#4a3f35"/>
         <circle cx="${cx - dx + 0.6}" cy="${eyeY - 0.6}" r="0.55" fill="#fff"/>
         <circle cx="${cx + dx + 0.6}" cy="${eyeY - 0.6}" r="0.55" fill="#fff"/>`;
    const mouth = opt.openMouth
      ? `<ellipse cx="${cx}" cy="${cy + 6.4}" rx="2.2" ry="2.8" fill="#a4604f"/><ellipse cx="${cx}" cy="${cy + 7.2}" rx="1.4" ry="1.5" fill="#e08a78"/>`
      : `<path d="M${cx - 2.4} ${cy + 5.8} q2.4 2.6 4.8 0" stroke="#a4604f" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    return `${eyes}${mouth}
      <ellipse cx="${cx - dx - 3.4}" cy="${cy + 4.6}" rx="2.1" ry="1.3" fill="${BLUSH}" opacity=".55"/>
      <ellipse cx="${cx + dx + 3.4}" cy="${cy + 4.6}" rx="2.1" ry="1.3" fill="${BLUSH}" opacity=".55"/>`;
  }

  const wrap = (inner, w = 64, h = 64) =>
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  /* ---------- 주인공: 임가민 (표지 캐주얼화) ---------- */
  function gamin() {
    return wrap(`
      <!-- 표지 느낌: 선한 미소, 짙은 가르마, 흰 가운, 남색 넥타이 -->
      <rect x="25.4" y="56" width="4.8" height="6" rx="2.2" fill="#39445a"/>
      <rect x="33.8" y="56" width="4.8" height="6" rx="2.2" fill="#39445a"/>
      <path d="M18.8 41.5 q13.2 -8 26.4 0 l2.8 16.8 q-16 5.2 -32 0 z" fill="#fffdf8"/>
      <path d="M18.8 41.5 q13.2 -8 26.4 0 l2.8 16.8 q-16 5.2 -32 0 z" fill="none" stroke="#d8d2c7" stroke-width="1.1"/>
      <path d="M27 39.5 q5 -2.6 10 0 l-1.1 10 -7.8 0 z" fill="#eef8ff"/>
      <path d="M30.7 41 l2.7 0 l1.3 8 -2.7 2.9 -2.7 -2.9 z" fill="#263b66"/>
      <path d="M30.1 43.5 l3.8 2.2" stroke="#6f85b7" stroke-width=".8" stroke-linecap="round"/>
      <path d="M29.6 46.5 l4.6 2.6" stroke="#6f85b7" stroke-width=".8" stroke-linecap="round"/>
      <path d="M26.8 39.8 l5 5.6 -5.6 3.1 -2.1 -7.3 z" fill="#fff"/>
      <path d="M37.2 39.8 l-5 5.6 5.6 3.1 2.1 -7.3 z" fill="#fff"/>
      <path d="M18.7 45 q13.3 8.8 26.6 0 l1.2 6.5 q-14.5 7.5 -29 0 z" fill="#f3f0e9"/>
      <path d="M21.6 50 a3.2 3.2 0 1 0 .2 0" fill="${SKIN}"/>
      <path d="M42.4 50 a3.2 3.2 0 1 0 .2 0" fill="${SKIN}"/>
      <rect x="38.3" y="51.4" width="6.4" height="5.3" rx="1.1" fill="#f7fbfa" stroke="#d7d1c5" stroke-width=".8"/>
      <rect x="39.7" y="49.4" width="1.2" height="4.7" rx=".6" fill="#263b66"/>
      <rect x="41.8" y="49.7" width="1.2" height="4.2" rx=".6" fill="#4cb8a4"/>
      <circle cx="32" cy="26.3" r="15.2" fill="${SKIN}"/>
      <circle cx="16.8" cy="28.2" r="2.6" fill="${SKIN}"/>
      <circle cx="47.2" cy="28.2" r="2.6" fill="${SKIN}"/>
      <path d="M16.5 25.7 q-.3 -14.2 15.4 -16 q15.7 1.8 15.6 16 q-2.4 -5.2 -5.9 -7.8 q-3.1 3.7 -7.2 1.1 q-2.8 4.1 -6.8.6 q-3 3.3 -6.8 1.7 q-2.5 2.2 -4.3 4.4z" fill="#2d241f"/>
      <path d="M31.5 9.8 q6.7 1 9.7 7.1 q-5.2 -2.3 -9.5.1 q-5 -2.2 -10.1.5 q2.8 -6.2 9.9 -7.7z" fill="#3c2c25"/>
      <path d="M30.8 11.2 q-.8 8.5 -6.8 13.1 q7.5 -2.3 9.3 -11.4z" fill="#1f1917" opacity=".85"/>
      <path d="M33.5 12 q4.6 2.2 6.2 8.6 q-4.5 -3 -8.5 -1.2z" fill="#49352c" opacity=".9"/>
      <path d="M20.2 18.5 q4.3 -6.8 11.8 -7.5" stroke="#6f5040" stroke-width="1.3" opacity=".55" stroke-linecap="round"/>
      ${face(32, 27.5, { eyeGap: 5.5 })}
    `);
  }

  /* ---------- 고객들 ---------- */

  /* 꽃무늬 할머니 */
  function grandma() {
    return wrap(`
      <rect x="27" y="57" width="4" height="5" rx="2" fill="#9c8a7a"/>
      <rect x="33" y="57" width="4" height="5" rx="2" fill="#9c8a7a"/>
      <path d="M21 42 q11 -6 22 0 l3 16 q-14 4.5 -28 0 z" fill="#f2a7c3"/>
      <circle cx="27" cy="48" r="1.6" fill="#fff" opacity=".85"/><circle cx="36" cy="51" r="1.6" fill="#fff" opacity=".85"/>
      <circle cx="31" cy="55" r="1.6" fill="#fff" opacity=".85"/><circle cx="40" cy="47" r="1.6" fill="#fff" opacity=".85"/>
      <circle cx="20.5" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="43.5" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="27" r="14.5" fill="${SKIN}"/>
      <path d="M18 27 q-1.5 -13.5 14 -13.5 q15.5 0 14 13.5 q-1.5 -5 -4 -7.5 q-9 4.5 -20 0 q-2.5 2.5 -4 7.5z" fill="#cfd4dc"/>
      <circle cx="22" cy="15.5" r="3.4" fill="#cfd4dc"/><circle cx="32" cy="12.5" r="3.8" fill="#cfd4dc"/><circle cx="42" cy="15.5" r="3.4" fill="#cfd4dc"/>
      <circle cx="16.6" cy="29" r="2.4" fill="${SKIN}"/><circle cx="47.4" cy="29" r="2.4" fill="${SKIN}"/>
      ${face(32, 28, { closedEyes: true })}
    `);
  }

  /* 중절모 할아버지 */
  function grandpa() {
    return wrap(`
      <rect x="26" y="56" width="4.4" height="6" rx="2.2" fill="#7a6a58"/>
      <rect x="33.6" y="56" width="4.4" height="6" rx="2.2" fill="#7a6a58"/>
      <path d="M21 42 q11 -6 22 0 l2.5 16 q-13.5 4.5 -27 0 z" fill="#b9a988"/>
      <path d="M27 41 q5 -2.5 10 0 l-1 7 -8 0z" fill="#e8e2d2"/>
      <rect x="45" y="44" width="2.4" height="17" rx="1.2" fill="#9c6b3f"/>
      <circle cx="46.2" cy="43.5" r="2" fill="#b9854f"/>
      <circle cx="20.5" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="28" r="14" fill="${SKIN}"/>
      <path d="M19 24 q0 -3 2 -5 l22 0 q2 2 2 5 z" fill="#5d6d7e"/>
      <rect x="15.5" y="22.5" width="33" height="3.4" rx="1.7" fill="#4a5866"/>
      <path d="M21 16 q5 -4.5 11 -4.5 q6 0 11 4.5 l-22 0z" fill="#5d6d7e"/>
      <path d="M26 36.5 q6 3.5 12 0 q-2 4.5 -6 4.5 q-4 0 -6 -4.5z" fill="#e8e2d2"/>
      <circle cx="17.2" cy="29.5" r="2.4" fill="${SKIN}"/><circle cx="46.8" cy="29.5" r="2.4" fill="${SKIN}"/>
      ${face(32, 28.5, { closedEyes: true })}
    `);
  }

  /* 회사원 */
  function office() {
    return wrap(`
      <rect x="26" y="56" width="4.4" height="6" rx="2.2" fill="#3f4a5a"/>
      <rect x="33.6" y="56" width="4.4" height="6" rx="2.2" fill="#3f4a5a"/>
      <path d="M21 42 q11 -6.5 22 0 l2.5 16 q-13.5 4.5 -27 0 z" fill="#56688a"/>
      <path d="M28.5 40.5 q3.5 -2 7 0 l-1 7.5 -5 0z" fill="#fff"/>
      <path d="M31 42 l2 0 l.8 5.8 -1.8 1.8 -1.8 -1.8z" fill="#d96a6a"/>
      <rect x="40" y="47" width="8" height="9" rx="1.6" fill="#8a6f4e"/>
      <rect x="42.6" y="45.5" width="2.8" height="2.6" rx="1.2" fill="none" stroke="#8a6f4e" stroke-width="1.4"/>
      <circle cx="20.5" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="27" r="14" fill="${SKIN}"/>
      <path d="M18.5 26 q-1 -13 13.5 -13 q14.5 0 13.5 13 q-2 -3.5 -3.6 -6.2 q-2.8 2.8 -5 -1 q-3.2 3.4 -6 -.4 q-3 3.8 -5.4 .6 q-2.2 2.6 -4 1 q-1.6 2.6 -3 6z" fill="#3e3128"/>
      <circle cx="17.2" cy="28.5" r="2.4" fill="${SKIN}"/><circle cx="46.8" cy="28.5" r="2.4" fill="${SKIN}"/>
      ${face(32, 27.5)}
    `);
  }

  /* 긴머리 여성 */
  function woman() {
    return wrap(`
      <rect x="26.5" y="56" width="4.2" height="6" rx="2.1" fill="#c98d6b"/>
      <rect x="33.3" y="56" width="4.2" height="6" rx="2.1" fill="#c98d6b"/>
      <path d="M22 42 q10 -6 20 0 l2.5 15.5 q-12.5 4.5 -25 0 z" fill="#f6c34c"/>
      <path d="M22 42 q10 -6 20 0 l.6 4 q-10.6 5 -21.2 0 z" fill="#fff" opacity=".25"/>
      <circle cx="21" cy="49.5" r="3" fill="${SKIN}"/>
      <circle cx="43" cy="49.5" r="3" fill="${SKIN}"/>
      <path d="M17 30 q-2 22 5 27 l4 -3 q-4 -8 -2 -18z" fill="#6e4a32"/>
      <path d="M47 30 q2 22 -5 27 l-4 -3 q4 -8 2 -18z" fill="#6e4a32"/>
      <circle cx="32" cy="27" r="14" fill="${SKIN}"/>
      <path d="M18 28 q-1.5 -15 14 -15 q15.5 0 14 15 q-2 -6 -4.5 -8.5 q-9.5 5 -19 0 q-2.5 2.5 -4.5 8.5z" fill="#7a5238"/>
      <circle cx="44" cy="16" r="2.2" fill="#ff9aa8"/>
      ${face(32, 28)}
    `);
  }

  /* 유치원 아이 */
  function kid() {
    return wrap(`
      <rect x="27.5" y="55" width="4" height="6" rx="2" fill="#f0c948"/>
      <rect x="32.5" y="55" width="4" height="6" rx="2" fill="#f0c948"/>
      <path d="M23.5 44 q8.5 -5 17 0 l2 12.5 q-10.5 4 -21 0 z" fill="#ffd95e"/>
      <rect x="29" y="46" width="6" height="6" rx="1.4" fill="#fff" opacity=".5"/>
      <circle cx="22.5" cy="50.5" r="2.8" fill="${SKIN}"/>
      <circle cx="41.5" cy="50.5" r="2.8" fill="${SKIN}"/>
      <circle cx="32" cy="29" r="13.5" fill="${SKIN}"/>
      <path d="M19.5 27 q0 -11 12.5 -11 q12.5 0 12.5 11 l-3 2 q-1 -5 -3 -7 q-6.5 3.6 -13 0 q-2 2 -3 7z" fill="#4e3b2b"/>
      <path d="M18.5 27.5 q13.5 -5 27 0 l-1 2.6 q-12.5 -4.4 -25 0z" fill="#ffd95e"/>
      <path d="M24 17 q8 -4 16 0 l-2 4 q-6 -2.6 -12 0z" fill="#ffd95e"/>
      <circle cx="32" cy="14.5" r="2" fill="#ff8d6e"/>
      ${face(32, 30, { openMouth: true })}
    `);
  }

  /* 공사장 아저씨 */
  function worker() {
    return wrap(`
      <rect x="26" y="56" width="4.4" height="6" rx="2.2" fill="#5a6a52"/>
      <rect x="33.6" y="56" width="4.4" height="6" rx="2.2" fill="#5a6a52"/>
      <path d="M21 42 q11 -6 22 0 l2.5 16 q-13.5 4.5 -27 0 z" fill="#7d9468"/>
      <rect x="27" y="42" width="10" height="13" rx="1.6" fill="#f4a93c"/>
      <rect x="29.5" y="42" width="2" height="13" fill="#e08a2c"/><rect x="32.5" y="42" width="2" height="13" fill="#e08a2c"/>
      <circle cx="20.5" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="43.5" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="28" r="13.8" fill="${SKIN}"/>
      <path d="M19 26 q0 -11.5 13 -11.5 q13 0 13 11.5z" fill="#f4c93c"/>
      <rect x="17" y="24.5" width="30" height="3.6" rx="1.8" fill="#e0ae28"/>
      <rect x="30" y="13" width="4" height="5" rx="1.6" fill="#f4c93c"/>
      <circle cx="17" cy="30" r="2.4" fill="${SKIN}"/><circle cx="47" cy="30" r="2.4" fill="${SKIN}"/>
      <path d="M27 37.5 q5 2.6 10 0" stroke="#7a5a45" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      ${face(32, 29)}
    `);
  }

  /* 교복 학생 */
  function student() {
    return wrap(`
      <rect x="26.5" y="56" width="4.2" height="6" rx="2.1" fill="#4a5364"/>
      <rect x="33.3" y="56" width="4.2" height="6" rx="2.1" fill="#4a5364"/>
      <rect x="18" y="42" width="7" height="13" rx="3" fill="#d96a6a"/>
      <path d="M22 42 q10 -6 20 0 l2.5 16 q-12.5 4.5 -25 0 z" fill="#5a6a8a"/>
      <path d="M28.5 41 q3.5 -2 7 0 l-.8 6 -5.4 0z" fill="#fff"/>
      <path d="M30.5 42.5 l3 0 l-1.5 3z" fill="#d96a6a"/>
      <circle cx="44" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="27" r="14" fill="${SKIN}"/>
      <path d="M18.5 26 q-1 -13 13.5 -13 q14.5 0 13.5 13 q-2.5 -4 -4 -6.5 q-3 3 -5.6 -.6 q-3.4 3.6 -6.4 0 q-2.6 3.4 -5 .6 q-2.5 2.5 -6 6.5z" fill="#2e2620"/>
      <circle cx="17.2" cy="28.5" r="2.4" fill="${SKIN}"/><circle cx="46.8" cy="28.5" r="2.4" fill="${SKIN}"/>
      ${face(32, 27.5)}
    `);
  }

  /* 임산부 */
  function pregnant() {
    return wrap(`
      <rect x="27" y="56.5" width="4.2" height="5.5" rx="2.1" fill="#b98a9c"/>
      <rect x="33" y="56.5" width="4.2" height="5.5" rx="2.1" fill="#b98a9c"/>
      <path d="M22 42 q10 -6 20 0 q6 8 1.5 16 q-11.5 4 -23 0 q-4.5 -8 1.5 -16z" fill="#e8a7bb"/>
      <circle cx="32" cy="51" r="6.5" fill="#f2bccb"/>
      <circle cx="21" cy="48.5" r="3" fill="${SKIN}"/>
      <circle cx="43" cy="48.5" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="27" r="14" fill="${SKIN}"/>
      <path d="M18 28 q-1.5 -15 14 -15 q15.5 0 14 15 q-2 -6.5 -4.5 -9 q-9.5 5 -19 0 q-2.5 2.5 -4.5 9z" fill="#3e3128"/>
      <path d="M44 26 q4 1 3.5 5 q-3 -1 -3.5 -5z" fill="#3e3128"/>
      <circle cx="20" cy="15.5" r="2.2" fill="#f6c34c"/>
      ${face(32, 28, { closedEyes: true })}
    `);
  }

  /* 수상한 특수 환자 (후드) */
  function mystery() {
    return wrap(`
      <rect x="26" y="56" width="4.4" height="6" rx="2.2" fill="#6b5e80"/>
      <rect x="33.6" y="56" width="4.4" height="6" rx="2.2" fill="#6b5e80"/>
      <path d="M20 40 q12 -8 24 0 l3 18 q-15 5 -30 0 z" fill="#8a7aa8"/>
      <path d="M20 40 q12 -8 24 0 l.8 5 q-12.8 6 -25.6 0 z" fill="#7a6a98"/>
      <circle cx="19.5" cy="49" r="3" fill="${SKIN}"/>
      <circle cx="44.5" cy="49" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="27.5" r="13.5" fill="${SKIN}"/>
      <path d="M16.5 30 q-2 -18 15.5 -18 q17.5 0 15.5 18 q-1 -7 -4 -10 q-11.5 -5.5 -23 0 q-3 3 -4 10z" fill="#8a7aa8"/>
      <path d="M16.5 30 q1.5 4 5 4.5 q-1 -5 0 -9.5 q-3.5 1.5 -5 5z" fill="#7a6a98"/>
      <path d="M47.5 30 q-1.5 4 -5 4.5 q1 -5 0 -9.5 q3.5 1.5 5 5z" fill="#7a6a98"/>
      <text x="44" y="16" font-size="13" font-family="sans-serif">❓</text>
      ${face(32, 28.5)}
    `);
  }

  /* ---------- 동료들: 원작 말투/역할 기반 치비화 ---------- */
  function staffBase(opt) {
    return wrap(`
      <rect x="26" y="56" width="4.4" height="6" rx="2.2" fill="${opt.shoe || "#59606d"}"/>
      <rect x="33.6" y="56" width="4.4" height="6" rx="2.2" fill="${opt.shoe || "#59606d"}"/>
      <path d="M20.5 42 q11.5 -6.6 23 0 l2.7 16 q-14.2 4.7 -28.4 0 z" fill="${opt.body}"/>
      <path d="M27.8 40.2 q4.2 -2.2 8.4 0 l-.9 7.2 -6.6 0z" fill="${opt.inner || "#fff"}"/>
      <circle cx="20.2" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="43.8" cy="50" r="3" fill="${SKIN}"/>
      <circle cx="32" cy="27.5" r="14" fill="${SKIN}"/>
      ${opt.hair}
      <circle cx="17.2" cy="29" r="2.3" fill="${SKIN}"/>
      <circle cx="46.8" cy="29" r="2.3" fill="${SKIN}"/>
      ${opt.extra || ""}
      ${face(32, 28, opt.face || {})}
      ${opt.item || ""}
    `);
  }

  const STAFF = {
    miso: () => staffBase({
      body: "#b9d7ec",
      inner: "#f8fdff",
      hair: `<path d="M18 28 q-1.2 -13.2 14 -13.2 q15.2 0 14 13.2 q-2 -5 -5 -7.4 q-8.7 4.2 -18 0 q-3 2.4 -5 7.4z" fill="#2f3038"/>
             <path d="M20 31 q3 6 8 8 q-5 .5 -8 -2.8z" fill="#2f3038"/>
             <path d="M44 31 q-3 6 -8 8 q5 .5 8 -2.8z" fill="#2f3038"/>`,
      extra: `<rect x="23" y="28" width="18" height="5.5" rx="2.6" fill="none" stroke="#5b6678" stroke-width="1"/>`,
      item: `<rect x="39" y="45" width="8" height="11" rx="1.5" fill="#f7fbff" stroke="#8aaac0" stroke-width="1"/>
             <path d="M40.5 48 h5" stroke="#8aaac0" stroke-width=".8"/><path d="M40.5 51 h4" stroke="#8aaac0" stroke-width=".8"/>
             <text x="17" y="18" font-size="9">❄️</text>`,
    }),
    junghwa: () => staffBase({
      body: "#fffdf8",
      inner: "#dff5ef",
      hair: `<path d="M18.5 27 q-.8 -12.5 13.5 -12.5 q14.3 0 13.5 12.5 q-2 -4.2 -4.5 -6.5 q-9 4.5 -18 0 q-2.5 2.3 -4.5 6.5z" fill="#51392e"/>
             <circle cx="41.8" cy="16.4" r="4.1" fill="#51392e"/>`,
      item: `<path d="M25 43 q7 6 14 0" stroke="#4cb8a4" stroke-width="1.5" fill="none"/>
             <circle cx="24.5" cy="43" r="1.5" fill="#4cb8a4"/><circle cx="39.5" cy="43" r="1.5" fill="#4cb8a4"/>`,
      face: { closedEyes: true },
    }),
    ari: () => staffBase({
      body: "#f7b15c",
      inner: "#fff8e8",
      hair: `<path d="M19 27 q-.8 -12.8 13 -12.8 q13.8 0 13 12.8 q-1.8 -4.2 -4.6 -6.4 q-8.4 4 -16.8 0 q-2.8 2.2 -4.6 6.4z" fill="#2f2720"/>
             <path d="M43 21 q8 4 6 11 q-4 -4 -8 -5z" fill="#2f2720"/>`,
      item: `<text x="42" y="19" font-size="10">💪</text>`,
      face: { openMouth: true },
    }),
    yesol: () => staffBase({
      body: "#a9d58b",
      inner: "#fffef1",
      hair: `<path d="M19 27 q-.8 -12.5 13 -12.5 q13.8 0 13 12.5 q-2 -4.5 -4.8 -6.7 q-8.2 4 -16.4 0 q-2.8 2.2 -4.8 6.7z" fill="#4b3328"/>
             <circle cx="19" cy="26" r="4" fill="#4b3328"/><circle cx="45" cy="26" r="4" fill="#4b3328"/>`,
      item: `<text x="43" y="18" font-size="10">⏱️</text>`,
      face: { openMouth: true },
    }),
    hyunil: () => staffBase({
      body: "#b8c48a",
      inner: "#fff7d9",
      hair: `<path d="M19 25 q1 -10.5 13 -10.5 q12 0 13 10.5z" fill="#6b4a33"/>
             <rect x="18" y="23" width="28" height="3.2" rx="1.6" fill="#d6b15f"/>
             <path d="M27 36.5 q5 2.6 10 0" stroke="#6b4a33" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
      item: `<text x="17" y="18" font-size="10">🌾</text>`,
      face: { closedEyes: true },
    }),
    sujin: () => staffBase({
      body: "#c9ced8",
      inner: "#f4f6fa",
      hair: `<path d="M18.5 27 q-.7 -12.4 13.5 -12.4 q14.2 0 13.5 12.4 q-2.2 -4 -4.8 -6.2 q-8.7 4 -17.4 0 q-2.6 2.2 -4.8 6.2z" fill="#202329"/>`,
      extra: `<rect x="23.5" y="28" width="17" height="5.2" rx="1.4" fill="none" stroke="#202329" stroke-width="1"/>
              <path d="M32 28 v5" stroke="#202329" stroke-width="1"/>`,
      item: `<text x="44" y="18" font-size="10">…</text>`,
    }),
  };

  function staff(id) {
    return (STAFF[id] || STAFF.miso)();
  }

  const customers = [
    { svg: grandma,  talks: ["허리가 쑤셔서 왔어요", "임 약사 있는가?", "여기 약이 잘 들어", "우리 영감 약도 부탁해요"] },
    { svg: grandpa,  talks: ["혈압약 타러 왔습니다", "임 약사가 설명을 잘해줘", "콜록콜록…", "글씨가 안 보여서…"] },
    { svg: office,   talks: ["점심시간이라 바빠요!", "소화제 주세요", "야근했더니 머리가…", "처방전이요"] },
    { svg: woman,    talks: ["감기 기운이 있어서요", "여기가 그 유명한 약국?", "비타민도 하나 주세요", "애가 열이 나요"] },
    { svg: kid,      talks: ["딸기맛 비타민 주세요!", "주사 안 맞을래요…", "엄마가 가래요", "사탕도 있어요?"] },
    { svg: worker,   talks: ["어깨가 저릿저릿해요", "파스 큰 걸로요", "현장에서 바로 왔어요", "근육통 약이요"] },
    { svg: student,  talks: ["시험기간이라 죽겠어요", "카페인 너무 마셨나…", "눈이 침침해요", "졸음 안 오는 약 있어요?"] },
    { svg: pregnant, talks: ["임산부도 먹을 수 있나요?", "철분제 주세요", "입덧이 심해서요", "조심해서 지어주세요"] },
  ];

  return { gamin, mystery, staff, customers };
})();
