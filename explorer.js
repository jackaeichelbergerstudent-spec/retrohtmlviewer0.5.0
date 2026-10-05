// explorer.js — file explorer panel
window.Retro = window.Retro || {};
(function (R) {
  R.buildExplorer = function (container, state, cb) {
    container.className = "w95-window w95-font panel";
    R.clear(container);
    container.appendChild(R.titlebar("Explorer"));

    var tools = R.el("div");
    tools.style.cssText = "display:flex;gap:2px;padding:2px;border-bottom:1px solid #808080;flex-wrap:wrap;";
    function addBtn(label, fn, title) { var b = R.button(label, { onClick: fn, title: title }); b.style.padding = "1px 4px"; tools.appendChild(b); }
    addBtn("+HTML", function () { cb.addFile("html"); }, "New HTML file");
    addBtn("+CSS", function () { cb.addFile("css"); }, "New CSS file");
    addBtn("+JS", function () { cb.addFile("js"); }, "New JS file");
    addBtn("+Folder", function () { cb.addFolder(); }, "New folder");
    addBtn("\u{1F5D1} Del", function () { cb.deleteActive(); }, "Delete active file");
    container.appendChild(tools);

    var list = R.el("div", "explorer-files w95-scroll w95-sunken");
    list.style.cssText = "margin:2px;flex:1;";
    container.appendChild(list);

    function renderList() {
      R.clear(list);
      if (!state.files.length) {
        var e = R.el("div", null, "No files. Add one above.");
        e.style.cssText = "padding:6px;color:#808080;";
        list.appendChild(e);
        return;
      }
      function walk(node, depth) {
        var row = R.el("div", "file-row" + (state.activeFileId === node.id ? " active" : ""));
        row.style.paddingLeft = (depth * 12 + 4) + "px";
        var icon = node.type === "folder" ? "\u{1F4C1}" :
          node.language === "html" ? "\u{1F310}" : node.language === "css" ? "\u{1F3A8}" : "\u2699";
        row.appendChild(R.el("span", null, icon + " "));
        var name = R.el("input");
        name.value = node.name;
        name.addEventListener("click", function (e) { e.stopPropagation(); });
        name.addEventListener("input", function () { node.name = name.value; });
        row.appendChild(name);
        var del = R.el("button", null, "\u{1F5D1}");
        del.style.cssText = "border:0;background:transparent;cursor:pointer;font-size:10px;";
        del.onclick = function (e) { e.stopPropagation(); cb.deleteNode(node.id); };
        row.appendChild(del);
        row.onclick = function () {
          if (node.type === "folder") cb.toggleFolder(node.id);
          else cb.selectFile(node.id);
        };
        list.appendChild(row);
        if (node.type === "folder" && !state.collapsed[node.id] && node.children) {
          node.children.forEach(function (c) { walk(c, depth + 1); });
        }
      }
      state.files.forEach(function (n) { walk(n, 0); });
    }

    var foot = R.el("div");
    foot.style.cssText = "padding:2px;border-top:1px solid #808080;";
    var openBtn = R.button("\u{1F4C2} Open Local File\u2026", { onClick: cb.openLocal });
    openBtn.style.width = "100%";
    foot.appendChild(openBtn);
    container.appendChild(foot);

    renderList();
    return renderList;
  };
})(window.Retro);