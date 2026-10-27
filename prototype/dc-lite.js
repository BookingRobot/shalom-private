/*
 * dc-lite.js — tiny runtime that renders the prototype screens exported from the design canvas.
 * Template syntax: {{path}} holes, <template data-if="{{x}}">, <template data-for="{{xs}}" data-as="x">,
 * on* attributes bound to functions, boolean attributes (checked/disabled/selected) bound to values.
 * Each page defines `class Component extends DCLogic { renderVals() { ... } }` and calls DC.mount(Component).
 */
(function () {
  'use strict';
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var BOOL = { checked: 1, disabled: 1, selected: 1, open: 1, hidden: 1 };

  function get(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.');
    for (var i = 0; i < scope.length; i++) {
      var s = scope[i];
      if (s != null && typeof s === 'object' && parts[0] in s) {
        var v = s;
        for (var j = 0; j < parts.length; j++) { if (v == null) return undefined; v = v[parts[j]]; }
        return v;
      }
    }
    return undefined;
  }
  function interp(str, scope) {
    var m = str.match(WHOLE);
    if (m) return get(scope, m[1]);
    return str.replace(HOLE, function (_, p) { var v = get(scope, p); return v == null ? '' : String(v); });
  }
  function render(src, scope, out) {
    var kids = src.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var n = kids[i];
      if (n.nodeType === 3) {
        var t = n.nodeValue;
        if (t.indexOf('{{') >= 0) { var v = interp(t, scope); t = v == null ? '' : String(v); }
        out.appendChild(document.createTextNode(t));
        continue;
      }
      if (n.nodeType !== 1) continue;
      if (n.tagName === 'TEMPLATE' && n.hasAttribute('data-if')) {
        if (interp(n.getAttribute('data-if'), scope)) render(n.content, scope, out);
        continue;
      }
      if (n.tagName === 'TEMPLATE' && n.hasAttribute('data-for')) {
        var list = interp(n.getAttribute('data-for'), scope) || [];
        var as = n.getAttribute('data-as') || 'item';
        for (var k = 0; k < list.length; k++) { var f = {}; f[as] = list[k]; render(n.content, [f].concat(scope), out); }
        continue;
      }
      var el = n.namespaceURI && n.namespaceURI !== 'http://www.w3.org/1999/xhtml'
        ? document.createElementNS(n.namespaceURI, n.localName)
        : document.createElement(n.localName);
      var attrs = Array.prototype.slice.call(n.attributes);
      var props = [];
      for (var a = 0; a < attrs.length; a++) {
        var name = attrs[a].name, val = attrs[a].value;
        if (name.indexOf('hint-placeholder') === 0) continue;
        if (name.slice(0, 2) === 'on') {
          var fn = interp(val, scope);
          if (typeof fn === 'function') el.addEventListener(name.slice(2), (function (h) { return function (e) { h(e); }; })(fn));
          continue;
        }
        if (val.indexOf('{{') < 0) { el.setAttribute(name, val); continue; }
        var r = interp(val, scope);
        if (BOOL[name] && WHOLE.test(val)) {
          if (r) el.setAttribute(name, '');
          props.push([name, !!r]);
        } else {
          el.setAttribute(name, r == null ? '' : String(r));
          if (name === 'value') props.push(['value', r == null ? '' : String(r)]);
        }
      }
      render(n, scope, el);
      for (var p = 0; p < props.length; p++) { try { el[props[p][0]] = props[p][1]; } catch (e) {} }
      out.appendChild(el);
    }
  }

  var DC = { _redraw: function () {} };
  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = Object.assign({}, this.state, next);
    DC._redraw();
  };
  DC.mount = function (Cls) {
    var inst = new Cls({});
    if (!inst.state) inst.state = {};
    var tpl = document.getElementById('dc-tpl');
    var root = document.getElementById('dc-root');
    var pending = false;
    function draw() {
      pending = false;
      var vals = inst.renderVals();
      var frag = document.createDocumentFragment();
      render(tpl.content, [vals], frag);
      var y = window.scrollY;
      root.replaceChildren(frag);
      window.scrollTo(0, y);
    }
    DC._redraw = function () { if (!pending) { pending = true; Promise.resolve().then(draw); } };
    draw();
  };
  window.DC = DC;
})();
