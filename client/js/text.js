/*
 RequireJS text 0.26.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
 */
(function() {
  let j = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"];
  const l = /^\s*<\?xml(\s)+version=['"](\d)*.(\d)*['"](\s)*\?>/im;
  const m = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im;
  const n = typeof location !== "undefined" && location.href;
  const i = [];
  define(function() {
    let e, h, k;
    typeof window !== "undefined" && window.navigator && window.document
      ? (h = function(a, b) {
        const c = e.createXhr();
        c.open("GET", a, !0);
        c.onreadystatechange = function() {
          c.readyState === 4 && b(c.responseText);
        };
        c.send(null);
      })
      : typeof process !== "undefined" &&
        process.versions &&
        process.versions.node
        ? ((k = require.nodeRequire("fs")),
        (h = function(a, b) {
          b(k.readFileSync(a, "utf8"));
        }))
        : typeof Packages !== "undefined" &&
        (h = function(a, b) {
          let c = new java.io.File(a);
          const g = java.lang.System.getProperty("line.separator");
          c = new java.io.BufferedReader(
            new java.io.InputStreamReader(
              new java.io.FileInputStream(c),
              "utf-8"
            )
          );
          let d;
          let f;
          let e = "";
          try {
            d = new java.lang.StringBuffer();
            (f = c.readLine()) &&
              f.length() &&
              f.charAt(0) === 65279 &&
              (f = f.substring(1));
            for (d.append(f); (f = c.readLine()) !== null;) {
              d.append(g);
              d.append(f);
            }
            e = String(d.toString());
          } finally {
            c.close();
          }
          b(e);
        });
    return (e = {
      version: "0.26.0",
      strip(a) {
        if (a) {
          // eslint-disable-next-line no-use-before-define
          let a = a.replace(l, "");
          const b = a.match(m);
          b && (a = b[1]);
        } else a = "";
        return a;
      },
      jsEscape(a) {
        return a
          .replace(/(['\\])/g, "\\$1")
          .replace(/[\f]/g, "\\f")
          .replace(/[\b]/g, "\\b")
          .replace(/[\n]/g, "\\n")
          .replace(/[\t]/g, "\\t")
          .replace(/[\r]/g, "\\r");
      },
      createXhr() {
        let a, b, c;
        if (typeof XMLHttpRequest !== "undefined") return new XMLHttpRequest();
        else {
          for (b = 0; b < 3; b++) {
            c = j[b];
            try {
              a = new ActiveXObject(c);
            } catch (e) {}
            if (a) {
              j = [c];
              break;
            }
          }
        }
        if (!a) throw Error("createXhr(): XMLHttpRequest not available");
        return a;
      },
      get: h,
      parseName(a) {
        let b = !1;
        let c = a.indexOf(".");
        const e = a.substring(0, c);
        a = a.substring(c + 1, a.length);
        c = a.indexOf("!");
        c !== -1 &&
          ((b = a.substring(c + 1, a.length)),
          (b = b === "strip"),
          (a = a.substring(0, c)));
        return { moduleName: e, ext: a, strip: b };
      },
      xdRegExp: /^((\w+):)?\/\/([^/\\]+)/,
      canUseXhr(a, b, c, g) {
        let d = e.xdRegExp.exec(a);
        let f = null;
        if (!d) return !0;
        a = d[2];
        d = d[3];
        d = d.split(":");
        f = d[1];
        d = d[0];
        return (!a || a === b) && (!d || d === c) && ((!f && !d) || f === g);
      },
      finishLoad(a, b, c, g, d) {
        c = b ? e.strip(c) : c;
        d.isBuild && d.inlineText && (i[a] = c);
        g(c);
      },
      load(a, b, c, g) {
        const d = e.parseName(a);
        const f = d.moduleName + "." + d.ext;
        const h = b.toUrl(f);
        !n || e.canUseXhr(h)
          ? e.get(h, function(b) {
            e.finishLoad(a, d.strip, b, c, g);
          })
          : b([f], function(a) {
            e.finishLoad(d.moduleName + "." + d.ext, d.strip, a, c, g);
          });
      },
      write(a, b, c) {
        if (b in i) {
          const g = e.jsEscape(i[b]);
          c(
            "define('" +
              a +
              "!" +
              b +
              "', function () { return '" +
              g +
              "';});\n"
          );
        }
      },
      writeFile(a, b, c, g, d) {
        b = e.parseName(b);
        const f = b.moduleName + "." + b.ext;
        const h = c.toUrl(b.moduleName + "." + b.ext) + ".js";
        e.load(
          f,
          c,
          function() {
            e.write(
              a,
              f,
              function(a) {
                g(h, a);
              },
              d
            );
          },
          d
        );
      }
    });
  });
})();
