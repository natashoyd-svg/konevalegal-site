/* Шапка, подвал, мобильное меню, заготовки контактов.
   Никаких запросов в сеть, никакого хранения данных. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var S = window.KL.site;
  var NAV = [
    ["practice.html", "Практика"],
    ["cases.html", "Судебные дела"],
    ["services.html", "Услуги"],
    ["about.html", "Обо мне"],
    ["contacts.html", "Контакты"]
  ];

  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (page === "") page = "index.html";

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  window.KL.el = el;

  function logo() {
    var a = el("a", { class: "logo", href: "index.html", "aria-label": S.brand + " — на главную" });
    a.appendChild(el("span", { class: "logo-mark", text: "§", "aria-hidden": "true" }));
    var t = el("span", { text: "Koneva" });
    t.appendChild(el("em", { text: "Legal" }));
    a.appendChild(t);
    return a;
  }

  function buildHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    host.className = "site-header";
    var wrap = el("div", { class: "wrap" });
    wrap.appendChild(logo());

    var nav = el("nav", { class: "nav", "aria-label": "Основная навигация" });
    NAV.forEach(function (n) {
      var a = el("a", { href: n[0], text: n[1] });
      if (n[0] === page) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    wrap.appendChild(nav);

    var cta = el("a", { class: "btn small header-cta", href: "contacts.html#form" });
    cta.textContent = "Обсудить ситуацию";
    wrap.appendChild(cta);

    var burger = el("button", { class: "burger", type: "button", "aria-expanded": "false", "aria-controls": "mobile-nav", "aria-label": "Открыть меню" }, [el("span"), el("span"), el("span")]);
    wrap.appendChild(burger);
    host.appendChild(wrap);

    var mnav = el("div", { class: "mobile-nav", id: "mobile-nav" });
    NAV.forEach(function (n, i) {
      var a = el("a", { class: "m-link", href: n[0] });
      a.appendChild(document.createTextNode(n[1]));
      a.appendChild(el("small", { text: "0" + (i + 1) }));
      mnav.appendChild(a);
    });
    var mcta = el("a", { class: "btn", href: "contacts.html#form" });
    mcta.textContent = "Обсудить ситуацию";
    mnav.appendChild(mcta);
    document.body.appendChild(mnav);

    function setMenu(open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      mnav.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
    }
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.matchMedia("(min-width:980px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  /* Контакт: если значение пусто — показываем заметную заготовку. */
  function contactNode(kind) {
    var c = S.contacts || {};
    function ph(label) { return el("span", { class: "ph", text: "[" + label + " — заполнить]" }); }
    if (kind === "email") {
      return c.email ? el("a", { href: "mailto:" + c.email, text: c.email }) : ph("e-mail");
    }
    if (kind === "telegram") {
      return c.telegram ? el("a", { href: c.telegram, rel: "noopener", text: c.telegramLabel || c.telegram }) : ph("Telegram");
    }
    if (kind === "phone") {
      return c.phone ? el("a", { href: "tel:" + c.phone.replace(/[^\d+]/g, ""), text: c.phone }) : ph("телефон");
    }
    if (kind === "city") return c.city ? document.createTextNode(c.city) : ph("город / формат работы");
    if (kind === "hours") return c.hours ? document.createTextNode(c.hours) : ph("часы работы");
    return null;
  }

  function socialsNode() {
    var frag = document.createDocumentFragment();
    var list = (S.socials || []).filter(function (s) { return S.showPlaceholders || s.href; });
    list.forEach(function (s, i) {
      if (i) frag.appendChild(document.createTextNode(" · "));
      frag.appendChild(s.href ? el("a", { href: s.href, rel: "noopener", text: s.label }) : el("span", { class: "ph", text: "[" + s.label + " — заполнить]" }));
    });
    return frag;
  }

  function fillContacts() {
    document.querySelectorAll("[data-contact]").forEach(function (n) {
      var kind = n.getAttribute("data-contact");
      n.textContent = "";
      var node = kind === "socials" ? socialsNode() : contactNode(kind);
      if (node) n.appendChild(node);
      /* Пустые контакты на рабочем сайте скрываем (showPlaceholders: false в site.config.js) */
      var isEmpty = !n.textContent.trim() || (n.querySelector(".ph") && !n.querySelector("a"));
      if (!S.showPlaceholders && isEmpty) {
        var row = n.closest(".c-item") || (n.tagName === "LI" ? n : null);
        if (row) row.hidden = true;
      }
    });
  }

  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    host.className = "site-footer";
    var wrap = el("div", { class: "wrap" });
    var grid = el("div", { class: "foot-grid" });

    var brand = el("div", { class: "foot-brand" });
    brand.appendChild(logo());
    brand.appendChild(el("p", { text: S.tagline + " " + S.role + " " + S.name + "." }));
    grid.appendChild(brand);

    var c1 = el("div");
    c1.appendChild(el("h4", { text: "Разделы" }));
    var ul = el("ul");
    NAV.forEach(function (n) { ul.appendChild(el("li", {}, [el("a", { href: n[0], text: n[1] })])); });
    c1.appendChild(ul);
    grid.appendChild(c1);

    var c2 = el("div");
    c2.appendChild(el("h4", { text: "Направления" }));
    var ul2 = el("ul");
    (window.KL.practice || []).slice(0, 5).forEach(function (p) {
      ul2.appendChild(el("li", {}, [el("a", { href: "practice.html#" + p.slug, text: p.title })]));
    });
    ul2.appendChild(el("li", {}, [el("a", { href: "practice.html", text: "Все направления →" })]));
    c2.appendChild(ul2);
    grid.appendChild(c2);

    var c3 = el("div");
    c3.appendChild(el("h4", { text: "Контакты" }));
    var ul3 = el("ul");
    ["email", "telegram"].forEach(function (k) { ul3.appendChild(el("li", { "data-contact": k })); });
    ul3.appendChild(el("li", { "data-contact": "socials" }));
    c3.appendChild(ul3);
    grid.appendChild(c3);

    wrap.appendChild(grid);
    var bottom = el("div", { class: "foot-bottom" });
    bottom.appendChild(el("span", { text: "© " + new Date().getFullYear() + " " + S.brand + ". " + S.name + ", " + S.role.toLowerCase() + "." }));
    var pl = el("a", { href: "privacy.html", text: "Политика обработки персональных данных" });
    bottom.appendChild(pl);
    wrap.appendChild(bottom);
    host.appendChild(wrap);
  }

  /* Значения из data/site.config.js: <span data-site="experience"></span> */
  function fillSite() {
    document.querySelectorAll("[data-site]").forEach(function (n) {
      var v = S[n.getAttribute("data-site")];
      if (v) n.textContent = v;
      else {
        var hide = n.closest("[data-site-hide]");
        if (hide) hide.hidden = true;
      }
    });
  }

  buildHeader();
  buildFooter();
  fillContacts();
  fillSite();
  window.KL.fillContacts = fillContacts;

  /* Плавное появление блоков */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (n) { io.observe(n); });
  } else {
    items.forEach(function (n) { n.classList.add("in"); });
  }
})();
