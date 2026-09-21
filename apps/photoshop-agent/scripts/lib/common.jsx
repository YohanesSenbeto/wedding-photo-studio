// =====================================================================
// Wedding Photo Studio — ExtendScript common library (ES3: no JSON object,
// no modern syntax — Photoshop 2022 ExtendScript is ES3).
//
// The agent executes scripts via a bootstrap that sets `WPS_BOOTSTRAP`:
//   { paramsPath, resultPath, progressPath, scriptsDir, scriptName }
// Scripts call WPS.params(), WPS.progress(...), WPS.ok(...)/WPS.fail(...),
// then the bootstrap's WPS.finish() writes result.json for the agent.
// =====================================================================

var WPS = (function () {
    var BOOT = (typeof WPS_BOOTSTRAP !== "undefined") ? WPS_BOOTSTRAP : {
        paramsPath: "", resultPath: "", progressPath: "", scriptsDir: "", scriptName: ""
    };

    function readText(pathStr) {
        var f = new File(pathStr);
        if (!f.exists) return null;
        f.encoding = "UTF-8";
        f.open("r");
        var text = f.read();
        f.close();
        return text;
    }

    function writeText(pathStr, text) {
        var f = new File(pathStr);
        f.encoding = "UTF-8";
        f.open("w");
        f.write(text);
        f.close();
    }

    function ensureFolder(pathStr) {
        var folder = new Folder(pathStr);
        if (!folder.exists) folder.create();
        return folder;
    }

    // Minimal JSON serializer. parse() only ever consumes JSON written by the
    // LOCAL agent process (params.json) — never anything from the network.
    function pad4(hex) {
        while (hex.length < 4) hex = "0" + hex;
        return hex;
    }

    function quote(s) {
        var out = "";
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            var code = s.charCodeAt(i);
            if (ch === '"') out += '\\"';
            else if (ch === "\\") out += "\\\\";
            else if (ch === "\n") out += "\\n";
            else if (ch === "\r") out += "\\r";
            else if (ch === "\t") out += "\\t";
            else if (code < 32) out += "\\u" + pad4(code.toString(16));
            else out += ch;
        }
        return '"' + out + '"';
    }

    function stringify(value) {
        var t = typeof value;
        if (value === null || value === undefined) return "null";
        if (t === "number") return isFinite(value) ? String(value) : "null";
        if (t === "boolean") return value ? "true" : "false";
        if (t === "string") return quote(value);
        if (value instanceof Array) {
            var items = [];
            for (var i = 0; i < value.length; i++) items.push(stringify(value[i]));
            return "[" + items.join(",") + "]";
        }
        var props = [];
        for (var key in value) {
            if (value.hasOwnProperty(key)) props.push(quote(key) + ":" + stringify(value[key]));
        }
        return "{" + props.join(",") + "}";
    }

    function parse(text) {
        return eval("(" + text + ")"); // trusted local file only (see note above)
    }

    function pad2(n) { return (n < 10 ? "0" : "") + n; }

    function isoNow() {
        var d = new Date();
        return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate()) +
            "T" + pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes()) + ":" + pad2(d.getUTCSeconds()) + "Z";
    }

    var P = null;

    function params() {
        if (P === null) P = parse(readText(BOOT.paramsPath));
        return P;
    }

    function progress(jobIdOrPct, status, message) {
        var pct = jobIdOrPct;
        var jobId = params().jobId;
        if (typeof jobIdOrPct === "string") {
            jobId = jobIdOrPct;
            pct = status;
            status = message;
            message = "";
        }
        var snapshot = {
            jobId: jobId,
            status: status,
            progress: Math.round(pct),
            message: message || "",
            at: isoNow()
        };
        writeText(BOOT.progressPath, stringify(snapshot));
        $.writeln("[WPS] " + status + " " + snapshot.progress + "% " + snapshot.message);
    }

    var RESULT = null;

    function setResult(result) { RESULT = result; }

    function finish() {
        if (RESULT !== null) writeText(BOOT.resultPath, stringify(RESULT));
    }

    function ok(outputs, extra) {
        var result = { ok: true, errorCode: "", errorMessage: "", outputs: outputs || [] };
        if (extra && typeof extra.documentWidth === "number") result.documentWidth = extra.documentWidth;
        if (extra && typeof extra.documentHeight === "number") result.documentHeight = extra.documentHeight;
        for (var key in (extra || {})) {
            if (key !== "documentWidth" && key !== "documentHeight") result[key] = extra[key];
        }
        setResult(result);
    }

    function fail(code, message) {
        setResult({ ok: false, errorCode: code || "JSX_ERROR", errorMessage: message || "", outputs: [] });
        $.writeln("[WPS] FAIL " + code + ": " + message);
    }

    function num(value, fallback) { var n = Number(value); return isNaN(n) ? (fallback || 0) : n; }

    function clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    function px(unitValue) { return Math.round(unitValue.as("px")); }

    function sanitize(name) { return String(name).replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 100); }

    // Direct passthrough to params() for legacy scripts.
    function boot() { return BOOT; }

    return {
        BOOT: BOOT, params: params, progress: progress, ok: ok, fail: fail,
        setResult: setResult, finish: finish, readText: readText, writeText: writeText,
        ensureFolder: ensureFolder, stringify: stringify, parse: parse,
        num: num, clamp: clamp, px: px, sanitize: sanitize, isoNow: isoNow, boot: boot
    };
})();

// Bootstrap helpers used by the agent runner.
var WPS_BOOT = {
    paramsPath: WPS_BOOTSTRAP && WPS_BOOTSTRAP.paramsPath,
    resultPath: WPS_BOOTSTRAP && WPS_BOOTSTRAP.resultPath,
    progressPath: WPS_BOOTSTRAP && WPS_BOOTSTRAP.progressPath,
    scriptsDir: WPS_BOOTSTRAP && WPS_BOOTSTRAP.scriptsDir,
    scriptName: WPS_BOOTSTRAP && WPS_BOOTSTRAP.scriptName
};
