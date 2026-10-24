// Likes, star ratings and favourite-dimension votes, shared across all visitors.
// Counts live in the free Abacus counter API (no signup). Each browser votes once (remembered in localStorage).
(function () {
  const API = "https://abacus.jasoncameron.dev", NS = "hd-lab-ramakrishnadandu";
  const $ = id => document.getElementById(id);
  const store = {
    get(k) { try { return localStorage.getItem("hd-fb-" + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("hd-fb-" + k, v); } catch (e) {} }
  };
  async function get(key) {
    const r = await fetch(`${API}/get/${NS}/${key}`);
    if (r.status === 404) return 0;
    if (!r.ok) throw new Error(r.status);
    return (await r.json()).value || 0;
  }
  async function hit(key) {
    const r = await fetch(`${API}/hit/${NS}/${key}`);
    if (!r.ok) throw new Error(r.status);
    return (await r.json()).value;
  }
  const fmt = n => n.toLocaleString("en-IN");

  // ---------- Likes (floating button + card) ----------
  let likes = null;
  const likeBtns = [$("likeFab"), $("likeBig")];
  function paintLikes() {
    const liked = store.get("liked") === "1";
    likeBtns.forEach(b => { b.classList.toggle("on", liked); b.setAttribute("aria-pressed", liked); });
    $("likeFabCount").textContent = likes == null ? "" : fmt(likes);
    $("likeBigCount").textContent = likes == null ? "—" : fmt(likes);
    $("likeNote").textContent = liked ? "Thanks for the like!" : "Tap the heart if you enjoyed exploring.";
  }
  async function like() {
    if (store.get("liked") === "1") return;
    store.set("liked", "1"); likes = (likes || 0) + 1; paintLikes();
    likeBtns.forEach(b => { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); });
    try { likes = await hit("likes"); paintLikes(); }
    catch (e) { $("likeNote").textContent = "Saved here, but the counter could not be reached. Try again later."; }
  }
  likeBtns.forEach(b => b.addEventListener("click", like));
  get("likes").then(v => { likes = v; paintLikes(); }).catch(() => { paintLikes(); });
  paintLikes();

  // ---------- Star rating ----------
  const counts = [0, 0, 0, 0, 0];
  const starInput = $("starInput");
  for (let s = 1; s <= 5; s++) {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.s = s; b.setAttribute("aria-label", `${s} star${s > 1 ? "s" : ""}`);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z"/></svg>';
    b.addEventListener("mouseenter", () => hover(s));
    b.addEventListener("focus", () => hover(s));
    b.addEventListener("click", () => rate(s));
    starInput.appendChild(b);
  }
  starInput.addEventListener("mouseleave", () => hover(0));
  function hover(s) {
    const mine = +store.get("rated") || 0, show = s || mine;
    [...starInput.children].forEach(b => b.classList.toggle("lit", +b.dataset.s <= show));
  }
  function paintRating() {
    const total = counts.reduce((a, b) => a + b, 0);
    const avg = total ? counts.reduce((a, c, i) => a + c * (i + 1), 0) / total : 0;
    $("rateAvg").textContent = total ? avg.toFixed(1) : "—";
    $("rateStars").style.setProperty("--pct", (avg / 5 * 100) + "%");
    $("rateStars").setAttribute("aria-label", total ? `Average ${avg.toFixed(1)} out of 5` : "No ratings yet");
    $("rateCount").textContent = total ? `from ${fmt(total)} rating${total > 1 ? "s" : ""}` : "Be the first to rate";
    $("rateBars").innerHTML = [5, 4, 3, 2, 1].map(s => {
      const c = counts[s - 1], p = total ? c / total * 100 : 0;
      return `<div class="bar-row"><span class="mono">${s}★</span><span class="bar"><i style="width:${p}%"></i></span><span class="mono">${fmt(c)}</span></div>`;
    }).join("");
    const mine = +store.get("rated") || 0;
    starInput.classList.toggle("done", !!mine);
    [...starInput.children].forEach(b => { b.disabled = !!mine; });
    $("rateNote").textContent = mine ? `You rated ${mine} star${mine > 1 ? "s" : ""}. Thank you!` : "Your rating";
    hover(0);
  }
  async function rate(s) {
    if (store.get("rated")) return;
    store.set("rated", String(s)); counts[s - 1]++; paintRating();
    try { counts[s - 1] = await hit("rate-" + s); paintRating(); }
    catch (e) { $("rateNote").textContent = "Saved here, but the counter could not be reached."; }
  }

  // ---------- Favourite dimension ----------
  const fav = new Array(12).fill(0), favGrid = $("favGrid");
  function paintFav() {
    const total = fav.reduce((a, b) => a + b, 0), max = Math.max(1, ...fav), mine = store.get("fav");
    favGrid.innerHTML = HD.dimensions.map(d => {
      const c = fav[d.n], p = c / max * 100, me = mine === String(d.n);
      return `<button type="button" class="fav${me ? " mine" : ""}" data-n="${d.n}" ${mine != null ? "disabled" : ""} aria-label="Vote for ${d.n}D, ${d.short}: ${c} votes">
        <span class="fn">${d.n}D</span><span class="fs">${d.short}</span>
        <span class="fbar"><i style="height:${p}%"></i></span><span class="fc mono">${fmt(c)}</span></button>`;
    }).join("");
    $("favNote").textContent = mine != null ? `You picked ${mine}D · ${fmt(total)} vote${total === 1 ? "" : "s"} so far` : `${fmt(total)} vote${total === 1 ? "" : "s"} so far · tap one to vote`;
    favGrid.querySelectorAll("button").forEach(b => b.addEventListener("click", () => vote(+b.dataset.n)));
  }
  async function vote(n) {
    if (store.get("fav") != null) return;
    store.set("fav", String(n)); fav[n]++; paintFav();
    try { fav[n] = await hit("fav-" + n); paintFav(); }
    catch (e) { $("favNote").textContent = "Saved here, but the counter could not be reached."; }
  }

  // load rating + votes only when the section comes into view (keeps page-load requests low)
  paintRating(); paintFav();
  let loaded = false;
  new IntersectionObserver(es => {
    if (loaded || !es[0].isIntersecting) return; loaded = true;
    Promise.all([1, 2, 3, 4, 5].map(s => get("rate-" + s)))
      .then(v => { v.forEach((c, i) => counts[i] = Math.max(counts[i], c)); paintRating(); })
      .catch(() => { $("rateCount").textContent = "Ratings unavailable right now"; });
    Promise.all(HD.dimensions.map(d => get("fav-" + d.n)))
      .then(v => { v.forEach((c, i) => fav[i] = Math.max(fav[i], c)); paintFav(); })
      .catch(() => { $("favNote").textContent = "Votes unavailable right now"; });
  }, { rootMargin: "300px" }).observe($("feedback"));
})();
