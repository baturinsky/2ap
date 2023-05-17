(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
      if (decorator = decorators[i2])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e2) {
          reject(e2);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e2) {
          reject(e2);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var i;
  var t;
  var o;
  var r;
  var f = {};
  var e = [];
  var c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function s(n2, l2) {
    for (var u2 in l2)
      n2[u2] = l2[u2];
    return n2;
  }
  function a(n2) {
    var l2 = n2.parentNode;
    l2 && l2.removeChild(n2);
  }
  function h(l2, u2, i2) {
    var t3, o2, r3, f2 = {};
    for (r3 in u2)
      "key" == r3 ? t3 = u2[r3] : "ref" == r3 ? o2 = u2[r3] : f2[r3] = u2[r3];
    if (arguments.length > 2 && (f2.children = arguments.length > 3 ? n.call(arguments, 2) : i2), "function" == typeof l2 && null != l2.defaultProps)
      for (r3 in l2.defaultProps)
        void 0 === f2[r3] && (f2[r3] = l2.defaultProps[r3]);
    return v(l2, f2, t3, o2, null);
  }
  function v(n2, i2, t3, o2, r3) {
    var f2 = { type: n2, props: i2, key: t3, ref: o2, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == r3 ? ++u : r3 };
    return null == r3 && null != l.vnode && l.vnode(f2), f2;
  }
  function y() {
    return { current: null };
  }
  function p(n2) {
    return n2.children;
  }
  function d(n2, l2) {
    this.props = n2, this.context = l2;
  }
  function _(n2, l2) {
    if (null == l2)
      return n2.__ ? _(n2.__, n2.__.__k.indexOf(n2) + 1) : null;
    for (var u2; l2 < n2.__k.length; l2++)
      if (null != (u2 = n2.__k[l2]) && null != u2.__e)
        return u2.__e;
    return "function" == typeof n2.type ? _(n2) : null;
  }
  function k(n2) {
    var l2, u2;
    if (null != (n2 = n2.__) && null != n2.__c) {
      for (n2.__e = n2.__c.base = null, l2 = 0; l2 < n2.__k.length; l2++)
        if (null != (u2 = n2.__k[l2]) && null != u2.__e) {
          n2.__e = n2.__c.base = u2.__e;
          break;
        }
      return k(n2);
    }
  }
  function b(n2) {
    (!n2.__d && (n2.__d = true) && t.push(n2) && !g.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || setTimeout)(g);
  }
  function g() {
    for (var n2; g.__r = t.length; )
      n2 = t.sort(function(n3, l2) {
        return n3.__v.__b - l2.__v.__b;
      }), t = [], n2.some(function(n3) {
        var l2, u2, i2, t3, o2, r3;
        n3.__d && (o2 = (t3 = (l2 = n3).__v).__e, (r3 = l2.__P) && (u2 = [], (i2 = s({}, t3)).__v = t3.__v + 1, j(r3, t3, i2, l2.__n, void 0 !== r3.ownerSVGElement, null != t3.__h ? [o2] : null, u2, null == o2 ? _(t3) : o2, t3.__h), z(u2, t3), t3.__e != o2 && k(t3)));
      });
  }
  function w(n2, l2, u2, i2, t3, o2, r3, c2, s2, a2) {
    var h2, y2, d2, k2, b2, g2, w2, x = i2 && i2.__k || e, C2 = x.length;
    for (u2.__k = [], h2 = 0; h2 < l2.length; h2++)
      if (null != (k2 = u2.__k[h2] = null == (k2 = l2[h2]) || "boolean" == typeof k2 ? null : "string" == typeof k2 || "number" == typeof k2 || "bigint" == typeof k2 ? v(null, k2, null, null, k2) : Array.isArray(k2) ? v(p, { children: k2 }, null, null, null) : k2.__b > 0 ? v(k2.type, k2.props, k2.key, k2.ref ? k2.ref : null, k2.__v) : k2)) {
        if (k2.__ = u2, k2.__b = u2.__b + 1, null === (d2 = x[h2]) || d2 && k2.key == d2.key && k2.type === d2.type)
          x[h2] = void 0;
        else
          for (y2 = 0; y2 < C2; y2++) {
            if ((d2 = x[y2]) && k2.key == d2.key && k2.type === d2.type) {
              x[y2] = void 0;
              break;
            }
            d2 = null;
          }
        j(n2, k2, d2 = d2 || f, t3, o2, r3, c2, s2, a2), b2 = k2.__e, (y2 = k2.ref) && d2.ref != y2 && (w2 || (w2 = []), d2.ref && w2.push(d2.ref, null, k2), w2.push(y2, k2.__c || b2, k2)), null != b2 ? (null == g2 && (g2 = b2), "function" == typeof k2.type && k2.__k === d2.__k ? k2.__d = s2 = m(k2, s2, n2) : s2 = A(n2, k2, d2, x, b2, s2), "function" == typeof u2.type && (u2.__d = s2)) : s2 && d2.__e == s2 && s2.parentNode != n2 && (s2 = _(d2));
      }
    for (u2.__e = g2, h2 = C2; h2--; )
      null != x[h2] && N(x[h2], x[h2]);
    if (w2)
      for (h2 = 0; h2 < w2.length; h2++)
        M(w2[h2], w2[++h2], w2[++h2]);
  }
  function m(n2, l2, u2) {
    for (var i2, t3 = n2.__k, o2 = 0; t3 && o2 < t3.length; o2++)
      (i2 = t3[o2]) && (i2.__ = n2, l2 = "function" == typeof i2.type ? m(i2, l2, u2) : A(u2, i2, i2, t3, i2.__e, l2));
    return l2;
  }
  function A(n2, l2, u2, i2, t3, o2) {
    var r3, f2, e2;
    if (void 0 !== l2.__d)
      r3 = l2.__d, l2.__d = void 0;
    else if (null == u2 || t3 != o2 || null == t3.parentNode)
      n:
        if (null == o2 || o2.parentNode !== n2)
          n2.appendChild(t3), r3 = null;
        else {
          for (f2 = o2, e2 = 0; (f2 = f2.nextSibling) && e2 < i2.length; e2 += 2)
            if (f2 == t3)
              break n;
          n2.insertBefore(t3, o2), r3 = o2;
        }
    return void 0 !== r3 ? r3 : t3.nextSibling;
  }
  function C(n2, l2, u2, i2, t3) {
    var o2;
    for (o2 in u2)
      "children" === o2 || "key" === o2 || o2 in l2 || H(n2, o2, null, u2[o2], i2);
    for (o2 in l2)
      t3 && "function" != typeof l2[o2] || "children" === o2 || "key" === o2 || "value" === o2 || "checked" === o2 || u2[o2] === l2[o2] || H(n2, o2, l2[o2], u2[o2], i2);
  }
  function $(n2, l2, u2) {
    "-" === l2[0] ? n2.setProperty(l2, u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || c.test(l2) ? u2 : u2 + "px";
  }
  function H(n2, l2, u2, i2, t3) {
    var o2;
    n:
      if ("style" === l2)
        if ("string" == typeof u2)
          n2.style.cssText = u2;
        else {
          if ("string" == typeof i2 && (n2.style.cssText = i2 = ""), i2)
            for (l2 in i2)
              u2 && l2 in u2 || $(n2.style, l2, "");
          if (u2)
            for (l2 in u2)
              i2 && u2[l2] === i2[l2] || $(n2.style, l2, u2[l2]);
        }
      else if ("o" === l2[0] && "n" === l2[1])
        o2 = l2 !== (l2 = l2.replace(/Capture$/, "")), l2 = l2.toLowerCase() in n2 ? l2.toLowerCase().slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + o2] = u2, u2 ? i2 || n2.addEventListener(l2, o2 ? T : I, o2) : n2.removeEventListener(l2, o2 ? T : I, o2);
      else if ("dangerouslySetInnerHTML" !== l2) {
        if (t3)
          l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("href" !== l2 && "list" !== l2 && "form" !== l2 && "tabIndex" !== l2 && "download" !== l2 && l2 in n2)
          try {
            n2[l2] = null == u2 ? "" : u2;
            break n;
          } catch (n3) {
          }
        "function" == typeof u2 || (null == u2 || false === u2 && -1 == l2.indexOf("-") ? n2.removeAttribute(l2) : n2.setAttribute(l2, u2));
      }
  }
  function I(n2) {
    this.l[n2.type + false](l.event ? l.event(n2) : n2);
  }
  function T(n2) {
    this.l[n2.type + true](l.event ? l.event(n2) : n2);
  }
  function j(n2, u2, i2, t3, o2, r3, f2, e2, c2) {
    var a2, h2, v2, y2, _2, k2, b2, g2, m2, x, A2, C2, $2, H2, I2, T2 = u2.type;
    if (void 0 !== u2.constructor)
      return null;
    null != i2.__h && (c2 = i2.__h, e2 = u2.__e = i2.__e, u2.__h = null, r3 = [e2]), (a2 = l.__b) && a2(u2);
    try {
      n:
        if ("function" == typeof T2) {
          if (g2 = u2.props, m2 = (a2 = T2.contextType) && t3[a2.__c], x = a2 ? m2 ? m2.props.value : a2.__ : t3, i2.__c ? b2 = (h2 = u2.__c = i2.__c).__ = h2.__E : ("prototype" in T2 && T2.prototype.render ? u2.__c = h2 = new T2(g2, x) : (u2.__c = h2 = new d(g2, x), h2.constructor = T2, h2.render = O), m2 && m2.sub(h2), h2.props = g2, h2.state || (h2.state = {}), h2.context = x, h2.__n = t3, v2 = h2.__d = true, h2.__h = [], h2._sb = []), null == h2.__s && (h2.__s = h2.state), null != T2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = s({}, h2.__s)), s(h2.__s, T2.getDerivedStateFromProps(g2, h2.__s))), y2 = h2.props, _2 = h2.state, v2)
            null == T2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
          else {
            if (null == T2.getDerivedStateFromProps && g2 !== y2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(g2, x), !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(g2, h2.__s, x) || u2.__v === i2.__v) {
              for (h2.props = g2, h2.state = h2.__s, u2.__v !== i2.__v && (h2.__d = false), h2.__v = u2, u2.__e = i2.__e, u2.__k = i2.__k, u2.__k.forEach(function(n3) {
                n3 && (n3.__ = u2);
              }), A2 = 0; A2 < h2._sb.length; A2++)
                h2.__h.push(h2._sb[A2]);
              h2._sb = [], h2.__h.length && f2.push(h2);
              break n;
            }
            null != h2.componentWillUpdate && h2.componentWillUpdate(g2, h2.__s, x), null != h2.componentDidUpdate && h2.__h.push(function() {
              h2.componentDidUpdate(y2, _2, k2);
            });
          }
          if (h2.context = x, h2.props = g2, h2.__v = u2, h2.__P = n2, C2 = l.__r, $2 = 0, "prototype" in T2 && T2.prototype.render) {
            for (h2.state = h2.__s, h2.__d = false, C2 && C2(u2), a2 = h2.render(h2.props, h2.state, h2.context), H2 = 0; H2 < h2._sb.length; H2++)
              h2.__h.push(h2._sb[H2]);
            h2._sb = [];
          } else
            do {
              h2.__d = false, C2 && C2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
            } while (h2.__d && ++$2 < 25);
          h2.state = h2.__s, null != h2.getChildContext && (t3 = s(s({}, t3), h2.getChildContext())), v2 || null == h2.getSnapshotBeforeUpdate || (k2 = h2.getSnapshotBeforeUpdate(y2, _2)), I2 = null != a2 && a2.type === p && null == a2.key ? a2.props.children : a2, w(n2, Array.isArray(I2) ? I2 : [I2], u2, i2, t3, o2, r3, f2, e2, c2), h2.base = u2.__e, u2.__h = null, h2.__h.length && f2.push(h2), b2 && (h2.__E = h2.__ = null), h2.__e = false;
        } else
          null == r3 && u2.__v === i2.__v ? (u2.__k = i2.__k, u2.__e = i2.__e) : u2.__e = L(i2.__e, u2, i2, t3, o2, r3, f2, c2);
      (a2 = l.diffed) && a2(u2);
    } catch (n3) {
      u2.__v = null, (c2 || null != r3) && (u2.__e = e2, u2.__h = !!c2, r3[r3.indexOf(e2)] = null), l.__e(n3, u2, i2);
    }
  }
  function z(n2, u2) {
    l.__c && l.__c(u2, n2), n2.some(function(u3) {
      try {
        n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
          n3.call(u3);
        });
      } catch (n3) {
        l.__e(n3, u3.__v);
      }
    });
  }
  function L(l2, u2, i2, t3, o2, r3, e2, c2) {
    var s2, h2, v2, y2 = i2.props, p2 = u2.props, d2 = u2.type, k2 = 0;
    if ("svg" === d2 && (o2 = true), null != r3) {
      for (; k2 < r3.length; k2++)
        if ((s2 = r3[k2]) && "setAttribute" in s2 == !!d2 && (d2 ? s2.localName === d2 : 3 === s2.nodeType)) {
          l2 = s2, r3[k2] = null;
          break;
        }
    }
    if (null == l2) {
      if (null === d2)
        return document.createTextNode(p2);
      l2 = o2 ? document.createElementNS("http://www.w3.org/2000/svg", d2) : document.createElement(d2, p2.is && p2), r3 = null, c2 = false;
    }
    if (null === d2)
      y2 === p2 || c2 && l2.data === p2 || (l2.data = p2);
    else {
      if (r3 = r3 && n.call(l2.childNodes), h2 = (y2 = i2.props || f).dangerouslySetInnerHTML, v2 = p2.dangerouslySetInnerHTML, !c2) {
        if (null != r3)
          for (y2 = {}, k2 = 0; k2 < l2.attributes.length; k2++)
            y2[l2.attributes[k2].name] = l2.attributes[k2].value;
        (v2 || h2) && (v2 && (h2 && v2.__html == h2.__html || v2.__html === l2.innerHTML) || (l2.innerHTML = v2 && v2.__html || ""));
      }
      if (C(l2, p2, y2, o2, c2), v2)
        u2.__k = [];
      else if (k2 = u2.props.children, w(l2, Array.isArray(k2) ? k2 : [k2], u2, i2, t3, o2 && "foreignObject" !== d2, r3, e2, r3 ? r3[0] : i2.__k && _(i2, 0), c2), null != r3)
        for (k2 = r3.length; k2--; )
          null != r3[k2] && a(r3[k2]);
      c2 || ("value" in p2 && void 0 !== (k2 = p2.value) && (k2 !== l2.value || "progress" === d2 && !k2 || "option" === d2 && k2 !== y2.value) && H(l2, "value", k2, y2.value, false), "checked" in p2 && void 0 !== (k2 = p2.checked) && k2 !== l2.checked && H(l2, "checked", k2, y2.checked, false));
    }
    return l2;
  }
  function M(n2, u2, i2) {
    try {
      "function" == typeof n2 ? n2(u2) : n2.current = u2;
    } catch (n3) {
      l.__e(n3, i2);
    }
  }
  function N(n2, u2, i2) {
    var t3, o2;
    if (l.unmount && l.unmount(n2), (t3 = n2.ref) && (t3.current && t3.current !== n2.__e || M(t3, null, u2)), null != (t3 = n2.__c)) {
      if (t3.componentWillUnmount)
        try {
          t3.componentWillUnmount();
        } catch (n3) {
          l.__e(n3, u2);
        }
      t3.base = t3.__P = null, n2.__c = void 0;
    }
    if (t3 = n2.__k)
      for (o2 = 0; o2 < t3.length; o2++)
        t3[o2] && N(t3[o2], u2, i2 || "function" != typeof n2.type);
    i2 || null == n2.__e || a(n2.__e), n2.__ = n2.__e = n2.__d = void 0;
  }
  function O(n2, l2, u2) {
    return this.constructor(n2, u2);
  }
  function P(u2, i2, t3) {
    var o2, r3, e2;
    l.__ && l.__(u2, i2), r3 = (o2 = "function" == typeof t3) ? null : t3 && t3.__k || i2.__k, e2 = [], j(i2, u2 = (!o2 && t3 || i2).__k = h(p, null, [u2]), r3 || f, f, void 0 !== i2.ownerSVGElement, !o2 && t3 ? [t3] : r3 ? null : i2.firstChild ? n.call(i2.childNodes) : null, e2, !o2 && t3 ? t3 : r3 ? r3.__e : i2.firstChild, o2), z(e2, u2);
  }
  n = e.slice, l = { __e: function(n2, l2, u2, i2) {
    for (var t3, o2, r3; l2 = l2.__; )
      if ((t3 = l2.__c) && !t3.__)
        try {
          if ((o2 = t3.constructor) && null != o2.getDerivedStateFromError && (t3.setState(o2.getDerivedStateFromError(n2)), r3 = t3.__d), null != t3.componentDidCatch && (t3.componentDidCatch(n2, i2 || {}), r3 = t3.__d), r3)
            return t3.__E = t3;
        } catch (l3) {
          n2 = l3;
        }
    throw n2;
  } }, u = 0, i = function(n2) {
    return null != n2 && void 0 === n2.constructor;
  }, d.prototype.setState = function(n2, l2) {
    var u2;
    u2 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = s({}, this.state), "function" == typeof n2 && (n2 = n2(s({}, u2), this.props)), n2 && s(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), b(this));
  }, d.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), b(this));
  }, d.prototype.render = p, t = [], g.__r = 0, r = 0;

  // src/Util.ts
  function min(list, fn) {
    let minV = Number.MAX_VALUE;
    let minI = -1;
    for (let i2 = 0; i2 < list.length; i2++) {
      let v2 = fn(list[i2]);
      if (minV > v2) {
        minV = v2;
        minI = i2;
      }
    }
    if (minI >= 0)
      return { ind: minI, item: list[minI], val: minV };
  }
  function max(list, fn) {
    let r3 = min(list, (t3) => -fn(t3));
    if (!r3)
      return;
    r3.val = -r3.val;
    return r3;
  }
  function createCanvas(w2, h2) {
    const canvas = document.createElement("canvas");
    canvas.width = w2;
    canvas.height = h2;
    return canvas;
  }
  function canvasCache(size, draw) {
    const canvas = createCanvas(...size);
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000";
    draw(ctx);
    return canvas;
  }
  function random(seed) {
    seed = seed % 2147483647;
    if (seed <= 0)
      seed += 2147483646;
    return () => {
      return seed = seed * 16807 % 2147483647;
    };
  }
  function eachFrame(fun) {
    requestAnimationFrame((time) => {
      fun(time);
      eachFrame(fun);
    });
  }
  function idiv(a2, b2) {
    return Math.floor(a2 / b2);
  }
  function bind(target, name, descriptor) {
    return {
      get() {
        const bound = descriptor.value.bind(this);
        Object.defineProperty(this, name, {
          value: bound
        });
        return bound;
      }
    };
  }
  function parseWithNewLines(json) {
    if (!json)
      return null;
    let split = json.split('"');
    for (let i2 = 1; i2 < split.length; i2 += 2) {
      split[i2] = split[i2].replace(/\n/g, "\\n");
    }
    return JSON.parse(split.join('"'));
  }
  function signed(n2) {
    return (n2 > 0 ? "+" : "") + n2;
  }
  function svgImg(attrs, body) {
    return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>')`;
  }

  // src/v2.ts
  function round(v2) {
    return [Math.round(v2[0]), Math.round(v2[1])];
  }
  function sum(a2, b2, m2 = 1) {
    return [a2[0] + b2[0] * m2, a2[1] + b2[1] * m2];
  }
  function sub(a2, b2) {
    return [a2[0] - b2[0], a2[1] - b2[1]];
  }
  function length(d2) {
    return Math.sqrt(d2[0] * d2[0] + d2[1] * d2[1]);
  }
  function norm(v2, scale2 = 1) {
    let d2 = length(v2) || 1;
    return [v2[0] / d2 * scale2, v2[1] / d2 * scale2];
  }
  function dist(a2, b2) {
    return length([a2[0] - b2[0], a2[1] - b2[1]]);
  }
  function dot(a2, b2) {
    return a2[0] * b2[0] + a2[1] * b2[1];
  }
  function det(a2, b2) {
    return a2[0] * b2[1] - a2[1] * b2[0];
  }
  function rot(v2) {
    return [v2[1], -v2[0]];
  }
  function scale(v2, n2) {
    return [v2[0] * n2, v2[1] * n2];
  }
  function lerp(start, end, amt) {
    return [
      start[0] * (1 - amt) + amt * end[0],
      start[1] * (1 - amt) + amt * end[1]
    ];
  }
  function angleBetween(a2, b2) {
    return Math.atan2(det(a2, b2), dot(a2, b2));
  }

  // src/sym-shadowcast.ts
  function shadowcast(cx, cy, transparent, reveal) {
    "use strict";
    var scan = function(y2, start, end, transform) {
      if (start >= end) {
        return;
      }
      var xmin = Math.round((y2 - 0.5) * start);
      var xmax = Math.ceil((y2 + 0.5) * end - 0.5);
      for (var x = xmin; x <= xmax; x++) {
        var realx = cx + transform.xx * x + transform.xy * y2;
        var realy = cy + transform.yx * x + transform.yy * y2;
        if (transparent(realx, realy)) {
          if (x >= y2 * start && x <= y2 * end) {
            reveal(realx, realy);
          }
        } else {
          if (x >= (y2 - 0.5) * start && x - 0.5 <= y2 * end) {
            reveal(realx, realy);
          }
          scan(y2 + 1, start, (x - 0.5) / y2, transform);
          start = (x + 0.5) / y2;
          if (start >= end) {
            return;
          }
        }
      }
      scan(y2 + 1, start, end, transform);
    };
    var transforms = [
      { xx: 1, xy: 0, yx: 0, yy: 1 },
      { xx: 1, xy: 0, yx: 0, yy: -1 },
      { xx: -1, xy: 0, yx: 0, yy: 1 },
      { xx: -1, xy: 0, yx: 0, yy: -1 },
      { xx: 0, xy: 1, yx: 1, yy: 0 },
      { xx: 0, xy: 1, yx: -1, yy: 0 },
      { xx: 0, xy: -1, yx: 1, yy: 0 },
      { xx: 0, xy: -1, yx: -1, yy: 0 }
    ];
    reveal(cx, cy);
    for (var i2 = 0; i2 < 8; i2++) {
      scan(1, 0, 1, transforms[i2]);
    }
  }

  // src/Item.ts
  var _Item = class {
    constructor(type) {
      this.type = type;
    }
    serialize() {
      return this.type;
    }
    static deserialize(type) {
      return new _Item(type);
    }
  };
  var Item = _Item;
  Item.MEDKIT = "medkit";

  // src/Cell.ts
  var Cell = class {
    constructor(terrain, cid, obstacle, unit) {
      this.terrain = terrain;
      this.cid = cid;
      this.obstacle = obstacle;
      this.unit = unit;
      this.rfov = /* @__PURE__ */ new Set();
      this.xfov = /* @__PURE__ */ new Set();
      this.dfov = /* @__PURE__ */ new Set();
      this.povs = [];
      this.peeked = [];
      this.items = [];
    }
    calculatePovAndCover() {
      if (this.obstacle)
        return;
      this.cover = this.terrain.obstacles(this.cid);
      this.calculatePovs();
    }
    calculateFov() {
      if (this.opaque)
        return;
      let t3 = this.terrain;
      let [x, y2] = this.at;
      let visibility = /* @__PURE__ */ new Set();
      shadowcast(
        x,
        y2,
        (x2, y3) => !t3.cellAt(x2, y3).opaque,
        (x2, y3) => {
          visibility.add(t3.cid(x2, y3));
        }
      );
      this.rfov = visibility;
    }
    calculateXFov() {
      let visibility = /* @__PURE__ */ new Set();
      for (let p2 of this.povs) {
        for (let visible of p2.rfov) {
          let visibleTile = this.terrain.cells[visible];
          for (let neighbor of visibleTile.peeked)
            visibility.add(neighbor.cid);
        }
      }
      this.xfov = visibility;
    }
    calculateDFov() {
      let visibility = /* @__PURE__ */ new Set();
      for (let p2 of this.povs) {
        for (let visible of p2.rfov) {
          visibility.add(visible);
        }
      }
      this.dfov = visibility;
    }
    get at() {
      return this.terrain.fromCid(this.cid);
    }
    dist(other) {
      return dist(this.at, other.at);
    }
    seal() {
      this.obstacle = 2;
      delete this.unit;
      this.items = [];
    }
    get opaque() {
      return this.obstacle == 2;
    }
    get passable() {
      return this.obstacle < 2 && !this.hole;
    }
    get standable() {
      return this.obstacle == 0 && !this.hole && !this.unit;
    }
    calculatePovs() {
      this.povs = [];
      let t3 = this.terrain;
      let cid = this.cid;
      this.povs.push(this);
      for (let dir = 0; dir < 8; dir += 2) {
        let forward = cid + t3.dir8Deltas[dir];
        if (!t3.cells[forward].obstacle)
          continue;
        let left = [
          cid + t3.dir8Deltas[(dir + 6) % 8],
          cid + t3.dir8Deltas[(dir + 7) % 8]
        ];
        let right = [
          cid + t3.dir8Deltas[(dir + 2) % 8],
          cid + t3.dir8Deltas[(dir + 1) % 8]
        ];
        for (let side of [left, right]) {
          let peekable = t3.cells[side[0]].standable && t3.cells[side[1]].obstacle <= 1;
          if (peekable) {
            this.povs.push(t3.cells[side[0]]);
          }
        }
      }
      for (let c2 of this.povs) {
        c2.peeked.push(this);
      }
    }
    serializable() {
      return this.items.length > 0;
    }
    serialize() {
      return { items: this.items.map((i2) => i2.serialize()) };
    }
    deserialize(data) {
      for (let item of data.items) {
        this.addItem(Item.deserialize(item));
      }
    }
    addItem(item) {
      this.items.push(item);
    }
  };

  // src/Team.ts
  var Team = class {
    constructor(terrain, faction) {
      this.terrain = terrain;
      this.faction = faction;
      this.fov = /* @__PURE__ */ new Set();
    }
    serialize() {
      return {
        units: this.units.map((u2) => u2.serialize())
      };
    }
    calculate() {
      this.strength = [];
      this.weakness = [];
      this.distance = [];
      let t3 = this.terrain;
      this.fov.clear();
      for (let unit of this.units) {
        for (let cell of unit.cell.xfov)
          this.fov.add(cell);
      }
      let enemyTeam = this.terrain.teams[1 - this.faction];
      for (let cid of this.fov) {
        let cell = this.terrain.cells[cid];
        for (let enemy of enemyTeam.units) {
          let tcell = enemy.cell;
          let strength = (4 - t3.cover(cell, tcell)) % 5;
          if (!(this.strength[cid] > strength))
            this.strength[cid] = strength;
          let weakness = (4 - t3.cover(tcell, cell)) % 5;
          if (!(this.weakness[cid] > weakness))
            this.weakness[cid] = weakness;
          if (strength > 0 || weakness > 0) {
            let distance = cell.dist(tcell);
            if (!(this.distance[cid] <= distance))
              this.distance[cid] = distance;
          }
        }
      }
    }
    think() {
      return __async(this, null, function* () {
        this.terrain.aiTurn = true;
        this.calculate();
        for (let unit of this.terrain.units) {
          if (unit.team == this && unit.alive) {
            yield unit.think();
          }
        }
        this.terrain.aiTurn = false;
      });
    }
    endTurn() {
    }
    beginTurn() {
      for (let c2 of this.units) {
        c2.ap = 2;
      }
      this.terrain.activeTeam = this;
    }
    get units() {
      return this.terrain.units.filter((c2) => c2.team == this);
    }
    get enemy() {
      return this.terrain.teams[1 - this.faction];
    }
    get name() {
      return ["RED", "BLUE"][this.faction];
    }
    get color() {
      return ["RED", "BLUE"][this.faction];
    }
  };
  Team.BLUE = 0;
  Team.RED = 1;

  // src/Unit.ts
  var velocityAccuracyScale = 4 * 0;
  var velocityDefenceScale = 4 * 0;
  var _Unit = class {
    constructor(cell, o2) {
      this.cell = cell;
      this.speed = 5;
      this.maxHP = 10;
      this.hp = this.maxHP;
      this.ap = 2;
      this.exhaustion = 0;
      this.stress = 0;
      this.focus = [0, 0];
      this.velocity = [0, 0];
      this.armor = 0;
      this.sight = 20;
      this.def = 0;
      this.aggression = 0;
      this.name = "dude";
      this.symbol = "d";
      this.symbol = o2.symbol.toLowerCase();
      cell.unit = this;
      let terrain = cell.terrain;
      this.terrain.units.push(this);
      let conf = terrain.campaign.units[this.symbol];
      Object.assign(this, conf);
      this.hp = this.maxHP;
      console.assert(conf != null, conf);
      this.team = terrain.teams[o2.symbol.toUpperCase() == o2.symbol ? Team.BLUE : Team.RED];
      for (let key of _Unit.saveFields) {
        if (key in o2)
          this[key] = o2[key];
      }
      this.gun = this.terrain.campaign.guns[conf.gun];
    }
    get terrain() {
      return this.cell.terrain;
    }
    get cid() {
      return this.cell.cid;
    }
    serialize() {
      return {
        symbol: this.symbol,
        hp: this.hp,
        ap: this.ap,
        cid: this.cid,
        exhaustion: this.exhaustion,
        stress: this.stress,
        focus: this.focus,
        velocity: this.velocity
      };
    }
    get blue() {
      return this.team == this.terrain.we;
    }
    pathTo(to) {
      let cid = to.cid;
      let path = [cid];
      while (true) {
        cid = this.dists[cid][1];
        if (cid < 0)
          break;
        path.push(cid);
      }
      return path.reverse().map((cid2) => this.terrain.cells[cid2]);
    }
    get strokeColor() {
      return this.blue ? "#00a" : "#a00";
    }
    get x() {
      return this.cid % this.terrain.w;
    }
    get y() {
      return idiv(this.cid, this.terrain.w);
    }
    reachable(cell) {
      return this.apCost(cell) <= this.ap;
    }
    calculateDists() {
      this.dists = this.terrain.calcDists(this.cid);
    }
    calculate() {
      this.calculateDists();
    }
    cover(target) {
      return this.terrain.cover(this.cell, target);
    }
    get at() {
      return this.terrain.fromCid(this.cid);
    }
    apCost(cell) {
      if (!this.dists)
        return Number.MAX_VALUE;
      let l2 = this.dists[cell.cid][0];
      let moves = Math.ceil(l2 / this.speed);
      return moves;
    }
    canShoot() {
      return this.ap > 0;
    }
    perpendicularVelocity(target) {
      if (!this.moving)
        return 0;
      let dir = norm(sub(target, this.at));
      let p2 = det(dir, this.velocity);
      return p2;
    }
    velocityAccuracyBonus(target) {
      return -Math.round(Math.abs(this.perpendicularVelocity(target)) * velocityAccuracyScale);
    }
    velocityDefenceBonus(target) {
      return Math.round(Math.abs(this.perpendicularVelocity(target)) * velocityDefenceScale);
    }
    focusAccuracyBonus(target) {
      if (!this.focused)
        return 0;
      let angle = angleBetween(sub(target, this.at), this.focus);
      let bonus = 1 - 4 * Math.abs(angle) / Math.PI;
      if (bonus < 0)
        bonus /= 2;
      return Math.round(bonus * length(this.focus));
    }
    focusDefenceBonus(target) {
      return this.focusAccuracyBonus(target);
    }
    hitChance(tcell, tunit, direct = false, bonuses) {
      if (!tunit)
        tunit = tcell.unit;
      if (tunit == this)
        return 0;
      let fov = direct ? this.cell.dfov : this.cell.xfov;
      let tat = tcell.at;
      if (!fov.has(tcell.cid))
        return 0;
      let cover = this.cover(tcell || tunit.cell);
      if (cover == -1)
        return 0;
      if (!bonuses)
        bonuses = {};
      bonuses.accuracy = this.gun.accuracy;
      bonuses.cover = -cover * 25;
      bonuses.dodge = -tunit.def;
      bonuses.distance = -this.gun.accuracyPenalty(this.dist(tunit));
      bonuses.ownVelocity = this.velocityAccuracyBonus(tat);
      bonuses.targetVelocity = -tunit.velocityDefenceBonus(this.at);
      bonuses.ownFocus = this.focusAccuracyBonus(tat);
      bonuses.targetFocus = -tunit.focusDefenceBonus(this.at);
      if (bonuses.cover < bonuses.targetVelocity)
        bonuses.targetVelocity = 0;
      else
        bonuses.cover = 0;
      console.log(JSON.stringify(bonuses));
      let chance = Math.round(Object.values(bonuses).reduce((a2, b2) => a2 + b2));
      return chance;
    }
    die() {
      this.terrain.units = this.terrain.units.filter((c2) => c2.hp > 0);
      delete this.cell.unit;
      if (this.team.units.length == 0) {
        this.terrain.declareVictory(this.team.enemy);
      }
    }
    takeDamage(dmg) {
      this.hp = Math.max(0, this.hp - dmg);
      if (this.hp <= 0) {
        this.die();
      }
      this.onChange();
    }
    onChange() {
      this.terrain.animate({ char: this });
    }
    shoot(tcell) {
      return __async(this, null, function* () {
        if (!tcell)
          return false;
        let target = tcell.unit;
        if (!target)
          return false;
        let chance = this.hitChance(tcell);
        if (chance == 0)
          return false;
        let success = this.terrain.rni() % 100 < chance;
        this.ap = 0;
        let dmg = 0;
        if (success) {
          dmg = this.gun.damageRoll(this, target.cell, this.terrain.rnf);
        }
        yield this.animateShoot(target.cid, dmg);
        target.takeDamage(dmg);
        if (target.hp <= 0)
          this.team.calculate();
        let dir = norm(sub(tcell.at, this.at));
        this.focusAccuracyBonus(tcell.at);
        this.focus = scale(dir, Math.min(this.gun.maxFocus, 10 + this.focusAccuracyBonus(tcell.at)));
        this.velocity = [0, 0];
        return true;
      });
    }
    teleport(to) {
      if (this.cell) {
        if (this.cell == to)
          return;
        delete this.cell.unit;
      }
      to.unit = this;
      this.cell = to;
      this.calculate();
    }
    calculateReactionFire(path) {
      let enemies = this.team.enemy.units;
      let rfPoints = [];
      for (let enemy of enemies) {
        if (enemy.ap == 0)
          continue;
        let bestMoment = max(
          path,
          (step) => !step.unit && enemy.averageDamage(step, this, true)
        );
        if (bestMoment && bestMoment.val >= 1) {
          rfPoints.push({ moment: bestMoment.ind, enemy });
        }
      }
      rfPoints = rfPoints.sort((a2, b2) => a2.moment > b2.moment ? 1 : -1);
      return rfPoints;
    }
    calculateVelocity(path) {
      let delta = sub(path[path.length - 1].at, path[0].at);
      return round(norm(delta, this.speed));
    }
    move(to) {
      return __async(this, null, function* () {
        if (to == this.cell || !to)
          return false;
        this.ap -= this.apCost(to);
        let path = this.pathTo(to);
        this.velocity = this.calculateVelocity(path);
        this.focus = norm(this.velocity, 10);
        let enemies = this.team.enemy.units;
        let rfPoints = [];
        for (let enemy of enemies) {
          if (enemy.ap == 0)
            continue;
          let bestMoment = max(
            path,
            (step) => !step.unit && enemy.averageDamage(step, this, true)
          );
          if (bestMoment && bestMoment.val >= 1) {
            rfPoints.push({ moment: bestMoment.ind, enemy });
          }
        }
        rfPoints = rfPoints.sort((a2, b2) => a2.moment > b2.moment ? 1 : -1);
        for (let owPoint of rfPoints) {
          let place = path[owPoint.moment];
          yield this.animateWalk(this.pathTo(place));
          this.teleport(place);
          yield owPoint.enemy.shoot(place);
          if (!this.alive)
            return true;
        }
        yield this.animateWalk(this.pathTo(to));
        this.teleport(to);
        if (this.cell.items.length > 0) {
          this.hp = this.maxHP;
          this.cell.items = [];
        }
        return true;
      });
    }
    animateWalk(path) {
      return __async(this, null, function* () {
        if (path.length <= 1)
          return;
        yield this.terrain.animate({ anim: "walk", char: this, path });
      });
    }
    animateShoot(tcid, damage) {
      return __async(this, null, function* () {
        yield this.terrain.animate({
          anim: "shoot",
          from: this.cid,
          to: tcid,
          damage
        });
      });
    }
    canDamage(target) {
      return target && this.team != target.team && this.cell.xfov.has(target.cid) && this.canShoot();
    }
    bestPosition() {
      let team = this.team;
      this.calculate();
      let bestScore = -100;
      let bestAt;
      for (let i2 in this.dists) {
        let d2 = this.dists[i2][0];
        if (d2 > this.speed * this.ap)
          continue;
        let score = team.strength[i2] - team.weakness[i2] - idiv(d2, this.speed) * 0.5 - d2 * 1e-3;
        score += team.distance[i2] * this.aggression;
        if (score > bestScore) {
          bestScore = score;
          bestAt = Number(i2);
        }
      }
      return this.terrain.cells[bestAt];
    }
    averageDamage(tcell, tunit, direct = false) {
      let hitChance = this.hitChance(tcell, tunit, direct);
      return hitChance * this.gun.averageDamage(this, tcell) / 100;
    }
    bestTarget() {
      let bestScore = -100;
      let bestAt = null;
      for (let tchar of this.terrain.units) {
        if (tchar.team == this.team || tchar.hp <= 0)
          continue;
        let score = this.averageDamage(tchar.cell);
        if (score > bestScore) {
          bestScore = score;
          bestAt = tchar.cell;
        }
      }
      return bestAt;
    }
    think() {
      return __async(this, null, function* () {
        yield this.move(this.bestPosition());
        if (this.ap > 0) {
          yield this.shoot(this.bestTarget());
        }
      });
    }
    dist(other) {
      return dist(this.at, other.at);
    }
    get alive() {
      return this.hp > 0;
    }
    friendly(other) {
      return other && this.team == other.team;
    }
    get moving() {
      return length(this.velocity) > 0;
    }
    get focused() {
      return length(this.focus) > 0;
    }
  };
  var Unit = _Unit;
  Unit.EYE = -1;
  Unit.GUNNER = 1;
  Unit.ASSAULT = 2;
  Unit.SNIPER = 3;
  Unit.RECON = 4;
  Unit.MEDIC = 5;
  Unit.HEAVY = 6;
  Unit.COMMANDER = 7;
  Unit.saveFields = "hp ap exhaustion stress focus velocity".split(
    " "
  );

  // src/Gun.ts
  var Gun = class {
    constructor(o2) {
      this.damageOptimalRange = [1, 20];
      this.damage = [4, 5];
      this.damagePenaltyPerCell = 100;
      this.accuracyPenaltyMax = 20;
      this.accuracy = 60;
      this.accuracyOptimalRange = [1, 1];
      this.accuracyPenaltyPerCell = 1;
      this.damagePenaltyMax = 2;
      this.breach = 0;
      this.maxFocus = 30;
      this.name = "Gun";
      if (o2)
        Object.assign(this, o2);
    }
    damagePenalty(dist2) {
      let diff = 0;
      if (dist2 < this.damageOptimalRange[0]) {
        diff = this.damageOptimalRange[0] - dist2;
      }
      if (dist2 > this.damageOptimalRange[1]) {
        diff = dist2 - this.damageOptimalRange[1];
      }
      return Math.floor(Math.min(this.damagePenaltyMax, this.damagePenaltyPerCell * diff));
    }
    accuracyPenalty(dist2) {
      let diff = 0;
      if (dist2 < this.accuracyOptimalRange[0]) {
        diff = this.accuracyOptimalRange[0] - dist2;
      }
      if (dist2 > this.accuracyOptimalRange[1]) {
        diff = dist2 - this.accuracyOptimalRange[1];
      }
      return Math.floor(Math.min(this.accuracyPenaltyMax, this.accuracyPenaltyPerCell * diff));
    }
    averageDamage(by, tcell, tunit) {
      if (!tunit)
        tunit = tcell.unit;
      let dmg = (this.damage[1] + this.damage[0]) * 0.5;
      if (tunit)
        dmg -= Math.max(0, tcell.unit.armor - this.breach);
      dmg -= this.damagePenalty(by.dist(tcell));
      return Math.max(0, Math.round(dmg * 10) / 10);
    }
    damageRoll(by, tcell, rnf) {
      let dmg = rnf() * (this.damage[1] - this.damage[0]) + this.damage[0];
      if (tcell.unit)
        dmg -= Math.max(0, tcell.unit.armor - this.breach);
      dmg -= this.damagePenalty(by.dist(tcell));
      return Math.max(0, Math.round(dmg));
    }
  };

  // src/Terrain.ts
  var _Terrain = class {
    constructor(campaign, stage, state, animate) {
      this.campaign = campaign;
      this.stage = stage;
      this.animate = animate;
      this.aiTurn = false;
      this.rni = random(1);
      this.rnf = () => this.rni() % 1e9 / 1e9;
      for (let gunId in campaign.guns) {
        campaign.guns[gunId] = new Gun(campaign.guns[gunId]);
      }
      this.init(this.stage.terrain);
      if (state)
        this.loadState(state);
    }
    serialize() {
      return {
        teams: this.teams.map((t3) => t3.serialize()),
        cells: this.cells.filter((c2) => c2.serializable()).map((o2) => o2.serialize()),
        activeTeam: this.activeTeam.faction
      };
    }
    init(terrainString) {
      this.terrainString = terrainString;
      let lines = terrainString.split("\n").map((s2) => s2.trim()).filter((s2) => s2.length > 0);
      this.h = lines.length;
      this.w = Math.max(...lines.map((s2) => s2.length));
      this.cells = [];
      this.units = [];
      this.teams = [];
      delete this.victor;
      for (let i2 = 0; i2 < 2; i2++) {
        let team = new Team(this, i2);
        this.teams[i2] = team;
      }
      for (let y2 = 0; y2 < this.h; y2++) {
        let line = lines[y2];
        for (let x = 0; x < this.w; x++) {
          let cid = x + y2 * this.w;
          let symbol = line[x] || " ";
          let cell = new Cell(this, cid, ["+", "#"].indexOf(symbol) + 1);
          if (this.campaign.units[symbol.toLowerCase()])
            new Unit(cell, { symbol, cid });
          if (symbol == "*")
            cell.addItem(new Item(Item.MEDKIT));
          if (symbol == "~")
            cell.hole = true;
          this.cells[cid] = cell;
        }
      }
      for (let i2 = 0; i2 < this.w; i2++) {
        this.seal(i2, 0);
        this.seal(i2, this.h - 1);
      }
      for (let i2 = 0; i2 < this.h; i2++) {
        this.seal(0, i2);
        this.seal(this.w - 1, i2);
      }
      this.dir8Deltas = _Terrain.dirs8.map((v2) => v2[0] + v2[1] * this.w);
      for (let c2 of this.cells) {
        if (!c2.obstacle)
          c2.calculatePovAndCover();
      }
      console.log(this.w);
      console.log(this.h);
      console.time("FOV");
      for (let c2 of this.cells) {
        if (!c2.obstacle) {
          c2.calculatePovAndCover();
          c2.calculateFov();
        }
      }
      console.timeEnd("FOV");
      for (let c2 of this.cells) {
        if (!c2.obstacle) {
          c2.calculateXFov();
          c2.calculateDFov();
        }
      }
      this.activeTeam = this.teams[0];
      console.log(this);
    }
    seal(x, y2) {
      this.cells[this.cid(x, y2)].seal();
    }
    loadState(state) {
      if (!state || !state.teams)
        return;
      this.units = [];
      this.cells.forEach((c2) => {
        delete c2.unit;
        c2.items = [];
      });
      this.teams = state.teams.map((t3, i2) => {
        let team = new Team(this, i2);
        for (let u2 of t3.units) {
          let unit = new Unit(this.cells[u2.cid], u2);
          unit.team = team;
        }
        return team;
      });
      this.activeTeam = this.teams[state.activeTeam];
    }
    calcDists(fromi) {
      let dists = this.cells.map((_2) => [Number.MAX_VALUE, -1]);
      dists[fromi] = [0, -1];
      let todo = [fromi];
      let char = this.cells[fromi].unit;
      while (todo.length > 0) {
        let curi = todo.shift();
        let curl = dists[curi][0];
        let curc = this.cells[curi];
        for (let dir = 0; dir < 8; dir++) {
          let diagonal = dir % 2;
          let nexti = this.dir8Deltas[dir] + curi;
          let nextc = this.cells[nexti];
          if (!nextc.passable || nextc.unit && !nextc.unit.friendly(char))
            continue;
          if (diagonal && (this.cells[curi + this.dir8Deltas[(dir + 1) % 8]].obstacle || this.cells[curi + this.dir8Deltas[(dir + 7) % 8]].obstacle))
            continue;
          let obstacleness = nextc.obstacle + curc.obstacle + (curc.unit ? 1 : 0) + (nextc.unit ? 1 : 0);
          if (obstacleness > 1 && (diagonal && obstacleness > 0))
            continue;
          let next = dists[nexti];
          let plusl = obstacleness + (diagonal ? 1.414 : 1);
          if (next[0] > curl + plusl) {
            dists[nexti] = [curl + plusl, curi];
            todo.push(nexti);
          }
        }
      }
      for (let i2 = 0; i2 < dists.length; i2++) {
        if (!this.cells[i2].standable)
          dists[i2][0] = Number.MAX_VALUE;
      }
      return dists;
    }
    safeCid(x, y2) {
      if (x >= 0 && y2 >= 0 && x < this.w && y2 < this.h)
        return this.cid(x, y2);
    }
    cid(x, y2) {
      return x + y2 * this.w;
    }
    cellAt(x, y2) {
      return this.cells[this.cid(x, y2)];
    }
    fromCid(ind) {
      return [ind % this.w, idiv(ind, this.w)];
    }
    calculateFov(cid) {
      let [x, y2] = this.fromCid(cid);
      let visibility = /* @__PURE__ */ new Set();
      shadowcast(
        x,
        y2,
        (x2, y3) => !this.cellAt(x2, y3).opaque,
        (x2, y3) => {
          for (let pov of this.cells[this.cid(x2, y3)].peeked)
            visibility.add(pov.cid);
        }
      );
      return visibility;
    }
    calculateDirectFov(cid) {
      let [x, y2] = this.fromCid(cid);
      let visibility = /* @__PURE__ */ new Set();
      shadowcast(
        x,
        y2,
        (x2, y3) => !this.cellAt(x2, y3).opaque,
        (x2, y3) => {
          visibility.add(this.cid(x2, y3));
        }
      );
      return visibility;
    }
    obstacles(cid) {
      let obstacles = [];
      for (let dir = 0; dir < 8; dir += 2) {
        let forward = cid + this.dir8Deltas[dir];
        obstacles.push(this.cells[forward].obstacle);
      }
      return obstacles;
    }
    cover(from, target) {
      let visible = from.xfov.has(target.cid);
      if (!visible)
        return -1;
      let worstCover = 2;
      for (let pov of from.povs) {
        let bestCover = 0;
        let delta = sub(target.at, pov.at);
        for (let i2 = 0; i2 < 4; i2++) {
          let cover = target.cover[i2];
          if (cover <= bestCover)
            continue;
          let dot2 = dot(_Terrain.dirs8[i2 * 2], delta);
          if (dot2 < -1e-3)
            bestCover = cover;
        }
        if (bestCover < worstCover)
          worstCover = bestCover;
      }
      return worstCover;
    }
    declareVictory(team) {
      this.victor = team;
    }
    get we() {
      return this.teams[Team.BLUE];
    }
    endSideTurn() {
      this.activeTeam.endTurn();
      this.teams[(this.activeTeam.faction + 1) % this.teams.length].beginTurn();
    }
  };
  var Terrain = _Terrain;
  Terrain.dirs8 = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
  ];

  // src/MovingText.ts
  var MovingText = class {
    constructor(text, color, lifeTime, at, vel = [0, 0]) {
      this.text = text;
      this.color = color;
      this.lifeTime = lifeTime;
      this.at = at;
      this.vel = vel;
      this.time = 0;
    }
    update(dTime) {
      this.time += dTime;
      this.at = sum(this.at, this.vel, dTime);
      return this.time < this.lifeTime;
    }
    render(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.shadowColor = `black`;
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.font = `12pt "Courier"`;
      ctx.textAlign = "center";
      let y2 = 0;
      let l2 = 0;
      for (let line of this.text.split("|")) {
        ctx.fillText(
          line.trim().substr(0, Math.floor(this.time * 70) - l2),
          this.at[0],
          this.at[1] + y2
        );
        l2 += line.length;
        y2 += 20;
      }
      ctx.restore();
    }
  };

  // src/settings.ts
  var insideBorder = 0;

  // src/RenderSchematic.ts
  var renderPovs = true;
  var renderThreats = false;
  var dashInterval = 4;
  var Doll = class {
    constructor(unit, renderer) {
      this.unit = unit;
      this.at = renderer.cidToPoint(unit.cid);
    }
  };
  var RenderSchematic = class {
    constructor(game) {
      this.game = game;
      this.canvasCacheOutdated = false;
      this.anim = [];
      this.animQueue = [];
      this.dolls = [];
      this.tileSize = 32;
      this.screenPos = [0, 0];
      this.dollCache = {};
      this.initSprites();
    }
    get canvas() {
      return this.game.canvas;
    }
    synch() {
      this.dolls = this.terrain.units.map((unit) => new Doll(unit, this));
      this.updateCanvasCache();
    }
    get terrain() {
      return this.game.terrain;
    }
    resize() {
      if (!this.canvas)
        return;
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this.width = this.canvas.clientWidth;
      this.height = this.canvas.clientHeight;
      if (this.terrain)
        this.screenPos = [
          0.5 * (this.width - this.terrain.w * this.tileSize),
          0.5 * (this.height - this.terrain.h * this.tileSize)
        ];
      this.canvas.getContext("2d").imageSmoothingEnabled = false;
    }
    update(dTime) {
      let d2 = this.lookingAt ? dist(this.lookingAt, this.screenPos) : 0;
      if (this.lookingAt && d2 > 20) {
        this.screenPos = lerp(
          this.screenPos,
          this.lookingAt,
          Math.min(1, dTime * Math.max(d2 / 50, 10) * this.animSpeed)
        );
      } else {
        delete this.lookingAt;
        let anims = this.anim;
        this.anim = [];
        anims = anims.filter((fx) => {
          return fx.update(dTime);
        });
        this.anim = this.anim.concat(anims);
        if (this.animQueue.length > 0 && !this.animQueue[0].update(dTime))
          this.animQueue.shift();
        if (this.animQueue.length == 0 && this.blockingAnimationEnd) {
          this.blockingAnimationEnd();
          delete this.blockingAnimationEnd;
        }
      }
      this.dolls = this.dolls.filter((d3) => d3.unit.alive);
    }
    render(ctx) {
      if (!ctx)
        return;
      ctx.clearRect(0, 0, this.width, this.height);
      let t3 = this.terrain;
      ctx.save();
      ctx.translate(...this.screenPos);
      if (!this.canvasCache || this.canvasCacheOutdated)
        this.updateCanvasCache();
      ctx.clearRect(0, 0, t3.w * this.tileSize, t3.h * this.tileSize);
      ctx.drawImage(this.canvasCache, 0, 0);
      for (let d2 of this.dolls) {
        this.renderDoll(ctx, d2);
      }
      for (let fx of this.anim)
        if (fx.render)
          fx.render(ctx);
      if (this.animQueue.length > 0 && this.animQueue[0].render)
        this.animQueue[0].render(ctx);
      if (!this.busy)
        this.renderPath(ctx, this.game.hovered);
      ctx.restore();
      return this.animQueue.length > 0;
    }
    renderPath(ctx, cell) {
      let unit = this.game.chosen;
      if (!unit || !cell || !unit.dists || !unit.dists[cell.cid] || unit.dists[cell.cid][1] == -1)
        return;
      if (!unit.reachable(cell))
        return;
      let end = this.cidToCenterPoint(cell.cid);
      ctx.beginPath();
      if (unit.reachable(cell))
        ctx.arc(end[0], end[1], this.tileSize / 4, 0, Math.PI * 2);
      else {
        ctx.moveTo(end[0] - this.tileSize / 4, end[1] - this.tileSize / 4);
        ctx.lineTo(end[0] + this.tileSize / 4, end[1] + this.tileSize / 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(end[0] - this.tileSize / 4, end[1] + this.tileSize / 4);
        ctx.lineTo(end[0] + this.tileSize / 4, end[1] - this.tileSize / 4);
      }
      ctx.stroke();
      let path = unit.pathTo(cell);
      ctx.beginPath();
      ctx.moveTo(...this.cidToCenterPoint(path[0].cid));
      for (let i2 of path)
        ctx.lineTo(...this.cidToCenterPoint(i2.cid));
      ctx.stroke();
    }
    renderThreats(ctx, cell) {
      let t3 = this.terrain;
      let i2 = cell.cid;
      if (!t3.teams[Team.RED].strength)
        return;
      ctx.strokeStyle = "#800";
      ctx.lineWidth = t3.teams[Team.RED].strength[i2] == 4 ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(3.5, 3.5);
      ctx.lineTo(3.5, 3.5 + 3 * t3.teams[Team.RED].strength[i2]);
      ctx.stroke();
      ctx.strokeStyle = "#008";
      ctx.lineWidth = t3.teams[Team.RED].weakness[i2] == 4 ? 3 : 1;
      ctx.beginPath();
      ctx.moveTo(3.5, 3.5);
      ctx.lineTo(3.5 + 3 * t3.teams[Team.RED].weakness[i2], 3.5);
      ctx.stroke();
    }
    renderCell(ctx, cell) {
      let at = this.cidToPoint(cell.cid);
      let sprite = [, this.lowTile, this.highTile][cell.obstacle];
      if (cell.hole) {
        sprite = this.waterTile;
      }
      if (sprite)
        ctx.drawImage(sprite, at[0], at[1]);
      if (cell.items.length > 0) {
        ctx.translate(...at);
        ctx.fillStyle = "#080";
        ctx.fillRect(this.tileSize * 0.35, 0, this.tileSize * 0.3, this.tileSize);
        ctx.fillRect(0, this.tileSize * 0.35, this.tileSize, this.tileSize * 0.3);
        ctx.translate(...scale(at, -1));
      }
    }
    renderCellUI(ctx, cell) {
      let at = this.cidToPoint(cell.cid);
      let g2 = this.game;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      if (g2.hovered && !g2.hovered.opaque) {
        let xfov = g2.hovered.xfov.has(cell.cid);
        let dfov = g2.hovered.rfov.has(cell.cid);
        if (!dfov) {
          ctx.fillStyle = `rgba(${xfov ? "50,50,0,0.04" : "0,0,50,0.1"})`;
          ctx.fillRect(at[0], at[1], this.tileSize, this.tileSize);
        }
        if (renderThreats)
          this.renderThreats(ctx, cell);
      }
      if (g2.chosen && g2.chosen.dists && !this.busy) {
        let moves = g2.chosen.apCost(cell);
        if (moves > 0 && moves <= g2.chosen.ap) {
          let img = [, this.ap1Sprite, this.ap2Sprite][Math.floor(moves)];
          if (img)
            ctx.drawImage(img, at[0], at[1]);
        }
      }
      if (renderPovs && cell.povs && cell.peeked.includes(this.game.hovered)) {
        ctx.strokeStyle = `rgba(0,0,0,0.5)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(
          at[0] + this.tileSize / 2,
          at[1] + this.tileSize / 2,
          this.tileSize / 4,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }
    renderDoll(ctx, doll) {
      ctx.save();
      ctx.translate(...doll.at);
      this.useDollCache(ctx, doll);
      if (doll.unit == this.game.chosen) {
        this.outline(ctx, doll, Math.sin(new Date().getTime() / 100) + 1);
      } else if (doll.unit == this.game.hoveredChar) {
        this.outline(ctx, doll, 1.5);
      }
      ctx.restore();
    }
    outline(ctx, doll, width = 2) {
      ctx.save();
      ctx.strokeStyle = doll.unit.strokeColor;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(
        this.tileSize / 2,
        this.tileSize / 2,
        this.tileSize * 0.4,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();
    }
    useDollCache(ctx, doll) {
      let unit = doll.unit;
      let state = ["cid", "hp", "ap", "kind", "faction", "focus", "velocity"].map(
        (key2) => unit[key2]
      );
      state.push(this.dollTint(doll));
      let key = JSON.stringify(state);
      if (!(key in this.dollCache))
        this.dollCache[key] = canvasCache(
          [this.tileSize * 2, this.tileSize * 2],
          (ctx2) => this.renderDollBody(ctx2, doll, this.dollTint(doll))
        );
      ctx.drawImage(
        this.dollCache[key],
        -0.5 * this.tileSize,
        -0.5 * this.tileSize
      );
    }
    dollTint(doll) {
      if (this.busy || this.terrain.aiTurn)
        return 0;
      let unit = doll.unit;
      let flankNum = 0;
      let hover = this.game.hovered;
      if (hover && !hover.opaque && hover.xfov) {
        let visible = hover.xfov.has(unit.cid) || unit.team == this.game.lastSelectedFaction;
        if (visible)
          flankNum = (this.terrain.cover(unit.cell, hover) == 0 ? 1 : 0) + (this.terrain.cover(hover, unit.cell) == 0 ? 2 : 0);
        else
          flankNum = 4;
      }
      if (!this.game.hovered)
        flankNum = 0;
      return flankNum;
    }
    renderDollBody(ctx, doll, tint) {
      let unit = doll.unit;
      ctx.fillStyle = ["#fff", "#fba", "#cfa", "#ffa", "#ccc"][tint];
      ctx.strokeStyle = unit.strokeColor;
      ctx.scale(this.tileSize, this.tileSize);
      ctx.translate(0.5, 0.5);
      ctx.shadowColor = "#444";
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(0.5, 0.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = `rgba(0,0,0,0)`;
      ctx.lineWidth = 0.1;
      if (unit.ap > 0) {
        ctx.fillStyle = doll.unit.strokeColor;
        ctx.beginPath();
        ctx.arc(0.2, 0.4, 0.07, 0, Math.PI * 2);
        ctx.fill();
        if (unit.ap > 1) {
          ctx.beginPath();
          ctx.arc(0.8, 0.4, 0.07, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = unit.strokeColor;
      ctx.font = `bold 0.5pt Courier`;
      ctx.fillText(unit.symbol.toUpperCase(), 0.29, 0.66);
      ctx.stroke();
      ctx.restore();
      if (unit.focused) {
        ctx.save();
        ctx.translate(0.5, 0.5);
        let angle = Math.atan2(unit.focus[1], unit.focus[0]);
        ctx.rotate(angle);
        ctx.lineWidth = 3e-3 * length(unit.focus);
        ctx.beginPath();
        ctx.moveTo(0.45, -0.15);
        ctx.lineTo(0.6, 0);
        ctx.lineTo(0.45, 0.15);
        ctx.stroke();
        ctx.restore();
      }
      if (unit.moving) {
        ctx.save();
        ctx.translate(0.5, 0.5);
        let angle = Math.atan2(unit.velocity[1], unit.velocity[0]);
        ctx.rotate(angle);
        ctx.lineWidth = 0.01 + 0.01 * length(unit.velocity);
        ctx.beginPath();
        ctx.moveTo(-0.6, -0.15);
        ctx.lineTo(-0.45, 0);
        ctx.lineTo(-0.6, 0.15);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.lineWidth = 0.05;
      ctx.transform(-1, 0, 0, 1, 1, 0);
      ctx.setLineDash([6 / unit.maxHP - 0.05, 0.05]);
      ctx.beginPath();
      ctx.arc(0.5, 0.5, 0.35, 0, Math.PI * unit.hp / unit.maxHP);
      ctx.stroke();
      ctx.restore();
    }
    cidToPoint(ind) {
      return this.terrain.fromCid(ind).map((a2) => a2 * this.tileSize);
    }
    cidToCenterPoint(ind) {
      return scale(
        sum(this.terrain.fromCid(ind), [0.5, 0.5]),
        this.tileSize
      );
    }
    cidToCenterScreen(ind) {
      return sum(this.cidToCenterPoint(ind), this.screenPos);
    }
    cidFromPoint(x, y2) {
      return this.terrain.safeCid(idiv(x, this.tileSize), idiv(y2, this.tileSize));
    }
    cellAtScreenPos(x, y2) {
      return this.terrain.cells[this.cidFromPoint(...sub([x, y2], this.screenPos))];
    }
    get animSpeed() {
      return 2;
    }
    updateCanvasCache() {
      if (!this.canvasCache)
        this.canvasCache = createCanvas(
          this.terrain.w * this.tileSize,
          this.terrain.h * this.tileSize
        );
      if (!this.canvasTerrain)
        this.canvasTerrain = createCanvas(
          this.terrain.w * this.tileSize,
          this.terrain.h * this.tileSize
        );
      let tctx = this.canvasTerrain.getContext("2d");
      tctx.clearRect(
        0,
        0,
        this.terrain.w * this.tileSize,
        this.terrain.h * this.tileSize
      );
      for (let i2 = 0; i2 < this.terrain.cells.length; i2++) {
        let cell = this.terrain.cells[i2];
        this.renderCell(tctx, cell);
      }
      let ctx = this.canvasCache.getContext("2d");
      ctx.clearRect(
        0,
        0,
        this.terrain.w * this.tileSize,
        this.terrain.h * this.tileSize
      );
      ctx.save();
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowColor = "#444";
      ctx.drawImage(this.canvasTerrain, 0, 0);
      ctx.restore();
      for (let i2 = 0; i2 < this.terrain.cells.length; i2++) {
        let cell = this.terrain.cells[i2];
        this.renderCellUI(ctx, cell);
      }
      this.canvasCacheOutdated = false;
    }
    resetCanvasCache() {
      this.canvasCacheOutdated = true;
    }
    text(from, text) {
      let at = sum(from, [0, -10]);
      this.anim.push(new MovingText(text, "#f00", 3, at, [0, -10]));
    }
    renderBullet(ctx, [from, to], time) {
      ctx.beginPath();
      let delta = norm(sub(to, from), -20);
      let at = lerp(from, to, time);
      this.lookAt(at);
      let tail = sum(at, delta);
      var grad = ctx.createLinearGradient(tail[0], tail[1], at[0], at[1]);
      grad.addColorStop(0, `rgba(0,0,0,0)`);
      grad.addColorStop(1, `rgba(0,0,0,1)`);
      ctx.lineWidth = 4;
      ctx.strokeStyle = grad;
      ctx.moveTo(...tail);
      ctx.lineTo(...at);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
    }
    insideScreen(at) {
      at = sum(at, this.screenPos);
      return at[0] >= insideBorder && at[1] >= insideBorder && at[0] <= this.width - insideBorder && at[1] <= this.height - insideBorder;
    }
    lookAtCid(cid) {
      this.lookAt(this.cidToCenterPoint(cid));
    }
    lookAt(at) {
      let newLookingA = [-at[0] + this.width / 2, -at[1] + this.height / 2];
      if (dist(this.screenPos, newLookingA) <= 20) {
        this.screenPos = newLookingA;
      }
      if (!this.insideScreen(at))
        this.lookingAt = newLookingA;
    }
    shoot(from, to, dmg) {
      let tiles = [from, to].map((v2) => this.terrain.cells[v2]);
      let points;
      let shootPoint;
      let a2, b2;
      completely:
        for (a2 of tiles[0].povs)
          for (b2 of tiles[1].povs) {
            if (a2.rfov.has(b2.cid)) {
              points = [a2, b2].map((v2) => this.cidToCenterPoint(v2.cid));
              break completely;
            }
          }
      if (dmg > 0) {
        shootPoint = points[1];
      } else {
        let dir = norm(sub(points[1], points[0]));
        shootPoint = sum(
          sum(points[1], rot(dir)),
          dir,
          10 * this.tileSize
        );
      }
      let fdoll = this.dollAt(from);
      let tdoll = this.dollAt(to);
      let time = 0;
      if (a2.cid == from && b2.cid == to) {
        time = 1;
      }
      this.animQueue.push({
        update: (dTime) => {
          if (time >= 1 && time <= 2) {
            time += dTime * Math.min(
              10,
              1e3 / dist(points[0], shootPoint) * this.animSpeed
            );
          } else {
            let peek = (time < 1 ? time : 3 - time) * 0.6;
            for (let i2 = 0; i2 < 2; i2++) {
              let doll = [fdoll, tdoll][i2];
              doll.at = lerp(
                this.cidToPoint([from, to][i2]),
                sub(points[i2], [this.tileSize / 2, this.tileSize / 2]),
                peek
              );
            }
            time += dTime * this.animSpeed * 10;
          }
          if (time > 3) {
            this.text(points[1], dmg > 0 ? `-${dmg}` : "MISS");
            fdoll.at = this.cidToPoint(fdoll.unit.cid);
            tdoll.at = this.cidToPoint(tdoll.unit.cid);
            return false;
          }
          return true;
        },
        render: (ctx) => {
          if (time > 1 && time < 2)
            this.renderBullet(ctx, [points[0], shootPoint], time - 1);
        }
      });
    }
    walk(doll, steps) {
      let path = steps.map((v2) => this.cidToPoint(v2.cid));
      let time = 0;
      this.animQueue.push({
        update: (dTime) => {
          time += dTime * 15 * this.animSpeed;
          if (!path[Math.floor(time) + 1]) {
            doll.at = path[path.length - 1];
            return false;
          }
          doll.at = lerp(
            path[Math.floor(time)],
            path[Math.floor(time) + 1],
            time - Math.floor(time)
          );
          this.lookAt(doll.at);
          return true;
        }
      });
    }
    dollOf(unit) {
      return this.dolls.find((d2) => d2.unit == unit);
    }
    dollAt(cid) {
      return this.dolls.find((d2) => d2.unit.cid == cid);
    }
    draw(o2) {
      return __async(this, null, function* () {
        switch (o2.anim) {
          case "walk":
            this.walk(this.dollOf(o2.char), o2.path);
            break;
          case "shoot":
            this.shoot(o2.from, o2.to, o2.damage);
            break;
        }
        yield this.waitForAnim();
      });
    }
    waitForAnim() {
      return new Promise((resolve) => {
        this.blockingAnimationEnd = () => resolve();
      });
    }
    get busy() {
      return this.animQueue.length > 0;
    }
    initSprites() {
      this.ap1Sprite = canvasCache([this.tileSize, this.tileSize], (ctx) => {
        ctx.strokeStyle = "#555";
        ctx.strokeRect(4.5, 4.5, this.tileSize - 8, this.tileSize - 8);
      });
      this.ap2Sprite = canvasCache([this.tileSize, this.tileSize], (ctx) => {
        ctx.strokeStyle = "#bbb";
        ctx.strokeRect(4.5, 4.5, this.tileSize - 8, this.tileSize - 8);
      });
      this.hiddenSprite = canvasCache([this.tileSize, this.tileSize], (ctx) => {
        ctx.fillStyle = `rgba(0,0,0,0.12)`;
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
      });
      this.dashPattern = canvasCache([dashInterval, dashInterval], (ctx) => {
        for (let i2 = 0; i2 < dashInterval; i2++) {
          ctx.fillRect(i2, i2, 1, 1);
        }
      });
      this.wavePattern = canvasCache([8, 8], (ctx) => {
        ctx.beginPath();
        ctx.arc(4.5, 2, 5, 0, Math.PI);
        ctx.stroke();
      });
      this.crossPattern = canvasCache([3, 3], (ctx) => {
        for (let i2 = 0; i2 < dashInterval; i2++) {
          ctx.fillRect(dashInterval - i2 - 1, i2, 1, 1);
          ctx.fillRect(i2, i2, 1, 1);
        }
      });
      this.highTile = canvasCache([this.tileSize, this.tileSize], (ctx) => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
      });
      this.lowTile = canvasCache([this.tileSize, this.tileSize], (ctx) => {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        ctx.fillStyle = ctx.createPattern(this.dashPattern, "repeat");
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
      });
      this.waterTile = canvasCache([this.tileSize, this.tileSize], (ctx) => {
        ctx.fillStyle = ctx.createPattern(this.wavePattern, "repeat");
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
      });
    }
  };

  // src/Campaigns.ts
  var campaigns = [
    {
      name: "Default Campaign",
      version: "0.1",
      author: "Baturinsky, Red Knight",
      stage: "Red Knight's Backyard",
      guns: {
        carbine: {
          name: "Carbine",
          damage: [4, 5],
          damagePenaltyPerCell: 100,
          accuracyPenaltyMax: 20,
          accuracy: 60,
          accuracyOptimalRange: [1, 1],
          accuracyPenaltyPerCell: 1,
          damagePenaltyMax: 2,
          breach: 0
        },
        sniper: {
          name: "Sniper",
          damageOptimalRange: [1, 30],
          damagePenaltyPerCell: 0.1,
          accuracyOptimalRange: [10, 30],
          accuracyPenaltyPerCell: 1,
          breach: 1,
          aggression: -0.1
        },
        shotgun: {
          name: "Shotgun",
          damage: [6, 7],
          damageOptimalRange: [1, 1],
          damagePenaltyMax: 4,
          damagePenaltyPerCell: 0.3,
          accuracy: 80,
          accuracyOptimalRange: [1, 1],
          accuracyPenaltyPerCell: 5,
          accuracyPenaltyMax: 40,
          aggression: 0.1
        }
      },
      units: {
        g: {
          name: "Gunner",
          speed: 4,
          maxHP: 14,
          gun: "carbine"
        },
        a: {
          name: "Assault",
          speed: 6,
          armor: 1,
          gun: "shotgun"
        },
        s: {
          name: "Sharpshooter",
          maxHP: 7,
          def: 10,
          gun: "sniper"
        }
      },
      stages: [
        {
          name: "Backyard 13",
          version: "1",
          author: "baturinsky",
          terrain: `
    ##################################################
    #      #  a      ++++# + #    ++#  s             #
    # #    #  +         +#   #    ++#  ++++++++      #
    #      +  +         +#   #    ++#  ++++++++      #
    #S#    +  +         +# * #      #                #
    #      #  +          #   #      #                #
    # #    #             #   #      #                #
    #      #  +          ##a## ######                #
    #             *                                  #
    #                                                #
    #A#    #             #s         #a     ~~~       #
    #      #  +          #          #    ~~~~~~      #
    #A#    #  #      #a  #  ###    ++   ~~~#A#~~~    #
    #      #  #      #   #  #      ++       * ~~~    #
    #G#    #  ########   #  #      +#    ~ # #~~     #
    #      #             #          #    ~~~~~~~     #
    # #    ######  ###########  #####      ~~~~      #
    #      #++++      ++ # +        #                #
    #S#    #+            # +   ++   +                #
    #      #            +#          #                #
    #         ######g    #       +  #                #
    #         ######g    #####  #####                #
    #                    #   g      #      #        +#
    #      #          +  #                         ++#
    #G#    #+    *       #+++    +++#   #     #    ++#
    #      #++      +    #          #g               #
    # #    ######++###########++##########    ########
    #                 S+                             #
    #         +              A+                      #
    ##################################################
    `
        },
        {
          name: "Red Knight's Backyard",
          version: "1",
          author: "Red Knight",
          terrain: `
    ##################################################
    ################# g+         ###++    ##      ++##
    ################# ++         +                 +##
    ####################               a+          +##
    #################                   +    +      ##
    #################* #          ++++      ##      ##
    ####################                     +      ##
    #################        +# + #+a##     g#   ++g##
    ##################+##  ####################  +####
    ###   +++  #*+  # g#   a###################      #
    ###       a#   +# +#    ##########+#++++  #   # *#
    #   +      ###  #  #    #        # a+++   #   ####
    #  g+        #  #+ #       +  +  #              ##
    #   +        ## ## #      g+  +     +           ##
    #                  #  g #        #+  +++  #     ##
    #    + ## ####  #     ++#  +  +  #a  +#+  #     ##
    #    + g# +###  ####    #######  ##########     ##
    #++  + ## ##a+  +  #   +##+a+     + #  +  ##+   ##
    #       # +#       #++ +# + +   +g+ # ++ +#+    ##
    #       # +#   +   #+         +++               ##
    #   #++## +## #+# ##            +               ##
    #   +         +         #         ++      #     ##
    #                  #    # ####### ### ## ### +  ##
    #   #  a+          #g   # a*##++a     #+  #  +  ##
    #~~~~~~~~~ ~~~~~~####  ###########++######## +  ##
    #~~~~~~~~# #~~~~~~##    a+#+ +                  ##
    #~~~~~~~~ *              +     # ##         SAGA##
    ###~~~~~~# #~~~~~~~~           #  #         SGGA##
    ####~~~~~~~~~~~~~~~#           # *#         SAAA##
    ##################################################
    `
        }
      ]
    }
  ];

  // src/Game.ts
  var _Game = class {
    constructor(updateUI) {
      this.updateUI = updateUI;
      this.time = 0;
      this.aiSides = _Game.PAI;
      this.momentum = [0, 0];
      this.renderer = new RenderSchematic(this);
      this.init();
    }
    static loadCampaign(id) {
      return parseWithNewLines(localStorage.getItem(_Game.campaignPrefix + id));
    }
    static campaignById(id) {
      return campaigns.find((c2) => c2.name == id || c2.name + " " + c2.version == id) || _Game.loadCampaign(id) || campaigns[0];
    }
    static savedCampaignIds() {
      return Object.keys(localStorage).filter((n2) => n2.substr(0, _Game.savePrefixLength) == _Game.campaignPrefix).map((n2) => n2.substr(_Game.savePrefixLength)).sort().reverse();
    }
    static allCampaignIds() {
      return campaigns.map((c2) => c2.name + " " + c2.version).concat(_Game.savedCampaignIds());
    }
    stageByName(name) {
      return this.campaign.stages.find((s2) => s2.name == name) || this.campaign.stages[0];
    }
    init(saveString, useState = true) {
      delete this.chosen;
      delete this.hovered;
      delete this.lastSelectedFaction;
      let save;
      if (saveString) {
        save = parseWithNewLines(saveString);
        if (save.campaign) {
          this.campaign = _Game.campaignById(save.campaign);
        } else {
          this.campaign = save;
          this.customCampaign = true;
        }
      }
      if (!this.campaign)
        this.campaign = _Game.campaignById();
      this.init2(
        this.campaign,
        this.stageByName(save && save.stage),
        save && useState ? save.state : null
      );
    }
    makeNotCustom() {
      this.customCampaign = false;
    }
    init2(campaign, stage, state) {
      this.campaign = campaign;
      this.stage = stage;
      this.terrain = new Terrain(
        this.campaign,
        this.stage,
        state || null,
        (animation) => this.renderer.draw(animation)
      );
      this.renderer.synch();
      this.updateUI({ activeTeam: this.activeTeam });
    }
    initStage(stageInd) {
      this.init2(this.campaign, this.campaign.stages[stageInd]);
    }
    serialize(include = { state: true }) {
      let o2 = {};
      if (include.campaign || this.customCampaign) {
        Object.assign(o2, this.campaign);
      } else {
        o2.campaign = this.campaign.name;
      }
      if (include.state) {
        o2.state = this.terrain.serialize();
      }
      o2.stage = this.stage.name;
      return JSON.stringify(o2, null, "  ").replace(/\\n/g, "\n");
    }
    setCanvas(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      if (this.renderer)
        this.renderer.resize();
    }
    over() {
      return false;
    }
    update(timeStamp) {
      if (!this.lastLoopTimeStamp)
        this.lastLoopTimeStamp = timeStamp - 1e-3;
      let dTime = Math.min(0.02, (timeStamp - this.lastLoopTimeStamp) / 1e3);
      this.lastLoopTimeStamp = timeStamp;
      this.time += dTime;
      this.renderer.update(dTime);
      this.renderer.render(this.ctx);
      if (this.over())
        this.updateUI({ over: true });
      if (this.chosen && !this.chosen.alive) {
        delete this.chosen;
      }
    }
    updateTooltip(tooltipAt, tooltipText) {
      this.updateUI({ tooltipAt, tooltipText });
    }
    click(x, y2) {
      let cell = this.renderer.cellAtScreenPos(x, y2);
      this.clickCell(cell);
      this.renderer.resetCanvasCache();
    }
    isAi(team) {
      return this.aiSides & 1 << team.faction;
    }
    canPlayAs(unit) {
      return !this.isAi(unit.team);
    }
    choose(c2) {
      this.chosen = c2;
      if (!c2)
        return;
      this.lastChosen = this.chosen;
      this.chosen.calculate();
      this.renderer.lookAtCid(this.chosen.cid);
      this.renderer.resetCanvasCache();
    }
    clickCell(cell) {
      if (!cell)
        return;
      if (cell.unit) {
        if (this.chosen && this.chosen.team == cell.unit.team && this.canPlayAs(cell.unit)) {
          this.choose(cell.unit);
          return;
        }
        if (this.chosen && this.chosen.canDamage(cell.unit)) {
          this.chosen.shoot(cell);
          return;
        }
        if (this.chosen == cell.unit) {
          this.cancel();
        } else {
          if (this.canPlayAs(cell.unit))
            this.choose(cell.unit);
        }
        if (this.chosen) {
          this.chosen.calculate();
        }
      }
      if (!cell.unit && this.chosen && this.chosen.reachable(cell)) {
        this.chosen.move(cell);
        this.terrain.teams[Team.RED].calculate();
      }
      this.lastSelectedFaction = this.chosen ? this.chosen.team : this.terrain.we;
    }
    cancel() {
      delete this.chosen;
      this.renderer.resetCanvasCache();
    }
    drag(dx, dy) {
      this.renderer.screenPos = sum(this.renderer.screenPos, [dx, dy]);
    }
    hover(x, y2) {
      let cell = this.renderer.cellAtScreenPos(x, y2);
      if (this.hovered == cell)
        return;
      if (!cell) {
        delete this.hovered;
        this.renderer.resetCanvasCache();
        return;
      }
      if (!cell)
        return;
      this.hovered = cell;
      let cursor = "default";
      if (this.chosen && this.chosen.reachable(cell) || cell.unit)
        cursor = "pointer";
      if (this.chosen && this.chosen.canDamage(cell.unit)) {
        cursor = "crosshair";
        this.updateTooltip(
          this.renderer.cidToCenterScreen(cell.cid),
          `${this.chosen.hitChance(cell)}% ${this.chosen.gun.averageDamage(this.chosen, cell).toFixed(1)}`
        );
      } else {
        this.updateTooltip();
      }
      document.body.style.cursor = cursor;
      this.updateUI({ chosen: this.chosen, unitInfo: cell.unit });
      if (!this.renderer.busy)
        this.renderer.resetCanvasCache();
    }
    get blue() {
      return this.terrain.teams[Team.BLUE];
    }
    get red() {
      return this.terrain.teams[Team.RED];
    }
    get activeTeam() {
      return this.terrain.activeTeam;
    }
    endTurn(aiSides) {
      return __async(this, null, function* () {
        this.aiSides = aiSides;
        if (this.isAi(this.activeTeam)) {
          yield this.endSideTurn();
        } else {
          do {
            yield this.endSideTurn();
          } while (this.isAi(this.activeTeam));
        }
      });
    }
    endSideTurn() {
      return __async(this, null, function* () {
        delete this.chosen;
        let team = this.activeTeam;
        if (this.isAi(team))
          yield team.think();
        this.terrain.endSideTurn();
        this.renderer.resetCanvasCache();
        this.updateUI({ activeTeam: this.activeTeam });
      });
    }
    setAiSides(m2) {
      this.aiSides = m2;
    }
    get hoveredChar() {
      if (this.hovered)
        return this.hovered.unit;
    }
    chooseNext(delta = 1) {
      if (!this.chosen) {
        if (this.lastChosen)
          this.choose(this.lastChosen);
        else
          this.choose(this.terrain.we.units[0]);
      } else {
        let team = this.chosen.team.units;
        let next = team[(team.indexOf(this.chosen) + team.length + delta) % team.length];
        this.choose(next);
      }
    }
  };
  var Game = _Game;
  Game.PAI = 2;
  Game.PP = 0;
  Game.AIAI = 3;
  Game.savePrefix = "2aps:";
  Game.campaignPrefix = "2apc:";
  Game.savePrefixLength = _Game.savePrefix.length;
  Game.timeStampLength = 13;

  // node_modules/linkstate/dist/linkstate.module.js
  var t2;
  var r2 = (function(t3, r3) {
    t3.exports = function(t4, r4, e2, n2, o2) {
      for (r4 = r4.split ? r4.split(".") : r4, n2 = 0; n2 < r4.length; n2++)
        t4 = t4 ? t4[r4[n2]] : o2;
      return t4 === o2 ? e2 : t4;
    };
  }(t2 = { path: void 0, exports: {}, require: function(t3, r3) {
    return function() {
      throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
    }();
  } }), t2.exports);
  function linkstate_module_default(t3, e2, n2) {
    var o2 = e2.split("."), u2 = t3.__lsc || (t3.__lsc = {});
    return u2[e2 + n2] || (u2[e2 + n2] = function(e3) {
      for (var u3 = e3 && e3.target || this, i2 = {}, c2 = i2, s2 = "string" == typeof n2 ? r2(e3, n2) : u3 && u3.nodeName ? u3.type.match(/^che|rad/) ? u3.checked : u3.value : e3, a2 = 0; a2 < o2.length - 1; a2++)
        c2 = c2[o2[a2]] || (c2[o2[a2]] = !a2 && t3.state[o2[a2]] || {});
      c2[o2[a2]] = s2, t3.setState(i2);
    });
  }

  // src/Help.tsx
  function Help() {
    return /* @__PURE__ */ h("div", {
      id: "help"
    }, /* @__PURE__ */ h("h3", null, "This is a prototype of a browser XCOM-like game."), /* @__PURE__ */ h("p", null, "Currently it only has three unit types, no complex moves like overwatch, and only one map, but it will grow. It's already fully playable and closely matches XCOM conventions. Left click on your", /* @__PURE__ */ h("span", {
      style: "color:blue"
    }, "(blue)"), ` units to select, click on empty space to move or on enemy to fire. Right click to deselect. Each unit has two action points (hence the game's name), shown as "horns". And some Hit Points, shown as the "beard". Units, naturally, die when out of HP, but can replenish HPs with "*" pickups. When next to cover (black or dashed squares), unit is protected by it on respective side and can "peek" out of it to shoot or, sadly, be shot at, just like in XCOM. Black squares are high cover, granting 40% defence and blocking vision. Dashed squares are low cover, giving only 20$ defence and no LOS obsruction.`), /* @__PURE__ */ h("p", null, "When you hover the mouse over the square, you can see what is visible from it, and which enemies are flanked from (i.e. have no cover, marked", " ", /* @__PURE__ */ h("span", {
      style: "background:#8f8"
    }, "green"), "), or", /* @__PURE__ */ h("span", {
      style: "background:#f88"
    }, "flanking"), " this square, or", /* @__PURE__ */ h("span", {
      style: "background:#ff8;"
    }, "both"), "."), /* @__PURE__ */ h("p", null, `You can play against AI, it's a default mode. AI is quite competent, seeking cover and trying to flank you when possible. Also you can switch to 2 player mode, or even AI vs AI. Difference, basically, is that when you press "End turn", AI will make moves, depending on mode, for none, one or both sides if they have APs remained.`), /* @__PURE__ */ h("p", null, `Even more, you can play on your own map! Just switch to Edit mode, and edit text field. # is high cover, + is low cover, G, A, S are blue units and g, a, s are red units. Note that map borders should always be high cover. Don't forget to press "Apply" when you done.`));
  }

  // src/lang.ts
  var lang_exports = {};
  __export(lang_exports, {
    Assault: () => Assault,
    Gunner: () => Gunner,
    Sharpshooter: () => Sharpshooter
  });
  var Sharpshooter = `
Hits accurately and hard at long range, regardless of target's armor.
Has extra defence, making him nearly untouchable when in cover. 
Pretty helpess up close and has low HP.
`;
  var Assault = `
Psycho with a shotgun. 
Fast and even has a bit of armor to survive close quater fight a bit longer.
Can deal a lot of damage, but only up close.
`;
  var Gunner = `
Effective in any range and has extra hp.
Quite slow.
`;

  // src/GUI.tsx
  var paused = false;
  function mountEventsToCanvas(gui, c2) {
    let drag = 0;
    c2.addEventListener("mouseup", (e2) => {
      drag = 0;
    });
    c2.addEventListener("mousedown", (e2) => {
      if (e2.button == 0) {
        gui.game.click(e2.offsetX, e2.offsetY);
      }
      if (e2.button == 2) {
        gui.game.cancel();
      }
      if (gui.state.page == "play") {
        if (e2.button == 3) {
          if (location.hash == "#prev")
            history.forward();
          else
            history.pushState({}, document.title, "#prev");
          gui.game.chooseNext();
        }
        if (e2.button == 4) {
          gui.game.chooseNext(-1);
        }
      }
    });
    c2.addEventListener("mousemove", (e2) => {
      if (e2.buttons & 6) {
        drag++;
        if (drag >= 3)
          gui.game.drag(e2.movementX, e2.movementY);
      }
      gui.game.hover(e2.offsetX, e2.offsetY);
    });
    c2.addEventListener("mouseleave", (e2) => {
      console.log("leave");
      gui.game.hover();
    });
    c2.addEventListener("mouseenter", (e2) => {
    });
    c2.addEventListener(
      "contextmenu",
      function(e2) {
        e2.preventDefault();
      },
      false
    );
  }
  var NewGame = class extends d {
    constructor() {
      super(...arguments);
      this.state = { campaign: null, campaignInd: -1 };
    }
    render() {
      return /* @__PURE__ */ h("div", {
        class: "new-game row"
      }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h4", null, "Campaigns"), this.props.campaigns.map((id, i2) => /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", {
        class: i2 == this.state.campaignInd ? "long pressed" : "long",
        onClick: () => this.selectCampaign(i2)
      }, id.search(/[0-9]{13}/) == 0 ? id.substr(Game.timeStampLength) : id)))), /* @__PURE__ */ h("div", null, this.state.campaign && [
        /* @__PURE__ */ h("h4", null, "Scenarios"),
        this.state.campaign.stages.map((stage, i2) => /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", {
          class: "long",
          onClick: () => this.startStage(i2)
        }, stage.name)))
      ]));
    }
    selectCampaign(campaignInd) {
      this.setState({
        campaign: Game.campaignById(this.props.campaigns[campaignInd]),
        campaignInd
      });
    }
    startStage(stageInd) {
      this.props.startStage(
        this.state.campaign,
        this.state.campaign.stages[stageInd]
      );
    }
  };
  var AbilityButton = (props) => /* @__PURE__ */ h("button", null, /* @__PURE__ */ h("svg", {
    width: "32px",
    height: "32px"
  }, /* @__PURE__ */ h("filter", {
    id: "shadow",
    dangerouslySetInnerHTML: {
      __html: `<feDropShadow dx="1" dy="1" stdDeviation="1"/>`
    }
  }), /* @__PURE__ */ h("g", {
    style: "fill:none; stroke:#999; filter:url(#shadow);"
  }, props.children)));
  var Saves = (props) => {
    let c2 = false;
    return /* @__PURE__ */ h("div", {
      class: "save"
    }, /* @__PURE__ */ h("button", {
      onClick: props.save
    }, "Save Game"), props.saves.sort().reverse().concat([null], props.campaigns.sort().reverse()).map(
      (key) => key ? /* @__PURE__ */ h("div", {
        class: "save-row"
      }, /* @__PURE__ */ h("button", {
        class: "short",
        onClick: () => props.del(key)
      }, "Del"), "\xA0", new Date(+key.substr(0, Game.timeStampLength)).toLocaleString(), /* @__PURE__ */ h("input", {
        class: "save-name",
        disabled: c2,
        onChange: (e2) => props.changeName(key, e2.target.value),
        value: key.substr(Game.timeStampLength)
      }), /* @__PURE__ */ h("button", {
        onClick: () => props.load(key)
      }, "Load")) : (c2 = true, [
        /* @__PURE__ */ h("h4", null, "Custom Campaigns"),
        props.saveCampaign && /* @__PURE__ */ h("button", {
          onClick: props.saveCampaign
        }, "Save Campaign")
      ])
    ));
  };
  var GUI = class extends d {
    constructor(props) {
      super(props);
      this.state = {
        aiSides: 2,
        activeTeam: null,
        page: "play",
        game: void 0,
        stageEdit: "",
        modCampaign: true,
        modState: true,
        saves: [],
        campaigns: [],
        unitInfo: null,
        chosen: null,
        aiTurn: false,
        tooltipText: null,
        tooltipAt: null
      };
      this.canvas = y();
      this.tooltip = y();
      this.updateUI = (event) => {
        this.setState(event);
      };
      document.addEventListener("keydown", (e2) => {
        switch (e2.code) {
          case "Escape":
            if (this.page == "play")
              this.setPage("saves");
            else
              this.setPage("play");
            break;
          case "Tab":
            this.game.chooseNext();
            break;
          case "KeyS":
            if (e2.shiftKey)
              this.setPage("saves");
            break;
        }
      });
    }
    get game() {
      return this.state.game;
    }
    get page() {
      return this.state.page;
    }
    gameUpdated(g2) {
      this.setState({ game: g2 });
    }
    updateSaves() {
      let saves = [];
      let campaigns2 = [];
      for (let key in localStorage) {
        let prefix = key.substr(0, Game.savePrefixLength);
        if (prefix == Game.savePrefix) {
          saves.push(key.substr(Game.savePrefixLength));
        }
        if (prefix == Game.campaignPrefix) {
          campaigns2.push(key.substr(Game.savePrefixLength));
        }
      }
      this.setState({ saves, campaigns: campaigns2 });
    }
    updateStageEdit() {
      this.setState({
        stageEdit: this.game.serialize({
          campaign: this.state.modCampaign,
          state: this.state.modState
        })
      });
    }
    setPage(page) {
      if (this.state.page == "edit" && this.state.stageEdit) {
        this.game.init(this.state.stageEdit);
      }
      this.setState({ page });
      if (page == "edit") {
        this.updateStageEdit();
      }
      if (page != "play") {
        document.body.style.cursor = "default";
      }
      if (page == "new-game") {
      }
    }
    cancelEdit() {
      this.setState({ stageEdit: null });
      this.setPage("menu");
    }
    endTurn() {
      this.game.endTurn(this.state.aiSides);
    }
    componentDidMount() {
      this.gameUpdated(new Game(this.updateUI));
      this.updateSaves();
      let c2 = this.canvas.current;
      mountEventsToCanvas(this, c2);
      this.game.setCanvas(c2);
      window.onresize = () => {
        this.game.renderer.resize();
      };
      eachFrame((time) => {
        if (this.game && !paused && !this.game.over())
          this.game.update(time);
      });
    }
    displayIfPage(p2) {
      return this.state.page == p2 ? "display:flex" : "display:none";
    }
    toggleAI(side) {
      let aiSides = this.state.aiSides ^ 1 << side;
      this.setState({ aiSides });
      this.game.setAiSides(aiSides);
    }
    topButtons() {
      let page = this.state.page;
      if (page == "play") {
        return [
          ["AI", () => this.toggleAI(0)],
          ["AI", () => this.toggleAI(1)],
          [void 0, void 0],
          ["Menu", "menu"]
        ];
      } else {
        return [
          ["New Game", "new-game"],
          ["Saves", "saves"],
          ["Settings", "settings"],
          ["Editor", "edit"],
          ["Help", "help"],
          [void 0, void 0],
          ["Continue", "play"]
        ];
      }
    }
    saveCampaign() {
      let save = this.state.game.serialize({ campaign: true, state: false });
      let id = new Date().getTime() + this.state.game.campaign.name;
      localStorage.setItem(Game.campaignPrefix + id, save);
      this.updateSaves();
    }
    saveGame() {
      let save = this.state.game.serialize();
      let id = new Date().getTime() + this.state.game.campaign.name + ": " + this.state.game.stage.name;
      localStorage.setItem(Game.savePrefix + id, save);
      this.updateSaves();
    }
    delGame(id) {
      localStorage.removeItem(Game.savePrefix + id);
      localStorage.removeItem(Game.campaignPrefix + id);
      this.updateSaves();
    }
    loadGame(id) {
      let save = localStorage.getItem(Game.savePrefix + id);
      if (save)
        this.game.init(save);
      else {
        save = localStorage.getItem(Game.campaignPrefix + id);
        this.game.init(save, false);
      }
      this.setPage("play");
    }
    changeGameName(from, to) {
      let newHeader = Game.savePrefix + new Date().getTime() + to;
      let oldHeader = Game.savePrefix + from;
      if (!localStorage[newHeader] && newHeader != oldHeader) {
        localStorage.setItem(newHeader, localStorage[oldHeader]);
        localStorage.removeItem(oldHeader);
        this.updateSaves();
      }
    }
    startStage(campaign, stage) {
      this.game.init2(campaign, stage);
      this.game.makeNotCustom();
      this.setPage("play");
    }
    renderPage() {
      switch (this.state.page) {
        case "help":
          return /* @__PURE__ */ h(Help, null);
        case "saves":
          return /* @__PURE__ */ h(Saves, {
            saves: this.state.saves,
            campaigns: this.state.campaigns,
            saveCampaign: this.game.customCampaign && this.saveCampaign,
            save: this.saveGame,
            load: this.loadGame,
            del: this.delGame,
            changeName: this.changeGameName
          });
        case "new-game":
          return /* @__PURE__ */ h(NewGame, {
            campaigns: Game.allCampaignIds(),
            startStage: (campaign, stage) => this.startStage(campaign, stage)
          });
        default:
          return /* @__PURE__ */ h("div", null);
      }
    }
    toggleModCampaign() {
      this.setState({ modCampaign: !this.state.modCampaign });
      this.updateStageEdit();
    }
    toggleModState() {
      this.setState({ modState: !this.state.modState });
      this.updateStageEdit();
    }
    sideButtonText(i2) {
      let ai = this.state.aiSides & 1 << i2;
      let text = /* @__PURE__ */ h("span", null, ai ? "AI" : "Player");
      if (this.state.activeTeam && this.state.activeTeam.faction == i2)
        text = /* @__PURE__ */ h("u", null, text);
      return text;
    }
    render() {
      let state = this.state;
      let page = state.page;
      let cursor = svgImg(
        `width="32" height="32" fill="none" stroke="black"`,
        `<circle r="12" cx="16" cy="16" /><path d="M16 0 v32 M0 16 h32" />`
      );
      return /* @__PURE__ */ h("div", {
        style: `cursor:${cursor} 16 16, auto;`
      }, /* @__PURE__ */ h("div", {
        class: "center-screen",
        style: this.displayIfPage("play")
      }, /* @__PURE__ */ h("canvas", {
        ref: this.canvas,
        id: "main"
      })), /* @__PURE__ */ h("div", {
        class: "center-horisontal"
      }, /* @__PURE__ */ h("div", {
        id: "editor",
        style: this.displayIfPage("edit")
      }, /* @__PURE__ */ h("textarea", {
        onChange: linkstate_module_default(this, "stageEdit"),
        cols: 100,
        rows: 40,
        value: this.state.stageEdit,
        id: "edit-area"
      }), /* @__PURE__ */ h("div", {
        class: "row"
      }, /* @__PURE__ */ h("label", null, /* @__PURE__ */ h("input", {
        type: "checkbox",
        checked: state.modCampaign,
        onChange: this.toggleModCampaign
      }), "Modify Campaign"), /* @__PURE__ */ h("label", null, /* @__PURE__ */ h("input", {
        type: "checkbox",
        checked: state.modState,
        onChange: this.toggleModState
      }), "Modify State"), /* @__PURE__ */ h("span", {
        class: "flex-spacer"
      }), /* @__PURE__ */ h("button", {
        id: "endb",
        onClick: (e2) => this.cancelEdit()
      }, "Cancel"))), [this.renderPage()]), /* @__PURE__ */ h("div", {
        class: "top-buttons row"
      }, this.topButtons().map(
        ([text, action], i2) => text ? /* @__PURE__ */ h("button", {
          class: "medium" + (page == "play" && i2 <= 2 ? " side" + i2 : "") + (page == action ? " pressed" : ""),
          onClick: (e2) => action instanceof Function ? action() : this.setPage(action)
        }, page == "play" && i2 <= 2 ? this.sideButtonText(i2) : text) : /* @__PURE__ */ h("span", {
          class: "flex-spacer"
        })
      )), state.unitInfo && page == "play" && /* @__PURE__ */ h(UnitInfo, {
        unit: state.unitInfo,
        chosen: this.state.chosen
      }), /* @__PURE__ */ h("div", {
        class: "bottom-buttons row"
      }, /* @__PURE__ */ h("span", {
        class: "flex-spacer"
      }), page == "play" && !state.aiTurn && /* @__PURE__ */ h("button", {
        id: "endb",
        onClick: (e2) => this.endTurn()
      }, "End Turn")), /* @__PURE__ */ h("div", {
        class: "ability-buttons"
      }, /* @__PURE__ */ h(AbilityButton, null, /* @__PURE__ */ h("circle", {
        r: "12",
        cx: "16",
        cy: "16"
      }), /* @__PURE__ */ h("path", {
        d: "M16,0 v32 M0 16 h32"
      })), /* @__PURE__ */ h(AbilityButton, null, /* @__PURE__ */ h("circle", {
        r: "10",
        cx: "16",
        cy: "16"
      }), /* @__PURE__ */ h("circle", {
        r: "6",
        cx: "16",
        cy: "16"
      }), /* @__PURE__ */ h("path", {
        d: "M0,16 Q16,-4 32,16 Q16,36 0,16"
      })), /* @__PURE__ */ h(AbilityButton, null, /* @__PURE__ */ h("path", {
        d: "M24,4 L0,16 L24,28 M16,8 a10,10 45 0 1 0,16 v-16"
      })), /* @__PURE__ */ h(AbilityButton, null, /* @__PURE__ */ h("path", {
        d: "M4,0 q24,0 24,12 h-4 q0,-6 -14,-6 l2,8 h-4 L4,0 M16,28 l-8,-8 l16,0 l-8,8"
      })), /* @__PURE__ */ h(AbilityButton, null, /* @__PURE__ */ h("path", {
        d: "M4,0 q24,0 24,12 h-4 q0,-6 -14,-6 l2,8 h-4 L4,0 M16,20 l-8,8 l16,0 l-8,-8"
      })), /* @__PURE__ */ h(AbilityButton, null, /* @__PURE__ */ h("path", {
        d: "M4,4 h24 v24 h-24 v-24 m0,8 h25 m-16,0 c0,6 6,6 6,0"
      }))), /* @__PURE__ */ h("div", {
        id: "tooltip",
        style: state.tooltipAt ? `display:block; left:${state.tooltipAt[0] + 30 + this.canvas.current.offsetLeft}; top:${state.tooltipAt[1]}` : `display:none`
      }, state.tooltipText));
    }
  };
  __decorateClass([
    bind
  ], GUI.prototype, "saveCampaign", 1);
  __decorateClass([
    bind
  ], GUI.prototype, "saveGame", 1);
  __decorateClass([
    bind
  ], GUI.prototype, "delGame", 1);
  __decorateClass([
    bind
  ], GUI.prototype, "loadGame", 1);
  __decorateClass([
    bind
  ], GUI.prototype, "changeGameName", 1);
  __decorateClass([
    bind
  ], GUI.prototype, "toggleModCampaign", 1);
  __decorateClass([
    bind
  ], GUI.prototype, "toggleModState", 1);
  var UnitInfo = ({
    unit,
    chosen
  }) => {
    let accMods = {};
    let hitChance = 0;
    if (unit && chosen && unit != chosen)
      hitChance = chosen.hitChance(unit.cell, unit, false, accMods);
    return /* @__PURE__ */ h("div", {
      id: "unitInfo"
    }, unit.name.toUpperCase(), " ", /* @__PURE__ */ h("b", null, unit.hp), "HP ", /* @__PURE__ */ h("b", null, unit.ap), "AP", " ", /* @__PURE__ */ h("b", null, unit.stress), "SP", /* @__PURE__ */ h("br", null), "velocity", renderV2(unit.velocity), " focus", renderV2(unit.focus), /* @__PURE__ */ h("br", null), hitChance && /* @__PURE__ */ h("div", null, "Hit Chance: ", /* @__PURE__ */ h("b", null, hitChance), Object.keys(accMods).filter((key) => accMods[key]).map((key) => /* @__PURE__ */ h("span", {
      class: "nobr"
    }, " ", key, /* @__PURE__ */ h("b", null, signed(accMods[key]))))), lang_exports[unit.name]);
  };
  function renderV2(v2) {
    let angle = Math.atan2(v2[1], v2[0]) / Math.PI * 180;
    let length2 = Math.round(length(v2));
    return /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("svg", {
      width: "10px",
      height: "10px"
    }, /* @__PURE__ */ h("path", {
      d: "M5 5 l 0 -5 l 5 5 l -5 5 l 0 -4 l -5 0 l 0 -2 l 5 0 ",
      transform: `rotate(${angle} 5 5)`
    })), /* @__PURE__ */ h("b", null, length2));
  }

  // src/index.tsx
  window.onload = function() {
    let el = P(/* @__PURE__ */ h(GUI, null), document.body);
  };
})();
//# sourceMappingURL=bundle.js.map
