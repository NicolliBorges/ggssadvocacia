(function () {
  "use strict";
  var PHONE = "5511989777787";
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  // Header sólido ao rolar
  var header = document.querySelector(".site-header");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      header.classList.toggle("solid", window.scrollY > 24);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu mobile
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  toggle.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a,button")) setMenu(false); });

  // Link ativo no menu
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  if ("IntersectionObserver" in window) {
    var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = "#" + en.target.id;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === id;
          a.classList.toggle("active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });

  }

  // Entrada suave — o conteúdo só é escondido depois que o JS confirma suporte,
  // e tudo aparece de qualquer forma em até 900ms (crawlers / IO lento).
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduce) {
    var vh = window.innerHeight || 800;
    var pending = reveals.filter(function (el) { return el.getBoundingClientRect().top >= vh; });
    if (pending.length) {
      pending.forEach(function (el) { el.classList.remove("in"); });
      doc.classList.add("js-reveal");
      reveals.forEach(function (el) { if (pending.indexOf(el) < 0) el.classList.add("in"); });
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); }
        });
      }, { threshold: 0.1 });
      pending.forEach(function (el) { rio.observe(el); });
      setTimeout(function () { reveals.forEach(function (el) { el.classList.add("in"); }); }, 900);
    }
  }

  // Modal Área do Arrematante
  var modal = document.getElementById("arrematante");
  var box = modal.querySelector(".modal-box");
  var lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { var f = modal.querySelector("input"); if (f) f.focus(); }, 30);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll("[data-open-modal]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); setMenu(false); openModal(); });
  });
  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("mousedown", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var f = box.querySelectorAll("button, input, a[href]");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Seleção única em pills / cards
  modal.querySelectorAll("[data-group]").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-value]");
      if (!btn) return;
      group.querySelectorAll("button[data-value]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
    });
  });

  // Máscara do celular
  var nome = document.getElementById("f-nome");
  var cel = document.getElementById("f-cel");
  cel.addEventListener("input", function () {
    var d = cel.value.replace(/\D/g, "").slice(0, 11);
    var v = d;
    if (d.length > 7) v = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    else if (d.length > 2) v = "(" + d.slice(0, 2) + ") " + d.slice(2);
    else if (d.length) v = "(" + d;
    cel.value = v;
    setError(cel, "");
  });
  nome.addEventListener("input", function () { setError(nome, ""); });

  function setError(input, msg) {
    var field = input.closest(".field");
    field.classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    field.querySelector(".field-error").textContent = msg;
  }
  function picked(name) {
    var b = modal.querySelector('[data-group="' + name + '"] [aria-pressed="true"]');
    return b ? b.getAttribute("data-value") : "—";
  }

  document.getElementById("arrematante-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    if (nome.value.trim().length < 3) { setError(nome, "Informe seu nome completo."); ok = false; }
    if (cel.value.replace(/\D/g, "").length < 10) { setError(cel, "Informe um celular válido com DDD."); ok = false; }
    if (!ok) { (modal.querySelector(".invalid input") || nome).focus(); return; }
    var msg = [
      "Olá, Dra. Giovana! Vim pelo site (Área do Arrematante).", "",
      "Nome: " + nome.value.trim(),
      "Celular: " + cel.value,
      "Situação: " + picked("situacao"),
      "Imóveis por ano: " + picked("quantidade"),
      "Tipo de leilão: " + picked("tipo"),
      "Serviço: " + picked("servico")
    ].join("\n");
    window.open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
})();
