
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
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
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
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
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
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
            const d = (program.b - t);
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.1' }, detail), { bubbles: true }));
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const CardStore = readable([
        {
            id: 1,
            skill: 'SQL',
            essentialityMeasure: 3,
            desc: 'Querying data using SQL is an essential skill for anyone who works with data',
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Head First SQL: Your Brain on SQL - Lynn Beighley',
                freeResource: false,
                coverageMeasure: 1,
                depthMeasure: 3
            },
            {
                id: 2,
                resourceType: 'text',
                resourceName: 'Tutorials Point SQL tutorial - tutorials point',
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 3,
                resourceType: 'video',
                resourceName: 'Khan Academy SQL video course - interactive - Khan Academy',
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 3
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Learning SQL: Generate, Manipulate, and Retrieve Data 3rd Edition - Alan Beaulieu",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "Code academy SQL tutorial - interactive - code academy",
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 2
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "SQLbolt SQL tutorial - interactive - SQLBolt",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 7,
                resourceType: 'video',
                resourceName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert (Udemy course) - Nassim Badaoui",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            }
            ],
            CardStatus: "more"
        },
        {
            id: 2,
            skill: 'Programming language',
            essentialityMeasure: 3,
            desc: "As a data engineer you'll be writing a lot of code to handle various business cases such as ETLs, data pipelines, etc. The de facto standard language for data engineering is Python (not to be confused with R or nim that are used for data science, they have no use in data engineering).",
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Python Crash Course: A Hands-On, Project-Based Introduction to Programming - Eric Matthes',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: 'Learning Python, 5th Edition - Mark Lutz',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: 'The Python Tutorial - Python documentation',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 4,
                resourceType: 'video',
                resourceName: 'Learn Python Programming Masterclass - Tim Buchalka',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'video',
                resourceName: 'Learn Python Programming (Python 3) - Jason Cannon',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 6,
                resourceType: 'video',
                resourceName: 'Python for Everybody - University Of Michigan',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            ],
            CardStatus: "more"
        },
        {
            id: 3,
            skill:'Relational Databases - Design & Architecture',
            essentialityMeasure: 3,
            desc: "RDBMS are the basic building blocks for any application data. A data engineer should know how to design and architect their structures, and learn about concepts that are related to them.",
            resouceList: [{
                id: 1,
                resourceType: 'video',
                resourceName: 'Database Design Course (freeCodeCamp) - Caleb Curry',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: "Designing Data-Intensive Applications - Martin Kleppmann",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: "Normalization of Database - studytonight.com",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Database Design for Mere Mortals: A Hands-On Guide to Relational Database Design - Michael Hernandez",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "DBMS Architecture: 1-Tier, 2-Tier & 3-Tier - Guru99",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "An Introduction to High Availability Computing: Concepts and Theory - David Clinton",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            }
            ],
            CardStatus: "more"
        },

        // {
        //     id: 4,
        //     skill: "In Progress ...."
        // }

    ], (set) => {return () => {} } );

    const CardStoreWrite = writable([
        {
            id: 1,
            skill: 'SQL',
            essentialityMeasure: 3,
            desc: 'Querying data using SQL is an essential skill for anyone who works with data',
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Head First SQL: Your Brain on SQL - Lynn Beighley',
                freeResource: false,
                coverageMeasure: 1,
                depthMeasure: 3,
                webLink: "https://www.oreilly.com/library/view/head-first-sql/9780596526849/"
            },
            {
                id: 2,
                resourceType: 'text',
                resourceName: 'Tutorials Point SQL tutorial - tutorials point',
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3,
                webLink: "https://www.tutorialspoint.com/sql/index.htm"
            },
            {
                id: 3,
                resourceType: 'video',
                resourceName: 'Khan Academy SQL video course - interactive - Khan Academy',
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 3,
                webLink: "https://www.khanacademy.org/computing/computer-programming/sql/"
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Learning SQL: Generate, Manipulate, and Retrieve Data 3rd Edition - Alan Beaulieu",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.oreilly.com/library/view/learning-sql-3rd/9781492057604/"
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "Code academy SQL tutorial - interactive - code academy",
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 2,
                webLink: "https://www.codecademy.com/learn/learn-sql"
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "SQLbolt SQL tutorial - interactive - SQLBolt",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3,
                webLink: "https://sqlbolt.com/"
            },
            {
                id: 7,
                resourceType: 'video',
                resourceName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert (Udemy course) - Nassim Badaoui",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.udemy.com/course/the-ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/"
            }
            ],
            CardStatus: "more"
        },
        {
            id: 2,
            skill: 'Programming language',
            essentialityMeasure: 3,
            desc: "As a data engineer you'll be writing a lot of code to handle various business cases such as ETLs, data pipelines, etc. The de facto standard language for data engineering is Python (not to be confused with R or nim that are used for data science, they have no use in data engineering).",
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Python Crash Course: A Hands-On, Project-Based Introduction to Programming - Eric Matthes',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 4,
                webLink: "https://www.oreilly.com/library/view/python-crash-course/9781492071266/"
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: 'Learning Python, 5th Edition - Mark Lutz',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.oreilly.com/library/view/learning-python-5th/9781449355722/"
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: 'The Python Tutorial - Python documentation',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://docs.python.org/3/tutorial/"
            },
            {
                id: 4,
                resourceType: 'video',
                resourceName: 'Learn Python Programming Masterclass - Tim Buchalka',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.udemy.com/course/python-the-complete-python-developer-course/"
            },
            {
                id: 5,
                resourceType: 'video',
                resourceName: 'Learn Python Programming (Python 3) - Jason Cannon',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.udemy.com/course/python-programming-projects/"
            },
            {
                id: 6,
                resourceType: 'video',
                resourceName: 'Python for Everybody - University Of Michigan',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.coursera.org/specializations/python"
            },
            ],
            CardStatus: "more"
        },
        {
            id: 3,
            skill:'Relational Databases - Design & Architecture',
            essentialityMeasure: 3,
            desc: "RDBMS are the basic building blocks for any application data. A data engineer should know how to design and architect their structures, and learn about concepts that are related to them.",
            resouceList: [{
                id: 1,
                resourceType: 'video',
                resourceName: 'Database Design Course (freeCodeCamp) - Caleb Curry',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 4,
                webLink: "https://www.youtube.com/watch?v=ztHopE5Wnpc"
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: "Designing Data-Intensive Applications - Martin Kleppmann",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/"
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: "Normalization of Database - studytonight.com",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4,
                webLink: "https://www.studytonight.com/dbms/database-normalization.php"
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Database Design for Mere Mortals: A Hands-On Guide to Relational Database Design - Michael Hernandez",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5,
                webLink: "https://www.oreilly.com/library/view/database-design-for/9780133122282/"
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "DBMS Architecture: 1-Tier, 2-Tier & 3-Tier - Guru99",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3,
                webLink: "https://www.guru99.com/dbms-architecture.html"
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "An Introduction to High Availability Computing: Concepts and Theory - David Clinton",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4,
                webLink: "https://www.freecodecamp.org/news/high-availability-concepts-and-theory/"
            }
            ],
            CardStatus: "more"
        },
        {
            id: 4,
            skill:'... To be Added',
            essentialityMeasure: 5,
            desc: "A lot more useful content to be added",
            resouceList: [
            ],
            CardStatus: "more"
        }

        // {
        //     id: 4,
        //     skill: "In Progress ...."
        // }

    ]);

    const CardStoreCopy = readable([
        {
            id: 1,
            skill: 'SQL',
            essentialityMeasure: 3,
            desc: 'Querying data using SQL is an essential skill for anyone who works with data',
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Head First SQL: Your Brain on SQL - Lynn Beighley',
                freeResource: false,
                coverageMeasure: 1,
                depthMeasure: 3
            },
            {
                id: 2,
                resourceType: 'text',
                resourceName: 'Tutorials Point SQL tutorial - tutorials point',
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 3,
                resourceType: 'video',
                resourceName: 'Khan Academy SQL video course - interactive - Khan Academy',
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 3
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Learning SQL: Generate, Manipulate, and Retrieve Data 3rd Edition - Alan Beaulieu",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "Code academy SQL tutorial - interactive - code academy",
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 2
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "SQLbolt SQL tutorial - interactive - SQLBolt",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 7,
                resourceType: 'video',
                resourceName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert (Udemy course) - Nassim Badaoui",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            }
            ],
            CardStatus: "more"
        },
        {
            id: 2,
            skill: 'Programming language',
            essentialityMeasure: 3,
            desc: "As a data engineer you'll be writing a lot of code to handle various business cases such as ETLs, data pipelines, etc. The de facto standard language for data engineering is Python (not to be confused with R or nim that are used for data science, they have no use in data engineering).",
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Python Crash Course: A Hands-On, Project-Based Introduction to Programming - Eric Matthes',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: 'Learning Python, 5th Edition - Mark Lutz',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: 'The Python Tutorial - Python documentation',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 4,
                resourceType: 'video',
                resourceName: 'Learn Python Programming Masterclass - Tim Buchalka',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'video',
                resourceName: 'Learn Python Programming (Python 3) - Jason Cannon',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 6,
                resourceType: 'video',
                resourceName: 'Python for Everybody - University Of Michigan',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            ],
            CardStatus: "more"
        },
        {
            id: 3,
            skill:'Relational Databases - Design & Architecture',
            essentialityMeasure: 3,
            desc: "RDBMS are the basic building blocks for any application data. A data engineer should know how to design and architect their structures, and learn about concepts that are related to them.",
            resouceList: [{
                id: 1,
                resourceType: 'video',
                resourceName: 'Database Design Course (freeCodeCamp) - Caleb Curry',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: "Designing Data-Intensive Applications - Martin Kleppmann",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: "Normalization of Database - studytonight.com",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Database Design for Mere Mortals: A Hands-On Guide to Relational Database Design - Michael Hernandez",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "DBMS Architecture: 1-Tier, 2-Tier & 3-Tier - Guru99",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "An Introduction to High Availability Computing: Concepts and Theory - David Clinton",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            }
            ],
            CardStatus: "more"
        },

        // {
        //     id: 4,
        //     skill: "In Progress ...."
        // }

    ]);

    const CardStoreCopy2 = readable([
        {
            id: 1,
            skill: 'SQL',
            essentialityMeasure: 3,
            desc: 'Querying data using SQL is an essential skill for anyone who works with data',
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Head First SQL: Your Brain on SQL - Lynn Beighley',
                freeResource: false,
                coverageMeasure: 1,
                depthMeasure: 3
            },
            {
                id: 2,
                resourceType: 'text',
                resourceName: 'Tutorials Point SQL tutorial - tutorials point',
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 3,
                resourceType: 'video',
                resourceName: 'Khan Academy SQL video course - interactive - Khan Academy',
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 3
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Learning SQL: Generate, Manipulate, and Retrieve Data 3rd Edition - Alan Beaulieu",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "Code academy SQL tutorial - interactive - code academy",
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 2
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "SQLbolt SQL tutorial - interactive - SQLBolt",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 7,
                resourceType: 'video',
                resourceName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert (Udemy course) - Nassim Badaoui",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            }
            ],
            CardStatus: "more"
        },
        {
            id: 2,
            skill: 'Programming language',
            essentialityMeasure: 3,
            desc: "As a data engineer you'll be writing a lot of code to handle various business cases such as ETLs, data pipelines, etc. The de facto standard language for data engineering is Python (not to be confused with R or nim that are used for data science, they have no use in data engineering).",
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Python Crash Course: A Hands-On, Project-Based Introduction to Programming - Eric Matthes',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: 'Learning Python, 5th Edition - Mark Lutz',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: 'The Python Tutorial - Python documentation',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 4,
                resourceType: 'video',
                resourceName: 'Learn Python Programming Masterclass - Tim Buchalka',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'video',
                resourceName: 'Learn Python Programming (Python 3) - Jason Cannon',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 6,
                resourceType: 'video',
                resourceName: 'Python for Everybody - University Of Michigan',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            ],
            CardStatus: "more"
        },
        {
            id: 3,
            skill:'Relational Databases - Design & Architecture',
            essentialityMeasure: 3,
            desc: "RDBMS are the basic building blocks for any application data. A data engineer should know how to design and architect their structures, and learn about concepts that are related to them.",
            resouceList: [{
                id: 1,
                resourceType: 'video',
                resourceName: 'Database Design Course (freeCodeCamp) - Caleb Curry',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: "Designing Data-Intensive Applications - Martin Kleppmann",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: "Normalization of Database - studytonight.com",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Database Design for Mere Mortals: A Hands-On Guide to Relational Database Design - Michael Hernandez",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "DBMS Architecture: 1-Tier, 2-Tier & 3-Tier - Guru99",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "An Introduction to High Availability Computing: Concepts and Theory - David Clinton",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            }
            ],
            CardStatus: "more"
        },

        // {
        //     id: 4,
        //     skill: "In Progress ...."
        // }

    ]);

    const CardStoreCopy3 = readable([
        {
            id: 1,
            skill: 'SQL',
            essentialityMeasure: 3,
            desc: 'Querying data using SQL is an essential skill for anyone who works with data',
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Head First SQL: Your Brain on SQL - Lynn Beighley',
                freeResource: false,
                coverageMeasure: 1,
                depthMeasure: 3
            },
            {
                id: 2,
                resourceType: 'text',
                resourceName: 'Tutorials Point SQL tutorial - tutorials point',
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 3,
                resourceType: 'video',
                resourceName: 'Khan Academy SQL video course - interactive - Khan Academy',
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 3
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Learning SQL: Generate, Manipulate, and Retrieve Data 3rd Edition - Alan Beaulieu",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "Code academy SQL tutorial - interactive - code academy",
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 2
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "SQLbolt SQL tutorial - interactive - SQLBolt",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 7,
                resourceType: 'video',
                resourceName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert (Udemy course) - Nassim Badaoui",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            }
            ],
            CardStatus: "more"
        },
        {
            id: 2,
            skill: 'Programming language',
            essentialityMeasure: 3,
            desc: "As a data engineer you'll be writing a lot of code to handle various business cases such as ETLs, data pipelines, etc. The de facto standard language for data engineering is Python (not to be confused with R or nim that are used for data science, they have no use in data engineering).",
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Python Crash Course: A Hands-On, Project-Based Introduction to Programming - Eric Matthes',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: 'Learning Python, 5th Edition - Mark Lutz',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: 'The Python Tutorial - Python documentation',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 4,
                resourceType: 'video',
                resourceName: 'Learn Python Programming Masterclass - Tim Buchalka',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'video',
                resourceName: 'Learn Python Programming (Python 3) - Jason Cannon',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 6,
                resourceType: 'video',
                resourceName: 'Python for Everybody - University Of Michigan',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            ],
            CardStatus: "more"
        },
        {
            id: 3,
            skill:'Relational Databases - Design & Architecture',
            essentialityMeasure: 3,
            desc: "RDBMS are the basic building blocks for any application data. A data engineer should know how to design and architect their structures, and learn about concepts that are related to them.",
            resouceList: [{
                id: 1,
                resourceType: 'video',
                resourceName: 'Database Design Course (freeCodeCamp) - Caleb Curry',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: "Designing Data-Intensive Applications - Martin Kleppmann",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: "Normalization of Database - studytonight.com",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Database Design for Mere Mortals: A Hands-On Guide to Relational Database Design - Michael Hernandez",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "DBMS Architecture: 1-Tier, 2-Tier & 3-Tier - Guru99",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "An Introduction to High Availability Computing: Concepts and Theory - David Clinton",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            }
            ],
            CardStatus: "more"
        },

        // {
        //     id: 4,
        //     skill: "In Progress ...."
        // }

    ]);

    const CardStoreCopy4 = readable([
        {
            id: 1,
            skill: 'SQL',
            essentialityMeasure: 3,
            desc: 'Querying data using SQL is an essential skill for anyone who works with data',
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Head First SQL: Your Brain on SQL - Lynn Beighley',
                freeResource: false,
                coverageMeasure: 1,
                depthMeasure: 3
            },
            {
                id: 2,
                resourceType: 'text',
                resourceName: 'Tutorials Point SQL tutorial - tutorials point',
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 3,
                resourceType: 'video',
                resourceName: 'Khan Academy SQL video course - interactive - Khan Academy',
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 3
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Learning SQL: Generate, Manipulate, and Retrieve Data 3rd Edition - Alan Beaulieu",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "Code academy SQL tutorial - interactive - code academy",
                freeResource: true,
                coverageMeasure: 3,
                depthMeasure: 2
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "SQLbolt SQL tutorial - interactive - SQLBolt",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 7,
                resourceType: 'video',
                resourceName: "The Ultimate MySQL Bootcamp: Go from SQL Beginner to Expert (Udemy course) - Nassim Badaoui",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            }
            ],
            CardStatus: "more"
        },
        {
            id: 2,
            skill: 'Programming language',
            essentialityMeasure: 3,
            desc: "As a data engineer you'll be writing a lot of code to handle various business cases such as ETLs, data pipelines, etc. The de facto standard language for data engineering is Python (not to be confused with R or nim that are used for data science, they have no use in data engineering).",
            resouceList: [{
                id: 1,
                resourceType: 'book',
                resourceName: 'Python Crash Course: A Hands-On, Project-Based Introduction to Programming - Eric Matthes',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: 'Learning Python, 5th Edition - Mark Lutz',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: 'The Python Tutorial - Python documentation',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 4,
                resourceType: 'video',
                resourceName: 'Learn Python Programming Masterclass - Tim Buchalka',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'video',
                resourceName: 'Learn Python Programming (Python 3) - Jason Cannon',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 6,
                resourceType: 'video',
                resourceName: 'Python for Everybody - University Of Michigan',
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            ],
            CardStatus: "more"
        },
        {
            id: 3,
            skill:'Relational Databases - Design & Architecture',
            essentialityMeasure: 3,
            desc: "RDBMS are the basic building blocks for any application data. A data engineer should know how to design and architect their structures, and learn about concepts that are related to them.",
            resouceList: [{
                id: 1,
                resourceType: 'video',
                resourceName: 'Database Design Course (freeCodeCamp) - Caleb Curry',
                freeResource: true,
                coverageMeasure: 5,
                depthMeasure: 4
            },
            {
                id: 2,
                resourceType: 'book',
                resourceName: "Designing Data-Intensive Applications - Martin Kleppmann",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 3,
                resourceType: 'text',
                resourceName: "Normalization of Database - studytonight.com",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            },
            {
                id: 4,
                resourceType: 'book',
                resourceName: "Database Design for Mere Mortals: A Hands-On Guide to Relational Database Design - Michael Hernandez",
                freeResource: false,
                coverageMeasure: 5,
                depthMeasure: 5
            },
            {
                id: 5,
                resourceType: 'text',
                resourceName: "DBMS Architecture: 1-Tier, 2-Tier & 3-Tier - Guru99",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 3
            },
            {
                id: 6,
                resourceType: 'text',
                resourceName: "An Introduction to High Availability Computing: Concepts and Theory - David Clinton",
                freeResource: true,
                coverageMeasure: 4,
                depthMeasure: 4
            }
            ],
            CardStatus: "more"
        },  
        {
            id: 4,
            skill:'... To be Added',
            essentialityMeasure: 5,
            desc: "A lot more useful content to be added",
            resouceList: [
            ],
            CardStatus: "more"
        }

        // {
        //     id: 4,
        //     skill: "In Progress ...."
        // }

    ]);

    /* src\components\Filters.svelte generated by Svelte v3.50.1 */

    const { console: console_1$2 } = globals;
    const file$7 = "src\\components\\Filters.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let ul;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			ul = element("ul");
    			button0 = element("button");
    			button0.textContent = "Show All";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Free resources";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Books";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "Courses";
    			attr_dev(button0, "class", "left svelte-933a6x");
    			add_location(button0, file$7, 70, 8, 2712);
    			attr_dev(button1, "class", "middle_one svelte-933a6x");
    			add_location(button1, file$7, 71, 8, 2802);
    			attr_dev(button2, "class", "middle_two svelte-933a6x");
    			add_location(button2, file$7, 72, 8, 2910);
    			attr_dev(button3, "class", "right svelte-933a6x");
    			add_location(button3, file$7, 73, 8, 3000);
    			attr_dev(ul, "class", "filters z-10 top-0 sticky svelte-933a6x");
    			add_location(ul, file$7, 69, 4, 2663);
    			attr_dev(section, "class", "svelte-933a6x");
    			add_location(section, file$7, 68, 0, 2648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, ul);
    			append_dev(ul, button0);
    			append_dev(ul, t1);
    			append_dev(ul, button1);
    			append_dev(ul, t3);
    			append_dev(ul, button2);
    			append_dev(ul, t5);
    			append_dev(ul, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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
    	let $CardStoreCopy2;
    	let $CardStoreCopy;
    	let $CardStore;
    	let $CardStoreWrite;
    	let $CardStoreCopy4;
    	validate_store(CardStoreCopy2, 'CardStoreCopy2');
    	component_subscribe($$self, CardStoreCopy2, $$value => $$invalidate(6, $CardStoreCopy2 = $$value));
    	validate_store(CardStoreCopy, 'CardStoreCopy');
    	component_subscribe($$self, CardStoreCopy, $$value => $$invalidate(7, $CardStoreCopy = $$value));
    	validate_store(CardStore, 'CardStore');
    	component_subscribe($$self, CardStore, $$value => $$invalidate(8, $CardStore = $$value));
    	validate_store(CardStoreWrite, 'CardStoreWrite');
    	component_subscribe($$self, CardStoreWrite, $$value => $$invalidate(9, $CardStoreWrite = $$value));
    	validate_store(CardStoreCopy4, 'CardStoreCopy4');
    	component_subscribe($$self, CardStoreCopy4, $$value => $$invalidate(10, $CardStoreCopy4 = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Filters', slots, []);
    	let bufferMainInfo = $CardStore;

    	// let copiedMainInfo = bufferMainInfo;
    	let presentingMainInfo = bufferMainInfo;

    	const filterResources = (MainInfo, filterName) => {
    		console.log('MainInfo:', MainInfo);

    		for (let lev2Item of MainInfo) {
    			// console.log('typeof MainInfo.resourceList:', typeof lev2Item.resouceList, lev2Item.resouceList)
    			console.log('lev2item', lev2Item, 'typeof:', typeof lev2Item);

    			console.log('lev2Item.resouceList', lev2Item.resouceList);

    			lev2Item.resouceList = lev2Item.resouceList.filter(item => filterName === "Free resources"
    			? item.freeResource === true
    			: item.resourceType === filterName);

    			console.log('lev2Item.resouceList-AFTER FILTER', lev2Item.resouceList);
    		}

    		console.log('MainInfo-after', MainInfo);
    	};

    	const handleFilter = filterName => {
    		if (filterName === "Show All") {
    			console.log('entered SHoww All');
    			CardStoreWrite.set($CardStoreCopy4);
    			console.log('$cARDSTOREcopy:', $CardStoreCopy);
    			console.log('$cARDSTOREwRITE:', $CardStoreWrite);
    		} else if (filterName === "Free resources") {
    			presentingMainInfo = $CardStore;
    			filterResources(presentingMainInfo, "Free resources");
    			console.log(presentingMainInfo);

    			CardStoreWrite.update(i => {
    				return presentingMainInfo;
    			});

    			console.log('AFTER STORE SETTING');
    		} else if (filterName === "Books") {
    			presentingMainInfo = $CardStoreCopy; // console.log($CardStore)
    			filterResources(presentingMainInfo, "book");

    			CardStoreWrite.update(i => {
    				return presentingMainInfo;
    			});
    		} else if (filterName === "Courses") {
    			presentingMainInfo = $CardStoreCopy2;
    			filterResources(presentingMainInfo, "video");

    			CardStoreWrite.update(i => {
    				return presentingMainInfo;
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Filters> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleFilter("Show All");
    	const click_handler_1 = () => handleFilter("Free resources");
    	const click_handler_2 = () => handleFilter("Books");
    	const click_handler_3 = () => handleFilter("Courses");

    	$$self.$capture_state = () => ({
    		CardStore,
    		CardStoreWrite,
    		CardStoreCopy,
    		CardStoreCopy2,
    		CardStoreCopy3,
    		CardStoreCopy4,
    		bufferMainInfo,
    		presentingMainInfo,
    		filterResources,
    		handleFilter,
    		$CardStoreCopy2,
    		$CardStoreCopy,
    		$CardStore,
    		$CardStoreWrite,
    		$CardStoreCopy4
    	});

    	$$self.$inject_state = $$props => {
    		if ('bufferMainInfo' in $$props) bufferMainInfo = $$props.bufferMainInfo;
    		if ('presentingMainInfo' in $$props) presentingMainInfo = $$props.presentingMainInfo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleFilter, click_handler, click_handler_1, click_handler_2, click_handler_3];
    }

    class Filters extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\shared\Bars.svelte generated by Svelte v3.50.1 */

    const file$6 = "src\\shared\\Bars.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (10:8) {#each Array(maxSteps) as stepNo, i}
    function create_each_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "step svelte-51axc1");
    			toggle_class(div, "fill", /*i*/ ctx[4] < /*steps*/ ctx[1]);
    			add_location(div, file$6, 10, 12, 242);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*steps*/ 2) {
    				toggle_class(div, "fill", /*i*/ ctx[4] < /*steps*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:8) {#each Array(maxSteps) as stepNo, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let each_value = Array(maxSteps);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*label*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "label svelte-51axc1");
    			add_location(div0, file$6, 7, 4, 122);
    			attr_dev(div1, "class", "stepBody svelte-51axc1");
    			add_location(div1, file$6, 8, 4, 160);
    			attr_dev(div2, "class", "bar svelte-51axc1");
    			add_location(div2, file$6, 6, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 1) set_data_dev(t0, /*label*/ ctx[0]);

    			if (dirty & /*steps*/ 2) {
    				each_value = Array(maxSteps);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
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

    const maxSteps = 5;

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bars', slots, []);
    	let { label = '' } = $$props;
    	let { steps } = $$props;
    	const writable_props = ['label', 'steps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bars> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('steps' in $$props) $$invalidate(1, steps = $$props.steps);
    	};

    	$$self.$capture_state = () => ({ label, steps, maxSteps });

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('steps' in $$props) $$invalidate(1, steps = $$props.steps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, steps];
    }

    class Bars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { label: 0, steps: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bars",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*steps*/ ctx[1] === undefined && !('steps' in props)) {
    			console.warn("<Bars> was created without expected prop 'steps'");
    		}
    	}

    	get label() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get steps() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set steps(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\shared\Buttons.svelte generated by Svelte v3.50.1 */
    const file$5 = "src\\shared\\Buttons.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let img;
    	let img_src_value;

    	let t_value = (/*cardStatus*/ ctx[0] === 'more'
    	? "Show more"
    	: "Show less") + "";

    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			t = text(t_value);
    			attr_dev(img, "class", "button svelte-1tx3f0n");

    			if (!src_url_equal(img.src, img_src_value = /*cardStatus*/ ctx[0] === 'more'
    			? /*downArrowImgPath*/ ctx[2]
    			: /*upArrowImgPath*/ ctx[1])) attr_dev(img, "src", img_src_value);

    			add_location(img, file$5, 12, 63, 380);
    			attr_dev(button, "class", "svelte-1tx3f0n");
    			add_location(button, file$5, 12, 0, 317);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cardStatus*/ 1 && !src_url_equal(img.src, img_src_value = /*cardStatus*/ ctx[0] === 'more'
    			? /*downArrowImgPath*/ ctx[2]
    			: /*upArrowImgPath*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*cardStatus*/ 1 && t_value !== (t_value = (/*cardStatus*/ ctx[0] === 'more'
    			? "Show more"
    			: "Show less") + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
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
    	validate_slots('Buttons', slots, []);
    	let { cardStatus = 'more' } = $$props;
    	let upArrowImgPath = 'img/arrow_up.svg';
    	let downArrowImgPath = 'img/arrow_down.svg';
    	const dispatch = createEventDispatcher();
    	const writable_props = ['cardStatus'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Buttons> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch('ShowContent', cardStatus);

    	$$self.$$set = $$props => {
    		if ('cardStatus' in $$props) $$invalidate(0, cardStatus = $$props.cardStatus);
    	};

    	$$self.$capture_state = () => ({
    		cardStatus,
    		upArrowImgPath,
    		downArrowImgPath,
    		createEventDispatcher,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('cardStatus' in $$props) $$invalidate(0, cardStatus = $$props.cardStatus);
    		if ('upArrowImgPath' in $$props) $$invalidate(1, upArrowImgPath = $$props.upArrowImgPath);
    		if ('downArrowImgPath' in $$props) $$invalidate(2, downArrowImgPath = $$props.downArrowImgPath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cardStatus, upArrowImgPath, downArrowImgPath, dispatch, click_handler];
    }

    class Buttons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { cardStatus: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get cardStatus() {
    		throw new Error("<Buttons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardStatus(value) {
    		throw new Error("<Buttons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src\shared\Resource.svelte generated by Svelte v3.50.1 */

    const { console: console_1$1 } = globals;
    const file$4 = "src\\shared\\Resource.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (76:4) {#each presentingResources as resource (resource.id)}
    function create_each_block$1(key_1, ctx) {
    	let div3;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let img0_alt_value;
    	let t0;
    	let p;
    	let a;
    	let t1_value = /*resource*/ ctx[8].resourceName + "";
    	let t1;
    	let a_href_value;
    	let t2;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let img1_alt_value;
    	let t3;
    	let div1;
    	let bars0;
    	let t4;
    	let bars1;
    	let div3_transition;
    	let current;

    	bars0 = new Bars({
    			props: {
    				label: "coverage",
    				steps: /*resource*/ ctx[8].coverageMeasure
    			},
    			$$inline: true
    		});

    	bars1 = new Bars({
    			props: {
    				label: "depth",
    				steps: /*resource*/ ctx[8].depthMeasure
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			p = element("p");
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div1 = element("div");
    			create_component(bars0.$$.fragment);
    			t4 = space();
    			create_component(bars1.$$.fragment);
    			if (!src_url_equal(img0.src, img0_src_value = /*assignImgAttrForResourceType*/ ctx[2](/*resource*/ ctx[8]).img_src)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", img0_alt_value = /*assignImgAttrForResourceType*/ ctx[2](/*resource*/ ctx[8]).img_alt);
    			attr_dev(img0, "class", "svelte-uy90r0");
    			add_location(img0, file$4, 78, 16, 2738);
    			attr_dev(a, "href", a_href_value = /*resource*/ ctx[8].webLink);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-uy90r0");
    			add_location(a, file$4, 79, 40, 2901);
    			attr_dev(p, "class", "resourceName svelte-uy90r0");
    			add_location(p, file$4, 79, 16, 2877);
    			attr_dev(div0, "class", "top svelte-uy90r0");
    			add_location(div0, file$4, 77, 12, 2703);
    			if (!src_url_equal(img1.src, img1_src_value = /*assignImgAttrForfreeResource*/ ctx[3](/*resource*/ ctx[8]).img_src)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", img1_alt_value = /*assignImgAttrForfreeResource*/ ctx[3](/*resource*/ ctx[8]).img_alt);
    			attr_dev(img1, "class", "svelte-uy90r0");
    			add_location(img1, file$4, 82, 16, 3049);
    			attr_dev(div1, "class", "bars svelte-uy90r0");
    			add_location(div1, file$4, 83, 16, 3186);
    			attr_dev(div2, "class", "bottom svelte-uy90r0");
    			add_location(div2, file$4, 81, 12, 3011);
    			attr_dev(div3, "class", "resource svelte-uy90r0");
    			add_location(div3, file$4, 76, 8, 2624);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, p);
    			append_dev(p, a);
    			append_dev(a, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			mount_component(bars0, div1, null);
    			append_dev(div1, t4);
    			mount_component(bars1, div1, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*presentingResources*/ 2 && !src_url_equal(img0.src, img0_src_value = /*assignImgAttrForResourceType*/ ctx[2](/*resource*/ ctx[8]).img_src)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (!current || dirty & /*presentingResources*/ 2 && img0_alt_value !== (img0_alt_value = /*assignImgAttrForResourceType*/ ctx[2](/*resource*/ ctx[8]).img_alt)) {
    				attr_dev(img0, "alt", img0_alt_value);
    			}

    			if ((!current || dirty & /*presentingResources*/ 2) && t1_value !== (t1_value = /*resource*/ ctx[8].resourceName + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*presentingResources*/ 2 && a_href_value !== (a_href_value = /*resource*/ ctx[8].webLink)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*presentingResources*/ 2 && !src_url_equal(img1.src, img1_src_value = /*assignImgAttrForfreeResource*/ ctx[3](/*resource*/ ctx[8]).img_src)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (!current || dirty & /*presentingResources*/ 2 && img1_alt_value !== (img1_alt_value = /*assignImgAttrForfreeResource*/ ctx[3](/*resource*/ ctx[8]).img_alt)) {
    				attr_dev(img1, "alt", img1_alt_value);
    			}

    			const bars0_changes = {};
    			if (dirty & /*presentingResources*/ 2) bars0_changes.steps = /*resource*/ ctx[8].coverageMeasure;
    			bars0.$set(bars0_changes);
    			const bars1_changes = {};
    			if (dirty & /*presentingResources*/ 2) bars1_changes.steps = /*resource*/ ctx[8].depthMeasure;
    			bars1.$set(bars1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bars0.$$.fragment, local);
    			transition_in(bars1.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { y: 200, duration: 500 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bars0.$$.fragment, local);
    			transition_out(bars1.$$.fragment, local);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { y: 200, duration: 500 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(bars0);
    			destroy_component(bars1);
    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(76:4) {#each presentingResources as resource (resource.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let div;
    	let buttons;
    	let current;
    	let each_value = /*presentingResources*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*resource*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	buttons = new Buttons({
    			props: { cardStatus: /*cardStatus*/ ctx[0] },
    			$$inline: true
    		});

    	buttons.$on("ShowContent", /*ToggleShowContent*/ ctx[4]);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			create_component(buttons.$$.fragment);
    			attr_dev(div, "class", "showButton");
    			add_location(div, file$4, 90, 4, 3439);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(buttons, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*presentingResources, assignImgAttrForfreeResource, assignImgAttrForResourceType*/ 14) {
    				each_value = /*presentingResources*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, t.parentNode, outro_and_destroy_block, create_each_block$1, t, get_each_context$1);
    				check_outros();
    			}

    			const buttons_changes = {};
    			if (dirty & /*cardStatus*/ 1) buttons_changes.cardStatus = /*cardStatus*/ ctx[0];
    			buttons.$set(buttons_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(buttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(buttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(buttons);
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
    	let presentingResources;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Resource', slots, []);
    	let { resourceInfo } = $$props;
    	let { cardStatus = 'more' } = $$props;
    	let img_src = ''; //shld we use export ? --> No, confine these components to local (Resource level)
    	let img_alt = ''; //shld we use export ? -->  No, confine these components to local (Resource level)

    	const assignImgAttrForResourceType = resource => {
    		let msg = '';

    		if (resource.resourceType === 'book') {
    			msg = { img_src: 'img/book.svg', img_alt: 'book' };
    			return msg;
    		} else if (resource.resourceType === 'text') {
    			msg = {
    				img_src: 'img/article.svg',
    				img_alt: 'text'
    			};

    			return msg;
    		} else if (resource.resourceType === 'video') {
    			msg = {
    				img_src: 'img/course.svg',
    				img_alt: 'video'
    			};

    			return msg;
    		} else if (resource.freeResource) {
    			msg = {
    				img_src: 'img/icons8-free-67.png',
    				img_alt: 'free'
    			};

    			return msg;
    		}
    	};

    	const assignImgAttrForfreeResource = resource => {
    		let msg = '';

    		if (!resource.freeResource) {
    			img_src = 'img/dollar.svg';
    			img_alt = 'dollar';
    			msg = { img_src, img_alt };
    			return msg;
    		} else {
    			img_src = 'img/free.svg';
    			img_alt = 'free';
    			msg = { img_src, img_alt };
    			return msg;
    		}
    	};

    	const ToggleShowContent = e => {
    		console.log('entered ToggleShowContent');
    		console.log(e.detail);

    		if (e.detail === 'less') {
    			$$invalidate(1, presentingResources = presentingResources.slice(0, 3));
    			console.log("less >", presentingResources);
    			$$invalidate(0, cardStatus = 'more');
    		} else if (e.detail === 'more') {
    			$$invalidate(1, presentingResources = resourceInfo);
    			console.log("more >", presentingResources);
    			$$invalidate(0, cardStatus = 'less');
    		}
    	};

    	const writable_props = ['resourceInfo', 'cardStatus'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Resource> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('resourceInfo' in $$props) $$invalidate(5, resourceInfo = $$props.resourceInfo);
    		if ('cardStatus' in $$props) $$invalidate(0, cardStatus = $$props.cardStatus);
    	};

    	$$self.$capture_state = () => ({
    		Bars,
    		Buttons,
    		fade,
    		fly,
    		resourceInfo,
    		cardStatus,
    		img_src,
    		img_alt,
    		assignImgAttrForResourceType,
    		assignImgAttrForfreeResource,
    		ToggleShowContent,
    		presentingResources
    	});

    	$$self.$inject_state = $$props => {
    		if ('resourceInfo' in $$props) $$invalidate(5, resourceInfo = $$props.resourceInfo);
    		if ('cardStatus' in $$props) $$invalidate(0, cardStatus = $$props.cardStatus);
    		if ('img_src' in $$props) img_src = $$props.img_src;
    		if ('img_alt' in $$props) img_alt = $$props.img_alt;
    		if ('presentingResources' in $$props) $$invalidate(1, presentingResources = $$props.presentingResources);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*resourceInfo*/ 32) {
    			console.log('resourceInfo:', resourceInfo);
    		}

    		if ($$self.$$.dirty & /*resourceInfo*/ 32) {
    			// let slicedResources = resourceInfo.slice(0,3);
    			// console.log('SLICEDRESOURCES:', slicedResources);
    			// let slicedResources = resourceInfo.slice(0,3);
    			// let slicedResources = $SlicedCardStore;
    			// $: console.log('sliced res',slicedResources);
    			$$invalidate(1, presentingResources = resourceInfo.slice(0, 3));
    		}
    	};

    	return [
    		cardStatus,
    		presentingResources,
    		assignImgAttrForResourceType,
    		assignImgAttrForfreeResource,
    		ToggleShowContent,
    		resourceInfo
    	];
    }

    class Resource extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { resourceInfo: 5, cardStatus: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resource",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*resourceInfo*/ ctx[5] === undefined && !('resourceInfo' in props)) {
    			console_1$1.warn("<Resource> was created without expected prop 'resourceInfo'");
    		}
    	}

    	get resourceInfo() {
    		throw new Error("<Resource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resourceInfo(value) {
    		throw new Error("<Resource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cardStatus() {
    		throw new Error("<Resource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardStatus(value) {
    		throw new Error("<Resource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\shared\Card.svelte generated by Svelte v3.50.1 */
    const file$3 = "src\\shared\\Card.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let t0_value = /*cardDetails*/ ctx[0].skill + "";
    	let t0;
    	let t1;
    	let bars;
    	let t2;
    	let p;
    	let t3_value = /*cardDetails*/ ctx[0].desc + "";
    	let t3;
    	let t4;
    	let div1;
    	let resource;
    	let current;

    	bars = new Bars({
    			props: {
    				label: 'essentiality',
    				steps: /*cardDetails*/ ctx[0].essentialityMeasure
    			},
    			$$inline: true
    		});

    	resource = new Resource({
    			props: {
    				resourceInfo: /*cardDetails*/ ctx[0].resouceList
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(bars.$$.fragment);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			create_component(resource.$$.fragment);
    			attr_dev(h3, "class", "heading");
    			add_location(h3, file$3, 14, 8, 381);
    			attr_dev(p, "class", "svelte-11durcg");
    			add_location(p, file$3, 16, 8, 515);
    			attr_dev(div0, "class", "main svelte-11durcg");
    			add_location(div0, file$3, 13, 4, 353);
    			attr_dev(div1, "class", "resource svelte-11durcg");
    			add_location(div1, file$3, 18, 4, 558);
    			attr_dev(div2, "class", "card svelte-11durcg");
    			add_location(div2, file$3, 12, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(div0, t1);
    			mount_component(bars, div0, null);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			mount_component(resource, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*cardDetails*/ 1) && t0_value !== (t0_value = /*cardDetails*/ ctx[0].skill + "")) set_data_dev(t0, t0_value);
    			const bars_changes = {};
    			if (dirty & /*cardDetails*/ 1) bars_changes.steps = /*cardDetails*/ ctx[0].essentialityMeasure;
    			bars.$set(bars_changes);
    			if ((!current || dirty & /*cardDetails*/ 1) && t3_value !== (t3_value = /*cardDetails*/ ctx[0].desc + "")) set_data_dev(t3, t3_value);
    			const resource_changes = {};
    			if (dirty & /*cardDetails*/ 1) resource_changes.resourceInfo = /*cardDetails*/ ctx[0].resouceList;
    			resource.$set(resource_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bars.$$.fragment, local);
    			transition_in(resource.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bars.$$.fragment, local);
    			transition_out(resource.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(bars);
    			destroy_component(resource);
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
    	validate_slots('Card', slots, []);
    	let { cardDetails = {} } = $$props;
    	let resourceInfo;
    	const writable_props = ['cardDetails'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('cardDetails' in $$props) $$invalidate(0, cardDetails = $$props.cardDetails);
    	};

    	$$self.$capture_state = () => ({
    		Bars,
    		Resource,
    		Buttons,
    		cardDetails,
    		CardStore,
    		fade,
    		scale,
    		slide,
    		resourceInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ('cardDetails' in $$props) $$invalidate(0, cardDetails = $$props.cardDetails);
    		if ('resourceInfo' in $$props) resourceInfo = $$props.resourceInfo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cardDetails];
    }

    class Card$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { cardDetails: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get cardDetails() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardDetails(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\shared\card.svelte generated by Svelte v3.50.1 */
    const file$2 = "src\\shared\\card.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let t0_value = /*cardDetails*/ ctx[0].skill + "";
    	let t0;
    	let t1;
    	let bars;
    	let t2;
    	let p;
    	let t3_value = /*cardDetails*/ ctx[0].desc + "";
    	let t3;
    	let t4;
    	let div1;
    	let resource;
    	let current;

    	bars = new Bars({
    			props: {
    				label: 'essentiality',
    				steps: /*cardDetails*/ ctx[0].essentialityMeasure
    			},
    			$$inline: true
    		});

    	resource = new Resource({
    			props: {
    				resourceInfo: /*cardDetails*/ ctx[0].resouceList
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(bars.$$.fragment);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			create_component(resource.$$.fragment);
    			attr_dev(h3, "class", "heading");
    			add_location(h3, file$2, 14, 8, 381);
    			attr_dev(p, "class", "svelte-11durcg");
    			add_location(p, file$2, 16, 8, 515);
    			attr_dev(div0, "class", "main svelte-11durcg");
    			add_location(div0, file$2, 13, 4, 353);
    			attr_dev(div1, "class", "resource svelte-11durcg");
    			add_location(div1, file$2, 18, 4, 558);
    			attr_dev(div2, "class", "card svelte-11durcg");
    			add_location(div2, file$2, 12, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(div0, t1);
    			mount_component(bars, div0, null);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			mount_component(resource, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*cardDetails*/ 1) && t0_value !== (t0_value = /*cardDetails*/ ctx[0].skill + "")) set_data_dev(t0, t0_value);
    			const bars_changes = {};
    			if (dirty & /*cardDetails*/ 1) bars_changes.steps = /*cardDetails*/ ctx[0].essentialityMeasure;
    			bars.$set(bars_changes);
    			if ((!current || dirty & /*cardDetails*/ 1) && t3_value !== (t3_value = /*cardDetails*/ ctx[0].desc + "")) set_data_dev(t3, t3_value);
    			const resource_changes = {};
    			if (dirty & /*cardDetails*/ 1) resource_changes.resourceInfo = /*cardDetails*/ ctx[0].resouceList;
    			resource.$set(resource_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bars.$$.fragment, local);
    			transition_in(resource.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bars.$$.fragment, local);
    			transition_out(resource.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(bars);
    			destroy_component(resource);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	let { cardDetails = {} } = $$props;
    	let resourceInfo;
    	const writable_props = ['cardDetails'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('cardDetails' in $$props) $$invalidate(0, cardDetails = $$props.cardDetails);
    	};

    	$$self.$capture_state = () => ({
    		Bars,
    		Resource,
    		Buttons,
    		cardDetails,
    		CardStore,
    		fade,
    		scale,
    		slide,
    		resourceInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ('cardDetails' in $$props) $$invalidate(0, cardDetails = $$props.cardDetails);
    		if ('resourceInfo' in $$props) resourceInfo = $$props.resourceInfo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cardDetails];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { cardDetails: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get cardDetails() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cardDetails(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CardList.svelte generated by Svelte v3.50.1 */

    const { console: console_1 } = globals;

    const file$1 = "src\\components\\CardList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (17:4) {#each copiedCardStore as cardDetails (cardDetails.id)}
    function create_each_block(key_1, ctx) {
    	let div2;
    	let div0;
    	let card;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let current;

    	card = new Card({
    			props: { cardDetails: /*cardDetails*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(card.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			img = element("img");
    			t1 = space();

    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*cardDetails*/ ctx[4].id % 2 === 0
    			? "card even"
    			: "card odd") + " svelte-jdgga5"));

    			add_location(div0, file$1, 18, 12, 559);
    			attr_dev(img, "class", "mx-auto w-4/6 svelte-jdgga5");

    			if (!src_url_equal(img.src, img_src_value = /*cardDetails*/ ctx[4].id % 2 === 0
    			? /*connectingImgLeft*/ ctx[2]
    			: /*connectingImgRight*/ ctx[1])) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "alt", "connectingImg");
    			add_location(img, file$1, 22, 16, 757);
    			attr_dev(div1, "class", "connectingImg");
    			add_location(div1, file$1, 21, 12, 712);
    			attr_dev(div2, "class", "listBody svelte-jdgga5");
    			add_location(div2, file$1, 17, 8, 523);
    			this.first = div2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(card, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div2, t1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const card_changes = {};
    			if (dirty & /*copiedCardStore*/ 1) card_changes.cardDetails = /*cardDetails*/ ctx[4];
    			card.$set(card_changes);

    			if (!current || dirty & /*copiedCardStore*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*cardDetails*/ ctx[4].id % 2 === 0
    			? "card even"
    			: "card odd") + " svelte-jdgga5"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*copiedCardStore*/ 1 && !src_url_equal(img.src, img_src_value = /*cardDetails*/ ctx[4].id % 2 === 0
    			? /*connectingImgLeft*/ ctx[2]
    			: /*connectingImgRight*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(17:4) {#each copiedCardStore as cardDetails (cardDetails.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*copiedCardStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*cardDetails*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "cardList svelte-jdgga5");
    			add_location(div, file$1, 15, 0, 430);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*copiedCardStore, connectingImgLeft, connectingImgRight*/ 7) {
    				each_value = /*copiedCardStore*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let copiedCardStore;
    	let $CardStoreWrite;
    	validate_store(CardStoreWrite, 'CardStoreWrite');
    	component_subscribe($$self, CardStoreWrite, $$value => $$invalidate(3, $CardStoreWrite = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CardList', slots, []);
    	let connectingImgRight = 'img/curve-right.svg';
    	let connectingImgLeft = 'img/curve-left.svg';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<CardList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Card,
    		CardStoreWrite,
    		connectingImgRight,
    		connectingImgLeft,
    		copiedCardStore,
    		$CardStoreWrite
    	});

    	$$self.$inject_state = $$props => {
    		if ('connectingImgRight' in $$props) $$invalidate(1, connectingImgRight = $$props.connectingImgRight);
    		if ('connectingImgLeft' in $$props) $$invalidate(2, connectingImgLeft = $$props.connectingImgLeft);
    		if ('copiedCardStore' in $$props) $$invalidate(0, copiedCardStore = $$props.copiedCardStore);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$CardStoreWrite*/ 8) {
    			//Variables
    			$$invalidate(0, copiedCardStore = $CardStoreWrite);
    		}

    		if ($$self.$$.dirty & /*copiedCardStore*/ 1) {
    			console.log(copiedCardStore);
    		}
    	};

    	return [copiedCardStore, connectingImgRight, connectingImgLeft, $CardStoreWrite];
    }

    class CardList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardList",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.50.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let p1;
    	let p2;
    	let p3;
    	let p4;
    	let t5;
    	let filters;
    	let t6;
    	let cardlist;
    	let current;
    	filters = new Filters({ $$inline: true });
    	cardlist = new CardList({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Awesome Data Engineering";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Learning path and resources to become a data engineer";
    			p1 = element("p");
    			p2 = element("p");
    			p2.textContent = "Best books, best courses and best articles on each subject.";
    			p3 = element("p");
    			p4 = element("p");
    			p4.textContent = "How to read it: First, not every subject is required to master. Look for the \"essentiality\" measure. Then, each resource standalone for its measurements. \"coverage\" and \"depth\" are relative to the subject of the specific resource, not the entire category.";
    			t5 = space();
    			create_component(filters.$$.fragment);
    			t6 = space();
    			create_component(cardlist.$$.fragment);
    			attr_dev(h1, "class", "svelte-16drm1b");
    			add_location(h1, file, 9, 1, 248);
    			attr_dev(p0, "class", "step_1 svelte-16drm1b");
    			add_location(p0, file, 10, 1, 284);
    			add_location(p1, file, 10, 72, 355);
    			attr_dev(p2, "class", "step_2 svelte-16drm1b");
    			add_location(p2, file, 11, 1, 361);
    			add_location(p3, file, 11, 78, 438);
    			attr_dev(p4, "class", "step_3 svelte-16drm1b");
    			add_location(p4, file, 12, 1, 444);
    			attr_dev(main, "class", "svelte-16drm1b");
    			add_location(main, file, 8, 0, 239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(main, p1);
    			append_dev(main, p2);
    			append_dev(main, p3);
    			append_dev(main, p4);
    			append_dev(main, t5);
    			mount_component(filters, main, null);
    			append_dev(main, t6);
    			mount_component(cardlist, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filters.$$.fragment, local);
    			transition_in(cardlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filters.$$.fragment, local);
    			transition_out(cardlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(filters);
    			destroy_component(cardlist);
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
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Filters, Bars, Card: Card$1, CardList });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
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

})();
//# sourceMappingURL=bundle.js.map
