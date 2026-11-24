/* Списки направлений, библиотека дел, услуги, окна с подробностями, демо-форма.
   Форма ничего не отправляет и ничего не сохраняет (см. раздел «Демо-форма»). */
(function () {
  "use strict";
  var KL = window.KL, S = KL.site, el = KL.el;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtRub(n) { return Number(n).toLocaleString("ru-RU") + " ₽"; }
  function arrow() { return el("span", { class: "arr", "aria-hidden": "true", text: "→" }); }

  /* ---------- Универсальное окно ---------- */
  var dlg = null, lastFocus = null;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = el("dialog", { class: "panel", "aria-modal": "true" });
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closePanel(); });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closePanel(); });
    return dlg;
  }
  function openPanel(label, contentNode, hash) {
    var d = ensureDialog();
    d.textContent = "";
    var bar = el("div", { class: "panel-bar" });
    bar.appendChild(el("span", { class: "eyebrow", text: label }));
    var x = el("button", { class: "panel-close", type: "button", "aria-label": "Закрыть" });
    x.textContent = "×";
    x.addEventListener("click", closePanel);
    bar.appendChild(x);
    var body = el("div", { class: "panel-body" }, [el("div", { class: "panel-inner" }, [contentNode])]);
    d.appendChild(bar);
    d.appendChild(body);
    lastFocus = document.activeElement;
    if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
    document.body.style.overflow = "hidden";
    body.scrollTop = 0;
    if (hash) history.replaceState(null, "", "#" + hash);
  }
  function closePanel() {
    if (!dlg) return;
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
    document.body.style.overflow = "";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Направления ---------- */
  function practiceBySlug(slug) { return (KL.practice || []).filter(function (p) { return p.slug === slug; })[0]; }

  function practicePanel(p) {
    var root = el("div");
    root.appendChild(el("p", { class: "amount-label", text: "Направление практики" }));
    root.appendChild(el("h2", { text: p.title }));
    root.appendChild(el("p", { class: "lead-panel", text: p.lead }));
    function sec(no, title, items) {
      var s = el("section", { class: "doc-sec" });
      s.appendChild(el("span", { class: "no", text: no }));
      var b = el("div", { class: "body" }, [el("h3", { text: title })]);
      var ul = el("ul");
      items.forEach(function (t) { ul.appendChild(el("li", { text: t })); });
      b.appendChild(ul);
      s.appendChild(b);
      return s;
    }
    var intro = root.querySelector(".lead-panel");
    intro.style.cssText = "font-size:1.15rem;line-height:1.6;margin:0 0 1.6rem;color:rgba(27,30,29,.78)";
    root.appendChild(sec("01", "Когда обращаются", p.when));
    root.appendChild(sec("02", "Чем я занимаюсь", p.work));
    root.appendChild(sec("03", "Какие документы пригодятся", p.docs));
    if (p.norms) root.appendChild(el("p", { class: "norms", text: p.norms }));
    var cta = el("div", { class: "panel-cta" });
    var a = el("a", { class: "btn", href: "contacts.html?topic=" + encodeURIComponent(p.slug) + "#form" });
    a.appendChild(document.createTextNode("Обсудить ситуацию "));
    a.appendChild(arrow());
    cta.appendChild(a);
    var b = el("a", { class: "btn ghost", href: "services.html" });
    b.textContent = "Услуги и стоимость";
    cta.appendChild(b);
    root.appendChild(cta);
    return root;
  }

  function openPractice(slug) {
    var p = practiceBySlug(slug);
    if (p) openPanel("§ Практика", practicePanel(p), p.slug);
  }

  var VARIANTS = ["v-green", "v-paper", "v-choc", "v-graphite"];
  var pGrid = $("#practice-grid");
  if (pGrid) {
    KL.practice.forEach(function (p, i) {
      var c = el("button", { class: "p-card reveal " + VARIANTS[i % 4], type: "button", "data-slug": p.slug });
      c.appendChild(el("span", { class: "n", text: "§ " + pad(i + 1) }));
      c.appendChild(el("h3", { text: p.title }));
      c.appendChild(el("p", { text: p.short }));
      var more = el("span", { class: "more" }, [el("span", { text: "Подробнее" }), el("span", { "aria-hidden": "true", text: "→" })]);
      c.appendChild(more);
      c.addEventListener("click", function () { openPractice(p.slug); });
      pGrid.appendChild(c);
    });
  }

  var pList = $("#practice-list");
  if (pList) {
    KL.practice.forEach(function (p, i) {
      var a = el("a", { href: "practice.html#" + p.slug });
      a.appendChild(el("span", { class: "n", text: pad(i + 1) }));
      a.appendChild(el("span", { class: "t", text: p.title }));
      a.appendChild(el("span", { class: "d", text: p.short }));
      a.appendChild(el("span", { class: "go", "aria-hidden": "true", text: "→" }));
      pList.appendChild(a);
    });
  }

  /* ---------- Кейсы ---------- */
  function caseById(id) { return (KL.cases || []).filter(function (c) { return c.id === id; })[0]; }

  function caseCard(c, idx) {
    var card = el("button", { class: "case-card reveal", type: "button", "data-id": c.id });
    var top = el("div", { class: "case-top" });
    top.appendChild(el("span", { class: "case-no", text: c.demo ? "Дело № — · демо" : ("Дело " + (c.caseNo || "№ —")) }));
    if (c.demo) top.appendChild(el("span", { class: "stamp", text: "Демо" }));
    card.appendChild(top);
    card.appendChild(el("span", { class: "case-cat", text: c.category }));
    var amt = el("div", { class: "case-amount" }, [el("small", { text: c.amountLabel || "Сумма требований" }), el("b", { text: c.amount })]);
    card.appendChild(amt);
    card.appendChild(el("span", { class: "case-title", text: c.title }));
    card.appendChild(el("span", { class: "case-excerpt", text: c.facts }));
    card.appendChild(el("span", { class: "more" }, [el("span", { text: "Открыть дело" }), el("span", { "aria-hidden": "true", text: "→" })]));
    card.addEventListener("click", function () { openCase(c.id); });
    return card;
  }

  function casePanel(c) {
    var root = el("div");
    if (c.demo) {
      root.appendChild(el("div", { class: "note-demo", text: "Демонстрационный кейс. Дело вымышлено и не является реальным: оно показывает, как будет выглядеть карточка судебного дела." }));
      root.lastChild.style.margin = "0 0 1.4rem";
    }
    root.appendChild(el("p", { class: "amount-label", text: c.category }));
    root.appendChild(el("h2", { text: c.title }));
    root.appendChild(el("p", { class: "amount-label", text: c.amountLabel || "Сумма требований" }));
    root.appendChild(el("div", { class: "amount", text: c.amount }));
    if (c.caseNo) root.appendChild(el("p", { class: "norms", text: "Номер дела: " + c.caseNo }));

    function sec(no, title, body, cls) {
      var s = el("section", { class: "doc-sec" + (cls ? " " + cls : "") });
      s.appendChild(el("span", { class: "no", text: no }));
      var b = el("div", { class: "body" }, [el("h3", { text: title })]);
      if (typeof body === "string") b.appendChild(el("p", { text: body })); else b.appendChild(body);
      s.appendChild(b);
      return s;
    }
    root.appendChild(sec("01", "Обстоятельства дела", c.facts));
    var sides = el("div", { class: "sides" });
    (c.positions || []).forEach(function (p) { sides.appendChild(el("div", { class: "side" }, [el("b", { text: p.side }), el("span", { text: p.text })])); });
    root.appendChild(sec("02", "Позиции сторон", sides));
    root.appendChild(sec("03", "Юридический вопрос", c.question));
    root.appendChild(sec("04", "Результат", c.result, "result"));
    root.appendChild(sec("05", "Вывод для бизнеса", c.lesson, "lesson"));

    var cta = el("div", { class: "panel-cta" });
    var a = el("a", { class: "btn", href: "contacts.html#form" });
    a.appendChild(document.createTextNode("Обсудить похожую ситуацию "));
    a.appendChild(arrow());
    cta.appendChild(a);
    root.appendChild(cta);
    return root;
  }
  function openCase(id) {
    var c = caseById(id);
    if (c) openPanel(c.demo ? "Демонстрационный кейс" : "Судебное дело", casePanel(c), id);
  }

  var cGrid = $("#cases-grid");
  if (cGrid) {
    var cats = [];
    KL.cases.forEach(function (c) { if (cats.indexOf(c.category) < 0) cats.push(c.category); });
    var active = "Все";
    var fWrap = $("#case-filters");
    function renderCases() {
      cGrid.textContent = "";
      var list = KL.cases.filter(function (c) { return active === "Все" || c.category === active; });
      if (!list.length) cGrid.appendChild(el("p", { class: "empty", text: "В этой категории пока нет дел." }));
      list.forEach(function (c, i) {
        var card = caseCard(c, i);
        cGrid.appendChild(card);
        requestAnimationFrame(function () { card.classList.add("in"); });
      });
    }
    function renderFilters() {
      fWrap.textContent = "";
      ["Все"].concat(cats).forEach(function (name) {
        var b = el("button", { class: "chip", type: "button", "aria-pressed": String(name === active), text: name });
        b.addEventListener("click", function () { active = name; renderFilters(); renderCases(); });
        fWrap.appendChild(b);
      });
    }
    renderFilters();
    renderCases();
    var allDemo = KL.cases.every(function (c) { return c.demo; });
    var banner = $("#cases-banner");
    if (banner && !allDemo) banner.hidden = true;
  }

  var cTeaser = $("#cases-teaser");
  if (cTeaser) KL.cases.slice(0, 3).forEach(function (c, i) { var card = caseCard(c, i); cTeaser.appendChild(card); });

  /* ---------- Услуги ---------- */
  function priceInfo(p) {
    var m = p && p.mode;
    if (m === "fixed" && p.amount != null) return { cls: "is-fixed", label: "Фиксированная стоимость", text: fmtRub(p.amount) };
    if (m === "range" && p.from != null && p.to != null) return { cls: "is-range", label: "Стоимость в диапазоне", text: "от " + fmtRub(p.from) + " до " + fmtRub(p.to) };
    return { cls: "is-custom", label: "Индивидуальная стоимость", text: S.priceNote };
  }
  var sList = $("#services-list");
  if (sList) {
    KL.services.forEach(function (s, i) {
      var info = priceInfo(s.price);
      var row = el("article", { class: "price-row reveal" });
      row.appendChild(el("span", { class: "n", text: pad(i + 1) }));
      row.appendChild(el("h3", { text: s.title }));
      row.appendChild(el("p", { text: s.text }));
      var box = el("div", { class: "price-box " + info.cls });
      box.appendChild(el("div", {}, [el("small", { text: info.label }), el("b", { text: info.text })]));
      var a = el("a", { class: "link-arrow", href: "contacts.html#form" });
      a.appendChild(document.createTextNode("Обсудить "));
      a.appendChild(el("span", { "aria-hidden": "true", text: "→" }));
      box.appendChild(a);
      row.appendChild(box);
      sList.appendChild(row);
    });
  }

  /* ---------- Адреса вида #slug открывают окно ---------- */
  function openFromHash() {
    var h = decodeURIComponent((location.hash || "").slice(1));
    if (!h) return;
    if ($("#practice-grid") && practiceBySlug(h)) openPractice(h);
    else if ($("#cases-grid") && caseById(h)) openCase(h);
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ==========================================================
     ДЕМО-ФОРМА
     ВАЖНО: на этом этапе форма ничего не отправляет и не хранит.
       • нет fetch / XMLHttpRequest / sendBeacon / WebSocket;
       • нет localStorage, sessionStorage, cookies;
       • submit перехватывается и только показывает сообщение;
       • CSP в <head> (connect-src 'none'; form-action 'none')
         дополнительно запрещает браузеру любую отправку.
     ========================================================== */
  var form = $("[data-demo-form]");
  if (form) {
    var select = $("#f-topic");
    if (select) {
      KL.practice.forEach(function (p) { select.appendChild(el("option", { value: p.slug, text: p.title })); });
      select.appendChild(el("option", { value: "other", text: "Другое / пока не знаю" }));
      var topic = new URLSearchParams(location.search).get("topic");
      if (topic && practiceBySlug(topic)) select.value = topic;
    }
    var status = $("#f-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.textContent = "Это демонстрационная форма. Приём заявок пока не подключён";
      status.classList.add("show");
      status.focus();
    });
  }
})();
