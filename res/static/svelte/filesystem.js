
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':5000/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src/util/Formatting.svelte generated by Svelte v3.29.6 */

    const formatThousands = x => {
    	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const formatDataVolume = (amt, precision) => {
    	if (precision < 3) {
    		precision = 3;
    	}

    	if (amt >= 1000000000000000000) {
    		return (amt / 1000000000000000000).toPrecision(precision) + " EB";
    	} else if (amt >= 1000000000000000) {
    		return (amt / 1000000000000000).toPrecision(precision) + " PB";
    	} else if (amt >= 1000000000000) {
    		return (amt / 1000000000000).toPrecision(precision) + " TB";
    	} else if (amt >= 1000000000) {
    		return (amt / 1000000000).toPrecision(precision) + " GB";
    	} else if (amt >= 1000000) {
    		return (amt / 1000000).toPrecision(precision) + " MB";
    	} else if (amt >= 1000) {
    		return (amt / 1000).toPrecision(precision) + " kB";
    	}

    	return amt + " B";
    };

    const formatDate = (date, hours, minutes, seconds) => {
    	if (!(date instanceof Date)) {
    		date = new Date(date);
    	}

    	let dateStr = date.getFullYear() + "-" + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + date.getDate()).slice(-2);

    	if (hours) {
    		dateStr += " " + ("00" + date.getHours()).slice(-2);
    	}

    	if (minutes) {
    		dateStr += ":" + ("00" + date.getMinutes()).slice(-2);
    	}

    	if (seconds) {
    		dateStr += ":" + ("00" + date.getMinutes()).slice(-2);
    	}

    	return dateStr;
    };

    /* src/filesystem/Sharebar.svelte generated by Svelte v3.29.6 */

    const file = "src/filesystem/Sharebar.svelte";

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let button3;
    	let t9;
    	let button4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Share on:");
    			br = element("br");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "E-Mail";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Reddit";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "Twitter";
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "Facebook";
    			t9 = space();
    			button4 = element("button");
    			button4.textContent = "Tumblr";
    			add_location(br, file, 8, 10, 230);
    			attr_dev(button0, "class", "sharebar-button button_full_width");
    			attr_dev(button0, "onclick", "window.open('mailto:please@set.address?subject=File%20on%20pixeldrain&body=' + window.location.href);");
    			add_location(button0, file, 9, 1, 237);
    			attr_dev(button1, "class", "sharebar-button button_full_width");
    			attr_dev(button1, "onclick", "window.open('https://www.reddit.com/submit?url=' + window.location.href);");
    			add_location(button1, file, 12, 1, 421);
    			attr_dev(button2, "class", "sharebar-button button_full_width");
    			attr_dev(button2, "onclick", "window.open('https://twitter.com/share?url=' + window.location.href);");
    			add_location(button2, file, 15, 1, 577);
    			attr_dev(button3, "class", "sharebar-button button_full_width");
    			attr_dev(button3, "onclick", "window.open('http://www.facebook.com/sharer.php?u=' + window.location.href);");
    			add_location(button3, file, 18, 1, 730);
    			attr_dev(button4, "class", "sharebar-button button_full_width");
    			attr_dev(button4, "onclick", "window.open('http://www.tumblr.com/share/link?url=' + window.location.href);");
    			add_location(button4, file, 21, 1, 891);
    			attr_dev(div, "class", "sharebar svelte-gnq1s2");
    			toggle_class(div, "visible", /*visible*/ ctx[0]);
    			add_location(div, file, 7, 0, 162);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);
    			append_dev(div, button3);
    			append_dev(div, t9);
    			append_dev(div, button4);
    			/*div_binding*/ ctx[4](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*visible*/ 1) {
    				toggle_class(div, "visible", /*visible*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[4](null);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sharebar", slots, []);
    	let sharebar;
    	let { visible = false } = $$props;

    	const setVisible = v => {
    		$$invalidate(0, visible = v);
    	};

    	const toggle = () => {
    		setVisible(!visible);
    	};

    	const writable_props = ["visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sharebar> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sharebar = $$value;
    			$$invalidate(1, sharebar);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({ sharebar, visible, setVisible, toggle });

    	$$self.$inject_state = $$props => {
    		if ("sharebar" in $$props) $$invalidate(1, sharebar = $$props.sharebar);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, sharebar, setVisible, toggle, div_binding];
    }

    class Sharebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { visible: 0, setVisible: 2, toggle: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sharebar",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get visible() {
    		throw new Error("<Sharebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Sharebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setVisible() {
    		return this.$$.ctx[2];
    	}

    	set setVisible(value) {
    		throw new Error("<Sharebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		return this.$$.ctx[3];
    	}

    	set toggle(value) {
    		throw new Error("<Sharebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/util/Spinner.svelte generated by Svelte v3.29.6 */

    const file$1 = "src/util/Spinner.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let path;
    	let animateTransform;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			animateTransform = svg_element("animateTransform");
    			attr_dev(animateTransform, "attributeType", "xml");
    			attr_dev(animateTransform, "attributeName", "transform");
    			attr_dev(animateTransform, "type", "rotate");
    			attr_dev(animateTransform, "from", "0 40 40");
    			attr_dev(animateTransform, "to", "360 40 40");
    			attr_dev(animateTransform, "dur", "0.6s");
    			attr_dev(animateTransform, "repeatCount", "indefinite");
    			add_location(animateTransform, file$1, 22, 2, 1719);
    			attr_dev(path, "d", "M10,40c0,0,0-0.4,0-1.1c0-0.3,0-0.8,0-1.3c0-0.3,0-0.5,0-0.8c0-0.3,0.1-0.6,0.1-0.9c0.1-0.6,0.1-1.4,0.2-2.1\n\t\tc0.2-0.8,0.3-1.6,0.5-2.5c0.2-0.9,0.6-1.8,0.8-2.8c0.3-1,0.8-1.9,1.2-3c0.5-1,1.1-2,1.7-3.1c0.7-1,1.4-2.1,2.2-3.1\n\t\tc1.6-2.1,3.7-3.9,6-5.6c2.3-1.7,5-3,7.9-4.1c0.7-0.2,1.5-0.4,2.2-0.7c0.7-0.3,1.5-0.3,2.3-0.5c0.8-0.2,1.5-0.3,2.3-0.4l1.2-0.1\n\t\tl0.6-0.1l0.3,0l0.1,0l0.1,0l0,0c0.1,0-0.1,0,0.1,0c1.5,0,2.9-0.1,4.5,0.2c0.8,0.1,1.6,0.1,2.4,0.3c0.8,0.2,1.5,0.3,2.3,0.5\n\t\tc3,0.8,5.9,2,8.5,3.6c2.6,1.6,4.9,3.4,6.8,5.4c1,1,1.8,2.1,2.7,3.1c0.8,1.1,1.5,2.1,2.1,3.2c0.6,1.1,1.2,2.1,1.6,3.1\n\t\tc0.4,1,0.9,2,1.2,3c0.3,1,0.6,1.9,0.8,2.7c0.2,0.9,0.3,1.6,0.5,2.4c0.1,0.4,0.1,0.7,0.2,1c0,0.3,0.1,0.6,0.1,0.9\n\t\tc0.1,0.6,0.1,1,0.1,1.4C74,39.6,74,40,74,40c0.2,2.2-1.5,4.1-3.7,4.3s-4.1-1.5-4.3-3.7c0-0.1,0-0.2,0-0.3l0-0.4c0,0,0-0.3,0-0.9\n\t\tc0-0.3,0-0.7,0-1.1c0-0.2,0-0.5,0-0.7c0-0.2-0.1-0.5-0.1-0.8c-0.1-0.6-0.1-1.2-0.2-1.9c-0.1-0.7-0.3-1.4-0.4-2.2\n\t\tc-0.2-0.8-0.5-1.6-0.7-2.4c-0.3-0.8-0.7-1.7-1.1-2.6c-0.5-0.9-0.9-1.8-1.5-2.7c-0.6-0.9-1.2-1.8-1.9-2.7c-1.4-1.8-3.2-3.4-5.2-4.9\n\t\tc-2-1.5-4.4-2.7-6.9-3.6c-0.6-0.2-1.3-0.4-1.9-0.6c-0.7-0.2-1.3-0.3-1.9-0.4c-1.2-0.3-2.8-0.4-4.2-0.5l-2,0c-0.7,0-1.4,0.1-2.1,0.1\n\t\tc-0.7,0.1-1.4,0.1-2,0.3c-0.7,0.1-1.3,0.3-2,0.4c-2.6,0.7-5.2,1.7-7.5,3.1c-2.2,1.4-4.3,2.9-6,4.7c-0.9,0.8-1.6,1.8-2.4,2.7\n\t\tc-0.7,0.9-1.3,1.9-1.9,2.8c-0.5,1-1,1.9-1.4,2.8c-0.4,0.9-0.8,1.8-1,2.6c-0.3,0.9-0.5,1.6-0.7,2.4c-0.2,0.7-0.3,1.4-0.4,2.1\n\t\tc-0.1,0.3-0.1,0.6-0.2,0.9c0,0.3-0.1,0.6-0.1,0.8c0,0.5-0.1,0.9-0.1,1.3C10,39.6,10,40,10,40z");
    			add_location(path, file$1, 8, 1, 183);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", "svg_spinner svelte-1pco739");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 80 80");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			append_dev(path, animateTransform);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$1.name
    		});
    	}
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
    const file$2 = "src/util/Modal.svelte";

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
    			add_location(div0, file$2, 48, 3, 1188);
    			attr_dev(i, "class", "icon");
    			add_location(i, file$2, 50, 4, 1285);
    			attr_dev(button, "class", "button_close button_red svelte-tirhyp");
    			add_location(button, file$2, 49, 3, 1224);
    			attr_dev(div1, "class", "header highlight_1 svelte-tirhyp");
    			add_location(div1, file$2, 47, 2, 1152);
    			attr_dev(div2, "class", "body svelte-tirhyp");
    			add_location(div2, file$2, 53, 2, 1335);
    			attr_dev(div3, "class", "window svelte-tirhyp");
    			attr_dev(div3, "role", "dialog");
    			attr_dev(div3, "aria-modal", "true");
    			add_location(div3, file$2, 46, 1, 1057);
    			attr_dev(div4, "class", "background svelte-tirhyp");
    			add_location(div4, file$2, 45, 0, 969);
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

    function create_fragment$2(ctx) {
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let global_index = 10000;

    function instance$2($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
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
    			id: create_fragment$2.name
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

    /* src/filesystem/viewers/Directory.svelte generated by Svelte v3.29.6 */
    const file$3 = "src/filesystem/viewers/Directory.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (80:3) {#each children as child, index}
    function create_each_block(ctx) {
    	let a;
    	let td0;
    	let img;
    	let img_src_value;
    	let t0;
    	let td1;
    	let t1_value = /*child*/ ctx[9].name + "";
    	let t1;
    	let t2;
    	let td2;
    	let t3_value = formatDataVolume(/*child*/ ctx[9].file_size, 3) + "";
    	let t3;
    	let t4;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[6](/*child*/ ctx[9], /*index*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			td0 = element("td");
    			img = element("img");
    			t0 = space();
    			td1 = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			if (img.src !== (img_src_value = /*node_icon*/ ctx[5](/*child*/ ctx[9]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "node_icon svelte-6g6w4");
    			attr_dev(img, "alt", "icon");
    			add_location(img, file$3, 89, 6, 2581);
    			attr_dev(td0, "class", "svelte-6g6w4");
    			add_location(td0, file$3, 88, 5, 2570);
    			attr_dev(td1, "class", "node_name svelte-6g6w4");
    			add_location(td1, file$3, 91, 5, 2656);
    			attr_dev(td2, "class", "node_size svelte-6g6w4");
    			add_location(td2, file$3, 94, 5, 2714);
    			attr_dev(a, "href", a_href_value = /*path_base*/ ctx[1] + /*child*/ ctx[9].path);
    			attr_dev(a, "class", "node svelte-6g6w4");
    			toggle_class(a, "node_selected", /*child*/ ctx[9].selected);
    			add_location(a, file$3, 80, 4, 2296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, td0);
    			append_dev(td0, img);
    			append_dev(a, t0);
    			append_dev(a, td1);
    			append_dev(td1, t1);
    			append_dev(a, t2);
    			append_dev(a, td2);
    			append_dev(td2, t3);
    			append_dev(a, t4);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*children*/ 4 && img.src !== (img_src_value = /*node_icon*/ ctx[5](/*child*/ ctx[9]))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*children*/ 4 && t1_value !== (t1_value = /*child*/ ctx[9].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*children*/ 4 && t3_value !== (t3_value = formatDataVolume(/*child*/ ctx[9].file_size, 3) + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*path_base, children*/ 6 && a_href_value !== (a_href_value = /*path_base*/ ctx[1] + /*child*/ ctx[9].path)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*children*/ 4) {
    				toggle_class(a, "node_selected", /*child*/ ctx[9].selected);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(80:3) {#each children as child, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let button0;
    	let i0;
    	let t1;
    	let div0;
    	let t2;
    	let button1;
    	let i1;
    	let t4;
    	let button2;
    	let i2;
    	let t6;
    	let button3;
    	let i3;
    	let t8;
    	let br;
    	let t9;
    	let table;
    	let tr;
    	let td0;
    	let t10;
    	let td1;
    	let t12;
    	let td2;
    	let t14;
    	let mounted;
    	let dispose;
    	let each_value = /*children*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			i0.textContent = "arrow_back";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			button1 = element("button");
    			i1 = element("i");
    			i1.textContent = "cloud_upload";
    			t4 = space();
    			button2 = element("button");
    			i2 = element("i");
    			i2.textContent = "create_new_folder";
    			t6 = space();
    			button3 = element("button");
    			i3 = element("i");
    			i3.textContent = "delete";
    			t8 = space();
    			br = element("br");
    			t9 = space();
    			table = element("table");
    			tr = element("tr");
    			td0 = element("td");
    			t10 = space();
    			td1 = element("td");
    			td1.textContent = "name";
    			t12 = space();
    			td2 = element("td");
    			td2.textContent = "size";
    			t14 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", "icon");
    			add_location(i0, file$3, 64, 75, 1773);
    			attr_dev(button0, "class", "svelte-6g6w4");
    			toggle_class(button0, "hidden", /*node*/ ctx[0].parents.length === 0);
    			add_location(button0, file$3, 64, 3, 1701);
    			attr_dev(div0, "class", "toolbar_spacer svelte-6g6w4");
    			add_location(div0, file$3, 66, 3, 1834);
    			attr_dev(i1, "class", "icon");
    			add_location(i1, file$3, 67, 34, 1903);
    			attr_dev(button1, "class", "svelte-6g6w4");
    			add_location(button1, file$3, 67, 3, 1872);
    			attr_dev(i2, "class", "icon");
    			add_location(i2, file$3, 68, 34, 1979);
    			attr_dev(button2, "class", "svelte-6g6w4");
    			add_location(button2, file$3, 68, 3, 1948);
    			attr_dev(i3, "class", "icon");
    			add_location(i3, file$3, 69, 34, 2060);
    			attr_dev(button3, "class", "svelte-6g6w4");
    			add_location(button3, file$3, 69, 3, 2029);
    			attr_dev(div1, "class", "toolbar svelte-6g6w4");
    			add_location(div1, file$3, 62, 2, 1632);
    			add_location(br, file$3, 71, 2, 2107);
    			attr_dev(td0, "class", "svelte-6g6w4");
    			add_location(td0, file$3, 75, 4, 2201);
    			attr_dev(td1, "class", "svelte-6g6w4");
    			add_location(td1, file$3, 76, 4, 2215);
    			attr_dev(td2, "class", "svelte-6g6w4");
    			add_location(td2, file$3, 77, 4, 2233);
    			add_location(tr, file$3, 73, 3, 2144);
    			attr_dev(table, "class", "directory svelte-6g6w4");
    			add_location(table, file$3, 72, 2, 2115);
    			attr_dev(div2, "class", "width_container svelte-6g6w4");
    			add_location(div2, file$3, 61, 1, 1600);
    			attr_dev(div3, "class", "container svelte-6g6w4");
    			add_location(div3, file$3, 60, 0, 1575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(button0, i0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, button1);
    			append_dev(button1, i1);
    			append_dev(div1, t4);
    			append_dev(div1, button2);
    			append_dev(button2, i2);
    			append_dev(div1, t6);
    			append_dev(div1, button3);
    			append_dev(button3, i3);
    			append_dev(div2, t8);
    			append_dev(div2, br);
    			append_dev(div2, t9);
    			append_dev(div2, table);
    			append_dev(table, tr);
    			append_dev(tr, td0);
    			append_dev(tr, t10);
    			append_dev(tr, td1);
    			append_dev(tr, t12);
    			append_dev(tr, td2);
    			append_dev(table, t14);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*navigate_up*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*navigate_up*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*navigate_up*/ ctx[4], false, false, false),
    					listen_dev(button3, "click", /*navigate_up*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*node*/ 1) {
    				toggle_class(button0, "hidden", /*node*/ ctx[0].parents.length === 0);
    			}

    			if (dirty & /*path_base, children, node_click, formatDataVolume, node_icon*/ 46) {
    				each_value = /*children*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Directory", slots, []);
    	let dispatch = createEventDispatcher();
    	let { node } = $$props;
    	let { path_base } = $$props;
    	let mode = "viewing";

    	const node_click = (node, index) => {
    		if (mode === "viewing") {
    			dispatch("navigate", node.path);
    		} else if (mode === "selecting") {
    			$$invalidate(2, children[index].selected = !children[index].selected, children);
    		}
    	};

    	const navigate_up = () => {
    		// Go to the path of the last parent
    		if (node.parents.length !== 0) {
    			dispatch("navigate", node.parents[node.parents.length - 1].path);
    		}
    	};

    	const node_icon = node => {
    		if (node.type === "dir") {
    			return "/res/img/mime/folder.png";
    		}

    		switch (node.file_type) {
    			case "image/gif":
    				return "/res/img/mime/image-gif.png";
    			case ("image/apng"):
    				return "/res/img/mime/image-png.png";
    			case "image/jpeg":
    				return "/res/img/mime/image-jpeg.png";
    			case "application/pdf":
    				return "/res/img/mime/pdf.png";
    		}

    		if (node.file_type.startsWith("audio/")) {
    			return "/res/img/mime/audio.png";
    		} else if (node.file_type.startsWith("video/")) {
    			return "/res/img/mime/video.png";
    		} else if (node.file_type.startsWith("text/")) {
    			return "/res/img/mime/text.png";
    		} else if (node.file_type.startsWith("image/")) {
    			return "/res/img/mime/image-png.png";
    		} else if (node.file_type.startsWith("application/")) {
    			return "/res/img/mime/archive.png";
    		}

    		return "/res/img/mime/empty.png";
    	};

    	const writable_props = ["node", "path_base"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Directory> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (child, index) => {
    		node_click(child, index);
    	};

    	$$self.$$set = $$props => {
    		if ("node" in $$props) $$invalidate(0, node = $$props.node);
    		if ("path_base" in $$props) $$invalidate(1, path_base = $$props.path_base);
    	};

    	$$self.$capture_state = () => ({
    		formatDataVolume,
    		createEventDispatcher,
    		dispatch,
    		node,
    		path_base,
    		mode,
    		node_click,
    		navigate_up,
    		node_icon,
    		children
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("node" in $$props) $$invalidate(0, node = $$props.node);
    		if ("path_base" in $$props) $$invalidate(1, path_base = $$props.path_base);
    		if ("mode" in $$props) mode = $$props.mode;
    		if ("children" in $$props) $$invalidate(2, children = $$props.children);
    	};

    	let children;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*node*/ 1) {
    			 $$invalidate(2, children = node.base.children.reduce(
    				(accum, val) => {
    					val["selected"] = false;
    					accum.push(val);
    					return accum;
    				},
    				[]
    			));
    		}
    	};

    	return [node, path_base, children, node_click, navigate_up, node_icon, click_handler];
    }

    class Directory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { node: 0, path_base: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Directory",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*node*/ ctx[0] === undefined && !("node" in props)) {
    			console.warn("<Directory> was created without expected prop 'node'");
    		}

    		if (/*path_base*/ ctx[1] === undefined && !("path_base" in props)) {
    			console.warn("<Directory> was created without expected prop 'path_base'");
    		}
    	}

    	get node() {
    		throw new Error("<Directory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set node(value) {
    		throw new Error("<Directory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path_base() {
    		throw new Error("<Directory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path_base(value) {
    		throw new Error("<Directory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/viewers/Audio.svelte generated by Svelte v3.29.6 */
    const file$4 = "src/filesystem/viewers/Audio.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t0_value = /*node*/ ctx[0].base.name + "";
    	let t0;
    	let t1;
    	let br0;
    	let br1;
    	let t2;
    	let audio;
    	let track;
    	let audio_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t2 = space();
    			audio = element("audio");
    			track = element("track");
    			add_location(br0, file$4, 14, 1, 211);
    			add_location(br1, file$4, 14, 6, 216);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$4, 21, 2, 389);
    			attr_dev(audio, "class", "player svelte-11r8rw7");
    			if (audio.src !== (audio_src_value = window.apiEndpoint + "/filesystem/" + /*node*/ ctx[0].bucket.id + "/" + /*node*/ ctx[0].base.path)) attr_dev(audio, "src", audio_src_value);
    			audio.autoplay = "autoplay";
    			audio.controls = "controls";
    			add_location(audio, file$4, 15, 1, 223);
    			attr_dev(div, "class", "container svelte-11r8rw7");
    			add_location(div, file$4, 12, 0, 168);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, br0);
    			append_dev(div, br1);
    			append_dev(div, t2);
    			append_dev(div, audio);
    			append_dev(audio, track);

    			if (!mounted) {
    				dispose = listen_dev(audio, "ended", /*ended*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*node*/ 1 && t0_value !== (t0_value = /*node*/ ctx[0].base.name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*node*/ 1 && audio.src !== (audio_src_value = window.apiEndpoint + "/filesystem/" + /*node*/ ctx[0].bucket.id + "/" + /*node*/ ctx[0].base.path)) {
    				attr_dev(audio, "src", audio_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Audio", slots, []);
    	let dispatch = createEventDispatcher();
    	let { node } = $$props;

    	const ended = () => {
    		dispatch("next");
    	};

    	const writable_props = ["node"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Audio> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("node" in $$props) $$invalidate(0, node = $$props.node);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		node,
    		ended
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("node" in $$props) $$invalidate(0, node = $$props.node);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [node, ended];
    }

    class Audio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { node: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Audio",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*node*/ ctx[0] === undefined && !("node" in props)) {
    			console.warn("<Audio> was created without expected prop 'node'");
    		}
    	}

    	get node() {
    		throw new Error("<Audio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set node(value) {
    		throw new Error("<Audio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/viewers/Image.svelte generated by Svelte v3.29.6 */

    const { window: window_1 } = globals;
    const file$5 = "src/filesystem/viewers/Image.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "image svelte-xjzx7h");
    			if (img.src !== (img_src_value = window.apiEndpoint + "/filesystem/" + /*node*/ ctx[0].bucket.id + "/" + /*node*/ ctx[0].base.path)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "no description available");
    			toggle_class(img, "zoom", /*zoom*/ ctx[2]);
    			add_location(img, file$5, 45, 1, 791);
    			attr_dev(div, "class", "container svelte-xjzx7h");
    			toggle_class(div, "zoom", /*zoom*/ ctx[2]);
    			add_location(div, file$5, 44, 0, 733);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			/*div_binding*/ ctx[8](div);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "mousemove", /*mousemove*/ ctx[4], false, false, false),
    					listen_dev(window_1, "mouseup", /*mouseup*/ ctx[5], false, false, false),
    					listen_dev(img, "dblclick", /*dblclick_handler*/ ctx[6], false, false, false),
    					listen_dev(img, "doubletap", /*doubletap_handler*/ ctx[7], false, false, false),
    					listen_dev(img, "mousedown", /*mousedown*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*node*/ 1 && img.src !== (img_src_value = window.apiEndpoint + "/filesystem/" + /*node*/ ctx[0].bucket.id + "/" + /*node*/ ctx[0].base.path)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*zoom*/ 4) {
    				toggle_class(img, "zoom", /*zoom*/ ctx[2]);
    			}

    			if (dirty & /*zoom*/ 4) {
    				toggle_class(div, "zoom", /*zoom*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Image", slots, []);
    	let { node } = $$props;
    	let container;
    	let zoom = false;
    	let x, y = 0;
    	let dragging = false;

    	const mousedown = e => {
    		if (!dragging && e.which === 1 && zoom) {
    			x = e.pageX;
    			y = e.pageY;
    			dragging = true;
    			e.preventDefault();
    			e.stopPropagation();
    			return false;
    		}
    	};

    	const mousemove = e => {
    		if (dragging) {
    			$$invalidate(1, container.scrollLeft = container.scrollLeft - (e.pageX - x), container);
    			$$invalidate(1, container.scrollTop = container.scrollTop - (e.pageY - y), container);
    			x = e.pageX;
    			y = e.pageY;
    			e.preventDefault();
    			e.stopPropagation();
    			return false;
    		}
    	};

    	const mouseup = e => {
    		if (dragging) {
    			dragging = false;
    			e.preventDefault();
    			e.stopPropagation();
    			return false;
    		}
    	};

    	const writable_props = ["node"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	const dblclick_handler = () => {
    		$$invalidate(2, zoom = !zoom);
    	};

    	const doubletap_handler = () => {
    		$$invalidate(2, zoom = !zoom);
    	};

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("node" in $$props) $$invalidate(0, node = $$props.node);
    	};

    	$$self.$capture_state = () => ({
    		node,
    		container,
    		zoom,
    		x,
    		y,
    		dragging,
    		mousedown,
    		mousemove,
    		mouseup
    	});

    	$$self.$inject_state = $$props => {
    		if ("node" in $$props) $$invalidate(0, node = $$props.node);
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    		if ("zoom" in $$props) $$invalidate(2, zoom = $$props.zoom);
    		if ("x" in $$props) x = $$props.x;
    		if ("y" in $$props) y = $$props.y;
    		if ("dragging" in $$props) dragging = $$props.dragging;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		node,
    		container,
    		zoom,
    		mousedown,
    		mousemove,
    		mouseup,
    		dblclick_handler,
    		doubletap_handler,
    		div_binding
    	];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { node: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*node*/ ctx[0] === undefined && !("node" in props)) {
    			console.warn("<Image> was created without expected prop 'node'");
    		}
    	}

    	get node() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set node(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/Filesystem.svelte generated by Svelte v3.29.6 */

    const { console: console_1, window: window_1$1 } = globals;
    const file$6 = "src/filesystem/Filesystem.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (98:1) {#if loading}
    function create_if_block_4(ctx) {
    	let div;
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(spinner.$$.fragment);
    			set_style(div, "position", "absolute");
    			set_style(div, "right", "0");
    			set_style(div, "top", "0");
    			set_style(div, "height", "48px");
    			set_style(div, "width", "48px");
    			set_style(div, "z-index", "100");
    			add_location(div, file$6, 98, 1, 2242);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(spinner, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(spinner);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(98:1) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (110:3) {#each currentNode.parents as parent}
    function create_each_block$1(ctx) {
    	let div;
    	let t0_value = /*parent*/ ctx[26].name + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[15](/*parent*/ ctx[26]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" /");
    			attr_dev(div, "class", "breadcrumb breadcrumb_button svelte-15t34ei");
    			add_location(div, file$6, 110, 3, 2768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*currentNode*/ 64 && t0_value !== (t0_value = /*parent*/ ctx[26].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(110:3) {#each currentNode.parents as parent}",
    		ctx
    	});

    	return block;
    }

    // (148:37) 
    function create_if_block_3(ctx) {
    	let image;
    	let current;
    	let image_props = { node: /*currentNode*/ ctx[6] };
    	image = new Image({ props: image_props, $$inline: true });
    	/*image_binding*/ ctx[21](image);

    	const block = {
    		c: function create() {
    			create_component(image.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(image, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const image_changes = {};
    			if (dirty & /*currentNode*/ 64) image_changes.node = /*currentNode*/ ctx[6];
    			image.$set(image_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*image_binding*/ ctx[21](null);
    			destroy_component(image, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(148:37) ",
    		ctx
    	});

    	return block;
    }

    // (146:37) 
    function create_if_block_2(ctx) {
    	let audio;
    	let current;
    	let audio_props = { node: /*currentNode*/ ctx[6] };
    	audio = new Audio({ props: audio_props, $$inline: true });
    	/*audio_binding*/ ctx[20](audio);

    	const block = {
    		c: function create() {
    			create_component(audio.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audio, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audio_changes = {};
    			if (dirty & /*currentNode*/ 64) audio_changes.node = /*currentNode*/ ctx[6];
    			audio.$set(audio_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*audio_binding*/ ctx[20](null);
    			destroy_component(audio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(146:37) ",
    		ctx
    	});

    	return block;
    }

    // (144:3) {#if viewer_type === "dir"}
    function create_if_block_1(ctx) {
    	let directory;
    	let current;

    	let directory_props = {
    		node: /*currentNode*/ ctx[6],
    		path_base: /*path_base*/ ctx[12]
    	};

    	directory = new Directory({ props: directory_props, $$inline: true });
    	/*directory_binding*/ ctx[18](directory);
    	directory.$on("navigate", /*navigate_handler*/ ctx[19]);

    	const block = {
    		c: function create() {
    			create_component(directory.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(directory, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const directory_changes = {};
    			if (dirty & /*currentNode*/ 64) directory_changes.node = /*currentNode*/ ctx[6];
    			directory.$set(directory_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(directory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(directory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*directory_binding*/ ctx[18](null);
    			destroy_component(directory, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(144:3) {#if viewer_type === \\\"dir\\\"}",
    		ctx
    	});

    	return block;
    }

    // (165:3) {#if currentNode.base.type === "file"}
    function create_if_block$1(ctx) {
    	let tr0;
    	let td0;
    	let td1;
    	let t1_value = /*currentNode*/ ctx[6].base.file_type + "";
    	let t1;
    	let t2;
    	let tr1;
    	let td2;
    	let td3;
    	let t4_value = formatDataVolume(/*currentNode*/ ctx[6].base.file_size) + "";
    	let t4;

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			td0.textContent = "File type";
    			td1 = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			td2.textContent = "File size";
    			td3 = element("td");
    			t4 = text(t4_value);
    			add_location(td0, file$6, 165, 7, 5424);
    			add_location(td1, file$6, 165, 25, 5442);
    			add_location(tr0, file$6, 165, 3, 5420);
    			add_location(td2, file$6, 166, 7, 5492);
    			add_location(td3, file$6, 166, 25, 5510);
    			add_location(tr1, file$6, 166, 3, 5488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			append_dev(tr0, td1);
    			append_dev(td1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td2);
    			append_dev(tr1, td3);
    			append_dev(td3, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentNode*/ 64 && t1_value !== (t1_value = /*currentNode*/ ctx[6].base.file_type + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*currentNode*/ 64 && t4_value !== (t4_value = formatDataVolume(/*currentNode*/ ctx[6].base.file_size) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(tr1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(165:3) {#if currentNode.base.type === \\\"file\\\"}",
    		ctx
    	});

    	return block;
    }

    // (157:1) <Modal bind:this={details} title="Details" width="600px">
    function create_default_slot(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let h30;
    	let t1;
    	let tr1;
    	let td1;
    	let td2;
    	let t3_value = /*currentNode*/ ctx[6].base.name + "";
    	let t3;
    	let t4;
    	let tr2;
    	let td3;
    	let td4;
    	let t6_value = /*currentNode*/ ctx[6].base.path + "";
    	let t6;
    	let t7;
    	let tr3;
    	let td5;
    	let td6;
    	let t9_value = /*currentNode*/ ctx[6].base.type + "";
    	let t9;
    	let t10;
    	let tr4;
    	let td7;
    	let td8;
    	let t12_value = formatDate(/*currentNode*/ ctx[6].base.date_created, true, true, true) + "";
    	let t12;
    	let t13;
    	let tr5;
    	let td9;
    	let td10;
    	let t15_value = formatDate(/*currentNode*/ ctx[6].base.date_modified, true, true, true) + "";
    	let t15;
    	let t16;
    	let t17;
    	let tr6;
    	let td11;
    	let h31;
    	let t19;
    	let tr7;
    	let td12;
    	let td13;
    	let t21_value = /*currentNode*/ ctx[6].bucket.id + "";
    	let t21;
    	let t22;
    	let tr8;
    	let td14;
    	let td15;
    	let t24_value = /*currentNode*/ ctx[6].bucket.name + "";
    	let t24;
    	let t25;
    	let tr9;
    	let td16;
    	let td17;
    	let t27_value = formatDate(/*currentNode*/ ctx[6].bucket.date_created, true, true, true) + "";
    	let t27;
    	let t28;
    	let tr10;
    	let td18;
    	let td19;
    	let t30_value = formatDate(/*currentNode*/ ctx[6].bucket.date_modified, true, true, true) + "";
    	let t30;
    	let if_block = /*currentNode*/ ctx[6].base.type === "file" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			h30 = element("h3");
    			h30.textContent = "Node details";
    			t1 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			td1.textContent = "Name";
    			td2 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			td3.textContent = "Path";
    			td4 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			tr3 = element("tr");
    			td5 = element("td");
    			td5.textContent = "Type";
    			td6 = element("td");
    			t9 = text(t9_value);
    			t10 = space();
    			tr4 = element("tr");
    			td7 = element("td");
    			td7.textContent = "Date created";
    			td8 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			tr5 = element("tr");
    			td9 = element("td");
    			td9.textContent = "Date modified";
    			td10 = element("td");
    			t15 = text(t15_value);
    			t16 = space();
    			if (if_block) if_block.c();
    			t17 = space();
    			tr6 = element("tr");
    			td11 = element("td");
    			h31 = element("h3");
    			h31.textContent = "Bucket details";
    			t19 = space();
    			tr7 = element("tr");
    			td12 = element("td");
    			td12.textContent = "ID";
    			td13 = element("td");
    			t21 = text(t21_value);
    			t22 = space();
    			tr8 = element("tr");
    			td14 = element("td");
    			td14.textContent = "Name";
    			td15 = element("td");
    			t24 = text(t24_value);
    			t25 = space();
    			tr9 = element("tr");
    			td16 = element("td");
    			td16.textContent = "Date created";
    			td17 = element("td");
    			t27 = text(t27_value);
    			t28 = space();
    			tr10 = element("tr");
    			td18 = element("td");
    			td18.textContent = "Date modified";
    			td19 = element("td");
    			t30 = text(t30_value);
    			add_location(h30, file$6, 158, 23, 4959);
    			attr_dev(td0, "colspan", "2");
    			add_location(td0, file$6, 158, 7, 4943);
    			add_location(tr0, file$6, 158, 3, 4939);
    			add_location(td1, file$6, 159, 7, 4998);
    			add_location(td2, file$6, 159, 20, 5011);
    			add_location(tr1, file$6, 159, 3, 4994);
    			add_location(td3, file$6, 160, 7, 5056);
    			add_location(td4, file$6, 160, 20, 5069);
    			add_location(tr2, file$6, 160, 3, 5052);
    			add_location(td5, file$6, 161, 7, 5114);
    			add_location(td6, file$6, 161, 20, 5127);
    			add_location(tr3, file$6, 161, 3, 5110);
    			add_location(td7, file$6, 162, 7, 5172);
    			add_location(td8, file$6, 162, 28, 5193);
    			add_location(tr4, file$6, 162, 3, 5168);
    			add_location(td9, file$6, 163, 7, 5276);
    			add_location(td10, file$6, 163, 29, 5298);
    			add_location(tr5, file$6, 163, 3, 5272);
    			add_location(h31, file$6, 168, 23, 5603);
    			attr_dev(td11, "colspan", "2");
    			add_location(td11, file$6, 168, 7, 5587);
    			add_location(tr6, file$6, 168, 3, 5583);
    			add_location(td12, file$6, 169, 7, 5644);
    			add_location(td13, file$6, 169, 18, 5655);
    			add_location(tr7, file$6, 169, 3, 5640);
    			add_location(td14, file$6, 170, 7, 5700);
    			add_location(td15, file$6, 170, 20, 5713);
    			add_location(tr8, file$6, 170, 3, 5696);
    			add_location(td16, file$6, 171, 7, 5760);
    			add_location(td17, file$6, 171, 28, 5781);
    			add_location(tr9, file$6, 171, 3, 5756);
    			add_location(td18, file$6, 172, 7, 5866);
    			add_location(td19, file$6, 172, 29, 5888);
    			add_location(tr10, file$6, 172, 3, 5862);
    			set_style(table, "min-width", "100%");
    			add_location(table, file$6, 157, 2, 4903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, h30);
    			append_dev(table, t1);
    			append_dev(table, tr1);
    			append_dev(tr1, td1);
    			append_dev(tr1, td2);
    			append_dev(td2, t3);
    			append_dev(table, t4);
    			append_dev(table, tr2);
    			append_dev(tr2, td3);
    			append_dev(tr2, td4);
    			append_dev(td4, t6);
    			append_dev(table, t7);
    			append_dev(table, tr3);
    			append_dev(tr3, td5);
    			append_dev(tr3, td6);
    			append_dev(td6, t9);
    			append_dev(table, t10);
    			append_dev(table, tr4);
    			append_dev(tr4, td7);
    			append_dev(tr4, td8);
    			append_dev(td8, t12);
    			append_dev(table, t13);
    			append_dev(table, tr5);
    			append_dev(tr5, td9);
    			append_dev(tr5, td10);
    			append_dev(td10, t15);
    			append_dev(table, t16);
    			if (if_block) if_block.m(table, null);
    			append_dev(table, t17);
    			append_dev(table, tr6);
    			append_dev(tr6, td11);
    			append_dev(td11, h31);
    			append_dev(table, t19);
    			append_dev(table, tr7);
    			append_dev(tr7, td12);
    			append_dev(tr7, td13);
    			append_dev(td13, t21);
    			append_dev(table, t22);
    			append_dev(table, tr8);
    			append_dev(tr8, td14);
    			append_dev(tr8, td15);
    			append_dev(td15, t24);
    			append_dev(table, t25);
    			append_dev(table, tr9);
    			append_dev(tr9, td16);
    			append_dev(tr9, td17);
    			append_dev(td17, t27);
    			append_dev(table, t28);
    			append_dev(table, tr10);
    			append_dev(tr10, td18);
    			append_dev(tr10, td19);
    			append_dev(td19, t30);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentNode*/ 64 && t3_value !== (t3_value = /*currentNode*/ ctx[6].base.name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*currentNode*/ 64 && t6_value !== (t6_value = /*currentNode*/ ctx[6].base.path + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*currentNode*/ 64 && t9_value !== (t9_value = /*currentNode*/ ctx[6].base.type + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*currentNode*/ 64 && t12_value !== (t12_value = formatDate(/*currentNode*/ ctx[6].base.date_created, true, true, true) + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*currentNode*/ 64 && t15_value !== (t15_value = formatDate(/*currentNode*/ ctx[6].base.date_modified, true, true, true) + "")) set_data_dev(t15, t15_value);

    			if (/*currentNode*/ ctx[6].base.type === "file") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(table, t17);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*currentNode*/ 64 && t21_value !== (t21_value = /*currentNode*/ ctx[6].bucket.id + "")) set_data_dev(t21, t21_value);
    			if (dirty & /*currentNode*/ 64 && t24_value !== (t24_value = /*currentNode*/ ctx[6].bucket.name + "")) set_data_dev(t24, t24_value);
    			if (dirty & /*currentNode*/ 64 && t27_value !== (t27_value = formatDate(/*currentNode*/ ctx[6].bucket.date_created, true, true, true) + "")) set_data_dev(t27, t27_value);
    			if (dirty & /*currentNode*/ 64 && t30_value !== (t30_value = formatDate(/*currentNode*/ ctx[6].bucket.date_modified, true, true, true) + "")) set_data_dev(t30, t30_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(157:1) <Modal bind:this={details} title=\\\"Details\\\" width=\\\"600px\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div11;
    	let t0;
    	let div2;
    	let button0;
    	let i0;
    	let t2;
    	let a;
    	let i1;
    	let t4;
    	let div1;
    	let t5;
    	let div0;
    	let t6_value = /*currentNode*/ ctx[6].base.name + "";
    	let t6;
    	let t7;
    	let div3;
    	let t8;
    	let div10;
    	let div8;
    	let div7;
    	let div6;
    	let div4;
    	let t10;
    	let div5;
    	let t11_value = formatDataVolume(/*currentNode*/ ctx[6].base.file_size, 3) + "";
    	let t11;
    	let t12;
    	let button1;
    	let i2;
    	let t14;
    	let t15;
    	let button2;
    	let i3;
    	let t17;
    	let t18;
    	let button3;
    	let i4;
    	let t20;
    	let u0;
    	let t22;
    	let t23;
    	let button4;
    	let i5;
    	let t25;
    	let t26;
    	let button5;
    	let i6;
    	let t28;
    	let u1;
    	let t30;
    	let t31;
    	let button6;
    	let i7;
    	let t33;
    	let u2;
    	let t35;
    	let t36;
    	let sharebar_1;
    	let t37;
    	let div9;
    	let current_block_type_index;
    	let if_block1;
    	let t38;
    	let iframe;
    	let t39;
    	let modal;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*loading*/ ctx[7] && create_if_block_4(ctx);
    	let each_value = /*currentNode*/ ctx[6].parents;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let sharebar_1_props = {};
    	sharebar_1 = new Sharebar({ props: sharebar_1_props, $$inline: true });
    	/*sharebar_1_binding*/ ctx[17](sharebar_1);
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*viewer_type*/ ctx[8] === "dir") return 0;
    		if (/*viewer_type*/ ctx[8] === "audio") return 1;
    		if (/*viewer_type*/ ctx[8] === "image") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let modal_props = {
    		title: "Details",
    		width: "600px",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	modal = new Modal({ props: modal_props, $$inline: true });
    	/*modal_binding*/ ctx[23](modal);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			i0.textContent = "menu";
    			t2 = space();
    			a = element("a");
    			i1 = element("i");
    			i1.textContent = "home";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div0 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div3 = element("div");
    			t8 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "Size";
    			t10 = space();
    			div5 = element("div");
    			t11 = text(t11_value);
    			t12 = space();
    			button1 = element("button");
    			i2 = element("i");
    			i2.textContent = "save";
    			t14 = text(" Download");
    			t15 = space();
    			button2 = element("button");
    			i3 = element("i");
    			i3.textContent = "save";
    			t17 = text(" DL all files");
    			t18 = space();
    			button3 = element("button");
    			i4 = element("i");
    			i4.textContent = "content_copy";
    			t20 = space();
    			u0 = element("u");
    			u0.textContent = "C";
    			t22 = text("opy Link");
    			t23 = space();
    			button4 = element("button");
    			i5 = element("i");
    			i5.textContent = "share";
    			t25 = text(" Share");
    			t26 = space();
    			button5 = element("button");
    			i6 = element("i");
    			i6.textContent = "help";
    			t28 = text(" Deta");
    			u1 = element("u");
    			u1.textContent = "i";
    			t30 = text("ls");
    			t31 = space();
    			button6 = element("button");
    			i7 = element("i");
    			i7.textContent = "edit";
    			t33 = space();
    			u2 = element("u");
    			u2.textContent = "E";
    			t35 = text("dit");
    			t36 = space();
    			create_component(sharebar_1.$$.fragment);
    			t37 = space();
    			div9 = element("div");
    			if (if_block1) if_block1.c();
    			t38 = space();
    			iframe = element("iframe");
    			t39 = space();
    			create_component(modal.$$.fragment);
    			attr_dev(i0, "class", "icon");
    			add_location(i0, file$6, 105, 3, 2556);
    			attr_dev(button0, "class", "button_toggle_toolbar svelte-15t34ei");
    			toggle_class(button0, "button_highlight", /*toolbar_visible*/ ctx[2]);
    			add_location(button0, file$6, 104, 2, 2447);
    			attr_dev(i1, "class", "icon");
    			add_location(i1, file$6, 107, 58, 2651);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "id", "button_home");
    			attr_dev(a, "class", "button button_home svelte-15t34ei");
    			add_location(a, file$6, 107, 2, 2595);
    			attr_dev(div0, "class", "breadcrumb breadcrumb_last svelte-15t34ei");
    			add_location(div0, file$6, 112, 3, 2893);
    			attr_dev(div1, "class", "file_viewer_headerbar_title svelte-15t34ei");
    			add_location(div1, file$6, 108, 2, 2682);
    			attr_dev(div2, "class", "file_viewer_headerbar highlight_1 svelte-15t34ei");
    			add_location(div2, file$6, 103, 1, 2374);
    			attr_dev(div3, "class", "list_navigator svelte-15t34ei");
    			add_location(div3, file$6, 115, 1, 2981);
    			attr_dev(div4, "class", "toolbar_label svelte-15t34ei");
    			add_location(div4, file$6, 118, 3, 3109);
    			attr_dev(div5, "class", "toolbar_statistic svelte-15t34ei");
    			add_location(div5, file$6, 119, 3, 3150);
    			attr_dev(i2, "class", "icon");
    			add_location(i2, file$6, 122, 4, 3295);
    			attr_dev(button1, "class", "toolbar_button button_full_width svelte-15t34ei");
    			add_location(button1, file$6, 121, 3, 3241);
    			attr_dev(i3, "class", "icon");
    			add_location(i3, file$6, 125, 4, 3445);
    			attr_dev(button2, "id", "btn_download_list");
    			attr_dev(button2, "class", "toolbar_button button_full_width svelte-15t34ei");
    			set_style(button2, "display", "none");
    			add_location(button2, file$6, 124, 3, 3345);
    			attr_dev(i4, "class", "icon");
    			add_location(i4, file$6, 128, 4, 3567);
    			add_location(u0, file$6, 128, 37, 3600);
    			attr_dev(button3, "id", "btn_copy");
    			attr_dev(button3, "class", "toolbar_button button_full_width svelte-15t34ei");
    			add_location(button3, file$6, 127, 3, 3499);
    			attr_dev(i5, "class", "icon");
    			add_location(i5, file$6, 131, 4, 3756);
    			attr_dev(button4, "class", "toolbar_button button_full_width svelte-15t34ei");
    			toggle_class(button4, "button_highlight", /*sharebar_visible*/ ctx[10]);
    			add_location(button4, file$6, 130, 3, 3633);
    			attr_dev(i6, "class", "icon");
    			add_location(i6, file$6, 134, 4, 3925);
    			add_location(u1, file$6, 134, 33, 3954);
    			attr_dev(button5, "class", "toolbar_button button_full_width svelte-15t34ei");
    			toggle_class(button5, "button_highlight", /*details_visible*/ ctx[11]);
    			add_location(button5, file$6, 133, 3, 3804);
    			attr_dev(i7, "class", "icon");
    			add_location(i7, file$6, 137, 4, 4072);
    			add_location(u2, file$6, 137, 29, 4097);
    			attr_dev(button6, "id", "btn_edit");
    			attr_dev(button6, "class", "toolbar_button button_full_width svelte-15t34ei");
    			set_style(button6, "display", "none");
    			add_location(button6, file$6, 136, 3, 3981);
    			attr_dev(div6, "class", "svelte-15t34ei");
    			add_location(div6, file$6, 117, 50, 3100);
    			attr_dev(div7, "class", "svelte-15t34ei");
    			add_location(div7, file$6, 117, 45, 3095);
    			attr_dev(div8, "class", "toolbar svelte-15t34ei");
    			toggle_class(div8, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			add_location(div8, file$6, 117, 2, 3052);
    			attr_dev(div9, "class", "file_viewer_file_preview svelte-15t34ei");
    			toggle_class(div9, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			add_location(div9, file$6, 142, 2, 4191);
    			attr_dev(div10, "class", "file_viewer_window svelte-15t34ei");
    			add_location(div10, file$6, 116, 1, 3017);
    			attr_dev(iframe, "title", "Frame for downloading files");
    			set_style(iframe, "display", "none");
    			set_style(iframe, "width", "1px");
    			set_style(iframe, "height", "1px");
    			add_location(iframe, file$6, 154, 1, 4739);
    			attr_dev(div11, "class", "file_viewer svelte-15t34ei");
    			add_location(div11, file$6, 96, 0, 2176);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			if (if_block0) if_block0.m(div11, null);
    			append_dev(div11, t0);
    			append_dev(div11, div2);
    			append_dev(div2, button0);
    			append_dev(button0, i0);
    			append_dev(div2, t2);
    			append_dev(div2, a);
    			append_dev(a, i1);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, t6);
    			/*div2_binding*/ ctx[16](div2);
    			append_dev(div11, t7);
    			append_dev(div11, div3);
    			append_dev(div11, t8);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t10);
    			append_dev(div6, div5);
    			append_dev(div5, t11);
    			append_dev(div6, t12);
    			append_dev(div6, button1);
    			append_dev(button1, i2);
    			append_dev(button1, t14);
    			append_dev(div6, t15);
    			append_dev(div6, button2);
    			append_dev(button2, i3);
    			append_dev(button2, t17);
    			append_dev(div6, t18);
    			append_dev(div6, button3);
    			append_dev(button3, i4);
    			append_dev(button3, t20);
    			append_dev(button3, u0);
    			append_dev(button3, t22);
    			append_dev(div6, t23);
    			append_dev(div6, button4);
    			append_dev(button4, i5);
    			append_dev(button4, t25);
    			append_dev(div6, t26);
    			append_dev(div6, button5);
    			append_dev(button5, i6);
    			append_dev(button5, t28);
    			append_dev(button5, u1);
    			append_dev(button5, t30);
    			append_dev(div6, t31);
    			append_dev(div6, button6);
    			append_dev(button6, i7);
    			append_dev(button6, t33);
    			append_dev(button6, u2);
    			append_dev(button6, t35);
    			append_dev(div10, t36);
    			mount_component(sharebar_1, div10, null);
    			append_dev(div10, t37);
    			append_dev(div10, div9);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div9, null);
    			}

    			/*div9_binding*/ ctx[22](div9);
    			append_dev(div11, t38);
    			append_dev(div11, iframe);
    			append_dev(div11, t39);
    			mount_component(modal, div11, null);
    			/*div11_binding*/ ctx[24](div11);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$1, "keydown", /*keydown*/ ctx[14], false, false, false),
    					listen_dev(button0, "click", /*toolbar_toggle*/ ctx[9], false, false, false),
    					listen_dev(
    						button4,
    						"click",
    						function () {
    							if (is_function(/*sharebar*/ ctx[3].toggle)) /*sharebar*/ ctx[3].toggle.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button5,
    						"click",
    						function () {
    							if (is_function(/*details*/ ctx[4].toggle)) /*details*/ ctx[4].toggle.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (/*loading*/ ctx[7]) {
    				if (if_block0) {
    					if (dirty & /*loading*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div11, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*toolbar_visible*/ 4) {
    				toggle_class(button0, "button_highlight", /*toolbar_visible*/ ctx[2]);
    			}

    			if (dirty & /*navigate, currentNode*/ 8256) {
    				each_value = /*currentNode*/ ctx[6].parents;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*currentNode*/ 64) && t6_value !== (t6_value = /*currentNode*/ ctx[6].base.name + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*currentNode*/ 64) && t11_value !== (t11_value = formatDataVolume(/*currentNode*/ ctx[6].base.file_size, 3) + "")) set_data_dev(t11, t11_value);

    			if (dirty & /*sharebar_visible*/ 1024) {
    				toggle_class(button4, "button_highlight", /*sharebar_visible*/ ctx[10]);
    			}

    			if (dirty & /*details_visible*/ 2048) {
    				toggle_class(button5, "button_highlight", /*details_visible*/ ctx[11]);
    			}

    			if (dirty & /*toolbar_visible*/ 4) {
    				toggle_class(div8, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			}

    			const sharebar_1_changes = {};
    			sharebar_1.$set(sharebar_1_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div9, null);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (dirty & /*toolbar_visible*/ 4) {
    				toggle_class(div9, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			}

    			const modal_changes = {};

    			if (dirty & /*$$scope, currentNode*/ 536870976) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(sharebar_1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(sharebar_1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[16](null);
    			/*sharebar_1_binding*/ ctx[17](null);
    			destroy_component(sharebar_1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div9_binding*/ ctx[22](null);
    			/*modal_binding*/ ctx[23](null);
    			destroy_component(modal);
    			/*div11_binding*/ ctx[24](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Filesystem", slots, []);
    	let file_viewer;
    	let header_bar;
    	let toolbar_visible = window.innerWidth > 800;

    	let toolbar_toggle = () => {
    		$$invalidate(2, toolbar_visible = !toolbar_visible);

    		if (!toolbar_visible) {
    			sharebar.setVisible(false);
    		}
    	};

    	let sharebar;
    	let sharebar_visible = false;
    	let details;
    	let details_visible = false;
    	let preview;

    	// State
    	let currentNode = initialNode;

    	let path_base = "/d/" + currentNode.bucket.id;
    	let loading = true;
    	let viewer_type = "";

    	window.onpopstate = e => {
    		if (e.state) {
    			let locsplit = document.location.pathname.split(currentNode.bucket.id + "/", 2);
    			navigate(decodeURIComponent(locsplit[1]));
    		}
    	};

    	const navigate = (path, pushHist) => {
    		$$invalidate(7, loading = true);

    		fetch(window.apiEndpoint + "/filesystem/" + currentNode.bucket.id + "/" + encodeURIComponent(path) + "?stat").then(resp => resp.json()).then(resp => {
    			window.document.title = resp.base.name + " ~ pixeldrain";

    			if (pushHist) {
    				window.history.pushState({}, window.document.title, "/d/" + resp.bucket.id + resp.base.path);
    			}

    			$$invalidate(6, currentNode = resp);
    			openPath();
    		}).catch(err => {
    			$$invalidate(7, loading = false);
    			alert(err);
    		});
    	};

    	const openPath = () => {
    		console.log(currentNode.base.type);

    		if (currentNode.base.type === "bucket" || currentNode.base.type === "dir") {
    			$$invalidate(8, viewer_type = "dir");
    		} else if (currentNode.base.file_type.startsWith("image")) {
    			$$invalidate(8, viewer_type = "image");
    		} else if (currentNode.base.file_type.startsWith("audio") || currentNode.base.file_type === "application/ogg" || currentNode.base.name.endsWith(".mp3")) {
    			$$invalidate(8, viewer_type = "audio");
    		}

    		$$invalidate(7, loading = false);
    	};

    	const keydown = e => {
    		switch (e.key) {
    			case "Escape":
    				hide();
    				return;
    			case "i":
    				details_window.toggle();
    		}

    		console.log(e.key);
    	};

    	onMount(openPath);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Filesystem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = parent => {
    		navigate(parent.path, true);
    	};

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			header_bar = $$value;
    			$$invalidate(1, header_bar);
    		});
    	}

    	function sharebar_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sharebar = $$value;
    			$$invalidate(3, sharebar);
    		});
    	}

    	function directory_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			preview = $$value;
    			$$invalidate(5, preview);
    		});
    	}

    	const navigate_handler = e => {
    		navigate(e.detail, true);
    	};

    	function audio_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			preview = $$value;
    			$$invalidate(5, preview);
    		});
    	}

    	function image_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			preview = $$value;
    			$$invalidate(5, preview);
    		});
    	}

    	function div9_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			preview = $$value;
    			$$invalidate(5, preview);
    		});
    	}

    	function modal_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			details = $$value;
    			$$invalidate(4, details);
    		});
    	}

    	function div11_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			file_viewer = $$value;
    			$$invalidate(0, file_viewer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		formatDate,
    		formatDataVolume,
    		formatThousands,
    		Sharebar,
    		Spinner,
    		Modal,
    		Directory,
    		Audio,
    		Image,
    		file_viewer,
    		header_bar,
    		toolbar_visible,
    		toolbar_toggle,
    		sharebar,
    		sharebar_visible,
    		details,
    		details_visible,
    		preview,
    		currentNode,
    		path_base,
    		loading,
    		viewer_type,
    		navigate,
    		openPath,
    		keydown
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_viewer" in $$props) $$invalidate(0, file_viewer = $$props.file_viewer);
    		if ("header_bar" in $$props) $$invalidate(1, header_bar = $$props.header_bar);
    		if ("toolbar_visible" in $$props) $$invalidate(2, toolbar_visible = $$props.toolbar_visible);
    		if ("toolbar_toggle" in $$props) $$invalidate(9, toolbar_toggle = $$props.toolbar_toggle);
    		if ("sharebar" in $$props) $$invalidate(3, sharebar = $$props.sharebar);
    		if ("sharebar_visible" in $$props) $$invalidate(10, sharebar_visible = $$props.sharebar_visible);
    		if ("details" in $$props) $$invalidate(4, details = $$props.details);
    		if ("details_visible" in $$props) $$invalidate(11, details_visible = $$props.details_visible);
    		if ("preview" in $$props) $$invalidate(5, preview = $$props.preview);
    		if ("currentNode" in $$props) $$invalidate(6, currentNode = $$props.currentNode);
    		if ("path_base" in $$props) $$invalidate(12, path_base = $$props.path_base);
    		if ("loading" in $$props) $$invalidate(7, loading = $$props.loading);
    		if ("viewer_type" in $$props) $$invalidate(8, viewer_type = $$props.viewer_type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		file_viewer,
    		header_bar,
    		toolbar_visible,
    		sharebar,
    		details,
    		preview,
    		currentNode,
    		loading,
    		viewer_type,
    		toolbar_toggle,
    		sharebar_visible,
    		details_visible,
    		path_base,
    		navigate,
    		keydown,
    		click_handler,
    		div2_binding,
    		sharebar_1_binding,
    		directory_binding,
    		navigate_handler,
    		audio_binding,
    		image_binding,
    		div9_binding,
    		modal_binding,
    		div11_binding
    	];
    }

    class Filesystem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filesystem",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new Filesystem({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=filesystem.js.map
