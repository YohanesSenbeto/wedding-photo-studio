// =====================================================================
// create-album.jsx — assembles the wedding album in ADOBE PHOTOSHOP.
//
// For every album page:
//   • reuses the generated template PSD when present (Smart Object slots
//     are replaced in place via placedLayerReplaceContents), or
//   • builds the page from the layout spec (and saves it as a template
//     for future runs);
//   • updates the TEXT layers (names, date, location, caption, title);
//   • exports the page (JPG / TIFF / PSD) into the job output dir.
//
// Photos are prepared with a real cover-crop to the exact slot aspect so
// Smart Object replacement never overflows its frame.
// =====================================================================

/* global app, File, Folder, ResampleMethod,
   JPEGSaveOptions, PhotoshopSaveOptions, SaveOptions, WPS, WPS_TEMPLATE,
   WPS_REPLACE, WPS_EXPORT */

var WPS_ALBUM = (function () {

    /** Cover-crop + downscale a photo to a slot's aspect; returns temp JPG. */
    function prepPhoto(srcPath, rect, tempDir, key) {
        var srcFile = new File(srcPath);
        if (!srcFile.exists) {
            throw new Error("CORRUPT_IMAGE: album photo missing: " + srcPath);
        }
        var doc = app.open(srcFile);
        var w = WPS.px(doc.width);
        var h = WPS.px(doc.height);
        var tgtW = rect.right - rect.left;
        var tgtH = rect.bottom - rect.top;
        var tgtAspect = tgtW / tgtH;
        var srcAspect = w / h;

        var cropW = w;
        var cropH = h;
        if (srcAspect > tgtAspect) cropW = Math.round(h * tgtAspect);
        else cropH = Math.round(w / tgtAspect);
        var left = Math.round((w - cropW) / 2);
        var top = Math.round((h - cropH) / 2);
        doc.crop([left, top, left + cropW, top + cropH]);

        var longTarget = Math.min(2200, Math.round(Math.max(tgtW, tgtH) * 1.35));
        var longNow = Math.max(WPS.px(doc.width), WPS.px(doc.height));
        if (longNow > longTarget) {
            var scale = longTarget / longNow;
            doc.resizeImage(
                Math.max(2, Math.round(WPS.px(doc.width) * scale)),
                Math.max(2, Math.round(WPS.px(doc.height) * scale)),
                undefined,
                ResampleMethod.BICUBIC
            );
        }

        var folder = WPS.ensureFolder(tempDir);
        var file = new File(folder.fsName + "/prep_" + key + ".jpg");
        var options = new JPEGSaveOptions();
        options.quality = 11;
        doc.saveAs(file, options, true);
        doc.close(SaveOptions.DONOTSAVECHANGES);
        return file.fsName;
    }

    function textsFor(album, page) {
        return {
            names: (album.groomName || "") + (album.groomName && album.brideName ? " & " : "") + (album.brideName || ""),
            date: album.weddingDate || "",
            location: album.location || "",
            caption: page.caption || album.caption || "",
            title: page.templateTitle || page.templateKey
        };
    }

    // __PART2__

    function updateTexts(doc, texts) {
        WPS_TEMPLATE.updateTextLayer(doc, "TEXT_NAMES", texts.names);
        WPS_TEMPLATE.updateTextLayer(doc, "TEXT_DATE", texts.date);
        WPS_TEMPLATE.updateTextLayer(doc, "TEXT_LOCATION", texts.location);
        WPS_TEMPLATE.updateTextLayer(doc, "TEXT_CAPTION", texts.caption);
        WPS_TEMPLATE.updateTextLayer(doc, "TEXT_TITLE", texts.title);
    }

    /**
     * Produce one album page document (from template or from scratch).
     * Returns { doc, usedTemplate }.
     */
    function buildPageDocument(page, album, params) {
        var pageW = page.width || 3508;
        var pageH = page.height || 2480;
        var texts = textsFor(album, page);

        // Resolve slot rects + prepared photos.
        var rects = [];
        var photos = [];
        for (var i = 0; i < page.slots.length; i++) {
            var slot = page.slots[i];
            rects.push(WPS_TEMPLATE.rectFromSlot(slot, pageW, pageH));
            var photoPath = slot.photoId && params.albumInputs[slot.photoId];
            photos.push(photoPath ? prepPhoto(photoPath, rects[i], params.tempDir, page.templateKey + "_" + i) : null);
        }

        var templateFile = new File(params.templatesDir + "/" + page.templateKey + ".psd");
        var specFile = new File(params.templatesDir + "/" + page.templateKey + ".json");

        if (templateFile.exists && specFile.exists) {
            // Reuse the generated template: replace Smart Object contents.
            var spec = WPS.parse(WPS.readText(specFile.fsName));
            var doc = app.open(templateFile);
            for (var s = 0; s < rects.length; s++) {
                if (!photos[s] || !spec.slots[s]) continue;
                WPS_REPLACE.findAndReplace(doc, spec.slots[s].layerName, photos[s], {
                    left: spec.slots[s].left,
                    top: spec.slots[s].top,
                    right: spec.slots[s].right,
                    bottom: spec.slots[s].bottom
                });
            }
            updateTexts(doc, texts);
            return { doc: doc, usedTemplate: true };
        }

        // Build from scratch and keep it as a template for next time.
        var built = WPS_TEMPLATE.buildPage({
            templateKey: page.templateKey,
            title: texts.title,
            width: pageW,
            height: pageH,
            dpi: params.dpi || 300,
            slots: page.slots,
            photos: photos,
            texts: texts,
            tempDir: params.tempDir
        });
        var folder = WPS.ensureFolder(params.templatesDir);
        var psdFile = new File(folder.fsName + "/" + page.templateKey + ".psd");
        built.doc.saveAs(psdFile, new PhotoshopSaveOptions(), true);
        WPS.writeText(folder.fsName + "/" + page.templateKey + ".json", WPS.stringify(built.specOut));
        return { doc: built.doc, usedTemplate: false };
    }

    /** Tag every output with the page's template key (server links pages). */
    function withPageKey(outputs, templateKey) {
        for (var i = 0; i < outputs.length; i++) {
            outputs[i].pageTemplateKey = templateKey;
        }
        return outputs;
    }

    return {
        prepPhoto: prepPhoto,
        buildPageDocument: buildPageDocument,
        updateTexts: updateTexts,
        textsFor: textsFor,
        withPageKey: withPageKey
    };
})();

// ---------------------------------------------------------------------
// Main — only when this file is the bootstrapped script.
// ---------------------------------------------------------------------
if (WPS.BOOT.scriptName === "create-album.jsx") {
    (function () {
        var P = WPS.params();
        app.displayDialogs = DialogModes.NO;

        var album = P.album;
        if (!album || !album.pages || album.pages.length === 0) {
            WPS.fail("JSX_ERROR", "No album pages in job payload");
            return;
        }

        var allOutputs = [];
        var total = album.pages.length;
        for (var i = 0; i < total; i++) {
            var page = album.pages[i];
            var pct = 15 + Math.round((i / total) * 70);
            WPS.progress(pct, "EDITING", "Album page " + page.templateKey + " (" + (i + 1) + "/" + total + ")");

            var built = WPS_ALBUM.buildPageDocument(page, album, {
                albumInputs: P.albumInputs || {},
                templatesDir: P.templatesDir,
                tempDir: P.tempDir,
                dpi: P.dpi
            });

            var outputs = WPS_EXPORT.buildOutputs(built.doc, {
                outputFormats: P.outputFormats,
                quality: P.quality,
                dpi: P.dpi,
                colorMode: P.colorMode,
                outputDir: P.outputDir,
                outputFileBase: "page_" + page.templateKey,
                jobId: P.jobId,
                photoName: page.templateKey
            });
            allOutputs = allOutputs.concat(WPS_ALBUM.withPageKey(outputs, page.templateKey));

            built.doc.close(SaveOptions.DONOTSAVECHANGES);
        }

        WPS.ok(allOutputs);
    })();
}