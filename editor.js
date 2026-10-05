// editor.js — three-pane code editor (HTML / CSS / JS)
window.Retro = window.Retro || {};
(function (R) {
  R.buildEditor = function (container, state, onChange) {
    container.className = "w95-window w95-font panel";
    R.clear(container);
    container.appendChild(R.titlebar("Code Editor"));

    var tabs = R.el("div", "editor-tabs");
    var body = R.el("div");
    body.style.cssText = "flex:1;display:flex;min-height:0;";
    container.appendChild(tabs);
    container.appendChild(body);

    var labels = { html: "HTML", css: "CSS", js: "JavaScript" };
    var current = "html";
    var ta, gutter;

    function updateGutter() {
      var count = ta.value.split("\n").length;
      var s = "";
      for (var i = 1; i <= count; i++) s += i + "\n";
      gutter.textContent = s;
    }

    function buildPane(lang) {
      R.clear(body);
      var pane = R.el("div", "editor-pane");
      gutter = R.el("div", "editor-gutter w95-scroll");
      ta = R.el("textarea", "editor-textarea w95-scroll");
      ta.value = state.code[lang];
      ta.spellcheck = false;
      ta.addEventListener("input", function () { state.code[lang] = ta.value; updateGutter(); onChange(); });
      ta.addEventListener("scroll", function () { gutter.scrollTop = ta.scrollTop; });
      ta.addEventListener("keydown", function (e) {
        if (e.key === "Tab") {
          e.preventDefault();
          var s = ta.selectionStart, en = ta.selectionEnd;
          ta.value = ta.value.slice(0, s) + "  " + ta.value.slice(en);
          ta.selectionStart = ta.selectionEnd = s + 2;
          state.code[lang] = ta.value;
          onChange();
        }
      });
      pane.appendChild(gutter);
      pane.appendChild(ta);
      body.appendChild(pane);
      updateGutter();
      ta.focus();
    }

    Object.keys(labels).forEach(function (lang) {
      var tab = R.el("div", "editor-tab w95-raised", labels[lang]);
      tab.onclick = function () { current = lang; setActive(); buildPane(lang); };
      tabs.appendChild(tab);
    });

    function setActive() {
      var keys = Object.keys(labels);
      tabs.childNodes.forEach(function (t, i) { t.classList.toggle("is-active", keys[i] === current); });
    }

    setActive();
    buildPane("html");

    return {
      refresh: function () { if (ta) { ta.value = state.code[current]; updateGutter(); } }
    };
  };
})(window.Retro);