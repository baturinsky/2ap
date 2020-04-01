(function () {
	'use strict';

	var VNode = function VNode() {};

	var options = {};

	var stack = [];

	var EMPTY_CHILDREN = [];

	function h(nodeName, attributes) {
		var children = EMPTY_CHILDREN,
		    lastSimple,
		    child,
		    simple,
		    i;
		for (i = arguments.length; i-- > 2;) {
			stack.push(arguments[i]);
		}
		if (attributes && attributes.children != null) {
			if (!stack.length) stack.push(attributes.children);
			delete attributes.children;
		}
		while (stack.length) {
			if ((child = stack.pop()) && child.pop !== undefined) {
				for (i = child.length; i--;) {
					stack.push(child[i]);
				}
			} else {
				if (typeof child === 'boolean') child = null;

				if (simple = typeof nodeName !== 'function') {
					if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
				}

				if (simple && lastSimple) {
					children[children.length - 1] += child;
				} else if (children === EMPTY_CHILDREN) {
					children = [child];
				} else {
					children.push(child);
				}

				lastSimple = simple;
			}
		}

		var p = new VNode();
		p.nodeName = nodeName;
		p.children = children;
		p.attributes = attributes == null ? undefined : attributes;
		p.key = attributes == null ? undefined : attributes.key;

		return p;
	}

	function extend(obj, props) {
	  for (var i in props) {
	    obj[i] = props[i];
	  }return obj;
	}

	function applyRef(ref, value) {
	  if (ref) {
	    if (typeof ref == 'function') ref(value);else ref.current = value;
	  }
	}

	var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

	var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

	var items = [];

	function enqueueRender(component) {
		if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
			( defer)(rerender);
		}
	}

	function rerender() {
		var p;
		while (p = items.pop()) {
			if (p._dirty) renderComponent(p);
		}
	}

	function isSameNodeType(node, vnode, hydrating) {
		if (typeof vnode === 'string' || typeof vnode === 'number') {
			return node.splitText !== undefined;
		}
		if (typeof vnode.nodeName === 'string') {
			return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
		}
		return hydrating || node._componentConstructor === vnode.nodeName;
	}

	function isNamedNode(node, nodeName) {
		return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
	}

	function getNodeProps(vnode) {
		var props = extend({}, vnode.attributes);
		props.children = vnode.children;

		var defaultProps = vnode.nodeName.defaultProps;
		if (defaultProps !== undefined) {
			for (var i in defaultProps) {
				if (props[i] === undefined) {
					props[i] = defaultProps[i];
				}
			}
		}

		return props;
	}

	function createNode(nodeName, isSvg) {
		var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
		node.normalizedNodeName = nodeName;
		return node;
	}

	function removeNode(node) {
		var parentNode = node.parentNode;
		if (parentNode) parentNode.removeChild(node);
	}

	function setAccessor(node, name, old, value, isSvg) {
		if (name === 'className') name = 'class';

		if (name === 'key') ; else if (name === 'ref') {
			applyRef(old, null);
			applyRef(value, node);
		} else if (name === 'class' && !isSvg) {
			node.className = value || '';
		} else if (name === 'style') {
			if (!value || typeof value === 'string' || typeof old === 'string') {
				node.style.cssText = value || '';
			}
			if (value && typeof value === 'object') {
				if (typeof old !== 'string') {
					for (var i in old) {
						if (!(i in value)) node.style[i] = '';
					}
				}
				for (var i in value) {
					node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
				}
			}
		} else if (name === 'dangerouslySetInnerHTML') {
			if (value) node.innerHTML = value.__html || '';
		} else if (name[0] == 'o' && name[1] == 'n') {
			var useCapture = name !== (name = name.replace(/Capture$/, ''));
			name = name.toLowerCase().substring(2);
			if (value) {
				if (!old) node.addEventListener(name, eventProxy, useCapture);
			} else {
				node.removeEventListener(name, eventProxy, useCapture);
			}
			(node._listeners || (node._listeners = {}))[name] = value;
		} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
			try {
				node[name] = value == null ? '' : value;
			} catch (e) {}
			if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
		} else {
			var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

			if (value == null || value === false) {
				if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
			} else if (typeof value !== 'function') {
				if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
			}
		}
	}

	function eventProxy(e) {
		return this._listeners[e.type]( e);
	}

	var mounts = [];

	var diffLevel = 0;

	var isSvgMode = false;

	var hydrating = false;

	function flushMounts() {
		var c;
		while (c = mounts.shift()) {
			if (c.componentDidMount) c.componentDidMount();
		}
	}

	function diff(dom, vnode, context, mountAll, parent, componentRoot) {
		if (!diffLevel++) {
			isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

			hydrating = dom != null && !('__preactattr_' in dom);
		}

		var ret = idiff(dom, vnode, context, mountAll, componentRoot);

		if (parent && ret.parentNode !== parent) parent.appendChild(ret);

		if (! --diffLevel) {
			hydrating = false;

			if (!componentRoot) flushMounts();
		}

		return ret;
	}

	function idiff(dom, vnode, context, mountAll, componentRoot) {
		var out = dom,
		    prevSvgMode = isSvgMode;

		if (vnode == null || typeof vnode === 'boolean') vnode = '';

		if (typeof vnode === 'string' || typeof vnode === 'number') {
			if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
				if (dom.nodeValue != vnode) {
					dom.nodeValue = vnode;
				}
			} else {
				out = document.createTextNode(vnode);
				if (dom) {
					if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
					recollectNodeTree(dom, true);
				}
			}

			out['__preactattr_'] = true;

			return out;
		}

		var vnodeName = vnode.nodeName;
		if (typeof vnodeName === 'function') {
			return buildComponentFromVNode(dom, vnode, context, mountAll);
		}

		isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

		vnodeName = String(vnodeName);
		if (!dom || !isNamedNode(dom, vnodeName)) {
			out = createNode(vnodeName, isSvgMode);

			if (dom) {
				while (dom.firstChild) {
					out.appendChild(dom.firstChild);
				}
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

				recollectNodeTree(dom, true);
			}
		}

		var fc = out.firstChild,
		    props = out['__preactattr_'],
		    vchildren = vnode.children;

		if (props == null) {
			props = out['__preactattr_'] = {};
			for (var a = out.attributes, i = a.length; i--;) {
				props[a[i].name] = a[i].value;
			}
		}

		if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
			if (fc.nodeValue != vchildren[0]) {
				fc.nodeValue = vchildren[0];
			}
		} else if (vchildren && vchildren.length || fc != null) {
				innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
			}

		diffAttributes(out, vnode.attributes, props);

		isSvgMode = prevSvgMode;

		return out;
	}

	function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
		var originalChildren = dom.childNodes,
		    children = [],
		    keyed = {},
		    keyedLen = 0,
		    min = 0,
		    len = originalChildren.length,
		    childrenLen = 0,
		    vlen = vchildren ? vchildren.length : 0,
		    j,
		    c,
		    f,
		    vchild,
		    child;

		if (len !== 0) {
			for (var i = 0; i < len; i++) {
				var _child = originalChildren[i],
				    props = _child['__preactattr_'],
				    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
				if (key != null) {
					keyedLen++;
					keyed[key] = _child;
				} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
					children[childrenLen++] = _child;
				}
			}
		}

		if (vlen !== 0) {
			for (var i = 0; i < vlen; i++) {
				vchild = vchildren[i];
				child = null;

				var key = vchild.key;
				if (key != null) {
					if (keyedLen && keyed[key] !== undefined) {
						child = keyed[key];
						keyed[key] = undefined;
						keyedLen--;
					}
				} else if (min < childrenLen) {
						for (j = min; j < childrenLen; j++) {
							if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
								child = c;
								children[j] = undefined;
								if (j === childrenLen - 1) childrenLen--;
								if (j === min) min++;
								break;
							}
						}
					}

				child = idiff(child, vchild, context, mountAll);

				f = originalChildren[i];
				if (child && child !== dom && child !== f) {
					if (f == null) {
						dom.appendChild(child);
					} else if (child === f.nextSibling) {
						removeNode(f);
					} else {
						dom.insertBefore(child, f);
					}
				}
			}
		}

		if (keyedLen) {
			for (var i in keyed) {
				if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
			}
		}

		while (min <= childrenLen) {
			if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
		}
	}

	function recollectNodeTree(node, unmountOnly) {
		var component = node._component;
		if (component) {
			unmountComponent(component);
		} else {
			if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

			if (unmountOnly === false || node['__preactattr_'] == null) {
				removeNode(node);
			}

			removeChildren(node);
		}
	}

	function removeChildren(node) {
		node = node.lastChild;
		while (node) {
			var next = node.previousSibling;
			recollectNodeTree(node, true);
			node = next;
		}
	}

	function diffAttributes(dom, attrs, old) {
		var name;

		for (name in old) {
			if (!(attrs && attrs[name] != null) && old[name] != null) {
				setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
			}
		}

		for (name in attrs) {
			if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
				setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
			}
		}
	}

	var recyclerComponents = [];

	function createComponent(Ctor, props, context) {
		var inst,
		    i = recyclerComponents.length;

		if (Ctor.prototype && Ctor.prototype.render) {
			inst = new Ctor(props, context);
			Component.call(inst, props, context);
		} else {
			inst = new Component(props, context);
			inst.constructor = Ctor;
			inst.render = doRender;
		}

		while (i--) {
			if (recyclerComponents[i].constructor === Ctor) {
				inst.nextBase = recyclerComponents[i].nextBase;
				recyclerComponents.splice(i, 1);
				return inst;
			}
		}

		return inst;
	}

	function doRender(props, state, context) {
		return this.constructor(props, context);
	}

	function setComponentProps(component, props, renderMode, context, mountAll) {
		if (component._disable) return;
		component._disable = true;

		component.__ref = props.ref;
		component.__key = props.key;
		delete props.ref;
		delete props.key;

		if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
			if (!component.base || mountAll) {
				if (component.componentWillMount) component.componentWillMount();
			} else if (component.componentWillReceiveProps) {
				component.componentWillReceiveProps(props, context);
			}
		}

		if (context && context !== component.context) {
			if (!component.prevContext) component.prevContext = component.context;
			component.context = context;
		}

		if (!component.prevProps) component.prevProps = component.props;
		component.props = props;

		component._disable = false;

		if (renderMode !== 0) {
			if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
				renderComponent(component, 1, mountAll);
			} else {
				enqueueRender(component);
			}
		}

		applyRef(component.__ref, component);
	}

	function renderComponent(component, renderMode, mountAll, isChild) {
		if (component._disable) return;

		var props = component.props,
		    state = component.state,
		    context = component.context,
		    previousProps = component.prevProps || props,
		    previousState = component.prevState || state,
		    previousContext = component.prevContext || context,
		    isUpdate = component.base,
		    nextBase = component.nextBase,
		    initialBase = isUpdate || nextBase,
		    initialChildComponent = component._component,
		    skip = false,
		    snapshot = previousContext,
		    rendered,
		    inst,
		    cbase;

		if (component.constructor.getDerivedStateFromProps) {
			state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
			component.state = state;
		}

		if (isUpdate) {
			component.props = previousProps;
			component.state = previousState;
			component.context = previousContext;
			if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
				skip = true;
			} else if (component.componentWillUpdate) {
				component.componentWillUpdate(props, state, context);
			}
			component.props = props;
			component.state = state;
			component.context = context;
		}

		component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
		component._dirty = false;

		if (!skip) {
			rendered = component.render(props, state, context);

			if (component.getChildContext) {
				context = extend(extend({}, context), component.getChildContext());
			}

			if (isUpdate && component.getSnapshotBeforeUpdate) {
				snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
			}

			var childComponent = rendered && rendered.nodeName,
			    toUnmount,
			    base;

			if (typeof childComponent === 'function') {

				var childProps = getNodeProps(rendered);
				inst = initialChildComponent;

				if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
					setComponentProps(inst, childProps, 1, context, false);
				} else {
					toUnmount = inst;

					component._component = inst = createComponent(childComponent, childProps, context);
					inst.nextBase = inst.nextBase || nextBase;
					inst._parentComponent = component;
					setComponentProps(inst, childProps, 0, context, false);
					renderComponent(inst, 1, mountAll, true);
				}

				base = inst.base;
			} else {
				cbase = initialBase;

				toUnmount = initialChildComponent;
				if (toUnmount) {
					cbase = component._component = null;
				}

				if (initialBase || renderMode === 1) {
					if (cbase) cbase._component = null;
					base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
				}
			}

			if (initialBase && base !== initialBase && inst !== initialChildComponent) {
				var baseParent = initialBase.parentNode;
				if (baseParent && base !== baseParent) {
					baseParent.replaceChild(base, initialBase);

					if (!toUnmount) {
						initialBase._component = null;
						recollectNodeTree(initialBase, false);
					}
				}
			}

			if (toUnmount) {
				unmountComponent(toUnmount);
			}

			component.base = base;
			if (base && !isChild) {
				var componentRef = component,
				    t = component;
				while (t = t._parentComponent) {
					(componentRef = t).base = base;
				}
				base._component = componentRef;
				base._componentConstructor = componentRef.constructor;
			}
		}

		if (!isUpdate || mountAll) {
			mounts.push(component);
		} else if (!skip) {

			if (component.componentDidUpdate) {
				component.componentDidUpdate(previousProps, previousState, snapshot);
			}
		}

		while (component._renderCallbacks.length) {
			component._renderCallbacks.pop().call(component);
		}if (!diffLevel && !isChild) flushMounts();
	}

	function buildComponentFromVNode(dom, vnode, context, mountAll) {
		var c = dom && dom._component,
		    originalComponent = c,
		    oldDom = dom,
		    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
		    isOwner = isDirectOwner,
		    props = getNodeProps(vnode);
		while (c && !isOwner && (c = c._parentComponent)) {
			isOwner = c.constructor === vnode.nodeName;
		}

		if (c && isOwner && (!mountAll || c._component)) {
			setComponentProps(c, props, 3, context, mountAll);
			dom = c.base;
		} else {
			if (originalComponent && !isDirectOwner) {
				unmountComponent(originalComponent);
				dom = oldDom = null;
			}

			c = createComponent(vnode.nodeName, props, context);
			if (dom && !c.nextBase) {
				c.nextBase = dom;

				oldDom = null;
			}
			setComponentProps(c, props, 1, context, mountAll);
			dom = c.base;

			if (oldDom && dom !== oldDom) {
				oldDom._component = null;
				recollectNodeTree(oldDom, false);
			}
		}

		return dom;
	}

	function unmountComponent(component) {

		var base = component.base;

		component._disable = true;

		if (component.componentWillUnmount) component.componentWillUnmount();

		component.base = null;

		var inner = component._component;
		if (inner) {
			unmountComponent(inner);
		} else if (base) {
			if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

			component.nextBase = base;

			removeNode(base);
			recyclerComponents.push(component);

			removeChildren(base);
		}

		applyRef(component.__ref, null);
	}

	function Component(props, context) {
		this._dirty = true;

		this.context = context;

		this.props = props;

		this.state = this.state || {};

		this._renderCallbacks = [];
	}

	extend(Component.prototype, {
		setState: function setState(state, callback) {
			if (!this.prevState) this.prevState = this.state;
			this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
			if (callback) this._renderCallbacks.push(callback);
			enqueueRender(this);
		},
		forceUpdate: function forceUpdate(callback) {
			if (callback) this._renderCallbacks.push(callback);
			renderComponent(this, 2);
		},
		render: function render() {}
	});

	function render(vnode, parent, merge) {
	  return diff(merge, vnode, {}, false, parent, false);
	}

	function createRef() {
		return {};
	}
	//# sourceMappingURL=preact.mjs.map

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */

	function __decorate(decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	}

	function __awaiter(thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	function min(list, fn) {
	    let minV = Number.MAX_VALUE;
	    let minI = -1;
	    for (let i = 0; i < list.length; i++) {
	        let v = fn(list[i]);
	        if (minV > v) {
	            minV = v;
	            minI = i;
	        }
	    }
	    if (minI >= 0)
	        return { ind: minI, item: list[minI], val: minV };
	}
	function max(list, fn) {
	    let r = min(list, t => -fn(t));
	    if (!r)
	        return;
	    r.val = -r.val;
	    return r;
	}
	function createCanvas(w, h) {
	    const canvas = document.createElement("canvas");
	    canvas.width = w;
	    canvas.height = h;
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
	        return (seed = (seed * 16807) % 2147483647);
	    };
	}
	function eachFrame(fun) {
	    requestAnimationFrame(time => {
	        fun(time);
	        eachFrame(fun);
	    });
	}
	function idiv(a, b) {
	    return Math.floor(a / b);
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
	    for (let i = 1; i < split.length; i += 2) {
	        split[i] = split[i].replace(/\n/g, "\\n");
	    }
	    return JSON.parse(split.join('"'));
	}
	function signed(n) {
	    return (n > 0 ? "+" : "") + n;
	}
	function svgImg(attrs, body) {
	    return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>')`;
	}

	function round(v) {
	    return [Math.round(v[0]), Math.round(v[1])];
	}
	function sum(a, b, m = 1) {
	    return [a[0] + b[0] * m, a[1] + b[1] * m];
	}
	function sub(a, b) {
	    return [a[0] - b[0], a[1] - b[1]];
	}
	function length(d) {
	    return Math.sqrt(d[0] * d[0] + d[1] * d[1]);
	}
	function norm(v, scale = 1) {
	    let d = length(v) || 1;
	    return [v[0] / d * scale, v[1] / d * scale];
	}
	function dist(a, b) {
	    return length([a[0] - b[0], a[1] - b[1]]);
	}
	function dot(a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	}
	function det(a, b) {
	    return a[0] * b[1] - a[1] * b[0];
	}
	function rot(v) {
	    return [v[1], -v[0]];
	}
	function scale(v, n) {
	    return [v[0] * n, v[1] * n];
	}
	function lerp(start, end, amt) {
	    return [
	        start[0] * (1 - amt) + amt * end[0],
	        start[1] * (1 - amt) + amt * end[1]
	    ];
	}
	function angleBetween(a, b) {
	    return Math.atan2(det(a, b), dot(a, b));
	}

	//https://gist.github.com/as-f/59bb06ced7e740e11ec7dda9d82717f6#file-shadowcasting-js
	function shadowcast(cx, cy, transparent, reveal) {
	    /**
	     * Scan one row of one octant.
	     * @param y - distance from the row scanned to the center
	     * @param start - starting slope
	     * @param end - ending slope
	     * @param transform - describes the transfrom to apply on x and y; determines the octant
	     */
	    var scan = function (y, start, end, transform) {
	        if (start >= end) {
	            return;
	        }
	        var xmin = Math.round((y - 0.5) * start);
	        var xmax = Math.ceil((y + 0.5) * end - 0.5);
	        for (var x = xmin; x <= xmax; x++) {
	            var realx = cx + transform.xx * x + transform.xy * y;
	            var realy = cy + transform.yx * x + transform.yy * y;
	            if (transparent(realx, realy)) {
	                if (x >= y * start && x <= y * end) {
	                    reveal(realx, realy);
	                }
	            }
	            else {
	                if (x >= (y - 0.5) * start && x - 0.5 <= y * end) {
	                    reveal(realx, realy);
	                }
	                scan(y + 1, start, (x - 0.5) / y, transform);
	                start = (x + 0.5) / y;
	                if (start >= end) {
	                    return;
	                }
	            }
	        }
	        scan(y + 1, start, end, transform);
	    };
	    // An array of transforms, each corresponding to one octant.
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
	    // Scan each octant
	    for (var i = 0; i < 8; i++) {
	        scan(1, 0, 1, transforms[i]);
	    }
	}

	class Item {
	    constructor(type) {
	        this.type = type;
	    }
	    serialize() {
	        return this.type;
	    }
	    static deserialize(type) {
	        return new Item(type);
	    }
	}
	Item.MEDKIT = "medkit";

	class Cell {
	    constructor(terrain, cid, obstacle, unit) {
	        this.terrain = terrain;
	        this.cid = cid;
	        this.obstacle = obstacle;
	        this.unit = unit;
	        this.rfov = new Set(); /* raw FOV, without XCOM tricks */
	        this.xfov = new Set(); /* FOV with respect of peek-out */
	        this.dfov = new Set(); /* Direct fov, withonly source stepping out. For ground attacks and overwatch */
	        this.povs = [];
	        this.peeked = [];
	        this.items = [];
	    }
	    calculatePovAnCover() {
	        if (this.obstacle)
	            return;
	        this.cover = this.terrain.obstacles(this.cid);
	        this.calculatePovs();
	    }
	    calculateFov() {
	        if (this.opaque)
	            return;
	        let t = this.terrain;
	        let [x, y] = this.at;
	        let visibility = new Set();
	        shadowcast(x, y, (x, y) => !t.cellAt(x, y).opaque, (x, y) => {
	            visibility.add(t.cid(x, y));
	        });
	        this.rfov = visibility;
	    }
	    calculateXFov() {
	        let visibility = new Set();
	        for (let p of this.povs) {
	            for (let visible of p.rfov) {
	                let visibleTile = this.terrain.cells[visible];
	                for (let neighbor of visibleTile.peeked)
	                    visibility.add(neighbor.cid);
	            }
	        }
	        this.xfov = visibility;
	    }
	    calculateDFov() {
	        let visibility = new Set();
	        for (let p of this.povs) {
	            for (let visible of p.rfov) {
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
	        let t = this.terrain;
	        let cid = this.cid;
	        this.povs.push(this);
	        for (let dir = 0; dir < 8; dir += 2) {
	            let forward = cid + t.dir8Deltas[dir];
	            if (!t.cells[forward].obstacle)
	                continue;
	            let left = [
	                cid + t.dir8Deltas[(dir + 6) % 8],
	                cid + t.dir8Deltas[(dir + 7) % 8]
	            ];
	            let right = [
	                cid + t.dir8Deltas[(dir + 2) % 8],
	                cid + t.dir8Deltas[(dir + 1) % 8]
	            ];
	            for (let side of [left, right]) {
	                let peekable = t.cells[side[0]].standable && t.cells[side[1]].obstacle <= 1;
	                if (peekable) {
	                    this.povs.push(t.cells[side[0]]);
	                }
	            }
	        }
	        for (let c of this.povs) {
	            c.peeked.push(this);
	        }
	    }
	    serializable() {
	        return this.items.length > 0;
	    }
	    serialize() {
	        return { items: this.items.map(i => i.serialize()) };
	    }
	    deserialize(data) {
	        for (let item of data.items) {
	            this.addItem(Item.deserialize(item));
	        }
	    }
	    addItem(item) {
	        this.items.push(item);
	    }
	}

	class Team {
	    constructor(terrain, faction) {
	        this.terrain = terrain;
	        this.faction = faction;
	        this.fov = new Set();
	    }
	    serialize() {
	        return {
	            units: this.units.map(u => u.serialize())
	        };
	    }
	    calculate() {
	        this.strength = [];
	        this.weakness = [];
	        this.distance = [];
	        let t = this.terrain;
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
	                let strength = (4 - t.cover(cell, tcell)) % 5;
	                if (!(this.strength[cid] > strength))
	                    this.strength[cid] = strength;
	                let weakness = (4 - t.cover(tcell, cell)) % 5;
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
	        return __awaiter(this, void 0, void 0, function* () {
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
	        for (let c of this.units) {
	            c.ap = 2;
	        }
	        this.terrain.activeTeam = this;
	    }
	    get units() {
	        return this.terrain.units.filter(c => c.team == this);
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
	}
	Team.BLUE = 0;
	Team.RED = 1;

	const velocityAccuracyScale = 4 * 0, velocityDefenceScale = 4 * 0;
	class Unit {
	    constructor(cell, o) {
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
	        this.symbol = o.symbol.toLowerCase();
	        cell.unit = this;
	        let terrain = cell.terrain;
	        this.terrain.units.push(this);
	        let conf = terrain.campaign.units[this.symbol];
	        Object.assign(this, conf);
	        this.hp = this.maxHP;
	        console.assert(conf);
	        this.team =
	            terrain.teams[o.symbol.toUpperCase() == o.symbol ? Team.BLUE : Team.RED];
	        for (let key of Unit.saveFields) {
	            if (key in o)
	                this[key] = o[key];
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
	        return path.reverse().map(cid => this.terrain.cells[cid]);
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
	        let l = this.dists[cell.cid][0];
	        let moves = Math.ceil(l / this.speed);
	        return moves;
	    }
	    canShoot() {
	        return this.ap > 0;
	    }
	    perpendicularVelocity(target) {
	        if (!this.moving)
	            return 0;
	        let dir = norm(sub(target, this.at));
	        let p = det(dir, this.velocity);
	        return p;
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
	        let bonus = 1 - (4 * Math.abs(angle)) / Math.PI;
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
	        let chance = Math.round(Object.values(bonuses).reduce((a, b) => a + b));
	        return chance;
	    }
	    die() {
	        this.terrain.units = this.terrain.units.filter(c => c.hp > 0);
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
	        return __awaiter(this, void 0, void 0, function* () {
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
	            let bestMoment = max(path, step => !step.unit && enemy.averageDamage(step, this, true));
	            if (bestMoment && bestMoment.val >= 1) {
	                rfPoints.push({ moment: bestMoment.ind, enemy });
	            }
	        }
	        rfPoints = rfPoints.sort((a, b) => (a.moment > b.moment ? 1 : -1));
	        return rfPoints;
	    }
	    calculateVelocity(path) {
	        let delta = sub(path[path.length - 1].at, path[0].at);
	        return round(norm(delta, this.speed));
	    }
	    move(to) {
	        return __awaiter(this, void 0, void 0, function* () {
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
	                let bestMoment = max(path, step => !step.unit && enemy.averageDamage(step, this, true));
	                if (bestMoment && bestMoment.val >= 1) {
	                    rfPoints.push({ moment: bestMoment.ind, enemy });
	                }
	            }
	            rfPoints = rfPoints.sort((a, b) => (a.moment > b.moment ? 1 : -1));
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
	        return __awaiter(this, void 0, void 0, function* () {
	            if (path.length <= 1)
	                return;
	            yield this.terrain.animate({ anim: "walk", char: this, path });
	        });
	    }
	    animateShoot(tcid, damage) {
	        return __awaiter(this, void 0, void 0, function* () {
	            yield this.terrain.animate({
	                anim: "shoot",
	                from: this.cid,
	                to: tcid,
	                damage
	            });
	        });
	    }
	    canDamage(target) {
	        return (target &&
	            this.team != target.team &&
	            this.cell.xfov.has(target.cid) &&
	            this.canShoot());
	    }
	    bestPosition() {
	        let team = this.team;
	        this.calculate();
	        let bestScore = -100;
	        let bestAt;
	        for (let i in this.dists) {
	            let d = this.dists[i][0];
	            if (d > this.speed * this.ap)
	                continue;
	            let score = team.strength[i] -
	                team.weakness[i] -
	                idiv(d, this.speed) * 0.5 -
	                d * 0.001;
	            score += team.distance[i] * this.aggression;
	            if (score > bestScore) {
	                bestScore = score;
	                bestAt = Number(i);
	            }
	        }
	        return this.terrain.cells[bestAt];
	    }
	    averageDamage(tcell, tunit, direct = false) {
	        let hitChance = this.hitChance(tcell, tunit, direct);
	        return (hitChance * this.gun.averageDamage(this, tcell)) / 100;
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
	        return __awaiter(this, void 0, void 0, function* () {
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
	}
	Unit.EYE = -1;
	Unit.GUNNER = 1;
	Unit.ASSAULT = 2;
	Unit.SNIPER = 3;
	Unit.RECON = 4;
	Unit.MEDIC = 5;
	Unit.HEAVY = 6;
	Unit.COMMANDER = 7;
	Unit.saveFields = "hp ap exhaustion stress focus velocity".split(" ");

	class Gun {
	    constructor(o) {
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
	        if (o)
	            Object.assign(this, o);
	    }
	    damagePenalty(dist) {
	        let diff = 0;
	        if (dist < this.damageOptimalRange[0]) {
	            diff = this.damageOptimalRange[0] - dist;
	        }
	        if (dist > this.damageOptimalRange[1]) {
	            diff = dist - this.damageOptimalRange[1];
	        }
	        //debugger;
	        return Math.floor(Math.min(this.damagePenaltyMax, this.damagePenaltyPerCell * diff));
	    }
	    accuracyPenalty(dist) {
	        let diff = 0;
	        if (dist < this.accuracyOptimalRange[0]) {
	            diff = this.accuracyOptimalRange[0] - dist;
	        }
	        if (dist > this.accuracyOptimalRange[1]) {
	            diff = dist - this.accuracyOptimalRange[1];
	        }
	        //debugger;
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
	}

	class Terrain {
	    constructor(campaign, stage, state, animate) {
	        this.campaign = campaign;
	        this.stage = stage;
	        this.animate = animate;
	        this.aiTurn = false;
	        this.rni = random(1);
	        this.rnf = () => (this.rni() % 1e9) / 1e9;
	        for (let gunId in campaign.guns) {
	            campaign.guns[gunId] = new Gun(campaign.guns[gunId]);
	        }
	        this.init(this.stage.terrain);
	        if (state)
	            this.loadState(state);
	    }
	    serialize() {
	        return {
	            teams: this.teams.map(t => t.serialize()),
	            cells: this.cells.filter(c => c.serializable()).map(o => o.serialize()),
	            activeTeam: this.activeTeam.faction
	        };
	    }
	    init(terrainString) {
	        this.terrainString = terrainString;
	        let lines = terrainString
	            .split("\n")
	            .map(s => s.trim())
	            .filter(s => s.length > 0);
	        this.h = lines.length;
	        this.w = Math.max(...lines.map(s => s.length));
	        this.cells = [];
	        this.units = [];
	        this.teams = [];
	        delete this.victor;
	        for (let i = 0; i < 2; i++) {
	            let team = new Team(this, i);
	            this.teams[i] = team;
	        }
	        for (let y = 0; y < this.h; y++) {
	            let line = lines[y];
	            for (let x = 0; x < this.w; x++) {
	                let cid = x + y * this.w;
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
	        for (let i = 0; i < this.w; i++) {
	            this.seal(i, 0);
	            this.seal(i, this.h - 1);
	        }
	        for (let i = 0; i < this.h; i++) {
	            this.seal(0, i);
	            this.seal(this.w - 1, i);
	        }
	        this.dir8Deltas = Terrain.dirs8.map(v => v[0] + v[1] * this.w);
	        for (let c of this.cells) {
	            if (!c.obstacle)
	                c.calculatePovAnCover();
	        }
	        console.log(this.w);
	        console.log(this.h);
	        console.time("FOV");
	        for (let c of this.cells) {
	            if (!c.obstacle) {
	                c.calculatePovAnCover();
	                c.calculateFov();
	            }
	        }
	        console.timeEnd("FOV");
	        for (let c of this.cells) {
	            if (!c.obstacle) {
	                c.calculateXFov();
	                c.calculateDFov();
	            }
	        }
	        this.activeTeam = this.teams[0];
	        console.log(this);
	    }
	    seal(x, y) {
	        this.cells[this.cid(x, y)].seal();
	    }
	    loadState(state) {
	        if (!state || !state.teams)
	            return;
	        this.units = [];
	        this.cells.forEach(c => {
	            delete c.unit;
	            c.items = [];
	        });
	        this.teams = state.teams.map((t, i) => {
	            let team = new Team(this, i);
	            for (let u of t.units) {
	                let unit = new Unit(this.cells[u.cid], u);
	                unit.team = team;
	            }
	            return team;
	        });
	        this.activeTeam = this.teams[state.activeTeam];
	    }
	    calcDists(fromi) {
	        let dists = this.cells.map(_ => [Number.MAX_VALUE, -1]);
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
	                if (!nextc.passable || (nextc.unit && !nextc.unit.friendly(char)))
	                    continue;
	                if (diagonal &&
	                    (this.cells[curi + this.dir8Deltas[(dir + 1) % 8]].obstacle ||
	                        this.cells[curi + this.dir8Deltas[(dir + 7) % 8]].obstacle))
	                    continue;
	                let obstacleness = nextc.obstacle +
	                    curc.obstacle +
	                    (curc.unit ? 1 : 0) +
	                    (nextc.unit ? 1 : 0);
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
	        for (let i = 0; i < dists.length; i++) {
	            if (!this.cells[i].standable)
	                dists[i][0] = Number.MAX_VALUE;
	        }
	        return dists;
	    }
	    safeCid(x, y) {
	        if (x >= 0 && y >= 0 && x < this.w && y < this.h)
	            return this.cid(x, y);
	    }
	    cid(x, y) {
	        return x + y * this.w;
	    }
	    cellAt(x, y) {
	        return this.cells[this.cid(x, y)];
	    }
	    fromCid(ind) {
	        return [ind % this.w, idiv(ind, this.w)];
	    }
	    calculateFov(cid) {
	        let [x, y] = this.fromCid(cid);
	        let visibility = new Set();
	        shadowcast(x, y, (x, y) => !this.cellAt(x, y).opaque, (x, y) => {
	            for (let pov of this.cells[this.cid(x, y)].peeked)
	                visibility.add(pov.cid);
	        });
	        return visibility;
	    }
	    calculateDirectFov(cid) {
	        let [x, y] = this.fromCid(cid);
	        let visibility = new Set();
	        shadowcast(x, y, (x, y) => !this.cellAt(x, y).opaque, (x, y) => {
	            visibility.add(this.cid(x, y));
	        });
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
	            for (let i = 0; i < 4; i++) {
	                let cover = target.cover[i];
	                if (cover <= bestCover)
	                    continue;
	                let dot$1 = dot(Terrain.dirs8[i * 2], delta);
	                if (dot$1 < -0.001)
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
	}
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

	class MovingText {
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
	        let y = 0;
	        let l = 0;
	        for (let line of this.text.split("|")) {
	            ctx.fillText(line.trim().substr(0, Math.floor(this.time * 70) - l), this.at[0], this.at[1] + y);
	            l += line.length;
	            y += 20;
	        }
	        ctx.restore();
	    }
	}

	let insideBorder = 0;

	const dashInterval = 4;
	class Doll {
	    constructor(unit, renderer) {
	        this.unit = unit;
	        this.at = renderer.cidToPoint(unit.cid);
	    }
	}
	class RenderSchematic {
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
	        this.dolls = this.terrain.units.map(unit => new Doll(unit, this));
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
	        let d = this.lookingAt ? dist(this.lookingAt, this.screenPos) : 0;
	        if (this.lookingAt && d > 20) {
	            this.screenPos = lerp(this.screenPos, this.lookingAt, Math.min(1, dTime * Math.max(d / 50, 10) * this.animSpeed));
	        }
	        else {
	            delete this.lookingAt;
	            let anims = this.anim;
	            this.anim = [];
	            anims = anims.filter(fx => {
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
	        this.dolls = this.dolls.filter(d => d.unit.alive);
	    }
	    render(ctx) {
	        if (!ctx)
	            return;
	        ctx.clearRect(0, 0, this.width, this.height);
	        let t = this.terrain;
	        ctx.save();
	        ctx.translate(...this.screenPos);
	        if (!this.canvasCache || this.canvasCacheOutdated)
	            this.updateCanvasCache();
	        ctx.clearRect(0, 0, t.w * this.tileSize, t.h * this.tileSize);
	        ctx.drawImage(this.canvasCache, 0, 0);
	        for (let d of this.dolls) {
	            this.renderDoll(ctx, d);
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
	        if (!unit ||
	            !cell ||
	            !unit.dists ||
	            !unit.dists[cell.cid] ||
	            unit.dists[cell.cid][1] == -1)
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
	        for (let i of path)
	            ctx.lineTo(...this.cidToCenterPoint(i.cid));
	        ctx.stroke();
	    }
	    renderThreats(ctx, cell) {
	        let t = this.terrain;
	        let i = cell.cid;
	        if (!t.teams[Team.RED].strength)
	            return;
	        ctx.strokeStyle = "#800";
	        ctx.lineWidth = t.teams[Team.RED].strength[i] == 4 ? 3 : 1;
	        ctx.beginPath();
	        ctx.moveTo(3.5, 3.5);
	        ctx.lineTo(3.5, 3.5 + 3 * t.teams[Team.RED].strength[i]);
	        ctx.stroke();
	        ctx.strokeStyle = "#008";
	        ctx.lineWidth = t.teams[Team.RED].weakness[i] == 4 ? 3 : 1;
	        ctx.beginPath();
	        ctx.moveTo(3.5, 3.5);
	        ctx.lineTo(3.5 + 3 * t.teams[Team.RED].weakness[i], 3.5);
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
	        let g = this.game;
	        ctx.strokeStyle = "#000";
	        ctx.lineWidth = 2;
	        if (g.hovered && !g.hovered.opaque) {
	            let xfov = g.hovered.xfov.has(cell.cid);
	            let dfov = g.hovered.rfov.has(cell.cid);
	            if (!dfov) {
	                ctx.fillStyle = `rgba(${xfov ? "50,50,0,0.04" : "0,0,50,0.1"})`;
	                ctx.fillRect(at[0], at[1], this.tileSize, this.tileSize);
	            }
	        }
	        if (g.chosen && g.chosen.dists && !this.busy) {
	            let moves = g.chosen.apCost(cell);
	            if (moves > 0 && moves <= g.chosen.ap) {
	                let img = [, this.ap1Sprite, this.ap2Sprite][Math.floor(moves)];
	                if (img)
	                    ctx.drawImage(img, at[0], at[1]);
	            }
	        }
	        if ( cell.povs && cell.peeked.includes(this.game.hovered)) {
	            ctx.strokeStyle = `rgba(0,0,0,0.5)`;
	            ctx.lineWidth = 0.5;
	            ctx.beginPath();
	            ctx.arc(at[0] + this.tileSize / 2, at[1] + this.tileSize / 2, this.tileSize / 4, 0, Math.PI * 2);
	            ctx.stroke();
	        }
	    }
	    renderDoll(ctx, doll) {
	        ctx.save();
	        ctx.translate(...doll.at);
	        this.useDollCache(ctx, doll);
	        if (doll.unit == this.game.chosen) {
	            this.outline(ctx, doll, Math.sin(new Date().getTime() / 100) + 1);
	        }
	        else if (doll.unit == this.game.hoveredChar) {
	            this.outline(ctx, doll, 1.5);
	        }
	        ctx.restore();
	    }
	    outline(ctx, doll, width = 2) {
	        ctx.save();
	        ctx.strokeStyle = doll.unit.strokeColor;
	        ctx.lineWidth = width;
	        ctx.beginPath();
	        ctx.arc(this.tileSize / 2, this.tileSize / 2, this.tileSize * 0.4, 0, Math.PI * 2);
	        ctx.stroke();
	        ctx.restore();
	    }
	    useDollCache(ctx, doll) {
	        let unit = doll.unit;
	        let state = ["cid", "hp", "ap", "kind", "faction", "focus", "velocity"].map(key => unit[key]);
	        state.push(this.dollTint(doll));
	        let key = JSON.stringify(state);
	        if (!(key in this.dollCache))
	            this.dollCache[key] = canvasCache([this.tileSize * 2, this.tileSize * 2], ctx => this.renderDollBody(ctx, doll, this.dollTint(doll)));
	        ctx.drawImage(this.dollCache[key], -0.5 * this.tileSize, -0.5 * this.tileSize);
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
	                flankNum =
	                    (this.terrain.cover(unit.cell, hover) == 0 ? 1 : 0) +
	                        (this.terrain.cover(hover, unit.cell) == 0 ? 2 : 0);
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
	        /*ctx.lineWidth = 0.05;
	        
	        for (let i = 0; i < unit.hp; i++) {
	          let angle = Math.PI * (1 - i / (unit.maxHP - 1));
	          let v = v2.fromAngle(angle);
	          ctx.beginPath();
	          ctx.moveTo(
	            (0.5 + v[0] * 0.3),
	            (0.5 + v[1] * 0.3)
	          );
	          ctx.lineTo(
	            (0.5 + v[0] * 0.4),
	            (0.5 + v[1] * 0.4)
	          );
	          ctx.stroke();
	        }*/
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
	            ctx.lineWidth = 0.003 * length(unit.focus);
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
	        ctx.arc(0.5, 0.5, 0.35, 0, (Math.PI * unit.hp) / unit.maxHP);
	        ctx.stroke();
	        ctx.restore();
	    }
	    cidToPoint(ind) {
	        return this.terrain.fromCid(ind).map(a => a * this.tileSize);
	    }
	    cidToCenterPoint(ind) {
	        return scale(sum(this.terrain.fromCid(ind), [0.5, 0.5]), this.tileSize);
	    }
	    cidToCenterScreen(ind) {
	        return sum(this.cidToCenterPoint(ind), this.screenPos);
	    }
	    cidFromPoint(x, y) {
	        return this.terrain.safeCid(idiv(x, this.tileSize), idiv(y, this.tileSize));
	    }
	    cellAtScreenPos(x, y) {
	        return this.terrain.cells[this.cidFromPoint(...sub([x, y], this.screenPos))];
	    }
	    get animSpeed() {
	        return 2;
	        //return this.terrain.aiTurn ? 0.5 : 0.5;
	    }
	    updateCanvasCache() {
	        if (!this.canvasCache)
	            this.canvasCache = createCanvas(this.terrain.w * this.tileSize, this.terrain.h * this.tileSize);
	        if (!this.canvasTerrain)
	            this.canvasTerrain = createCanvas(this.terrain.w * this.tileSize, this.terrain.h * this.tileSize);
	        let tctx = this.canvasTerrain.getContext("2d");
	        tctx.clearRect(0, 0, this.terrain.w * this.tileSize, this.terrain.h * this.tileSize);
	        for (let i = 0; i < this.terrain.cells.length; i++) {
	            let cell = this.terrain.cells[i];
	            this.renderCell(tctx, cell);
	        }
	        let ctx = this.canvasCache.getContext("2d");
	        ctx.clearRect(0, 0, this.terrain.w * this.tileSize, this.terrain.h * this.tileSize);
	        ctx.save();
	        ctx.shadowBlur = 4;
	        ctx.shadowOffsetX = 1;
	        ctx.shadowOffsetY = 1;
	        ctx.shadowColor = "#444";
	        ctx.drawImage(this.canvasTerrain, 0, 0);
	        ctx.restore();
	        for (let i = 0; i < this.terrain.cells.length; i++) {
	            let cell = this.terrain.cells[i];
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
	        return (at[0] >= insideBorder &&
	            at[1] >= insideBorder &&
	            at[0] <= this.width - insideBorder &&
	            at[1] <= this.height - insideBorder);
	    }
	    lookAtCid(cid) {
	        this.lookAt(this.cidToCenterPoint(cid));
	    }
	    lookAt(at) {
	        //console.log(at);
	        let newLookingA = [-at[0] + this.width / 2, -at[1] + this.height / 2];
	        if (dist(this.screenPos, newLookingA) <= 20) {
	            this.screenPos = newLookingA;
	        }
	        if (!this.insideScreen(at))
	            this.lookingAt = newLookingA;
	    }
	    shoot(from, to, dmg) {
	        let tiles = [from, to].map(v => this.terrain.cells[v]);
	        let points;
	        let shootPoint;
	        let a, b;
	        completely: for (a of tiles[0].povs)
	            for (b of tiles[1].povs) {
	                if (a.rfov.has(b.cid)) {
	                    points = [a, b].map(v => this.cidToCenterPoint(v.cid));
	                    break completely;
	                }
	            }
	        if (dmg > 0) {
	            shootPoint = points[1];
	        }
	        else {
	            let dir = norm(sub(points[1], points[0]));
	            shootPoint = sum(sum(points[1], rot(dir)), dir, 10 * this.tileSize);
	        }
	        let fdoll = this.dollAt(from);
	        let tdoll = this.dollAt(to);
	        let time = 0;
	        if (a.cid == from && b.cid == to) {
	            time = 1;
	        }
	        this.animQueue.push({
	            update: dTime => {
	                if (time >= 1 && time <= 2) {
	                    time +=
	                        dTime *
	                            Math.min(10, (1000 / dist(points[0], shootPoint)) * this.animSpeed);
	                }
	                else {
	                    let peek = (time < 1 ? time : 3 - time) * 0.6;
	                    for (let i = 0; i < 2; i++) {
	                        let doll = [fdoll, tdoll][i];
	                        doll.at = lerp(this.cidToPoint([from, to][i]), sub(points[i], [this.tileSize / 2, this.tileSize / 2]), peek);
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
	        let path = steps.map(v => this.cidToPoint(v.cid));
	        let time = 0;
	        this.animQueue.push({
	            update: dTime => {
	                time += dTime * 15 * this.animSpeed;
	                if (!path[Math.floor(time) + 1]) {
	                    doll.at = path[path.length - 1];
	                    return false;
	                }
	                doll.at = lerp(path[Math.floor(time)], path[Math.floor(time) + 1], time - Math.floor(time));
	                this.lookAt(doll.at);
	                return true;
	            }
	        });
	    }
	    dollOf(unit) {
	        return this.dolls.find(d => d.unit == unit);
	    }
	    dollAt(cid) {
	        return this.dolls.find(d => d.unit.cid == cid);
	    }
	    draw(o) {
	        return __awaiter(this, void 0, void 0, function* () {
	            switch (o.anim) {
	                case "walk":
	                    this.walk(this.dollOf(o.char), o.path);
	                    break;
	                case "shoot":
	                    this.shoot(o.from, o.to, o.damage);
	                    break;
	            }
	            yield this.waitForAnim();
	        });
	    }
	    waitForAnim() {
	        return new Promise(resolve => {
	            this.blockingAnimationEnd = () => resolve();
	        });
	    }
	    get busy() {
	        return this.animQueue.length > 0;
	    }
	    initSprites() {
	        this.ap1Sprite = canvasCache([this.tileSize, this.tileSize], ctx => {
	            ctx.strokeStyle = "#555";
	            ctx.strokeRect(4.5, 4.5, this.tileSize - 8, this.tileSize - 8);
	        });
	        this.ap2Sprite = canvasCache([this.tileSize, this.tileSize], ctx => {
	            ctx.strokeStyle = "#bbb";
	            ctx.strokeRect(4.5, 4.5, this.tileSize - 8, this.tileSize - 8);
	        });
	        this.hiddenSprite = canvasCache([this.tileSize, this.tileSize], ctx => {
	            ctx.fillStyle = `rgba(0,0,0,0.12)`;
	            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
	        });
	        this.dashPattern = canvasCache([dashInterval, dashInterval], ctx => {
	            for (let i = 0; i < dashInterval; i++) {
	                ctx.fillRect(i, i, 1, 1);
	            }
	        });
	        this.wavePattern = canvasCache([8, 8], ctx => {
	            ctx.beginPath();
	            ctx.arc(4.5, 2, 5, 0, Math.PI);
	            ctx.stroke();
	        });
	        this.crossPattern = canvasCache([3, 3], ctx => {
	            for (let i = 0; i < dashInterval; i++) {
	                ctx.fillRect(dashInterval - i - 1, i, 1, 1);
	                ctx.fillRect(i, i, 1, 1);
	            }
	        });
	        this.highTile = canvasCache([this.tileSize, this.tileSize], ctx => {
	            ctx.fillStyle = "#000";
	            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
	        });
	        this.lowTile = canvasCache([this.tileSize, this.tileSize], ctx => {
	            ctx.fillStyle = "#fff";
	            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
	            ctx.fillStyle = ctx.createPattern(this.dashPattern, "repeat");
	            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
	        });
	        this.waterTile = canvasCache([this.tileSize, this.tileSize], ctx => {
	            ctx.fillStyle = ctx.createPattern(this.wavePattern, "repeat");
	            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
	        });
	    }
	}

	let campaigns = [
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

	class Game {
	    constructor(updateUI) {
	        this.updateUI = updateUI;
	        this.time = 0;
	        this.aiSides = Game.PAI;
	        this.momentum = [0, 0];
	        this.renderer = new RenderSchematic(this);
	        this.init();
	    }
	    static loadCampaign(id) {
	        return parseWithNewLines(localStorage.getItem(Game.campaignPrefix + id));
	    }
	    static campaignById(id) {
	        return (campaigns.find(c => c.name == id || c.name + " " + c.version == id) ||
	            Game.loadCampaign(id) ||
	            campaigns[0]);
	    }
	    static savedCampaignIds() {
	        return Object.keys(localStorage)
	            .filter(n => n.substr(0, Game.savePrefixLength) == Game.campaignPrefix)
	            .map(n => n.substr(Game.savePrefixLength))
	            .sort()
	            .reverse();
	    }
	    static allCampaignIds() {
	        return campaigns
	            .map(c => c.name + " " + c.version)
	            .concat(Game.savedCampaignIds());
	    }
	    stageByName(name) {
	        return (this.campaign.stages.find(s => s.name == name) || this.campaign.stages[0]);
	    }
	    init(saveString, useState = true) {
	        delete this.chosen;
	        delete this.hovered;
	        delete this.lastSelectedFaction;
	        let save;
	        if (saveString) {
	            save = parseWithNewLines(saveString);
	            if (save.campaign) {
	                this.campaign = Game.campaignById(save.campaign);
	            }
	            else {
	                this.campaign = save;
	                this.customCampaign = true;
	            }
	        }
	        if (!this.campaign)
	            this.campaign = Game.campaignById();
	        this.init2(this.campaign, this.stageByName(save && save.stage), save && useState ? save.state : null);
	    }
	    makeNotCustom() {
	        this.customCampaign = false;
	    }
	    init2(campaign, stage, state) {
	        this.campaign = campaign;
	        this.stage = stage;
	        this.terrain = new Terrain(this.campaign, this.stage, state || null, (animation) => this.renderer.draw(animation));
	        this.renderer.synch();
	        this.updateUI({ activeTeam: this.activeTeam });
	    }
	    initStage(stageInd) {
	        this.init2(this.campaign, this.campaign.stages[stageInd]);
	    }
	    serialize(include = { state: true }) {
	        let o = {};
	        if (include.campaign || this.customCampaign) {
	            Object.assign(o, this.campaign);
	        }
	        else {
	            o.campaign = this.campaign.name;
	        }
	        if (include.state) {
	            o.state = this.terrain.serialize();
	        }
	        o.stage = this.stage.name;
	        return JSON.stringify(o, null, "  ").replace(/\\n/g, "\n");
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
	            this.lastLoopTimeStamp = timeStamp - 0.001;
	        let dTime = Math.min(0.02, (timeStamp - this.lastLoopTimeStamp) / 1000);
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
	    click(x, y) {
	        let cell = this.renderer.cellAtScreenPos(x, y);
	        this.clickCell(cell);
	        this.renderer.resetCanvasCache();
	    }
	    isAi(team) {
	        return this.aiSides & (1 << team.faction);
	    }
	    canPlayAs(unit) {
	        return !this.isAi(unit.team);
	    }
	    choose(c) {
	        this.chosen = c;
	        if (!c)
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
	            if (this.chosen &&
	                this.chosen.team == cell.unit.team &&
	                this.canPlayAs(cell.unit)) {
	                this.choose(cell.unit);
	                return;
	            }
	            if (this.chosen && this.chosen.canDamage(cell.unit)) {
	                this.chosen.shoot(cell);
	                return;
	            }
	            if (this.chosen == cell.unit) {
	                this.cancel();
	            }
	            else {
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
	    hover(x, y) {
	        let cell = this.renderer.cellAtScreenPos(x, y);
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
	        if ((this.chosen && this.chosen.reachable(cell)) || cell.unit)
	            cursor = "pointer";
	        if (this.chosen && this.chosen.canDamage(cell.unit)) {
	            cursor = "crosshair";
	            this.updateTooltip(this.renderer.cidToCenterScreen(cell.cid), `${this.chosen.hitChance(cell)}% ${this.chosen.gun
                .averageDamage(this.chosen, cell)
                .toFixed(1)}`);
	        }
	        else {
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
	        return __awaiter(this, void 0, void 0, function* () {
	            this.aiSides = aiSides;
	            if (this.isAi(this.activeTeam)) {
	                yield this.endSideTurn();
	            }
	            else {
	                do {
	                    yield this.endSideTurn();
	                } while (this.isAi(this.activeTeam));
	            }
	        });
	    }
	    endSideTurn() {
	        return __awaiter(this, void 0, void 0, function* () {
	            delete this.chosen;
	            let team = this.activeTeam;
	            if (this.isAi(team))
	                yield team.think();
	            this.terrain.endSideTurn();
	            this.renderer.resetCanvasCache();
	            this.updateUI({ activeTeam: this.activeTeam });
	        });
	    }
	    setAiSides(m) {
	        this.aiSides = m;
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
	        }
	        else {
	            let team = this.chosen.team.units;
	            let next = team[(team.indexOf(this.chosen) + team.length + delta) % team.length];
	            this.choose(next);
	        }
	    }
	}
	Game.PAI = 2;
	Game.PP = 0;
	Game.AIAI = 3;
	Game.savePrefix = "2aps:";
	Game.campaignPrefix = "2apc:";
	Game.savePrefixLength = Game.savePrefix.length;
	Game.timeStampLength = 13;
	/*



	*/

	function dlv(obj, key, def, p) {
		p = 0;
		key = key.split ? key.split('.') : key;
		while (obj && p<key.length) { obj = obj[key[p++]]; }
		return obj===undefined ? def : obj;
	}

	/** Create an Event handler function that sets a given state property.
	 *	@param {Component} component	The component whose state should be updated
	 *	@param {string} key				A dot-notated key path to update in the component's state
	 *	@param {string} eventPath		A dot-notated key path to the value that should be retrieved from the Event or component
	 *	@returns {function} linkedStateHandler
	 */
	function linkState(component, key, eventPath) {
		var path = key.split('.'),
			cache = component.__lsc || (component.__lsc = {});

		return cache[key+eventPath] || (cache[key+eventPath] = function(e) {
			var t = e && e.target || this,
				state = {},
				obj = state,
				v = typeof eventPath==='string' ? dlv(e, eventPath) : t.nodeName ? (t.type.match(/^che|rad/) ? t.checked : t.value) : e,
				i = 0;
			for ( ; i<path.length-1; i++) {
				obj = obj[path[i]] || (obj[path[i]] = !i && component.state[path[i]] || {});
			}
			obj[path[i]] = v;
			component.setState(state);
		});
	}
	//# sourceMappingURL=linkstate.es.js.map

	function Help() {
	    return (h("div", { id: "help" },
	        h("h3", null, "This is a prototype of a browser XCOM-like game."),
	        h("p", null,
	            "Currently it only has three unit types, no complex moves like overwatch, and only one map, but it will grow. It's already fully playable and closely matches XCOM conventions. Left click on your",
	            h("span", { style: "color:blue" }, "(blue)"),
	            " units to select, click on empty space to move or on enemy to fire. Right click to deselect. Each unit has two action points (hence the game's name), shown as \"horns\". And some Hit Points, shown as the \"beard\". Units, naturally, die when out of HP, but can replenish HPs with \"*\" pickups. When next to cover (black or dashed squares), unit is protected by it on respective side and can \"peek\" out of it to shoot or, sadly, be shot at, just like in XCOM. Black squares are high cover, granting 40% defence and blocking vision. Dashed squares are low cover, giving only 20$ defence and no LOS obsruction."),
	        h("p", null,
	            "When you hover the mouse over the square, you can see what is visible from it, and which enemies are flanked from (i.e. have no cover, marked",
	            " ",
	            h("span", { style: "background:#8f8" }, "green"),
	            "), or",
	            h("span", { style: "background:#f88" }, "flanking"),
	            " this square, or",
	            h("span", { style: "background:#ff8;" }, "both"),
	            "."),
	        h("p", null, "You can play against AI, it's a default mode. AI is quite competent, seeking cover and trying to flank you when possible. Also you can switch to 2 player mode, or even AI vs AI. Difference, basically, is that when you press \"End turn\", AI will make moves, depending on mode, for none, one or both sides if they have APs remained."),
	        h("p", null, "Even more, you can play on your own map! Just switch to Edit mode, and edit text field. # is high cover, + is low cover, G, A, S are blue units and g, a, s are red units. Note that map borders should always be high cover. Don't forget to press \"Apply\" when you done.")));
	}

	let Sharpshooter = `
Hits accurately and hard at long range, regardless of target's armor.
Has extra defence, making him nearly untouchable when in cover. 
Pretty helpess up close and has low HP.
`;
	let Assault = `
Psycho with a shotgun. 
Fast and even has a bit of armor to survive close quater fight a bit longer.
Can deal a lot of damage, but only up close.
`;
	let Gunner = `
Effective in any range and has extra hp.
Quite slow.
`;

	var lang = /*#__PURE__*/Object.freeze({
		Sharpshooter: Sharpshooter,
		Assault: Assault,
		Gunner: Gunner
	});

	let paused = false;
	function mountEventsToCanvas(gui, c) {
	    let drag = 0;
	    c.addEventListener("mouseup", e => {
	        drag = 0;
	    });
	    c.addEventListener("mousedown", e => {
	        if (e.button == 0) {
	            gui.game.click(e.offsetX, e.offsetY);
	        }
	        if (e.button == 2) {
	            gui.game.cancel();
	        }
	        if (gui.state.page == "play") {
	            if (e.button == 3) {
	                if (location.hash == "#prev")
	                    history.forward();
	                else
	                    history.pushState({}, document.title, "#prev");
	                gui.game.chooseNext();
	            }
	            if (e.button == 4) {
	                gui.game.chooseNext(-1);
	            }
	        }
	    });
	    c.addEventListener("mousemove", e => {
	        if (e.buttons & 6) {
	            drag++;
	            if (drag >= 3)
	                gui.game.drag(e.movementX, e.movementY);
	        }
	        gui.game.hover(e.offsetX, e.offsetY);
	    });
	    c.addEventListener("mouseleave", e => {
	        console.log("leave");
	        gui.game.hover();
	    });
	    c.addEventListener("mouseenter", e => { });
	    c.addEventListener("contextmenu", function (e) {
	        e.preventDefault();
	    }, false);
	}
	class NewGame extends Component {
	    constructor() {
	        super(...arguments);
	        this.state = { campaign: null, campaignInd: -1 };
	    }
	    render() {
	        return (h("div", { class: "new-game row" },
	            h("div", null,
	                h("h4", null, "Campaigns"),
	                this.props.campaigns.map((id, i) => (h("div", null,
	                    h("button", { class: i == this.state.campaignInd ? "long pressed" : "long", onClick: () => this.selectCampaign(i) }, id.search(/[0-9]{13}/) == 0
	                        ? id.substr(Game.timeStampLength)
	                        : id))))),
	            h("div", null, this.state.campaign && [
	                h("h4", null, "Scenarios"),
	                this.state.campaign.stages.map((stage, i) => (h("div", null,
	                    h("button", { class: "long", onClick: () => this.startStage(i) }, stage.name))))
	            ])));
	    }
	    selectCampaign(campaignInd) {
	        this.setState({
	            campaign: Game.campaignById(this.props.campaigns[campaignInd]),
	            campaignInd
	        });
	    }
	    startStage(stageInd) {
	        this.props.startStage(this.state.campaign, this.state.campaign.stages[stageInd]);
	    }
	}
	let AbilityButton = props => h("button", null,
	    h("svg", { width: "32px", height: "32px" },
	        h("filter", { id: "shadow", dangerouslySetInnerHTML: {
	                __html: `<feDropShadow dx="1" dy="1" stdDeviation="1"/>`
	            } }),
	        h("g", { style: "fill:none; stroke:#999; filter:url(#shadow);" }, props.children)));
	let Saves = props => {
	    let c = false;
	    return (h("div", { class: "save" },
	        h("button", { onClick: props.save }, "Save Game"),
	        props.saves
	            .sort()
	            .reverse()
	            .concat([null], props.campaigns.sort().reverse())
	            .map(key => key ? (h("div", { class: "save-row" },
	            h("button", { class: "short", onClick: () => props.del(key) }, "Del"),
	            "\u00A0",
	            new Date(+key.substr(0, Game.timeStampLength)).toLocaleString(),
	            h("input", { class: "save-name", disabled: c, onChange: e => props.changeName(key, e.target.value), value: key.substr(Game.timeStampLength) }),
	            h("button", { onClick: () => props.load(key) }, "Load"))) : (((c = true),
	            [
	                h("h4", null, "Custom Campaigns"),
	                props.saveCampaign && (h("button", { onClick: props.saveCampaign }, "Save Campaign"))
	            ])))));
	};
	class GUI extends Component {
	    constructor(props) {
	        super(props);
	        this.state = {
	            aiSides: 2,
	            activeTeam: null,
	            page: "play",
	            game: undefined,
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
	        this.canvas = createRef();
	        this.tooltip = createRef();
	        this.updateUI = (event) => {
	            this.setState(event);
	        };
	        document.addEventListener("keydown", e => {
	            switch (e.code) {
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
	                    if (e.shiftKey)
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
	    gameUpdated(g) {
	        this.setState({ game: g });
	    }
	    updateSaves() {
	        let saves = [];
	        let campaigns = [];
	        for (let key in localStorage) {
	            let prefix = key.substr(0, Game.savePrefixLength);
	            if (prefix == Game.savePrefix) {
	                saves.push(key.substr(Game.savePrefixLength));
	            }
	            if (prefix == Game.campaignPrefix) {
	                campaigns.push(key.substr(Game.savePrefixLength));
	            }
	        }
	        this.setState({ saves, campaigns });
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
	        this.setState({ page: page });
	        if (page == "edit") {
	            this.updateStageEdit();
	        }
	        if (page != "play") {
	            document.body.style.cursor = "default";
	        }
	    }
	    /*apply() {
	      this.game.init(this.state.stageEdit);
	      this.setPage("play");
	    }*/
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
	        let c = this.canvas.current;
	        mountEventsToCanvas(this, c);
	        this.game.setCanvas(c);
	        window.onresize = () => {
	            this.game.renderer.resize();
	        };
	        eachFrame(time => {
	            if (this.game && !paused && !this.game.over())
	                this.game.update(time);
	        });
	    }
	    displayIfPage(p) {
	        return this.state.page == p ? "display:flex" : "display:none";
	    }
	    toggleAI(side) {
	        let aiSides = this.state.aiSides ^ (1 << side);
	        this.setState({ aiSides });
	        this.game.setAiSides(aiSides);
	    }
	    topButtons() {
	        let page = this.state.page;
	        if (page == "play") {
	            return [
	                ["AI", () => this.toggleAI(0)],
	                ["AI", () => this.toggleAI(1)],
	                [undefined, undefined],
	                ["Menu", "menu"]
	            ];
	        }
	        else {
	            return [
	                ["New Game", "new-game"],
	                ["Saves", "saves"],
	                ["Settings", "settings"],
	                ["Editor", "edit"],
	                ["Help", "help"],
	                [undefined, undefined],
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
	        let id = new Date().getTime() +
	            this.state.game.campaign.name +
	            ": " +
	            this.state.game.stage.name;
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
	                return h(Help, null);
	            case "saves":
	                return (h(Saves, { saves: this.state.saves, campaigns: this.state.campaigns, saveCampaign: this.game.customCampaign && this.saveCampaign, save: this.saveGame, load: this.loadGame, del: this.delGame, changeName: this.changeGameName }));
	            case "new-game":
	                return (h(NewGame, { campaigns: Game.allCampaignIds(), startStage: (campaign, stage) => this.startStage(campaign, stage) }));
	            default:
	                return h("div", null);
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
	    sideButtonText(i) {
	        let ai = this.state.aiSides & (1 << i);
	        let text = h("span", null, ai ? "AI" : "Player");
	        if (this.state.activeTeam && this.state.activeTeam.faction == i)
	            text = h("u", null, text);
	        return text;
	    }
	    render() {
	        let state = this.state;
	        let page = state.page;
	        let cursor = svgImg(`width="32" height="32" fill="none" stroke="black"`, `<circle r="12" cx="16" cy="16" /><path d="M16 0 v32 M0 16 h32" />`);
	        return (h("div", { style: `cursor:${cursor} 16 16, auto;` },
	            h("div", { class: "center-screen", style: this.displayIfPage("play") },
	                h("canvas", { ref: this.canvas, id: "main" })),
	            h("div", { class: "center-horisontal" },
	                h("div", { id: "editor", style: this.displayIfPage("edit") },
	                    h("textarea", { onChange: linkState(this, "stageEdit"), cols: 100, rows: 40, value: this.state.stageEdit, id: "edit-area" }),
	                    h("div", { class: "row" },
	                        h("label", null,
	                            h("input", { type: "checkbox", checked: state.modCampaign, onChange: this.toggleModCampaign }),
	                            "Modify Campaign"),
	                        h("label", null,
	                            h("input", { type: "checkbox", checked: state.modState, onChange: this.toggleModState }),
	                            "Modify State"),
	                        h("span", { class: "flex-spacer" }),
	                        h("button", { id: "endb", onClick: e => this.cancelEdit() }, "Cancel"))),
	                [this.renderPage()]),
	            h("div", { class: "top-buttons row" }, this.topButtons().map(([text, action], i) => text ? (h("button", { class: "medium" +
	                    (page == "play" && i <= 2 ? " side" + i : "") +
	                    (page == action ? " pressed" : ""), onClick: e => action instanceof Function ? action() : this.setPage(action) }, page == "play" && i <= 2 ? this.sideButtonText(i) : text)) : (h("span", { class: "flex-spacer" })))),
	            state.unitInfo && page == "play" && (h(UnitInfo, { unit: state.unitInfo, chosen: this.state.chosen })),
	            h("div", { class: "bottom-buttons row" },
	                h("span", { class: "flex-spacer" }),
	                page == "play" && !state.aiTurn && (h("button", { id: "endb", onClick: e => this.endTurn() }, "End Turn"))),
	            h("div", { class: "ability-buttons" },
	                h(AbilityButton, null,
	                    h("circle", { r: "12", cx: "16", cy: "16" }),
	                    h("path", { d: "M16,0 v32 M0 16 h32" })),
	                h(AbilityButton, null,
	                    h("circle", { r: "10", cx: "16", cy: "16" }),
	                    h("circle", { r: "6", cx: "16", cy: "16" }),
	                    h("path", { d: "M0,16 Q16,-4 32,16 Q16,36 0,16" })),
	                h(AbilityButton, null,
	                    h("path", { d: "M24,4 L0,16 L24,28 M16,8 a10,10 45 0 1 0,16 v-16" })),
	                h(AbilityButton, null,
	                    h("path", { d: "M4,0 q24,0 24,12 h-4 q0,-6 -14,-6 l2,8 h-4 L4,0 M16,28 l-8,-8 l16,0 l-8,8" })),
	                h(AbilityButton, null,
	                    h("path", { d: "M4,0 q24,0 24,12 h-4 q0,-6 -14,-6 l2,8 h-4 L4,0 M16,20 l-8,8 l16,0 l-8,-8" })),
	                h(AbilityButton, null,
	                    h("path", { d: "M4,4 h24 v24 h-24 v-24 m0,8 h25 m-16,0 c0,6 6,6 6,0" }))),
	            h("div", { id: "tooltip", style: state.tooltipAt
	                    ? `display:block; left:${state.tooltipAt[0] +
                        30 +
                        this.canvas.current.offsetLeft}; top:${state.tooltipAt[1]}`
	                    : `display:none` }, state.tooltipText)));
	    }
	}
	__decorate([
	    bind
	], GUI.prototype, "saveCampaign", null);
	__decorate([
	    bind
	], GUI.prototype, "saveGame", null);
	__decorate([
	    bind
	], GUI.prototype, "delGame", null);
	__decorate([
	    bind
	], GUI.prototype, "loadGame", null);
	__decorate([
	    bind
	], GUI.prototype, "changeGameName", null);
	__decorate([
	    bind
	], GUI.prototype, "toggleModCampaign", null);
	__decorate([
	    bind
	], GUI.prototype, "toggleModState", null);
	let UnitInfo = ({ unit, chosen }) => {
	    let accMods = {};
	    let hitChance = 0;
	    if (unit && chosen && unit != chosen)
	        hitChance = chosen.hitChance(unit.cell, unit, false, accMods);
	    return (h("div", { id: "unitInfo" },
	        unit.name.toUpperCase(),
	        " ",
	        h("b", null, unit.hp),
	        "HP ",
	        h("b", null, unit.ap),
	        "AP",
	        " ",
	        h("b", null, unit.stress),
	        "SP",
	        h("br", null),
	        "velocity",
	        renderV2(unit.velocity),
	        " focus",
	        renderV2(unit.focus),
	        h("br", null),
	        hitChance && (h("div", null,
	            "Hit Chance: ",
	            h("b", null, hitChance),
	            Object.keys(accMods)
	                .filter(key => accMods[key])
	                .map(key => (h("span", { class: "nobr" },
	                " ",
	                key,
	                h("b", null, signed(accMods[key]))))))),
	        lang[unit.name]));
	};
	function renderV2(v) {
	    let angle = (Math.atan2(v[1], v[0]) / Math.PI) * 180;
	    let length$1 = Math.round(length(v));
	    return (h("span", null,
	        h("svg", { width: "10px", height: "10px" },
	            h("path", { d: "M5 5 l 0 -5 l 5 5 l -5 5 l 0 -4 l -5 0 l 0 -2 l 5 0 ", transform: `rotate(${angle} 5 5)` })),
	        h("b", null, length$1)));
	}

	window.onload = function () {
	    let el = render(h(GUI, null), document.body);
	};

}());
