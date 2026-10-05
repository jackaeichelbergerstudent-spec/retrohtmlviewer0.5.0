// outline.js — heading outline / table of contents
window.Retro = window.Retro || {};
(function (R) {
  R.parseOutline = function (html) {
    var d = new DOMParser().parseFromString(html || "<body></body>", "text/html");
    var out = [];
    d.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(function (h) {
      var t = h.textContent.trim();
      if (t) out.push({ level: parseInt(h.tagName[1]), text: t });
    });
    return out;
  };

  R.buildOutline = function (container, html, onClose) {
    container.className = "w95-window w95-font panel";
    R.clear(container);
    container.appendChild(R.titlebar("Outline (Table of Contents)", onClose));

    var body = R.el("div", "w95-sunken w95-scroll");
    body.style.cssText = "margin:2px;flex:1;overflow:auto;padding:4px;";
    container.appendChild(body);

    var items = R.parseOutline(html);
    if (!items.length) { body.innerHTML = '<div style="color:#808080;padding:6px">No headings found.</div>'; return; }
    items.forEach(function (it) {
      var row = R.el("div", "outline-row");
      row.style.paddingLeft = (it.level * 12 + 4) + "px";
      row.textContent = it.text;
      body.appendChild(row);
    });
  };
})(window.Retro);