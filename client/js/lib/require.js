/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/requirejs/blob/master/LICENSE
 */
var requirejs, require, define;
!(function(global, setTimeout) {
  function commentReplace(e, t) {
    return t || "";
  }
  function isFunction(e) {
    return ostring.call(e) === "[object Function]";
  }
  function isArray(e) {
    return ostring.call(e) === "[object Array]";
  }
  function each(e, t) {
    if (e) {
      var i;
      for (i = 0; i < e.length && (!e[i] || !t(e[i], i, e)); i += 1);
    }
  }
  function eachReverse(e, t) {
    if (e) {
      var i;
      for (i = e.length - 1; i > -1 && (!e[i] || !t(e[i], i, e)); i -= 1);
    }
  }
  function hasProp(e, t) {
    return hasOwn.call(e, t);
  }
  function getOwn(e, t) {
    return hasProp(e, t) && e[t];
  }
  function eachProp(e, t) {
    var i;
    for (i in e) if (hasProp(e, i) && t(e[i], i)) break;
  }
  function mixin(e, t, i, r) {
    return (
      t &&
        eachProp(t, function(t, n) {
          (!i && hasProp(e, n)) ||
            (!r ||
            typeof t !== "object" ||
            !t ||
            isArray(t) ||
            isFunction(t) ||
            t instanceof RegExp
              ? (e[n] = t)
              : (e[n] || (e[n] = {}), mixin(e[n], t, i, r)));
        }),
      e
    );
  }
  function bind(e, t) {
    return function() {
      return t.apply(e, arguments);
    };
  }
  function scripts() {
    return document.getElementsByTagName("script");
  }
  function defaultOnError(e) {
    throw e;
  }
  function getGlobal(e) {
    if (!e) return e;
    var t = global;
    return (
      each(e.split("."), function(e) {
        t = t[e];
      }),
      t
    );
  }
  function makeError(e, t, i, r) {
    var n = new Error(t + "\nhttp://requirejs.org/docs/errors.html#" + e);
    return (
      (n.requireType = e), (n.requireModules = r), i && (n.originalError = i), n
    );
  }
  function newContext(e) {
    function t(e) {
      var t, i;
      for (t = 0; t < e.length; t++)
      { if (((i = e[t]), i === ".")) e.splice(t, 1), (t -= 1);
      else if (i === "..") {
        if (t === 0 || (t === 1 && e[2] === "..") || e[t - 1] === "..")
        { continue; }
        t > 0 && (e.splice(t - 1, 2), (t -= 2));
      } }
    }
    function i(e, i, r) {
      var n;
      var o;
      var a;
      var s;
      var u;
      var c;
      var d;
      var p;
      var f;
      var l;
      var h;
      var m;
      var g = i && i.split("/");
      var v = y.map;
      var x = v && v["*"];
      if (
        (e &&
          ((e = e.split("/")),
          (d = e.length - 1),
          y.nodeIdCompat &&
            jsSuffixRegExp.test(e[d]) &&
            (e[d] = e[d].replace(jsSuffixRegExp, "")),
          e[0].charAt(0) === "." &&
            g &&
            ((m = g.slice(0, g.length - 1)), (e = m.concat(e))),
          t(e),
          (e = e.join("/"))),
        r && v && (g || x))
      ) {
        a = e.split("/");
        e: for (s = a.length; s > 0; s -= 1) {
          if (((c = a.slice(0, s).join("/")), g))
          { for (u = g.length; u > 0; u -= 1)
          { if (
            ((o = getOwn(v, g.slice(0, u).join("/"))),
            o && (o = getOwn(o, c)))
          ) {
            (p = o), (f = s);
            break e;
          } } }
          !l && x && getOwn(x, c) && ((l = getOwn(x, c)), (h = s));
        }
        !p && l && ((p = l), (f = h)),
        p && (a.splice(0, f, p), (e = a.join("/")));
      }
      return (n = getOwn(y.pkgs, e)), n || e;
    }
    function r(e) {
      isBrowser &&
        each(scripts(), function(t) {
          if (
            t.getAttribute("data-requiremodule") === e &&
            t.getAttribute("data-requirecontext") === q.contextName
          )
          { return t.parentNode.removeChild(t), !0; }
        });
    }
    function n(e) {
      var t = getOwn(y.paths, e);
      if (t && isArray(t) && t.length > 1)
      { return (
        t.shift(),
        q.require.undef(e),
        q.makeRequire(null, { skipMap: !0 })([e]),
        !0
      ); }
    }
    function o(e) {
      var t;
      var i = e ? e.indexOf("!") : -1;
      return (
        i > -1 && ((t = e.substring(0, i)), (e = e.substring(i + 1, e.length))),
        [t, e]
      );
    }
    function a(e, t, r, n) {
      var a;
      var s;
      var u;
      var c;
      var d = null;
      var p = t ? t.name : null;
      var f = e;
      var l = !0;
      var h = "";
      return (
        e || ((l = !1), (e = "_@r" + (T += 1))),
        (c = o(e)),
        (d = c[0]),
        (e = c[1]),
        d && ((d = i(d, p, n)), (s = getOwn(j, d))),
        e &&
          (d
            ? (h = r
              ? e
              : s && s.normalize
                ? s.normalize(e, function(e) {
                  return i(e, p, n);
                })
                : e.indexOf("!") === -1
                  ? i(e, p, n)
                  : e)
            : ((h = i(e, p, n)),
            (c = o(h)),
            (d = c[0]),
            (h = c[1]),
            (r = !0),
            (a = q.nameToUrl(h)))),
        (u = !d || s || r ? "" : "_unnormalized" + (A += 1)),
        {
          prefix: d,
          name: h,
          parentMap: t,
          unnormalized: !!u,
          url: a,
          originalName: f,
          isDefine: l,
          id: (d ? d + "!" + h : h) + u
        }
      );
    }
    function s(e) {
      var t = e.id;
      var i = getOwn(S, t);
      return i || (i = S[t] = new q.Module(e)), i;
    }
    function u(e, t, i) {
      var r = e.id;
      var n = getOwn(S, r);
      !hasProp(j, r) || (n && !n.defineEmitComplete)
        ? ((n = s(e)), n.error && t === "error" ? i(n.error) : n.on(t, i))
        : t === "defined" && i(j[r]);
    }
    function c(e, t) {
      var i = e.requireModules;
      var r = !1;
      t
        ? t(e)
        : (each(i, function(t) {
          var i = getOwn(S, t);
          i &&
              ((i.error = e), i.events.error && ((r = !0), i.emit("error", e)));
        }),
        r || req.onError(e));
    }
    function d() {
      globalDefQueue.length &&
        (each(globalDefQueue, function(e) {
          var t = e[0];
          typeof t === "string" && (q.defQueueMap[t] = !0), O.push(e);
        }),
        (globalDefQueue = []));
    }
    function p(e) {
      delete S[e], delete k[e];
    }
    function f(e, t, i) {
      var r = e.map.id;
      e.error
        ? e.emit("error", e.error)
        : ((t[r] = !0),
        each(e.depMaps, function(r, n) {
          var o = r.id;
          var a = getOwn(S, o);
          !a ||
              e.depMatched[n] ||
              i[o] ||
              (getOwn(t, o) ? (e.defineDep(n, j[o]), e.check()) : f(a, t, i));
        }),
        (i[r] = !0));
    }
    function l() {
      var e;
      var t;
      var i = 1e3 * y.waitSeconds;
      var o = i && q.startTime + i < new Date().getTime();
      var a = [];
      var s = [];
      var u = !1;
      var d = !0;
      if (!x) {
        if (
          ((x = !0),
          eachProp(k, function(e) {
            var i = e.map;
            var c = i.id;
            if (e.enabled && (i.isDefine || s.push(e), !e.error))
            { if (!e.inited && o)
            { n(c) ? ((t = !0), (u = !0)) : (a.push(c), r(c)); }
            else if (
              !e.inited &&
                e.fetched &&
                i.isDefine &&
                ((u = !0), !i.prefix)
            )
            { return (d = !1); } }
          }),
          o && a.length)
        )
        { return (
          (e = makeError(
            "timeout",
            "Load timeout for modules: " + a,
            null,
            a
          )),
          (e.contextName = q.contextName),
          c(e)
        ); }
        d &&
          each(s, function(e) {
            f(e, {}, {});
          }),
        (o && !t) ||
            !u ||
            (!isBrowser && !isWebWorker) ||
            w ||
            (w = setTimeout(function() {
              (w = 0), l();
            }, 50)),
        (x = !1);
      }
    }
    function h(e) {
      hasProp(j, e[0]) || s(a(e[0], null, !0)).init(e[1], e[2]);
    }
    function m(e, t, i, r) {
      e.detachEvent && !isOpera
        ? r && e.detachEvent(r, t)
        : e.removeEventListener(i, t, !1);
    }
    function g(e) {
      var t = e.currentTarget || e.srcElement;
      return (
        m(t, q.onScriptLoad, "load", "onreadystatechange"),
        m(t, q.onScriptError, "error"),
        { node: t, id: t && t.getAttribute("data-requiremodule") }
      );
    }
    function v() {
      var e;
      for (d(); O.length;) {
        if (((e = O.shift()), e[0] === null))
        { return c(
          makeError(
            "mismatch",
            "Mismatched anonymous define() module: " + e[e.length - 1]
          )
        ); }
        h(e);
      }
      q.defQueueMap = {};
    }
    var x;
    var b;
    var q;
    var E;
    var w;
    var y = {
      waitSeconds: 7,
      baseUrl: "./",
      paths: {},
      bundles: {},
      pkgs: {},
      shim: {},
      config: {}
    };
    var S = {};
    var k = {};
    var M = {};
    var O = [];
    var j = {};
    var P = {};
    var R = {};
    var T = 1;
    var A = 1;
    return (
      (E = {
        require(e) {
          return e.require ? e.require : (e.require = q.makeRequire(e.map));
        },
        exports(e) {
          if (((e.usingExports = !0), e.map.isDefine))
          { return e.exports
            ? (j[e.map.id] = e.exports)
            : (e.exports = j[e.map.id] = {}); }
        },
        module(e) {
          return e.module
            ? e.module
            : (e.module = {
              id: e.map.id,
              uri: e.map.url,
              config() {
                return getOwn(y.config, e.map.id) || {};
              },
              exports: e.exports || (e.exports = {})
            });
        }
      }),
      (b = function(e) {
        (this.events = getOwn(M, e.id) || {}),
        (this.map = e),
        (this.shim = getOwn(y.shim, e.id)),
        (this.depExports = []),
        (this.depMaps = []),
        (this.depMatched = []),
        (this.pluginMaps = {}),
        (this.depCount = 0);
      }),
      (b.prototype = {
        init(e, t, i, r) {
          (r = r || {}),
          this.inited ||
              ((this.factory = t),
              i
                ? this.on("error", i)
                : this.events.error &&
                  (i = bind(this, function(e) {
                    this.emit("error", e);
                  })),
              (this.depMaps = e && e.slice(0)),
              (this.errback = i),
              (this.inited = !0),
              (this.ignore = r.ignore),
              r.enabled || this.enabled ? this.enable() : this.check());
        },
        defineDep(e, t) {
          this.depMatched[e] ||
            ((this.depMatched[e] = !0),
            (this.depCount -= 1),
            (this.depExports[e] = t));
        },
        fetch() {
          if (!this.fetched) {
            (this.fetched = !0), (q.startTime = new Date().getTime());
            var e = this.map;
            return this.shim
              ? void q.makeRequire(this.map, { enableBuildCallback: !0 })(
                this.shim.deps || [],
                bind(this, function() {
                  return e.prefix ? this.callPlugin() : this.load();
                })
              )
              : e.prefix
                ? this.callPlugin()
                : this.load();
          }
        },
        load() {
          var e = this.map.url;
          P[e] || ((P[e] = !0), q.load(this.map.id, e));
        },
        check() {
          if (this.enabled && !this.enabling) {
            var e;
            var t;
            var i = this.map.id;
            var r = this.depExports;
            var n = this.exports;
            var o = this.factory;
            if (this.inited) {
              if (this.error) this.emit("error", this.error);
              else if (!this.defining) {
                if (
                  ((this.defining = !0), this.depCount < 1 && !this.defined)
                ) {
                  if (isFunction(o)) {
                    if (
                      (this.events.error && this.map.isDefine) ||
                      req.onError !== defaultOnError
                    )
                    { try {
                      n = q.execCb(i, o, r, n);
                    } catch (t) {
                      e = t;
                    } }
                    else n = q.execCb(i, o, r, n);
                    if (
                      (this.map.isDefine &&
                        void 0 === n &&
                        ((t = this.module),
                        t
                          ? (n = t.exports)
                          : this.usingExports && (n = this.exports)),
                      e)
                    )
                    { return (
                      (e.requireMap = this.map),
                      (e.requireModules = this.map.isDefine
                        ? [this.map.id]
                        : null),
                      (e.requireType = this.map.isDefine
                        ? "define"
                        : "require"),
                      c((this.error = e))
                    ); }
                  } else n = o;
                  if (
                    ((this.exports = n),
                    this.map.isDefine &&
                      !this.ignore &&
                      ((j[i] = n), req.onResourceLoad))
                  ) {
                    var a = [];
                    each(this.depMaps, function(e) {
                      a.push(e.normalizedMap || e);
                    }),
                    req.onResourceLoad(q, this.map, a);
                  }
                  p(i), (this.defined = !0);
                }
                (this.defining = !1),
                this.defined &&
                    !this.defineEmitted &&
                    ((this.defineEmitted = !0),
                    this.emit("defined", this.exports),
                    (this.defineEmitComplete = !0));
              }
            } else hasProp(q.defQueueMap, i) || this.fetch();
          }
        },
        callPlugin() {
          var e = this.map;
          var t = e.id;
          var r = a(e.prefix);
          this.depMaps.push(r),
          u(
            r,
            "defined",
            bind(this, function(r) {
              var n;
              var o;
              var d;
              var f = getOwn(R, this.map.id);
              var l = this.map.name;
              var h = this.map.parentMap ? this.map.parentMap.name : null;
              var m = q.makeRequire(e.parentMap, { enableBuildCallback: !0 });
              return this.map.unnormalized
                ? (r.normalize &&
                      (l =
                        r.normalize(l, function(e) {
                          return i(e, h, !0);
                        }) || ""),
                (o = a(e.prefix + "!" + l, this.map.parentMap, !0)),
                u(
                  o,
                  "defined",
                  bind(this, function(e) {
                    (this.map.normalizedMap = o),
                    this.init(
                      [],
                      function() {
                        return e;
                      },
                      null,
                      { enabled: !0, ignore: !0 }
                    );
                  })
                ),
                (d = getOwn(S, o.id)),
                void (
                  d &&
                      (this.depMaps.push(o),
                      this.events.error &&
                        d.on(
                          "error",
                          bind(this, function(e) {
                            this.emit("error", e);
                          })
                        ),
                      d.enable())
                ))
                : f
                  ? ((this.map.url = q.nameToUrl(f)), void this.load())
                  : ((n = bind(this, function(e) {
                    this.init(
                      [],
                      function() {
                        return e;
                      },
                      null,
                      { enabled: !0 }
                    );
                  })),
                  (n.error = bind(this, function(e) {
                    (this.inited = !0),
                    (this.error = e),
                    (e.requireModules = [t]),
                    eachProp(S, function(e) {
                      e.map.id.indexOf(t + "_unnormalized") === 0 &&
                            p(e.map.id);
                    }),
                    c(e);
                  })),
                  (n.fromText = bind(this, function(i, r) {
                    var o = e.name;
                    var u = a(o);
                    var d = useInteractive;
                    r && (i = r),
                    d && (useInteractive = !1),
                    s(u),
                    hasProp(y.config, t) && (y.config[o] = y.config[t]);
                    try {
                      req.exec(i);
                    } catch (e) {
                      return c(
                        makeError(
                          "fromtexteval",
                          "fromText eval for " + t + " failed: " + e,
                          e,
                          [t]
                        )
                      );
                    }
                    d && (useInteractive = !0),
                    this.depMaps.push(u),
                    q.completeLoad(o),
                    m([o], n);
                  })),
                  void r.load(e.name, m, n, y));
            })
          ),
          q.enable(r, this),
          (this.pluginMaps[r.id] = r);
        },
        enable() {
          (k[this.map.id] = this),
          (this.enabled = !0),
          (this.enabling = !0),
          each(
            this.depMaps,
            bind(this, function(e, t) {
              var i, r, n;
              if (typeof e === "string") {
                if (
                  ((e = a(
                    e,
                    this.map.isDefine ? this.map : this.map.parentMap,
                    !1,
                    !this.skipMap
                  )),
                  (this.depMaps[t] = e),
                  (n = getOwn(E, e.id)))
                )
                { return void (this.depExports[t] = n(this)); }
                (this.depCount += 1),
                u(
                  e,
                  "defined",
                  bind(this, function(e) {
                    this.undefed || (this.defineDep(t, e), this.check());
                  })
                ),
                this.errback
                  ? u(e, "error", bind(this, this.errback))
                  : this.events.error &&
                        u(
                          e,
                          "error",
                          bind(this, function(e) {
                            this.emit("error", e);
                          })
                        );
              }
              (i = e.id),
              (r = S[i]),
              hasProp(E, i) || !r || r.enabled || q.enable(e, this);
            })
          ),
          eachProp(
            this.pluginMaps,
            bind(this, function(e) {
              var t = getOwn(S, e.id);
              t && !t.enabled && q.enable(e, this);
            })
          ),
          (this.enabling = !1),
          this.check();
        },
        on(e, t) {
          var i = this.events[e];
          i || (i = this.events[e] = []), i.push(t);
        },
        emit(e, t) {
          each(this.events[e], function(e) {
            e(t);
          }),
          e === "error" && delete this.events[e];
        }
      }),
      (q = {
        config: y,
        contextName: e,
        registry: S,
        defined: j,
        urlFetched: P,
        defQueue: O,
        defQueueMap: {},
        Module: b,
        makeModuleMap: a,
        nextTick: req.nextTick,
        onError: c,
        configure(e) {
          if (
            (e.baseUrl &&
              e.baseUrl.charAt(e.baseUrl.length - 1) !== "/" &&
              (e.baseUrl += "/"),
            typeof e.urlArgs === "string")
          ) {
            var t = e.urlArgs;
            e.urlArgs = function(e, i) {
              return (i.indexOf("?") === -1 ? "?" : "&") + t;
            };
          }
          var i = y.shim;
          var r = { paths: !0, bundles: !0, config: !0, map: !0 };
          eachProp(e, function(e, t) {
            r[t] ? (y[t] || (y[t] = {}), mixin(y[t], e, !0, !0)) : (y[t] = e);
          }),
          e.bundles &&
              eachProp(e.bundles, function(e, t) {
                each(e, function(e) {
                  e !== t && (R[e] = t);
                });
              }),
          e.shim &&
              (eachProp(e.shim, function(e, t) {
                isArray(e) && (e = { deps: e }),
                (!e.exports && !e.init) ||
                    e.exportsFn ||
                    (e.exportsFn = q.makeShimExports(e)),
                (i[t] = e);
              }),
              (y.shim = i)),
          e.packages &&
              each(e.packages, function(e) {
                var t, i;
                (e = typeof e === "string" ? { name: e } : e),
                (i = e.name),
                (t = e.location),
                t && (y.paths[i] = e.location),
                (y.pkgs[i] =
                    e.name +
                    "/" +
                    (e.main || "main")
                      .replace(currDirRegExp, "")
                      .replace(jsSuffixRegExp, ""));
              }),
          eachProp(S, function(e, t) {
            e.inited || e.map.unnormalized || (e.map = a(t, null, !0));
          }),
          (e.deps || e.callback) && q.require(e.deps || [], e.callback);
        },
        makeShimExports(e) {
          function t() {
            var t;
            return (
              e.init && (t = e.init.apply(global, arguments)),
              t || (e.exports && getGlobal(e.exports))
            );
          }
          return t;
        },
        makeRequire(t, n) {
          function o(i, r, u) {
            var d, p, f;
            return (
              n.enableBuildCallback &&
                r &&
                isFunction(r) &&
                (r.__requireJsBuild = !0),
              typeof i === "string"
                ? isFunction(r)
                  ? c(makeError("requireargs", "Invalid require call"), u)
                  : t && hasProp(E, i)
                    ? E[i](S[t.id])
                    : req.get
                      ? req.get(q, i, t, o)
                      : ((p = a(i, t, !1, !0)),
                      (d = p.id),
                      hasProp(j, d)
                        ? j[d]
                        : c(
                          makeError(
                            "notloaded",
                            "Module name \"" +
                              d +
                              "\" has not been loaded yet for context: " +
                              e +
                              (t ? "" : ". Use require([])")
                          )
                        ))
                : (v(),
                q.nextTick(function() {
                  v(),
                  (f = s(a(null, t))),
                  (f.skipMap = n.skipMap),
                  f.init(i, r, u, { enabled: !0 }),
                  l();
                }),
                o)
            );
          }
          return (
            (n = n || {}),
            mixin(o, {
              isBrowser: isBrowser,
              toUrl(e) {
                var r;
                var n = e.lastIndexOf(".");
                var o = e.split("/")[0];
                var a = o === "." || o === "..";
                return (
                  n !== -1 &&
                    (!a || n > 1) &&
                    ((r = e.substring(n, e.length)), (e = e.substring(0, n))),
                  q.nameToUrl(i(e, t && t.id, !0), r, !0)
                );
              },
              defined(e) {
                return hasProp(j, a(e, t, !1, !0).id);
              },
              specified(e) {
                return (e = a(e, t, !1, !0).id), hasProp(j, e) || hasProp(S, e);
              }
            }),
            t ||
              (o.undef = function(e) {
                d();
                var i = a(e, t, !0);
                var n = getOwn(S, e);
                (n.undefed = !0),
                r(e),
                delete j[e],
                delete P[i.url],
                delete M[e],
                eachReverse(O, function(t, i) {
                  t[0] === e && O.splice(i, 1);
                }),
                delete q.defQueueMap[e],
                n && (n.events.defined && (M[e] = n.events), p(e));
              }),
            o
          );
        },
        enable(e) {
          var t = getOwn(S, e.id);
          t && s(e).enable();
        },
        completeLoad(e) {
          var t;
          var i;
          var r;
          var o = getOwn(y.shim, e) || {};
          var a = o.exports;
          for (d(); O.length;) {
            if (((i = O.shift()), i[0] === null)) {
              if (((i[0] = e), t)) break;
              t = !0;
            } else i[0] === e && (t = !0);
            h(i);
          }
          if (
            ((q.defQueueMap = {}),
            (r = getOwn(S, e)),
            !t && !hasProp(j, e) && r && !r.inited)
          ) {
            if (!(!y.enforceDefine || (a && getGlobal(a))))
            { return n(e)
              ? void 0
              : c(
                makeError("nodefine", "No define call for " + e, null, [e])
              ); }
            h([e, o.deps || [], o.exportsFn]);
          }
          l();
        },
        nameToUrl(e, t, i) {
          var r;
          var n;
          var o;
          var a;
          var s;
          var u;
          var c;
          var d = getOwn(y.pkgs, e);
          if ((d && (e = d), (c = getOwn(R, e)))) return q.nameToUrl(c, t, i);
          if (req.jsExtRegExp.test(e)) s = e + (t || "");
          else {
            for (r = y.paths, n = e.split("/"), o = n.length; o > 0; o -= 1)
            { if (((a = n.slice(0, o).join("/")), (u = getOwn(r, a)))) {
              isArray(u) && (u = u[0]), n.splice(0, o, u);
              break;
            } }
            (s = n.join("/")),
            (s += t || (/^data\:|^blob\:|\?/.test(s) || i ? "" : ".js")),
            (s =
                (s.charAt(0) === "/" || s.match(/^[\w\+\.\-]+:/)
                  ? ""
                  : y.baseUrl) + s);
          }
          return y.urlArgs && !/^blob\:/.test(s) ? s + y.urlArgs(e, s) : s;
        },
        load(e, t) {
          req.load(q, e, t);
        },
        execCb(e, t, i, r) {
          return t.apply(r, i);
        },
        onScriptLoad(e) {
          if (
            e.type === "load" ||
            readyRegExp.test((e.currentTarget || e.srcElement).readyState)
          ) {
            interactiveScript = null;
            var t = g(e);
            q.completeLoad(t.id);
          }
        },
        onScriptError(e) {
          var t = g(e);
          if (!n(t.id)) {
            var i = [];
            return (
              eachProp(S, function(e, r) {
                r.indexOf("_@r") !== 0 &&
                  each(e.depMaps, function(e) {
                    if (e.id === t.id) return i.push(r), !0;
                  });
              }),
              c(
                makeError(
                  "scripterror",
                  "Script error for \"" +
                    t.id +
                    (i.length ? "\", needed by: " + i.join(", ") : "\""),
                  e,
                  [t.id]
                )
              )
            );
          }
        }
      }),
      (q.require = q.makeRequire()),
      q
    );
  }
  function getInteractiveScript() {
    return interactiveScript && interactiveScript.readyState === "interactive"
      ? interactiveScript
      : (eachReverse(scripts(), function(e) {
        if (e.readyState === "interactive") return (interactiveScript = e);
      }),
      interactiveScript);
  }
  var req;
  var s;
  var head;
  var baseElement;
  var dataMain;
  var src;
  var interactiveScript;
  var currentlyAddingScript;
  var mainScript;
  var subPath;
  var version = "2.3.3";
  var commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm;
  var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
  var jsSuffixRegExp = /\.js$/;
  var currDirRegExp = /^\.\//;
  var op = Object.prototype;
  var ostring = op.toString;
  var hasOwn = op.hasOwnProperty;
  var isBrowser = !(
    typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !window.document
  );
  var isWebWorker = !isBrowser && typeof importScripts !== "undefined";
  var readyRegExp =
      isBrowser && navigator.platform === "PLAYSTATION 3"
        ? /^complete$/
        : /^(complete|loaded)$/;
  var defContextName = "_";
  var isOpera =
      typeof opera !== "undefined" && opera.toString() === "[object Opera]";
  var contexts = {};
  var cfg = {};
  var globalDefQueue = [];
  var useInteractive = !1;
  if (typeof define === "undefined") {
    if (typeof requirejs !== "undefined") {
      if (isFunction(requirejs)) return;
      (cfg = requirejs), (requirejs = void 0);
    }
    typeof require === "undefined" ||
      isFunction(require) ||
      ((cfg = require), (require = void 0)),
    (req = requirejs = function(e, t, i, r) {
      var n;
      var o;
      var a = defContextName;
      return (
        isArray(e) ||
            typeof e === "string" ||
            ((o = e), isArray(t) ? ((e = t), (t = i), (i = r)) : (e = [])),
        o && o.context && (a = o.context),
        (n = getOwn(contexts, a)),
        n || (n = contexts[a] = req.s.newContext(a)),
        o && n.configure(o),
        n.require(e, t, i)
      );
    }),
    (req.config = function(e) {
      return req(e);
    }),
    (req.nextTick =
        typeof setTimeout !== "undefined"
          ? function(e) {
            setTimeout(e, 4);
          }
          : function(e) {
            e();
          }),
    require || (require = req),
    (req.version = version),
    (req.jsExtRegExp = /^\/|:|\?|\.js$/),
    (req.isBrowser = isBrowser),
    (s = req.s = { contexts: contexts, newContext: newContext }),
    req({}),
    each(["toUrl", "undef", "defined", "specified"], function(e) {
      req[e] = function() {
        var t = contexts[defContextName];
        return t.require[e].apply(t, arguments);
      };
    }),
    isBrowser &&
        ((head = s.head = document.getElementsByTagName("head")[0]),
        (baseElement = document.getElementsByTagName("base")[0]),
        baseElement && (head = s.head = baseElement.parentNode)),
    (req.onError = defaultOnError),
    (req.createNode = function(e, t, i) {
      var r = e.xhtml
        ? document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "html:script"
        )
        : document.createElement("script");
      return (
        (r.type = e.scriptType || "text/javascript"),
        (r.charset = "utf-8"),
        (r.async = !0),
        r
      );
    }),
    (req.load = function(e, t, i) {
      var r;
      var n = (e && e.config) || {};
      if (isBrowser)
      { return (
        (r = req.createNode(n, t, i)),
        r.setAttribute("data-requirecontext", e.contextName),
        r.setAttribute("data-requiremodule", t),
        !r.attachEvent ||
            (r.attachEvent.toString &&
              r.attachEvent.toString().indexOf("[native code") < 0) ||
            isOpera
          ? (r.addEventListener("load", e.onScriptLoad, !1),
          r.addEventListener("error", e.onScriptError, !1))
          : ((useInteractive = !0),
          r.attachEvent("onreadystatechange", e.onScriptLoad)),
        (r.src = i),
        n.onNodeCreated && n.onNodeCreated(r, n, t, i),
        (currentlyAddingScript = r),
        baseElement
          ? head.insertBefore(r, baseElement)
          : head.appendChild(r),
        (currentlyAddingScript = null),
        r
      ); }
      if (isWebWorker)
      { try {
        setTimeout(function() {}, 0), importScripts(i), e.completeLoad(t);
      } catch (r) {
        e.onError(
          makeError(
            "importscripts",
            "importScripts failed for " + t + " at " + i,
            r,
            [t]
          )
        );
      } }
    }),
    isBrowser &&
        !cfg.skipDataMain &&
        eachReverse(scripts(), function(e) {
          if (
            (head || (head = e.parentNode),
            (dataMain = e.getAttribute("data-main")))
          )
          { return (
            (mainScript = dataMain),
            cfg.baseUrl ||
                mainScript.indexOf("!") !== -1 ||
                ((src = mainScript.split("/")),
                (mainScript = src.pop()),
                (subPath = src.length ? src.join("/") + "/" : "./"),
                (cfg.baseUrl = subPath)),
            (mainScript = mainScript.replace(jsSuffixRegExp, "")),
            req.jsExtRegExp.test(mainScript) && (mainScript = dataMain),
            (cfg.deps = cfg.deps
              ? cfg.deps.concat(mainScript)
              : [mainScript]),
            !0
          ); }
        }),
    (define = function(e, t, i) {
      var r, n;
      typeof e !== "string" && ((i = t), (t = e), (e = null)),
      isArray(t) || ((i = t), (t = null)),
      !t &&
            isFunction(i) &&
            ((t = []),
            i.length &&
              (i
                .toString()
                .replace(commentRegExp, commentReplace)
                .replace(cjsRequireRegExp, function(e, i) {
                  t.push(i);
                }),
              (t = (i.length === 1
                ? ["require"]
                : ["require", "exports", "module"]
              ).concat(t)))),
      useInteractive &&
            ((r = currentlyAddingScript || getInteractiveScript()),
            r &&
              (e || (e = r.getAttribute("data-requiremodule")),
              (n = contexts[r.getAttribute("data-requirecontext")]))),
      n
        ? (n.defQueue.push([e, t, i]), (n.defQueueMap[e] = !0))
        : globalDefQueue.push([e, t, i]);
    }),
    (define.amd = { jQuery: !0 }),
    (req.exec = function(text) {
      return eval(text);
    }),
    req(cfg);
  }
})(this, typeof setTimeout === "undefined" ? void 0 : setTimeout);
