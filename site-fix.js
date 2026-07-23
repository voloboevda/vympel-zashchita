(() => {
  const SALES1 = { tel: "+79195741803", display: "+7 (919) 574-18-03" };
  const SALES2 = { tel: "+79080554444", display: "+7 (908) 055-44-44" };

  const REKV = {
    name: "ООО «ВЫМПЕЛСТРОЙСЕРВИС»",
    inn: "7452172431",
    kpp: "745201001",
    ogrn: "1257400022813",
    account: "40702810272710003073",
    bank: "ЧЕЛЯБИНСКОЕ ОТДЕЛЕНИЕ N8597 ПАО СБЕРБАНК",
    bik: "047501602",
    corr: "30101810700000000602",
    bankInn: "7707083893",
    bankKpp: "745302001",
    email: "ooo.vss74@yandex.com",
    edo: "АО «Калуга Астрал»",
    edoId: "2AEC57DEF0D-D6F7-41F9-9014-CB8E573DD818",
  };

  function fixHeader() {
    document.querySelectorAll('a[aria-label^="Позвонить"], a[href^="tel:"]').forEach((a) => {
      const inHeader = a.closest("header");
      const inAside = a.closest("aside");
      const label = a.getAttribute("aria-label") || "";
      if (inHeader || label.indexOf("Позвонить") === 0) {
        a.setAttribute("href", "tel:" + SALES1.tel);
        if (label.indexOf("Позвонить") === 0) {
          a.setAttribute("aria-label", "Позвонить: " + SALES1.display);
        }
        a.querySelectorAll("span").forEach((s) => {
          const t = (s.textContent || "").trim();
          if (/^\+7 \(9\d{2}\)/.test(t)) s.textContent = SALES1.display;
        });
        a.childNodes.forEach((n) => {
          if (n.nodeType === 3 && /\+7 \(9\d{2}\)/.test(n.textContent || "")) {
            n.textContent = SALES1.display;
          }
        });
      }
      if (inAside && a.getAttribute("href") && a.getAttribute("href").indexOf("tel:") === 0) {
        a.setAttribute("href", "tel:" + SALES1.tel);
        const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (/^\s*\+7 \(9\d{2}\)/.test(node.textContent || "")) {
            node.textContent = SALES1.display;
          }
        }
      }
    });
  }

  function applyPhone(a, w) {
    a.setAttribute("href", "tel:" + w.tel);
    a.querySelectorAll("span").forEach((s) => {
      const val = (s.textContent || "").trim();
      if (/^\+7 \(9\d{2}\)/.test(val)) s.textContent = w.display;
    });
  }

  function fixContacts() {
    const section = document.getElementById("contacts");
    if (!section) return;
    const salesAnchors = [];
    section.querySelectorAll("a[href^='tel:']").forEach((a) => {
      const text = (a.textContent || "").replace(/\s+/g, " ");
      if (/Отдел продаж|отдел продаж/.test(text)) salesAnchors.push(a);
    });
    if (!salesAnchors.length) return;
    applyPhone(salesAnchors[0], SALES1);
    if (salesAnchors.length >= 2) {
      applyPhone(salesAnchors[1], SALES2);
      return;
    }
    const first = salesAnchors[0];
    const parent = first.parentElement;
    if (!parent) return;
    if (parent.querySelector('a[href="tel:+79080554444"]')) return;
    const clone = first.cloneNode(true);
    applyPhone(clone, SALES2);
    first.after(clone);
  }


  function fixCtaPhone() {
    document.querySelectorAll("h2").forEach((h) => {
      if ((h.textContent || "").indexOf("Готовы обсудить ваш объект") === -1) return;
      const section = h.closest("section") || h.parentElement?.parentElement;
      if (!section) return;
      section.querySelectorAll('a[href^="tel:"]').forEach((a) => {
        a.setAttribute("href", "tel:" + SALES1.tel);
        a.style.color = "#ffffff";
        a.style.webkitTextFillColor = "#ffffff";
        let num = a.querySelector(".cta-phone-num");
        if (!num) {
          // wrap or append visible number
          const svg = a.querySelector("svg");
          num = document.createElement("span");
          num.className = "cta-phone-num";
          num.textContent = SALES1.display;
          num.style.color = "#ffffff";
          if (svg && svg.nextSibling) {
            // remove old text nodes
            let n = svg.nextSibling;
            while (n) {
              const next = n.nextSibling;
              if (n.nodeType === 3 || (n.nodeType === 1 && n.tagName === "SPAN")) n.remove();
              n = next;
            }
            svg.after(num);
          } else {
            a.appendChild(num);
          }
        } else {
          num.textContent = SALES1.display;
          num.style.color = "#ffffff";
        }
      });
    });
  }


  /* ---------- Requisites modal (vanilla, works without React dialog) ---------- */
  function ensureModal() {
    if (document.getElementById("vympel-rekv-modal")) return;
    const style = document.createElement("style");
    style.id = "vympel-rekv-modal-style";
    style.textContent = `
      #vympel-rekv-modal{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:1rem;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}
      #vympel-rekv-modal.is-open{display:flex}
      #vympel-rekv-modal .rekv-panel{width:min(34rem,100%);max-height:min(88vh,40rem);overflow:auto;background:#fff;color:#0f172a;border-radius:.5rem;border:1px solid rgba(15,23,42,.1);box-shadow:0 20px 50px rgba(15,23,42,.25)}
      html.dark #vympel-rekv-modal .rekv-panel{background:#0f172a;color:#f8fafc;border-color:rgba(255,255,255,.12)}
      #vympel-rekv-modal .rekv-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:1.1rem 1.25rem;border-bottom:1px solid rgba(15,23,42,.08)}
      html.dark #vympel-rekv-modal .rekv-head{border-color:rgba(255,255,255,.1)}
      #vympel-rekv-modal .rekv-title{margin:0;font-size:1.05rem;font-weight:700}
      #vympel-rekv-modal .rekv-close{border:0;background:transparent;font-size:1.4rem;line-height:1;cursor:pointer;color:inherit;opacity:.6;padding:.15rem}
      #vympel-rekv-modal .rekv-close:hover{opacity:1}
      #vympel-rekv-modal .rekv-body{padding:0 1.25rem 1.25rem}
      #vympel-rekv-modal dl{margin:0}
      #vympel-rekv-modal .rekv-row{display:flex;align-items:baseline;justify-content:space-between;gap:.75rem;padding:.55rem 0;border-bottom:1px solid rgba(15,23,42,.08)}
      html.dark #vympel-rekv-modal .rekv-row{border-color:rgba(255,255,255,.08)}
      #vympel-rekv-modal .rekv-row:last-child{border-bottom:0}
      #vympel-rekv-modal dt{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;opacity:.65;flex-shrink:0}
      #vympel-rekv-modal dd{margin:0;font-size:.875rem;font-weight:600;text-align:right;word-break:break-all}
      #vympel-rekv-modal .rekv-actions{display:flex;gap:.5rem;flex-wrap:wrap;padding:0 1.25rem 1.25rem}
      #vympel-rekv-modal .rekv-btn{appearance:none;border:0;border-radius:.375rem;padding:.55rem .9rem;font-size:.85rem;font-weight:600;cursor:pointer;background:#ea580c;color:#fff}
      #vympel-rekv-modal .rekv-btn:hover{background:#f97316}
      #vympel-rekv-modal .rekv-btn-ghost{background:transparent;color:inherit;border:1px solid rgba(15,23,42,.15)}
      html.dark #vympel-rekv-modal .rekv-btn-ghost{border-color:rgba(255,255,255,.18)}
    `;
    document.head.appendChild(style);

    const rows = [
      ["Наименование", REKV.name],
      ["ИНН", REKV.inn],
      ["КПП", REKV.kpp],
      ["ОГРН", REKV.ogrn],
      ["Расчётный счёт", REKV.account],
      ["Банк", REKV.bank],
      ["БИК", REKV.bik],
      ["Корр. счёт", REKV.corr],
      ["ИНН банка", REKV.bankInn],
      ["КПП банка", REKV.bankKpp],
      ["Email", REKV.email],
      ["ЭДО", REKV.edo],
      ["Идентификатор ЭДО", REKV.edoId],
    ]
      .map(
        ([k, v]) =>
          `<div class="rekv-row"><dt>${k}</dt><dd>${v}</dd></div>`
      )
      .join("");

    const modal = document.createElement("div");
    modal.id = "vympel-rekv-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "vympel-rekv-title");
    modal.innerHTML = `
      <div class="rekv-panel" role="document">
        <div class="rekv-head">
          <h2 class="rekv-title" id="vympel-rekv-title">Реквизиты компании</h2>
          <button type="button" class="rekv-close" aria-label="Закрыть">&times;</button>
        </div>
        <div class="rekv-body"><dl>${rows}</dl></div>
        <div class="rekv-actions">
          <button type="button" class="rekv-btn" data-rekv-copy>Скопировать</button>
          <button type="button" class="rekv-btn rekv-btn-ghost" data-rekv-close>Закрыть</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const open = () => {
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    modal.__open = open;
    modal.__close = close;

    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    modal.querySelector(".rekv-close").addEventListener("click", close);
    modal.querySelector("[data-rekv-close]").addEventListener("click", close);
    modal.querySelector("[data-rekv-copy]").addEventListener("click", async () => {
      const text = [
        REKV.name,
        `ИНН: ${REKV.inn}`,
        `КПП: ${REKV.kpp}`,
        `ОГРН: ${REKV.ogrn}`,
        "",
        `Расчётный счёт: ${REKV.account}`,
        `Банк: ${REKV.bank}`,
        `БИК: ${REKV.bik}`,
        `Корр. счёт: ${REKV.corr}`,
        `ИНН банка: ${REKV.bankInn}`,
        `КПП банка: ${REKV.bankKpp}`,
        "",
        `Email: ${REKV.email}`,
        `ЭДО: ${REKV.edo}`,
        `Идентификатор ЭДО: ${REKV.edoId}`,
      ].join("\n");
      try {
        await navigator.clipboard.writeText(text);
        const btn = modal.querySelector("[data-rekv-copy]");
        const prev = btn.textContent;
        btn.textContent = "Скопировано";
        setTimeout(() => {
          btn.textContent = prev;
        }, 1500);
      } catch (err) {
        window.prompt("Скопируйте реквизиты:", text);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  function openRequisites(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    ensureModal();
    document.getElementById("vympel-rekv-modal").__open();
    return false;
  }

  function isRequisitesControl(el) {
    if (!el || !el.closest) return null;
    const btn = el.closest(
      '[data-slot="dialog-trigger"], .js-open-requisites, button, a, label, span'
    );
    if (!btn) return null;
    const txt = (btn.textContent || "").replace(/\s+/g, " ").trim();
    if (txt.indexOf("Реквизиты") === -1) return null;
    // ignore inside our modal
    if (btn.closest("#vympel-rekv-modal")) return null;
    return btn;
  }

  document.addEventListener(
    "click",
    function (e) {
      const t = isRequisitesControl(e.target);
      if (!t) return;
      openRequisites(e);
    },
    true
  );

  /* ---------- Consent checkbox ---------- */
  function ensureConsent() {
    const forms = document.querySelectorAll("form");
    forms.forEach((form, idx) => {
      if (form.querySelector("#pd-consent, .vympel-pd-consent")) return;
      const consentP = Array.from(form.querySelectorAll("p")).find((p) =>
        /персональных данных|соглашаетесь/i.test(p.textContent || "")
      );
      const label = document.createElement("label");
      label.className =
        "vympel-pd-consent flex items-start gap-2.5 text-xs text-muted-foreground max-w-md cursor-pointer select-none";
      label.innerHTML =
        '<input id="pd-consent' +
        (idx ? "-" + idx : "") +
        '" name="pd_consent" type="checkbox" required class="vympel-pd-check mt-0.5 h-4 w-4 shrink-0 rounded border border-input accent-[#ea580c] cursor-pointer" />' +
        '<span>Согласен(на) на <a class="underline underline-offset-2 hover:text-foreground" href="/privacy/" target="_blank" rel="noopener">обработку персональных данных</a></span>';

      if (consentP) {
        consentP.replaceWith(label);
      } else {
        const submit =
          form.querySelector('button[type="submit"]') ||
          form.querySelector('button[data-slot="button"]');
        if (submit && submit.parentElement) {
          submit.parentElement.insertBefore(label, submit);
        } else {
          form.appendChild(label);
        }
      }
    });
  }

  function guardFormSubmit() {
    document.addEventListener(
      "click",
      function (e) {
        const btn = e.target && e.target.closest ? e.target.closest("button") : null;
        if (!btn) return;
        const form = btn.closest("form");
        if (!form) return;
        const isSubmit =
          btn.getAttribute("type") === "submit" ||
          (/получить|отправ|коммерческ/i.test(btn.textContent || "") &&
            btn.getAttribute("type") !== "button");
        // contacts CTA is type button often — still treat as submit intent
        const looksCta = /получить коммерческое|отправить/i.test(btn.textContent || "");
        if (!isSubmit && !looksCta) return;
        const box = form.querySelector(".vympel-pd-check, input[name='pd_consent']");
        if (!box) return;
        if (!box.checked) {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          box.focus();
          box.setAttribute("aria-invalid", "true");
          let hint = form.querySelector(".vympel-pd-hint");
          if (!hint) {
            hint = document.createElement("p");
            hint.className = "vympel-pd-hint text-xs text-safety mt-1";
            hint.style.color = "#ea580c";
            box.closest("label")?.after(hint);
          }
          hint.textContent = "Отметьте согласие на обработку персональных данных";
        }
      },
      true
    );
  }

  function enhanceRequisites() {
    document.querySelectorAll('[data-slot="dialog-trigger"]').forEach((el) => {
      const txt = (el.textContent || "").replace(/\s+/g, " ");
      if (txt.indexOf("Реквизиты") !== -1) {
        el.classList.add("js-open-requisites");
        el.setAttribute("type", "button");
      }
    });
  }




  function enhanceObjectCards() {
    const section = document.getElementById("objects");
    if (!section) return;
    const cta = document.getElementById("objects-request");
    // Cards: hover only — no drill-in / no click action
    section.querySelectorAll("a.block.h-full, a.object-card-link, a[href^='/services']").forEach((a) => {
      if (a.id === "objects-request") return;
      if (!(a.closest("li") && a.querySelector("h3"))) return;
      a.removeAttribute("href");
      a.classList.add("object-card-link");
      a.style.cursor = "default";
      a.setAttribute("role", "presentation");
      a.setAttribute("tabindex", "-1");
      if (!a.__vympelNoNav) {
        a.__vympelNoNav = true;
        a.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
      }
    });
    if (cta) {
      cta.setAttribute("href", "#contacts");
      cta.style.cursor = "pointer";
    }
  }




  function ensureAdvantagesCta() {
    const adv = document.getElementById("advantages");
    if (!adv) return;

    // Remove orange separator look between advantages cards and CTA (same section)
    const orphans = Array.from(
      document.querySelectorAll('section[aria-label="Свяжитесь с нами"]')
    ).filter(function (sec) {
      return sec !== adv && !adv.contains(sec);
    });

    let cta = document.getElementById("advantages-cta");

    orphans.forEach(function (sec) {
      if (!cta) {
        const wrap = document.createElement("div");
        wrap.id = "advantages-cta";
        wrap.className =
          "mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-white/15";
        wrap.setAttribute("aria-label", "Свяжитесь с нами");
        // prefer inner content of max-w wrapper
        const inner =
          sec.querySelector(".mx-auto.max-w-7xl") ||
          sec.querySelector(".mx-auto") ||
          sec;
        while (inner.firstChild) wrap.appendChild(inner.firstChild);
        const host = adv.querySelector(".mx-auto.max-w-7xl") || adv;
        host.appendChild(wrap);
        cta = wrap;
      }
      sec.remove();
    });

    if (!cta) return;

    // Layout: center buttons on mobile
    const row = cta.querySelector(".flex.flex-col, .flex");
    const btns = cta.querySelector("a[href^='tel:']")
      ? cta.querySelector("a[href^='tel:']").parentElement
      : null;
    if (btns && btns.classList) {
      btns.classList.add("items-center", "justify-center");
      btns.style.marginLeft = "auto";
      btns.style.marginRight = "auto";
    }

    // Phone visibility
    cta.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.setAttribute("href", "tel:" + SALES1.tel);
      a.style.color = "#ffffff";
      a.style.webkitTextFillColor = "#ffffff";
      var num = a.querySelector(".cta-phone-num");
      if (!num) {
        var svg = a.querySelector("svg");
        num = document.createElement("span");
        num.className = "cta-phone-num";
        num.textContent = SALES1.display;
        num.style.color = "#ffffff";
        if (svg) {
          var n = svg.nextSibling;
          while (n) {
            var next = n.nextSibling;
            if (n.nodeType === 3 || (n.nodeType === 1 && n.tagName === "SPAN")) n.remove();
            n = next;
          }
          svg.after(num);
        } else {
          a.appendChild(num);
        }
      } else {
        num.textContent = SALES1.display;
        num.style.color = "#ffffff";
        num.style.webkitTextFillColor = "#ffffff";
      }
    });
  }


  function animateMfgStats() {
    const section = document.getElementById("manufacturing");
    if (!section || section.__mfgAnimDone || section.__mfgAnimBound) return;

    const pctEl = section.querySelector("[data-mfg-stat='pct']");
    const aEl = section.querySelector("[data-mfg-stat='a']");
    const bEl = section.querySelector("[data-mfg-stat='b']");
    if (!pctEl && !aEl) return;
    section.__mfgAnimBound = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = 1500;

  
  function bindMobileNav() {
    const nav = document.querySelector("header.site-header .nav");
    const burger = document.getElementById("nav-burger");
    if (!nav || !burger) return;
    if (burger.__vympelNavBound) return;
    burger.__vympelNavBound = true;
    const menu = document.getElementById("site-nav-menu") || nav.querySelector(".nav__menu");
    const MQ = window.matchMedia("(min-width: 960px)");
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    }
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains("is-open"));
    });
    if (menu) {
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          setOpen(false);
        });
      });
    }
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    function onMq() {
      if (MQ.matches) setOpen(false);
    }
    if (MQ.addEventListener) MQ.addEventListener("change", onMq);
    else if (MQ.addListener) MQ.addListener(onMq);
  }


  function fixAdvantagesHeading() {
    const h = document.getElementById("advantages-heading");
    if (!h) return;
    h.classList.add("text-white");
    h.style.color = "#ffffff";
    h.style.webkitTextFillColor = "#ffffff";
    h.style.opacity = "1";
    h.style.visibility = "visible";
  }


  function fixFooterLogo() {
    const footer = document.querySelector("footer");
    if (!footer) return;
    footer.querySelectorAll('img[src*="client-logo"]').forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src.indexOf("client-logo-light") >= 0) {
        img.setAttribute("src", "/images/header-logo-light.png?v=14");
      } else if (src.indexOf("client-logo") >= 0) {
        img.setAttribute("src", "/images/header-logo-dark.png?v=14");
      }
    });
  }


  function fixQualityControlImg() {
    document.querySelectorAll('img[src*="quality-control"]').forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src.indexOf("quality-control.jpg") === -1) {
        img.setAttribute("src", "/images/quality-control.jpg?v=15");
      }
      const alt = img.getAttribute("alt") || "";
      if (alt.indexOf("Инженер") === 0) {
        img.setAttribute(
          "alt",
          "Контроль качества защитной сетки — измерения и проверка на производстве"
        );
      }
    });
  }


  function fixManufacturingImg() {
    document.querySelectorAll('img[src*="manufacturing-facility"]').forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src.indexOf("manufacturing-facility.jpg") === -1) {
        img.setAttribute("src", "/images/manufacturing-facility.jpg?v=19");
      }
    });
  }

  function run() {
      if (section.__mfgAnimDone) return;
      section.__mfgAnimDone = true;
      if (reduced) {
        if (pctEl) pctEl.textContent = "100";
        if (aEl) aEl.textContent = "24";
        if (bEl) bEl.textContent = "7";
        return;
      }
      const start = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - start) / DURATION);
        const eased = 1 - Math.pow(1 - t, 3);
        if (pctEl) pctEl.textContent = String(Math.round(100 * eased));
        if (aEl) aEl.textContent = String(Math.round(24 * eased));
        if (bEl) bEl.textContent = String(Math.round(7 * eased));
        if (t < 1) requestAnimationFrame(frame);
        else {
          if (pctEl) pctEl.textContent = "100";
          if (aEl) aEl.textContent = "24";
          if (bEl) bEl.textContent = "7";
        }
      }
      requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.disconnect();
          run();
        });
      },
      { threshold: 0.35 }
    );
    io.observe(section);
  }

  function run() {
    fixHeader();
    fixContacts();
    fixCtaPhone();
    ensureAdvantagesCta();
    animateMfgStats();
    enhanceRequisites();
    enhanceObjectCards();
    ensureModal();
    ensureConsent();
    bindMobileNav();
    fixAdvantagesHeading();
    fixFooterLogo();
    fixQualityControlImg();
    fixManufacturingImg();
  }

  guardFormSubmit();
  run();
  document.addEventListener("DOMContentLoaded", run);
  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(run, 2000);
  const obs = new MutationObserver(() => {
    clearTimeout(obs._t);
    obs._t = setTimeout(run, 50);
  });
  obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
