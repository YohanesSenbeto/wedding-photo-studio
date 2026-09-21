// =====================================================================
// lib/pipeline.jsx — the professional editing pipeline as reusable ES3
// functions on the ACTIVE document layer.
//
// All operations are REAL Photoshop adjustments (README §10):
//   base correction → color → detail → portrait → crop → vignette
// =====================================================================

/* global app, DialogModes, ChangeMode, BlendMode, ColorBlendMode, WPS */

var WPS_PIPELINE = (function () {

    function mapBase(work, prm) {
        var layer = work.activeLayer;

        var brightness = Math.round(WPS.num(prm.exposure, 0) * 40);
        var contrast = Math.round(WPS.num(prm.contrast, 0) * 0.6);
        if (brightness !== 0 || contrast !== 0) {
            layer.adjustBrightnessContrast(brightness, contrast, true);
        }

        // Tonal curve: blacks/shadows shape the low end, highlights/whites
        // the top end (percent values → gentle curve points).
        var curve = [
            [0, 0],
            [20, Math.round(WPS.clamp(20 + WPS.num(prm.blacks, 0) * 0.12, 0, 255))],
            [60, Math.round(WPS.clamp(60 + WPS.num(prm.shadows, 0) * 0.30, 0, 255))],
            [200, Math.round(WPS.clamp(200 + WPS.num(prm.highlights, 0) * 0.25, 0, 255))],
            [250, Math.round(WPS.clamp(250 + WPS.num(prm.whites, 0) * 0.12, 0, 255))],
            [255, 255]
        ];
        layer.adjustCurves(curve);
    }

    function mapColor(work, prm) {
        var layer = work.activeLayer;
        var temp = WPS.num(prm.temperature, 0);
        var tint = WPS.num(prm.tint, 0);
        if (temp !== 0 || tint !== 0) {
            var warm = Math.round(temp * 0.2);
            var mag = Math.round(tint * 0.2);
            // Warm → +R −B in midtones/highlights; magenta tint → −G.
            layer.adjustColorBalance([0, 0, 0], [warm, -mag, -warm], [warm, -mag, -warm], true);
        }
        var sat = WPS.num(prm.saturation, 0);
        var vib = WPS.num(prm.vibrance, 0);
        if (sat !== 0 || vib !== 0) {
            // Vibrance ≈ gentler saturation blend (the dedicated Vibrance
            // filter is not scriptable in the PS2022 DOM — documented).
            var blended = Math.round(sat * 0.6 + vib * 0.4);
            layer.adjustHueSaturation(0, blended, 0);
        }
        if (prm.blackWhite === true) {
            work.changeMode(ChangeMode.GRAYSCALE);
            work.changeMode(ChangeMode.RGB);
        }
    }

    function mapDetail(work, prm, longEdge) {
        var layer = work.activeLayer;
        var clarity = WPS.num(prm.clarity, 0);
        if (clarity !== 0) {
            layer.applyUnsharpMask(clarity * 0.25, WPS.clamp(longEdge / 40, 10, 60), 0);
        }
        var texture = WPS.num(prm.texture, 0);
        if (texture !== 0) {
            layer.applyUnsharpMask(texture * 0.2, WPS.clamp(longEdge / 120, 3, 20), 0);
        }
        var sharpness = WPS.num(prm.sharpness, 0);
        if (sharpness > 0) {
            layer.applyUnsharpMask(sharpness * 0.8, 1.2, 2);
        }
        var noiseReduction = WPS.num(prm.noiseReduction, 0);
        if (noiseReduction > 0) {
            // Surface Blur at small radius reduces noise while keeping edges.
            layer.applySurfaceBlur(WPS.clamp(noiseReduction * 0.05, 1, 6), 10);
        }
    }

    // __PART2__

    function mapPortrait(work, prm, longEdge) {
        // Subtle by design — never exaggerated "beauty" modifications.
        var skin = WPS.num(prm.skinRetouch, 0);
        if (skin > 0) {
            var skinLayer = work.activeLayer.duplicate();
            skinLayer.applySurfaceBlur(Math.max(1, Math.round(longEdge / 300)), 12);
            skinLayer.opacity = WPS.clamp(skin * 0.35, 0, 35);
            skinLayer.merge();
        }
        var eye = WPS.num(prm.eyeEnhancement, 0);
        if (eye > 0) {
            // Subtle global crispness; face-aware retouching is NOT scriptable
            // in PS2022 (documented limitation).
            var eyeLayer = work.activeLayer.duplicate();
            eyeLayer.applyUnsharpMask(WPS.clamp(eye * 0.4, 0, 40), 2, 0);
            eyeLayer.opacity = 30;
            eyeLayer.merge();
        }
    }

    function mapCrop(work) {
        var prm = WPS.params().presetParams || {};
        var cropMode = prm.cropMode || "AS_SHOT";
        var ratios = {
            PORTRAIT_4_5: 4 / 5,
            PORTRAIT_2_3: 2 / 3,
            LANDSCAPE_3_2: 3 / 2,
            LANDSCAPE_16_9: 16 / 9,
            SQUARE_1_1: 1
        };
        var targetRatio = ratios[cropMode];
        if (!targetRatio) return; // AS_SHOT / AUTO keep the shot's aspect
        var wPx = WPS.px(work.width);
        var hPx = WPS.px(work.height);
        var curRatio = wPx / hPx;
        var newW = wPx;
        var newH = hPx;
        if (curRatio > targetRatio) newW = Math.round(hPx * targetRatio);
        else newH = Math.round(wPx / targetRatio);
        var left = Math.round((wPx - newW) / 2);
        var top = Math.round((hPx - newH) / 2);
        work.crop([left, top, left + newW, top + newH]);
    }

    function mapVignette(work) {
        var prm = WPS.params().presetParams || {};
        var vignette = WPS.num(prm.vignette, 0);
        if (vignette >= 0) return; // darkening only
        var vAmount = Math.round(WPS.clamp(Math.abs(vignette) * 0.75, 0, 75));
        var vw = WPS.px(work.width);
        var vh = WPS.px(work.height);
        var vLayer = work.artLayers.add();
        var sel = work.selection;
        // Ellipse approximated with a 36-point polygon (version-proof).
        var points = [];
        var cx = vw / 2;
        var cy = vh / 2;
        var rx = vw * 0.46;
        var ry = vh * 0.42;
        for (var a = 0; a <= 36; a++) {
            var angle = (a / 36) * Math.PI * 2;
            points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
        }
        sel.select(points);
        sel.feather(Math.round(WPS.clamp(Math.min(vw, vh) / 8, 20, 400)));
        sel.invert();
        var black = new SolidColor();
        black.rgb.red = 0;
        black.rgb.green = 0;
        black.rgb.blue = 0;
        sel.fill(black, ColorBlendMode.NORMAL, 100, false);
        sel.deselect();
        vLayer.blendMode = BlendMode.MULTIPLY;
        vLayer.opacity = vAmount;
        vLayer.merge();
    }

    /** Full pipeline on a work copy of the opened document. */
    function runAll(work, prm, onStage) {
        onStage(30, "Base correction (exposure, contrast, tones)");
        mapBase(work, prm);
        onStage(45, "Color (temperature, tint, vibrance)");
        mapColor(work, prm);
        var longEdge = Math.max(WPS.px(work.width), WPS.px(work.height));
        onStage(60, "Detail (clarity, texture, sharpening)");
        mapDetail(work, prm, longEdge);
        onStage(70, "Portrait finish (subtle)");
        mapPortrait(work, prm, longEdge);
        onStage(78, "Crop");
        mapCrop(work);
        onStage(82, "Vignette");
        mapVignette(work);
    }

    return {
        mapBase: mapBase,
        mapColor: mapColor,
        mapDetail: mapDetail,
        mapPortrait: mapPortrait,
        mapCrop: mapCrop,
        mapVignette: mapVignette,
        runAll: runAll
    };
})();

if (WPS.BOOT.scriptName === "lib/pipeline.jsx") {
    // Executed directly (not as a library) — nothing to do.
    WPS.fail("JSX_ERROR", "pipeline.jsx is a library; run edit-photo.jsx");
}
