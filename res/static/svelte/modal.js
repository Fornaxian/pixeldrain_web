
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':5001/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.6' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/util/Modal.svelte generated by Svelte v3.29.6 */
    const file = "src/util/Modal.svelte";

    // (45:0) {#if visible}
    function create_if_block(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let button;
    	let i;
    	let t3;
    	let div2;
    	let load_modal_action;
    	let load_bg_action;
    	let div4_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			button = element("button");
    			i = element("i");
    			i.textContent = "close";
    			t3 = space();
    			div2 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "title svelte-tirhyp");
    			add_location(div0, file, 48, 3, 1188);
    			attr_dev(i, "class", "icon");
    			add_location(i, file, 50, 4, 1285);
    			attr_dev(button, "class", "button_close button_red svelte-tirhyp");
    			add_location(button, file, 49, 3, 1224);
    			attr_dev(div1, "class", "header highlight_1 svelte-tirhyp");
    			add_location(div1, file, 47, 2, 1152);
    			attr_dev(div2, "class", "body svelte-tirhyp");
    			add_location(div2, file, 53, 2, 1335);
    			attr_dev(div3, "class", "window svelte-tirhyp");
    			attr_dev(div3, "role", "dialog");
    			attr_dev(div3, "aria-modal", "true");
    			add_location(div3, file, 46, 1, 1057);
    			attr_dev(div4, "class", "background svelte-tirhyp");
    			add_location(div4, file, 45, 0, 969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, i);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*hide*/ ctx[1], false, false, false),
    					action_destroyer(load_modal_action = /*load_modal*/ ctx[4].call(null, div3)),
    					listen_dev(div3, "click", stop_propagation(/*click_handler*/ ctx[12]), false, false, true),
    					action_destroyer(load_bg_action = /*load_bg*/ ctx[3].call(null, div4)),
    					listen_dev(div4, "click", /*hide*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, { duration: 200 }, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, fade, { duration: 200 }, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div4_transition) div4_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(45:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*visible*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*keydown*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let global_index = 10000;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { title = "" } = $$props;
    	let { width = "800px" } = $$props;
    	let { height = "auto" } = $$props;
    	let visible = false;

    	const load_bg = background => {
    		background.style.zIndex = global_index.valueOf();
    		global_index++;
    	};

    	const load_modal = modal => {
    		modal.style.width = width;
    		modal.style.height = height;
    	};

    	const dispatch = createEventDispatcher();

    	const show = () => {
    		$$invalidate(2, visible = true);
    		dispatch("shown");
    	};

    	const hide = () => {
    		$$invalidate(2, visible = false);
    		dispatch("hidden");
    	};

    	const toggle = () => {
    		if (visible) {
    			hide();
    		} else {
    			show();
    		}
    	};

    	const keydown = e => {
    		if (e.key === "Escape") {
    			hide();
    			return;
    		}
    	};

    	const writable_props = ["title", "width", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("width" in $$props) $$invalidate(6, width = $$props.width);
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		global_index,
    		createEventDispatcher,
    		fade,
    		title,
    		width,
    		height,
    		visible,
    		load_bg,
    		load_modal,
    		dispatch,
    		show,
    		hide,
    		toggle,
    		keydown
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("width" in $$props) $$invalidate(6, width = $$props.width);
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		hide,
    		visible,
    		load_bg,
    		load_modal,
    		keydown,
    		width,
    		height,
    		show,
    		toggle,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			title: 0,
    			width: 6,
    			height: 7,
    			show: 8,
    			hide: 1,
    			toggle: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get title() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		return this.$$.ctx[8];
    	}

    	set show(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hide() {
    		return this.$$.ctx[1];
    	}

    	set hide(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		return this.$$.ctx[9];
    	}

    	set toggle(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/modal/App.svelte generated by Svelte v3.29.6 */
    const file$1 = "src/modal/App.svelte";

    // (14:0) <Modal bind:this={modal3} title="Third modal" width="700px">
    function create_default_slot_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "https://pixeldrain.com/res/img/header_orbitron_wide.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			set_style(img, "max-width", "100%");
    			add_location(img, file$1, 14, 1, 226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(14:0) <Modal bind:this={modal3} title=\\\"Third modal\\\" width=\\\"700px\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:0) <Modal bind:this={modal2} title="Wat!" width="1000px">
    function create_default_slot_1(ctx) {
    	let ol;
    	let li0;
    	let t1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let li3;
    	let t7;
    	let li4;
    	let button;
    	let t9;
    	let li5;
    	let t11;
    	let li6;
    	let t13;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ol = element("ol");
    			li0 = element("li");
    			li0.textContent = "of or relating to modality in logic";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "containing provisions as to the mode of procedure or the manner of taking effect —used of a contract or legacy";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "of or relating to a musical mode";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "of or relating to structure as opposed to substance";
    			t7 = space();
    			li4 = element("li");
    			button = element("button");
    			button.textContent = "third modal";
    			t9 = space();
    			li5 = element("li");
    			li5.textContent = "of, relating to, or constituting a grammatical form or category characteristically indicating predication";
    			t11 = space();
    			li6 = element("li");
    			li6.textContent = "of or relating to a statistical mode";
    			t13 = space();
    			a = element("a");
    			a.textContent = "merriam-webster.com";
    			add_location(li0, file$1, 18, 2, 427);
    			add_location(li1, file$1, 19, 2, 474);
    			add_location(li2, file$1, 20, 2, 596);
    			add_location(li3, file$1, 21, 2, 640);
    			add_location(button, file$1, 22, 6, 707);
    			add_location(li4, file$1, 22, 2, 703);
    			add_location(li5, file$1, 23, 2, 766);
    			add_location(li6, file$1, 24, 2, 883);
    			attr_dev(ol, "class", "definition-list");
    			add_location(ol, file$1, 17, 1, 396);
    			attr_dev(a, "href", "https://www.merriam-webster.com/dictionary/modal");
    			add_location(a, file$1, 27, 1, 938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ol, anchor);
    			append_dev(ol, li0);
    			append_dev(ol, t1);
    			append_dev(ol, li1);
    			append_dev(ol, t3);
    			append_dev(ol, li2);
    			append_dev(ol, t5);
    			append_dev(ol, li3);
    			append_dev(ol, t7);
    			append_dev(ol, li4);
    			append_dev(li4, button);
    			append_dev(ol, t9);
    			append_dev(ol, li5);
    			append_dev(ol, t11);
    			append_dev(ol, li6);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*modal3*/ ctx[2].show)) /*modal3*/ ctx[2].show.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ol);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(17:0) <Modal bind:this={modal2} title=\\\"Wat!\\\" width=\\\"1000px\\\">",
    		ctx
    	});

    	return block;
    }

    // (31:0) <Modal bind:this={modal1} title="Hello!">
    function create_default_slot(ctx) {
    	let ol;
    	let li0;
    	let t1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let li3;
    	let t7;
    	let li4;
    	let t9;
    	let li5;
    	let t11;
    	let a;
    	let t13;
    	let br;
    	let t14;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			ol = element("ol");
    			li0 = element("li");
    			li0.textContent = "of or relating to modality in logic";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "containing provisions as to the mode of procedure or the manner of taking effect —used of a contract or legacy";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "of or relating to a musical mode";
    			t5 = space();
    			li3 = element("li");
    			li3.textContent = "of or relating to structure as opposed to substance";
    			t7 = space();
    			li4 = element("li");
    			li4.textContent = "of, relating to, or constituting a grammatical form or category characteristically indicating predication";
    			t9 = space();
    			li5 = element("li");
    			li5.textContent = "of or relating to a statistical mode";
    			t11 = space();
    			a = element("a");
    			a.textContent = "merriam-webster.com";
    			t13 = space();
    			br = element("br");
    			t14 = space();
    			button = element("button");
    			button.textContent = "show modal";
    			add_location(li0, file$1, 32, 2, 1105);
    			add_location(li1, file$1, 33, 2, 1152);
    			add_location(li2, file$1, 34, 2, 1274);
    			add_location(li3, file$1, 35, 2, 1318);
    			add_location(li4, file$1, 36, 2, 1381);
    			add_location(li5, file$1, 37, 2, 1498);
    			attr_dev(ol, "class", "definition-list");
    			add_location(ol, file$1, 31, 1, 1074);
    			attr_dev(a, "href", "https://www.merriam-webster.com/dictionary/modal");
    			add_location(a, file$1, 40, 1, 1553);
    			add_location(br, file$1, 41, 1, 1637);
    			add_location(button, file$1, 43, 1, 1645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ol, anchor);
    			append_dev(ol, li0);
    			append_dev(ol, t1);
    			append_dev(ol, li1);
    			append_dev(ol, t3);
    			append_dev(ol, li2);
    			append_dev(ol, t5);
    			append_dev(ol, li3);
    			append_dev(ol, t7);
    			append_dev(ol, li4);
    			append_dev(ol, t9);
    			append_dev(ol, li5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*modal2*/ ctx[1].show)) /*modal2*/ ctx[1].show.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ol);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(31:0) <Modal bind:this={modal1} title=\\\"Hello!\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let button;
    	let t1;
    	let br;
    	let t2;
    	let modal0;
    	let t3;
    	let modal1_1;
    	let t4;
    	let modal2_1;
    	let current;
    	let mounted;
    	let dispose;

    	let modal0_props = {
    		title: "Third modal",
    		width: "700px",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	modal0 = new Modal({ props: modal0_props, $$inline: true });
    	/*modal0_binding*/ ctx[3](modal0);

    	let modal1_1_props = {
    		title: "Wat!",
    		width: "1000px",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	modal1_1 = new Modal({ props: modal1_1_props, $$inline: true });
    	/*modal1_1_binding*/ ctx[4](modal1_1);

    	let modal2_1_props = {
    		title: "Hello!",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	modal2_1 = new Modal({ props: modal2_1_props, $$inline: true });
    	/*modal2_1_binding*/ ctx[5](modal2_1);

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "show modal";
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			create_component(modal0.$$.fragment);
    			t3 = space();
    			create_component(modal1_1.$$.fragment);
    			t4 = space();
    			create_component(modal2_1.$$.fragment);
    			add_location(button, file$1, 7, 0, 102);
    			add_location(br, file$1, 11, 0, 157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(modal1_1, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(modal2_1, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*modal1*/ ctx[0].show)) /*modal1*/ ctx[0].show.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_1_changes = {};

    			if (dirty & /*$$scope, modal3*/ 68) {
    				modal1_1_changes.$$scope = { dirty, ctx };
    			}

    			modal1_1.$set(modal1_1_changes);
    			const modal2_1_changes = {};

    			if (dirty & /*$$scope, modal2*/ 66) {
    				modal2_1_changes.$$scope = { dirty, ctx };
    			}

    			modal2_1.$set(modal2_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1_1.$$.fragment, local);
    			transition_in(modal2_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1_1.$$.fragment, local);
    			transition_out(modal2_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			/*modal0_binding*/ ctx[3](null);
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t3);
    			/*modal1_1_binding*/ ctx[4](null);
    			destroy_component(modal1_1, detaching);
    			if (detaching) detach_dev(t4);
    			/*modal2_1_binding*/ ctx[5](null);
    			destroy_component(modal2_1, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let modal1;
    	let modal2;
    	let modal3;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function modal0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal3 = $$value;
    			$$invalidate(2, modal3);
    		});
    	}

    	function modal1_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal2 = $$value;
    			$$invalidate(1, modal2);
    		});
    	}

    	function modal2_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal1 = $$value;
    			$$invalidate(0, modal1);
    		});
    	}

    	$$self.$capture_state = () => ({ Modal, modal1, modal2, modal3 });

    	$$self.$inject_state = $$props => {
    		if ("modal1" in $$props) $$invalidate(0, modal1 = $$props.modal1);
    		if ("modal2" in $$props) $$invalidate(1, modal2 = $$props.modal2);
    		if ("modal3" in $$props) $$invalidate(2, modal3 = $$props.modal3);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modal1, modal2, modal3, modal0_binding, modal1_1_binding, modal2_1_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=modal.js.map
