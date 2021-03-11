var __VIRTUAL_FILE = convert;
function convert(test) {
    if (test == null) {
        return ok;
    }
    if (typeof test === "string") {
        return typeFactory(test);
    }
    if (typeof test === "object") {
        return "length" in test ? anyFactory(test) : allFactory(test);
    }
    if (typeof test === "function") {
        return test;
    }
    throw new Error("Expected function, string, or object as test");
}
function allFactory(test) {
    return all;
    function all(node) {
        var key;
        for(key in test){
            if (node[key] !== test[key]) return false;
        }
        return true;
    }
}
function anyFactory(tests) {
    var checks = [];
    var index = -1;
    while((++index) < tests.length){
        checks[index] = convert(tests[index]);
    }
    return any;
    function any() {
        var index2 = -1;
        while((++index2) < checks.length){
            if (checks[index2].apply(this, arguments)) {
                return true;
            }
        }
        return false;
    }
}
function typeFactory(test) {
    return type;
    function type(node) {
        return Boolean(node && node.type === test);
    }
}
function ok() {
    return true;
}
var color_browser = identity;
function identity(d) {
    return d;
}
var unistUtilVisitParents = visitParents;
var CONTINUE = true;
var SKIP = "skip";
var EXIT = false;
visitParents.CONTINUE = CONTINUE;
visitParents.SKIP = SKIP;
visitParents.EXIT = EXIT;
function visitParents(tree, test, visitor, reverse) {
    var step;
    var is;
    if (typeof test === "function" && typeof visitor !== "function") {
        reverse = visitor;
        visitor = test;
        test = null;
    }
    is = __VIRTUAL_FILE(test);
    step = reverse ? -1 : 1;
    factory(tree, null, [])();
    function factory(node, index, parents) {
        var value = typeof node === "object" && node !== null ? node : {
        };
        var name;
        if (typeof value.type === "string") {
            name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
            visit.displayName = "node (" + color_browser(value.type + (name ? "<" + name + ">" : "")) + ")";
        }
        return visit;
        function visit() {
            var grandparents = parents.concat(node);
            var result = [];
            var subresult;
            var offset;
            if (!test || is(node, index, parents[parents.length - 1] || null)) {
                result = toResult(visitor(node, parents));
                if (result[0] === EXIT) {
                    return result;
                }
            }
            if (node.children && result[0] !== SKIP) {
                offset = (reverse ? node.children.length : -1) + step;
                while(offset > -1 && offset < node.children.length){
                    subresult = factory(node.children[offset], offset, grandparents)();
                    if (subresult[0] === EXIT) {
                        return subresult;
                    }
                    offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
                }
            }
            return result;
        }
    }
}
function toResult(value) {
    if (value !== null && typeof value === "object" && "length" in value) {
        return value;
    }
    if (typeof value === "number") {
        return [
            CONTINUE,
            value
        ];
    }
    return [
        value
    ];
}
var unistUtilVisit = visit;
var CONTINUE1 = unistUtilVisitParents.CONTINUE;
var SKIP1 = unistUtilVisitParents.SKIP;
var EXIT1 = unistUtilVisitParents.EXIT;
visit.CONTINUE = CONTINUE1;
visit.SKIP = SKIP1;
visit.EXIT = EXIT1;
function visit(tree, test, visitor, reverse) {
    if (typeof test === "function" && typeof visitor !== "function") {
        reverse = visitor;
        visitor = test;
        test = null;
    }
    unistUtilVisitParents(tree, test, overload, reverse);
    function overload(node, parents) {
        var parent = parents[parents.length - 1];
        var index = parent ? parent.children.indexOf(node) : null;
        return visitor(node, index, parent);
    }
}
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;
var isArray = function isArray2(arr) {
    if (typeof Array.isArray === "function") {
        return Array.isArray(arr);
    }
    return toStr.call(arr) === "[object Array]";
};
var isPlainObject = function isPlainObject2(obj) {
    if (!obj || toStr.call(obj) !== "[object Object]") {
        return false;
    }
    var hasOwnConstructor = hasOwn.call(obj, "constructor");
    var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false;
    }
    var key;
    for(key in obj){
    }
    return typeof key === "undefined" || hasOwn.call(obj, key);
};
var setProperty = function setProperty2(target, options) {
    if (defineProperty && options.name === "__proto__") {
        defineProperty(target, options.name, {
            enumerable: true,
            configurable: true,
            value: options.newValue,
            writable: true
        });
    } else {
        target[options.name] = options.newValue;
    }
};
var getProperty = function getProperty2(obj, name) {
    if (name === "__proto__") {
        if (!hasOwn.call(obj, name)) {
            return void 0;
        } else if (gOPD) {
            return gOPD(obj, name).value;
        }
    }
    return obj[name];
};
var extend = function extend2() {
    var options, name, src, copy, copyIsArray, clone;
    var target = arguments[0];
    var i = 1;
    var length = arguments.length;
    var deep = false;
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {
        };
        i = 2;
    }
    if (target == null || typeof target !== "object" && typeof target !== "function") {
        target = {
        };
    }
    for(; i < length; ++i){
        options = arguments[i];
        if (options != null) {
            for(name in options){
                src = getProperty(target, name);
                copy = getProperty(options, name);
                if (target !== copy) {
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {
                            };
                        }
                        setProperty(target, {
                            name,
                            newValue: extend2(deep, clone, copy)
                        });
                    } else if (typeof copy !== "undefined") {
                        setProperty(target, {
                            name,
                            newValue: copy
                        });
                    }
                }
            }
        }
    }
    return target;
};
const behaviors = {
    prepend: "unshift",
    append: "push"
};
const contentDefaults = {
    type: "element",
    tagName: "span",
    properties: {
        className: [
            "icon",
            "icon-link"
        ]
    },
    children: []
};
const defaults = {
    behavior: "prepend",
    content: contentDefaults
};
const splice = [].splice;
let deprecationWarningIssued = false;
function attacher(options = {
}) {
    let { linkProperties , behavior , content , group  } = {
        ...defaults,
        ...options
    };
    let method;
    if (options.behaviour !== void 0) {
        if (!deprecationWarningIssued) {
            deprecationWarningIssued = true;
            console.warn("[remark-autolink-headings] Deprecation Warning: `behaviour` is a nonstandard option. Use `behavior` instead.");
        }
        behavior = options.behaviour;
    }
    if (behavior === "wrap") {
        method = wrap;
    } else if (behavior === "before" || behavior === "after") {
        method = around;
    } else {
        method = inject;
        if (!linkProperties) {
            linkProperties = {
                ariaHidden: "true",
                tabIndex: -1
            };
        }
    }
    return (tree)=>unistUtilVisit(tree, "heading", visitor)
    ;
    function visitor(node, index, parent) {
        const { data  } = node;
        const id = data && data.hProperties && data.hProperties.id;
        if (id) {
            return method(node, "#" + id, index, parent);
        }
    }
    function inject(node, url) {
        const link = create(url);
        link.data = {
            hProperties: toProps(linkProperties),
            hChildren: toChildren(content, node)
        };
        node.children[behaviors[behavior]](link);
    }
    function around(node, url, index, parent) {
        const link = create(url);
        const grouping = group ? toGrouping(group, node) : void 0;
        link.data = {
            hProperties: toProps(linkProperties),
            hChildren: toChildren(content, node)
        };
        let nodes = behavior === "before" ? [
            link,
            node
        ] : [
            node,
            link
        ];
        if (grouping) {
            grouping.children = nodes;
            nodes = grouping;
        }
        splice.apply(parent.children, [
            index,
            1
        ].concat(nodes));
        return [
            unistUtilVisit.SKIP,
            index + nodes.length
        ];
    }
    function wrap(node, url) {
        const link = create(url, node.children);
        link.data = {
            hProperties: toProps(linkProperties)
        };
        node.children = [
            link
        ];
    }
    function toProps(value) {
        return deepAssign({
        }, value);
    }
    function toNode(value, node) {
        return typeof value === "function" ? value(node) : value;
    }
    function toChildren(value, node) {
        let children = toNode(value, node);
        children = Array.isArray(children) ? children : [
            children
        ];
        return typeof value === "function" ? children : deepAssign([], children);
    }
    function toGrouping(value, node) {
        const grouping = toNode(value, node);
        const hName = grouping.tagName;
        const hProperties = grouping.properties;
        return {
            type: "heading-group",
            data: {
                hName,
                hProperties: typeof value === "function" ? deepAssign({
                }, hProperties) : hProperties
            },
            children: []
        };
    }
    function create(url, children) {
        return {
            type: "link",
            url,
            title: null,
            children: children || []
        };
    }
    function deepAssign(base, value) {
        return extend(true, base, value);
    }
}
export { attacher as default };
