// =====================================================================
// lib/export-photo.jsx — PSD / TIFF / JPG export helpers (ES3 library).
//
// Quality → JPG quality mapping: WEB=8, HIGH=11, PRINT=12 (max).
// Resolution is set WITHOUT resampling (ResampleMethod.NONE) so the image
// is never degraded — only the DPI metadata changes.
// CMYK is applied ONLY on a duplicate for final print exports; the working
// document is never converted before editing (README §16).
// =====================================================================

/* global File, Folder, JPEGSaveOptions, TiffSaveOptions, PhotoshopSaveOptions,
   TIFFCompression, MatteType, Extension, ChangeMode, SaveOptions, ResampleMethod, WPS */

var WPS_EXPORT = (function () {

    function jpgQuality(quality) {
        if (quality === "WEB") return 8;
        if (quality === "HIGH") return 11;
        return 12; // PRINT
    }

    function buildOutputs(doc, options) {
        var formats = options.outputFormats || ["JPG"];
        var dir = WPS.ensureFolder(options.outputDir);
        var base = options.outputFileBase
            ? WPS.sanitize(options.outputFileBase)
            : "edited_" + WPS.sanitize(options.photoName || "photo") + "_" +
              String(options.jobId || "").substring(0, 8);
        var dpi = Math.round(WPS.num(options.dpi, 300));
        var outputs = [];

        // Set resolution metadata without resampling pixels.
        try {
            doc.resizeImage(undefined, undefined, dpi, ResampleMethod.NONE);
        } catch (e) {
            $.writeln("[WPS] resizeImage(dpi) skipped: " + e);
        }

        var wPx = WPS.px(doc.width);
        var hPx = WPS.px(doc.height);

        for (var i = 0; i < formats.length; i++) {
            var fmt = formats[i];
            if (fmt === "PSD") {
                var psdFile = new File(dir.fsName + "/" + base + ".psd");
                doc.saveAs(psdFile, new PhotoshopSaveOptions(), true);
                outputs.push({
                    fileName: psdFile.name, format: "PSD",
                    width: wPx, height: hPx, dpi: dpi, colorMode: "RGB"
                });
            } else if (fmt === "JPG") {
                var jpgFile = new File(dir.fsName + "/" + base + ".jpg");
                var jpgOptions = new JPEGSaveOptions();
                jpgOptions.quality = jpgQuality(options.quality);
                jpgOptions.embedColorProfile = true;
                jpgOptions.matte = MatteType.NONE;
                doc.saveAs(jpgFile, jpgOptions, true, Extension.LOWERCASE);
                outputs.push({
                    fileName: jpgFile.name, format: "JPG",
                    width: wPx, height: hPx, dpi: dpi, colorMode: "RGB"
                });
            } else if (fmt === "TIFF") {
                var tifFile = new File(dir.fsName + "/" + base + ".tif");
                var tifOptions = new TiffSaveOptions();
                tifOptions.imageCompression = TIFFCompression.NONE;
                tifOptions.embedColorProfile = true;
                doc.saveAs(tifFile, tifOptions, true, Extension.LOWERCASE);
                outputs.push({
                    fileName: tifFile.name, format: "TIFF",
                    width: wPx, height: hPx, dpi: dpi, colorMode: "RGB"
                });
            }
        }

        // CMYK print export — on a DUPLICATE only, never the working document.
        if (options.colorMode === "CMYK" && options.quality === "PRINT") {
            var dup = doc.duplicate(base + "_cmyk", true);
            dup.changeMode(ChangeMode.CMYK);
            var cmykFile = new File(dir.fsName + "/" + base + "_cmyk.jpg");
            var cmykJpg = new JPEGSaveOptions();
            cmykJpg.quality = 12;
            cmykJpg.embedColorProfile = true;
            dup.saveAs(cmykFile, cmykJpg, true, Extension.LOWERCASE);
            outputs.push({
                fileName: cmykFile.name, format: "JPG",
                width: wPx, height: hPx, dpi: dpi, colorMode: "CMYK"
            });
            dup.close(SaveOptions.DONOTSAVECHANGES);
        }

        return outputs;
    }

    return { buildOutputs: buildOutputs, jpgQuality: jpgQuality };
})();

if (WPS.BOOT.scriptName === "lib/export-photo.jsx") {
    WPS.fail("JSX_ERROR", "export-photo.jsx is a library");
}
