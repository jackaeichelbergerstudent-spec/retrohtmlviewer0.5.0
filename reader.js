// reader.js — e-reader mode with themes, font sizing, and text-to-speech
window.Retro = window.Retro || {};
(function (R) {
  R.buildReader = function (container, html, theme, onClose) {
    container.className = "w95-window w95-font panel";
    R.clear(container);
    container.appendChild(R.titlebar("\u{1F4D6} E-Reader Mode", onClose));

    var controls = R.el("div");
    controls.style.cssText = "display:flex;gap:4px;padding:4px;border-bottom:1px solid #808080;align-items:center;";
    var content = R.el("div", "reader-" + (theme || "default") + " w95-sunken w95-scroll");
    content.style.cssText = "flex:1;overflow:auto;padding:24px;margin:2px;";
    container.appendChild(controls);
    container.appendChild(content);

    var fontSize = 18;
    var fs = R.el("span", null, fontSize + "px");
    var am = R.button("A\u2212", { onClick: function () { fontSize = Math.max(12, fontSize - 2); render(); } });
    var ap = R.button("A+", { onClick: function () { fontSize = Math.min(36, fontSize + 2); render(); } });
    am.style.padding = "1px 5px"; ap.style.padding = "1px 5px";
    controls.appendChild(am); controls.appendChild(ap); controls.appendChild(fs);

    var speaking = false;
    var speakBtn = R.button("\u{1F50A} Speak", {
      onClick: function () {
        if (!("speechSynthesis" in window)) { return; }
        if (speaking) { window.speechSynthesis.cancel(); speaking = false; speakBtn.textContent = "\u{1F50A} Speak"; return; }
        var text = blocks.map(function (b) { return b.x; }).join(". ");
        var u = new SpeechSynthesisUtterance(text);
        u.onend = function () { speaking = false; speakBtn.textContent = "\u{1F50A} Speak"; };
        window.speechSynthesis.speak(u);
        speaking = true; speakBtn.textContent = "\u{1F50A} Stop";
      }
    });
    speakBtn.style.padding = "1px 5px";
    controls.appendChild(speakBtn);

    var d = new DOMParser().parseFromString(html || "<body></body>", "text/html");
    var title = (d.querySelector("title") || {}).textContent || (d.querySelector("h1") || {}).textContent || "Untitled";
    var blocks = [];
    var w = d.createTreeWalker(d.body, NodeFilter.SHOW_ELEMENT, null);
    var n;
    while ((n = w.nextNode())) {
      var tag = n.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) blocks.push({ t: "h", l: parseInt(tag[1]), x: n.textContent.trim() });
      else if (tag === "p") blocks.push({ t: "p", x: n.textContent.trim() });
      else if (tag === "li") blocks.push({ t: "li", x: n.textContent.trim() });
      else if (tag === "pre") blocks.push({ t: "pre", x: n.textContent });
      else if (tag === "blockquote") blocks.push({ t: "q", x: n.textContent.trim() });
    }

    function render() {
      fs.textContent = fontSize + "px";
      content.style.fontSize = fontSize + "px";
      var h = "<h1 style='font-weight:bold;margin-bottom:12px;font-size:" + (fontSize * 1.6) + "px'>" + title + "</h1>";
      blocks.forEach(function (b) {
        if (b.t === "h") h += "<h2 style='font-weight:bold;margin:12px 0 6px;font-size:" + (fontSize * (1.4 - b.l * 0.08)) + "px'>" + b.x + "</h2>";
        else if (b.t === "pre") h += "<pre style='font-family:monospace;margin:6px 0;padding:6px;border:1px solid #808080;overflow:auto;font-size:" + (fontSize * 0.8) + "px'>" + b.x + "</pre>";
        else if (b.t === "q") h += "<blockquote style='font-style:italic;margin:10px;padding-left:12px;border-left:4px solid currentColor;opacity:.8'>" + b.x + "</blockquote>";
        else if (b.t === "li") h += "<li style='margin-left:20px;list-style:disc'>" + b.x + "</li>";
        else h += "<p style='margin:10px 0;line-height:1.6'>" + b.x + "</p>";
      });
      content.innerHTML = h || "<p>No readable content found.</p>";
    }
    render();
  };
})(window.Retro);