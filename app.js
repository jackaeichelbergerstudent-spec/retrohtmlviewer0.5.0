// app.js — main orchestration & state for RetroCode Studio (standalone)
(function () {
  var R = window.Retro;

  var state = {
    code: {
      html: '<h1>Hello, World!</h1>\n<p>Welcome to RetroCode Studio. Edit me on the left.</p>\n<button onclick="alert(\'JS works!\')">Click me</button>',
      css: 'body{font-family:Georgia,serif;padding:24px;color:#222}\nh1{color:#000080}\nbutton{padding:6px 12px;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;cursor:pointer}',
      js: 'document.title="Live preview ready";\nconsole.log("script executed");'
    },
    fileName: "untitled.html",
    jsEnabled: true, networkIsolated: false, viewport: "desktop",
    readerMode: false, theme: "default", showOutline: false, showInspector: false,
    files: [
      { id: "f1", name: "index.html", type: "file", language: "html" },
      { id: "f2", name: "styles.css", type: "file", language: "css" },
      { id: "f3", name: "script.js", type: "file", language: "js" },
      { id: "d1", name: "assets", type: "folder", children: [] }
    ],
    activeFileId: "f1", collapsed: {}, mobileView: "preview", status: "Ready"
  };

  var genId = function () { return Math.random().toString(36).slice(2, 9); };
  var app = document.getElementById("app");

  // Shell containers
  var menuBar = R.el("div");
  var toolbar = R.el("div", "toolbar");
  var addrbar = R.el("div", "addrbar");
  var mobiletabs = R.el("div", "mobiletabs");
  var workspace = R.el("div", "workspace");
  var colExplorer = R.el("div", "col-explorer");
  var colMiddle = R.el("div", "col-middle");
  var colRight = R.el("div", "col-right");
  var assetsDrawer = R.el("div");
  var statusBar = R.el("div");
  workspace.appendChild(colExplorer); workspace.appendChild(colMiddle); workspace.appendChild(colRight);
  app.appendChild(menuBar); app.appendChild(toolbar); app.appendChild(addrbar);
  app.appendChild(mobiletabs); app.appendChild(workspace); app.appendChild(assetsDrawer); app.appendChild(statusBar);

  // Mobile tabs
  ["explorer", "code", "preview"].forEach(function (v) {
    var b = R.button(v, { onClick: function () { state.mobileView = v; renderMobile(); } });
    mobiletabs.appendChild(b);
  });
  function renderMobile() {
    workspace.className = "workspace show-" + state.mobileView;
    mobiletabs.childNodes.forEach(function (b, i) {
      b.classList.toggle("is-active", ["explorer", "code", "preview"][i] === state.mobileView);
    });
  }

  // Address bar
  addrbar.innerHTML = "<span>Address:</span>";
  var addr = R.el("input");
  addr.readOnly = true;
  addr.value = "C:\\RetroStudio\\" + state.fileName;
  addrbar.appendChild(addr);
  addrbar.appendChild(R.button("Browse\u2026", { onClick: openLocal }));
  addrbar.appendChild(R.button("Root Folder\u2026", { onClick: function () { setStatus("Root folder remap (demo)"); } }));

  // Toolbar
  function renderToolbar() {
    R.clear(toolbar);
    var items = [
      ["\u{1F4C4} New", newFile],
      ["\u{1F4C2} Open", openLocal],
      ["\u{1F4BE} Save", saveFile],
      ["\u25B6 Run", function () { renderRight(); setStatus("Preview refreshed"); }],
      ["\u26A1 JS " + (state.jsEnabled ? "ON" : "OFF"), function () { state.jsEnabled = !state.jsEnabled; renderAll(); }],
      ["\u{1F4D0} Responsive", function () { state.viewport = state.viewport === "desktop" ? "mobile" : "desktop"; renderRight(); }],
      ["\u{1F4D6} Reader", function () { state.readerMode = !state.readerMode; renderRight(); }],
      ["\u{1F4E6} Extract", extractAssets],
      ["\u2197 About:Blank", openAboutBlank]
    ];
    items.forEach(function (p) { toolbar.appendChild(R.button(p[0], { onClick: p[1] })); });
  }

  // Menus
  function buildMenus() {
    R.menuBar([
      { label: "&File", items: [
        { label: "New", shortcut: "Ctrl+N", onClick: newFile },
        { label: "Open Local File\u2026", shortcut: "Ctrl+O", onClick: openLocal },
        { label: "Save As HTML", shortcut: "Ctrl+S", onClick: saveFile },
        "---",
        { label: "Exit", onClick: function () { setStatus("Use browser close"); } }
      ]},
      { label: "&Edit", items: [
        { label: "Clear HTML", onClick: function () { state.code.html = ""; refreshEditor(); } },
        { label: "Clear CSS", onClick: function () { state.code.css = ""; refreshEditor(); } },
        { label: "Clear JS", onClick: function () { state.code.js = ""; refreshEditor(); } }
      ]},
      { label: "&View", items: [
        { label: "Desktop View", onClick: function () { state.viewport = "desktop"; renderRight(); } },
        { label: "Tablet View", onClick: function () { state.viewport = "tablet"; renderRight(); } },
        { label: "Mobile View", onClick: function () { state.viewport = "mobile"; renderRight(); } },
        "---",
        { label: state.showOutline ? "Hide Outline" : "Show Outline", onClick: function () { state.showOutline = !state.showOutline; renderRight(); } },
        { label: state.showInspector ? "Hide Inspector" : "Show Inspector", onClick: function () { state.showInspector = !state.showInspector; renderMiddle(); } }
      ]},
      { label: "&Tools", items: [
        { label: "Extract Assets", onClick: extractAssets },
        { label: "Open in About:Blank", onClick: openAboutBlank },
        { label: "Reader Mode", onClick: function () { state.readerMode = !state.readerMode; renderRight(); } }
      ]},
      { label: "&Security", items: [
        { label: state.jsEnabled ? "Disable JavaScript (Kill Switch)" : "Enable JavaScript", onClick: function () { state.jsEnabled = !state.jsEnabled; renderAll(); } },
        { label: state.networkIsolated ? "Allow Network" : "Isolate Network", onClick: function () { state.networkIsolated = !state.networkIsolated; renderRight(); } },
        "---",
        { label: "Sandbox: ON (always)", onClick: function () { setStatus("Sandbox enforced via iframe"); } }
      ]},
      { label: "&Help", items: [
        { label: "About Retro Studio", onClick: function () { setStatus("RetroCode Studio \u2014 Standalone v1.0"); } }
      ]}
    ], menuBar);
  }

  // Explorer
  var renderExplorerList = R.buildExplorer(colExplorer, state, {
    addFile: function (lang) {
      var ext = { html: "html", css: "css", js: "js" }[lang] || "txt";
      var n = { id: genId(), name: "untitled." + ext, type: "file", language: lang };
      state.files.push(n); state.activeFileId = n.id; renderExplorerList(); setStatus("Added " + n.name);
    },
    addFolder: function () { state.files.push({ id: genId(), name: "New Folder", type: "folder", children: [] }); renderExplorerList(); },
    deleteActive: function () { if (state.activeFileId) this.deleteNode(state.activeFileId); },
    deleteNode: function (id) {
      state.files = state.files.filter(function (n) { return n.id !== id; });
      if (state.activeFileId === id) state.activeFileId = null;
      renderExplorerList(); setStatus("Deleted");
    },
    toggleFolder: function (id) { state.collapsed[id] = !state.collapsed[id]; renderExplorerList(); },
    selectFile: function (id) { state.activeFileId = id; renderExplorerList(); setStatus("Selected file"); },
    openLocal: openLocal
  });

  // Editor (middle column) + optional inspector
  var editorApi;
  function renderMiddle() {
    R.clear(colMiddle);
    var editorWrap = R.el("div");
    editorWrap.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;";
    editorApi = R.buildEditor(editorWrap, state, function () { renderRight(); updateStatus(); });
    colMiddle.appendChild(editorWrap);
    if (state.showInspector) {
      var insp = R.el("div");
      insp.style.cssText = "height:200px;min-height:0;";
      colMiddle.appendChild(insp);
      R.buildInspector(insp, state.code.html, function () { state.showInspector = false; renderMiddle(); });
    }
  }
  function refreshEditor() { if (editorApi) editorApi.refresh(); renderRight(); }

  // Right panel: preview/reader + outline
  function renderRight() {
    R.clear(colRight);
    if (state.readerMode) {
      R.buildReader(colRight, state.code.html, state.theme, function () { state.readerMode = false; renderRight(); });
    } else {
      R.buildPreview(colRight, state, {
        onChange: renderRight,
        toggleReader: function () { state.readerMode = true; renderRight(); },
        toggleInspector: function () { state.showInspector = !state.showInspector; renderMiddle(); },
        toggleOutline: function () { state.showOutline = !state.showOutline; renderRight(); },
        openAboutBlank: openAboutBlank
      });
    }
    if (state.showOutline) {
      var o = R.el("div");
      o.style.cssText = "height:200px;min-height:0;";
      colRight.appendChild(o);
      R.buildOutline(o, state.code.html, function () { state.showOutline = false; renderRight(); });
    }
    updateStatus();
  }

  function renderAll() { buildMenus(); renderToolbar(); renderRight(); updateStatus(); }

  function updateStatus() {
    var size = new Blob([R.buildDoc(state.code, state)]).size;
    var vp = state.viewport === "desktop" ? "1024" : state.viewport === "tablet" ? "768" : "375";
    R.statusBar([
      { text: state.status, flex: "1", icon: "\u2713" },
      { text: state.jsEnabled ? "JS: ON" : "JS: OFF \u26A0" },
      { text: state.networkIsolated ? "\u{1F512} Sandboxed" : "\u{1F310} Local Intranet" },
      { text: state.viewport + " " + vp + "px" },
      { text: "TOC: " + R.parseOutline(state.code.html).length },
      { text: size + " B" }
    ], statusBar);
  }
  function setStatus(s) { state.status = s; updateStatus(); }

  // Actions
  function newFile() {
    state.code = { html: "", css: "", js: "" };
    state.fileName = "untitled.html";
    refreshEditor(); addr.value = "C:\\RetroStudio\\" + state.fileName; setStatus("New file");
  }

  var fileInput = R.el("input");
  fileInput.type = "file"; fileInput.accept = ".html,.htm,.css,.js,.txt"; fileInput.style.display = "none";
  app.appendChild(fileInput);
  fileInput.addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      var t = String(r.result || "");
      state.fileName = f.name;
      if (/\.css$/i.test(f.name)) state.code.css = t;
      else if (/\.js$/i.test(f.name)) state.code.js = t;
      else state.code.html = t;
      refreshEditor(); addr.value = "C:\\RetroStudio\\" + f.name;
      setStatus("Loaded " + f.name + " (" + f.size + " bytes)");
    };
    r.readAsText(f); fileInput.value = "";
  });
  function openLocal() { fileInput.click(); }

  function saveFile() {
    var blob = new Blob([R.buildDoc(state.code, state)], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = state.fileName.endsWith(".html") ? state.fileName : state.fileName + ".html";
    a.click(); URL.revokeObjectURL(url); setStatus("Saved " + a.download);
  }

  function openAboutBlank() {
    var w = window.open("about:blank", "_blank");
    if (w) { w.document.open(); w.document.write(R.buildDoc(state.code, state)); w.document.close(); setStatus("Opened in new window"); }
    else setStatus("Popup blocked");
  }

  function extractAssets() {
    var d = new DOMParser().parseFromString(state.code.html || "<body></body>", "text/html");
    var imgs = Array.from(d.querySelectorAll("img")).map(function (i) { return i.getAttribute("src"); }).filter(Boolean);
    var styles = d.querySelectorAll("style").length;
    var scripts = d.querySelectorAll("script:not([src])").length;
    var links = Array.from(d.querySelectorAll("link[rel=stylesheet]")).map(function (l) { return l.getAttribute("href"); }).filter(Boolean);
    R.clear(assetsDrawer);
    assetsDrawer.className = "w95-window";
    assetsDrawer.style.cssText = "margin:2px;padding:6px;max-height:28vh;overflow:auto;";
    assetsDrawer.innerHTML =
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px"><b>\u{1F4E6} Extracted Assets</b><button class="w95-titlebar-btn" id="rc-close-assets">\u00d7</button></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">' +
      '<div class="w95-sunken" style="padding:4px"><b>Images (' + imgs.length + ')</b><ul style="margin-left:16px">' + imgs.map(function (s) { return '<li style="overflow:hidden;text-overflow:ellipsis">' + s + '</li>'; }).join("") + "</ul></div>" +
      '<div class="w95-sunken" style="padding:4px"><b>Inline CSS (' + styles + ')</b></div>' +
      '<div class="w95-sunken" style="padding:4px"><b>Scripts (' + scripts + ') / Links (' + links.length + ')</b><ul style="margin-left:16px">' + links.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul></div>" +
      "</div>";
    document.getElementById("rc-close-assets").onclick = function () { R.clear(assetsDrawer); assetsDrawer.className = ""; };
    setStatus("Extracted " + imgs.length + " images, " + styles + " styles, " + scripts + " scripts");
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey) {
      if (e.key === "s") { e.preventDefault(); saveFile(); }
      else if (e.key === "o") { e.preventDefault(); openLocal(); }
      else if (e.key === "n") { e.preventDefault(); newFile(); }
    }
  });

  // Boot
  buildMenus();
  renderToolbar();
  renderMobile();
  renderMiddle();
  renderRight();
  updateStatus();
})();