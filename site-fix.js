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





  /* ===== Local preview: Wibify spectrum lists (rollback = set flags false) ===== */
  const SPECTRUM_PREVIEW = { objects: false, advantages: true };
  const SPECTRUM_ICONS = {"cylinder": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-cylinder\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />\n  <path d=\"M3 5v14a9 3 0 0 0 18 0V5\" /></svg>", "flame": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-flame\" aria-hidden=\"true\"><path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\" /></svg>", "waves": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-waves\" aria-hidden=\"true\"><path d=\"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"></path><path d=\"M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"></path><path d=\"M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"></path></svg>", "zap": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-zap\" aria-hidden=\"true\"><path d=\"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z\" /></svg>", "gauge": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-gauge\" aria-hidden=\"true\"><path d=\"m12 14 4-4\" />\n  <path d=\"M3.34 19a10 10 0 1 1 17.32 0\" /></svg>", "building-2": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-building-2\" aria-hidden=\"true\"><path d=\"M10 12h4\" />\n  <path d=\"M10 8h4\" />\n  <path d=\"M14 21v-3a2 2 0 0 0-4 0v3\" />\n  <path d=\"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2\" />\n  <path d=\"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16\" /></svg>", "database": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-database\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\" />\n  <path d=\"M3 5V19A9 3 0 0 0 21 19V5\" />\n  <path d=\"M3 12A9 3 0 0 0 21 12\" /></svg>", "factory": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-factory\" aria-hidden=\"true\"><path d=\"M12 16h.01\" />\n  <path d=\"M16 16h.01\" />\n  <path d=\"M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z\" />\n  <path d=\"M8 16h.01\" /></svg>", "arrow-up-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-arrow-up-right\" aria-hidden=\"true\"><path d=\"M7 7h10v10\" />\n  <path d=\"M7 17 17 7\" /></svg>", "hard-hat": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-hard-hat\" aria-hidden=\"true\"><path d=\"M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5\" />\n  <path d=\"M14 6a6 6 0 0 1 6 6v3\" />\n  <path d=\"M4 15v-3a6 6 0 0 1 6-6\" />\n  <rect x=\"2\" y=\"15\" width=\"20\" height=\"4\" rx=\"1\" /></svg>", "sliders-horizontal": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-sliders-horizontal\" aria-hidden=\"true\"><path d=\"M10 5H3\" />\n  <path d=\"M12 19H3\" />\n  <path d=\"M14 3v4\" />\n  <path d=\"M16 17v4\" />\n  <path d=\"M21 12h-9\" />\n  <path d=\"M21 19h-5\" />\n  <path d=\"M21 5h-7\" />\n  <path d=\"M8 10v4\" />\n  <path d=\"M8 12H3\" /></svg>", "shield": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-shield\" aria-hidden=\"true\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /></svg>", "git-branch": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-git-branch\" aria-hidden=\"true\"><path d=\"M15 6a9 9 0 0 0-9 9V3\" />\n  <circle cx=\"18\" cy=\"6\" r=\"3\" />\n  <circle cx=\"6\" cy=\"18\" r=\"3\" /></svg>", "triangle-alert": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-triangle-alert\" aria-hidden=\"true\"><path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" />\n  <path d=\"M12 9v4\" />\n  <path d=\"M12 17h.01\" /></svg>"};
  const SPECTRUM_ARROW = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-arrow-up-right\" aria-hidden=\"true\"><path d=\"M7 7h10v10\" />\n  <path d=\"M7 17 17 7\" /></svg>";
  const OBJECTS_SPECTRUM = [{"id": "01", "category": "Резервуарные парки", "title": "Защита резервуаров РВС как единый контур.", "description": "Защита вертикальных стальных резервуаров от падения БПЛА и обломков. Сетка перекрывает всю площадь парка.", "tags": ["РВС", "Парк", "Каркас", "Сетка"], "icon": "cylinder", "href": "/services/zashchita-rvs-ot-bpla", "active": true}, {"id": "02", "category": "Нефтегазовые", "title": "Сепараторы", "description": "Защита сепарационного оборудования с сохранением технологических проёмов для обслуживания.", "tags": ["Сепараторы", "Проёмы", "Регламент"], "icon": "flame", "href": "/services/zashchita-separatorov-ot-bpla", "active": false}, {"id": "03", "category": "Насосные станции", "title": "БКНС", "description": "Защита насосного оборудования блочных кустовых насосных станций от воздушных угроз.", "tags": ["БКНС", "Насосы", "Блоки"], "icon": "waves", "href": "/services/zashchita-nasosnyh-stantsiy-ot-bpla", "active": false}, {"id": "04", "category": "Энергетика", "title": "Трансформаторные подстанции", "description": "Защита силовых трансформаторов и распределительных устройств без нарушения электробезопасности.", "tags": ["ТП", "РУ", "Зазоры", "ТБ"], "icon": "zap", "href": "/services/zashchita-podstantsiy-ot-bpla", "active": false}, {"id": "05", "category": "Приборы и автоматика", "title": "КИПиА", "description": "Защита систем контрольно-измерительных приборов и автоматики от повреждений.", "tags": ["КИПиА", "Шкафы", "Датчики"], "icon": "gauge", "href": "/#contacts", "active": false}, {"id": "06", "category": "Модульные здания", "title": "Операторные", "description": "Защита персонала и систем управления в операторных и блок-боксах.", "tags": ["Операторные", "АСУ", "Эвакуация"], "icon": "building-2", "href": "/services/zashchita-operatornyh-ot-bpla", "active": false}, {"id": "07", "category": "Учёт продукции", "title": "Узлы учёта", "description": "Защита узлов учёта нефти и газа с сохранением доступа к средствам измерения.", "tags": ["Учёт", "Метрология", "Доступ"], "icon": "database", "href": "/#contacts", "active": false}, {"id": "08", "category": "Комплексные объекты", "title": "Технологические установки", "description": "Защита технологических установок комплексной подготовки нефти и газа.", "tags": ["УКПН", "УКПГ", "Площадка"], "icon": "factory", "href": "/#contacts", "active": false}];
  const ADVANTAGES_SPECTRUM = [{"id": "01", "category": "Сроки", "title": "Быстрый монтаж без остановки производства.", "description": "Монтаж на действующих объектах без остановки производства. Типовые элементы сокращают сроки работ.", "tags": ["Монтаж", "Типовые узлы", "Сроки"], "icon": "zap", "href": "#advantages-get-kp", "active": true}, {"id": "02", "category": "Эксплуатация", "title": "Обслуживание без демонтажа защиты.", "description": "Полный доступ к оборудованию через технологические проёмы. Не требуется снимать защиту для регламентных работ.", "tags": ["Проёмы", "Регламент", "Доступ"], "icon": "hard-hat", "href": "#advantages-get-kp", "active": false}, {"id": "03", "category": "Проектирование", "title": "Адаптация под геометрию объекта.", "description": "Под любые габариты и типы технологических объектов. Индивидуальное проектирование под каждый объект.", "tags": ["КМ", "КМД", "Индивидуально"], "icon": "sliders-horizontal", "href": "#advantages-get-kp", "active": false}, {"id": "04", "category": "Срок службы", "title": "Долговечность и ремонтопригодность.", "description": "Высокая ремонтопригодность и длительный срок службы. Оцинкованные конструкции с антикоррозийным покрытием.", "tags": ["Оцинковка", "Антикор", "Ремонт"], "icon": "shield", "href": "#advantages-get-kp", "active": false}, {"id": "05", "category": "Бюджет", "title": "Поэтапная реализация проекта.", "description": "Возможность реализации проекта по этапам. Распределение нагрузки на бюджет и график производства работ.", "tags": ["Этапы", "Бюджет", "График"], "icon": "git-branch", "href": "#advantages-get-kp", "active": false}, {"id": "06", "category": "Безопасность", "title": "Снижение рисков аварии и простоя.", "description": "Защита критически важного оборудования от повреждений. Снижение вероятности аварии и остановки производства.", "tags": ["БПЛА", "Риски", "Непрерывность"], "icon": "triangle-alert", "href": "#advantages-get-kp", "active": false}];

  function injectSpectrumStyles() {
    if (document.getElementById("spectrum-preview-css")) return;
    const css = `
#objects.spectrum-on ul.grid,
#advantages.spectrum-on ul.grid { display: none !important; }
.spectrum {
  list-style: none; margin: 2.5rem 0 0; padding: 0;
  border-top: 1px solid var(--spectrum-line, rgba(15,23,42,.12));
}
.spectrum-item {
  position: relative;
  border-bottom: 1px solid var(--spectrum-line, rgba(15,23,42,.12));
}
.spectrum-item::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, rgba(234,88,12,.14), rgba(234,88,12,.03) 48%, transparent 78%);
  opacity: 0; transition: opacity .3s ease;
}
.spectrum-item.is-active::before,
.spectrum-item:hover::before { opacity: 1; }
.spectrum-link {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: 3rem 3.4rem minmax(11rem, 1.05fr) minmax(11rem, 1fr) 3rem;
  gap: 1rem 1.1rem; align-items: center;
  padding: 1.35rem .25rem 1.35rem 0;
  color: inherit; text-decoration: none;
}
@media (max-width: 900px) {
  .spectrum-link {
    grid-template-columns: 2.4rem 3rem 1fr auto;
    grid-template-areas: "num ico title arr" ". . desc desc" ". . tags tags";
  }
  .spectrum-num { grid-area: num; }
  .spectrum-ico { grid-area: ico; }
  .spectrum-main { grid-area: title; }
  .spectrum-side { grid-area: desc; }
  .spectrum-tags { grid-area: tags; }
  .spectrum-arr { grid-area: arr; }
}
.spectrum-num {
  font-family: ui-monospace, "JetBrains Mono", monospace;
  font-size: .75rem; letter-spacing: .1em;
  color: var(--spectrum-muted, #64748b); text-align: center;
  transition: color .25s ease;
}
.spectrum-item.is-active .spectrum-num,
.spectrum-item:hover .spectrum-num { color: #ea580c; }
.spectrum-ico {
  width: 3.1rem; height: 3.1rem; border-radius: 999px;
  display: grid; place-items: center;
  border: 1px solid var(--spectrum-line, rgba(15,23,42,.14));
  color: var(--spectrum-ink, #0f172a);
  background: var(--spectrum-chip, rgba(15,23,42,.03));
  transition: border-color .25s ease, color .25s ease, background .25s ease, transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease;
}
.spectrum-ico svg { width: 1.4rem; height: 1.4rem; }
.spectrum-item.is-active .spectrum-ico,
.spectrum-item:hover .spectrum-ico {
  border-color: rgba(234,88,12,.55); color: #ea580c;
  background: rgba(234,88,12,.1); transform: scale(1.05);
  box-shadow: 0 0 0 4px rgba(234,88,12,.1);
}
.spectrum-cat {
  display: block; margin: 0 0 .35rem;
  font-family: ui-monospace, "JetBrains Mono", monospace;
  font-size: .62rem; letter-spacing: .14em; text-transform: uppercase;
  color: #ea580c;
}
.spectrum-title {
  margin: 0; font-family: Manrope, system-ui, sans-serif;
  font-size: clamp(1.1rem, 2vw, 1.5rem); font-weight: 800;
  line-height: 1.2; letter-spacing: -0.02em; max-width: 22rem;
  color: var(--spectrum-ink, #0f172a);
  transition: transform .3s cubic-bezier(.22,1,.36,1);
}
.spectrum-item.is-active .spectrum-title,
.spectrum-item:hover .spectrum-title { transform: translateX(3px); }
.spectrum-desc {
  margin: 0 0 .7rem; font-family: Inter, system-ui, sans-serif;
  font-size: .9rem; line-height: 1.55;
  color: var(--spectrum-muted, #64748b); max-width: 34rem;
}
.spectrum-tags { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: .35rem; }
.spectrum-tags li {
  font-family: Inter, system-ui, sans-serif; font-size: .7rem; font-weight: 500;
  padding: .25rem .55rem; border-radius: 999px;
  border: 1px solid var(--spectrum-line, rgba(15,23,42,.14));
  color: var(--spectrum-muted, #64748b);
}
.spectrum-arr {
  width: 2.7rem; height: 2.7rem; border-radius: 999px;
  display: grid; place-items: center; justify-self: end;
  border: 1px solid var(--spectrum-line, rgba(15,23,42,.14));
  color: var(--spectrum-muted, #64748b);
  transition: background .25s ease, border-color .25s ease, color .25s ease, transform .3s cubic-bezier(.22,1,.36,1);
}
.spectrum-arr svg { width: 1.05rem; height: 1.05rem; }
.spectrum-item.is-active .spectrum-arr,
.spectrum-item:hover .spectrum-arr {
  background: #ea580c; border-color: #ea580c; color: #fff;
  transform: translateX(3px) scale(1.04);
}
#advantages.spectrum-on {
  --spectrum-ink: #f8fafc;
  --spectrum-muted: rgba(248,250,252,.62);
  --spectrum-line: rgba(255,255,255,.14);
  --spectrum-chip: rgba(255,255,255,.04);
}
#objects.spectrum-on {
  --spectrum-ink: #0f172a;
  --spectrum-muted: #64748b;
  --spectrum-line: rgba(15,23,42,.12);
  --spectrum-chip: rgba(15,23,42,.03);
}
html.dark #objects.spectrum-on {
  --spectrum-ink: #f8fafc;
  --spectrum-muted: rgba(248,250,252,.62);
  --spectrum-line: rgba(255,255,255,.12);
  --spectrum-chip: rgba(255,255,255,.04);
}
@media (prefers-reduced-motion: reduce) {
  .spectrum-item.is-active .spectrum-title,
  .spectrum-item:hover .spectrum-title,
  .spectrum-item.is-active .spectrum-ico,
  .spectrum-item:hover .spectrum-ico,
  .spectrum-item.is-active .spectrum-arr,
  .spectrum-item:hover .spectrum-arr { transform: none; }
}
`;
    const style = document.createElement("style");
    style.id = "spectrum-preview-css";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildSpectrumList(items) {
    const ul = document.createElement("ul");
    ul.className = "spectrum";
    ul.setAttribute("data-spectrum", "1");
    ul.innerHTML = items.map(function (item) {
      const tags = (item.tags || []).map(function (t) { return "<li>" + t + "</li>"; }).join("");
      const icon = SPECTRUM_ICONS[item.icon] || "";
      return (
        '<li class="spectrum-item">' +
          '<a class="spectrum-link" href="' + item.href + '">' +
            '<span class="spectrum-num">' + item.id + '</span>' +
            '<span class="spectrum-ico">' + icon + '</span>' +
            '<div class="spectrum-main">' +
              '<span class="spectrum-cat">' + item.category + '</span>' +
              '<h3 class="spectrum-title">' + item.title + '</h3>' +
            '</div>' +
            '<div class="spectrum-side">' +
              '<p class="spectrum-desc">' + item.description + '</p>' +
              '<ul class="spectrum-tags">' + tags + '</ul>' +
            '</div>' +
            '<span class="spectrum-arr" aria-hidden="true">' + SPECTRUM_ARROW + '</span>' +
          '</a>' +
        '</li>'
      );
    }).join("");

    ul.addEventListener("mouseover", function (e) {
      const item = e.target.closest(".spectrum-item");
      if (!item || !ul.contains(item)) return;
      ul.querySelectorAll(".spectrum-item").forEach(function (el) {
        el.classList.toggle("is-active", el === item);
      });
    });
    ul.addEventListener("mouseleave", function () {
      ul.querySelectorAll(".spectrum-item").forEach(function (el) {
        el.classList.remove("is-active");
      });
    });
    return ul;
  }

  function applySpectrumToSection(sectionId, items, enabled) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    if (!enabled) {
      section.classList.remove("spectrum-on");
      const existing = section.querySelector('ul.spectrum[data-spectrum="1"]');
      if (existing) existing.remove();
      return;
    }
    if (section.querySelector('ul.spectrum[data-spectrum="1"]')) {
      section.classList.add("spectrum-on");
      // keep advantages arrows pointing to КП
      if (sectionId === "advantages") {
        section.querySelectorAll('a.spectrum-link').forEach(function (a) {
          a.setAttribute("href", "#advantages-get-kp");
        });
      }
      return;
    }
    const grid = section.querySelector("ul.grid");
    if (!grid) return;
    injectSpectrumStyles();
    section.classList.add("spectrum-on");
    var data = items;
    if (sectionId === "advantages") {
      data = items.map(function (it) {
        return Object.assign({}, it, { href: "#advantages-get-kp" });
      });
    }
    const list = buildSpectrumList(data);
    grid.insertAdjacentElement("afterend", list);
  }

  function applySpectrumPreview() {
    if (!SPECTRUM_PREVIEW.objects && !SPECTRUM_PREVIEW.advantages) return;
    injectSpectrumStyles();
    applySpectrumToSection("objects", OBJECTS_SPECTRUM, !!SPECTRUM_PREVIEW.objects);
    applySpectrumToSection("advantages", ADVANTAGES_SPECTRUM, !!SPECTRUM_PREVIEW.advantages);
  }


  /* ===== Local preview: IconHover3D-style objects (advantages untouched) ===== */
  const OBJECTS_HOVER3D_PREVIEW = true;

  function injectObjectsHover3dStyles() {
    var oldCss = document.getElementById("objects-hover3d-css");
    if (oldCss) oldCss.remove();
    var oldV3 = document.getElementById("objects-hover3d-css-v3");
    if (oldV3) oldV3.remove();
    var oldV4 = document.getElementById("objects-hover3d-css-v4");
    if (oldV4) oldV4.remove();
    var oldV5 = document.getElementById("objects-hover3d-css-v5");
    if (oldV5) oldV5.remove();
    var oldV7 = document.getElementById("objects-hover3d-css-v7");
    if (oldV7) oldV7.remove();
    var oldV8 = document.getElementById("objects-hover3d-css-v8");
    if (oldV8) oldV8.remove();
    if (document.getElementById("objects-hover3d-css-v9")) return;
    const css = `
#objects.hover3d-on > .mx-auto > ul.grid { display: none !important; }
.obj-hover3d-list {
  list-style: none; margin: 2rem 0 0; padding: 0;
  display: grid;
  /* minmax(0,1fr) — иначе nowrap-заголовки раздувают колонку шире экрана */
  grid-template-columns: minmax(0, 1fr);
  gap: 1px;
  width: 100%;
  max-width: 100%;
  background: color-mix(in srgb, var(--oh-line, rgba(15,23,42,.14)) 100%, transparent);
  border: 1px solid color-mix(in srgb, var(--oh-line, rgba(15,23,42,.14)) 100%, transparent);
}
.obj-hover3d {
  --oh-fg: #0f172a;
  --oh-bg: #ffffff;
  --oh-muted: rgba(15, 23, 42, 0.62);
  --oh-line: rgba(15, 23, 42, 0.12);
  --oh-accent: #ea580c;
  position: relative;
  border-radius: 0;
  background: var(--oh-bg);
  overflow: visible;
  cursor: default;
  min-width: 0;
  max-width: 100%;
}
html.dark #objects.hover3d-on .obj-hover3d {
  --oh-fg: #f8fafc;
  --oh-bg: #0f172a;
  --oh-muted: rgba(248, 250, 252, 0.62);
  --oh-line: rgba(255, 255, 255, 0.14);
}
.obj-hover3d-link {
  display: flex; flex-direction: row; flex-wrap: nowrap;
  align-items: center; gap: 1.1rem;
  padding: .85rem 1rem;
  color: inherit; text-decoration: none;
  min-height: 0;
  pointer-events: none;
}
.obj-hover3d-icon {
  position: relative; flex: none;
  width: 4.25rem; height: 4.25rem;
  display: grid; place-items: center;
  border: 1px solid color-mix(in srgb, var(--oh-fg) 18%, transparent);
  border-radius: 0;
  overflow: visible;
}
.obj-hover3d-icon-clip {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  overflow: hidden;
}
.obj-hover3d-lucide {
  display: grid; place-items: center;
  color: var(--oh-fg);
  transition: color .3s ease, transform .35s cubic-bezier(.22,1,.36,1);
  transform-origin: center center;
}
.obj-hover3d-lucide svg {
  width: 1.65rem; height: 1.65rem;
}
.obj-hover3d:hover .obj-hover3d-lucide {
  color: var(--oh-accent);
  transform: scale(1.38);
}
.obj-hover3d-corner {
  position: absolute; width: 11px; height: 11px;
  pointer-events: none; border-radius: 0;
  transition: inset .35s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1), border-color .3s ease;
}
.obj-hover3d-corner--tl { top: 8px; left: 8px; border-top: 2px solid var(--oh-fg); border-left: 2px solid var(--oh-fg); }
.obj-hover3d-corner--tr { top: 8px; right: 8px; border-top: 2px solid var(--oh-fg); border-right: 2px solid var(--oh-fg); }
.obj-hover3d-corner--bl { bottom: 8px; left: 8px; border-bottom: 2px solid var(--oh-fg); border-left: 2px solid var(--oh-fg); }
.obj-hover3d-corner--br { bottom: 8px; right: 8px; border-bottom: 2px solid var(--oh-fg); border-right: 2px solid var(--oh-fg); }
.obj-hover3d:hover .obj-hover3d-corner--tl { top: -3px; left: -3px; transform: scale(1.25); border-color: var(--oh-accent); }
.obj-hover3d:hover .obj-hover3d-corner--tr { top: -3px; right: -3px; transform: scale(1.25); border-color: var(--oh-accent); }
.obj-hover3d:hover .obj-hover3d-corner--bl { bottom: -3px; left: -3px; transform: scale(1.25); border-color: var(--oh-accent); }
.obj-hover3d:hover .obj-hover3d-corner--br { bottom: -3px; right: -3px; transform: scale(1.25); border-color: var(--oh-accent); }
.obj-hover3d-body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: .35rem; }
.obj-hover3d-cat {
  font-family: ui-monospace, "JetBrains Mono", monospace;
  font-size: .58rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--oh-accent);
}
.obj-hover3d-title {
  position: relative; display: inline-flex; align-items: center;
  width: fit-content; max-width: 100%;
  font-family: Manrope, system-ui, sans-serif;
  font-weight: 700; font-size: clamp(.95rem, 1.5vw, 1.1rem);
  line-height: 1.25; color: var(--oh-fg);
  overflow: hidden; white-space: nowrap; border-radius: 0;
}
.obj-hover3d-title > span { position: relative; z-index: 2; padding: 0 .12rem; }
.obj-hover3d-title__fill {
  position: absolute; inset: 0; z-index: 1;
  background: var(--oh-fg);
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform .3s cubic-bezier(.25,.46,.45,.94);
}
.obj-hover3d-title__overlay {
  position: absolute; inset: 0; z-index: 3;
  color: var(--oh-bg);
  padding: 0 .12rem;
  clip-path: inset(0 100% 0 0);
  transition: clip-path .3s cubic-bezier(.25,.46,.45,.94);
  pointer-events: none; white-space: nowrap;
}
.obj-hover3d:hover .obj-hover3d-title__fill { transform: scaleX(1); }
.obj-hover3d:hover .obj-hover3d-title__overlay { clip-path: inset(0 0 0 0); }
.obj-hover3d-desc {
  margin: 0; max-width: 36rem;
  font-family: Inter, system-ui, sans-serif;
  font-size: .82rem; line-height: 1.45; color: var(--oh-muted);
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.obj-hover3d-tags {
  list-style: none; margin: .2rem 0 0; padding: 0;
  display: flex; flex-wrap: wrap; gap: .25rem;
}
.obj-hover3d-tags li {
  font-size: .65rem; font-weight: 500;
  padding: .18rem .4rem;
  border-radius: 0; /* rectangular, site style */
  border: 1px solid var(--oh-line); color: var(--oh-muted);
}
@media (min-width: 1024px) {
  .obj-hover3d-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 1023px) {
  .obj-hover3d-link { gap: .75rem; padding: .85rem; }
  .obj-hover3d-icon { width: 3.25rem; height: 3.25rem; }
  .obj-hover3d-lucide svg { width: 1.35rem; height: 1.35rem; }
  .obj-hover3d-title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .obj-hover3d-title__fill,
  .obj-hover3d-title__overlay { display: none !important; }
  .obj-hover3d-desc { -webkit-line-clamp: 2; font-size: .78rem; }
}
@media (max-width: 479px) {
  .obj-hover3d-link {
    flex-direction: column !important;
    align-items: flex-start;
    gap: .7rem;
    padding: .9rem .85rem;
  }
  .obj-hover3d-icon { width: 3rem; height: 3rem; }
}
@media (prefers-reduced-motion: reduce) {
  .obj-hover3d-lucide, .obj-hover3d-corner, .obj-hover3d-title__fill, .obj-hover3d-title__overlay { transition: none; }
}
`;
    const style = document.createElement("style");
    style.id = "objects-hover3d-css-v9";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildObjectsHover3dList(items) {
    const ul = document.createElement("ul");
    ul.className = "obj-hover3d-list";
    ul.setAttribute("data-obj-hover3d", "1");
    ul.setAttribute("data-obj-hover3d-v", "9");
    ul.innerHTML = items.map(function (item) {
      const tags = (item.tags || []).map(function (t) { return "<li>" + t + "</li>"; }).join("");
      const title = item.title || "";
      return (
        '<li class="obj-hover3d">' +
          '<div class="obj-hover3d-link" role="group" aria-label="' + (item.category || "") + ": " + title + '">' +
            '<div class="obj-hover3d-icon" aria-hidden="true">' +
              '<span class="obj-hover3d-icon-clip">' +
                '<span class="obj-hover3d-lucide">' + (SPECTRUM_ICONS[item.icon] || SPECTRUM_ICONS.cylinder || "") + '</span>' +
              '</span>' +
              '<span class="obj-hover3d-corner obj-hover3d-corner--tl"></span>' +
              '<span class="obj-hover3d-corner obj-hover3d-corner--tr"></span>' +
              '<span class="obj-hover3d-corner obj-hover3d-corner--bl"></span>' +
              '<span class="obj-hover3d-corner obj-hover3d-corner--br"></span>' +
            '</div>' +
            '<div class="obj-hover3d-body">' +
              '<span class="obj-hover3d-cat">' + item.category + '</span>' +
              '<h3 class="obj-hover3d-title">' +
                '<span>' + title + '</span>' +
                '<span class="obj-hover3d-title__overlay" aria-hidden="true">' + title + '</span>' +
                '<span class="obj-hover3d-title__fill" aria-hidden="true"></span>' +
              '</h3>' +
              '<p class="obj-hover3d-desc">' + item.description + '</p>' +
              '<ul class="obj-hover3d-tags">' + tags + '</ul>' +
            '</div>' +
          '</div>' +
        '</li>'
      );
    }).join("");
    return ul;
  }

  function applyObjectsHover3dPreview() {
    const section = document.getElementById("objects");
    if (!section) return;
    if (!OBJECTS_HOVER3D_PREVIEW) {
      section.classList.remove("hover3d-on");
      const existing = section.querySelector('ul[data-obj-hover3d="1"]');
      if (existing) existing.remove();
      return;
    }
    var existingList = section.querySelector('ul[data-obj-hover3d="1"]');
    if (existingList && existingList.getAttribute("data-obj-hover3d-v") === "9") {
      section.classList.add("hover3d-on");
      return;
    }
    if (existingList) existingList.remove();
    const grid = section.querySelector("ul.grid");
    if (!grid) return;
    injectObjectsHover3dStyles();
    section.classList.add("hover3d-on");
    const list = buildObjectsHover3dList(OBJECTS_SPECTRUM);
    grid.insertAdjacentElement("afterend", list);
  }


  function enhanceUnifiedBandCtas() {
    // Shared look for after-block CTAs: objects / advantages / geography
    if (!document.getElementById("vympel-band-cta-css")) {
      const style = document.createElement("style");
      style.id = "vympel-band-cta-css";
      style.textContent = `
.vympel-band-cta {
  margin-top: clamp(2.75rem, 5.5vw, 4.5rem) !important;
  padding: clamp(1.75rem, 4vw, 2.75rem) clamp(1.35rem, 3.5vw, 2.5rem) !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 0 !important;
  background: #0F172A !important;
  color: #fff !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 1.5rem !important;
  text-align: left !important;
  align-items: stretch !important;
}
@media (min-width: 1024px) {
  .vympel-band-cta {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 2.5rem !important;
  }
}
.vympel-band-cta__copy { min-width: 0; flex: 1; }
.vympel-band-cta__title {
  margin: 0 !important;
  font-family: Manrope, system-ui, sans-serif !important;
  font-size: clamp(1.55rem, 3.2vw, 2.15rem) !important;
  font-weight: 800 !important;
  line-height: 1.15 !important;
  letter-spacing: -0.02em !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}
.vympel-band-cta__text {
  margin: .7rem 0 0 !important;
  font-size: clamp(1rem, 1.7vw, 1.125rem) !important;
  line-height: 1.55 !important;
  color: rgba(255,255,255,.72) !important;
  max-width: 42rem;
}
.vympel-band-cta__actions {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: .85rem !important;
  align-items: center !important;
  justify-content: flex-start !important;
  flex-shrink: 0 !important;
}
@media (min-width: 1024px) {
  .vympel-band-cta__actions { justify-content: flex-end !important; margin-left: auto !important; }
}
.vympel-band-cta__btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: .55rem !important;
  height: 3.75rem !important;
  min-width: 12rem !important;
  padding: 0 1.85rem !important;
  border-radius: 0 !important;
  font-weight: 700 !important;
  font-size: 1.05rem !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  transition: background .2s ease, border-color .2s ease, color .2s ease !important;
}
.vympel-band-cta__btn--ghost {
  border: 2px solid rgba(255,255,255,.4) !important;
  color: #fff !important;
  background: transparent !important;
}
.vympel-band-cta__btn--ghost:hover {
  background: rgba(255,255,255,.08) !important;
  border-color: rgba(255,255,255,.7) !important;
}
.vympel-band-cta__btn--primary {
  border: 2px solid #ea580c !important;
  background: #ea580c !important;
  color: #fff !important;
}
.vympel-band-cta__btn--primary:hover { background: #c2410c !important; border-color: #c2410c !important; }
.vympel-band-cta__btn svg { width: 1.2rem; height: 1.2rem; flex-shrink: 0; }
#advantages #advantages-cta.vympel-band-cta {
  margin-top: clamp(3rem, 5.5vw, 4.5rem) !important;
}
`;
      document.head.appendChild(style);
    }

    const phoneSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path></svg>';
    const arrowSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';

    function fillBand(el, opts) {
      if (!el || el.getAttribute("data-band-ready") === "1") return;
      el.classList.add("vympel-band-cta");
      el.setAttribute("data-band-ready", "1");
      el.innerHTML =
        '<div class="vympel-band-cta__copy">' +
          '<h3 class="vympel-band-cta__title">' + opts.title + '</h3>' +
          '<p class="vympel-band-cta__text">' + opts.text + '</p>' +
        '</div>' +
        '<div class="vympel-band-cta__actions">' +
          '<a class="vympel-band-cta__btn vympel-band-cta__btn--ghost" href="tel:' + SALES1.tel + '">' +
            phoneSvg + '<span class="cta-phone-num">' + SALES1.display + '</span>' +
          '</a>' +
          '<a class="vympel-band-cta__btn vympel-band-cta__btn--primary" href="#contacts">' +
            opts.primaryLabel + arrowSvg +
          '</a>' +
        '</div>';
    }

    // Objects: «Не нашли свой тип объекта?»
    const objects = document.getElementById("objects");
    if (objects) {
      let objCta = document.getElementById("objects-request");
      // panel is parent of the link
      let panel = objCta ? objCta.closest(".mt-8, .card-premium, .border") : null;
      if (!panel) {
        // fallback: find by text
        objects.querySelectorAll("p, h2, h3").forEach(function (p) {
          if ((p.textContent || "").indexOf("Не нашли свой тип объекта") !== -1) {
            panel = p.closest("div");
          }
        });
      }
      if (panel) {
        // keep id on primary later
        fillBand(panel, {
          title: "Не нашли свой тип объекта?",
          text: "Оставьте заявку — инженер подберёт решение под габариты и технологию вашего объекта.",
          primaryLabel: "Оставить заявку",
        });
        const primary = panel.querySelector(".vympel-band-cta__btn--primary");
        if (primary) primary.id = "objects-request";
      }
    }

    // Advantages: unify markup but keep id
    const advCta = document.getElementById("advantages-cta");
    if (advCta) {
      fillBand(advCta, {
        title: "Готовы обсудить ваш объект?",
        text: "Бесплатный выезд специалиста и расчёт стоимости под ваш объект.",
        primaryLabel: "Получить КП",
      });
    }

    // Geography band in trust/why section
    document.querySelectorAll("h3").forEach(function (h) {
      if ((h.textContent || "").indexOf("География проектов") === -1) return;
      const panel = h.closest(".mt-10, .flex, .border") || h.parentElement?.parentElement;
      if (!panel || panel.getAttribute("data-band-ready") === "1") return;
      // Prefer the dark flex strip that contains the button
      let host = h.closest("div.mt-10") || h.closest("div.flex");
      if (!host) host = panel;
      fillBand(host, {
        title: "География проектов — вся Россия",
        text: "От Крайнего Севера до южных регионов. Выезд специалиста и монтаж возможны в любом субъекте РФ.",
        primaryLabel: "Обсудить ваш регион",
      });
    });
  }

  function enhanceObjectCards() {
    const section = document.getElementById("objects");
    if (!section) return;
    if (SPECTRUM_PREVIEW.objects && section.classList.contains("spectrum-on")) return;
    if (OBJECTS_HOVER3D_PREVIEW && section.classList.contains("hover3d-on")) return;
    const cta = document.getElementById("objects-request");
    // Cards: hover only — no drill-in / no click action
    section.querySelectorAll("a.block.h-full, a.object-card-link, a[data-service-card]").forEach((a) => {
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
    if (cta.getAttribute("data-band-ready") === "1") return;

    // Layout: buttons flush right on desktop (ml auto / mr 0), centered on mobile
    const btns = cta.querySelector("a[href^='tel:']")
      ? cta.querySelector("a[href^='tel:']").parentElement
      : null;
    if (btns && btns.classList) {
      btns.classList.add("items-center");
      btns.classList.add("advantages-cta-actions");
      // Do not set marginRight:auto — that pulled «Получить КП» off the right edge
      btns.style.marginLeft = "auto";
      btns.style.marginRight = "0";
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

    function startAnim() {
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
          startAnim();
        });
      },
      { threshold: 0.35 }
    );
    io.observe(section);
  }

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
    fixHeader();
    fixContacts();
    fixCtaPhone();
    ensureAdvantagesCta();
    animateMfgStats();
    enhanceRequisites();
    applySpectrumPreview();
    applyObjectsHover3dPreview();
    enhanceObjectCards();
    // Band CTAs paused — waiting for a new design direction
    // enhanceUnifiedBandCtas();
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
