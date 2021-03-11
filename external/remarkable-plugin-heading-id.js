var e = 0, n = function() {
    e++;
}, r = function() {
    e = 0;
}, t = function(e2) {
    return e2.type === "heading_open";
}, i = function(e2) {
    return e2.type === "inline";
}, o = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6"
], a = function(a2) {
    var u, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
    }, c = a2.renderer.rules.heading_open, h = (u = d.targets) !== null && u !== void 0 ? u : o;
    r(), a2.renderer.rules.heading_open = function(r2, o2) {
        var a3, u2 = r2[o2];
        if (!t(u2)) throw new Error("remarkablePluginHeadingId should take heading tag token, but got" + JSON.stringify(u2));
        var l = c(r2, o2), g = r2[o2 + 1];
        if (!i(g)) throw new Error("remarkablePluginHeadingId should take text token next to heading open token, but got" + JSON.stringify(g));
        var f = (a3 = g.content) !== null && a3 !== void 0 ? a3 : "";
        return (function() {
            var r3 = "h".concat(u2.hLevel);
            if (!h.includes(r3)) return l;
            if (d.createId) {
                var t2 = l.replace(">", ' id="'.concat(d.createId(u2.hLevel, f, e), '">'));
                return n(), t2;
            }
            var i2 = l.replace(">", ' id="'.concat(f, '">'));
            return n(), i2;
        })();
    };
};
export { a as remarkablePluginHeadingId };
const __default = null;
export { __default as default };
