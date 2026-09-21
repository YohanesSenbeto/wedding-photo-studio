// =====================================================================
// edit-photo.jsx — main entry for EDIT_PHOTO jobs (run by the agent).
// Opens JPG directly / ARW through Adobe Camera Raw, applies the preset
// pipeline (REAL Photoshop adjustments) and exports PSD/TIFF/JPG.
// =====================================================================

/* global app, File, DialogModes, SaveOptions, WPS, WPS_PIPELINE, WPS_EXPORT */

(function () {
    var P = WPS.params();
    app.displayDialogs = DialogModes.NO;

    // Load the ES3 libraries (pipeline adjustments + exports).
    $.evalFile(new File(WPS.BOOT.scriptsDir + "/lib/pipeline.jsx"));
    $.evalFile(new File(WPS.BOOT.scriptsDir + "/lib/export-photo.jsx"));

    WPS.progress(15, "EDITING", "Opening " + (P.photoName || "input"));

    var inputFile = new File(P.inputPath);
    if (!inputFile.exists) {
        WPS.fail("INVALID_INPUT", "Input file not found: " + P.inputPath);
        return;
    }

    var doc;
    try {
        // ARW opens through Adobe Camera Raw. With displayDialogs=NO, ACR
        // applies its current/default develop settings; our deterministic
        // adjustments are then applied INSIDE Photoshop. Fully scripted ACR
        // develop-parameter injection is not reliably supported in PS2022
        // ExtendScript — documented limitation (README "ARW support").
        doc = app.open(inputFile);
    } catch (openError) {
        var message = String(openError);
        if (P.extension === "arw") {
            WPS.fail(/camera|raw/i.test(message) ? "ACR_UNAVAILABLE" : "INVALID_RAW",
                "Your RAW file could not be opened: " + message);
        } else {
            WPS.fail("CORRUPT_IMAGE", "The image could not be opened: " + message);
        }
        return;
    }
    if (doc === null) {
        WPS.fail("CORRUPT_IMAGE", "Photoshop could not open the file.");
        return;
    }

    var work = doc.duplicate("WPS_WORK_" + P.jobId.substring(0, 8), true);
    doc.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = work;

    WPS_PIPELINE.runAll(work, P.presetParams || {}, function (pct, label) {
        WPS.progress(pct, "EDITING", label);
    });

    WPS.progress(88, "EXPORTING", "Exporting " + P.outputFormats.join(", "));
    var outputs = WPS_EXPORT.buildOutputs(work, P);
    var wPx = WPS.px(work.width);
    var hPx = WPS.px(work.height);
    work.close(SaveOptions.DONOTSAVECHANGES);

    WPS.ok(outputs, { documentWidth: wPx, documentHeight: hPx });
})();
