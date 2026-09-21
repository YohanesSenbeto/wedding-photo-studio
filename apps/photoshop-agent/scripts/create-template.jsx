// =====================================================================
// create-template.jsx — album page template builder (ES3 library + main).
//
// Builds a professional wedding page in ADOBE PHOTOSHOP:
//   DESIGN   — Background, Flowers, Light Effects, Frames, Decorations
//   PHOTOS   — PHOTO 01..NN as Smart Objects (placeholders)
//   TEXT     — Names, Wedding Date, Location, Caption, Title
// and saves:
//   <savePath>.psd   (template document)
//   <specPath>       (spec JSON: slot rects + layer names)
//
// The WPS_TEMPLATE library is reused by create-album.jsx.
// =====================================================================

/* global app, File, Folder, NewDocumentMode, DocumentFill, LayerKind,
   UnitValue, SaveOptions, SolidColor, JPEGSaveOptions, PhotoshopSaveOptions,
   WPS, WPS_REPLACE */

var WPS_TEMPLATE = (function () {

    var COLORS = {
        ivory: [247, 243, 236],
        gold: [201, 162, 74],
        softGold: [222, 196, 128],
        rose: [219, 178, 186],
        charcoal: [34, 34, 40],
        white: [255, 255, 255],
        placeholder: [217, 217, 219]
    };

    function solid(triple) {
        var c = new SolidColor();
        c.rgb.red = triple[0];
        c.rgb.green = triple[1];
        c.rgb.blue = triple[2];
        return c;
    }

    function rectFromSlot(slot, pageW, pageH) {
        return {
            left: Math.round(slot.x / 100 * pageW),
            top: Math.round(slot.y / 100 * pageH),
            right: Math.round((slot.x + slot.w) / 100 * pageW),
            bottom: Math.round((slot.y + slot.h) / 100 * pageH)
        };
    }

    function fillRect(doc, rect, triple) {
        var sel = doc.selection;
        sel.select([
            [rect.left, rect.top],
            [rect.right, rect.top],
            [rect.right, rect.bottom],
            [rect.left, rect.bottom]
        ]);
        sel.fill(solid(triple), 100, false);
        sel.deselect();
    }

    /** Soft feathered ellipse (36-point polygon approximation). */
    function glow(doc, cx, cy, rx, ry, triple, opacity, feather) {
        var layer = doc.artLayers.add();
        var sel = doc.selection;
        var points = [];
        for (var a = 0; a <= 36; a++) {
            var angle = (a / 36) * Math.PI * 2;
            points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
        }
        sel.select(points);
        if (feather > 0) sel.feather(feather);
        sel.fill(solid(triple), 100, false);
        sel.deselect();
        layer.opacity = opacity;
        return layer;
    }

    function addText(doc, group, layerName, contents, sizePx, x, y, triple, bold) {
        var layer = group.artLayers.add();
        layer.kind = LayerKind.TEXT;
        layer.name = layerName;
        var item = layer.textItem;
        item.contents = String(contents);
        item.size = new UnitValue(sizePx, "px");
        item.position = [new UnitValue(x, "px"), new UnitValue(y, "px")];
        item.color = solid(triple);
        try {
            item.font = bold ? "Georgia-Bold" : "Georgia";
        } catch (e) {
            $.writeln("[WPS] font not available, keeping default: " + e);
        }
        return layer;
    }

    // __PART2__

    function buildBackground(doc, w, h, design) {
        // Background — warm ivory base
        var bg = design.artLayers.add();
        bg.name = "Background";
        fillRect(doc, { left: 0, top: 0, right: w, bottom: h }, COLORS.ivory);
        bg.opacity = 100;

        // Light Effects — soft warm glows in opposite corners
        var fx = design.layerSets.add();
        fx.name = "Light Effects";
        fx.artLayers.add().name = "Warm Glow TL";
        glow(doc, w * 0.18, h * 0.16, w * 0.22, h * 0.30, COLORS.softGold, 12, Math.round(w * 0.05));
        fx.artLayers.add().name = "Warm Glow BR";
        glow(doc, w * 0.82, h * 0.85, w * 0.20, h * 0.28, COLORS.softGold, 10, Math.round(w * 0.05));

        // Flowers — soft rose accents in the corners
        var flowers = design.layerSets.add();
        flowers.name = "Flowers";
        glow(doc, w * 0.06, h * 0.08, w * 0.05, h * 0.07, COLORS.rose, 30, Math.round(w * 0.02));
        glow(doc, w * 0.10, h * 0.05, w * 0.03, h * 0.045, COLORS.rose, 22, Math.round(w * 0.015));
        glow(doc, w * 0.94, h * 0.92, w * 0.045, h * 0.065, COLORS.rose, 30, Math.round(w * 0.02));
        glow(doc, w * 0.90, h * 0.95, w * 0.028, h * 0.04, COLORS.rose, 22, Math.round(w * 0.015));

        // Decorations — gold dots along the bottom
        var deco = design.layerSets.add();
        deco.name = "Decorations";
        var dotGap = w * 0.04;
        for (var dx = w * 0.5 - dotGap * 2; dx <= w * 0.5 + dotGap * 2 + 1; dx += dotGap) {
            glow(doc, dx, h * 0.955, w * 0.0035, w * 0.0035, COLORS.gold, 65, Math.round(w * 0.001));
        }

        // Frames — double gold frame (outer ring + inner hairlines)
        var frames = design.layerSets.add();
        frames.name = "Frames";
        var margin = Math.round(w * 0.035);
        var thick = Math.max(2, Math.round(w * 0.0018));
        fillRect(doc, { left: margin, top: margin, right: w - margin, bottom: h - margin }, COLORS.gold);
        fillRect(doc, {
            left: margin + thick * 3, top: margin + thick * 3,
            right: w - margin - thick * 3, bottom: h - margin - thick * 3
        }, COLORS.ivory);
        fillRect(doc, {
            left: margin + thick * 6, top: margin + thick * 6,
            right: w - margin - thick * 6, bottom: margin + thick * 6 + thick
        }, COLORS.gold);
        fillRect(doc, {
            left: margin + thick * 6, top: h - margin - thick * 7,
            right: w - margin - thick * 6, bottom: h - margin - thick * 6
        }, COLORS.gold);
    }

    function slotLayerName(index) {
        return "PHOTO " + (index < 9 ? "0" : "") + (index + 1);
    }

    /** Small solid placeholder image (a real file, so doc.place() works). */
    function createPlaceholder(rect, tempDir, index) {
        var maxSide = 600;
        var rw = rect.right - rect.left;
        var rh = rect.bottom - rect.top;
        var pw = rw >= rh ? maxSide : Math.max(2, Math.round(maxSide * rw / rh));
        var ph = rh > rw ? maxSide : Math.max(2, Math.round(maxSide * rh / rw));
        var doc = app.documents.add(pw, ph, 72, "placeholder", NewDocumentMode.RGB, DocumentFill.WHITE);
        fillRect(doc, { left: 0, top: 0, right: pw, bottom: ph }, COLORS.placeholder);
        var folder = WPS.ensureFolder(tempDir);
        var file = new File(folder.fsName + "/placeholder_" + index + ".jpg");
        var options = new JPEGSaveOptions();
        options.quality = 8;
        doc.saveAs(file, options, true);
        doc.close(SaveOptions.DONOTSAVECHANGES);
        return file;
    }

    // __PART3__

    /**
     * Build a full album page document.
     * spec = { templateKey, title, width, height, dpi,
     *          slots: [{x,y,w,h}] percent rects,
     *          photos: [filePath|null per slot],
     *          texts: {names, date, location, caption, title},
     *          tempDir }
     * Returns { doc, specOut } — specOut records px rects + layer names so
     * Smart Object contents can be replaced later without redesigning.
     */
    function buildPage(spec) {
        var w = spec.width;
        var h = spec.height;
        var doc = app.documents.add(w, h, spec.dpi || 300, spec.templateKey, NewDocumentMode.RGB, DocumentFill.WHITE);

        var design = doc.layerSets.add();
        design.name = "DESIGN";
        buildBackground(doc, w, h, design);

        doc.layerSets.add().name = "PHOTOS";
        var photos = doc.layerSets.getByName("PHOTOS");

        var specOut = {
            templateKey: spec.templateKey,
            title: spec.title,
            width: w,
            height: h,
            slots: [],
            textLayers: []
        };

        for (var i = 0; i < spec.slots.length; i++) {
            var rect = rectFromSlot(spec.slots[i], w, h);
            var layerName = slotLayerName(i);
            var photoPath = (spec.photos && spec.photos[i]) || null;
            var tempPath = photoPath || createPlaceholder(rect, spec.tempDir, i).fsName;

            // place() creates a Smart Object layer (PHOTOS must be Smart Objects).
            doc.place(new File(tempPath));
            var placed = doc.activeLayer;
            placed.name = layerName;
            WPS_REPLACE.fitToRect(placed, rect);
            // With a pre-matched aspect ratio, cover-fit == exact fit.

            specOut.slots.push({
                index: i,
                layerName: layerName,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom
            });
        }

        var text = doc.layerSets.add();
        text.name = "TEXT";
        var texts = spec.texts || {};
        var sizeBase = w;
        var compact = spec.slots.length > 2;

        addText(doc, text, "TEXT_NAMES", texts.names || "NAMES", Math.round(sizeBase * 0.045), w / 2, h * (compact ? 0.10 : 0.14), COLORS.charcoal, true);
        addText(doc, text, "TEXT_DATE", texts.date || "", Math.round(sizeBase * 0.020), w / 2, h * (compact ? 0.155 : 0.20), COLORS.gold, false);
        addText(doc, text, "TEXT_LOCATION", texts.location || "", Math.round(sizeBase * 0.016), w / 2, h * (compact ? 0.185 : 0.24), COLORS.charcoal, false);
        addText(doc, text, "TEXT_CAPTION", texts.caption || "", Math.round(sizeBase * 0.014), w / 2, h * 0.93, COLORS.charcoal, false);
        addText(doc, text, "TEXT_TITLE", texts.title || spec.title, Math.round(sizeBase * 0.012), w / 2, h * 0.955, COLORS.gold, false);

        specOut.textLayers = [
            { layerName: "TEXT_NAMES", contents: texts.names || "NAMES" },
            { layerName: "TEXT_DATE", contents: texts.date || "" },
            { layerName: "TEXT_LOCATION", contents: texts.location || "" },
            { layerName: "TEXT_CAPTION", contents: texts.caption || "" },
            { layerName: "TEXT_TITLE", contents: texts.title || spec.title }
        ];

        return { doc: doc, specOut: specOut };
    }

    function updateTextLayer(doc, layerName, contents) {
        var layer = WPS_REPLACE.findLayer(doc, layerName);
        if (layer && layer.kind === LayerKind.TEXT) {
            layer.textItem.contents = String(contents);
        }
    }

    return {
        COLORS: COLORS,
        rectFromSlot: rectFromSlot,
        buildBackground: buildBackground,
        buildPage: buildPage,
        createPlaceholder: createPlaceholder,
        addText: addText,
        updateTextLayer: updateTextLayer,
        slotLayerName: slotLayerName,
        glow: glow,
        fillRect: fillRect
    };
})();

// ---------------------------------------------------------------------
// Main — only when this file is the bootstrapped script.
// ---------------------------------------------------------------------
if (WPS.BOOT.scriptName === "create-template.jsx") {
    (function () {
        var P = WPS.params();
        app.displayDialogs = DialogModes.NO;

        WPS.progress(20, "EDITING", "Building template " + P.templateKey);
        var texts = P.texts || {};
        var names = "";
        if (texts.groomName) names += texts.groomName;
        if (texts.groomName && texts.brideName) names += " & ";
        if (texts.brideName) names += texts.brideName;

        var built = WPS_TEMPLATE.buildPage({
            templateKey: P.templateKey,
            title: P.title || P.templateKey,
            width: P.width || 3508,
            height: P.height || 2480,
            dpi: P.dpi || 300,
            slots: P.slots || [{ x: 8, y: 8, w: 84, h: 84 }],
            photos: null,
            texts: {
                names: names,
                date: texts.weddingDate || "",
                location: texts.location || "",
                caption: texts.caption || "",
                title: P.title || ""
            },
            tempDir: P.tempDir
        });

        WPS.progress(70, "EXPORTING", "Saving " + P.templateKey + ".psd");
        var saveFile = new File(P.savePath);
        built.doc.saveAs(saveFile, new PhotoshopSaveOptions(), true);
        built.doc.close(SaveOptions.DONOTSAVECHANGES);

        WPS.writeText(P.specPath, WPS.stringify(built.specOut));
        WPS.ok([{
            fileName: saveFile.name, format: "PSD",
            width: built.specOut.width, height: built.specOut.height,
            dpi: P.dpi || 300, colorMode: "RGB"
        }]);
    })();
}

