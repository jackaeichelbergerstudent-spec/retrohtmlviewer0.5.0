// preview.js — live preview iframe + document builder
window.Retro = window.Retro || {};
(function (R) {
  R.buildDoc = function (code, opts) {
    opts = opts || {};
    var js = opts.jsEnabled === false ? "" : "<" + "script>" + code.js + "</" + "script>";
    var csp = opts.networkIsolated
      ? '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; script-src \'unsafe-inline\'">'
      : "";
    return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" + csp +
      "<style>" + code.css + "</style></head><body>" + code.html + js + "</body></html>";
  };

  R.buildPreview = function (container, state, cb) {
    container.className = "w95-window w95-font panel";
    R.clear(container);
    container.appendChild(R.titlebar("Live Preview"));

    var controls = R.el("div", "preview-controls");
    function b(label, opts) { var x = R.button(label, opts); controls.appendChild(x); }
    b("\u25B6 Run", { onClick: render, title: "Refresh preview" });
    b(state.jsEnabled ? "\u26A1 JS: ON" : "\u26A1 JS: OFF", {
      active: !state.jsEnabled,
      onClick: function () { state.jsEnabled = !state.jsEnabled; cb.onChange(); }
    });
    b(state.networkIsolated ? "\u{1F512} Isolated" : "\u{1F310} Local", {
      onClick: function () { state.networkIsolated = !state.networkIsolated; cb.onChange(); }
    });
    b(state.viewport, { onClick: function () {
      state.viewport = state.viewport === "desktop" ? "mobile" : state.viewport === "mobile" ? "tablet" : "desktop";
      cb.onChange();
    } });
    b("\u{1F4D6} Reader", { onClick: cb.toggleReader });
    b("\u{1F50D} Inspect", { onClick: cb.toggleInspector });
    b("\u{1F4DA} Outline", { onClick: cb.toggleOutline });
    b("\u2197 About:Blank", { onClick: cb.openAboutBlank });
    container.appendChild(controls);

    var wrap = R.el("div", "preview-wrap");
    var frame = R.el("iframe", "preview-frame");
    wrap.appendChild(frame);
    container.appendChild(wrap);

    var sizes = { desktop: "100%", tablet: "768px", mobile: "375px" };

    function render() {
      frame.style.width = sizes[state.viewport] || "100%";
      frame.style.maxWidth = sizes[state.viewport] || "100%";
      frame.srcdoc = R.buildDoc(state.code, state);
    }

    render();
    return { render: render };
  };
})(window.Retro);