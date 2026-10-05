// w95.js — Windows 95 UI helpers (buttons, menus, status bar, title bar)
window.Retro = window.Retro || {};
(function (R) {
  R.el = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  R.clear = function (node) { while (node && node.firstChild) node.removeChild(node.firstChild); };

  R.button = function (label, opts) {
    opts = opts || {};
    var b = R.el("button", "w95-raised w95-font", label);
    if (opts.title) b.title = opts.title;
    if (opts.onClick) b.onclick = opts.onClick;
    if (opts.active) b.classList.add("is-active");
    if (opts.disabled) b.disabled = true;
    return b;
  };

  R.titlebar = function (title, onClose) {
    var t = R.el("div", "w95-titlebar");
    t.style.cssText = "height:18px;padding:0 2px;display:flex;align-items:center;justify-content:space-between;font-weight:bold;font-size:11px;";
    t.appendChild(R.el("span", null, title));
    if (onClose) { var b = R.el("button", "w95-titlebar-btn", "\u00d7"); b.onclick = onClose; t.appendChild(b); }
    return t;
  };

  R.menuBar = function (menus, container) {
    R.clear(container);
    container.className = "menubar w95-font";
    menus.forEach(function (m) {
      var item = R.el("div", "menu-item", m.label);
      var dd = null;
      function close() { if (dd) { dd.remove(); dd = null; } document.removeEventListener("mousedown", outside, true); }
      function outside(e) { if (!item.contains(e.target)) close(); }
      function open() {
        if (dd) { close(); return; }
        document.querySelectorAll(".menu-dropdown").forEach(function (d) { d.remove(); });
        dd = R.el("div", "menu-dropdown");
        m.items.forEach(function (it) {
          if (it === "---") { dd.appendChild(R.el("div", "sep")); return; }
          var row = R.el("div", "row");
          row.appendChild(R.el("span", null, it.label));
          if (it.shortcut) { var s = R.el("span", null, it.shortcut); row.appendChild(s); }
          row.onclick = function () { close(); if (it.onClick) it.onClick(); };
          dd.appendChild(row);
        });
        item.appendChild(dd);
        document.addEventListener("mousedown", outside, true);
      }
      item.addEventListener("click", function (e) { e.stopPropagation(); open(); });
      container.appendChild(item);
    });
  };

  R.statusBar = function (segs, container) {
    R.clear(container);
    container.className = "statusbar w95-font";
    segs.forEach(function (s) {
      var seg = R.el("div", "seg w95-status-segment");
      if (s.flex) seg.style.flex = s.flex;
      seg.textContent = (s.icon ? s.icon + " " : "") + s.text;
      container.appendChild(seg);
    });
  };
})(window.Retro);