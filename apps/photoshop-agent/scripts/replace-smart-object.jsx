// =====================================================================
// replace-smart-object.jsx — replaces a Smart Object layer's contents and
// re-fits it to the recorded placeholder bounds (cover-fit + center).
//
// Also usable as a library: WPS_REPLACE.findAndReplace(doc, name, file, bounds)
// =====================================================================

/* global app, File, ActionDescriptor, DialogModes,
   charIDToTypeID, stringIDToTypeID, AnchorPosition, WPS */

var WPS_REPLACE = (function () {

    function findLayer(container, name) {
        for (var i = 0; i < container.artLayers.length; i++) {
            if (container.artLayers[i].name === name) return container.artLayers[i];
        }
        for (var s = 0; s < container.layerSets.length; s++) {
            var found = findLayer(container.layerSets[s], name);
            if (found) return found;
        }
        return null;
    }

    /** The canonical Photoshop Smart Object replacement (Action Manager). */
    function replaceContents(layer, filePath) {
        var desc = new ActionDescriptor();
        desc.putPath(charIDToTypeID("null"), new File(filePath));
        executeAction(stringIDToTypeID("placedLayerReplaceContents"), desc, DialogModes.NO);
    }

    /** Cover-fit + center a layer into a pixel rect. */
    function fitToRect(layer, rect) {
        var b = layer.bounds;
        var curW = WPS.px(b[2]) - WPS.px(b[0]);
        var curH = WPS.px(b[3]) - WPS.px(b[1]);
        var tgtW = rect.right - rect.left;
        var tgtH = rect.bottom - rect.top;
        if (curW <= 0 || curH <= 0) return;
        var scale = Math.max(tgtW / curW, tgtH / curH) * 100; // cover
        layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);
        b = layer.bounds;
        var cX = (WPS.px(b[0]) + WPS.px(b[2])) / 2;
        var cY = (WPS.px(b[1]) + WPS.px(b[3])) / 2;
        var tX = (rect.left + rect.right) / 2;
        var tY = (rect.top + rect.bottom) / 2;
        layer.translate(Math.round(tX - cX), Math.round(tY - cY));
    }

    function findAndReplace(doc, layerName, filePath, rect) {
        var layer = findLayer(doc, layerName);
        if (!layer) return null;
        doc.activeLayer = layer;
        var desc = new ActionDescriptor();
        desc.putPath(charIDToTypeID("null"), new File(filePath));
        executeAction(stringIDToTypeID("placedLayerReplaceContents"), desc, DialogModes.NO);
        if (rect) fitToRect(layer, rect);
        return layer;
    }

    return {
        findLayer: findLayer,
        replaceContents: replaceContents,
        fitToRect: fitToRect,
        findAndReplace: findAndReplace
    };
})();

(function () {
    var P = WPS.params();
    app.displayDialogs = DialogModes.NO;

    if (WPS.BOOT.scriptName !== "replace-smart-object.jsx") {
        return; // used as a library (see WPS_REPLACE)
    }

    var doc = app.activeDocument;
    var layer = WPS_REPLACE.findAndReplace(doc, P.layerName, P.replaceFilePath, P.bounds);
    if (!layer) {
        WPS.fail("JSX_ERROR", "Smart Object layer not found: " + P.layerName);
        return;
    }
    if (P.save) doc.save();
    WPS.ok([]);
})();


