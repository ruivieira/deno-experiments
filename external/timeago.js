var EN_US = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year"
];
function en_US(diff, idx) {
    if (idx === 0) return [
        "just now",
        "right now"
    ];
    var unit = EN_US[Math.floor(idx / 2)];
    if (diff > 1) unit += "s";
    return [
        diff + " " + unit + " ago",
        "in " + diff + " " + unit
    ];
}
var ZH_CN = [
    "\u79D2",
    "\u5206\u949F",
    "\u5C0F\u65F6",
    "\u5929",
    "\u5468",
    "\u4E2A\u6708",
    "\u5E74"
];
function zh_CN(diff, idx) {
    if (idx === 0) return [
        "\u521A\u521A",
        "\u7247\u523B\u540E"
    ];
    var unit = ZH_CN[~~(idx / 2)];
    return [
        diff + " " + unit + "\u524D",
        diff + " " + unit + "\u540E"
    ];
}
var Locales = {
};
var register1 = function(locale, func) {
    Locales[locale] = func;
};
var getLocale = function(locale) {
    return Locales[locale] || Locales["en_US"];
};
var SEC_ARRAY = [
    60,
    60,
    24,
    7,
    365 / 7 / 12,
    12
];
function toDate(input) {
    if (input instanceof Date) return input;
    if (!isNaN(input) || /^\d+$/.test(input)) return new Date(parseInt(input));
    input = (input || "").trim().replace(/\.\d+/, "").replace(/-/, "/").replace(/-/, "/").replace(/(\d)T(\d)/, "$1 $2").replace(/Z/, " UTC").replace(/([+-]\d\d):?(\d\d)/, " $1$2");
    return new Date(input);
}
function formatDiff(diff, localeFunc) {
    var agoIn = diff < 0 ? 1 : 0;
    diff = Math.abs(diff);
    var totalSec = diff;
    var idx = 0;
    for(; diff >= SEC_ARRAY[idx] && idx < SEC_ARRAY.length; idx++){
        diff /= SEC_ARRAY[idx];
    }
    diff = Math.floor(diff);
    idx *= 2;
    if (diff > (idx === 0 ? 9 : 1)) idx += 1;
    return localeFunc(diff, idx, totalSec)[agoIn].replace("%s", diff.toString());
}
function diffSec(date, relativeDate) {
    var relDate = relativeDate ? toDate(relativeDate) : new Date();
    return (+relDate - +toDate(date)) / 1000;
}
function nextInterval(diff) {
    var rst = 1, i = 0, d = Math.abs(diff);
    for(; diff >= SEC_ARRAY[i] && i < SEC_ARRAY.length; i++){
        diff /= SEC_ARRAY[i];
        rst *= SEC_ARRAY[i];
    }
    d = d % rst;
    d = d ? rst - d : rst;
    return Math.ceil(d);
}
var format1 = function(date, locale, opts) {
    var sec = diffSec(date, opts && opts.relativeDate);
    return formatDiff(sec, getLocale(locale));
};
var ATTR_TIMEAGO_TID = "timeago-id";
function getDateAttribute(node) {
    return node.getAttribute("datetime");
}
function setTimerId(node, timerId) {
    node.setAttribute(ATTR_TIMEAGO_TID, timerId);
}
function getTimerId(node) {
    return parseInt(node.getAttribute(ATTR_TIMEAGO_TID));
}
var TIMER_POOL = {
};
var clear = function(tid) {
    clearTimeout(tid);
    delete TIMER_POOL[tid];
};
function run(node, date, localeFunc, opts) {
    clear(getTimerId(node));
    var relativeDate = opts.relativeDate, minInterval = opts.minInterval;
    var diff = diffSec(date, relativeDate);
    node.innerText = formatDiff(diff, localeFunc);
    var tid = setTimeout(function() {
        run(node, date, localeFunc, opts);
    }, Math.min(Math.max(nextInterval(diff), minInterval || 1) * 1000, 2147483647));
    TIMER_POOL[tid] = 0;
    setTimerId(node, tid);
}
function cancel1(node) {
    if (node) clear(getTimerId(node));
    else Object.keys(TIMER_POOL).forEach(clear);
}
function render1(nodes, locale, opts) {
    var nodeList = nodes.length ? nodes : [
        nodes
    ];
    nodeList.forEach(function(node) {
        run(node, getDateAttribute(node), getLocale(locale), opts || {
        });
    });
    return nodeList;
}
register1("en_US", en_US);
register1("zh_CN", zh_CN);
export { cancel1 as cancel, format1 as format, register1 as register, render1 as render };
const __default = null;
export { __default as default };
