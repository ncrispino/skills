/* Project proposal editor: contenteditable doc + vim keybindings + save-to-disk.
 *
 * The page's editable content lives in <main id="doc">. When served by
 * scripts/serve.py, edits are saved back into the same .html file (between the
 * DOC:START / DOC:END markers) so the user and Claude edit one file. The page
 * polls for on-disk changes and live-reloads Claude's edits when you have no
 * unsaved work; if both changed, a banner asks which version wins.
 *
 * Vim: normal / insert / visual modes on top of Selection.modify. "Line" ops
 * (dd, yy, cc, o, O, p) work on the current block (paragraph, list item,
 * heading) because a doc has soft-wrapped lines, not hard ones.
 */
(() => {
  "use strict";
  const doc = document.getElementById("doc");
  if (!doc) return;
  const PAGE = decodeURIComponent(location.pathname.replace(/^\//, ""));
  const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

  // ---------- chrome: top bar, status line, command line, banner, tooltip ----------
  const home = document.body.dataset.home;
  const bar = el("div", { id: "pp-bar" }, `
    <button id="pp-toc-btn" aria-pressed="true" title="Show or hide the outline (:toc)">
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 3.5v13" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>
    <span class="title"></span>
    <a class="btn" id="pp-nav"></a>
    <button id="pp-hints" aria-pressed="false" title="Show the template guidance for every section">Guide</button>
    <button id="pp-note" title="Insert a note for Claude after the current block (vim: gc)">Add note</button>
    <span class="pp-menu" id="pp-export">
      <button title="Export; figures become images in Word and Markdown">Export</button>
      <span class="pp-menu-list">
        <button data-f="docx">Word document</button>
        <button data-f="pdf">PDF</button>
        <button data-f="md">Markdown</button>
        <button data-f="html">Standalone HTML</button>
        <button data-f="all">All formats</button>
      </span>
    </span>
    <button id="pp-vim" title="Toggle vim keybindings"></button>
    <button id="pp-theme" title="Switch light and dark">Dark</button>`);
  document.body.prepend(bar);
  const banner = el("div", { id: "pp-banner" });
  bar.after(banner);
  const line = el("div", { id: "pp-line" }, `
    <span id="pp-mode">NORMAL</span><span id="pp-file"></span><span id="pp-status">…</span>
    <span class="right" id="pp-words"></span>`);
  const cmd = el("div", { id: "pp-cmd" }, `<input id="pp-cmd-in" autocomplete="off" spellcheck="false">`);
  const tip = el("div", { id: "pp-tip" });
  const guide = el("button", { id: "pp-guide", title: "Show or hide the guidance for this section" }, "Guide");
  document.body.append(line, cmd, tip);
  doc.parentElement.style.position = "relative";
  const $mode = q("#pp-mode"), $status = q("#pp-status"), $cmdIn = q("#pp-cmd-in");
  q("#pp-file").textContent = PAGE;
  const setTitle = () => { const h = doc.querySelector("h1"); q("#pp-bar .title").textContent = h ? h.textContent : document.title; };

  const nav = q("#pp-nav");
  if (home) { nav.textContent = "Proposal"; nav.href = home; }
  else { nav.textContent = "Research"; nav.href = document.body.dataset.research || "research/index.html"; }

  // outline (left margin): collapsible, remembered per browser
  const tocBtn = q("#pp-toc-btn");
  const setToc = (show) => {
    document.body.classList.toggle("toc-hidden", !show);
    tocBtn.setAttribute("aria-pressed", String(show));
    tocBtn.setAttribute("aria-label", show ? "Hide outline" : "Show outline");
    LS("pp-toc", show ? "show" : "hide");
  };
  setToc(LS("pp-toc") !== "hide");
  tocBtn.onclick = () => setToc(document.body.classList.contains("toc-hidden"));

  // guidance (.hint): hidden by default; per-section "Guide" in the margin, or all via the toolbar
  q("#pp-hints").onclick = (e) => {
    const on = document.body.classList.toggle("show-hints");
    e.currentTarget.setAttribute("aria-pressed", String(on));
  };
  function sectionHints(h) {
    const out = [];
    for (let n = h.nextElementSibling; n && !/^H[12]$/.test(n.tagName); n = n.nextElementSibling) {
      if (n.classList.contains("hint")) out.push(n);
      out.push(...n.querySelectorAll(".hint"));
    }
    return out;
  }
  let guideFor = null;
  doc.addEventListener("mouseover", (e) => {
    const h = e.target.closest && e.target.closest("#doc > h2");
    if (!h || h === guideFor) return;
    if (!sectionHints(h).length) { guide.style.display = "none"; guideFor = null; return; }
    guideFor = h; doc.parentElement.append(guide);
    guide.style.display = "block";
    guide.style.top = (doc.offsetTop + h.offsetTop + 2) + "px";
    guide.style.left = (doc.offsetLeft + doc.offsetWidth - 84) + "px";
    guide.textContent = sectionHints(h)[0].classList.contains("hint-open") ? "Hide guide" : "Guide";
  });
  guide.onclick = () => {
    if (!guideFor) return;
    const hs = sectionHints(guideFor), open = !hs[0].classList.contains("hint-open");
    hs.forEach((x) => x.classList.toggle("hint-open", open));
    guide.textContent = open ? "Hide guide" : "Guide";
  };

  // theme
  const setTheme = (t) => { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; LS("pp-theme", t || ""); };
  setTheme(LS("pp-theme") || "");
  q("#pp-theme").onclick = () => {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(dark ? "light" : "dark"); themeLabel();
  };
  function themeLabel() {
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    q("#pp-theme").textContent = dark ? "Light" : "Dark";
  }
  themeLabel();

  // ---------- figures: non-editable body, editable caption, hover tips ----------
  function prepFigures() {
    doc.querySelectorAll("figure").forEach((f) => {
      f.setAttribute("contenteditable", "false");
      const cap = f.querySelector("figcaption");
      if (cap) cap.setAttribute("contenteditable", "true");
    });
  }
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) { tip.style.display = "none"; return; }
    tip.textContent = t.getAttribute("data-tip"); tip.style.display = "block";
  });
  document.addEventListener("mousemove", (e) => {
    if (tip.style.display === "block") {
      tip.style.left = Math.min(e.clientX + 14, innerWidth - 340) + "px";
      tip.style.top = e.clientY + 14 + "px";
    }
  });

  // ---------- budget tables: live totals ----------
  // <table class="budget" data-budget="2000" data-unit="$">; each body row's
  // td[data-mul] cells multiply into td[data-cost]; tfoot td[data-sum] sums them.
  function recalcBudgets() {
    doc.querySelectorAll("table.budget").forEach((t) => {
      let sum = 0;
      t.querySelectorAll("tbody tr").forEach((r) => {
        const muls = [...r.querySelectorAll("td[data-mul]")];
        if (!muls.length) return;
        const v = muls.reduce((a, c) => a * num(c.textContent), 1);
        const out = r.querySelector("td[data-cost]");
        if (out) out.textContent = fmt(v);
        sum += v;
      });
      const s = t.querySelector("[data-sum]");
      if (s) s.textContent = fmt(sum);
      const budget = num(t.dataset.budget || "0");
      const vEl = t.parentElement.querySelector("[data-verdict]") || t.querySelector("[data-verdict]");
      if (vEl && budget > 0) {
        const r = sum / budget;
        vEl.className = "verdict " + (r <= 0.7 ? "go" : r <= 1 ? "tight" : "nogo");
        vEl.textContent = `${fmt(sum)} of ${fmt(budget)} ${t.dataset.unit || ""} (${Math.round(r * 100)}%) — ` +
          (r <= 0.7 ? "fits with headroom" : r <= 1 ? "fits, no slack for reruns" : "over budget: cut conditions or seeds");
      }
    });
  }
  const num = (s) => parseFloat(String(s).replace(/[^0-9.\-eE]/g, "")) || 0;
  const fmt = (v) => (Math.abs(v) >= 100 ? Math.round(v).toLocaleString() : (+v.toFixed(2)).toString());

  // ---------- TOC ----------
  // sidebar = research navigator (every page) + outline of this page
  function sidebarShell() {
    const toc = q("#pp-toc"); if (!toc) return null;
    if (!q("#pp-outline")) {
      toc.innerHTML = `<div class="nav-group" id="pp-rnav"></div>
        <div class="nav-group"><div class="nav-h">On this page</div><div id="pp-outline"></div></div>`;
      if (!home) toc.append(q("#pp-rnav")); // on the proposal, its own outline comes first
    }
    return q("#pp-outline");
  }
  async function buildResearchNav() {
    const box = q("#pp-rnav"); if (!box) return;
    const base = home ? "" : "research/"; // research pages live in research/
    const here = location.pathname.split("/").pop();
    const get = async (f) => { try { const r = await fetch(base + f + "?t=" + Date.now()); return r.ok ? new DOMParser().parseFromString(await r.text(), "text/html") : null; } catch (e) { return null; } };
    const [idx, rev, plan] = await Promise.all([get("index.html"), get("review.html"), get("plan-review.html")]);
    const link = (href, label, extra = "", cur = false) => `<a href="${href}"${cur ? ' class="current"' : ""}>${esc(label)}${extra}</a>`;
    let html = `<div class="nav-h">${home ? "Project" : "Research"}</div>`;
    if (home) html += link(home, "Proposal");
    if (rev) {
      const open = rev.querySelectorAll('.approve-item[data-status="pending"], .approve-item[data-status="discuss"]').length;
      html += link(base + "review.html", "Findings to review", open ? `<span class="count">${open}</span>` : "", here === "review.html");
    }
    if (plan) {
      const open = plan.querySelectorAll('.approve-item[data-status="pending"], .approve-item[data-status="discuss"]').length;
      html += link(base + "plan-review.html", "Plan review", open ? `<span class="count">${open}</span>` : "", here === "plan-review.html");
    }
    if (idx) {
      html += link(base + "index.html", "All research notes", "", !!home && here === "index.html");
      idx.querySelectorAll(".research-list li").forEach((li) => {
        const a = li.querySelector("a"); if (!a) return;
        const b = li.querySelector(".badge"); const st = b ? b.className.replace("badge", "").trim() : "unverified";
        const href = a.getAttribute("href");
        html += `<a class="note-link${href === here && home ? " current" : ""}" href="${base + href}"><span class="dot ${st}" title="${esc(b ? b.textContent : "")}"></span>${esc(a.textContent)}</a>`;
      });
    }
    if (!home && !idx) { box.remove(); return; }
    box.innerHTML = html;
  }

  function buildToc() {
    const toc = sidebarShell();
    if (!toc) return;
    const used = new Set();
    // long pages (e.g. review lists) keep the outline to h2 only
    const sel = doc.querySelectorAll("h3").length > 10 ? "h2" : "h2, h3";
    const links = [...doc.querySelectorAll(sel)].filter((h) => !h.classList.contains("group-hidden")).map((h) => {
      // auto ids follow the heading text (it is often empty when the heading is created)
      if (!h.id || h.dataset.autoid) { h.id = slug(h.textContent, used); h.dataset.autoid = "1"; }
      used.add(h.id);
      return `<a class="${h.tagName.toLowerCase()}" href="#${h.id}">${esc(h.textContent)}</a>`;
    });
    toc.innerHTML = links.join("");
  }
  const slug = (s, used) => {
    let b = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "s", id = b, i = 2;
    while (used.has(id) || (document.getElementById(id) && document.getElementById(id).closest("#doc") == null)) id = `${b}-${i++}`;
    return id;
  };
  const tocObs = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    document.querySelectorAll("#pp-outline a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "0px 0px -75% 0px" });
  const watchToc = () => doc.querySelectorAll("h2, h3").forEach((h) => tocObs.observe(h));

  function countWords() {
    const c = doc.cloneNode(true); c.querySelectorAll(".hint, figure svg, .pp-ui").forEach((x) => x.remove());
    const n = (c.textContent.match(/\S+/g) || []).length;
    q("#pp-words").textContent = n.toLocaleString() + " words";
  }
  // ---------- approval items ----------
  // <section class="approve-item" data-status="pending"> gets Approve / Reject / Discuss
  // buttons (UI only, stripped on save). The chosen status is saved as data-status, so
  // Claude can grep data-status="approved". [data-approve-summary] shows the tally.
  const STATUSES = [["approved", "Approve"], ["rejected", "Reject"], ["discuss", "Discuss"], ["pending", "Reset"]];
  function prepApprovals() {
    doc.querySelectorAll(".approve-item").forEach((it) => {
      if (!it.dataset.status) it.dataset.status = "pending";
      if (it.querySelector(":scope > .pp-ui")) return;
      const ui = el("div", { className: "pp-ui approve-bar", contentEditable: "false" },
        STATUSES.map(([v, l]) => `<button data-v="${v}">${l}</button>`).join(""));
      const h = it.querySelector("h3, h4");
      h ? h.after(ui) : it.prepend(ui);
      ui.addEventListener("click", (e) => {
        const v = e.target.dataset && e.target.dataset.v; if (!v) return;
        it.dataset.status = v; markDirty(); tallyApprovals();
        if (v === "approved" && hideApproved) { it.classList.add("fading"); setTimeout(() => { it.classList.remove("fading"); applyHideApproved(); }, 700); } else applyHideApproved();
      });
    });
    tallyApprovals();
  }
  // review pages: hide approved items (default on, remembered per browser)
  let hideApproved = LS("pp-hide-approved") !== "off";
  function applyHideApproved() {
    const has = !!doc.querySelector(".approve-item");
    const btn = q("#pp-hide-approved");
    if (!has) { if (btn) btn.remove(); return; }
    if (!btn) {
      const b = el("button", { id: "pp-hide-approved", title: "Show or hide items you already approved" });
      q("#pp-hints").before(b);
      b.onclick = () => { hideApproved = !hideApproved; LS("pp-hide-approved", hideApproved ? "on" : "off"); applyHideApproved(); };
    }
    document.body.classList.toggle("hide-approved", hideApproved);
    const n = doc.querySelectorAll('.approve-item[data-status="approved"]').length;
    q("#pp-hide-approved").textContent = hideApproved ? `Show approved (${n})` : "Hide approved";
    // a group heading (and its intro paragraph) disappears when nothing in it is left visible
    doc.querySelectorAll("h2").forEach((h) => {
      let any = false, items = 0;
      for (let x = h.nextElementSibling; x && x.tagName !== "H2"; x = x.nextElementSibling) {
        if (x.classList.contains("approve-item")) { items++; if (!(hideApproved && x.dataset.status === "approved")) any = true; }
      }
      h.classList.toggle("group-hidden", items > 0 && !any);
    });
    buildToc();
  }
  function tallyApprovals() {
    const out = doc.querySelectorAll("[data-approve-summary]"); if (!out.length) return;
    const c = {}; doc.querySelectorAll(".approve-item").forEach((i) => { c[i.dataset.status] = (c[i.dataset.status] || 0) + 1; });
    const t = ["approved", "rejected", "discuss", "pending"].filter((k) => c[k]).map((k) => `${c[k]} ${k}`).join(" · ");
    out.forEach((o) => { o.textContent = t; o.setAttribute("contenteditable", "false"); });
  }

  function refreshDerived() { setTitle(); countWords(); prepFigures(); prepApprovals(); applyHideApproved(); recalcBudgets(); buildToc(); watchToc(); }

  // ---------- persistence ----------
  let served = false, base = null, dirty = false, saving = false, saveTimer = null;
  const status = (t, cls = "") => { $status.textContent = t; $status.className = cls; };

  async function api(path, opts) {
    const r = await fetch(path, opts);
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, ...j };
  }
  async function init() {
    try {
      const v = await api(`/api/version?path=${encodeURIComponent(PAGE)}`);
      if (v.hash) { served = true; base = v.hash; status("Saved"); }
    } catch (e) { /* opened via file:// */ }
    if (!served) {
      status("Not saving: open this page through scripts/serve.py", "error");
      exp.querySelector(":scope > button").disabled = true;
    }
    doc.setAttribute("contenteditable", "true");
    document.execCommand("defaultParagraphSeparator", false, "p");
    refreshDerived();
    if (served) setInterval(poll, 1500);
  }

  function cleanHtml() {
    const c = doc.cloneNode(true);
    c.querySelectorAll("figure").forEach((f) => { f.removeAttribute("contenteditable"); const cap = f.querySelector("figcaption"); if (cap) cap.removeAttribute("contenteditable"); });
    // contenteditable merges leave inline styles and bare <span>s behind; keep the source clean
    c.querySelectorAll("[style]").forEach((x) => { if (!x.closest("svg")) x.removeAttribute("style"); });
    c.querySelectorAll("span:not([class]):not([id]):not([data-tip])").forEach((x) => x.replaceWith(...x.childNodes));
    c.querySelectorAll(".pp-ui").forEach((x) => x.remove());
    c.querySelectorAll("#doc a[title], a[title]").forEach((x) => { if (/Cmd-click|Click to open/.test(x.title)) x.removeAttribute("title"); });
    c.querySelectorAll(".hint-open").forEach((x) => { x.classList.remove("hint-open"); });
    c.querySelectorAll(".group-hidden, .fading").forEach((x) => { x.classList.remove("group-hidden", "fading"); });
    c.querySelectorAll("[class=\"\"]").forEach((x) => x.removeAttribute("class"));
    c.querySelectorAll("[data-approve-summary]").forEach((x) => x.removeAttribute("contenteditable"));
    return "\n" + c.innerHTML.trim() + "\n";
  }
  function markDirty() {
    if (!served) return;
    dirty = true; status("Unsaved changes", "dirty");
    clearTimeout(saveTimer); saveTimer = setTimeout(save, 1500);
  }
  async function save(force = false) {
    if (!served || saving) return;
    clearTimeout(saveTimer); saving = true;
    try {
      const r = await api("/api/save", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: PAGE, html: cleanHtml(), base: force ? null : base }) });
      if (r.ok) { base = r.hash; dirty = false; status("Saved " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); hideBanner(); }
      else if (r.status === 409) conflict();
      else status("save failed: " + (r.error || r.status), "error");
    } catch (e) { status("Save failed: server not reachable", "error"); }
    saving = false;
  }
  async function poll() {
    if (saving) return;
    try {
      const v = await api(`/api/version?path=${encodeURIComponent(PAGE)}`);
      if (!v.hash || v.hash === base) return;
      if (dirty) conflict(); else await reload(v.hash);
    } catch (e) { status("Server not reachable; edits are not saving", "error"); }
  }
  async function reload(hash) {
    const html = await (await fetch(location.pathname + "?t=" + Date.now())).text();
    const fresh = new DOMParser().parseFromString(html, "text/html").getElementById("doc");
    if (!fresh) return;
    const y = scrollY;
    doc.innerHTML = fresh.innerHTML;
    // pick up style/script changes Claude made in <head>? Those need a full reload; the doc body is enough day to day.
    base = hash || (await api(`/api/version?path=${encodeURIComponent(PAGE)}`)).hash;
    dirty = false; refreshDerived(); scrollTo(0, y);
    status("Loaded new changes from disk " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); hideBanner();
  }
  function conflict() {
    clearTimeout(saveTimer);
    banner.innerHTML = `The file changed on disk (probably Claude) while you have unsaved edits.
      <button id="pp-take-disk">Load disk version</button><button id="pp-keep-mine">Keep mine (overwrite)</button>`;
    banner.style.display = "block";
    q("#pp-take-disk").onclick = () => reload();
    q("#pp-keep-mine").onclick = () => save(true);
    status("Conflict with changes on disk", "error");
  }
  const hideBanner = () => { banner.style.display = "none"; };

  doc.addEventListener("input", () => { markDirty(); clearTimeout(window.__ppWc); window.__ppWc = setTimeout(() => { countWords(); setTitle(); }, 600); if (doc.querySelector("table.budget")) recalcBudgets(); });
  doc.addEventListener("blur", () => { if (dirty) save(); }, true);
  addEventListener("beforeunload", (e) => { if (dirty) { save(); e.preventDefault(); } });
  // links: contenteditable swallows clicks, so follow them ourselves.
  // NORMAL mode: click follows. INSERT / vim off: click places the caret, Cmd/Ctrl-click follows.
  async function follow(a, newTab) {
    const href = a.getAttribute("href"); if (!href) return;
    if (href.startsWith("#")) { const t = document.getElementById(href.slice(1)); if (t) { t.scrollIntoView(); history.replaceState(null, "", href); } return; }
    // outside links (papers, docs) open in a new tab so the doc stays open
    if (newTab || a.origin !== location.origin) { window.open(a.href, "_blank", "noopener"); return; }
    if (dirty) await save();
    location.href = a.href;
  }
  doc.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]"); if (!a || !doc.contains(a)) return;
    const normal = vimOn && mode !== "insert";
    if (normal || e.metaKey || e.ctrlKey) { e.preventDefault(); follow(a, (e.metaKey || e.ctrlKey) && !a.getAttribute("href").startsWith("#")); }
  });
  doc.addEventListener("mouseover", (e) => {
    const a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    a.title = vimOn && mode !== "insert" ? "Click to open (Cmd-click: new tab)" : "Cmd-click to open";
  });
  // plain-text paste keeps foreign styles out of the doc
  doc.addEventListener("paste", (e) => {
    const t = e.clipboardData && e.clipboardData.getData("text/plain");
    if (t == null) return;
    e.preventDefault(); document.execCommand("insertText", false, t);
  });

  // ---------- toolbar actions ----------
  q("#pp-note").onclick = () => insertNote();
  const exp = q("#pp-export");
  exp.querySelector(":scope > button").onclick = () => exp.classList.toggle("open");
  exp.querySelectorAll("[data-f]").forEach((b) => { b.onclick = () => { exp.classList.remove("open"); exportAs(b.dataset.f); }; });
  document.addEventListener("click", (e) => { if (!exp.contains(e.target)) exp.classList.remove("open"); });
  async function exportAs(fmt) {
    if (!served) return;
    if (dirty) await save();
    status("Exporting " + fmt + "…");
    const r = await api("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: PAGE, format: fmt }) });
    if (r.ok) {
      status("Exported " + r.outputs.join(", "));
      if (r.outputs.length === 1) window.open("/" + r.outputs[0], "_blank");
    } else status("export failed: " + (r.error || "").slice(0, 200), "error");
  }

  function insertNote() {
    if (vimOn) snapshot();
    const b = block() || doc.lastElementChild;
    const n = document.createElement("p"); n.className = "note"; n.innerHTML = "<br>";
    (b && b.closest("li") ? b.closest("ul,ol") : b).after(n);
    caretIn(n); setMode("insert", true); markDirty();
  }

  // ---------- selection helpers ----------
  const sel = () => getSelection();
  const BLOCKS = "p, li, h1, h2, h3, h4, h5, h6, pre, blockquote, figcaption, td, th, div.callout, div.tldr";
  function block() {
    const s = sel(); if (!s.rangeCount) return null;
    let n = s.focusNode; if (n && n.nodeType === 3) n = n.parentNode;
    const b = n && n.closest ? n.closest(BLOCKS) : null;
    return b && doc.contains(b) ? b : null;
  }
  function caretIn(node, atEnd = false) {
    const r = document.createRange(); r.selectNodeContents(node); r.collapse(!atEnd);
    const s = sel(); s.removeAllRanges(); s.addRange(r);
  }
  const move = (alter, dir, gran, n = 1) => { for (let i = 0; i < n; i++) sel().modify(alter, dir, gran); };
  const exec = (c, v) => document.execCommand(c, false, v);
  const charAfter = () => { const s = sel(); const n = s.focusNode; return n && n.nodeType === 3 ? n.data[s.focusOffset] || "" : ""; };

  // ---------- vim ----------
  let vimOn = LS("pp-vim") !== "off";
  let mode = "insert", pending = "", count = "", reg = { kind: "text", val: "" }, lastSearch = "";
  const vimBtn = q("#pp-vim");
  function setVim(on) {
    vimOn = on; LS("pp-vim", on ? "on" : "off"); vimBtn.textContent = on ? "Vim on" : "Vim off"; vimBtn.setAttribute("aria-pressed", String(on));
    setMode(on ? "normal" : "insert");
  }
  vimBtn.onclick = () => setVim(!vimOn);
  function setMode(m, snapped) {
    if (m === "insert" && mode !== "insert" && vimOn && !snapped) snapshot();
    mode = m; pending = ""; count = "";
    document.body.classList.toggle("vim-normal", vimOn && m === "normal");
    $mode.className = !vimOn ? "off" : m === "insert" ? "insert" : m.startsWith("visual") || m === "vline" ? "visual" : "";
    $mode.textContent = !vimOn ? "EDIT" : m === "insert" ? "INSERT" : m === "visual" ? "VISUAL" : m === "vline" ? "V-LINE" : "NORMAL";
  }

  // motion key -> [direction, granularity]; w/e/b approximate vim word motions
  const MOTIONS = {
    h: ["backward", "character"], l: ["forward", "character"], ArrowLeft: ["backward", "character"], ArrowRight: ["forward", "character"],
    j: ["forward", "line"], k: ["backward", "line"], ArrowDown: ["forward", "line"], ArrowUp: ["backward", "line"],
    w: ["forward", "word"], e: ["forward", "word"], b: ["backward", "word"],
    0: ["backward", "lineboundary"], "^": ["backward", "lineboundary"], $: ["forward", "lineboundary"],
    "{": ["backward", "paragraph"], "}": ["forward", "paragraph"], G: ["forward", "documentboundary"],
  };
  function doMotion(key, alter, n) {
    if (key === "gg") return move(alter, "backward", "documentboundary");
    const [dir, gran] = MOTIONS[key];
    if (/lineboundary|documentboundary/.test(gran)) return move(alter, dir, gran);
    for (let i = 0; i < n; i++) {
      move(alter, dir, gran);
      if (key === "w") while (/\s/.test(charAfter())) move(alter, "forward", "character");
    }
  }
  // select whole blocks (for dd/yy/cc/V): from start of block to start of the block after the last one
  // Line ops (dd, yy, cc, o, O, p) edit the DOM directly. Chrome's execCommand("delete")
  // across block boundaries merges neighbours (a following <h2> becomes a styled <p>) or
  // swallows hidden .hint blocks, so it is only used inside a block.
  const leafBlocks = () => [...doc.querySelectorAll(BLOCKS)].filter((x) =>
    !x.querySelector(BLOCKS) && !x.closest("figure") && x.getClientRects().length);
  function blockRange(n) {
    const b = block(); if (!b) return null;
    const all = leafBlocks(), i = all.indexOf(b);
    return { b, all, i, blocks: all.slice(i, Math.min(i + n, all.length)) };
  }
  const endOf = (n) => { const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let t = null, x; while ((x = w.nextNode())) t = x; return t ? [t, t.length] : [n, n.childNodes.length]; };

  // own undo history: snapshots of the doc taken before each vim edit, and once per insert session
  const undoStack = [], redoStack = [];
  function caretOffset() {
    const s = sel(); if (!s.rangeCount || !doc.contains(s.focusNode)) return 0;
    const r = document.createRange(); r.selectNodeContents(doc); r.setEnd(s.focusNode, s.focusOffset);
    return r.toString().length;
  }
  function setCaretOffset(n) {
    const w = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT); let t;
    while ((t = w.nextNode())) { if (n <= t.length) { const r = document.createRange(); r.setStart(t, n); r.collapse(true); sel().removeAllRanges(); sel().addRange(r); return; } n -= t.length; }
  }
  function snapshot() {
    undoStack.push({ html: cleanHtml(), caret: caretOffset() });
    if (undoStack.length > 300) undoStack.shift();
    redoStack.length = 0;
  }
  function restore(from, to) {
    const st = from.pop(); if (!st) { status("Nothing to undo"); return; }
    to.push({ html: cleanHtml(), caret: caretOffset() });
    doc.innerHTML = st.html; refreshDerived(); setCaretOffset(st.caret); markDirty();
  }

  function yank(text, kind = "text", html = "") {
    reg = { kind, val: text, html };
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  }
  function removeBlocks(blocks, all) {
    const after = all[all.indexOf(blocks[blocks.length - 1]) + 1], before = all[all.indexOf(blocks[0]) - 1];
    blocks.forEach((x) => {
      const list = x.tagName === "LI" ? x.parentElement : null;
      x.remove();
      if (list && !list.children.length) list.remove();
    });
    if (!leafBlocks().length) { const p = document.createElement("p"); p.innerHTML = "<br>"; doc.append(p); caretIn(p); }
    else if (after && doc.contains(after)) caretIn(after);
    else if (before && doc.contains(before)) caretIn(before, true);
    markDirty();
  }
  function operate(op, n, motionKey) {
    if (motionKey === op) { // linewise: dd, yy, cc
      const r = blockRange(n); if (!r) return;
      yank(r.blocks.map((x) => x.textContent).join("\n"), "block", r.blocks.map((x) => x.outerHTML).join(""));
      if (op === "y") return;
      snapshot();
      if (op === "d") return removeBlocks(r.blocks, r.all);
      removeBlocks(r.blocks.slice(1), r.all); // cc: empty the first block, drop the rest
      r.b.innerHTML = "<br>"; caretIn(r.b); markDirty(); setMode("insert", true); return;
    }
    doMotion(motionKey, "extend", n);
    yank(sel().toString());
    if (op === "y") { sel().collapseToStart(); return; }
    snapshot(); exec("delete");
    if (op === "c") setMode("insert", true);
  }
  // o / O: new empty block next to the current one (li in lists, p elsewhere)
  function openLine(after) {
    const b = block(); if (!b) return;
    snapshot();
    let anchor = b, tag = "P";
    if (b.tagName === "LI") tag = "LI";
    else if (/^T[DH]$/.test(b.tagName)) anchor = b.closest("table");
    else if (b.tagName === "FIGCAPTION") anchor = b.closest("figure");
    const nb = document.createElement(tag); nb.innerHTML = "<br>";
    after ? anchor.after(nb) : anchor.before(nb);
    caretIn(nb); markDirty(); setMode("insert", true);
  }
  function paste(after) {
    if (!reg.val) return;
    snapshot();
    if (reg.kind === "block") {
      const b = block(); if (!b) return;
      const tmp = document.createElement("div"); tmp.innerHTML = reg.html;
      let nodes = [...tmp.children];
      let anchor = b;
      if (b.tagName === "LI" && nodes.some((x) => x.tagName !== "LI")) anchor = b.closest("ul, ol");
      if (b.tagName !== "LI" && nodes.some((x) => x.tagName === "LI")) { const ul = document.createElement("ul"); ul.append(...nodes); nodes = [ul]; }
      nodes.forEach((x) => x.removeAttribute && x.removeAttribute("id"));
      after ? anchor.after(...nodes) : anchor.before(...nodes);
      caretIn(nodes[0]); markDirty();
    } else {
      if (after) move("move", "forward", "character");
      exec("insertText", reg.val);
    }
  }

  function openCmd(prefix) {
    cmd.style.display = "block"; $cmdIn.value = prefix; $cmdIn.focus();
  }
  function closeCmd() { cmd.style.display = "none"; doc.focus(); }
  $cmdIn.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); closeCmd(); return; }
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = $cmdIn.value; closeCmd();
    if (v.startsWith("/")) { lastSearch = v.slice(1); find(false); return; }
    runEx(v.slice(1).trim());
  });
  function find(back) { if (lastSearch) { window.find(lastSearch, false, back, true); sel().collapseToStart(); } }
  function runEx(c) {
    const [name, ...rest] = c.split(/\s+/); const arg = rest.join(" ");
    if (name === "w" || name === "wq" || name === "x") return save();
    if (name === "e!" || name === "e") return reload();
    if (name === "export") return exportAs(arg || "docx");
    if (name === "note") return insertNote();
    if (name === "guide") return q("#pp-hints").click();
    if (name === "toc") return tocBtn.click();
    if (name === "noh") return sel().collapseToStart();
    if (name === "vim") return setVim(arg !== "off");
    if (name === "set" && /^(dark|light)$/.test(arg)) return setTheme(arg);
    if (/^\d+$/.test(name)) { const hs = doc.querySelectorAll("h2"); const h = hs[+name - 1]; if (h) { h.scrollIntoView(); caretIn(h); } return; }
    status("unknown command: " + c, "error");
  }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); return; }
    if (e.target === $cmdIn || !vimOn) return;
    const inDoc = doc.contains(document.activeElement) || document.activeElement === doc;
    if (!inDoc) {
      if (e.key === "Escape") { doc.focus(); setMode("normal"); }
      return;
    }
    if (mode === "insert") {
      if (e.key === "Escape" || (e.ctrlKey && e.key === "[")) { e.preventDefault(); setMode("normal"); sel().collapseToStart(); }
      else if (e.key === " ") mdShortcut(e);
      return;
    }
    // normal / visual: swallow everything we don't explicitly let through
    if (e.metaKey || (e.ctrlKey && !"rdu".includes(e.key))) return;
    if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return;
    e.preventDefault();
    normalKey(e);
  }, true);

  function normalKey(e) {
    let k = e.key;
    const visual = mode === "visual" || mode === "vline";
    const alter = visual ? "extend" : "move";
    if (k === "Escape") { sel().collapseToStart(); setMode("normal"); return; }
    if (/^[1-9]$/.test(k) || (k === "0" && count)) { count += k; return; }
    const n = Math.max(1, parseInt(count || "1", 10));

    if (e.ctrlKey) {
      if (k === "r") restore(redoStack, undoStack);
      if (k === "d") scrollBy(0, innerHeight / 2);
      if (k === "u") scrollBy(0, -innerHeight / 2);
      count = ""; return;
    }
    // two-key sequences
    if (pending === "g") {
      pending = "";
      if (k === "g") { if (visual) doMotion("gg", "extend"); else doMotion("gg", "move"); }
      else if (k === "c") insertNote();
      count = ""; return;
    }
    if (pending === "r") { pending = ""; snapshot(); move("extend", "forward", "character"); exec("insertText", k); move("move", "backward", "character"); return; }
    if (pending === "z") { pending = ""; if (k === "z") { const r = sel().getRangeAt(0).getBoundingClientRect(); scrollBy(0, r.top - innerHeight / 2); } return; }
    if (pending === ">" || pending === "<") { if (k === pending) { snapshot(); } if (k === pending) exec(k === ">" ? "indent" : "outdent"); pending = ""; return; }
    if ("dcy".includes(pending) && pending) {
      const op = pending; pending = "";
      if (k === op) operate(op, n, op);
      else if (k === "g") pending = op + "g";
      else if (MOTIONS[k]) operate(op, n, k);
      count = ""; return;
    }
    if (pending.length === 2 && pending[1] === "g") { const op = pending[0]; pending = ""; if (k === "g") operate(op, n, "gg"); return; }

    if (MOTIONS[k]) { doMotion(k, alter, n); count = ""; return; }
    // D, C, S, p, P, o, O snapshot inside operate/paste/openLine
    if (["x", "X", "s", "J"].includes(k) || (visual && ["d", "x", "c"].includes(k))) snapshot();
    switch (k) {
      case "g": case "r": case "z": case ">": case "<": pending = k; return;
      case "d": case "c": case "y":
        if (visual) { yank(sel().toString()); if (k !== "y") exec("delete"); else sel().collapseToStart(); setMode(k === "c" ? "insert" : "normal", true); }
        else pending = k;
        return;
      case "x": if (visual) { yank(sel().toString()); exec("delete"); setMode("normal"); } else { move("extend", "forward", "character", n); yank(sel().toString()); exec("delete"); } break;
      case "X": move("extend", "backward", "character", n); exec("delete"); break;
      case "D": operate("d", 1, "$"); break;
      case "C": operate("c", 1, "$"); break;
      case "s": move("extend", "forward", "character", n); exec("delete"); setMode("insert", true); break;
      case "S": operate("c", n, "c"); break;
      case "i": setMode("insert"); break;
      case "a": move("move", "forward", "character"); setMode("insert"); break;
      case "I": move("move", "backward", "lineboundary"); setMode("insert"); break;
      case "A": move("move", "forward", "lineboundary"); setMode("insert"); break;
      case "o": openLine(true); break;
      case "O": openLine(false); break;
      case "p": paste(true); break;
      case "P": paste(false); break;
      case "u": for (let i = 0; i < n; i++) restore(undoStack, redoStack); break;
      case "J": move("move", "forward", "lineboundary"); exec("forwardDelete"); exec("insertText", " "); break;
      case "v": if (mode === "visual") setMode("normal"); else { setMode("visual"); move("extend", "forward", "character"); } return;
      case "V": if (mode === "vline") setMode("normal"); else { const r = blockRange(n); setMode("vline"); if (r) { const g = document.createRange(); g.setStart(r.blocks[0], 0); g.setEnd(...endOf(r.blocks[r.blocks.length - 1])); sel().removeAllRanges(); sel().addRange(g); } } return;
      case "Enter": { const n = sel().focusNode; const a = n && (n.nodeType === 3 ? n.parentElement : n).closest("a[href]"); if (a) follow(a, false); else doMotion("j", "move", 1); break; }
      case "/": openCmd("/"); break;
      case ":": openCmd(":"); break;
      case "n": find(false); break;
      case "N": find(true); break;
    }
    count = "";
  }

  // markdown-ish shortcuts at the start of a block in insert mode: "#", "##", "###", "-", "1."
  function mdShortcut(e) {
    const b = block(); if (!b || b.tagName !== "P") return;
    const t = b.textContent;
    const map = { "#": "h2", "##": "h2", "###": "h3", "-": "ul", "*": "ul", "1.": "ol", ">": "blockquote" };
    const kind = map[t];
    if (!kind) return;
    e.preventDefault();
    caretIn(b); move("extend", "forward", "lineboundary"); exec("delete");
    if (kind === "ul") exec("insertUnorderedList");
    else if (kind === "ol") exec("insertOrderedList");
    else exec("formatBlock", kind);
    buildToc();
  }

  // ---------- utils ----------
  function el(tag, attrs, html) { const x = document.createElement(tag); Object.assign(x, attrs); if (html) x.innerHTML = html; return x; }
  function q(s) { return document.querySelector(s); }
  function esc(s) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  new MutationObserver(() => { clearTimeout(window.__ppToc); window.__ppToc = setTimeout(buildToc, 400); }).observe(doc, { childList: true, subtree: true, characterData: true });
  init().then(() => { buildResearchNav(); setVim(vimOn); doc.focus(); caretIn(doc.querySelector("h1, p") || doc); });
})();
