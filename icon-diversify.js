(function () {
  var ITEMS = [
{near:'Работаем на действующих объектах',name:'factory',svg5:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-factory h-5 w-5" aria-hidden="true"><path d="M12 16h.01"></path><path d="M16 16h.01"></path><path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path><path d="M8 16h.01"></path></svg>',svg6:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-factory h-6 w-6" aria-hidden="true"><path d="M12 16h.01"></path><path d="M16 16h.01"></path><path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path><path d="M8 16h.01"></path></svg>'},
{near:'Индивидуальное проектирование',name:'drafting-compass',svg5:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-drafting-compass h-5 w-5" aria-hidden="true"><path d="m12.99 6.74 1.93 3.44"></path><path d="M19.136 12a10 10 0 0 1-14.271 0"></path><path d="m21 21-2.16-3.84"></path><path d="m3 21 8.02-14.26"></path><circle cx="12" cy="5" r="2"></circle></svg>',svg6:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-drafting-compass h-6 w-6" aria-hidden="true"><path d="m12.99 6.74 1.93 3.44"></path><path d="M19.136 12a10 10 0 0 1-14.271 0"></path><path d="m21 21-2.16-3.84"></path><path d="m3 21 8.02-14.26"></path><circle cx="12" cy="5" r="2"></circle></svg>'}
  ];
  var SECTIONS = ['why-now'];
  var applying = false;
  function roots() {
    return SECTIONS.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  }
  function applyOnce() {
    if (applying) return;
    applying = true;
    try {
      roots().forEach(function (root) {
        ITEMS.forEach(function (it) {
          var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          var node;
          while ((node = walker.nextNode())) {
            if (!node.nodeValue || node.nodeValue.indexOf(it.near) === -1) continue;
            var el = node.parentElement;
            var svg = null;
            for (var i = 0; i < 6 && el && el !== root; i++) {
              svg = el.querySelector && el.querySelector('svg.lucide');
              if (svg) break;
              el = el.parentElement;
            }
            if (!svg) continue;
            var cls = svg.getAttribute('class') || '';
            if (cls.indexOf('lucide-' + it.name) !== -1) continue;
            var big = /\bh-6\b/.test(cls);
            var wrap = document.createElement('span');
            wrap.innerHTML = big ? it.svg6 : it.svg5;
            var neu = wrap.firstElementChild;
            if (neu) svg.parentNode.replaceChild(neu, svg);
          }
        });
      });
    } finally { applying = false; }
  }
  function boot() {
    applyOnce();
    [100, 500, 1500].forEach(function (ms) { setTimeout(applyOnce, ms); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();