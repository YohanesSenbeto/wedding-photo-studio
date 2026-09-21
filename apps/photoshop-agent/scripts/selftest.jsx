// =====================================================================
// selftest.jsx — Photoshop pipeline self-test (README §26).
//
// 1. Creates a test JPG inside Photoshop.
// 2. Opens it and applies the preset pipeline (real adjustments).
// 3. Saves a PSD.
// 4. Exports a JPG.
// 5. Verifies both files exist — failures are reported, never faked.
// =====================================================================

/* global app, File, Folder, NewDocumentMode, DocumentFill, JPEGSaveOptions,
   PhotoshopSaveOptions, SaveOptions, SolidColor, WPS, WPS_PIPELINE, WPS_EXPORT */

(function () {
    var P = WPS.params();
    app.displayDialogs = DialogModes.NO;

    // Load libraries.
    $.evalFile(new File(WPS.BOOT.scriptsDir + "/lib/pipeline.jsx"));
    $.evalFile(new File(WPS.BOOT.scriptsDir + "/lib/export-photo.jsx"));

    var dir = WPS.ensureFolder(P.outputDir);

    // ------------------------------------------------------------------
    // 1. Create a test JPG (800x600, neutral gray + white shape)
    // ------------------------------------------------------------------
    WPS.progress(10, "PROCESSING", "Creating test image");
    var doc = app.documents.add(800, 600, 72, "WPS_SELFTEST", NewDocumentMode.RGB, DocumentFill.WHITE);
    var gray = new SolidColor();
    gray.rgb.red = 128;
    gray.rgb.green = 128;
    gray.rgb.blue = 128;
    doc.selection.select([[0, 0], [800, 0], [800, 600], [0, 600]]);
    doc.selection.fill(gray, 100, false);
    doc.selection.deselect();
    var white = new SolidColor();
    white.rgb.red = 245;
    white.rgb.green = 245;
    white.rgb.blue = 245;
    doc.selection.select([[200, 150], [600, 150], [600, 450], [200, 450]]);
    doc.selection.fill(white, 100, false);
    doc.selection.deselect();

    var sourceFile = new File(dir.fsName + "/selftest_source.jpg");
    var srcOptions = new JPEGSaveOptions();
    srcOptions.quality = 10;
    doc.saveAs(sourceFile, srcOptions, true);
    doc.close(SaveOptions.DONOTSAVECHANGES);

    // ------------------------------------------------------------------
    // 2. Open + apply the preset pipeline
    // ------------------------------------------------------------------
    WPS.progress(30, "EDITING", "Applying preset pipeline");
    var reopened = app.open(sourceFile);
    var work = reopened.duplicate("WPS_SELFTEST_WORK", true);
    reopened.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = work;

    WPS_PIPELINE.runAll(work, P.presetParams || {}, function (pct, label) {
        WPS.progress(pct, "EDITING", label);
    });

    // ------------------------------------------------------------------
    // 3. + 4. Save PSD and export JPG
    // ------------------------------------------------------------------
    WPS.progress(88, "EXPORTING", "Saving PSD + exporting JPG");
    var outputs = WPS_EXPORT.buildOutputs(work, {
        outputFormats: P.outputFormats && P.outputFormats.length > 0 ? P.outputFormats : ["PSD", "JPG"],
        quality: P.quality || "HIGH",
        dpi: P.dpi || 300,
        colorMode: "RGB",
        outputDir: dir.fsName,
        outputFileBase: "selftest_edited",
        jobId: P.jobId,
        photoName: "selftest"
    });
    work.close(SaveOptions.DONOTSAVECHANGES);

    // ------------------------------------------------------------------
    // 5. Verify the files really exist (never fake success)
    // ------------------------------------------------------------------
    WPS.progress(95, "EXPORTING", "Verifying output files");
    var missing = [];
    for (var i = 0; i < outputs.length; i++) {
        var check = new File(dir.fsName + "/" + outputs[i].fileName);
        if (!check.exists) missing.push(outputs[i].fileName);
    }
    if (missing.length > 0) {
        WPS.fail("EXPORT_ERROR", "Self-test outputs missing: " + missing.join(", "));
        return;
    }

    WPS.ok(outputs, { documentWidth: 800, documentHeight: 600 });
})();
