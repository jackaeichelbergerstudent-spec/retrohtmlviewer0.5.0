// inspector.js — DOM tree inspector
window.Retro = window.Retro || {};
(function (R) {
  R.buildInspector = function (container, html, onClose) {
    container.className = "w95-window w95-font panel";
    R.clear(container);
    container.appendChild(R.titlebar("\u{1F50D} DOM Tree Inspector", onClose));

    var body = R.el("div");
    body.style.cssText = "flex:1;display:flex;min-height:0;";
    var left = R.el("div", "w95-sunken w95-scroll");
    left.style.cssText = "margin:2px;width:50%;overflow:auto;";
    var right = R.el("div", "w95-sunken w95-scroll");
    right.style.cssText = "margin:2px;width:50%;overflow:auto;padding:6px;";
    body.appendChild(left); body.appendChild(right);
    container.appendChild(body);

    var doc = new DOMParser().parseFromString(html || "<body></body>", "text/html");
    var selectedPath = null;

    function summary(el) {
      var tag = el.tagName.toLowerCase();
      var label = tag;
      if (el.id) label += "#" + el.id;
      if (el.className && typeof el.className === "string") {
        var cls = el.className.split(" ").filter(Boolean).join(".");
        if (cls) label += "." + cls;
      }
      return { tag: tag, label: label };
    }

    function walk(node, depth, path) {
      var children = Array.from(node.children);
      var s = summary(node);
      var row = R.el("div", "file-row" + (selectedPath === path ? " active" : ""));
      row.style.paddingLeft = (depth * 12 + 4) + "px";
      row.innerHTML = '<span style="width:12px">' + (children.length ? "\u25BC" : "\u2022") + "</span> &lt;" + s.label + "&gt;";
      row.onclick = function () { selectedPath = path; showInfo(node); renderTree(); };
      left.appendChild(row);
      children.forEach(function (c, i) { walk(c, depth + 1, path + "/" + i); });
    }

    function renderTree() { R.clear(left); walk(doc.body, 0, ""); }

    function showInfo(node) {
      R.clear(right);
      var attrs = Array.from(node.attributes || []).map(function (a) {
        return '<li><b>' + a.name + '</b>="' + a.value + '"</li>';
      }).join("");
      right.innerHTML =
        "<b>Tag:</b> &lt;" + node.tagName.toLowerCase() + "&gt;<br>" +
        "<b>Children:</b> " + node.children.length + "<br>" +
        "<b>Attributes:</b><ul style='margin-left:16px'>" + (attrs || "<li>(none)</li>") + "</ul>" +
        "<b>Text:</b><div class='w95-sunken' style='padding:4px;margin-top:4px'>" +
        (node.textContent || "").slice(0, 200) + "</div>";
    }

    renderTree();
  };
})(window.Retro);