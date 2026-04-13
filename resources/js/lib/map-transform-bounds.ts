/**
 * Pan limits for react-zoom-pan-pinch, aligned with the library's calculateBounds
 * when limitToBounds, disablePadding, and centerZoomedOut=false.
 * Prevents dragging / wheel-zoom from leaving empty space outside the map edges.
 */
export type MapPanBounds = {
    minPositionX: number;
    maxPositionX: number;
    minPositionY: number;
    maxPositionY: number;
};

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

export function computeMapPanBounds(
    wrapperWidth: number,
    wrapperHeight: number,
    contentWidth: number,
    contentHeight: number,
    scale: number,
): MapPanBounds {
    const newContentWidth = contentWidth * scale;
    const newContentHeight = contentHeight * scale;
    const newDiffWidth = wrapperWidth - newContentWidth;
    const newDiffHeight = wrapperHeight - newContentHeight;

    const scaleWidthFactor = wrapperWidth > newContentWidth ? newDiffWidth : 0;
    const scaleHeightFactor = wrapperHeight > newContentHeight ? newDiffHeight : 0;

    let minPositionX = wrapperWidth - newContentWidth - scaleWidthFactor;
    let maxPositionX = scaleWidthFactor;
    let minPositionY = wrapperHeight - newContentHeight - scaleHeightFactor;
    let maxPositionY = scaleHeightFactor;

    const contentFitsCompletely =
        wrapperWidth >= newContentWidth && wrapperHeight >= newContentHeight;
    if (contentFitsCompletely) {
        minPositionX = 0;
        maxPositionX = 0;
        minPositionY = 0;
        maxPositionY = 0;
    }

    return { minPositionX, maxPositionX, minPositionY, maxPositionY };
}

export function clampMapPan(positionX: number, positionY: number, bounds: MapPanBounds): { x: number; y: number } {
    return {
        x: round2(Math.min(bounds.maxPositionX, Math.max(bounds.minPositionX, positionX))),
        y: round2(Math.min(bounds.maxPositionY, Math.max(bounds.minPositionY, positionY))),
    };
}

/** Ref shape returned by TransformWrapper at runtime (instance is not in public .d.ts). */
export type ZoomPinchRefLike = {
    instance?: {
        wrapperComponent: HTMLDivElement | null;
        contentComponent: HTMLDivElement | null;
    };
};

/** Read wrapper/content size from a mounted TransformWrapper ref (internal instance). */
export function clampMapWheelPosition(
    ref: ZoomPinchRefLike | null,
    positionX: number,
    positionY: number,
    scale: number,
): { x: number; y: number } {
    const wrap = ref?.instance?.wrapperComponent;
    const content = ref?.instance?.contentComponent;
    if (!wrap || !content) {
        return { x: round2(positionX), y: round2(positionY) };
    }
    const w = wrap.offsetWidth;
    const h = wrap.offsetHeight;
    const cw = content.offsetWidth;
    const ch = content.offsetHeight;
    if (w <= 0 || h <= 0 || cw <= 0 || ch <= 0) {
        return { x: round2(positionX), y: round2(positionY) };
    }
    const bounds = computeMapPanBounds(w, h, cw, ch, scale);
    return clampMapPan(positionX, positionY, bounds);
}
