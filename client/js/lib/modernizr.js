/*! modernizr 3.3.1 (Custom Build) | MIT *
 * http://modernizr.com/download/?-audio-localstorage-opacity-setclasses ! */
!(function(e, n, a) {
  function o(e, n) {
    return typeof e === n;
  }
  function t() {
    var e, n, a, t, s, c, r;
    for (var u in i)
    { if (i.hasOwnProperty(u)) {
      if (
        ((e = []),
        (n = i[u]),
        n.name &&
            (e.push(n.name.toLowerCase()),
            n.options && n.options.aliases && n.options.aliases.length))
      )
      { for (a = 0; a < n.options.aliases.length; a++)
      { e.push(n.options.aliases[a].toLowerCase()); } }
      for (t = o(n.fn, "function") ? n.fn() : n.fn, s = 0; s < e.length; s++)
      { (c = e[s]),
      (r = c.split(".")),
      r.length === 1
        ? (Modernizr[r[0]] = t)
        : (!Modernizr[r[0]] ||
                  Modernizr[r[0]] instanceof Boolean ||
                  (Modernizr[r[0]] = new Boolean(Modernizr[r[0]])),
        (Modernizr[r[0]][r[1]] = t)),
      l.push((t ? "" : "no-") + r.join("-")); }
    } }
  }
  function s(e) {
    var n = u.className;
    var a = Modernizr._config.classPrefix || "";
    if ((p && (n = n.baseVal), Modernizr._config.enableJSClass)) {
      var o = new RegExp("(^|\\s)" + a + "no-js(\\s|$)");
      n = n.replace(o, "$1" + a + "js$2");
    }
    Modernizr._config.enableClasses &&
      ((n += " " + a + e.join(" " + a)),
      p ? (u.className.baseVal = n) : (u.className = n));
  }
  function c() {
    return typeof n.createElement !== "function"
      ? n.createElement(arguments[0])
      : p
        ? n.createElementNS.call(n, "http://www.w3.org/2000/svg", arguments[0])
        : n.createElement.apply(n, arguments);
  }
  var i = [];
  var r = {
    _version: "3.3.1",
    _config: {
      classPrefix: "",
      enableClasses: !0,
      enableJSClass: !0,
      usePrefixes: !0
    },
    _q: [],
    on(e, n) {
      var a = this;
      setTimeout(function() {
        n(a[e]);
      }, 0);
    },
    addTest(e, n, a) {
      i.push({ name: e, fn: n, options: a });
    },
    addAsyncTest(e) {
      i.push({ name: null, fn: e });
    }
  };
  var Modernizr = function() {};
  (Modernizr.prototype = r), (Modernizr = new Modernizr());
  var l = [];
  var u = n.documentElement;
  var p = u.nodeName.toLowerCase() === "svg";
  Modernizr.addTest("audio", function() {
    var e = c("audio");
    var n = !1;
    try {
      (n = !!e.canPlayType) &&
        ((n = new Boolean(n)),
        (n.ogg = e
          .canPlayType("audio/ogg; codecs=\"vorbis\"")
          .replace(/^no$/, "")),
        (n.mp3 = e.canPlayType("audio/mpeg; codecs=\"mp3\"").replace(/^no$/, "")),
        (n.opus = e
          .canPlayType("audio/ogg; codecs=\"opus\"")
          .replace(/^no$/, "")),
        (n.wav = e.canPlayType("audio/wav; codecs=\"1\"").replace(/^no$/, "")),
        (n.m4a = (
          e.canPlayType("audio/x-m4a;") || e.canPlayType("audio/aac;")
        ).replace(/^no$/, "")));
    } catch (a) {}
    return n;
  });
  var f = r._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : [];
  (r._prefixes = f),
  Modernizr.addTest("opacity", function() {
    var e = c("a").style;
    return (e.cssText = f.join("opacity:.55;")), /^0.55$/.test(e.opacity);
  }),
  Modernizr.addTest("localstorage", function() {
    var e = "modernizr";
    try {
      return localStorage.setItem(e, e), localStorage.removeItem(e), !0;
    } catch (n) {
      return !1;
    }
  }),
  t(),
  s(l),
  delete r.addTest,
  delete r.addAsyncTest;
  for (var d = 0; d < Modernizr._q.length; d++) Modernizr._q[d]();
  e.Modernizr = Modernizr;
})(window, document);
