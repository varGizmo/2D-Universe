/*! jQuery v3.2.1 | (c) JS Foundation and other contributors | jquery.org/license */
!(function(a, b) {
  "use strict";
  typeof module === "object" && typeof module.exports === "object"
    ? (module.exports = a.document
      ? b(a, !0)
      : function(a) {
        if (!a.document)
        { throw new Error("jQuery requires a window with a document"); }
        return b(a);
      })
    : b(a);
})(typeof window !== "undefined" ? window : this, function(a, b) {
  "use strict";
  var c = [];
  var d = a.document;
  var e = Object.getPrototypeOf;
  var f = c.slice;
  var g = c.concat;
  var h = c.push;
  var i = c.indexOf;
  var j = {};
  var k = j.toString;
  var l = j.hasOwnProperty;
  var m = l.toString;
  var n = m.call(Object);
  var o = {};
  function p(a, b) {
    b = b || d;
    var c = b.createElement("script");
    (c.text = a), b.head.appendChild(c).parentNode.removeChild(c);
  }
  var q = "3.2.1";
  var r = function(a, b) {
    return new r.fn.init(a, b);
  };
  var s = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  var t = /^-ms-/;
  var u = /-([a-z])/g;
  var v = function(a, b) {
    return b.toUpperCase();
  };
  (r.fn = r.prototype = {
    jquery: q,
    constructor: r,
    length: 0,
    toArray() {
      return f.call(this);
    },
    get(a) {
      return a == null ? f.call(this) : a < 0 ? this[a + this.length] : this[a];
    },
    pushStack(a) {
      var b = r.merge(this.constructor(), a);
      return (b.prevObject = this), b;
    },
    each(a) {
      return r.each(this, a);
    },
    map(a) {
      return this.pushStack(
        r.map(this, function(b, c) {
          return a.call(b, c, b);
        })
      );
    },
    slice() {
      return this.pushStack(f.apply(this, arguments));
    },
    first() {
      return this.eq(0);
    },
    last() {
      return this.eq(-1);
    },
    eq(a) {
      var b = this.length;
      var c = +a + (a < 0 ? b : 0);
      return this.pushStack(c >= 0 && c < b ? [this[c]] : []);
    },
    end() {
      return this.prevObject || this.constructor();
    },
    push: h,
    sort: c.sort,
    splice: c.splice
  }),
  (r.extend = r.fn.extend = function() {
    var a;
    var b;
    var c;
    var d;
    var e;
    var f;
    var g = arguments[0] || {};
    var h = 1;
    var i = arguments.length;
    var j = !1;
    for (
      typeof g === "boolean" && ((j = g), (g = arguments[h] || {}), h++),
      typeof g === "object" || r.isFunction(g) || (g = {}),
      h === i && ((g = this), h--);
      h < i;
      h++
    )
    { if ((a = arguments[h]) != null)
    { for (b in a)
    { (c = g[b]),
    (d = a[b]),
    g !== d &&
                (j && d && (r.isPlainObject(d) || (e = Array.isArray(d)))
                  ? (e
                    ? ((e = !1), (f = c && Array.isArray(c) ? c : []))
                    : (f = c && r.isPlainObject(c) ? c : {}),
                  (g[b] = r.extend(j, f, d)))
                  : void 0 !== d && (g[b] = d)); } } }
    return g;
  }),
  r.extend({
    expando: "jQuery" + (q + Math.random()).replace(/\D/g, ""),
    isReady: !0,
    error(a) {
      throw new Error(a);
    },
    noop() {},
    isFunction(a) {
      return r.type(a) === "function";
    },
    isWindow(a) {
      return a != null && a === a.window;
    },
    isNumeric(a) {
      var b = r.type(a);
      return (b === "number" || b === "string") && !isNaN(a - parseFloat(a));
    },
    isPlainObject(a) {
      var b, c;
      return (
        !(!a || k.call(a) !== "[object Object]") &&
          (!(b = e(a)) ||
            ((c = l.call(b, "constructor") && b.constructor),
            typeof c === "function" && m.call(c) === n))
      );
    },
    isEmptyObject(a) {
      var b;
      for (b in a) return !1;
      return !0;
    },
    type(a) {
      return a == null
        ? a + ""
        : typeof a === "object" || typeof a === "function"
          ? j[k.call(a)] || "object"
          : typeof a;
    },
    globalEval(a) {
      p(a);
    },
    camelCase(a) {
      return a.replace(t, "ms-").replace(u, v);
    },
    each(a, b) {
      var c;
      var d = 0;
      if (w(a)) {
        for (c = a.length; d < c; d++)
        { if (b.call(a[d], d, a[d]) === !1) break; }
      } else for (d in a) if (b.call(a[d], d, a[d]) === !1) break;
      return a;
    },
    trim(a) {
      return a == null ? "" : (a + "").replace(s, "");
    },
    makeArray(a, b) {
      var c = b || [];
      return (
        a != null &&
            (w(Object(a))
              ? r.merge(c, typeof a === "string" ? [a] : a)
              : h.call(c, a)),
        c
      );
    },
    inArray(a, b, c) {
      return b == null ? -1 : i.call(b, a, c);
    },
    merge(a, b) {
      for (var c = +b.length, d = 0, e = a.length; d < c; d++) a[e++] = b[d];
      return (a.length = e), a;
    },
    grep(a, b, c) {
      for (var d, e = [], f = 0, g = a.length, h = !c; f < g; f++)
      { (d = !b(a[f], f)), d !== h && e.push(a[f]); }
      return e;
    },
    map(a, b, c) {
      var d;
      var e;
      var f = 0;
      var h = [];
      if (w(a))
      { for (d = a.length; f < d; f++)
      { (e = b(a[f], f, c)), e != null && h.push(e); } }
      else for (f in a) (e = b(a[f], f, c)), e != null && h.push(e);
      return g.apply([], h);
    },
    guid: 1,
    proxy(a, b) {
      var c, d, e;
      if (
        (typeof b === "string" && ((c = a[b]), (b = a), (a = c)),
        r.isFunction(a))
      )
      { return (
        (d = f.call(arguments, 2)),
        (e = function() {
          return a.apply(b || this, d.concat(f.call(arguments)));
        }),
        (e.guid = a.guid = a.guid || r.guid++),
        e
      ); }
    },
    now: Date.now,
    support: o
  }),
  typeof Symbol === "function" && (r.fn[Symbol.iterator] = c[Symbol.iterator]),
  r.each(
    "Boolean Number String Function Array Date RegExp Object Error Symbol".split(
      " "
    ),
    function(a, b) {
      j["[object " + b + "]"] = b.toLowerCase();
    }
  );
  function w(a) {
    var b = !!a && "length" in a && a.length;
    var c = r.type(a);
    return (
      c !== "function" &&
      !r.isWindow(a) &&
      (c === "array" ||
        b === 0 ||
        (typeof b === "number" && b > 0 && b - 1 in a))
    );
  }
  var x = (function(a) {
    var b;
    var c;
    var d;
    var e;
    var f;
    var g;
    var h;
    var i;
    var j;
    var k;
    var l;
    var m;
    var n;
    var o;
    var p;
    var q;
    var r;
    var s;
    var t;
    var u = "sizzle" + 1 * new Date();
    var v = a.document;
    var w = 0;
    var x = 0;
    var y = ha();
    var z = ha();
    var A = ha();
    var B = function(a, b) {
      return a === b && (l = !0), 0;
    };
    var C = {}.hasOwnProperty;
    var D = [];
    var E = D.pop;
    var F = D.push;
    var G = D.push;
    var H = D.slice;
    var I = function(a, b) {
      for (var c = 0, d = a.length; c < d; c++) if (a[c] === b) return c;
      return -1;
    };
    var J =
        "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped";
    var K = "[\\x20\\t\\r\\n\\f]";
    var L = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+";
    var M =
        "\\[" +
        K +
        "*(" +
        L +
        ")(?:" +
        K +
        "*([*^$|!~]?=)" +
        K +
        "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" +
        L +
        "))|)" +
        K +
        "*\\]";
    var N =
        ":(" +
        L +
        ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" +
        M +
        ")*)|.*)\\)|)";
    var O = new RegExp(K + "+", "g");
    var P = new RegExp("^" + K + "+|((?:^|[^\\\\])(?:\\\\.)*)" + K + "+$", "g");
    var Q = new RegExp("^" + K + "*," + K + "*");
    var R = new RegExp("^" + K + "*([>+~]|" + K + ")" + K + "*");
    var S = new RegExp("=" + K + "*([^\\]'\"]*?)" + K + "*\\]", "g");
    var T = new RegExp(N);
    var U = new RegExp("^" + L + "$");
    var V = {
      ID: new RegExp("^#(" + L + ")"),
      CLASS: new RegExp("^\\.(" + L + ")"),
      TAG: new RegExp("^(" + L + "|[*])"),
      ATTR: new RegExp("^" + M),
      PSEUDO: new RegExp("^" + N),
      CHILD: new RegExp(
        "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
            K +
            "*(even|odd|(([+-]|)(\\d*)n|)" +
            K +
            "*(?:([+-]|)" +
            K +
            "*(\\d+)|))" +
            K +
            "*\\)|)",
        "i"
      ),
      bool: new RegExp("^(?:" + J + ")$", "i"),
      needsContext: new RegExp(
        "^" +
            K +
            "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
            K +
            "*((?:-\\d)?\\d*)" +
            K +
            "*\\)|)(?=[^-]|$)",
        "i"
      )
    };
    var W = /^(?:input|select|textarea|button)$/i;
    var X = /^h\d$/i;
    var Y = /^[^{]+\{\s*\[native \w/;
    var Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
    var $ = /[+~]/;
    var _ = new RegExp("\\\\([\\da-f]{1,6}" + K + "?|(" + K + ")|.)", "ig");
    var aa = function(a, b, c) {
      var d = "0x" + b - 65536;
      return d !== d || c
        ? b
        : d < 0
          ? String.fromCharCode(d + 65536)
          : String.fromCharCode((d >> 10) | 55296, (1023 & d) | 56320);
    };
    var ba = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g;
    var ca = function(a, b) {
      return b
        ? a === "\0"
          ? "\ufffd"
          : a.slice(0, -1) +
              "\\" +
              a.charCodeAt(a.length - 1).toString(16) +
              " "
        : "\\" + a;
    };
    var da = function() {
      m();
    };
    var ea = ta(
      function(a) {
        return a.disabled === !0 && ("form" in a || "label" in a);
      },
      { dir: "parentNode", next: "legend" }
    );
    try {
      G.apply((D = H.call(v.childNodes)), v.childNodes),
      D[v.childNodes.length].nodeType;
    } catch (fa) {
      G = {
        apply: D.length
          ? function(a, b) {
            F.apply(a, H.call(b));
          }
          : function(a, b) {
            var c = a.length;
            var d = 0;
            while ((a[c++] = b[d++]));
            a.length = c - 1;
          }
      };
    }
    function ga(a, b, d, e) {
      var f;
      var h;
      var j;
      var k;
      var l;
      var o;
      var r;
      var s = b && b.ownerDocument;
      var w = b ? b.nodeType : 9;
      if (
        ((d = d || []),
        typeof a !== "string" || !a || (w !== 1 && w !== 9 && w !== 11))
      )
      { return d; }
      if (
        !e &&
        ((b ? b.ownerDocument || b : v) !== n && m(b), (b = b || n), p)
      ) {
        if (w !== 11 && (l = Z.exec(a)))
        { if ((f = l[1])) {
          if (w === 9) {
            if (!(j = b.getElementById(f))) return d;
            if (j.id === f) return d.push(j), d;
          } else if (s && (j = s.getElementById(f)) && t(b, j) && j.id === f)
          { return d.push(j), d; }
        } else {
          if (l[2]) return G.apply(d, b.getElementsByTagName(a)), d;
          if (
            (f = l[3]) &&
              c.getElementsByClassName &&
              b.getElementsByClassName
          )
          { return G.apply(d, b.getElementsByClassName(f)), d; }
        } }
        if (c.qsa && !A[a + " "] && (!q || !q.test(a))) {
          if (w !== 1) (s = b), (r = a);
          else if (b.nodeName.toLowerCase() !== "object") {
            (k = b.getAttribute("id"))
              ? (k = k.replace(ba, ca))
              : b.setAttribute("id", (k = u)),
            (o = g(a)),
            (h = o.length);
            while (h--) o[h] = "#" + k + " " + sa(o[h]);
            (r = o.join(",")), (s = ($.test(a) && qa(b.parentNode)) || b);
          }
          if (r)
          { try {
            return G.apply(d, s.querySelectorAll(r)), d;
          } catch (x) {
          } finally {
            k === u && b.removeAttribute("id");
          } }
        }
      }
      return i(a.replace(P, "$1"), b, d, e);
    }
    function ha() {
      var a = [];
      function b(c, e) {
        return (
          a.push(c + " ") > d.cacheLength && delete b[a.shift()],
          (b[c + " "] = e)
        );
      }
      return b;
    }
    function ia(a) {
      return (a[u] = !0), a;
    }
    function ja(a) {
      var b = n.createElement("fieldset");
      try {
        return !!a(b);
      } catch (c) {
        return !1;
      } finally {
        b.parentNode && b.parentNode.removeChild(b), (b = null);
      }
    }
    function ka(a, b) {
      var c = a.split("|");
      var e = c.length;
      while (e--) d.attrHandle[c[e]] = b;
    }
    function la(a, b) {
      var c = b && a;
      var d =
          c &&
          a.nodeType === 1 &&
          b.nodeType === 1 &&
          a.sourceIndex - b.sourceIndex;
      if (d) return d;
      if (c) while ((c = c.nextSibling)) if (c === b) return -1;
      return a ? 1 : -1;
    }
    function ma(a) {
      return function(b) {
        var c = b.nodeName.toLowerCase();
        return c === "input" && b.type === a;
      };
    }
    function na(a) {
      return function(b) {
        var c = b.nodeName.toLowerCase();
        return (c === "input" || c === "button") && b.type === a;
      };
    }
    function oa(a) {
      return function(b) {
        return "form" in b
          ? b.parentNode && b.disabled === !1
            ? "label" in b
              ? "label" in b.parentNode
                ? b.parentNode.disabled === a
                : b.disabled === a
              : b.isDisabled === a || (b.isDisabled !== !a && ea(b) === a)
            : b.disabled === a
          : "label" in b && b.disabled === a;
      };
    }
    function pa(a) {
      return ia(function(b) {
        return (
          (b = +b),
          ia(function(c, d) {
            var e;
            var f = a([], c.length, b);
            var g = f.length;
            while (g--) c[(e = f[g])] && (c[e] = !(d[e] = c[e]));
          })
        );
      });
    }
    function qa(a) {
      return a && typeof a.getElementsByTagName !== "undefined" && a;
    }
    (c = ga.support = {}),
    (f = ga.isXML = function(a) {
      var b = a && (a.ownerDocument || a).documentElement;
      return !!b && b.nodeName !== "HTML";
    }),
    (m = ga.setDocument = function(a) {
      var b;
      var e;
      var g = a ? a.ownerDocument || a : v;
      return g !== n && g.nodeType === 9 && g.documentElement
        ? ((n = g),
        (o = n.documentElement),
        (p = !f(n)),
        v !== n &&
              (e = n.defaultView) &&
              e.top !== e &&
              (e.addEventListener
                ? e.addEventListener("unload", da, !1)
                : e.attachEvent && e.attachEvent("onunload", da)),
        (c.attributes = ja(function(a) {
          return (a.className = "i"), !a.getAttribute("className");
        })),
        (c.getElementsByTagName = ja(function(a) {
          return (
            a.appendChild(n.createComment("")),
            !a.getElementsByTagName("*").length
          );
        })),
        (c.getElementsByClassName = Y.test(n.getElementsByClassName)),
        (c.getById = ja(function(a) {
          return (
            (o.appendChild(a).id = u),
            !n.getElementsByName || !n.getElementsByName(u).length
          );
        })),
        c.getById
          ? ((d.filter.ID = function(a) {
            var b = a.replace(_, aa);
            return function(a) {
              return a.getAttribute("id") === b;
            };
          }),
          (d.find.ID = function(a, b) {
            if (typeof b.getElementById !== "undefined" && p) {
              var c = b.getElementById(a);
              return c ? [c] : [];
            }
          }))
          : ((d.filter.ID = function(a) {
            var b = a.replace(_, aa);
            return function(a) {
              var c =
                      typeof a.getAttributeNode !== "undefined" &&
                      a.getAttributeNode("id");
              return c && c.value === b;
            };
          }),
          (d.find.ID = function(a, b) {
            if (typeof b.getElementById !== "undefined" && p) {
              var c;
              var d;
              var e;
              var f = b.getElementById(a);
              if (f) {
                if (((c = f.getAttributeNode("id")), c && c.value === a))
                { return [f]; }
                (e = b.getElementsByName(a)), (d = 0);
                while ((f = e[d++]))
                { if (
                  ((c = f.getAttributeNode("id")), c && c.value === a)
                )
                { return [f]; } }
              }
              return [];
            }
          })),
        (d.find.TAG = c.getElementsByTagName
          ? function(a, b) {
            return typeof b.getElementsByTagName !== "undefined"
              ? b.getElementsByTagName(a)
              : c.qsa
                ? b.querySelectorAll(a)
                : void 0;
          }
          : function(a, b) {
            var c;
            var d = [];
            var e = 0;
            var f = b.getElementsByTagName(a);
            if (a === "*") {
              while ((c = f[e++])) c.nodeType === 1 && d.push(c);
              return d;
            }
            return f;
          }),
        (d.find.CLASS =
              c.getElementsByClassName &&
              function(a, b) {
                if (typeof b.getElementsByClassName !== "undefined" && p)
                { return b.getElementsByClassName(a); }
              }),
        (r = []),
        (q = []),
        (c.qsa = Y.test(n.querySelectorAll)) &&
              (ja(function(a) {
                (o.appendChild(a).innerHTML =
                  "<a id='" +
                  u +
                  "'></a><select id='" +
                  u +
                  "-\r\\' msallowcapture=''><option selected=''></option></select>"),
                a.querySelectorAll("[msallowcapture^='']").length &&
                    q.push("[*^$]=" + K + "*(?:''|\"\")"),
                a.querySelectorAll("[selected]").length ||
                    q.push("\\[" + K + "*(?:value|" + J + ")"),
                a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="),
                a.querySelectorAll(":checked").length || q.push(":checked"),
                a.querySelectorAll("a#" + u + "+*").length ||
                    q.push(".#.+[+~]");
              }),
              ja(function(a) {
                a.innerHTML =
                  "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                var b = n.createElement("input");
                b.setAttribute("type", "hidden"),
                a.appendChild(b).setAttribute("name", "D"),
                a.querySelectorAll("[name=d]").length &&
                    q.push("name" + K + "*[*^$|!~]?="),
                a.querySelectorAll(":enabled").length !== 2 &&
                    q.push(":enabled", ":disabled"),
                (o.appendChild(a).disabled = !0),
                a.querySelectorAll(":disabled").length !== 2 &&
                    q.push(":enabled", ":disabled"),
                a.querySelectorAll("*,:x"),
                q.push(",.*:");
              })),
        (c.matchesSelector = Y.test(
          (s =
                o.matches ||
                o.webkitMatchesSelector ||
                o.mozMatchesSelector ||
                o.oMatchesSelector ||
                o.msMatchesSelector)
        )) &&
              ja(function(a) {
                (c.disconnectedMatch = s.call(a, "*")),
                s.call(a, "[s!='']:x"),
                r.push("!=", N);
              }),
        (q = q.length && new RegExp(q.join("|"))),
        (r = r.length && new RegExp(r.join("|"))),
        (b = Y.test(o.compareDocumentPosition)),
        (t =
              b || Y.test(o.contains)
                ? function(a, b) {
                  var c = a.nodeType === 9 ? a.documentElement : a;
                  var d = b && b.parentNode;
                  return (
                    a === d ||
                      !(
                        !d ||
                        d.nodeType !== 1 ||
                        !(c.contains
                          ? c.contains(d)
                          : a.compareDocumentPosition &&
                            16 & a.compareDocumentPosition(d))
                      )
                  );
                }
                : function(a, b) {
                  if (b) while ((b = b.parentNode)) if (b === a) return !0;
                  return !1;
                }),
        (B = b
          ? function(a, b) {
            if (a === b) return (l = !0), 0;
            var d =
                    !a.compareDocumentPosition - !b.compareDocumentPosition;
            return d || ((d =
                        (a.ownerDocument || a) === (b.ownerDocument || b)
                          ? a.compareDocumentPosition(b)
                          : 1),
            1 & d ||
                      (!c.sortDetached && b.compareDocumentPosition(a) === d)
              ? a === n || (a.ownerDocument === v && t(v, a))
                ? -1
                : b === n || (b.ownerDocument === v && t(v, b))
                  ? 1
                  : k
                    ? I(k, a) - I(k, b)
                    : 0
              : 4 & d
                ? -1
                : 1);
          }
          : function(a, b) {
            if (a === b) return (l = !0), 0;
            var c;
            var d = 0;
            var e = a.parentNode;
            var f = b.parentNode;
            var g = [a];
            var h = [b];
            if (!e || !f)
            { return a === n
              ? -1
              : b === n
                ? 1
                : e
                  ? -1
                  : f
                    ? 1
                    : k
                      ? I(k, a) - I(k, b)
                      : 0; }
            if (e === f) return la(a, b);
            c = a;
            while ((c = c.parentNode)) g.unshift(c);
            c = b;
            while ((c = c.parentNode)) h.unshift(c);
            while (g[d] === h[d]) d++;
            return d
              ? la(g[d], h[d])
              : g[d] === v
                ? -1
                : h[d] === v
                  ? 1
                  : 0;
          }),
        n)
        : n;
    }),
    (ga.matches = function(a, b) {
      return ga(a, null, null, b);
    }),
    (ga.matchesSelector = function(a, b) {
      if (
        ((a.ownerDocument || a) !== n && m(a),
        (b = b.replace(S, "='$1']")),
        c.matchesSelector &&
            p &&
            !A[b + " "] &&
            (!r || !r.test(b)) &&
            (!q || !q.test(b)))
      )
      { try {
        var d = s.call(a, b);
        if (
          d ||
              c.disconnectedMatch ||
              (a.document && a.document.nodeType !== 11)
        )
        { return d; }
      } catch (e) {} }
      return ga(b, n, null, [a]).length > 0;
    }),
    (ga.contains = function(a, b) {
      return (a.ownerDocument || a) !== n && m(a), t(a, b);
    }),
    (ga.attr = function(a, b) {
      (a.ownerDocument || a) !== n && m(a);
      var e = d.attrHandle[b.toLowerCase()];
      var f = e && C.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;
      return void 0 !== f
        ? f
        : c.attributes || !p
          ? a.getAttribute(b)
          : (f = a.getAttributeNode(b)) && f.specified
            ? f.value
            : null;
    }),
    (ga.escape = function(a) {
      return (a + "").replace(ba, ca);
    }),
    (ga.error = function(a) {
      throw new Error("Syntax error, unrecognized expression: " + a);
    }),
    (ga.uniqueSort = function(a) {
      var b;
      var d = [];
      var e = 0;
      var f = 0;
      if (
        ((l = !c.detectDuplicates),
        (k = !c.sortStable && a.slice(0)),
        a.sort(B),
        l)
      ) {
        while ((b = a[f++])) b === a[f] && (e = d.push(f));
        while (e--) a.splice(d[e], 1);
      }
      return (k = null), a;
    }),
    (e = ga.getText = function(a) {
      var b;
      var c = "";
      var d = 0;
      var f = a.nodeType;
      if (f) {
        if (f === 1 || f === 9 || f === 11) {
          if (typeof a.textContent === "string") return a.textContent;
          for (a = a.firstChild; a; a = a.nextSibling) c += e(a);
        } else if (f === 3 || f === 4) return a.nodeValue;
      } else while ((b = a[d++])) c += e(b);
      return c;
    }),
    (d = ga.selectors = {
      cacheLength: 50,
      createPseudo: ia,
      match: V,
      attrHandle: {},
      find: {},
      relative: {
        ">": { dir: "parentNode", first: !0 },
        " ": { dir: "parentNode" },
        "+": { dir: "previousSibling", first: !0 },
        "~": { dir: "previousSibling" }
      },
      preFilter: {
        ATTR(a) {
          return (
            (a[1] = a[1].replace(_, aa)),
            (a[3] = (a[3] || a[4] || a[5] || "").replace(_, aa)),
            a[2] === "~=" && (a[3] = " " + a[3] + " "),
            a.slice(0, 4)
          );
        },
        CHILD(a) {
          return (
            (a[1] = a[1].toLowerCase()),
            a[1].slice(0, 3) === "nth"
              ? (a[3] || ga.error(a[0]),
              (a[4] = +(a[4]
                ? a[5] + (a[6] || 1)
                : 2 * (a[3] === "even" || a[3] === "odd"))),
              (a[5] = +(a[7] + a[8] || a[3] === "odd")))
              : a[3] && ga.error(a[0]),
            a
          );
        },
        PSEUDO(a) {
          var b;
          var c = !a[6] && a[2];
          return V.CHILD.test(a[0])
            ? null
            : (a[3]
              ? (a[2] = a[4] || a[5] || "")
              : c &&
                    T.test(c) &&
                    (b = g(c, !0)) &&
                    (b = c.indexOf(")", c.length - b) - c.length) &&
                    ((a[0] = a[0].slice(0, b)), (a[2] = c.slice(0, b))),
            a.slice(0, 3));
        }
      },
      filter: {
        TAG(a) {
          var b = a.replace(_, aa).toLowerCase();
          return a === "*"
            ? function() {
              return !0;
            }
            : function(a) {
              return a.nodeName && a.nodeName.toLowerCase() === b;
            };
        },
        CLASS(a) {
          var b = y[a + " "];
          return (
            b ||
              ((b = new RegExp("(^|" + K + ")" + a + "(" + K + "|$)")) &&
                y(a, function(a) {
                  return b.test(
                    (typeof a.className === "string" && a.className) ||
                      (typeof a.getAttribute !== "undefined" &&
                        a.getAttribute("class")) ||
                      ""
                  );
                }))
          );
        },
        ATTR(a, b, c) {
          return function(d) {
            var e = ga.attr(d, a);
            return e == null
              ? b === "!="
              : !b ||
                    ((e += ""),
                    b === "="
                      ? e === c
                      : b === "!="
                        ? e !== c
                        : b === "^="
                          ? c && e.indexOf(c) === 0
                          : b === "*="
                            ? c && e.indexOf(c) > -1
                            : b === "$="
                              ? c && e.slice(-c.length) === c
                              : b === "~="
                                ? (" " + e.replace(O, " ") + " ").indexOf(c) > -1
                                : b === "|=" &&
                        (e === c || e.slice(0, c.length + 1) === c + "-"));
          };
        },
        CHILD(a, b, c, d, e) {
          var f = a.slice(0, 3) !== "nth";
          var g = a.slice(-4) !== "last";
          var h = b === "of-type";
          return d === 1 && e === 0
            ? function(a) {
              return !!a.parentNode;
            }
            : function(b, c, i) {
              var j;
              var k;
              var l;
              var m;
              var n;
              var o;
              var p = f !== g ? "nextSibling" : "previousSibling";
              var q = b.parentNode;
              var r = h && b.nodeName.toLowerCase();
              var s = !i && !h;
              var t = !1;
              if (q) {
                if (f) {
                  while (p) {
                    m = b;
                    while ((m = m[p]))
                    { if (
                      h
                        ? m.nodeName.toLowerCase() === r
                        : m.nodeType === 1
                    )
                    { return !1; } }
                    o = p = a === "only" && !o && "nextSibling";
                  }
                  return !0;
                }
                if (((o = [g ? q.firstChild : q.lastChild]), g && s)) {
                  (m = q),
                  (l = m[u] || (m[u] = {})),
                  (k = l[m.uniqueID] || (l[m.uniqueID] = {})),
                  (j = k[a] || []),
                  (n = j[0] === w && j[1]),
                  (t = n && j[2]),
                  (m = n && q.childNodes[n]);
                  while ((m = (++n && m && m[p]) || (t = n = 0) || o.pop()))
                  { if (m.nodeType === 1 && ++t && m === b) {
                    k[a] = [w, n, t];
                    break;
                  } }
                } else if (
                  (s &&
                        ((m = b),
                        (l = m[u] || (m[u] = {})),
                        (k = l[m.uniqueID] || (l[m.uniqueID] = {})),
                        (j = k[a] || []),
                        (n = j[0] === w && j[1]),
                        (t = n)),
                  t === !1)
                )
                { while ((m = (++n && m && m[p]) || (t = n = 0) || o.pop()))
                { if (
                  (h
                    ? m.nodeName.toLowerCase() === r
                    : m.nodeType === 1) &&
                          ++t &&
                          (s &&
                            ((l = m[u] || (m[u] = {})),
                            (k = l[m.uniqueID] || (l[m.uniqueID] = {})),
                            (k[a] = [w, t])),
                          m === b)
                )
                { break; } } }
                return (t -= e), t === d || (t % d === 0 && t / d >= 0);
              }
            };
        },
        PSEUDO(a, b) {
          var c;
          var e =
                d.pseudos[a] ||
                d.setFilters[a.toLowerCase()] ||
                ga.error("unsupported pseudo: " + a);
          return e[u]
            ? e(b)
            : e.length > 1
              ? ((c = [a, a, "", b]),
              d.setFilters.hasOwnProperty(a.toLowerCase())
                ? ia(function(a, c) {
                  var d;
                  var f = e(a, b);
                  var g = f.length;
                  while (g--) (d = I(a, f[g])), (a[d] = !(c[d] = f[g]));
                })
                : function(a) {
                  return e(a, 0, c);
                })
              : e;
        }
      },
      pseudos: {
        not: ia(function(a) {
          var b = [];
          var c = [];
          var d = h(a.replace(P, "$1"));
          return d[u]
            ? ia(function(a, b, c, e) {
              var f;
              var g = d(a, null, e, []);
              var h = a.length;
              while (h--) (f = g[h]) && (a[h] = !(b[h] = f));
            })
            : function(a, e, f) {
              return (b[0] = a), d(b, null, f, c), (b[0] = null), !c.pop();
            };
        }),
        has: ia(function(a) {
          return function(b) {
            return ga(a, b).length > 0;
          };
        }),
        contains: ia(function(a) {
          return (
            (a = a.replace(_, aa)),
            function(b) {
              return (b.textContent || b.innerText || e(b)).indexOf(a) > -1;
            }
          );
        }),
        lang: ia(function(a) {
          return (
            U.test(a || "") || ga.error("unsupported lang: " + a),
            (a = a.replace(_, aa).toLowerCase()),
            function(b) {
              var c;
              do
              { if (
                (c = p
                  ? b.lang
                  : b.getAttribute("xml:lang") || b.getAttribute("lang"))
              )
              { return (
                (c = c.toLowerCase()), c === a || c.indexOf(a + "-") === 0
              ); } }
              while ((b = b.parentNode) && b.nodeType === 1);
              return !1;
            }
          );
        }),
        target(b) {
          var c = a.location && a.location.hash;
          return c && c.slice(1) === b.id;
        },
        root(a) {
          return a === o;
        },
        focus(a) {
          return (
            a === n.activeElement &&
              (!n.hasFocus || n.hasFocus()) &&
              !!(a.type || a.href || ~a.tabIndex)
          );
        },
        enabled: oa(!1),
        disabled: oa(!0),
        checked(a) {
          var b = a.nodeName.toLowerCase();
          return (
            (b === "input" && !!a.checked) || (b === "option" && !!a.selected)
          );
        },
        selected(a) {
          return (
            a.parentNode && a.parentNode.selectedIndex, a.selected === !0
          );
        },
        empty(a) {
          for (a = a.firstChild; a; a = a.nextSibling)
          { if (a.nodeType < 6) return !1; }
          return !0;
        },
        parent(a) {
          return !d.pseudos.empty(a);
        },
        header(a) {
          return X.test(a.nodeName);
        },
        input(a) {
          return W.test(a.nodeName);
        },
        button(a) {
          var b = a.nodeName.toLowerCase();
          return (b === "input" && a.type === "button") || b === "button";
        },
        text(a) {
          var b;
          return (
            a.nodeName.toLowerCase() === "input" &&
              a.type === "text" &&
              ((b = a.getAttribute("type")) == null ||
                b.toLowerCase() === "text")
          );
        },
        first: pa(function() {
          return [0];
        }),
        last: pa(function(a, b) {
          return [b - 1];
        }),
        eq: pa(function(a, b, c) {
          return [c < 0 ? c + b : c];
        }),
        even: pa(function(a, b) {
          for (var c = 0; c < b; c += 2) a.push(c);
          return a;
        }),
        odd: pa(function(a, b) {
          for (var c = 1; c < b; c += 2) a.push(c);
          return a;
        }),
        lt: pa(function(a, b, c) {
          for (var d = c < 0 ? c + b : c; --d >= 0;) a.push(d);
          return a;
        }),
        gt: pa(function(a, b, c) {
          for (var d = c < 0 ? c + b : c; ++d < b;) a.push(d);
          return a;
        })
      }
    }),
    (d.pseudos.nth = d.pseudos.eq);
    for (b in { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 })
    { d.pseudos[b] = ma(b); }
    for (b in { submit: !0, reset: !0 }) d.pseudos[b] = na(b);
    function ra() {}
    (ra.prototype = d.filters = d.pseudos),
    (d.setFilters = new ra()),
    (g = ga.tokenize = function(a, b) {
      var c;
      var e;
      var f;
      var g;
      var h;
      var i;
      var j;
      var k = z[a + " "];
      if (k) return b ? 0 : k.slice(0);
      (h = a), (i = []), (j = d.preFilter);
      while (h) {
        (c && !(e = Q.exec(h))) ||
            (e && (h = h.slice(e[0].length) || h), i.push((f = []))),
        (c = !1),
        (e = R.exec(h)) &&
              ((c = e.shift()),
              f.push({ value: c, type: e[0].replace(P, " ") }),
              (h = h.slice(c.length)));
        for (g in d.filter)
        { !(e = V[g].exec(h)) ||
              (j[g] && !(e = j[g](e))) ||
              ((c = e.shift()),
              f.push({ value: c, type: g, matches: e }),
              (h = h.slice(c.length))); }
        if (!c) break;
      }
      return b ? h.length : h ? ga.error(a) : z(a, i).slice(0);
    });
    function sa(a) {
      for (var b = 0, c = a.length, d = ""; b < c; b++) d += a[b].value;
      return d;
    }
    function ta(a, b, c) {
      var d = b.dir;
      var e = b.next;
      var f = e || d;
      var g = c && f === "parentNode";
      var h = x++;
      return b.first
        ? function(b, c, e) {
          while ((b = b[d])) if (b.nodeType === 1 || g) return a(b, c, e);
          return !1;
        }
        : function(b, c, i) {
          var j;
          var k;
          var l;
          var m = [w, h];
          if (i) {
            while ((b = b[d]))
            { if ((b.nodeType === 1 || g) && a(b, c, i)) return !0; }
          } else
          { while ((b = b[d]))
          { if (b.nodeType === 1 || g)
          { if (
            ((l = b[u] || (b[u] = {})),
            (k = l[b.uniqueID] || (l[b.uniqueID] = {})),
            e && e === b.nodeName.toLowerCase())
          )
          { b = b[d] || b; }
          else {
            if ((j = k[f]) && j[0] === w && j[1] === h)
            { return (m[2] = j[2]); }
            if (((k[f] = m), (m[2] = a(b, c, i)))) return !0;
          } } } }
          return !1;
        };
    }
    function ua(a) {
      return a.length > 1
        ? function(b, c, d) {
          var e = a.length;
          while (e--) if (!a[e](b, c, d)) return !1;
          return !0;
        }
        : a[0];
    }
    function va(a, b, c) {
      for (var d = 0, e = b.length; d < e; d++) ga(a, b[d], c);
      return c;
    }
    function wa(a, b, c, d, e) {
      for (var f, g = [], h = 0, i = a.length, j = b != null; h < i; h++)
      { (f = a[h]) && ((c && !c(f, d, e)) || (g.push(f), j && b.push(h))); }
      return g;
    }
    function xa(a, b, c, d, e, f) {
      return (
        d && !d[u] && (d = xa(d)),
        e && !e[u] && (e = xa(e, f)),
        ia(function(f, g, h, i) {
          var j;
          var k;
          var l;
          var m = [];
          var n = [];
          var o = g.length;
          var p = f || va(b || "*", h.nodeType ? [h] : h, []);
          var q = !a || (!f && b) ? p : wa(p, m, a, h, i);
          var r = c ? (e || (f ? a : o || d) ? [] : g) : q;
          if ((c && c(q, r, h, i), d)) {
            (j = wa(r, n)), d(j, [], h, i), (k = j.length);
            while (k--) (l = j[k]) && (r[n[k]] = !(q[n[k]] = l));
          }
          if (f) {
            if (e || a) {
              if (e) {
                (j = []), (k = r.length);
                while (k--) (l = r[k]) && j.push((q[k] = l));
                e(null, (r = []), j, i);
              }
              k = r.length;
              while (k--)
              { (l = r[k]) &&
                  (j = e ? I(f, l) : m[k]) > -1 &&
                  (f[j] = !(g[j] = l)); }
            }
          } else (r = wa(r === g ? r.splice(o, r.length) : r)), e ? e(null, g, r, i) : G.apply(g, r);
        })
      );
    }
    function ya(a) {
      for (
        var b,
          c,
          e,
          f = a.length,
          g = d.relative[a[0].type],
          h = g || d.relative[" "],
          i = g ? 1 : 0,
          k = ta(
            function(a) {
              return a === b;
            },
            h,
            !0
          ),
          l = ta(
            function(a) {
              return I(b, a) > -1;
            },
            h,
            !0
          ),
          m = [
            function(a, c, d) {
              var e =
                (!g && (d || c !== j)) ||
                ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
              return (b = null), e;
            }
          ];
        i < f;
        i++
      )
      { if ((c = d.relative[a[i].type])) m = [ta(ua(m), c)];
      else {
        if (((c = d.filter[a[i].type].apply(null, a[i].matches)), c[u])) {
          for (e = ++i; e < f; e++) if (d.relative[a[e].type]) break;
          return xa(
            i > 1 && ua(m),
            i > 1 &&
                sa(
                  a
                    .slice(0, i - 1)
                    .concat({ value: a[i - 2].type === " " ? "*" : "" })
                ).replace(P, "$1"),
            c,
            i < e && ya(a.slice(i, e)),
            e < f && ya((a = a.slice(e))),
            e < f && sa(a)
          );
        }
        m.push(c);
      } }
      return ua(m);
    }
    function za(a, b) {
      var c = b.length > 0;
      var e = a.length > 0;
      var f = function(f, g, h, i, k) {
        var l;
        var o;
        var q;
        var r = 0;
        var s = "0";
        var t = f && [];
        var u = [];
        var v = j;
        var x = f || (e && d.find.TAG("*", k));
        var y = (w += v == null ? 1 : Math.random() || 0.1);
        var z = x.length;
        for (
          k && (j = g === n || g || k);
          s !== z && (l = x[s]) != null;
          s++
        ) {
          if (e && l) {
            (o = 0), g || l.ownerDocument === n || (m(l), (h = !p));
            while ((q = a[o++]))
            { if (q(l, g || n, h)) {
              i.push(l);
              break;
            } }
            k && (w = y);
          }
          c && ((l = !q && l) && r--, f && t.push(l));
        }
        if (((r += s), c && s !== r)) {
          o = 0;
          while ((q = b[o++])) q(t, u, g, h);
          if (f) {
            if (r > 0) while (s--) t[s] || u[s] || (u[s] = E.call(i));
            u = wa(u);
          }
          G.apply(i, u),
          k && !f && u.length > 0 && r + b.length > 1 && ga.uniqueSort(i);
        }
        return k && ((w = y), (j = v)), t;
      };
      return c ? ia(f) : f;
    }
    return (
      (h = ga.compile = function(a, b) {
        var c;
        var d = [];
        var e = [];
        var f = A[a + " "];
        if (!f) {
          b || (b = g(a)), (c = b.length);
          while (c--) (f = ya(b[c])), f[u] ? d.push(f) : e.push(f);
          (f = A(a, za(e, d))), (f.selector = a);
        }
        return f;
      }),
      (i = ga.select = function(a, b, c, e) {
        var f;
        var i;
        var j;
        var k;
        var l;
        var m = typeof a === "function" && a;
        var n = !e && g((a = m.selector || a));
        if (((c = c || []), n.length === 1)) {
          if (
            ((i = n[0] = n[0].slice(0)),
            i.length > 2 &&
              (j = i[0]).type === "ID" &&
              b.nodeType === 9 &&
              p &&
              d.relative[i[1].type])
          ) {
            if (
              ((b = (d.find.ID(j.matches[0].replace(_, aa), b) || [])[0]), !b)
            )
            { return c; }
            m && (b = b.parentNode), (a = a.slice(i.shift().value.length));
          }
          f = V.needsContext.test(a) ? 0 : i.length;
          while (f--) {
            if (((j = i[f]), d.relative[(k = j.type)])) break;
            if (
              (l = d.find[k]) &&
              (e = l(
                j.matches[0].replace(_, aa),
                ($.test(i[0].type) && qa(b.parentNode)) || b
              ))
            ) {
              if ((i.splice(f, 1), (a = e.length && sa(i)), !a))
              { return G.apply(c, e), c; }
              break;
            }
          }
        }
        return (
          (m || h(a, n))(
            e,
            b,
            !p,
            c,
            !b || ($.test(a) && qa(b.parentNode)) || b
          ),
          c
        );
      }),
      (c.sortStable =
        u
          .split("")
          .sort(B)
          .join("") === u),
      (c.detectDuplicates = !!l),
      m(),
      (c.sortDetached = ja(function(a) {
        return 1 & a.compareDocumentPosition(n.createElement("fieldset"));
      })),
      ja(function(a) {
        return (
          (a.innerHTML = "<a href='#'></a>"),
          a.firstChild.getAttribute("href") === "#"
        );
      }) ||
        ka("type|href|height|width", function(a, b, c) {
          if (!c) return a.getAttribute(b, b.toLowerCase() === "type" ? 1 : 2);
        }),
      (c.attributes &&
        ja(function(a) {
          return (
            (a.innerHTML = "<input/>"),
            a.firstChild.setAttribute("value", ""),
            a.firstChild.getAttribute("value") === ""
          );
        })) ||
        ka("value", function(a, b, c) {
          if (!c && a.nodeName.toLowerCase() === "input") return a.defaultValue;
        }),
      ja(function(a) {
        return a.getAttribute("disabled") == null;
      }) ||
        ka(J, function(a, b, c) {
          var d;
          if (!c)
          { return a[b] === !0
            ? b.toLowerCase()
            : (d = a.getAttributeNode(b)) && d.specified
              ? d.value
              : null; }
        }),
      ga
    );
  })(a);
  (r.find = x),
  (r.expr = x.selectors),
  (r.expr[":"] = r.expr.pseudos),
  (r.uniqueSort = r.unique = x.uniqueSort),
  (r.text = x.getText),
  (r.isXMLDoc = x.isXML),
  (r.contains = x.contains),
  (r.escapeSelector = x.escape);
  var y = function(a, b, c) {
    var d = [];
    var e = void 0 !== c;
    while ((a = a[b]) && a.nodeType !== 9)
    { if (a.nodeType === 1) {
      if (e && r(a).is(c)) break;
      d.push(a);
    } }
    return d;
  };
  var z = function(a, b) {
    for (var c = []; a; a = a.nextSibling)
    { a.nodeType === 1 && a !== b && c.push(a); }
    return c;
  };
  var A = r.expr.match.needsContext;
  function B(a, b) {
    return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
  }
  var C = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
  var D = /^.[^:#\[\.,]*$/;
  function E(a, b, c) {
    return r.isFunction(b)
      ? r.grep(a, function(a, d) {
        return !!b.call(a, d, a) !== c;
      })
      : b.nodeType
        ? r.grep(a, function(a) {
          return (a === b) !== c;
        })
        : typeof b !== "string"
          ? r.grep(a, function(a) {
            return i.call(b, a) > -1 !== c;
          })
          : D.test(b)
            ? r.filter(b, a, c)
            : ((b = r.filter(b, a)),
            r.grep(a, function(a) {
              return i.call(b, a) > -1 !== c && a.nodeType === 1;
            }));
  }
  (r.filter = function(a, b, c) {
    var d = b[0];
    return (
      c && (a = ":not(" + a + ")"),
      b.length === 1 && d.nodeType === 1
        ? r.find.matchesSelector(d, a)
          ? [d]
          : []
        : r.find.matches(
          a,
          r.grep(b, function(a) {
            return a.nodeType === 1;
          })
        )
    );
  }),
  r.fn.extend({
    find(a) {
      var b;
      var c;
      var d = this.length;
      var e = this;
      if (typeof a !== "string")
      { return this.pushStack(
        r(a).filter(function() {
          for (b = 0; b < d; b++) if (r.contains(e[b], this)) return !0;
        })
      ); }
      for (c = this.pushStack([]), b = 0; b < d; b++) r.find(a, e[b], c);
      return d > 1 ? r.uniqueSort(c) : c;
    },
    filter(a) {
      return this.pushStack(E(this, a || [], !1));
    },
    not(a) {
      return this.pushStack(E(this, a || [], !0));
    },
    is(a) {
      return !!E(this, typeof a === "string" && A.test(a) ? r(a) : a || [], !1)
        .length;
    }
  });
  var F;
  var G = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
  var H = (r.fn.init = function(a, b, c) {
    var e, f;
    if (!a) return this;
    if (((c = c || F), typeof a === "string")) {
      if (
        ((e =
            a[0] === "<" && a[a.length - 1] === ">" && a.length >= 3
              ? [null, a, null]
              : G.exec(a)),
        !e || (!e[1] && b))
      )
      { return !b || b.jquery
        ? (b || c).find(a)
        : this.constructor(b).find(a); }
      if (e[1]) {
        if (
          ((b = b instanceof r ? b[0] : b),
          r.merge(
            this,
            r.parseHTML(e[1], b && b.nodeType ? b.ownerDocument || b : d, !0)
          ),
          C.test(e[1]) && r.isPlainObject(b))
        )
        { for (e in b)
        { r.isFunction(this[e]) ? this[e](b[e]) : this.attr(e, b[e]); } }
        return this;
      }
      return (
        (f = d.getElementById(e[2])),
        f && ((this[0] = f), (this.length = 1)),
        this
      );
    }
    return a.nodeType
      ? ((this[0] = a), (this.length = 1), this)
      : r.isFunction(a)
        ? void 0 !== c.ready
          ? c.ready(a)
          : a(r)
        : r.makeArray(a, this);
  });
  (H.prototype = r.fn), (F = r(d));
  var I = /^(?:parents|prev(?:Until|All))/;
  var J = { children: !0, contents: !0, next: !0, prev: !0 };
  r.fn.extend({
    has(a) {
      var b = r(a, this);
      var c = b.length;
      return this.filter(function() {
        for (var a = 0; a < c; a++) if (r.contains(this, b[a])) return !0;
      });
    },
    closest(a, b) {
      var c;
      var d = 0;
      var e = this.length;
      var f = [];
      var g = typeof a !== "string" && r(a);
      if (!A.test(a))
      { for (; d < e; d++)
      { for (c = this[d]; c && c !== b; c = c.parentNode)
      { if (
        c.nodeType < 11 &&
              (g
                ? g.index(c) > -1
                : c.nodeType === 1 && r.find.matchesSelector(c, a))
      ) {
        f.push(c);
        break;
      } } } }
      return this.pushStack(f.length > 1 ? r.uniqueSort(f) : f);
    },
    index(a) {
      return a
        ? typeof a === "string"
          ? i.call(r(a), this[0])
          : i.call(this, a.jquery ? a[0] : a)
        : this[0] && this[0].parentNode
          ? this.first().prevAll().length
          : -1;
    },
    add(a, b) {
      return this.pushStack(r.uniqueSort(r.merge(this.get(), r(a, b))));
    },
    addBack(a) {
      return this.add(a == null ? this.prevObject : this.prevObject.filter(a));
    }
  });
  function K(a, b) {
    while ((a = a[b]) && a.nodeType !== 1);
    return a;
  }
  r.each(
    {
      parent(a) {
        var b = a.parentNode;
        return b && b.nodeType !== 11 ? b : null;
      },
      parents(a) {
        return y(a, "parentNode");
      },
      parentsUntil(a, b, c) {
        return y(a, "parentNode", c);
      },
      next(a) {
        return K(a, "nextSibling");
      },
      prev(a) {
        return K(a, "previousSibling");
      },
      nextAll(a) {
        return y(a, "nextSibling");
      },
      prevAll(a) {
        return y(a, "previousSibling");
      },
      nextUntil(a, b, c) {
        return y(a, "nextSibling", c);
      },
      prevUntil(a, b, c) {
        return y(a, "previousSibling", c);
      },
      siblings(a) {
        return z((a.parentNode || {}).firstChild, a);
      },
      children(a) {
        return z(a.firstChild);
      },
      contents(a) {
        return B(a, "iframe")
          ? a.contentDocument
          : (B(a, "template") && (a = a.content || a),
          r.merge([], a.childNodes));
      }
    },
    function(a, b) {
      r.fn[a] = function(c, d) {
        var e = r.map(this, b, c);
        return (
          a.slice(-5) !== "Until" && (d = c),
          d && typeof d === "string" && (e = r.filter(d, e)),
          this.length > 1 &&
            (J[a] || r.uniqueSort(e), I.test(a) && e.reverse()),
          this.pushStack(e)
        );
      };
    }
  );
  var L = /[^\x20\t\r\n\f]+/g;
  function M(a) {
    var b = {};
    return (
      r.each(a.match(L) || [], function(a, c) {
        b[c] = !0;
      }),
      b
    );
  }
  r.Callbacks = function(a) {
    a = typeof a === "string" ? M(a) : r.extend({}, a);
    var b;
    var c;
    var d;
    var e;
    var f = [];
    var g = [];
    var h = -1;
    var i = function() {
      for (e = e || a.once, d = b = !0; g.length; h = -1) {
        c = g.shift();
        while (++h < f.length)
        { f[h].apply(c[0], c[1]) === !1 &&
              a.stopOnFalse &&
              ((h = f.length), (c = !1)); }
      }
      a.memory || (c = !1), (b = !1), e && (f = c ? [] : "");
    };
    var j = {
      add() {
        return (
          f &&
              (c && !b && ((h = f.length - 1), g.push(c)),
              (function d(b) {
                r.each(b, function(b, c) {
                  r.isFunction(c)
                    ? (a.unique && j.has(c)) || f.push(c)
                    : c && c.length && r.type(c) !== "string" && d(c);
                });
              })(arguments),
              c && !b && i()),
          this
        );
      },
      remove() {
        return (
          r.each(arguments, function(a, b) {
            var c;
            while ((c = r.inArray(b, f, c)) > -1)
            { f.splice(c, 1), c <= h && h--; }
          }),
          this
        );
      },
      has(a) {
        return a ? r.inArray(a, f) > -1 : f.length > 0;
      },
      empty() {
        return f && (f = []), this;
      },
      disable() {
        return (e = g = []), (f = c = ""), this;
      },
      disabled() {
        return !f;
      },
      lock() {
        return (e = g = []), c || b || (f = c = ""), this;
      },
      locked() {
        return !!e;
      },
      fireWith(a, c) {
        return (
          e ||
              ((c = c || []),
              (c = [a, c.slice ? c.slice() : c]),
              g.push(c),
              b || i()),
          this
        );
      },
      fire() {
        return j.fireWith(this, arguments), this;
      },
      fired() {
        return !!d;
      }
    };
    return j;
  };
  function N(a) {
    return a;
  }
  function O(a) {
    throw a;
  }
  function P(a, b, c, d) {
    var e;
    try {
      a && r.isFunction((e = a.promise))
        ? e
          .call(a)
          .done(b)
          .fail(c)
        : a && r.isFunction((e = a.then))
          ? e.call(a, b, c)
          : b.apply(void 0, [a].slice(d));
    } catch (a) {
      c.apply(void 0, [a]);
    }
  }
  r.extend({
    Deferred(b) {
      var c = [
        [
          "notify",
          "progress",
          r.Callbacks("memory"),
          r.Callbacks("memory"),
          2
        ],
        [
          "resolve",
          "done",
          r.Callbacks("once memory"),
          r.Callbacks("once memory"),
          0,
          "resolved"
        ],
        [
          "reject",
          "fail",
          r.Callbacks("once memory"),
          r.Callbacks("once memory"),
          1,
          "rejected"
        ]
      ];
      var d = "pending";
      var e = {
        state() {
          return d;
        },
        always() {
          return f.done(arguments).fail(arguments), this;
        },
        catch(a) {
          return e.then(null, a);
        },
        pipe() {
          var a = arguments;
          return r
            .Deferred(function(b) {
              r.each(c, function(c, d) {
                var e = r.isFunction(a[d[4]]) && a[d[4]];
                f[d[1]](function() {
                  var a = e && e.apply(this, arguments);
                  a && r.isFunction(a.promise)
                    ? a
                      .promise()
                      .progress(b.notify)
                      .done(b.resolve)
                      .fail(b.reject)
                    : b[d[0] + "With"](this, e ? [a] : arguments);
                });
              }),
              (a = null);
            })
            .promise();
        },
        then(b, d, e) {
          var f = 0;
          function g(b, c, d, e) {
            return function() {
              var h = this;
              var i = arguments;
              var j = function() {
                var a, j;
                if (!(b < f)) {
                  if (((a = d.apply(h, i)), a === c.promise()))
                  { throw new TypeError("Thenable self-resolution"); }
                  (j =
                        a &&
                        (typeof a === "object" || typeof a === "function") &&
                        a.then),
                  r.isFunction(j)
                    ? e
                      ? j.call(a, g(f, c, N, e), g(f, c, O, e))
                      : (f++,
                      j.call(
                        a,
                        g(f, c, N, e),
                        g(f, c, O, e),
                        g(f, c, N, c.notifyWith)
                      ))
                    : (d !== N && ((h = void 0), (i = [a])),
                    (e || c.resolveWith)(h, i));
                }
              };
              var k = e
                ? j
                : function() {
                  try {
                    j();
                  } catch (a) {
                    r.Deferred.exceptionHook &&
                            r.Deferred.exceptionHook(a, k.stackTrace),
                    b + 1 >= f &&
                              (d !== O && ((h = void 0), (i = [a])),
                              c.rejectWith(h, i));
                  }
                };
              b
                ? k()
                : (r.Deferred.getStackHook &&
                      (k.stackTrace = r.Deferred.getStackHook()),
                a.setTimeout(k));
            };
          }
          return r
            .Deferred(function(a) {
              c[0][3].add(g(0, a, r.isFunction(e) ? e : N, a.notifyWith)),
              c[1][3].add(g(0, a, r.isFunction(b) ? b : N)),
              c[2][3].add(g(0, a, r.isFunction(d) ? d : O));
            })
            .promise();
        },
        promise(a) {
          return a != null ? r.extend(a, e) : e;
        }
      };
      var f = {};
      return (
        r.each(c, function(a, b) {
          var g = b[2];
          var h = b[5];
          (e[b[1]] = g.add),
          h &&
              g.add(
                function() {
                  d = h;
                },
                c[3 - a][2].disable,
                c[0][2].lock
              ),
          g.add(b[3].fire),
          (f[b[0]] = function() {
            return (
              f[b[0] + "With"](this === f ? void 0 : this, arguments), this
            );
          }),
          (f[b[0] + "With"] = g.fireWith);
        }),
        e.promise(f),
        b && b.call(f, f),
        f
      );
    },
    when(a) {
      var b = arguments.length;
      var c = b;
      var d = Array(c);
      var e = f.call(arguments);
      var g = r.Deferred();
      var h = function(a) {
        return function(c) {
          (d[a] = this),
          (e[a] = arguments.length > 1 ? f.call(arguments) : c),
          --b || g.resolveWith(d, e);
        };
      };
      if (
        b <= 1 &&
        (P(a, g.done(h(c)).resolve, g.reject, !b),
        g.state() === "pending" || r.isFunction(e[c] && e[c].then))
      )
      { return g.then(); }
      while (c--) P(e[c], h(c), g.reject);
      return g.promise();
    }
  });
  var Q = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
  (r.Deferred.exceptionHook = function(b, c) {
    a.console &&
      a.console.warn &&
      b &&
      Q.test(b.name) &&
      a.console.warn("jQuery.Deferred exception: " + b.message, b.stack, c);
  }),
  (r.readyException = function(b) {
    a.setTimeout(function() {
      throw b;
    });
  });
  var R = r.Deferred();
  (r.fn.ready = function(a) {
    return (
      R.then(a).catch(function(a) {
        r.readyException(a);
      }),
      this
    );
  }),
  r.extend({
    isReady: !1,
    readyWait: 1,
    ready(a) {
      (a === !0 ? --r.readyWait : r.isReady) ||
          ((r.isReady = !0),
          (a !== !0 && --r.readyWait > 0) || R.resolveWith(d, [r]));
    }
  }),
  (r.ready.then = R.then);
  function S() {
    d.removeEventListener("DOMContentLoaded", S),
    a.removeEventListener("load", S),
    r.ready();
  }
  d.readyState === "complete" ||
  (d.readyState !== "loading" && !d.documentElement.doScroll)
    ? a.setTimeout(r.ready)
    : (d.addEventListener("DOMContentLoaded", S),
    a.addEventListener("load", S));
  var T = function(a, b, c, d, e, f, g) {
    var h = 0;
    var i = a.length;
    var j = c == null;
    if (r.type(c) === "object") {
      e = !0;
      for (h in c) T(a, b, h, c[h], !0, f, g);
    } else if (
      void 0 !== d &&
        ((e = !0),
        r.isFunction(d) || (g = !0),
        j &&
          (g
            ? (b.call(a, d), (b = null))
            : ((j = b),
            (b = function(a, b, c) {
              return j.call(r(a), c);
            }))),
        b)
    )
    { for (; h < i; h++) b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c))); }
    return e ? a : j ? b.call(a) : i ? b(a[0], c) : f;
  };
  var U = function(a) {
    return a.nodeType === 1 || a.nodeType === 9 || !+a.nodeType;
  };
  function V() {
    this.expando = r.expando + V.uid++;
  }
  (V.uid = 1),
  (V.prototype = {
    cache(a) {
      var b = a[this.expando];
      return (
        b ||
            ((b = {}),
            U(a) &&
              (a.nodeType
                ? (a[this.expando] = b)
                : Object.defineProperty(a, this.expando, {
                  value: b,
                  configurable: !0
                }))),
        b
      );
    },
    set(a, b, c) {
      var d;
      var e = this.cache(a);
      if (typeof b === "string") e[r.camelCase(b)] = c;
      else for (d in b) e[r.camelCase(d)] = b[d];
      return e;
    },
    get(a, b) {
      return void 0 === b
        ? this.cache(a)
        : a[this.expando] && a[this.expando][r.camelCase(b)];
    },
    access(a, b, c) {
      return void 0 === b || (b && typeof b === "string" && void 0 === c)
        ? this.get(a, b)
        : (this.set(a, b, c), void 0 !== c ? c : b);
    },
    remove(a, b) {
      var c;
      var d = a[this.expando];
      if (void 0 !== d) {
        if (void 0 !== b) {
          Array.isArray(b)
            ? (b = b.map(r.camelCase))
            : ((b = r.camelCase(b)), (b = b in d ? [b] : b.match(L) || [])),
          (c = b.length);
          while (c--) delete d[b[c]];
        }
        (void 0 === b || r.isEmptyObject(d)) &&
            (a.nodeType ? (a[this.expando] = void 0) : delete a[this.expando]);
      }
    },
    hasData(a) {
      var b = a[this.expando];
      return void 0 !== b && !r.isEmptyObject(b);
    }
  });
  var W = new V();
  var X = new V();
  var Y = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
  var Z = /[A-Z]/g;
  function $(a) {
    return (
      a === "true" ||
      (a !== "false" &&
        (a === "null"
          ? null
          : a === +a + ""
            ? +a
            : Y.test(a)
              ? JSON.parse(a)
              : a))
    );
  }
  function _(a, b, c) {
    var d;
    if (void 0 === c && a.nodeType === 1)
    { if (
      ((d = "data-" + b.replace(Z, "-$&").toLowerCase()),
      (c = a.getAttribute(d)),
      typeof c === "string")
    ) {
      try {
        c = $(c);
      } catch (e) {}
      X.set(a, b, c);
    } else c = void 0; }
    return c;
  }
  r.extend({
    hasData(a) {
      return X.hasData(a) || W.hasData(a);
    },
    data(a, b, c) {
      return X.access(a, b, c);
    },
    removeData(a, b) {
      X.remove(a, b);
    },
    _data(a, b, c) {
      return W.access(a, b, c);
    },
    _removeData(a, b) {
      W.remove(a, b);
    }
  }),
  r.fn.extend({
    data(a, b) {
      var c;
      var d;
      var e;
      var f = this[0];
      var g = f && f.attributes;
      if (void 0 === a) {
        if (
          this.length &&
            ((e = X.get(f)), f.nodeType === 1 && !W.get(f, "hasDataAttrs"))
        ) {
          c = g.length;
          while (c--)
          { g[c] &&
                ((d = g[c].name),
                d.indexOf("data-") === 0 &&
                  ((d = r.camelCase(d.slice(5))), _(f, d, e[d]))); }
          W.set(f, "hasDataAttrs", !0);
        }
        return e;
      }
      return typeof a === "object"
        ? this.each(function() {
          X.set(this, a);
        })
        : T(
          this,
          function(b) {
            var c;
            if (f && void 0 === b) {
              if (((c = X.get(f, a)), void 0 !== c)) return c;
              if (((c = _(f, a)), void 0 !== c)) return c;
            } else
            { this.each(function() {
              X.set(this, a, b);
            }); }
          },
          null,
          b,
          arguments.length > 1,
          null,
          !0
        );
    },
    removeData(a) {
      return this.each(function() {
        X.remove(this, a);
      });
    }
  }),
  r.extend({
    queue(a, b, c) {
      var d;
      if (a)
      { return (
        (b = (b || "fx") + "queue"),
        (d = W.get(a, b)),
        c &&
              (!d || Array.isArray(c)
                ? (d = W.access(a, b, r.makeArray(c)))
                : d.push(c)),
        d || []
      ); }
    },
    dequeue(a, b) {
      b = b || "fx";
      var c = r.queue(a, b);
      var d = c.length;
      var e = c.shift();
      var f = r._queueHooks(a, b);
      var g = function() {
        r.dequeue(a, b);
      };
      e === "inprogress" && ((e = c.shift()), d--),
      e &&
            (b === "fx" && c.unshift("inprogress"),
            delete f.stop,
            e.call(a, g, f)),
      !d && f && f.empty.fire();
    },
    _queueHooks(a, b) {
      var c = b + "queueHooks";
      return (
        W.get(a, c) ||
          W.access(a, c, {
            empty: r.Callbacks("once memory").add(function() {
              W.remove(a, [b + "queue", c]);
            })
          })
      );
    }
  }),
  r.fn.extend({
    queue(a, b) {
      var c = 2;
      return (
        typeof a !== "string" && ((b = a), (a = "fx"), c--),
        arguments.length < c
          ? r.queue(this[0], a)
          : void 0 === b
            ? this
            : this.each(function() {
              var c = r.queue(this, a, b);
              r._queueHooks(this, a),
              a === "fx" && c[0] !== "inprogress" && r.dequeue(this, a);
            })
      );
    },
    dequeue(a) {
      return this.each(function() {
        r.dequeue(this, a);
      });
    },
    clearQueue(a) {
      return this.queue(a || "fx", []);
    },
    promise(a, b) {
      var c;
      var d = 1;
      var e = r.Deferred();
      var f = this;
      var g = this.length;
      var h = function() {
        --d || e.resolveWith(f, [f]);
      };
      typeof a !== "string" && ((b = a), (a = void 0)), (a = a || "fx");
      while (g--)
      { (c = W.get(f[g], a + "queueHooks")),
      c && c.empty && (d++, c.empty.add(h)); }
      return h(), e.promise(b);
    }
  });
  var aa = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
  var ba = new RegExp("^(?:([+-])=|)(" + aa + ")([a-z%]*)$", "i");
  var ca = ["Top", "Right", "Bottom", "Left"];
  var da = function(a, b) {
    return (
      (a = b || a),
      a.style.display === "none" ||
          (a.style.display === "" &&
            r.contains(a.ownerDocument, a) &&
            r.css(a, "display") === "none")
    );
  };
  var ea = function(a, b, c, d) {
    var e;
    var f;
    var g = {};
    for (f in b) (g[f] = a.style[f]), (a.style[f] = b[f]);
    e = c.apply(a, d || []);
    for (f in b) a.style[f] = g[f];
    return e;
  };
  function fa(a, b, c, d) {
    var e;
    var f = 1;
    var g = 20;
    var h = d
      ? function() {
        return d.cur();
      }
      : function() {
        return r.css(a, b, "");
      };
    var i = h();
    var j = (c && c[3]) || (r.cssNumber[b] ? "" : "px");
    var k = (r.cssNumber[b] || (j !== "px" && +i)) && ba.exec(r.css(a, b));
    if (k && k[3] !== j) {
      (j = j || k[3]), (c = c || []), (k = +i || 1);
      do (f = f || ".5"), (k /= f), r.style(a, b, k + j);
      while (f !== (f = h() / i) && f !== 1 && --g);
    }
    return (
      c &&
        ((k = +k || +i || 0),
        (e = c[1] ? k + (c[1] + 1) * c[2] : +c[2]),
        d && ((d.unit = j), (d.start = k), (d.end = e))),
      e
    );
  }
  var ga = {};
  function ha(a) {
    var b;
    var c = a.ownerDocument;
    var d = a.nodeName;
    var e = ga[d];
    return e || ((b = c.body.appendChild(c.createElement(d))),
    (e = r.css(b, "display")),
    b.parentNode.removeChild(b),
    e === "none" && (e = "block"),
    (ga[d] = e),
    e);
  }
  function ia(a, b) {
    for (var c, d, e = [], f = 0, g = a.length; f < g; f++)
    { (d = a[f]),
    d.style &&
          ((c = d.style.display),
          b
            ? (c === "none" &&
                ((e[f] = W.get(d, "display") || null),
                e[f] || (d.style.display = "")),
            d.style.display === "" && da(d) && (e[f] = ha(d)))
            : c !== "none" && ((e[f] = "none"), W.set(d, "display", c))); }
    for (f = 0; f < g; f++) e[f] != null && (a[f].style.display = e[f]);
    return a;
  }
  r.fn.extend({
    show() {
      return ia(this, !0);
    },
    hide() {
      return ia(this);
    },
    toggle(a) {
      return typeof a === "boolean"
        ? a
          ? this.show()
          : this.hide()
        : this.each(function() {
          da(this) ? r(this).show() : r(this).hide();
        });
    }
  });
  var ja = /^(?:checkbox|radio)$/i;
  var ka = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i;
  var la = /^$|\/(?:java|ecma)script/i;
  var ma = {
    option: [1, "<select multiple='multiple'>", "</select>"],
    thead: [1, "<table>", "</table>"],
    col: [2, "<table><colgroup>", "</colgroup></table>"],
    tr: [2, "<table><tbody>", "</tbody></table>"],
    td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
    _default: [0, "", ""]
  };
  (ma.optgroup = ma.option),
  (ma.tbody = ma.tfoot = ma.colgroup = ma.caption = ma.thead),
  (ma.th = ma.td);
  function na(a, b) {
    var c;
    return (
      (c =
        typeof a.getElementsByTagName !== "undefined"
          ? a.getElementsByTagName(b || "*")
          : typeof a.querySelectorAll !== "undefined"
            ? a.querySelectorAll(b || "*")
            : []),
      void 0 === b || (b && B(a, b)) ? r.merge([a], c) : c
    );
  }
  function oa(a, b) {
    for (var c = 0, d = a.length; c < d; c++)
    { W.set(a[c], "globalEval", !b || W.get(b[c], "globalEval")); }
  }
  var pa = /<|&#?\w+;/;
  function qa(a, b, c, d, e) {
    for (
      var f,
        g,
        h,
        i,
        j,
        k,
        l = b.createDocumentFragment(),
        m = [],
        n = 0,
        o = a.length;
      n < o;
      n++
    )
    { if (((f = a[n]), f || f === 0))
    { if (r.type(f) === "object") r.merge(m, f.nodeType ? [f] : f);
    else if (pa.test(f)) {
      (g = g || l.appendChild(b.createElement("div"))),
      (h = (ka.exec(f) || ["", ""])[1].toLowerCase()),
      (i = ma[h] || ma._default),
      (g.innerHTML = i[1] + r.htmlPrefilter(f) + i[2]),
      (k = i[0]);
      while (k--) g = g.lastChild;
      r.merge(m, g.childNodes), (g = l.firstChild), (g.textContent = "");
    } else m.push(b.createTextNode(f)); } }
    (l.textContent = ""), (n = 0);
    while ((f = m[n++]))
    { if (d && r.inArray(f, d) > -1) e && e.push(f);
    else if (
      ((j = r.contains(f.ownerDocument, f)),
      (g = na(l.appendChild(f), "script")),
      j && oa(g),
      c)
    ) {
      k = 0;
      while ((f = g[k++])) la.test(f.type || "") && c.push(f);
    } }
    return l;
  }
  !(function() {
    var a = d.createDocumentFragment();
    var b = a.appendChild(d.createElement("div"));
    var c = d.createElement("input");
    c.setAttribute("type", "radio"),
    c.setAttribute("checked", "checked"),
    c.setAttribute("name", "t"),
    b.appendChild(c),
    (o.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked),
    (b.innerHTML = "<textarea>x</textarea>"),
    (o.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue);
  })();
  var ra = d.documentElement;
  var sa = /^key/;
  var ta = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;
  var ua = /^([^.]*)(?:\.(.+)|)/;
  function va() {
    return !0;
  }
  function wa() {
    return !1;
  }
  function xa() {
    try {
      return d.activeElement;
    } catch (a) {}
  }
  function ya(a, b, c, d, e, f) {
    var g, h;
    if (typeof b === "object") {
      typeof c !== "string" && ((d = d || c), (c = void 0));
      for (h in b) ya(a, h, c, d, b[h], f);
      return a;
    }
    if (
      (d == null && e == null
        ? ((e = c), (d = c = void 0))
        : e == null &&
          (typeof c === "string"
            ? ((e = d), (d = void 0))
            : ((e = d), (d = c), (c = void 0))),
      e === !1)
    )
    { e = wa; }
    else if (!e) return a;
    return (
      f === 1 &&
        ((g = e),
        (e = function(a) {
          return r().off(a), g.apply(this, arguments);
        }),
        (e.guid = g.guid || (g.guid = r.guid++))),
      a.each(function() {
        r.event.add(this, b, e, d, c);
      })
    );
  }
  (r.event = {
    global: {},
    add(a, b, c, d, e) {
      var f;
      var g;
      var h;
      var i;
      var j;
      var k;
      var l;
      var m;
      var n;
      var o;
      var p;
      var q = W.get(a);
      if (q) {
        c.handler && ((f = c), (c = f.handler), (e = f.selector)),
        e && r.find.matchesSelector(ra, e),
        c.guid || (c.guid = r.guid++),
        (i = q.events) || (i = q.events = {}),
        (g = q.handle) ||
            (g = q.handle = function(b) {
              return typeof r !== "undefined" && r.event.triggered !== b.type
                ? r.event.dispatch.apply(a, arguments)
                : void 0;
            }),
        (b = (b || "").match(L) || [""]),
        (j = b.length);
        while (j--)
        { (h = ua.exec(b[j]) || []),
        (n = p = h[1]),
        (o = (h[2] || "").split(".").sort()),
        n &&
              ((l = r.event.special[n] || {}),
              (n = (e ? l.delegateType : l.bindType) || n),
              (l = r.event.special[n] || {}),
              (k = r.extend(
                {
                  type: n,
                  origType: p,
                  data: d,
                  handler: c,
                  guid: c.guid,
                  selector: e,
                  needsContext: e && r.expr.match.needsContext.test(e),
                  namespace: o.join(".")
                },
                f
              )),
              (m = i[n]) ||
                ((m = i[n] = []),
                (m.delegateCount = 0),
                (l.setup && l.setup.call(a, d, o, g) !== !1) ||
                  (a.addEventListener && a.addEventListener(n, g))),
              l.add &&
                (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)),
              e ? m.splice(m.delegateCount++, 0, k) : m.push(k),
              (r.event.global[n] = !0)); }
      }
    },
    remove(a, b, c, d, e) {
      var f;
      var g;
      var h;
      var i;
      var j;
      var k;
      var l;
      var m;
      var n;
      var o;
      var p;
      var q = W.hasData(a) && W.get(a);
      if (q && (i = q.events)) {
        (b = (b || "").match(L) || [""]), (j = b.length);
        while (j--)
        { if (
          ((h = ua.exec(b[j]) || []),
          (n = p = h[1]),
          (o = (h[2] || "").split(".").sort()),
          n)
        ) {
          (l = r.event.special[n] || {}),
          (n = (d ? l.delegateType : l.bindType) || n),
          (m = i[n] || []),
          (h =
                h[2] &&
                new RegExp("(^|\\.)" + o.join("\\.(?:.*\\.|)") + "(\\.|$)")),
          (g = f = m.length);
          while (f--)
          { (k = m[f]),
          (!e && p !== k.origType) ||
                  (c && c.guid !== k.guid) ||
                  (h && !h.test(k.namespace)) ||
                  (d && d !== k.selector && (d !== "**" || !k.selector)) ||
                  (m.splice(f, 1),
                  k.selector && m.delegateCount--,
                  l.remove && l.remove.call(a, k)); }
          g &&
              !m.length &&
              ((l.teardown && l.teardown.call(a, o, q.handle) !== !1) ||
                r.removeEvent(a, n, q.handle),
              delete i[n]);
        } else for (n in i) r.event.remove(a, n + b[j], c, d, !0); }
        r.isEmptyObject(i) && W.remove(a, "handle events");
      }
    },
    dispatch(a) {
      var b = r.event.fix(a);
      var c;
      var d;
      var e;
      var f;
      var g;
      var h;
      var i = new Array(arguments.length);
      var j = (W.get(this, "events") || {})[b.type] || [];
      var k = r.event.special[b.type] || {};
      for (i[0] = b, c = 1; c < arguments.length; c++) i[c] = arguments[c];
      if (
        ((b.delegateTarget = this),
        !k.preDispatch || k.preDispatch.call(this, b) !== !1)
      ) {
        (h = r.event.handlers.call(this, b, j)), (c = 0);
        while ((f = h[c++]) && !b.isPropagationStopped()) {
          (b.currentTarget = f.elem), (d = 0);
          while ((g = f.handlers[d++]) && !b.isImmediatePropagationStopped())
          { (b.rnamespace && !b.rnamespace.test(g.namespace)) ||
              ((b.handleObj = g),
              (b.data = g.data),
              (e = (
                (r.event.special[g.origType] || {}).handle || g.handler
              ).apply(f.elem, i)),
              void 0 !== e &&
                (b.result = e) === !1 &&
                (b.preventDefault(), b.stopPropagation())); }
        }
        return k.postDispatch && k.postDispatch.call(this, b), b.result;
      }
    },
    handlers(a, b) {
      var c;
      var d;
      var e;
      var f;
      var g;
      var h = [];
      var i = b.delegateCount;
      var j = a.target;
      if (i && j.nodeType && !(a.type === "click" && a.button >= 1))
      { for (; j !== this; j = j.parentNode || this)
      { if (j.nodeType === 1 && (a.type !== "click" || j.disabled !== !0)) {
        for (f = [], g = {}, c = 0; c < i; c++)
        { (d = b[c]),
        (e = d.selector + " "),
        void 0 === g[e] &&
                  (g[e] = d.needsContext
                    ? r(e, this).index(j) > -1
                    : r.find(e, this, null, [j]).length),
        g[e] && f.push(d); }
        f.length && h.push({ elem: j, handlers: f });
      } } }
      return (
        (j = this), i < b.length && h.push({ elem: j, handlers: b.slice(i) }), h
      );
    },
    addProp(a, b) {
      Object.defineProperty(r.Event.prototype, a, {
        enumerable: !0,
        configurable: !0,
        get: r.isFunction(b)
          ? function() {
            if (this.originalEvent) return b(this.originalEvent);
          }
          : function() {
            if (this.originalEvent) return this.originalEvent[a];
          },
        set(b) {
          Object.defineProperty(this, a, {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: b
          });
        }
      });
    },
    fix(a) {
      return a[r.expando] ? a : new r.Event(a);
    },
    special: {
      load: { noBubble: !0 },
      focus: {
        trigger() {
          if (this !== xa() && this.focus) return this.focus(), !1;
        },
        delegateType: "focusin"
      },
      blur: {
        trigger() {
          if (this === xa() && this.blur) return this.blur(), !1;
        },
        delegateType: "focusout"
      },
      click: {
        trigger() {
          if (this.type === "checkbox" && this.click && B(this, "input"))
          { return this.click(), !1; }
        },
        _default(a) {
          return B(a.target, "a");
        }
      },
      beforeunload: {
        postDispatch(a) {
          void 0 !== a.result &&
            a.originalEvent &&
            (a.originalEvent.returnValue = a.result);
        }
      }
    }
  }),
  (r.removeEvent = function(a, b, c) {
    a.removeEventListener && a.removeEventListener(b, c);
  }),
  (r.Event = function(a, b) {
    return this instanceof r.Event
      ? (a && a.type
        ? ((this.originalEvent = a),
        (this.type = a.type),
        (this.isDefaultPrevented =
                a.defaultPrevented ||
                (void 0 === a.defaultPrevented && a.returnValue === !1)
                  ? va
                  : wa),
        (this.target =
                a.target && a.target.nodeType === 3
                  ? a.target.parentNode
                  : a.target),
        (this.currentTarget = a.currentTarget),
        (this.relatedTarget = a.relatedTarget))
        : (this.type = a),
      b && r.extend(this, b),
      (this.timeStamp = (a && a.timeStamp) || r.now()),
      void (this[r.expando] = !0))
      : new r.Event(a, b);
  }),
  (r.Event.prototype = {
    constructor: r.Event,
    isDefaultPrevented: wa,
    isPropagationStopped: wa,
    isImmediatePropagationStopped: wa,
    isSimulated: !1,
    preventDefault() {
      var a = this.originalEvent;
      (this.isDefaultPrevented = va),
      a && !this.isSimulated && a.preventDefault();
    },
    stopPropagation() {
      var a = this.originalEvent;
      (this.isPropagationStopped = va),
      a && !this.isSimulated && a.stopPropagation();
    },
    stopImmediatePropagation() {
      var a = this.originalEvent;
      (this.isImmediatePropagationStopped = va),
      a && !this.isSimulated && a.stopImmediatePropagation(),
      this.stopPropagation();
    }
  }),
  r.each(
    {
      altKey: !0,
      bubbles: !0,
      cancelable: !0,
      changedTouches: !0,
      ctrlKey: !0,
      detail: !0,
      eventPhase: !0,
      metaKey: !0,
      pageX: !0,
      pageY: !0,
      shiftKey: !0,
      view: !0,
      char: !0,
      charCode: !0,
      key: !0,
      keyCode: !0,
      button: !0,
      buttons: !0,
      clientX: !0,
      clientY: !0,
      offsetX: !0,
      offsetY: !0,
      pointerId: !0,
      pointerType: !0,
      screenX: !0,
      screenY: !0,
      targetTouches: !0,
      toElement: !0,
      touches: !0,
      which(a) {
        var b = a.button;
        return a.which == null && sa.test(a.type)
          ? a.charCode != null
            ? a.charCode
            : a.keyCode
          : !a.which && void 0 !== b && ta.test(a.type)
            ? 1 & b
              ? 1
              : 2 & b
                ? 3
                : 4 & b
                  ? 2
                  : 0
            : a.which;
      }
    },
    r.event.addProp
  ),
  r.each(
    {
      mouseenter: "mouseover",
      mouseleave: "mouseout",
      pointerenter: "pointerover",
      pointerleave: "pointerout"
    },
    function(a, b) {
      r.event.special[a] = {
        delegateType: b,
        bindType: b,
        handle(a) {
          var c;
          var d = this;
          var e = a.relatedTarget;
          var f = a.handleObj;
          return (
            (e && (e === d || r.contains(d, e))) ||
                ((a.type = f.origType),
                (c = f.handler.apply(this, arguments)),
                (a.type = b)),
            c
          );
        }
      };
    }
  ),
  r.fn.extend({
    on(a, b, c, d) {
      return ya(this, a, b, c, d);
    },
    one(a, b, c, d) {
      return ya(this, a, b, c, d, 1);
    },
    off(a, b, c) {
      var d, e;
      if (a && a.preventDefault && a.handleObj)
      { return (
        (d = a.handleObj),
        r(a.delegateTarget).off(
          d.namespace ? d.origType + "." + d.namespace : d.origType,
          d.selector,
          d.handler
        ),
        this
      ); }
      if (typeof a === "object") {
        for (e in a) this.off(e, b, a[e]);
        return this;
      }
      return (
        (b !== !1 && typeof b !== "function") || ((c = b), (b = void 0)),
        c === !1 && (c = wa),
        this.each(function() {
          r.event.remove(this, a, c, b);
        })
      );
    }
  });
  var za = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;
  var Aa = /<script|<style|<link/i;
  var Ba = /checked\s*(?:[^=]|=\s*.checked.)/i;
  var Ca = /^true\/(.*)/;
  var Da = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
  function Ea(a, b) {
    return B(a, "table") && B(b.nodeType !== 11 ? b : b.firstChild, "tr")
      ? r(">tbody", a)[0] || a
      : a;
  }
  function Fa(a) {
    return (a.type = (a.getAttribute("type") !== null) + "/" + a.type), a;
  }
  function Ga(a) {
    var b = Ca.exec(a.type);
    return b ? (a.type = b[1]) : a.removeAttribute("type"), a;
  }
  function Ha(a, b) {
    var c, d, e, f, g, h, i, j;
    if (b.nodeType === 1) {
      if (
        W.hasData(a) &&
        ((f = W.access(a)), (g = W.set(b, f)), (j = f.events))
      ) {
        delete g.handle, (g.events = {});
        for (e in j)
        { for (c = 0, d = j[e].length; c < d; c++) r.event.add(b, e, j[e][c]); }
      }
      X.hasData(a) && ((h = X.access(a)), (i = r.extend({}, h)), X.set(b, i));
    }
  }
  function Ia(a, b) {
    var c = b.nodeName.toLowerCase();
    c === "input" && ja.test(a.type)
      ? (b.checked = a.checked)
      : (c !== "input" && c !== "textarea") ||
        (b.defaultValue = a.defaultValue);
  }
  function Ja(a, b, c, d) {
    b = g.apply([], b);
    var e;
    var f;
    var h;
    var i;
    var j;
    var k;
    var l = 0;
    var m = a.length;
    var n = m - 1;
    var q = b[0];
    var s = r.isFunction(q);
    if (s || (m > 1 && typeof q === "string" && !o.checkClone && Ba.test(q)))
    { return a.each(function(e) {
      var f = a.eq(e);
      s && (b[0] = q.call(this, e, f.html())), Ja(f, b, c, d);
    }); }
    if (
      m &&
      ((e = qa(b, a[0].ownerDocument, !1, a, d)),
      (f = e.firstChild),
      e.childNodes.length === 1 && (e = f),
      f || d)
    ) {
      for (h = r.map(na(e, "script"), Fa), i = h.length; l < m; l++)
      { (j = e),
      l !== n &&
            ((j = r.clone(j, !0, !0)), i && r.merge(h, na(j, "script"))),
      c.call(a[l], j, l); }
      if (i)
      { for (k = h[h.length - 1].ownerDocument, r.map(h, Ga), l = 0; l < i; l++)
      { (j = h[l]),
      la.test(j.type || "") &&
              !W.access(j, "globalEval") &&
              r.contains(k, j) &&
              (j.src
                ? r._evalUrl && r._evalUrl(j.src)
                : p(j.textContent.replace(Da, ""), k)); } }
    }
    return a;
  }
  function Ka(a, b, c) {
    for (var d, e = b ? r.filter(b, a) : a, f = 0; (d = e[f]) != null; f++)
    { c || d.nodeType !== 1 || r.cleanData(na(d)),
    d.parentNode &&
          (c && r.contains(d.ownerDocument, d) && oa(na(d, "script")),
          d.parentNode.removeChild(d)); }
    return a;
  }
  r.extend({
    htmlPrefilter(a) {
      return a.replace(za, "<$1></$2>");
    },
    clone(a, b, c) {
      var d;
      var e;
      var f;
      var g;
      var h = a.cloneNode(!0);
      var i = r.contains(a.ownerDocument, a);
      if (
        !(
          o.noCloneChecked ||
          (a.nodeType !== 1 && a.nodeType !== 11) ||
          r.isXMLDoc(a)
        )
      )
      { for (g = na(h), f = na(a), d = 0, e = f.length; d < e; d++)
      { Ia(f[d], g[d]); } }
      if (b)
      { if (c)
      { for (f = f || na(a), g = g || na(h), d = 0, e = f.length; d < e; d++)
      { Ha(f[d], g[d]); } }
      else Ha(a, h); }
      return (
        (g = na(h, "script")), g.length > 0 && oa(g, !i && na(a, "script")), h
      );
    },
    cleanData(a) {
      for (var b, c, d, e = r.event.special, f = 0; void 0 !== (c = a[f]); f++)
      { if (U(c)) {
        if ((b = c[W.expando])) {
          if (b.events)
          { for (d in b.events)
          { e[d] ? r.event.remove(c, d) : r.removeEvent(c, d, b.handle); } }
          c[W.expando] = void 0;
        }
        c[X.expando] && (c[X.expando] = void 0);
      } }
    }
  }),
  r.fn.extend({
    detach(a) {
      return Ka(this, a, !0);
    },
    remove(a) {
      return Ka(this, a);
    },
    text(a) {
      return T(
        this,
        function(a) {
          return void 0 === a
            ? r.text(this)
            : this.empty().each(function() {
              (this.nodeType !== 1 &&
                    this.nodeType !== 11 &&
                    this.nodeType !== 9) ||
                    (this.textContent = a);
            });
        },
        null,
        a,
        arguments.length
      );
    },
    append() {
      return Ja(this, arguments, function(a) {
        if (
          this.nodeType === 1 ||
            this.nodeType === 11 ||
            this.nodeType === 9
        ) {
          var b = Ea(this, a);
          b.appendChild(a);
        }
      });
    },
    prepend() {
      return Ja(this, arguments, function(a) {
        if (
          this.nodeType === 1 ||
            this.nodeType === 11 ||
            this.nodeType === 9
        ) {
          var b = Ea(this, a);
          b.insertBefore(a, b.firstChild);
        }
      });
    },
    before() {
      return Ja(this, arguments, function(a) {
        this.parentNode && this.parentNode.insertBefore(a, this);
      });
    },
    after() {
      return Ja(this, arguments, function(a) {
        this.parentNode && this.parentNode.insertBefore(a, this.nextSibling);
      });
    },
    empty() {
      for (var a, b = 0; (a = this[b]) != null; b++)
      { a.nodeType === 1 && (r.cleanData(na(a, !1)), (a.textContent = "")); }
      return this;
    },
    clone(a, b) {
      return (
        (a = a != null && a),
        (b = b == null ? a : b),
        this.map(function() {
          return r.clone(this, a, b);
        })
      );
    },
    html(a) {
      return T(
        this,
        function(a) {
          var b = this[0] || {};
          var c = 0;
          var d = this.length;
          if (void 0 === a && b.nodeType === 1) return b.innerHTML;
          if (
            typeof a === "string" &&
              !Aa.test(a) &&
              !ma[(ka.exec(a) || ["", ""])[1].toLowerCase()]
          ) {
            a = r.htmlPrefilter(a);
            try {
              for (; c < d; c++)
              { (b = this[c] || {}),
              b.nodeType === 1 &&
                      (r.cleanData(na(b, !1)), (b.innerHTML = a)); }
              b = 0;
            } catch (e) {}
          }
          b && this.empty().append(a);
        },
        null,
        a,
        arguments.length
      );
    },
    replaceWith() {
      var a = [];
      return Ja(
        this,
        arguments,
        function(b) {
          var c = this.parentNode;
          r.inArray(this, a) < 0 &&
              (r.cleanData(na(this)), c && c.replaceChild(b, this));
        },
        a
      );
    }
  }),
  r.each(
    {
      appendTo: "append",
      prependTo: "prepend",
      insertBefore: "before",
      insertAfter: "after",
      replaceAll: "replaceWith"
    },
    function(a, b) {
      r.fn[a] = function(a) {
        for (var c, d = [], e = r(a), f = e.length - 1, g = 0; g <= f; g++)
        { (c = g === f ? this : this.clone(!0)),
        r(e[g])[b](c),
        h.apply(d, c.get()); }
        return this.pushStack(d);
      };
    }
  );
  var La = /^margin/;
  var Ma = new RegExp("^(" + aa + ")(?!px)[a-z%]+$", "i");
  var Na = function(b) {
    var c = b.ownerDocument.defaultView;
    return (c && c.opener) || (c = a), c.getComputedStyle(b);
  };
  !(function() {
    function b() {
      if (i) {
        (i.style.cssText =
          "box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%"),
        (i.innerHTML = ""),
        ra.appendChild(h);
        var b = a.getComputedStyle(i);
        (c = b.top !== "1%"),
        (g = b.marginLeft === "2px"),
        (e = b.width === "4px"),
        (i.style.marginRight = "50%"),
        (f = b.marginRight === "4px"),
        ra.removeChild(h),
        (i = null);
      }
    }
    var c;
    var e;
    var f;
    var g;
    var h = d.createElement("div");
    var i = d.createElement("div");
    i.style &&
      ((i.style.backgroundClip = "content-box"),
      (i.cloneNode(!0).style.backgroundClip = ""),
      (o.clearCloneStyle = i.style.backgroundClip === "content-box"),
      (h.style.cssText =
        "border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute"),
      h.appendChild(i),
      r.extend(o, {
        pixelPosition() {
          return b(), c;
        },
        boxSizingReliable() {
          return b(), e;
        },
        pixelMarginRight() {
          return b(), f;
        },
        reliableMarginLeft() {
          return b(), g;
        }
      }));
  })();
  function Oa(a, b, c) {
    var d;
    var e;
    var f;
    var g;
    var h = a.style;
    return (
      (c = c || Na(a)),
      c &&
        ((g = c.getPropertyValue(b) || c[b]),
        g !== "" || r.contains(a.ownerDocument, a) || (g = r.style(a, b)),
        !o.pixelMarginRight() &&
          Ma.test(g) &&
          La.test(b) &&
          ((d = h.width),
          (e = h.minWidth),
          (f = h.maxWidth),
          (h.minWidth = h.maxWidth = h.width = g),
          (g = c.width),
          (h.width = d),
          (h.minWidth = e),
          (h.maxWidth = f))),
      void 0 !== g ? g + "" : g
    );
  }
  function Pa(a, b) {
    return {
      get() {
        return a()
          ? void delete this.get
          : (this.get = b).apply(this, arguments);
      }
    };
  }
  var Qa = /^(none|table(?!-c[ea]).+)/;
  var Ra = /^--/;
  var Sa = { position: "absolute", visibility: "hidden", display: "block" };
  var Ta = { letterSpacing: "0", fontWeight: "400" };
  var Ua = ["Webkit", "Moz", "ms"];
  var Va = d.createElement("div").style;
  function Wa(a) {
    if (a in Va) return a;
    var b = a[0].toUpperCase() + a.slice(1);
    var c = Ua.length;
    while (c--) if (((a = Ua[c] + b), a in Va)) return a;
  }
  function Xa(a) {
    var b = r.cssProps[a];
    return b || (b = r.cssProps[a] = Wa(a) || a), b;
  }
  function Ya(a, b, c) {
    var d = ba.exec(b);
    return d ? Math.max(0, d[2] - (c || 0)) + (d[3] || "px") : b;
  }
  function Za(a, b, c, d, e) {
    var f;
    var g = 0;
    for (
      f = c === (d ? "border" : "content") ? 4 : b === "width" ? 1 : 0;
      f < 4;
      f += 2
    )
    { c === "margin" && (g += r.css(a, c + ca[f], !0, e)),
    d
      ? (c === "content" && (g -= r.css(a, "padding" + ca[f], !0, e)),
      c !== "margin" &&
              (g -= r.css(a, "border" + ca[f] + "Width", !0, e)))
      : ((g += r.css(a, "padding" + ca[f], !0, e)),
      c !== "padding" &&
              (g += r.css(a, "border" + ca[f] + "Width", !0, e))); }
    return g;
  }
  function $a(a, b, c) {
    var d;
    var e = Na(a);
    var f = Oa(a, b, e);
    var g = r.css(a, "boxSizing", !1, e) === "border-box";
    return Ma.test(f)
      ? f
      : ((d = g && (o.boxSizingReliable() || f === a.style[b])),
      f === "auto" && (f = a["offset" + b[0].toUpperCase() + b.slice(1)]),
      (f = parseFloat(f) || 0),
      f + Za(a, b, c || (g ? "border" : "content"), d, e) + "px");
  }
  r.extend({
    cssHooks: {
      opacity: {
        get(a, b) {
          if (b) {
            var c = Oa(a, "opacity");
            return c === "" ? "1" : c;
          }
        }
      }
    },
    cssNumber: {
      animationIterationCount: !0,
      columnCount: !0,
      fillOpacity: !0,
      flexGrow: !0,
      flexShrink: !0,
      fontWeight: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0
    },
    cssProps: { float: "cssFloat" },
    style(a, b, c, d) {
      if (a && a.nodeType !== 3 && a.nodeType !== 8 && a.style) {
        var e;
        var f;
        var g;
        var h = r.camelCase(b);
        var i = Ra.test(b);
        var j = a.style;
        return (
          i || (b = Xa(h)),
          (g = r.cssHooks[b] || r.cssHooks[h]),
          void 0 === c
            ? g && "get" in g && void 0 !== (e = g.get(a, !1, d))
              ? e
              : j[b]
            : ((f = typeof c),
            f === "string" &&
                (e = ba.exec(c)) &&
                e[1] &&
                ((c = fa(a, b, e)), (f = "number")),
            c != null &&
                c === c &&
                (f === "number" &&
                  (c += (e && e[3]) || (r.cssNumber[h] ? "" : "px")),
                o.clearCloneStyle ||
                  c !== "" ||
                  b.indexOf("background") !== 0 ||
                  (j[b] = "inherit"),
                (g && "set" in g && void 0 === (c = g.set(a, c, d))) ||
                  (i ? j.setProperty(b, c) : (j[b] = c))),
            void 0)
        );
      }
    },
    css(a, b, c, d) {
      var e;
      var f;
      var g;
      var h = r.camelCase(b);
      var i = Ra.test(b);
      return (
        i || (b = Xa(h)),
        (g = r.cssHooks[b] || r.cssHooks[h]),
        g && "get" in g && (e = g.get(a, !0, c)),
        void 0 === e && (e = Oa(a, b, d)),
        e === "normal" && b in Ta && (e = Ta[b]),
        c === "" || c
          ? ((f = parseFloat(e)), c === !0 || isFinite(f) ? f || 0 : e)
          : e
      );
    }
  }),
  r.each(["height", "width"], function(a, b) {
    r.cssHooks[b] = {
      get(a, c, d) {
        if (c)
        { return !Qa.test(r.css(a, "display")) ||
              (a.getClientRects().length && a.getBoundingClientRect().width)
          ? $a(a, b, d)
          : ea(a, Sa, function() {
            return $a(a, b, d);
          }); }
      },
      set(a, c, d) {
        var e;
        var f = d && Na(a);
        var g =
              d &&
              Za(a, b, d, r.css(a, "boxSizing", !1, f) === "border-box", f);
        return (
          g &&
              (e = ba.exec(c)) &&
              (e[3] || "px") !== "px" &&
              ((a.style[b] = c), (c = r.css(a, b))),
          Ya(a, c, g)
        );
      }
    };
  }),
  (r.cssHooks.marginLeft = Pa(o.reliableMarginLeft, function(a, b) {
    if (b)
    { return (
      (parseFloat(Oa(a, "marginLeft")) ||
            a.getBoundingClientRect().left -
              ea(a, { marginLeft: 0 }, function() {
                return a.getBoundingClientRect().left;
              })) + "px"
    ); }
  })),
  r.each({ margin: "", padding: "", border: "Width" }, function(a, b) {
    (r.cssHooks[a + b] = {
      expand(c) {
        for (
          var d = 0, e = {}, f = typeof c === "string" ? c.split(" ") : [c];
          d < 4;
          d++
        )
        { e[a + ca[d] + b] = f[d] || f[d - 2] || f[0]; }
        return e;
      }
    }),
    La.test(a) || (r.cssHooks[a + b].set = Ya);
  }),
  r.fn.extend({
    css(a, b) {
      return T(
        this,
        function(a, b, c) {
          var d;
          var e;
          var f = {};
          var g = 0;
          if (Array.isArray(b)) {
            for (d = Na(a), e = b.length; g < e; g++)
            { f[b[g]] = r.css(a, b[g], !1, d); }
            return f;
          }
          return void 0 !== c ? r.style(a, b, c) : r.css(a, b);
        },
        a,
        b,
        arguments.length > 1
      );
    }
  });
  function _a(a, b, c, d, e) {
    return new _a.prototype.init(a, b, c, d, e);
  }
  (r.Tween = _a),
  (_a.prototype = {
    constructor: _a,
    init(a, b, c, d, e, f) {
      (this.elem = a),
      (this.prop = c),
      (this.easing = e || r.easing._default),
      (this.options = b),
      (this.start = this.now = this.cur()),
      (this.end = d),
      (this.unit = f || (r.cssNumber[c] ? "" : "px"));
    },
    cur() {
      var a = _a.propHooks[this.prop];
      return a && a.get ? a.get(this) : _a.propHooks._default.get(this);
    },
    run(a) {
      var b;
      var c = _a.propHooks[this.prop];
      return (
        this.options.duration
          ? (this.pos = b = r.easing[this.easing](
            a,
            this.options.duration * a,
            0,
            1,
            this.options.duration
          ))
          : (this.pos = b = a),
        (this.now = (this.end - this.start) * b + this.start),
        this.options.step &&
            this.options.step.call(this.elem, this.now, this),
        c && c.set ? c.set(this) : _a.propHooks._default.set(this),
        this
      );
    }
  }),
  (_a.prototype.init.prototype = _a.prototype),
  (_a.propHooks = {
    _default: {
      get(a) {
        var b;
        return a.elem.nodeType !== 1 ||
            (a.elem[a.prop] != null && a.elem.style[a.prop] == null)
          ? a.elem[a.prop]
          : ((b = r.css(a.elem, a.prop, "")), b && b !== "auto" ? b : 0);
      },
      set(a) {
        r.fx.step[a.prop]
          ? r.fx.step[a.prop](a)
          : a.elem.nodeType !== 1 ||
              (a.elem.style[r.cssProps[a.prop]] == null && !r.cssHooks[a.prop])
            ? (a.elem[a.prop] = a.now)
            : r.style(a.elem, a.prop, a.now + a.unit);
      }
    }
  }),
  (_a.propHooks.scrollTop = _a.propHooks.scrollLeft = {
    set(a) {
      a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
    }
  }),
  (r.easing = {
    linear(a) {
      return a;
    },
    swing(a) {
      return 0.5 - Math.cos(a * Math.PI) / 2;
    },
    _default: "swing"
  }),
  (r.fx = _a.prototype.init),
  (r.fx.step = {});
  var ab;
  var bb;
  var cb = /^(?:toggle|show|hide)$/;
  var db = /queueHooks$/;
  function eb() {
    bb &&
      (d.hidden === !1 && a.requestAnimationFrame
        ? a.requestAnimationFrame(eb)
        : a.setTimeout(eb, r.fx.interval),
      r.fx.tick());
  }
  function fb() {
    return (
      a.setTimeout(function() {
        ab = void 0;
      }),
      (ab = r.now())
    );
  }
  function gb(a, b) {
    var c;
    var d = 0;
    var e = { height: a };
    for (b = b ? 1 : 0; d < 4; d += 2 - b)
    { (c = ca[d]), (e["margin" + c] = e["padding" + c] = a); }
    return b && (e.opacity = e.width = a), e;
  }
  function hb(a, b, c) {
    for (
      var d,
        e = (kb.tweeners[b] || []).concat(kb.tweeners["*"]),
        f = 0,
        g = e.length;
      f < g;
      f++
    )
    { if ((d = e[f].call(c, b, a))) return d; }
  }
  function ib(a, b, c) {
    var d;
    var e;
    var f;
    var g;
    var h;
    var i;
    var j;
    var k;
    var l = "width" in b || "height" in b;
    var m = this;
    var n = {};
    var o = a.style;
    var p = a.nodeType && da(a);
    var q = W.get(a, "fxshow");
    c.queue ||
      ((g = r._queueHooks(a, "fx")),
      g.unqueued == null &&
        ((g.unqueued = 0),
        (h = g.empty.fire),
        (g.empty.fire = function() {
          g.unqueued || h();
        })),
      g.unqueued++,
      m.always(function() {
        m.always(function() {
          g.unqueued--, r.queue(a, "fx").length || g.empty.fire();
        });
      }));
    for (d in b)
    { if (((e = b[d]), cb.test(e))) {
      if (
        (delete b[d], (f = f || e === "toggle"), e === (p ? "hide" : "show"))
      ) {
        if (e !== "show" || !q || void 0 === q[d]) continue;
        p = !0;
      }
      n[d] = (q && q[d]) || r.style(a, d);
    } }
    if (((i = !r.isEmptyObject(b)), i || !r.isEmptyObject(n))) {
      l &&
        a.nodeType === 1 &&
        ((c.overflow = [o.overflow, o.overflowX, o.overflowY]),
        (j = q && q.display),
        j == null && (j = W.get(a, "display")),
        (k = r.css(a, "display")),
        k === "none" &&
          (j
            ? (k = j)
            : (ia([a], !0),
            (j = a.style.display || j),
            (k = r.css(a, "display")),
            ia([a]))),
        (k === "inline" || (k === "inline-block" && j != null)) &&
          r.css(a, "float") === "none" &&
          (i ||
            (m.done(function() {
              o.display = j;
            }),
            j == null && ((k = o.display), (j = k === "none" ? "" : k))),
          (o.display = "inline-block"))),
      c.overflow &&
          ((o.overflow = "hidden"),
          m.always(function() {
            (o.overflow = c.overflow[0]),
            (o.overflowX = c.overflow[1]),
            (o.overflowY = c.overflow[2]);
          })),
      (i = !1);
      for (d in n)
      { i ||
          (q
            ? "hidden" in q && (p = q.hidden)
            : (q = W.access(a, "fxshow", { display: j })),
          f && (q.hidden = !p),
          p && ia([a], !0),
          m.done(function() {
            p || ia([a]), W.remove(a, "fxshow");
            for (d in n) r.style(a, d, n[d]);
          })),
      (i = hb(p ? q[d] : 0, d, m)),
      d in q || ((q[d] = i.start), p && ((i.end = i.start), (i.start = 0))); }
    }
  }
  function jb(a, b) {
    var c, d, e, f, g;
    for (c in a)
    { if (
      ((d = r.camelCase(c)),
      (e = b[d]),
      (f = a[c]),
      Array.isArray(f) && ((e = f[1]), (f = a[c] = f[0])),
      c !== d && ((a[d] = f), delete a[c]),
      (g = r.cssHooks[d]),
      g && "expand" in g)
    ) {
      (f = g.expand(f)), delete a[d];
      for (c in f) c in a || ((a[c] = f[c]), (b[c] = e));
    } else b[d] = e; }
  }
  function kb(a, b, c) {
    var d;
    var e;
    var f = 0;
    var g = kb.prefilters.length;
    var h = r.Deferred().always(function() {
      delete i.elem;
    });
    var i = function() {
      if (e) return !1;
      for (
        var b = ab || fb(),
          c = Math.max(0, j.startTime + j.duration - b),
          d = c / j.duration || 0,
          f = 1 - d,
          g = 0,
          i = j.tweens.length;
        g < i;
        g++
      )
      { j.tweens[g].run(f); }
      return (
        h.notifyWith(a, [j, f, c]),
        f < 1 && i
          ? c
          : (i || h.notifyWith(a, [j, 1, 0]), h.resolveWith(a, [j]), !1)
      );
    };
    var j = h.promise({
      elem: a,
      props: r.extend({}, b),
      opts: r.extend(!0, { specialEasing: {}, easing: r.easing._default }, c),
      originalProperties: b,
      originalOptions: c,
      startTime: ab || fb(),
      duration: c.duration,
      tweens: [],
      createTween(b, c) {
        var d = r.Tween(
          a,
          j.opts,
          b,
          c,
          j.opts.specialEasing[b] || j.opts.easing
        );
        return j.tweens.push(d), d;
      },
      stop(b) {
        var c = 0;
        var d = b ? j.tweens.length : 0;
        if (e) return this;
        for (e = !0; c < d; c++) j.tweens[c].run(1);
        return (
          b
            ? (h.notifyWith(a, [j, 1, 0]), h.resolveWith(a, [j, b]))
            : h.rejectWith(a, [j, b]),
          this
        );
      }
    });
    var k = j.props;
    for (jb(k, j.opts.specialEasing); f < g; f++)
    { if ((d = kb.prefilters[f].call(j, a, k, j.opts)))
    { return (
      r.isFunction(d.stop) &&
            (r._queueHooks(j.elem, j.opts.queue).stop = r.proxy(d.stop, d)),
      d
    ); } }
    return (
      r.map(k, hb, j),
      r.isFunction(j.opts.start) && j.opts.start.call(a, j),
      j
        .progress(j.opts.progress)
        .done(j.opts.done, j.opts.complete)
        .fail(j.opts.fail)
        .always(j.opts.always),
      r.fx.timer(r.extend(i, { elem: a, anim: j, queue: j.opts.queue })),
      j
    );
  }
  (r.Animation = r.extend(kb, {
    tweeners: {
      "*": [
        function(a, b) {
          var c = this.createTween(a, b);
          return fa(c.elem, a, ba.exec(b), c), c;
        }
      ]
    },
    tweener(a, b) {
      r.isFunction(a) ? ((b = a), (a = ["*"])) : (a = a.match(L));
      for (var c, d = 0, e = a.length; d < e; d++)
      { (c = a[d]),
      (kb.tweeners[c] = kb.tweeners[c] || []),
      kb.tweeners[c].unshift(b); }
    },
    prefilters: [ib],
    prefilter(a, b) {
      b ? kb.prefilters.unshift(a) : kb.prefilters.push(a);
    }
  })),
  (r.speed = function(a, b, c) {
    var d =
        a && typeof a === "object"
          ? r.extend({}, a)
          : {
            complete: c || (!c && b) || (r.isFunction(a) && a),
            duration: a,
            easing: (c && b) || (b && !r.isFunction(b) && b)
          };
    return (
      r.fx.off
        ? (d.duration = 0)
        : typeof d.duration !== "number" &&
            (d.duration in r.fx.speeds
              ? (d.duration = r.fx.speeds[d.duration])
              : (d.duration = r.fx.speeds._default)),
      (d.queue != null && d.queue !== !0) || (d.queue = "fx"),
      (d.old = d.complete),
      (d.complete = function() {
        r.isFunction(d.old) && d.old.call(this),
        d.queue && r.dequeue(this, d.queue);
      }),
      d
    );
  }),
  r.fn.extend({
    fadeTo(a, b, c, d) {
      return this.filter(da)
        .css("opacity", 0)
        .show()
        .end()
        .animate({ opacity: b }, a, c, d);
    },
    animate(a, b, c, d) {
      var e = r.isEmptyObject(a);
      var f = r.speed(b, c, d);
      var g = function() {
        var b = kb(this, r.extend({}, a), f);
        (e || W.get(this, "finish")) && b.stop(!0);
      };
      return (
        (g.finish = g),
        e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g)
      );
    },
    stop(a, b, c) {
      var d = function(a) {
        var b = a.stop;
        delete a.stop, b(c);
      };
      return (
        typeof a !== "string" && ((c = b), (b = a), (a = void 0)),
        b && a !== !1 && this.queue(a || "fx", []),
        this.each(function() {
          var b = !0;
          var e = a != null && a + "queueHooks";
          var f = r.timers;
          var g = W.get(this);
          if (e) g[e] && g[e].stop && d(g[e]);
          else for (e in g) g[e] && g[e].stop && db.test(e) && d(g[e]);
          for (e = f.length; e--;)
          { f[e].elem !== this ||
                (a != null && f[e].queue !== a) ||
                (f[e].anim.stop(c), (b = !1), f.splice(e, 1)); }
          (!b && c) || r.dequeue(this, a);
        })
      );
    },
    finish(a) {
      return (
        a !== !1 && (a = a || "fx"),
        this.each(function() {
          var b;
          var c = W.get(this);
          var d = c[a + "queue"];
          var e = c[a + "queueHooks"];
          var f = r.timers;
          var g = d ? d.length : 0;
          for (
            c.finish = !0,
            r.queue(this, a, []),
            e && e.stop && e.stop.call(this, !0),
            b = f.length;
            b--;

          )
          { f[b].elem === this &&
                f[b].queue === a &&
                (f[b].anim.stop(!0), f.splice(b, 1)); }
          for (b = 0; b < g; b++)
          { d[b] && d[b].finish && d[b].finish.call(this); }
          delete c.finish;
        })
      );
    }
  }),
  r.each(["toggle", "show", "hide"], function(a, b) {
    var c = r.fn[b];
    r.fn[b] = function(a, d, e) {
      return a == null || typeof a === "boolean"
        ? c.apply(this, arguments)
        : this.animate(gb(b, !0), a, d, e);
    };
  }),
  r.each(
    {
      slideDown: gb("show"),
      slideUp: gb("hide"),
      slideToggle: gb("toggle"),
      fadeIn: { opacity: "show" },
      fadeOut: { opacity: "hide" },
      fadeToggle: { opacity: "toggle" }
    },
    function(a, b) {
      r.fn[a] = function(a, c, d) {
        return this.animate(b, a, c, d);
      };
    }
  ),
  (r.timers = []),
  (r.fx.tick = function() {
    var a;
    var b = 0;
    var c = r.timers;
    for (ab = r.now(); b < c.length; b++)
    { (a = c[b]), a() || c[b] !== a || c.splice(b--, 1); }
    c.length || r.fx.stop(), (ab = void 0);
  }),
  (r.fx.timer = function(a) {
    r.timers.push(a), r.fx.start();
  }),
  (r.fx.interval = 13),
  (r.fx.start = function() {
    bb || ((bb = !0), eb());
  }),
  (r.fx.stop = function() {
    bb = null;
  }),
  (r.fx.speeds = { slow: 600, fast: 200, _default: 400 }),
  (r.fn.delay = function(b, c) {
    return (
      (b = r.fx ? r.fx.speeds[b] || b : b),
      (c = c || "fx"),
      this.queue(c, function(c, d) {
        var e = a.setTimeout(c, b);
        d.stop = function() {
          a.clearTimeout(e);
        };
      })
    );
  }),
  (function() {
    var a = d.createElement("input");
    var b = d.createElement("select");
    var c = b.appendChild(d.createElement("option"));
    (a.type = "checkbox"),
    (o.checkOn = a.value !== ""),
    (o.optSelected = c.selected),
    (a = d.createElement("input")),
    (a.value = "t"),
    (a.type = "radio"),
    (o.radioValue = a.value === "t");
  })();
  var lb;
  var mb = r.expr.attrHandle;
  r.fn.extend({
    attr(a, b) {
      return T(this, r.attr, a, b, arguments.length > 1);
    },
    removeAttr(a) {
      return this.each(function() {
        r.removeAttr(this, a);
      });
    }
  }),
  r.extend({
    attr(a, b, c) {
      var d;
      var e;
      var f = a.nodeType;
      if (f !== 3 && f !== 8 && f !== 2)
      { return typeof a.getAttribute === "undefined"
        ? r.prop(a, b, c)
        : ((f === 1 && r.isXMLDoc(a)) ||
                (e =
                  r.attrHooks[b.toLowerCase()] ||
                  (r.expr.match.bool.test(b) ? lb : void 0)),
        void 0 !== c
          ? c === null
            ? void r.removeAttr(a, b)
            : e && "set" in e && void 0 !== (d = e.set(a, c, b))
              ? d
              : (a.setAttribute(b, c + ""), c)
          : e && "get" in e && (d = e.get(a, b)) !== null
            ? d
            : ((d = r.find.attr(a, b)), d == null ? void 0 : d)); }
    },
    attrHooks: {
      type: {
        set(a, b) {
          if (!o.radioValue && b === "radio" && B(a, "input")) {
            var c = a.value;
            return a.setAttribute("type", b), c && (a.value = c), b;
          }
        }
      }
    },
    removeAttr(a, b) {
      var c;
      var d = 0;
      var e = b && b.match(L);
      if (e && a.nodeType === 1) while ((c = e[d++])) a.removeAttribute(c);
    }
  }),
  (lb = {
    set(a, b, c) {
      return b === !1 ? r.removeAttr(a, c) : a.setAttribute(c, c), c;
    }
  }),
  r.each(r.expr.match.bool.source.match(/\w+/g), function(a, b) {
    var c = mb[b] || r.find.attr;
    mb[b] = function(a, b, d) {
      var e;
      var f;
      var g = b.toLowerCase();
      return (
        d ||
            ((f = mb[g]),
            (mb[g] = e),
            (e = c(a, b, d) != null ? g : null),
            (mb[g] = f)),
        e
      );
    };
  });
  var nb = /^(?:input|select|textarea|button)$/i;
  var ob = /^(?:a|area)$/i;
  r.fn.extend({
    prop(a, b) {
      return T(this, r.prop, a, b, arguments.length > 1);
    },
    removeProp(a) {
      return this.each(function() {
        delete this[r.propFix[a] || a];
      });
    }
  }),
  r.extend({
    prop(a, b, c) {
      var d;
      var e;
      var f = a.nodeType;
      if (f !== 3 && f !== 8 && f !== 2)
      { return (
        (f === 1 && r.isXMLDoc(a)) ||
              ((b = r.propFix[b] || b), (e = r.propHooks[b])),
        void 0 !== c
          ? e && "set" in e && void 0 !== (d = e.set(a, c, b))
            ? d
            : (a[b] = c)
          : e && "get" in e && (d = e.get(a, b)) !== null
            ? d
            : a[b]
      ); }
    },
    propHooks: {
      tabIndex: {
        get(a) {
          var b = r.find.attr(a, "tabindex");
          return b
            ? parseInt(b, 10)
            : nb.test(a.nodeName) || (ob.test(a.nodeName) && a.href)
              ? 0
              : -1;
        }
      }
    },
    propFix: { for: "htmlFor", class: "className" }
  }),
  o.optSelected ||
      (r.propHooks.selected = {
        get(a) {
          var b = a.parentNode;
          return b && b.parentNode && b.parentNode.selectedIndex, null;
        },
        set(a) {
          var b = a.parentNode;
          b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex);
        }
      }),
  r.each(
    [
      "tabIndex",
      "readOnly",
      "maxLength",
      "cellSpacing",
      "cellPadding",
      "rowSpan",
      "colSpan",
      "useMap",
      "frameBorder",
      "contentEditable"
    ],
    function() {
      r.propFix[this.toLowerCase()] = this;
    }
  );
  function pb(a) {
    var b = a.match(L) || [];
    return b.join(" ");
  }
  function qb(a) {
    return (a.getAttribute && a.getAttribute("class")) || "";
  }
  r.fn.extend({
    addClass(a) {
      var b;
      var c;
      var d;
      var e;
      var f;
      var g;
      var h;
      var i = 0;
      if (r.isFunction(a))
      { return this.each(function(b) {
        r(this).addClass(a.call(this, b, qb(this)));
      }); }
      if (typeof a === "string" && a) {
        b = a.match(L) || [];
        while ((c = this[i++]))
        { if (((e = qb(c)), (d = c.nodeType === 1 && " " + pb(e) + " "))) {
          g = 0;
          while ((f = b[g++])) d.indexOf(" " + f + " ") < 0 && (d += f + " ");
          (h = pb(d)), e !== h && c.setAttribute("class", h);
        } }
      }
      return this;
    },
    removeClass(a) {
      var b;
      var c;
      var d;
      var e;
      var f;
      var g;
      var h;
      var i = 0;
      if (r.isFunction(a))
      { return this.each(function(b) {
        r(this).removeClass(a.call(this, b, qb(this)));
      }); }
      if (!arguments.length) return this.attr("class", "");
      if (typeof a === "string" && a) {
        b = a.match(L) || [];
        while ((c = this[i++]))
        { if (((e = qb(c)), (d = c.nodeType === 1 && " " + pb(e) + " "))) {
          g = 0;
          while ((f = b[g++]))
          { while (d.indexOf(" " + f + " ") > -1)
          { d = d.replace(" " + f + " ", " "); } }
          (h = pb(d)), e !== h && c.setAttribute("class", h);
        } }
      }
      return this;
    },
    toggleClass(a, b) {
      var c = typeof a;
      return typeof b === "boolean" && c === "string"
        ? b
          ? this.addClass(a)
          : this.removeClass(a)
        : r.isFunction(a)
          ? this.each(function(c) {
            r(this).toggleClass(a.call(this, c, qb(this), b), b);
          })
          : this.each(function() {
            var b, d, e, f;
            if (c === "string") {
              (d = 0), (e = r(this)), (f = a.match(L) || []);
              while ((b = f[d++]))
              { e.hasClass(b) ? e.removeClass(b) : e.addClass(b); }
            } else (void 0 !== a && c !== "boolean") || ((b = qb(this)), b && W.set(this, "__className__", b), this.setAttribute && this.setAttribute("class", b || a === !1 ? "" : W.get(this, "__className__") || ""));
          });
    },
    hasClass(a) {
      var b;
      var c;
      var d = 0;
      b = " " + a + " ";
      while ((c = this[d++]))
      { if (c.nodeType === 1 && (" " + pb(qb(c)) + " ").indexOf(b) > -1)
      { return !0; } }
      return !1;
    }
  });
  var rb = /\r/g;
  r.fn.extend({
    val(a) {
      var b;
      var c;
      var d;
      var e = this[0];
      {
        if (arguments.length)
        { return (
          (d = r.isFunction(a)),
          this.each(function(c) {
            var e;
            this.nodeType === 1 &&
                ((e = d ? a.call(this, c, r(this).val()) : a),
                e == null
                  ? (e = "")
                  : typeof e === "number"
                    ? (e += "")
                    : Array.isArray(e) &&
                    (e = r.map(e, function(a) {
                      return a == null ? "" : a + "";
                    })),
                (b =
                  r.valHooks[this.type] ||
                  r.valHooks[this.nodeName.toLowerCase()]),
                (b && "set" in b && void 0 !== b.set(this, e, "value")) ||
                  (this.value = e));
          })
        ); }
        if (e)
        { return (
          (b = r.valHooks[e.type] || r.valHooks[e.nodeName.toLowerCase()]),
          b && "get" in b && void 0 !== (c = b.get(e, "value"))
            ? c
            : ((c = e.value),
            typeof c === "string" ? c.replace(rb, "") : c == null ? "" : c)
        ); }
      }
    }
  }),
  r.extend({
    valHooks: {
      option: {
        get(a) {
          var b = r.find.attr(a, "value");
          return b != null ? b : pb(r.text(a));
        }
      },
      select: {
        get(a) {
          var b;
          var c;
          var d;
          var e = a.options;
          var f = a.selectedIndex;
          var g = a.type === "select-one";
          var h = g ? null : [];
          var i = g ? f + 1 : e.length;
          for (d = f < 0 ? i : g ? f : 0; d < i; d++)
          { if (
            ((c = e[d]),
            (c.selected || d === f) &&
                  !c.disabled &&
                  (!c.parentNode.disabled || !B(c.parentNode, "optgroup")))
          ) {
            if (((b = r(c).val()), g)) return b;
            h.push(b);
          } }
          return h;
        },
        set(a, b) {
          var c;
          var d;
          var e = a.options;
          var f = r.makeArray(b);
          var g = e.length;
          while (g--)
          { (d = e[g]),
          (d.selected = r.inArray(r.valHooks.option.get(d), f) > -1) &&
                  (c = !0); }
          return c || (a.selectedIndex = -1), f;
        }
      }
    }
  }),
  r.each(["radio", "checkbox"], function() {
    (r.valHooks[this] = {
      set(a, b) {
        if (Array.isArray(b))
        { return (a.checked = r.inArray(r(a).val(), b) > -1); }
      }
    }),
    o.checkOn ||
          (r.valHooks[this].get = function(a) {
            return a.getAttribute("value") === null ? "on" : a.value;
          });
  });
  var sb = /^(?:focusinfocus|focusoutblur)$/;
  r.extend(r.event, {
    trigger(b, c, e, f) {
      var g;
      var h;
      var i;
      var j;
      var k;
      var m;
      var n;
      var o = [e || d];
      var p = l.call(b, "type") ? b.type : b;
      var q = l.call(b, "namespace") ? b.namespace.split(".") : [];
      if (
        ((h = i = e = e || d),
        e.nodeType !== 3 &&
          e.nodeType !== 8 &&
          !sb.test(p + r.event.triggered) &&
          (p.indexOf(".") > -1 &&
            ((q = p.split(".")), (p = q.shift()), q.sort()),
          (k = p.indexOf(":") < 0 && "on" + p),
          (b = b[r.expando] ? b : new r.Event(p, typeof b === "object" && b)),
          (b.isTrigger = f ? 2 : 3),
          (b.namespace = q.join(".")),
          (b.rnamespace = b.namespace
            ? new RegExp("(^|\\.)" + q.join("\\.(?:.*\\.|)") + "(\\.|$)")
            : null),
          (b.result = void 0),
          b.target || (b.target = e),
          (c = c == null ? [b] : r.makeArray(c, [b])),
          (n = r.event.special[p] || {}),
          f || !n.trigger || n.trigger.apply(e, c) !== !1))
      ) {
        if (!f && !n.noBubble && !r.isWindow(e)) {
          for (
            j = n.delegateType || p, sb.test(j + p) || (h = h.parentNode);
            h;
            h = h.parentNode
          )
          { o.push(h), (i = h); }
          i === (e.ownerDocument || d) &&
            o.push(i.defaultView || i.parentWindow || a);
        }
        g = 0;
        while ((h = o[g++]) && !b.isPropagationStopped())
        { (b.type = g > 1 ? j : n.bindType || p),
        (m = (W.get(h, "events") || {})[b.type] && W.get(h, "handle")),
        m && m.apply(h, c),
        (m = k && h[k]),
        m &&
              m.apply &&
              U(h) &&
              ((b.result = m.apply(h, c)),
              b.result === !1 && b.preventDefault()); }
        return (
          (b.type = p),
          f ||
            b.isDefaultPrevented() ||
            (n._default && n._default.apply(o.pop(), c) !== !1) ||
            !U(e) ||
            (k &&
              r.isFunction(e[p]) &&
              !r.isWindow(e) &&
              ((i = e[k]),
              i && (e[k] = null),
              (r.event.triggered = p),
              e[p](),
              (r.event.triggered = void 0),
              i && (e[k] = i))),
          b.result
        );
      }
    },
    simulate(a, b, c) {
      var d = r.extend(new r.Event(), c, { type: a, isSimulated: !0 });
      r.event.trigger(d, null, b);
    }
  }),
  r.fn.extend({
    trigger(a, b) {
      return this.each(function() {
        r.event.trigger(a, b, this);
      });
    },
    triggerHandler(a, b) {
      var c = this[0];
      if (c) return r.event.trigger(a, b, c, !0);
    }
  }),
  r.each(
    "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(
      " "
    ),
    function(a, b) {
      r.fn[b] = function(a, c) {
        return arguments.length > 0
          ? this.on(b, null, a, c)
          : this.trigger(b);
      };
    }
  ),
  r.fn.extend({
    hover(a, b) {
      return this.mouseenter(a).mouseleave(b || a);
    }
  }),
  (o.focusin = "onfocusin" in a),
  o.focusin ||
      r.each({ focus: "focusin", blur: "focusout" }, function(a, b) {
        var c = function(a) {
          r.event.simulate(b, a.target, r.event.fix(a));
        };
        r.event.special[b] = {
          setup() {
            var d = this.ownerDocument || this;
            var e = W.access(d, b);
            e || d.addEventListener(a, c, !0), W.access(d, b, (e || 0) + 1);
          },
          teardown() {
            var d = this.ownerDocument || this;
            var e = W.access(d, b) - 1;
            e
              ? W.access(d, b, e)
              : (d.removeEventListener(a, c, !0), W.remove(d, b));
          }
        };
      });
  var tb = a.location;
  var ub = r.now();
  var vb = /\?/;
  r.parseXML = function(b) {
    var c;
    if (!b || typeof b !== "string") return null;
    try {
      c = new a.DOMParser().parseFromString(b, "text/xml");
    } catch (d) {
      c = void 0;
    }
    return (
      (c && !c.getElementsByTagName("parsererror").length) ||
        r.error("Invalid XML: " + b),
      c
    );
  };
  var wb = /\[\]$/;
  var xb = /\r?\n/g;
  var yb = /^(?:submit|button|image|reset|file)$/i;
  var zb = /^(?:input|select|textarea|keygen)/i;
  function Ab(a, b, c, d) {
    var e;
    if (Array.isArray(b))
    { r.each(b, function(b, e) {
      c || wb.test(a)
        ? d(a, e)
        : Ab(
          a + "[" + (typeof e === "object" && e != null ? b : "") + "]",
          e,
          c,
          d
        );
    }); }
    else if (c || r.type(b) !== "object") d(a, b);
    else for (e in b) Ab(a + "[" + e + "]", b[e], c, d);
  }
  (r.param = function(a, b) {
    var c;
    var d = [];
    var e = function(a, b) {
      var c = r.isFunction(b) ? b() : b;
      d[d.length] =
          encodeURIComponent(a) + "=" + encodeURIComponent(c == null ? "" : c);
    };
    if (Array.isArray(a) || (a.jquery && !r.isPlainObject(a)))
    { r.each(a, function() {
      e(this.name, this.value);
    }); }
    else for (c in a) Ab(c, a[c], b, e);
    return d.join("&");
  }),
  r.fn.extend({
    serialize() {
      return r.param(this.serializeArray());
    },
    serializeArray() {
      return this.map(function() {
        var a = r.prop(this, "elements");
        return a ? r.makeArray(a) : this;
      })
        .filter(function() {
          var a = this.type;
          return (
            this.name &&
              !r(this).is(":disabled") &&
              zb.test(this.nodeName) &&
              !yb.test(a) &&
              (this.checked || !ja.test(a))
          );
        })
        .map(function(a, b) {
          var c = r(this).val();
          return c == null
            ? null
            : Array.isArray(c)
              ? r.map(c, function(a) {
                return { name: b.name, value: a.replace(xb, "\r\n") };
              })
              : { name: b.name, value: c.replace(xb, "\r\n") };
        })
        .get();
    }
  });
  var Bb = /%20/g;
  var Cb = /#.*$/;
  var Db = /([?&])_=[^&]*/;
  var Eb = /^(.*?):[ \t]*([^\r\n]*)$/gm;
  var Fb = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;
  var Gb = /^(?:GET|HEAD)$/;
  var Hb = /^\/\//;
  var Ib = {};
  var Jb = {};
  var Kb = "*/".concat("*");
  var Lb = d.createElement("a");
  Lb.href = tb.href;
  function Mb(a) {
    return function(b, c) {
      typeof b !== "string" && ((c = b), (b = "*"));
      var d;
      var e = 0;
      var f = b.toLowerCase().match(L) || [];
      if (r.isFunction(c))
      { while ((d = f[e++]))
      { d[0] === "+"
        ? ((d = d.slice(1) || "*"), (a[d] = a[d] || []).unshift(c))
        : (a[d] = a[d] || []).push(c); } }
    };
  }
  function Nb(a, b, c, d) {
    var e = {};
    var f = a === Jb;
    function g(h) {
      var i;
      return (
        (e[h] = !0),
        r.each(a[h] || [], function(a, h) {
          var j = h(b, c, d);
          return typeof j !== "string" || f || e[j]
            ? f
              ? !(i = j)
              : void 0
            : (b.dataTypes.unshift(j), g(j), !1);
        }),
        i
      );
    }
    return g(b.dataTypes[0]) || (!e["*"] && g("*"));
  }
  function Ob(a, b) {
    var c;
    var d;
    var e = r.ajaxSettings.flatOptions || {};
    for (c in b) void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]);
    return d && r.extend(!0, a, d), a;
  }
  function Pb(a, b, c) {
    var d;
    var e;
    var f;
    var g;
    var h = a.contents;
    var i = a.dataTypes;
    while (i[0] === "*")
    { i.shift(),
    void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type")); }
    if (d)
    { for (e in h)
    { if (h[e] && h[e].test(d)) {
      i.unshift(e);
      break;
    } } }
    if (i[0] in c) f = i[0];
    else {
      for (e in c) {
        if (!i[0] || a.converters[e + " " + i[0]]) {
          f = e;
          break;
        }
        g || (g = e);
      }
      f = f || g;
    }
    if (f) return f !== i[0] && i.unshift(f), c[f];
  }
  function Qb(a, b, c, d) {
    var e;
    var f;
    var g;
    var h;
    var i;
    var j = {};
    var k = a.dataTypes.slice();
    if (k[1]) for (g in a.converters) j[g.toLowerCase()] = a.converters[g];
    f = k.shift();
    while (f)
    { if (
      (a.responseFields[f] && (c[a.responseFields[f]] = b),
      !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)),
      (i = f),
      (f = k.shift()))
    )
    { if (f === "*") f = i;
    else if (i !== "*" && i !== f) {
      if (((g = j[i + " " + f] || j["* " + f]), !g))
      { for (e in j)
      { if (
        ((h = e.split(" ")),
        h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]]))
      ) {
        g === !0
          ? (g = j[e])
          : j[e] !== !0 && ((f = h[0]), k.unshift(h[1]));
        break;
      } } }
      if (g !== !0)
      { if (g && a.throws) b = g(b);
      else
      { try {
        b = g(b);
      } catch (l) {
        return {
          state: "parsererror",
          error: g ? l : "No conversion from " + i + " to " + f
        };
      } } }
    } } }
    return { state: "success", data: b };
  }
  r.extend({
    active: 0,
    lastModified: {},
    etag: {},
    ajaxSettings: {
      url: tb.href,
      type: "GET",
      isLocal: Fb.test(tb.protocol),
      global: !0,
      processData: !0,
      async: !0,
      contentType: "application/x-www-form-urlencoded; charset=UTF-8",
      accepts: {
        "*": Kb,
        text: "text/plain",
        html: "text/html",
        xml: "application/xml, text/xml",
        json: "application/json, text/javascript"
      },
      contents: { xml: /\bxml\b/, html: /\bhtml/, json: /\bjson\b/ },
      responseFields: {
        xml: "responseXML",
        text: "responseText",
        json: "responseJSON"
      },
      converters: {
        "* text": String,
        "text html": !0,
        "text json": JSON.parse,
        "text xml": r.parseXML
      },
      flatOptions: { url: !0, context: !0 }
    },
    ajaxSetup(a, b) {
      return b ? Ob(Ob(a, r.ajaxSettings), b) : Ob(r.ajaxSettings, a);
    },
    ajaxPrefilter: Mb(Ib),
    ajaxTransport: Mb(Jb),
    ajax(b, c) {
      typeof b === "object" && ((c = b), (b = void 0)), (c = c || {});
      var e;
      var f;
      var g;
      var h;
      var i;
      var j;
      var k;
      var l;
      var m;
      var n;
      var o = r.ajaxSetup({}, c);
      var p = o.context || o;
      var q = o.context && (p.nodeType || p.jquery) ? r(p) : r.event;
      var s = r.Deferred();
      var t = r.Callbacks("once memory");
      var u = o.statusCode || {};
      var v = {};
      var w = {};
      var x = "canceled";
      var y = {
        readyState: 0,
        getResponseHeader(a) {
          var b;
          if (k) {
            if (!h) {
              h = {};
              while ((b = Eb.exec(g))) h[b[1].toLowerCase()] = b[2];
            }
            b = h[a.toLowerCase()];
          }
          return b == null ? null : b;
        },
        getAllResponseHeaders() {
          return k ? g : null;
        },
        setRequestHeader(a, b) {
          return (
            k == null &&
                ((a = w[a.toLowerCase()] = w[a.toLowerCase()] || a),
                (v[a] = b)),
            this
          );
        },
        overrideMimeType(a) {
          return k == null && (o.mimeType = a), this;
        },
        statusCode(a) {
          var b;
          if (a)
          { if (k) y.always(a[y.status]);
          else for (b in a) u[b] = [u[b], a[b]]; }
          return this;
        },
        abort(a) {
          var b = a || x;
          return e && e.abort(b), A(0, b), this;
        }
      };
      if (
        (s.promise(y),
        (o.url = ((b || o.url || tb.href) + "").replace(
          Hb,
          tb.protocol + "//"
        )),
        (o.type = c.method || c.type || o.method || o.type),
        (o.dataTypes = (o.dataType || "*").toLowerCase().match(L) || [""]),
        o.crossDomain == null)
      ) {
        j = d.createElement("a");
        try {
          (j.href = o.url),
          (j.href = j.href),
          (o.crossDomain =
              Lb.protocol + "//" + Lb.host != j.protocol + "//" + j.host);
        } catch (z) {
          o.crossDomain = !0;
        }
      }
      if (
        (o.data &&
          o.processData &&
          typeof o.data !== "string" &&
          (o.data = r.param(o.data, o.traditional)),
        Nb(Ib, o, c, y),
        k)
      )
      { return y; }
      (l = r.event && o.global),
      l && r.active++ === 0 && r.event.trigger("ajaxStart"),
      (o.type = o.type.toUpperCase()),
      (o.hasContent = !Gb.test(o.type)),
      (f = o.url.replace(Cb, "")),
      o.hasContent
        ? o.data &&
            o.processData &&
            (o.contentType || "").indexOf(
              "application/x-www-form-urlencoded"
            ) ===
              0 &&
            (o.data = o.data.replace(Bb, "+"))
        : ((n = o.url.slice(f.length)),
        o.data && ((f += (vb.test(f) ? "&" : "?") + o.data), delete o.data),
        o.cache === !1 &&
              ((f = f.replace(Db, "$1")),
              (n = (vb.test(f) ? "&" : "?") + "_=" + ub++ + n)),
        (o.url = f + n)),
      o.ifModified &&
          (r.lastModified[f] &&
            y.setRequestHeader("If-Modified-Since", r.lastModified[f]),
          r.etag[f] && y.setRequestHeader("If-None-Match", r.etag[f])),
      ((o.data && o.hasContent && o.contentType !== !1) || c.contentType) &&
          y.setRequestHeader("Content-Type", o.contentType),
      y.setRequestHeader(
        "Accept",
        o.dataTypes[0] && o.accepts[o.dataTypes[0]]
          ? o.accepts[o.dataTypes[0]] +
                (o.dataTypes[0] !== "*" ? ", " + Kb + "; q=0.01" : "")
          : o.accepts["*"]
      );
      for (m in o.headers) y.setRequestHeader(m, o.headers[m]);
      if (o.beforeSend && (o.beforeSend.call(p, y, o) === !1 || k))
      { return y.abort(); }
      if (
        ((x = "abort"),
        t.add(o.complete),
        y.done(o.success),
        y.fail(o.error),
        (e = Nb(Jb, o, c, y)))
      ) {
        if (((y.readyState = 1), l && q.trigger("ajaxSend", [y, o]), k))
        { return y; }
        o.async &&
          o.timeout > 0 &&
          (i = a.setTimeout(function() {
            y.abort("timeout");
          }, o.timeout));
        try {
          (k = !1), e.send(v, A);
        } catch (z) {
          if (k) throw z;
          A(-1, z);
        }
      } else A(-1, "No Transport");
      function A(b, c, d, h) {
        var j;
        var m;
        var n;
        var v;
        var w;
        var x = c;
        k ||
          ((k = !0),
          i && a.clearTimeout(i),
          (e = void 0),
          (g = h || ""),
          (y.readyState = b > 0 ? 4 : 0),
          (j = (b >= 200 && b < 300) || b === 304),
          d && (v = Pb(o, y, d)),
          (v = Qb(o, v, y, j)),
          j
            ? (o.ifModified &&
                ((w = y.getResponseHeader("Last-Modified")),
                w && (r.lastModified[f] = w),
                (w = y.getResponseHeader("etag")),
                w && (r.etag[f] = w)),
            b === 204 || o.type === "HEAD"
              ? (x = "nocontent")
              : b === 304
                ? (x = "notmodified")
                : ((x = v.state), (m = v.data), (n = v.error), (j = !n)))
            : ((n = x), (!b && x) || ((x = "error"), b < 0 && (b = 0))),
          (y.status = b),
          (y.statusText = (c || x) + ""),
          j ? s.resolveWith(p, [m, x, y]) : s.rejectWith(p, [y, x, n]),
          y.statusCode(u),
          (u = void 0),
          l && q.trigger(j ? "ajaxSuccess" : "ajaxError", [y, o, j ? m : n]),
          t.fireWith(p, [y, x]),
          l &&
            (q.trigger("ajaxComplete", [y, o]),
            --r.active || r.event.trigger("ajaxStop")));
      }
      return y;
    },
    getJSON(a, b, c) {
      return r.get(a, b, c, "json");
    },
    getScript(a, b) {
      return r.get(a, void 0, b, "script");
    }
  }),
  r.each(["get", "post"], function(a, b) {
    r[b] = function(a, c, d, e) {
      return (
        r.isFunction(c) && ((e = e || d), (d = c), (c = void 0)),
        r.ajax(
          r.extend(
            { url: a, type: b, dataType: e, data: c, success: d },
            r.isPlainObject(a) && a
          )
        )
      );
    };
  }),
  (r._evalUrl = function(a) {
    return r.ajax({
      url: a,
      type: "GET",
      dataType: "script",
      cache: !0,
      async: !1,
      global: !1,
      throws: !0
    });
  }),
  r.fn.extend({
    wrapAll(a) {
      var b;
      return (
        this[0] &&
            (r.isFunction(a) && (a = a.call(this[0])),
            (b = r(a, this[0].ownerDocument)
              .eq(0)
              .clone(!0)),
            this[0].parentNode && b.insertBefore(this[0]),
            b
              .map(function() {
                var a = this;
                while (a.firstElementChild) a = a.firstElementChild;
                return a;
              })
              .append(this)),
        this
      );
    },
    wrapInner(a) {
      return r.isFunction(a)
        ? this.each(function(b) {
          r(this).wrapInner(a.call(this, b));
        })
        : this.each(function() {
          var b = r(this);
          var c = b.contents();
          c.length ? c.wrapAll(a) : b.append(a);
        });
    },
    wrap(a) {
      var b = r.isFunction(a);
      return this.each(function(c) {
        r(this).wrapAll(b ? a.call(this, c) : a);
      });
    },
    unwrap(a) {
      return (
        this.parent(a)
          .not("body")
          .each(function() {
            r(this).replaceWith(this.childNodes);
          }),
        this
      );
    }
  }),
  (r.expr.pseudos.hidden = function(a) {
    return !r.expr.pseudos.visible(a);
  }),
  (r.expr.pseudos.visible = function(a) {
    return !!(a.offsetWidth || a.offsetHeight || a.getClientRects().length);
  }),
  (r.ajaxSettings.xhr = function() {
    try {
      return new a.XMLHttpRequest();
    } catch (b) {}
  });
  var Rb = { 0: 200, 1223: 204 };
  var Sb = r.ajaxSettings.xhr();
  (o.cors = !!Sb && "withCredentials" in Sb),
  (o.ajax = Sb = !!Sb),
  r.ajaxTransport(function(b) {
    var c, d;
    if (o.cors || (Sb && !b.crossDomain))
    { return {
      send(e, f) {
        var g;
        var h = b.xhr();
        if (
          (h.open(b.type, b.url, b.async, b.username, b.password),
          b.xhrFields)
        )
        { for (g in b.xhrFields) h[g] = b.xhrFields[g]; }
        b.mimeType && h.overrideMimeType && h.overrideMimeType(b.mimeType),
        b.crossDomain ||
                e["X-Requested-With"] ||
                (e["X-Requested-With"] = "XMLHttpRequest");
        for (g in e) h.setRequestHeader(g, e[g]);
        (c = function(a) {
          return function() {
            c &&
                  ((c = d = h.onload = h.onerror = h.onabort = h.onreadystatechange = null),
                  a === "abort"
                    ? h.abort()
                    : a === "error"
                      ? typeof h.status !== "number"
                        ? f(0, "error")
                        : f(h.status, h.statusText)
                      : f(
                        Rb[h.status] || h.status,
                        h.statusText,
                        (h.responseType || "text") !== "text" ||
                          typeof h.responseText !== "string"
                          ? { binary: h.response }
                          : { text: h.responseText },
                        h.getAllResponseHeaders()
                      ));
          };
        }),
        (h.onload = c()),
        (d = h.onerror = c("error")),
        void 0 !== h.onabort
          ? (h.onabort = d)
          : (h.onreadystatechange = function() {
            h.readyState === 4 &&
                      a.setTimeout(function() {
                        c && d();
                      });
          }),
        (c = c("abort"));
        try {
          h.send((b.hasContent && b.data) || null);
        } catch (i) {
          if (c) throw i;
        }
      },
      abort() {
        c && c();
      }
    }; }
  }),
  r.ajaxPrefilter(function(a) {
    a.crossDomain && (a.contents.script = !1);
  }),
  r.ajaxSetup({
    accepts: {
      script:
          "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
    },
    contents: { script: /\b(?:java|ecma)script\b/ },
    converters: {
      "text script": function(a) {
        return r.globalEval(a), a;
      }
    }
  }),
  r.ajaxPrefilter("script", function(a) {
    void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET");
  }),
  r.ajaxTransport("script", function(a) {
    if (a.crossDomain) {
      var b, c;
      return {
        send(e, f) {
          (b = r("<script>")
            .prop({ charset: a.scriptCharset, src: a.url })
            .on(
              "load error",
              (c = function(a) {
                b.remove(),
                (c = null),
                a && f(a.type === "error" ? 404 : 200, a.type);
              })
            )),
          d.head.appendChild(b[0]);
        },
        abort() {
          c && c();
        }
      };
    }
  });
  var Tb = [];
  var Ub = /(=)\?(?=&|$)|\?\?/;
  r.ajaxSetup({
    jsonp: "callback",
    jsonpCallback() {
      var a = Tb.pop() || r.expando + "_" + ub++;
      return (this[a] = !0), a;
    }
  }),
  r.ajaxPrefilter("json jsonp", function(b, c, d) {
    var e;
    var f;
    var g;
    var h =
          b.jsonp !== !1 &&
          (Ub.test(b.url)
            ? "url"
            : typeof b.data === "string" &&
              (b.contentType || "").indexOf(
                "application/x-www-form-urlencoded"
              ) ===
                0 &&
              Ub.test(b.data) &&
              "data");
    if (h || b.dataTypes[0] === "jsonp")
    { return (
      (e = b.jsonpCallback = r.isFunction(b.jsonpCallback)
        ? b.jsonpCallback()
        : b.jsonpCallback),
      h
        ? (b[h] = b[h].replace(Ub, "$1" + e))
        : b.jsonp !== !1 &&
              (b.url += (vb.test(b.url) ? "&" : "?") + b.jsonp + "=" + e),
      (b.converters["script json"] = function() {
        return g || r.error(e + " was not called"), g[0];
      }),
      (b.dataTypes[0] = "json"),
      (f = a[e]),
      (a[e] = function() {
        g = arguments;
      }),
      d.always(function() {
        void 0 === f ? r(a).removeProp(e) : (a[e] = f),
        b[e] && ((b.jsonpCallback = c.jsonpCallback), Tb.push(e)),
        g && r.isFunction(f) && f(g[0]),
        (g = f = void 0);
      }),
      "script"
    ); }
  }),
  (o.createHTMLDocument = (function() {
    var a = d.implementation.createHTMLDocument("").body;
    return (
      (a.innerHTML = "<form></form><form></form>"), a.childNodes.length === 2
    );
  })()),
  (r.parseHTML = function(a, b, c) {
    if (typeof a !== "string") return [];
    typeof b === "boolean" && ((c = b), (b = !1));
    var e, f, g;
    return (
      b ||
          (o.createHTMLDocument
            ? ((b = d.implementation.createHTMLDocument("")),
            (e = b.createElement("base")),
            (e.href = d.location.href),
            b.head.appendChild(e))
            : (b = d)),
      (f = C.exec(a)),
      (g = !c && []),
      f
        ? [b.createElement(f[1])]
        : ((f = qa([a], b, g)),
        g && g.length && r(g).remove(),
        r.merge([], f.childNodes))
    );
  }),
  (r.fn.load = function(a, b, c) {
    var d;
    var e;
    var f;
    var g = this;
    var h = a.indexOf(" ");
    return (
      h > -1 && ((d = pb(a.slice(h))), (a = a.slice(0, h))),
      r.isFunction(b)
        ? ((c = b), (b = void 0))
        : b && typeof b === "object" && (e = "POST"),
      g.length > 0 &&
          r
            .ajax({ url: a, type: e || "GET", dataType: "html", data: b })
            .done(function(a) {
              (f = arguments),
              g.html(
                d
                  ? r("<div>")
                    .append(r.parseHTML(a))
                    .find(d)
                  : a
              );
            })
            .always(
              c &&
                function(a, b) {
                  g.each(function() {
                    c.apply(this, f || [a.responseText, b, a]);
                  });
                }
            ),
      this
    );
  }),
  r.each(
    [
      "ajaxStart",
      "ajaxStop",
      "ajaxComplete",
      "ajaxError",
      "ajaxSuccess",
      "ajaxSend"
    ],
    function(a, b) {
      r.fn[b] = function(a) {
        return this.on(b, a);
      };
    }
  ),
  (r.expr.pseudos.animated = function(a) {
    return r.grep(r.timers, function(b) {
      return a === b.elem;
    }).length;
  }),
  (r.offset = {
    setOffset(a, b, c) {
      var d;
      var e;
      var f;
      var g;
      var h;
      var i;
      var j;
      var k = r.css(a, "position");
      var l = r(a);
      var m = {};
      k === "static" && (a.style.position = "relative"),
      (h = l.offset()),
      (f = r.css(a, "top")),
      (i = r.css(a, "left")),
      (j =
            (k === "absolute" || k === "fixed") &&
            (f + i).indexOf("auto") > -1),
      j
        ? ((d = l.position()), (g = d.top), (e = d.left))
        : ((g = parseFloat(f) || 0), (e = parseFloat(i) || 0)),
      r.isFunction(b) && (b = b.call(a, c, r.extend({}, h))),
      b.top != null && (m.top = b.top - h.top + g),
      b.left != null && (m.left = b.left - h.left + e),
      "using" in b ? b.using.call(a, m) : l.css(m);
    }
  }),
  r.fn.extend({
    offset(a) {
      if (arguments.length)
      { return void 0 === a
        ? this
        : this.each(function(b) {
          r.offset.setOffset(this, a, b);
        }); }
      var b;
      var c;
      var d;
      var e;
      var f = this[0];
      if (f)
      { return f.getClientRects().length
        ? ((d = f.getBoundingClientRect()),
        (b = f.ownerDocument),
        (c = b.documentElement),
        (e = b.defaultView),
        {
          top: d.top + e.pageYOffset - c.clientTop,
          left: d.left + e.pageXOffset - c.clientLeft
        })
        : { top: 0, left: 0 }; }
    },
    position() {
      if (this[0]) {
        var a;
        var b;
        var c = this[0];
        var d = { top: 0, left: 0 };
        return (
          r.css(c, "position") === "fixed"
            ? (b = c.getBoundingClientRect())
            : ((a = this.offsetParent()),
            (b = this.offset()),
            B(a[0], "html") || (d = a.offset()),
            (d = {
              top: d.top + r.css(a[0], "borderTopWidth", !0),
              left: d.left + r.css(a[0], "borderLeftWidth", !0)
            })),
          {
            top: b.top - d.top - r.css(c, "marginTop", !0),
            left: b.left - d.left - r.css(c, "marginLeft", !0)
          }
        );
      }
    },
    offsetParent() {
      return this.map(function() {
        var a = this.offsetParent;
        while (a && r.css(a, "position") === "static") a = a.offsetParent;
        return a || ra;
      });
    }
  }),
  r.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(
    a,
    b
  ) {
    var c = b === "pageYOffset";
    r.fn[a] = function(d) {
      return T(
        this,
        function(a, d, e) {
          var f;
          return (
            r.isWindow(a) ? (f = a) : a.nodeType === 9 && (f = a.defaultView),
            void 0 === e
              ? f
                ? f[b]
                : a[d]
              : void (f
                ? f.scrollTo(c ? f.pageXOffset : e, c ? e : f.pageYOffset)
                : (a[d] = e))
          );
        },
        a,
        d,
        arguments.length
      );
    };
  }),
  r.each(["top", "left"], function(a, b) {
    r.cssHooks[b] = Pa(o.pixelPosition, function(a, c) {
      if (c)
      { return (c = Oa(a, b)), Ma.test(c) ? r(a).position()[b] + "px" : c; }
    });
  }),
  r.each({ Height: "height", Width: "width" }, function(a, b) {
    r.each({ padding: "inner" + a, content: b, "": "outer" + a }, function(
      c,
      d
    ) {
      r.fn[d] = function(e, f) {
        var g = arguments.length && (c || typeof e !== "boolean");
        var h = c || (e === !0 || f === !0 ? "margin" : "border");
        return T(
          this,
          function(b, c, e) {
            var f;
            return r.isWindow(b)
              ? d.indexOf("outer") === 0
                ? b["inner" + a]
                : b.document.documentElement["client" + a]
              : b.nodeType === 9
                ? ((f = b.documentElement),
                Math.max(
                  b.body["scroll" + a],
                  f["scroll" + a],
                  b.body["offset" + a],
                  f["offset" + a],
                  f["client" + a]
                ))
                : void 0 === e
                  ? r.css(b, c, h)
                  : r.style(b, c, e, h);
          },
          b,
          g ? e : void 0,
          g
        );
      };
    });
  }),
  r.fn.extend({
    bind(a, b, c) {
      return this.on(a, null, b, c);
    },
    unbind(a, b) {
      return this.off(a, null, b);
    },
    delegate(a, b, c, d) {
      return this.on(b, a, c, d);
    },
    undelegate(a, b, c) {
      return arguments.length === 1
        ? this.off(a, "**")
        : this.off(b, a || "**", c);
    }
  }),
  (r.holdReady = function(a) {
    a ? r.readyWait++ : r.ready(!0);
  }),
  (r.isArray = Array.isArray),
  (r.parseJSON = JSON.parse),
  (r.nodeName = B),
  typeof define === "function" &&
      define.amd &&
      define("jquery", [], function() {
        return r;
      });
  var Vb = a.jQuery;
  var Wb = a.$;
  return (
    (r.noConflict = function(b) {
      return a.$ === r && (a.$ = Wb), b && a.jQuery === r && (a.jQuery = Vb), r;
    }),
    b || (a.jQuery = a.$ = r),
    r
  );
});
