
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
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

    const formatNumber = (amt, precision) => {
    	if (precision < 3) {
    		precision = 3;
    	}

    	if (amt >= 1000000) {
    		return (amt / 1000000).toPrecision(precision) + "M";
    	} else if (amt >= 1000) {
    		return (amt / 1000).toPrecision(precision) + "k";
    	}

    	return amt;
    };

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

    /* src/filesystem/FilesystemAPI.svelte generated by Svelte v3.29.6 */

    const fs_create_directory = (bucket, path, dir_name) => {
    	if (!path.startsWith("/")) {
    		path = "/" + path;
    	}

    	let form = new FormData();
    	form.append("type", "dir");

    	return fetch(window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path + "/" + dir_name), { method: "POST", body: form }).then(resp => {
    		if (resp.status >= 400) {
    			throw new Error(resp.text());
    		}
    	});
    };

    const fs_get_node = (bucket, path) => {
    	if (!path.startsWith("/")) {
    		path = "/" + path;
    	}

    	return fetch(window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path) + "?stat").then(resp => {
    		if (resp.status >= 400) {
    			throw new Error(resp.text());
    		}

    		return resp.json();
    	});
    };

    const fs_get_file_url = (bucket, path) => {
    	if (!path.startsWith("/")) {
    		path = "/" + path;
    	}

    	return window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path);
    };

    const fs_delete_node = (bucket, path) => {
    	if (!path.startsWith("/")) {
    		path = "/" + path;
    	}

    	return fetch(window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path), { method: "DELETE" }).then(resp => {
    		if (resp.status >= 400) {
    			throw new Error(resp.text());
    		}
    	});
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

    /* src/filesystem/filemanager/CreateDirectory.svelte generated by Svelte v3.29.6 */
    const file$3 = "src/filesystem/filemanager/CreateDirectory.svelte";

    function create_fragment$3(ctx) {
    	let form;
    	let td0;
    	let img;
    	let img_src_value;
    	let t0;
    	let td1;
    	let input0;
    	let t1;
    	let td2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			td0 = element("td");
    			img = element("img");
    			t0 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t1 = space();
    			td2 = element("td");
    			input1 = element("input");
    			if (img.src !== (img_src_value = "/res/img/mime/folder.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "node_icon");
    			attr_dev(img, "alt", "icon");
    			add_location(img, file$3, 29, 5, 674);
    			add_location(td0, file$3, 29, 1, 670);
    			attr_dev(input0, "type", "text");
    			set_style(input0, "width", "100%");
    			add_location(input0, file$3, 30, 5, 751);
    			add_location(td1, file$3, 30, 1, 747);
    			attr_dev(input1, "type", "submit");
    			input1.value = "create";
    			add_location(input1, file$3, 31, 5, 856);
    			add_location(td2, file$3, 31, 1, 852);
    			attr_dev(form, "class", "node");
    			add_location(form, file$3, 28, 0, 611);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, td0);
    			append_dev(td0, img);
    			append_dev(form, t0);
    			append_dev(form, td1);
    			append_dev(td1, input0);
    			/*input0_binding*/ ctx[4](input0);
    			set_input_value(input0, /*create_dir_name*/ ctx[1]);
    			append_dev(form, t1);
    			append_dev(form, td2);
    			append_dev(td2, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*create_dir*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*create_dir_name*/ 2 && input0.value !== /*create_dir_name*/ ctx[1]) {
    				set_input_value(input0, /*create_dir_name*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*input0_binding*/ ctx[4](null);
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
    	validate_slots("CreateDirectory", slots, []);
    	let dispatch = createEventDispatcher();
    	let { state } = $$props;
    	let name_input;
    	let create_dir_name = "";

    	let create_dir = () => {
    		dispatch("loading", true);
    		let form = new FormData();
    		form.append("type", "dir");

    		fs_create_directory(state.bucket.id, state.base.path, create_dir_name).then(resp => {
    			$$invalidate(1, create_dir_name = ""); // Clear input field
    		}).catch(err => {
    			alert("Error: " + err);
    		}).finally(() => {
    			dispatch("done");
    		});
    	};

    	onMount(() => {
    		name_input.focus();
    	});

    	const writable_props = ["state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CreateDirectory> was created with unknown prop '${key}'`);
    	});

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			name_input = $$value;
    			$$invalidate(0, name_input);
    		});
    	}

    	function input0_input_handler() {
    		create_dir_name = this.value;
    		$$invalidate(1, create_dir_name);
    	}

    	$$self.$$set = $$props => {
    		if ("state" in $$props) $$invalidate(3, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		fs_create_directory,
    		dispatch,
    		state,
    		name_input,
    		create_dir_name,
    		create_dir
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("state" in $$props) $$invalidate(3, state = $$props.state);
    		if ("name_input" in $$props) $$invalidate(0, name_input = $$props.name_input);
    		if ("create_dir_name" in $$props) $$invalidate(1, create_dir_name = $$props.create_dir_name);
    		if ("create_dir" in $$props) $$invalidate(2, create_dir = $$props.create_dir);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name_input,
    		create_dir_name,
    		create_dir,
    		state,
    		input0_binding,
    		input0_input_handler
    	];
    }

    class CreateDirectory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { state: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateDirectory",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[3] === undefined && !("state" in props)) {
    			console.warn("<CreateDirectory> was created without expected prop 'state'");
    		}
    	}

    	get state() {
    		throw new Error("<CreateDirectory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<CreateDirectory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/filemanager/FileUploader.svelte generated by Svelte v3.29.6 */

    const { console: console_1 } = globals;
    const file$4 = "src/filesystem/filemanager/FileUploader.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (172:1) {#each upload_jobs as c}
    function create_each_block(ctx) {
    	let div2;
    	let t0;
    	let t1_value = /*c*/ ctx[18].file.name + "";
    	let t1;
    	let t2;
    	let br;
    	let t3;
    	let div1;
    	let div0;
    	let t4;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			t0 = text(" ");
    			t1 = text(t1_value);
    			t2 = text(" ");
    			br = element("br");
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t4 = space();
    			add_location(br, file$4, 173, 28, 3977);
    			attr_dev(div0, "class", "upload_progress svelte-2zhofy");
    			set_style(div0, "width", /*c*/ ctx[18].progress * 100 + "%");
    			add_location(div0, file$4, 175, 4, 4024);
    			attr_dev(div1, "class", "upload_progress_bar svelte-2zhofy");
    			add_location(div1, file$4, 174, 3, 3986);
    			attr_dev(div2, "class", "file_upload svelte-2zhofy");
    			add_location(div2, file$4, 172, 2, 3923);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t0);
    			append_dev(div2, t1);
    			append_dev(div2, t2);
    			append_dev(div2, br);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*upload_jobs*/ 1 && t1_value !== (t1_value = /*c*/ ctx[18].file.name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*upload_jobs*/ 1) {
    				set_style(div0, "width", /*c*/ ctx[18].progress * 100 + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(172:1) {#each upload_jobs as c}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let div1;
    	let input;
    	let t1;
    	let div0;
    	let t3;
    	let mounted;
    	let dispose;
    	let each_value = /*upload_jobs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = space();
    			div1 = element("div");
    			input = element("input");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Drop files here to upload them";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "class", "file_input svelte-2zhofy");
    			attr_dev(input, "type", "file");
    			input.multiple = "multiple";
    			add_location(input, file$4, 166, 1, 3696);
    			attr_dev(div0, "class", "highlight_green svelte-2zhofy");
    			toggle_class(div0, "hidden", /*hidden*/ ctx[2]);
    			add_location(div0, file$4, 167, 1, 3810);
    			add_location(div1, file$4, 165, 0, 3689);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[12](input);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "dragover", stop_propagation(prevent_default(/*dragover*/ ctx[4])), false, true, true),
    					listen_dev(document.body, "dragleave", stop_propagation(prevent_default(/*dragleave*/ ctx[5])), false, true, true),
    					listen_dev(document.body, "drop", stop_propagation(prevent_default(/*drop*/ ctx[6])), false, true, true),
    					listen_dev(document.body, "paste", /*paste*/ ctx[7], false, false, false),
    					listen_dev(input, "change", /*file_input_change*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hidden*/ 4) {
    				toggle_class(div0, "hidden", /*hidden*/ ctx[2]);
    			}

    			if (dirty & /*upload_jobs*/ 1) {
    				each_value = /*upload_jobs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			/*input_binding*/ ctx[12](null);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("FileUploader", slots, []);
    	let dispatch = createEventDispatcher();
    	let { bucket_id } = $$props;
    	let { target_dir } = $$props;
    	let upload_jobs = [];
    	let upload_threads = 0;
    	let max_upload_threads = 4;

    	const upload = file_list => {
    		for (let i = 0; i < file_list.length; i++) {
    			upload_jobs.push({
    				file: file_list[i],
    				progress: 0,
    				target_dir: target_dir.valueOf(),
    				uploading: false,
    				finished: false,
    				tries: 0
    			});
    		}

    		// This updates the UI
    		$$invalidate(0, upload_jobs);

    		while (upload_threads <= max_upload_threads) {
    			upload_threads++;
    			setTimeout(upload_file, 1);
    		}
    	};

    	const uploads_finished = () => {
    		dispatch("finished");
    	};

    	const upload_file = () => {
    		let job = null;

    		for (let i = 0; i < upload_jobs.length; i++) {
    			// If a file is done we remove it from the array
    			if (upload_jobs[i].progress >= 1) {
    				upload_jobs.splice(i, 1);
    				continue;
    			}

    			if (upload_jobs[i].uploading === false && upload_jobs[i].finished === false) {
    				job = upload_jobs[i];
    				job.uploading = true;
    				$$invalidate(0, upload_jobs);
    				break;
    			}
    		}

    		if (job === null) {
    			upload_threads--;

    			if (upload_threads === 0) {
    				uploads_finished();
    			}

    			return;
    		}

    		console.log(job);
    		let form = new FormData();
    		form.append("type", "file");
    		form.append("file", job.file);
    		let xhr = new XMLHttpRequest();
    		xhr.open("POST", "/api/filesystem/" + bucket_id + encodeURIComponent(job.target_dir + "/" + job.file.name), true);
    		xhr.timeout = 21600000; // 6 hours, to account for slow connections

    		// Report progress updates back to the caller
    		xhr.upload.addEventListener("progress", evt => {
    			if (evt.lengthComputable) {
    				job.progress = evt.loaded / evt.total;
    				$$invalidate(0, upload_jobs);
    			}
    		});

    		xhr.onreadystatechange = () => {
    			// readystate 4 means the upload is done
    			if (xhr.readyState !== 4) {
    				return;
    			}

    			if (xhr.status >= 100 && xhr.status < 400) {
    				// Request is a success
    				// Finish the upload job
    				job.uploading = false;

    				job.finished = true;
    				upload_file();
    			} else if (xhr.status >= 400) {
    				// Request failed
    				console.log("Upload error. status: " + xhr.status + " response: " + xhr.response);

    				let resp = JSON.parse(xhr.response);

    				if (job.tries === 3) {
    					// Upload failed
    					return;
    				} else {
    					// Try again
    					job.tries++;

    					job.uploading = false;
    					job.finished = false;
    				}

    				// Sleep the upload thread for 5 seconds
    				setTimeout(upload_file, 5000);
    			} else {
    				// Request did not arrive
    				if (job.tries === 3) {
    					// Upload failed
    					alert("upload failed " + xhr.responseText);

    					job.uploading = false;
    					job.finished = false;
    				} else {
    					// Try again
    					job.tries++;
    				}

    				// Sleep the upload thread for 5 seconds
    				setTimeout(upload_file, 5000);
    			}

    			$$invalidate(0, upload_jobs);
    		};

    		xhr.send(form);
    	};

    	// File input dialog handling
    	let file_input;

    	const picker = () => {
    		file_input.click();
    	};

    	const file_input_change = e => {
    		upload(e.target.files);
    		$$invalidate(1, file_input.nodeValue = "", file_input);
    	};

    	// Drag and drop upload
    	let hidden = true;

    	const dragover = e => {
    		$$invalidate(2, hidden = false);
    	};

    	const dragleave = e => {
    		$$invalidate(2, hidden = true);
    	};

    	const drop = e => {
    		$$invalidate(2, hidden = true);
    		upload(e.dataTransfer.files);
    	};

    	const paste = e => {
    		if (e.clipboardData.files[0]) {
    			e.preventDefault();
    			e.stopPropagation();
    			console.log(e.clipboardData.files[0].getAsFile());
    		}
    	};

    	const writable_props = ["bucket_id", "target_dir"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<FileUploader> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			file_input = $$value;
    			$$invalidate(1, file_input);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("bucket_id" in $$props) $$invalidate(8, bucket_id = $$props.bucket_id);
    		if ("target_dir" in $$props) $$invalidate(9, target_dir = $$props.target_dir);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		bucket_id,
    		target_dir,
    		upload_jobs,
    		upload_threads,
    		max_upload_threads,
    		upload,
    		uploads_finished,
    		upload_file,
    		file_input,
    		picker,
    		file_input_change,
    		hidden,
    		dragover,
    		dragleave,
    		drop,
    		paste
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("bucket_id" in $$props) $$invalidate(8, bucket_id = $$props.bucket_id);
    		if ("target_dir" in $$props) $$invalidate(9, target_dir = $$props.target_dir);
    		if ("upload_jobs" in $$props) $$invalidate(0, upload_jobs = $$props.upload_jobs);
    		if ("upload_threads" in $$props) upload_threads = $$props.upload_threads;
    		if ("max_upload_threads" in $$props) max_upload_threads = $$props.max_upload_threads;
    		if ("file_input" in $$props) $$invalidate(1, file_input = $$props.file_input);
    		if ("hidden" in $$props) $$invalidate(2, hidden = $$props.hidden);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		upload_jobs,
    		file_input,
    		hidden,
    		file_input_change,
    		dragover,
    		dragleave,
    		drop,
    		paste,
    		bucket_id,
    		target_dir,
    		upload,
    		picker,
    		input_binding
    	];
    }

    class FileUploader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			bucket_id: 8,
    			target_dir: 9,
    			upload: 10,
    			picker: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileUploader",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*bucket_id*/ ctx[8] === undefined && !("bucket_id" in props)) {
    			console_1.warn("<FileUploader> was created without expected prop 'bucket_id'");
    		}

    		if (/*target_dir*/ ctx[9] === undefined && !("target_dir" in props)) {
    			console_1.warn("<FileUploader> was created without expected prop 'target_dir'");
    		}
    	}

    	get bucket_id() {
    		throw new Error("<FileUploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bucket_id(value) {
    		throw new Error("<FileUploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get target_dir() {
    		throw new Error("<FileUploader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target_dir(value) {
    		throw new Error("<FileUploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get upload() {
    		return this.$$.ctx[10];
    	}

    	set upload(value) {
    		throw new Error("<FileUploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get picker() {
    		return this.$$.ctx[11];
    	}

    	set picker(value) {
    		throw new Error("<FileUploader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/filemanager/FileManager.svelte generated by Svelte v3.29.6 */

    const { console: console_1$1 } = globals;
    const file$5 = "src/filesystem/filemanager/FileManager.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (114:3) {#if state.bucket.permissions.update}
    function create_if_block_2(ctx) {
    	let button0;
    	let i0;
    	let t1;
    	let button1;
    	let i1;
    	let t3;
    	let button2;
    	let i2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			i0 = element("i");
    			i0.textContent = "cloud_upload";
    			t1 = space();
    			button1 = element("button");
    			i1 = element("i");
    			i1.textContent = "create_new_folder";
    			t3 = space();
    			button2 = element("button");
    			i2 = element("i");
    			i2.textContent = "delete";
    			attr_dev(i0, "class", "icon");
    			add_location(i0, file$5, 114, 39, 3192);
    			attr_dev(button0, "class", "svelte-1bqdpyt");
    			add_location(button0, file$5, 114, 4, 3157);
    			attr_dev(i1, "class", "icon");
    			add_location(i1, file$5, 115, 51, 3285);
    			attr_dev(button1, "class", "svelte-1bqdpyt");
    			add_location(button1, file$5, 115, 4, 3238);
    			attr_dev(i2, "class", "icon");
    			add_location(i2, file$5, 120, 5, 3425);
    			attr_dev(button2, "class", "svelte-1bqdpyt");
    			toggle_class(button2, "button_red", /*mode*/ ctx[1] === "deleting");
    			add_location(button2, file$5, 117, 4, 3337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			append_dev(button0, i0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, i1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button2, anchor);
    			append_dev(button2, i2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*uploader*/ ctx[3].picker)) /*uploader*/ ctx[3].picker.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button1, "click", /*click_handler*/ ctx[10], false, false, false),
    					listen_dev(button2, "click", /*delete_toggle*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*mode*/ 2) {
    				toggle_class(button2, "button_red", /*mode*/ ctx[1] === "deleting");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(114:3) {#if state.bucket.permissions.update}",
    		ctx
    	});

    	return block;
    }

    // (127:2) {#if mode === "deleting"}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let button0;
    	let i0;
    	let t3;
    	let t4;
    	let button1;
    	let i1;
    	let t6;
    	let t7;
    	let br;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Deleting files. Click a file or directory to select it for deletion.\n\t\t\t\t\tClick confirm to delete the files.";
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			i0.textContent = "undo";
    			t3 = text("\n\t\t\t\t\t\tCancel");
    			t4 = space();
    			button1 = element("button");
    			i1 = element("i");
    			i1.textContent = "delete";
    			t6 = text("\n\t\t\t\t\t\tDelete selected");
    			t7 = space();
    			br = element("br");
    			set_style(div0, "flex", "1 1 auto");
    			set_style(div0, "justify-self", "center");
    			attr_dev(div0, "class", "svelte-1bqdpyt");
    			add_location(div0, file$5, 128, 4, 3579);
    			attr_dev(i0, "class", "icon");
    			add_location(i0, file$5, 134, 6, 3880);
    			add_location(button0, file$5, 133, 5, 3840);
    			attr_dev(i1, "class", "icon");
    			add_location(i1, file$5, 138, 6, 3995);
    			attr_dev(button1, "class", "button_red");
    			add_location(button1, file$5, 137, 5, 3938);
    			set_style(div1, "display", "flex");
    			set_style(div1, "flex-direction", "row");
    			set_style(div1, "justify-content", "center");
    			attr_dev(div1, "class", "svelte-1bqdpyt");
    			add_location(div1, file$5, 132, 4, 3760);
    			attr_dev(div2, "class", "toolbar toolbar_delete highlight_red svelte-1bqdpyt");
    			add_location(div2, file$5, 127, 3, 3524);
    			add_location(br, file$5, 143, 3, 4083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(button0, i0);
    			append_dev(button0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*delete_toggle*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*delete_node*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(127:2) {#if mode === \\\"deleting\\\"}",
    		ctx
    	});

    	return block;
    }

    // (156:3) {#if creating_dir}
    function create_if_block$1(ctx) {
    	let createdirectory;
    	let current;

    	createdirectory = new CreateDirectory({
    			props: { state: /*state*/ ctx[0] },
    			$$inline: true
    		});

    	createdirectory.$on("done", /*done_handler*/ ctx[12]);
    	createdirectory.$on("loading", /*loading_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(createdirectory.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(createdirectory, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const createdirectory_changes = {};
    			if (dirty & /*state*/ 1) createdirectory_changes.state = /*state*/ ctx[0];
    			createdirectory.$set(createdirectory_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(createdirectory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(createdirectory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(createdirectory, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(156:3) {#if creating_dir}",
    		ctx
    	});

    	return block;
    }

    // (160:3) {#each state.base.children as child, index}
    function create_each_block$1(ctx) {
    	let a;
    	let td0;
    	let img;
    	let img_src_value;
    	let t0;
    	let td1;
    	let t1_value = /*child*/ ctx[16].name + "";
    	let t1;
    	let t2;
    	let td2;
    	let t3_value = formatDataVolume(/*child*/ ctx[16].file_size, 3) + "";
    	let t3;
    	let t4;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[14](/*index*/ ctx[18]);
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
    			if (img.src !== (img_src_value = /*node_icon*/ ctx[7](/*child*/ ctx[16]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "node_icon");
    			attr_dev(img, "alt", "icon");
    			add_location(img, file$5, 167, 6, 4742);
    			attr_dev(td0, "class", "svelte-1bqdpyt");
    			add_location(td0, file$5, 166, 5, 4731);
    			attr_dev(td1, "class", "node_name svelte-1bqdpyt");
    			add_location(td1, file$5, 169, 5, 4817);
    			attr_dev(td2, "class", "node_size svelte-1bqdpyt");
    			add_location(td2, file$5, 172, 5, 4875);
    			attr_dev(a, "href", a_href_value = /*state*/ ctx[0].path_root + /*child*/ ctx[16].path);
    			attr_dev(a, "class", "node svelte-1bqdpyt");
    			toggle_class(a, "node_selected", /*child*/ ctx[16].fm_selected);
    			toggle_class(a, "node_delete", /*child*/ ctx[16].fm_delete);
    			add_location(a, file$5, 160, 4, 4522);
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
    				dispose = listen_dev(a, "click", prevent_default(click_handler_1), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*state*/ 1 && img.src !== (img_src_value = /*node_icon*/ ctx[7](/*child*/ ctx[16]))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*state*/ 1 && t1_value !== (t1_value = /*child*/ ctx[16].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*state*/ 1 && t3_value !== (t3_value = formatDataVolume(/*child*/ ctx[16].file_size, 3) + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*state*/ 1 && a_href_value !== (a_href_value = /*state*/ ctx[0].path_root + /*child*/ ctx[16].path)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*state*/ 1) {
    				toggle_class(a, "node_selected", /*child*/ ctx[16].fm_selected);
    			}

    			if (dirty & /*state*/ 1) {
    				toggle_class(a, "node_delete", /*child*/ ctx[16].fm_delete);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(160:3) {#each state.base.children as child, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let div3;
    	let div1;
    	let button;
    	let i;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let br;
    	let t4;
    	let t5;
    	let fileuploader;
    	let t6;
    	let div2;
    	let tr;
    	let td0;
    	let t7;
    	let td1;
    	let t9;
    	let td2;
    	let t11;
    	let t12;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*state*/ ctx[0].bucket.permissions.update && create_if_block_2(ctx);
    	let if_block1 = /*mode*/ ctx[1] === "deleting" && create_if_block_1(ctx);

    	let fileuploader_props = {
    		bucket_id: /*state*/ ctx[0].bucket.id,
    		target_dir: /*state*/ ctx[0].base.path
    	};

    	fileuploader = new FileUploader({
    			props: fileuploader_props,
    			$$inline: true
    		});

    	/*fileuploader_binding*/ ctx[11](fileuploader);
    	fileuploader.$on("finished", /*reload*/ ctx[6]);
    	let if_block2 = /*creating_dir*/ ctx[2] && create_if_block$1(ctx);
    	let each_value = /*state*/ ctx[0].base.children;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			button = element("button");
    			i = element("i");
    			i.textContent = "arrow_back";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			create_component(fileuploader.$$.fragment);
    			t6 = space();
    			div2 = element("div");
    			tr = element("tr");
    			td0 = element("td");
    			t7 = space();
    			td1 = element("td");
    			td1.textContent = "name";
    			t9 = space();
    			td2 = element("td");
    			td2.textContent = "size";
    			t11 = space();
    			if (if_block2) if_block2.c();
    			t12 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i, "class", "icon");
    			add_location(i, file$5, 111, 76, 3034);
    			attr_dev(button, "class", "svelte-1bqdpyt");
    			toggle_class(button, "hidden", /*state*/ ctx[0].parents.length === 0);
    			add_location(button, file$5, 111, 3, 2961);
    			attr_dev(div0, "class", "toolbar_spacer svelte-1bqdpyt");
    			add_location(div0, file$5, 112, 3, 3077);
    			attr_dev(div1, "class", "toolbar svelte-1bqdpyt");
    			add_location(div1, file$5, 110, 2, 2936);
    			add_location(br, file$5, 124, 2, 3486);
    			attr_dev(td0, "class", "svelte-1bqdpyt");
    			add_location(td0, file$5, 150, 4, 4268);
    			attr_dev(td1, "class", "svelte-1bqdpyt");
    			add_location(td1, file$5, 151, 4, 4282);
    			attr_dev(td2, "class", "svelte-1bqdpyt");
    			add_location(td2, file$5, 152, 4, 4300);
    			attr_dev(tr, "class", "svelte-1bqdpyt");
    			add_location(tr, file$5, 149, 3, 4259);
    			attr_dev(div2, "class", "directory svelte-1bqdpyt");
    			add_location(div2, file$5, 148, 2, 4232);
    			attr_dev(div3, "class", "width_container svelte-1bqdpyt");
    			add_location(div3, file$5, 109, 1, 2904);
    			attr_dev(div4, "class", "container svelte-1bqdpyt");
    			add_location(div4, file$5, 108, 0, 2879);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, button);
    			append_dev(button, i);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div3, t3);
    			append_dev(div3, br);
    			append_dev(div3, t4);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t5);
    			mount_component(fileuploader, div3, null);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, tr);
    			append_dev(tr, td0);
    			append_dev(tr, t7);
    			append_dev(tr, td1);
    			append_dev(tr, t9);
    			append_dev(tr, td2);
    			append_dev(div2, t11);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t12);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*navigate_up*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state*/ 1) {
    				toggle_class(button, "hidden", /*state*/ ctx[0].parents.length === 0);
    			}

    			if (/*state*/ ctx[0].bucket.permissions.update) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*mode*/ ctx[1] === "deleting") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div3, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			const fileuploader_changes = {};
    			if (dirty & /*state*/ 1) fileuploader_changes.bucket_id = /*state*/ ctx[0].bucket.id;
    			if (dirty & /*state*/ 1) fileuploader_changes.target_dir = /*state*/ ctx[0].base.path;
    			fileuploader.$set(fileuploader_changes);

    			if (/*creating_dir*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*creating_dir*/ 4) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, t12);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*state, node_click, formatDataVolume, node_icon*/ 145) {
    				each_value = /*state*/ ctx[0].base.children;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fileuploader.$$.fragment, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileuploader.$$.fragment, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*fileuploader_binding*/ ctx[11](null);
    			destroy_component(fileuploader);
    			if (if_block2) if_block2.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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
    	validate_slots("FileManager", slots, []);
    	let dispatch = createEventDispatcher();
    	let { state } = $$props;
    	let mode = "viewing";
    	let creating_dir = false;
    	let uploader;

    	const node_click = index => {
    		$$invalidate(2, creating_dir = false);

    		// We prefix our custom state properties with fm_ to not interfere with
    		// other modules
    		if (mode === "viewing") {
    			dispatch("navigate", state.base.children[index].path);
    		} else if (mode === "selecting") {
    			$$invalidate(0, state.base.children[index].fm_selected = !state.base.children[index].fm_selected, state);
    		} else if (mode === "deleting") {
    			$$invalidate(0, state.base.children[index].fm_delete = !state.base.children[index].fm_delete, state);
    		}
    	};

    	const navigate_up = () => {
    		$$invalidate(2, creating_dir = false);

    		// Go to the path of the last parent
    		if (state.parents.length !== 0) {
    			dispatch("navigate", state.parents[state.parents.length - 1].path);
    		}
    	};

    	const reload = () => {
    		dispatch("navigate", state.base.path);
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
    			case "application/ogg":
    				return "/res/img/mime/audio.png";
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

    	const delete_node = () => {
    		if (mode !== "deleting") {
    			$$invalidate(1, mode = "deleting");
    			return;
    		}

    		dispatch("loading", true);

    		// Save all promises with deletion requests in an array
    		let promises = [];

    		state.base.children.forEach(child => {
    			if (!child.fm_delete) {
    				return;
    			}

    			promises.push(fs_delete_node(state.bucket.id, child.path));
    		});

    		// Wait for all the promises to finish
    		Promise.all(promises).catch(err => {
    			console.error(err);
    		}).finally(() => {
    			$$invalidate(1, mode = "viewing");
    			reload();
    		});
    	};

    	const delete_toggle = () => {
    		// Turn on deletion mode if it's not already
    		if (mode !== "deleting") {
    			$$invalidate(1, mode = "deleting");
    			return;
    		}

    		// Return to normal and unmark all the marked files
    		$$invalidate(1, mode = "viewing");

    		state.base.children.forEach((child, i) => {
    			if (child.fm_delete) {
    				$$invalidate(0, state.base.children[i].fm_delete = false, state);
    			}
    		});
    	};

    	const writable_props = ["state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<FileManager> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(2, creating_dir = true);
    	};

    	function fileuploader_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			uploader = $$value;
    			$$invalidate(3, uploader);
    		});
    	}

    	const done_handler = () => {
    		reload();
    		$$invalidate(2, creating_dir = false);
    	};

    	function loading_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler_1 = index => {
    		node_click(index);
    	};

    	$$self.$$set = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		formatDataVolume,
    		fs_delete_node,
    		createEventDispatcher,
    		CreateDirectory,
    		FileUploader,
    		dispatch,
    		state,
    		mode,
    		creating_dir,
    		uploader,
    		node_click,
    		navigate_up,
    		reload,
    		node_icon,
    		delete_node,
    		delete_toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) dispatch = $$props.dispatch;
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("mode" in $$props) $$invalidate(1, mode = $$props.mode);
    		if ("creating_dir" in $$props) $$invalidate(2, creating_dir = $$props.creating_dir);
    		if ("uploader" in $$props) $$invalidate(3, uploader = $$props.uploader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		state,
    		mode,
    		creating_dir,
    		uploader,
    		node_click,
    		navigate_up,
    		reload,
    		node_icon,
    		delete_node,
    		delete_toggle,
    		click_handler,
    		fileuploader_binding,
    		done_handler,
    		loading_handler,
    		click_handler_1
    	];
    }

    class FileManager extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { state: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileManager",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[0] === undefined && !("state" in props)) {
    			console_1$1.warn("<FileManager> was created without expected prop 'state'");
    		}
    	}

    	get state() {
    		throw new Error("<FileManager>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<FileManager>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/viewers/Audio.svelte generated by Svelte v3.29.6 */
    const file$6 = "src/filesystem/viewers/Audio.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let t0_value = /*state*/ ctx[0].base.name + "";
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
    			add_location(br0, file$6, 10, 1, 228);
    			add_location(br1, file$6, 10, 6, 233);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$6, 17, 2, 409);
    			attr_dev(audio, "class", "player svelte-11r8rw7");
    			if (audio.src !== (audio_src_value = fs_get_file_url(/*state*/ ctx[0].bucket.id, /*state*/ ctx[0].base.path))) attr_dev(audio, "src", audio_src_value);
    			audio.autoplay = "autoplay";
    			audio.controls = "controls";
    			add_location(audio, file$6, 11, 1, 240);
    			attr_dev(div, "class", "container svelte-11r8rw7");
    			add_location(div, file$6, 8, 0, 184);
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
    				dispose = listen_dev(audio, "ended", /*ended_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state*/ 1 && t0_value !== (t0_value = /*state*/ ctx[0].base.name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*state*/ 1 && audio.src !== (audio_src_value = fs_get_file_url(/*state*/ ctx[0].bucket.id, /*state*/ ctx[0].base.path))) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Audio", slots, []);
    	let dispatch = createEventDispatcher();
    	let { state } = $$props;
    	const writable_props = ["state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Audio> was created with unknown prop '${key}'`);
    	});

    	const ended_handler = () => {
    		dispatch("next");
    	};

    	$$self.$$set = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		fs_get_file_url,
    		createEventDispatcher,
    		dispatch,
    		state
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) $$invalidate(1, dispatch = $$props.dispatch);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, dispatch, ended_handler];
    }

    class Audio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { state: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Audio",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[0] === undefined && !("state" in props)) {
    			console.warn("<Audio> was created without expected prop 'state'");
    		}
    	}

    	get state() {
    		throw new Error("<Audio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Audio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/viewers/Image.svelte generated by Svelte v3.29.6 */
    const file$7 = "src/filesystem/viewers/Image.svelte";

    function create_fragment$7(ctx) {
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
    			if (img.src !== (img_src_value = fs_get_file_url(/*state*/ ctx[0].bucket.id, /*state*/ ctx[0].base.path))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "no description available");
    			toggle_class(img, "zoom", /*zoom*/ ctx[2]);
    			add_location(img, file$7, 48, 1, 853);
    			attr_dev(div, "class", "container svelte-xjzx7h");
    			toggle_class(div, "zoom", /*zoom*/ ctx[2]);
    			add_location(div, file$7, 47, 0, 795);
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
    					listen_dev(window, "mousemove", /*mousemove*/ ctx[4], false, false, false),
    					listen_dev(window, "mouseup", /*mouseup*/ ctx[5], false, false, false),
    					listen_dev(img, "dblclick", /*dblclick_handler*/ ctx[6], false, false, false),
    					listen_dev(img, "doubletap", /*doubletap_handler*/ ctx[7], false, false, false),
    					listen_dev(img, "mousedown", /*mousedown*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state*/ 1 && img.src !== (img_src_value = fs_get_file_url(/*state*/ ctx[0].bucket.id, /*state*/ ctx[0].base.path))) {
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Image", slots, []);
    	let { state } = $$props;
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

    	const writable_props = ["state"];

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
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		fs_get_file_url,
    		state,
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
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
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
    		state,
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { state: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[0] === undefined && !("state" in props)) {
    			console.warn("<Image> was created without expected prop 'state'");
    		}
    	}

    	get state() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/viewers/Video.svelte generated by Svelte v3.29.6 */
    const file$8 = "src/filesystem/viewers/Video.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let video;
    	let track;
    	let video_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			video = element("video");
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$8, 15, 2, 378);
    			attr_dev(video, "class", "player svelte-1iaovvu");
    			if (video.src !== (video_src_value = fs_get_file_url(/*state*/ ctx[0].bucket.id, /*state*/ ctx[0].base.path))) attr_dev(video, "src", video_src_value);
    			video.autoplay = "autoplay";
    			video.controls = "controls";
    			add_location(video, file$8, 9, 1, 209);
    			attr_dev(div, "class", "container svelte-1iaovvu");
    			add_location(div, file$8, 8, 0, 184);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, video);
    			append_dev(video, track);

    			if (!mounted) {
    				dispose = listen_dev(video, "ended", /*ended_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state*/ 1 && video.src !== (video_src_value = fs_get_file_url(/*state*/ ctx[0].bucket.id, /*state*/ ctx[0].base.path))) {
    				attr_dev(video, "src", video_src_value);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Video", slots, []);
    	let dispatch = createEventDispatcher();
    	let { state } = $$props;
    	const writable_props = ["state"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	const ended_handler = () => {
    		dispatch("next");
    	};

    	$$self.$$set = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		fs_get_file_url,
    		createEventDispatcher,
    		dispatch,
    		state
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatch" in $$props) $$invalidate(1, dispatch = $$props.dispatch);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [state, dispatch, ended_handler];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { state: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[0] === undefined && !("state" in props)) {
    			console.warn("<Video> was created without expected prop 'state'");
    		}
    	}

    	get state() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/filesystem/Filesystem.svelte generated by Svelte v3.29.6 */

    const { console: console_1$2, window: window_1 } = globals;
    const file$9 = "src/filesystem/Filesystem.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (148:1) {#if state.loading}
    function create_if_block_8(ctx) {
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
    			add_location(div, file$9, 148, 1, 3482);
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
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(148:1) {#if state.loading}",
    		ctx
    	});

    	return block;
    }

    // (160:3) {#each state.parents as parent}
    function create_each_block$2(ctx) {
    	let div;
    	let t0_value = /*parent*/ ctx[25].name + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[16](/*parent*/ ctx[25]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" /");
    			attr_dev(div, "class", "breadcrumb breadcrumb_button svelte-in5te4");
    			add_location(div, file$9, 160, 3, 4002);
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
    			if (dirty & /*state*/ 64 && t0_value !== (t0_value = /*parent*/ ctx[25].name + "")) set_data_dev(t0, t0_value);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(160:3) {#each state.parents as parent}",
    		ctx
    	});

    	return block;
    }

    // (172:71) 
    function create_if_block_7(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let t2_value = formatThousands(/*total_directories*/ ctx[7]) + "";
    	let t2;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t6_value = formatThousands(/*total_files*/ ctx[8]) + "";
    	let t6;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t10_value = formatDataVolume(/*total_file_size*/ ctx[9], 3) + "";
    	let t10;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Directories";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Files";
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "Total size";
    			t9 = space();
    			div5 = element("div");
    			t10 = text(t10_value);
    			attr_dev(div0, "class", "toolbar_label svelte-in5te4");
    			add_location(div0, file$9, 172, 3, 4570);
    			attr_dev(div1, "class", "toolbar_statistic svelte-in5te4");
    			add_location(div1, file$9, 173, 3, 4618);
    			attr_dev(div2, "class", "toolbar_label svelte-in5te4");
    			add_location(div2, file$9, 174, 3, 4698);
    			attr_dev(div3, "class", "toolbar_statistic svelte-in5te4");
    			add_location(div3, file$9, 175, 3, 4740);
    			attr_dev(div4, "class", "toolbar_label svelte-in5te4");
    			add_location(div4, file$9, 176, 3, 4814);
    			attr_dev(div5, "class", "toolbar_statistic svelte-in5te4");
    			add_location(div5, file$9, 177, 3, 4861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*total_directories*/ 128 && t2_value !== (t2_value = formatThousands(/*total_directories*/ ctx[7]) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*total_files*/ 256 && t6_value !== (t6_value = formatThousands(/*total_files*/ ctx[8]) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*total_file_size*/ 512 && t10_value !== (t10_value = formatDataVolume(/*total_file_size*/ ctx[9], 3) + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(172:71) ",
    		ctx
    	});

    	return block;
    }

    // (169:3) {#if state.base.type === "file"}
    function create_if_block_6(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let t2_value = formatDataVolume(/*state*/ ctx[6].base.file_size, 3) + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Size";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			attr_dev(div0, "class", "toolbar_label svelte-in5te4");
    			add_location(div0, file$9, 169, 3, 4373);
    			attr_dev(div1, "class", "toolbar_statistic svelte-in5te4");
    			add_location(div1, file$9, 170, 3, 4414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*state*/ 64 && t2_value !== (t2_value = formatDataVolume(/*state*/ ctx[6].base.file_size, 3) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(169:3) {#if state.base.type === \\\"file\\\"}",
    		ctx
    	});

    	return block;
    }

    // (181:3) {#if state.base.type === "file"}
    function create_if_block_5(ctx) {
    	let button;
    	let i;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			i.textContent = "save";
    			t1 = text(" Download");
    			attr_dev(i, "class", "icon");
    			add_location(i, file$9, 182, 4, 5060);
    			attr_dev(button, "class", "toolbar_button button_full_width svelte-in5te4");
    			add_location(button, file$9, 181, 3, 4986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*download*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(181:3) {#if state.base.type === \\\"file\\\"}",
    		ctx
    	});

    	return block;
    }

    // (211:43) 
    function create_if_block_4(ctx) {
    	let video;
    	let current;

    	video = new Video({
    			props: { state: /*state*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(video.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(video, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const video_changes = {};
    			if (dirty & /*state*/ 64) video_changes.state = /*state*/ ctx[6];
    			video.$set(video_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(video, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(211:43) ",
    		ctx
    	});

    	return block;
    }

    // (209:43) 
    function create_if_block_3(ctx) {
    	let image;
    	let current;

    	image = new Image({
    			props: { state: /*state*/ ctx[6] },
    			$$inline: true
    		});

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
    			if (dirty & /*state*/ 64) image_changes.state = /*state*/ ctx[6];
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
    			destroy_component(image, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(209:43) ",
    		ctx
    	});

    	return block;
    }

    // (207:43) 
    function create_if_block_2$1(ctx) {
    	let audio;
    	let current;

    	audio = new Audio({
    			props: { state: /*state*/ ctx[6] },
    			$$inline: true
    		});

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
    			if (dirty & /*state*/ 64) audio_changes.state = /*state*/ ctx[6];
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
    			destroy_component(audio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(207:43) ",
    		ctx
    	});

    	return block;
    }

    // (205:3) {#if state.viewer_type === "dir"}
    function create_if_block_1$1(ctx) {
    	let filemanager;
    	let current;

    	filemanager = new FileManager({
    			props: { state: /*state*/ ctx[6] },
    			$$inline: true
    		});

    	filemanager.$on("navigate", /*navigate_handler*/ ctx[19]);
    	filemanager.$on("loading", /*loading_handler*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(filemanager.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(filemanager, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const filemanager_changes = {};
    			if (dirty & /*state*/ 64) filemanager_changes.state = /*state*/ ctx[6];
    			filemanager.$set(filemanager_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filemanager.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filemanager.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(filemanager, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(205:3) {#if state.viewer_type === \\\"dir\\\"}",
    		ctx
    	});

    	return block;
    }

    // (228:3) {#if state.base.type === "file"}
    function create_if_block$2(ctx) {
    	let tr0;
    	let td0;
    	let td1;
    	let t1_value = /*state*/ ctx[6].base.file_type + "";
    	let t1;
    	let t2;
    	let tr1;
    	let td2;
    	let td3;
    	let t4_value = formatDataVolume(/*state*/ ctx[6].base.file_size) + "";
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
    			add_location(td0, file$9, 228, 7, 7216);
    			add_location(td1, file$9, 228, 25, 7234);
    			add_location(tr0, file$9, 228, 3, 7212);
    			add_location(td2, file$9, 229, 7, 7278);
    			add_location(td3, file$9, 229, 25, 7296);
    			add_location(tr1, file$9, 229, 3, 7274);
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
    			if (dirty & /*state*/ 64 && t1_value !== (t1_value = /*state*/ ctx[6].base.file_type + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*state*/ 64 && t4_value !== (t4_value = formatDataVolume(/*state*/ ctx[6].base.file_size) + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(tr1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(228:3) {#if state.base.type === \\\"file\\\"}",
    		ctx
    	});

    	return block;
    }

    // (220:1) <Modal bind:this={details} title="Details" width="600px">
    function create_default_slot(ctx) {
    	let table;
    	let tr0;
    	let td0;
    	let h30;
    	let t1;
    	let tr1;
    	let td1;
    	let td2;
    	let t3_value = /*state*/ ctx[6].base.name + "";
    	let t3;
    	let t4;
    	let tr2;
    	let td3;
    	let td4;
    	let t6_value = /*state*/ ctx[6].base.path + "";
    	let t6;
    	let t7;
    	let tr3;
    	let td5;
    	let td6;
    	let t9_value = /*state*/ ctx[6].base.type + "";
    	let t9;
    	let t10;
    	let tr4;
    	let td7;
    	let td8;
    	let t12_value = formatDate(/*state*/ ctx[6].base.date_created, true, true, true) + "";
    	let t12;
    	let t13;
    	let tr5;
    	let td9;
    	let td10;
    	let t15_value = formatDate(/*state*/ ctx[6].base.date_modified, true, true, true) + "";
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
    	let t21_value = /*state*/ ctx[6].bucket.id + "";
    	let t21;
    	let t22;
    	let tr8;
    	let td14;
    	let td15;
    	let t24_value = /*state*/ ctx[6].bucket.name + "";
    	let t24;
    	let t25;
    	let tr9;
    	let td16;
    	let td17;
    	let t27_value = formatDate(/*state*/ ctx[6].bucket.date_created, true, true, true) + "";
    	let t27;
    	let t28;
    	let tr10;
    	let td18;
    	let td19;
    	let t30_value = formatDate(/*state*/ ctx[6].bucket.date_modified, true, true, true) + "";
    	let t30;
    	let if_block = /*state*/ ctx[6].base.type === "file" && create_if_block$2(ctx);

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
    			add_location(h30, file$9, 221, 23, 6787);
    			attr_dev(td0, "colspan", "2");
    			add_location(td0, file$9, 221, 7, 6771);
    			add_location(tr0, file$9, 221, 3, 6767);
    			add_location(td1, file$9, 222, 7, 6826);
    			add_location(td2, file$9, 222, 20, 6839);
    			add_location(tr1, file$9, 222, 3, 6822);
    			add_location(td3, file$9, 223, 7, 6878);
    			add_location(td4, file$9, 223, 20, 6891);
    			add_location(tr2, file$9, 223, 3, 6874);
    			add_location(td5, file$9, 224, 7, 6930);
    			add_location(td6, file$9, 224, 20, 6943);
    			add_location(tr3, file$9, 224, 3, 6926);
    			add_location(td7, file$9, 225, 7, 6982);
    			add_location(td8, file$9, 225, 28, 7003);
    			add_location(tr4, file$9, 225, 3, 6978);
    			add_location(td9, file$9, 226, 7, 7080);
    			add_location(td10, file$9, 226, 29, 7102);
    			add_location(tr5, file$9, 226, 3, 7076);
    			add_location(h31, file$9, 231, 23, 7383);
    			attr_dev(td11, "colspan", "2");
    			add_location(td11, file$9, 231, 7, 7367);
    			add_location(tr6, file$9, 231, 3, 7363);
    			add_location(td12, file$9, 232, 7, 7424);
    			add_location(td13, file$9, 232, 18, 7435);
    			add_location(tr7, file$9, 232, 3, 7420);
    			add_location(td14, file$9, 233, 7, 7474);
    			add_location(td15, file$9, 233, 20, 7487);
    			add_location(tr8, file$9, 233, 3, 7470);
    			add_location(td16, file$9, 234, 7, 7528);
    			add_location(td17, file$9, 234, 28, 7549);
    			add_location(tr9, file$9, 234, 3, 7524);
    			add_location(td18, file$9, 235, 7, 7628);
    			add_location(td19, file$9, 235, 29, 7650);
    			add_location(tr10, file$9, 235, 3, 7624);
    			set_style(table, "min-width", "100%");
    			add_location(table, file$9, 220, 2, 6731);
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
    			if (dirty & /*state*/ 64 && t3_value !== (t3_value = /*state*/ ctx[6].base.name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*state*/ 64 && t6_value !== (t6_value = /*state*/ ctx[6].base.path + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*state*/ 64 && t9_value !== (t9_value = /*state*/ ctx[6].base.type + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*state*/ 64 && t12_value !== (t12_value = formatDate(/*state*/ ctx[6].base.date_created, true, true, true) + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*state*/ 64 && t15_value !== (t15_value = formatDate(/*state*/ ctx[6].base.date_modified, true, true, true) + "")) set_data_dev(t15, t15_value);

    			if (/*state*/ ctx[6].base.type === "file") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(table, t17);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*state*/ 64 && t21_value !== (t21_value = /*state*/ ctx[6].bucket.id + "")) set_data_dev(t21, t21_value);
    			if (dirty & /*state*/ 64 && t24_value !== (t24_value = /*state*/ ctx[6].bucket.name + "")) set_data_dev(t24, t24_value);
    			if (dirty & /*state*/ 64 && t27_value !== (t27_value = formatDate(/*state*/ ctx[6].bucket.date_created, true, true, true) + "")) set_data_dev(t27, t27_value);
    			if (dirty & /*state*/ 64 && t30_value !== (t30_value = formatDate(/*state*/ ctx[6].bucket.date_modified, true, true, true) + "")) set_data_dev(t30, t30_value);
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
    		source: "(220:1) <Modal bind:this={details} title=\\\"Details\\\" width=\\\"600px\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div9;
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
    	let t6_value = /*state*/ ctx[6].base.name + "";
    	let t6;
    	let t7;
    	let div3;
    	let t8;
    	let div8;
    	let div6;
    	let div5;
    	let div4;
    	let t9;
    	let t10;
    	let button1;
    	let i2;
    	let t12;
    	let t13;
    	let button2;
    	let i3;
    	let t15;
    	let u0;
    	let t17;
    	let t18;
    	let button3;
    	let i4;
    	let t20;
    	let t21;
    	let button4;
    	let i5;
    	let t23;
    	let u1;
    	let t25;
    	let t26;
    	let button5;
    	let i6;
    	let t28;
    	let u2;
    	let t30;
    	let t31;
    	let sharebar_1;
    	let t32;
    	let div7;
    	let current_block_type_index;
    	let if_block3;
    	let t33;
    	let iframe;
    	let t34;
    	let modal;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*state*/ ctx[6].loading && create_if_block_8(ctx);
    	let each_value = /*state*/ ctx[6].parents;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*state*/ ctx[6].base.type === "file") return create_if_block_6;
    		if (/*state*/ ctx[6].base.type === "dir" || /*state*/ ctx[6].base.type === "bucket") return create_if_block_7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);
    	let if_block2 = /*state*/ ctx[6].base.type === "file" && create_if_block_5(ctx);
    	let sharebar_1_props = {};
    	sharebar_1 = new Sharebar({ props: sharebar_1_props, $$inline: true });
    	/*sharebar_1_binding*/ ctx[18](sharebar_1);
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1, create_if_block_3, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*state*/ ctx[6].viewer_type === "dir") return 0;
    		if (/*state*/ ctx[6].viewer_type === "audio") return 1;
    		if (/*state*/ ctx[6].viewer_type === "image") return 2;
    		if (/*state*/ ctx[6].viewer_type === "video") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let modal_props = {
    		title: "Details",
    		width: "600px",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	modal = new Modal({ props: modal_props, $$inline: true });
    	/*modal_binding*/ ctx[22](modal);

    	const block = {
    		c: function create() {
    			div9 = element("div");
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
    			div8 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			t10 = space();
    			button1 = element("button");
    			i2 = element("i");
    			i2.textContent = "save";
    			t12 = text(" DL all files");
    			t13 = space();
    			button2 = element("button");
    			i3 = element("i");
    			i3.textContent = "content_copy";
    			t15 = space();
    			u0 = element("u");
    			u0.textContent = "C";
    			t17 = text("opy Link");
    			t18 = space();
    			button3 = element("button");
    			i4 = element("i");
    			i4.textContent = "share";
    			t20 = text(" Share");
    			t21 = space();
    			button4 = element("button");
    			i5 = element("i");
    			i5.textContent = "help";
    			t23 = text(" Deta");
    			u1 = element("u");
    			u1.textContent = "i";
    			t25 = text("ls");
    			t26 = space();
    			button5 = element("button");
    			i6 = element("i");
    			i6.textContent = "edit";
    			t28 = space();
    			u2 = element("u");
    			u2.textContent = "E";
    			t30 = text("dit");
    			t31 = space();
    			create_component(sharebar_1.$$.fragment);
    			t32 = space();
    			div7 = element("div");
    			if (if_block3) if_block3.c();
    			t33 = space();
    			iframe = element("iframe");
    			t34 = space();
    			create_component(modal.$$.fragment);
    			attr_dev(i0, "class", "icon");
    			add_location(i0, file$9, 155, 3, 3796);
    			attr_dev(button0, "class", "button_toggle_toolbar svelte-in5te4");
    			toggle_class(button0, "button_highlight", /*toolbar_visible*/ ctx[2]);
    			add_location(button0, file$9, 154, 2, 3687);
    			attr_dev(i1, "class", "icon");
    			add_location(i1, file$9, 157, 58, 3891);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "id", "button_home");
    			attr_dev(a, "class", "button button_home svelte-in5te4");
    			add_location(a, file$9, 157, 2, 3835);
    			attr_dev(div0, "class", "breadcrumb breadcrumb_last svelte-in5te4");
    			add_location(div0, file$9, 162, 3, 4127);
    			attr_dev(div1, "class", "file_viewer_headerbar_title svelte-in5te4");
    			add_location(div1, file$9, 158, 2, 3922);
    			attr_dev(div2, "class", "file_viewer_headerbar highlight_1 svelte-in5te4");
    			add_location(div2, file$9, 153, 1, 3614);
    			attr_dev(div3, "class", "list_navigator svelte-in5te4");
    			add_location(div3, file$9, 165, 1, 4209);
    			attr_dev(i2, "class", "icon");
    			add_location(i2, file$9, 186, 4, 5219);
    			attr_dev(button1, "id", "btn_download_list");
    			attr_dev(button1, "class", "toolbar_button button_full_width svelte-in5te4");
    			set_style(button1, "display", "none");
    			add_location(button1, file$9, 185, 3, 5119);
    			attr_dev(i3, "class", "icon");
    			add_location(i3, file$9, 189, 4, 5341);
    			add_location(u0, file$9, 189, 37, 5374);
    			attr_dev(button2, "id", "btn_copy");
    			attr_dev(button2, "class", "toolbar_button button_full_width svelte-in5te4");
    			add_location(button2, file$9, 188, 3, 5273);
    			attr_dev(i4, "class", "icon");
    			add_location(i4, file$9, 192, 4, 5530);
    			attr_dev(button3, "class", "toolbar_button button_full_width svelte-in5te4");
    			toggle_class(button3, "button_highlight", /*sharebar_visible*/ ctx[11]);
    			add_location(button3, file$9, 191, 3, 5407);
    			attr_dev(i5, "class", "icon");
    			add_location(i5, file$9, 195, 4, 5699);
    			add_location(u1, file$9, 195, 33, 5728);
    			attr_dev(button4, "class", "toolbar_button button_full_width svelte-in5te4");
    			toggle_class(button4, "button_highlight", /*details_visible*/ ctx[12]);
    			add_location(button4, file$9, 194, 3, 5578);
    			attr_dev(i6, "class", "icon");
    			add_location(i6, file$9, 198, 4, 5846);
    			add_location(u2, file$9, 198, 29, 5871);
    			attr_dev(button5, "id", "btn_edit");
    			attr_dev(button5, "class", "toolbar_button button_full_width svelte-in5te4");
    			set_style(button5, "display", "none");
    			add_location(button5, file$9, 197, 3, 5755);
    			attr_dev(div4, "class", "svelte-in5te4");
    			add_location(div4, file$9, 167, 50, 4328);
    			attr_dev(div5, "class", "svelte-in5te4");
    			add_location(div5, file$9, 167, 45, 4323);
    			attr_dev(div6, "class", "toolbar svelte-in5te4");
    			toggle_class(div6, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			add_location(div6, file$9, 167, 2, 4280);
    			attr_dev(div7, "class", "file_viewer_file_preview svelte-in5te4");
    			toggle_class(div7, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			add_location(div7, file$9, 203, 2, 5965);
    			attr_dev(div8, "class", "file_viewer_window svelte-in5te4");
    			add_location(div8, file$9, 166, 1, 4245);
    			attr_dev(iframe, "title", "Frame for downloading files");
    			set_style(iframe, "display", "none");
    			set_style(iframe, "width", "1px");
    			set_style(iframe, "height", "1px");
    			add_location(iframe, file$9, 217, 1, 6540);
    			attr_dev(div9, "class", "file_viewer svelte-in5te4");
    			add_location(div9, file$9, 146, 0, 3410);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			if (if_block0) if_block0.m(div9, null);
    			append_dev(div9, t0);
    			append_dev(div9, div2);
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
    			/*div2_binding*/ ctx[17](div2);
    			append_dev(div9, t7);
    			append_dev(div9, div3);
    			append_dev(div9, t8);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			if (if_block1) if_block1.m(div4, null);
    			append_dev(div4, t9);
    			if (if_block2) if_block2.m(div4, null);
    			append_dev(div4, t10);
    			append_dev(div4, button1);
    			append_dev(button1, i2);
    			append_dev(button1, t12);
    			append_dev(div4, t13);
    			append_dev(div4, button2);
    			append_dev(button2, i3);
    			append_dev(button2, t15);
    			append_dev(button2, u0);
    			append_dev(button2, t17);
    			append_dev(div4, t18);
    			append_dev(div4, button3);
    			append_dev(button3, i4);
    			append_dev(button3, t20);
    			append_dev(div4, t21);
    			append_dev(div4, button4);
    			append_dev(button4, i5);
    			append_dev(button4, t23);
    			append_dev(button4, u1);
    			append_dev(button4, t25);
    			append_dev(div4, t26);
    			append_dev(div4, button5);
    			append_dev(button5, i6);
    			append_dev(button5, t28);
    			append_dev(button5, u2);
    			append_dev(button5, t30);
    			append_dev(div8, t31);
    			mount_component(sharebar_1, div8, null);
    			append_dev(div8, t32);
    			append_dev(div8, div7);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div7, null);
    			}

    			append_dev(div9, t33);
    			append_dev(div9, iframe);
    			/*iframe_binding*/ ctx[21](iframe);
    			append_dev(div9, t34);
    			mount_component(modal, div9, null);
    			/*div9_binding*/ ctx[23](div9);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*keydown*/ ctx[14], false, false, false),
    					listen_dev(button0, "click", /*toolbar_toggle*/ ctx[10], false, false, false),
    					listen_dev(
    						button3,
    						"click",
    						function () {
    							if (is_function(/*sharebar*/ ctx[3].toggle)) /*sharebar*/ ctx[3].toggle.apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button4,
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

    			if (/*state*/ ctx[6].loading) {
    				if (if_block0) {
    					if (dirty & /*state*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div9, t0);
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

    			if (dirty & /*navigate, state*/ 8256) {
    				each_value = /*state*/ ctx[6].parents;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*state*/ 64) && t6_value !== (t6_value = /*state*/ ctx[6].base.name + "")) set_data_dev(t6, t6_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div4, t9);
    				}
    			}

    			if (/*state*/ ctx[6].base.type === "file") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					if_block2.m(div4, t10);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*sharebar_visible*/ 2048) {
    				toggle_class(button3, "button_highlight", /*sharebar_visible*/ ctx[11]);
    			}

    			if (dirty & /*details_visible*/ 4096) {
    				toggle_class(button4, "button_highlight", /*details_visible*/ ctx[12]);
    			}

    			if (dirty & /*toolbar_visible*/ 4) {
    				toggle_class(div6, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			}

    			const sharebar_1_changes = {};
    			sharebar_1.$set(sharebar_1_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block3) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block3 = if_blocks[current_block_type_index];

    					if (!if_block3) {
    						if_block3 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block3.c();
    					} else {
    						if_block3.p(ctx, dirty);
    					}

    					transition_in(if_block3, 1);
    					if_block3.m(div7, null);
    				} else {
    					if_block3 = null;
    				}
    			}

    			if (dirty & /*toolbar_visible*/ 4) {
    				toggle_class(div7, "toolbar_visible", /*toolbar_visible*/ ctx[2]);
    			}

    			const modal_changes = {};

    			if (dirty & /*$$scope, state*/ 268435520) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(sharebar_1.$$.fragment, local);
    			transition_in(if_block3);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(sharebar_1.$$.fragment, local);
    			transition_out(if_block3);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[17](null);

    			if (if_block1) {
    				if_block1.d();
    			}

    			if (if_block2) if_block2.d();
    			/*sharebar_1_binding*/ ctx[18](null);
    			destroy_component(sharebar_1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*iframe_binding*/ ctx[21](null);
    			/*modal_binding*/ ctx[22](null);
    			destroy_component(modal);
    			/*div9_binding*/ ctx[23](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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
    	let download_frame;

    	// State
    	let state = {
    		bucket: initialNode.bucket,
    		parents: initialNode.parents,
    		base: initialNode.base,
    		path_root: "/d/" + initialNode.bucket.id,
    		loading: true,
    		viewer_type: ""
    	};

    	const navigate = (path, pushHist) => {
    		$$invalidate(6, state.loading = true, state);

    		fs_get_node(state.bucket.id, path).then(resp => {
    			window.document.title = resp.base.name + " ~ pixeldrain";

    			if (pushHist) {
    				window.history.pushState({}, window.document.title, "/d/" + resp.bucket.id + resp.base.path);
    			}

    			openNode(resp);
    		}).catch(err => {
    			console.error(err);
    			alert(err);
    		}).finally(() => {
    			$$invalidate(6, state.loading = false, state);
    		});
    	};

    	const openNode = node => {
    		// Sort directory children
    		node.base.children.sort((a, b) => {
    			// Sort directories before files
    			console.log(a);

    			if (a.type !== b.type) {
    				return a.type === "file" ? 1 : -1;
    			}

    			return a.name.localeCompare(b.name);
    		});

    		// Update shared state
    		$$invalidate(6, state.bucket = node.bucket, state);

    		$$invalidate(6, state.parents = node.parents, state);
    		$$invalidate(6, state.base = node.base, state);

    		// Update the viewer area with the right viewer type
    		if (state.base.type === "bucket" || state.base.type === "dir") {
    			$$invalidate(6, state.viewer_type = "dir", state);
    		} else if (state.base.file_type.startsWith("image")) {
    			$$invalidate(6, state.viewer_type = "image", state);
    		} else if (state.base.file_type.startsWith("audio") || state.base.file_type === "application/ogg" || state.base.name.endsWith(".mp3")) {
    			$$invalidate(6, state.viewer_type = "audio", state);
    		} else if (state.base.file_type.startsWith("video") || state.base.file_type === "application/matroska" || state.base.file_type === "application/x-matroska") {
    			$$invalidate(6, state.viewer_type = "video", state);
    		} else {
    			$$invalidate(6, state.viewer_type = "", state);
    		}

    		// Remove spinner
    		$$invalidate(6, state.loading = false, state);
    	};

    	onMount(() => openNode(initialNode));

    	window.onpopstate = e => {
    		if (e.state) {
    			let locsplit = document.location.pathname.split(state.bucket.id + "/", 2);
    			navigate(decodeURIComponent(locsplit[1]));
    		}
    	};

    	const keydown = e => {
    		switch (e.key) {
    			case "Escape":
    				hide();
    				return;
    			case "i":
    				details_window.toggle();
    		}
    	};

    	const download = () => {
    		$$invalidate(5, download_frame.src = fs_get_file_url(state.bucket.id, state.base.path) + "?attach", download_frame);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Filesystem> was created with unknown prop '${key}'`);
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

    	const navigate_handler = e => {
    		navigate(e.detail, true);
    	};

    	const loading_handler = e => {
    		$$invalidate(6, state.loading = e.detail, state);
    	};

    	function iframe_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			download_frame = $$value;
    			$$invalidate(5, download_frame);
    		});
    	}

    	function modal_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			details = $$value;
    			$$invalidate(4, details);
    		});
    	}

    	function div9_binding($$value) {
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
    		formatNumber,
    		fs_get_file_url,
    		fs_get_node,
    		Sharebar,
    		Spinner,
    		Modal,
    		FileManager,
    		Audio,
    		Image,
    		Video,
    		current_component,
    		file_viewer,
    		header_bar,
    		toolbar_visible,
    		toolbar_toggle,
    		sharebar,
    		sharebar_visible,
    		details,
    		details_visible,
    		download_frame,
    		state,
    		navigate,
    		openNode,
    		keydown,
    		download,
    		total_directories,
    		total_files,
    		total_file_size
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_viewer" in $$props) $$invalidate(0, file_viewer = $$props.file_viewer);
    		if ("header_bar" in $$props) $$invalidate(1, header_bar = $$props.header_bar);
    		if ("toolbar_visible" in $$props) $$invalidate(2, toolbar_visible = $$props.toolbar_visible);
    		if ("toolbar_toggle" in $$props) $$invalidate(10, toolbar_toggle = $$props.toolbar_toggle);
    		if ("sharebar" in $$props) $$invalidate(3, sharebar = $$props.sharebar);
    		if ("sharebar_visible" in $$props) $$invalidate(11, sharebar_visible = $$props.sharebar_visible);
    		if ("details" in $$props) $$invalidate(4, details = $$props.details);
    		if ("details_visible" in $$props) $$invalidate(12, details_visible = $$props.details_visible);
    		if ("download_frame" in $$props) $$invalidate(5, download_frame = $$props.download_frame);
    		if ("state" in $$props) $$invalidate(6, state = $$props.state);
    		if ("total_directories" in $$props) $$invalidate(7, total_directories = $$props.total_directories);
    		if ("total_files" in $$props) $$invalidate(8, total_files = $$props.total_files);
    		if ("total_file_size" in $$props) $$invalidate(9, total_file_size = $$props.total_file_size);
    	};

    	let total_directories;
    	let total_files;
    	let total_file_size;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*state*/ 64) {
    			// Tallys
    			 $$invalidate(7, total_directories = state.base.children.reduce(
    				(acc, cur) => {
    					if (cur.type === "dir") {
    						acc++;
    					}

    					return acc;
    				},
    				0
    			));
    		}

    		if ($$self.$$.dirty & /*state*/ 64) {
    			 $$invalidate(8, total_files = state.base.children.reduce(
    				(acc, cur) => {
    					if (cur.type === "file") {
    						acc++;
    					}

    					return acc;
    				},
    				0
    			));
    		}

    		if ($$self.$$.dirty & /*state*/ 64) {
    			 $$invalidate(9, total_file_size = state.base.children.reduce((acc, cur) => acc + cur.file_size, 0));
    		}
    	};

    	return [
    		file_viewer,
    		header_bar,
    		toolbar_visible,
    		sharebar,
    		details,
    		download_frame,
    		state,
    		total_directories,
    		total_files,
    		total_file_size,
    		toolbar_toggle,
    		sharebar_visible,
    		details_visible,
    		navigate,
    		keydown,
    		download,
    		click_handler,
    		div2_binding,
    		sharebar_1_binding,
    		navigate_handler,
    		loading_handler,
    		iframe_binding,
    		modal_binding,
    		div9_binding
    	];
    }

    class Filesystem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filesystem",
    			options,
    			id: create_fragment$9.name
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
