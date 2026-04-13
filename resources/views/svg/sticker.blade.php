<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{{ $width }}" height="{{ $height }}" viewBox="0 0 {{ $width }} {{ $height }}">
    <!-- Main Background -->
    <rect width="100%" height="100%" fill="{{ $bg }}"/>

    <!-- QR Container (White rounded box) -->
    <rect x="{{ ($width - $qrSize) / 2 }}" y="40" width="{{ $qrSize }}" height="{{ $qrSize }}" rx="{{ $radius }}" ry="{{ $radius }}" fill="#FFFFFF" {{ $color === 'White' ? 'stroke="#000" stroke-width="4"' : '' }}/>

    <!-- QR Code - inline SVG content directly -->
    <svg x="{{ ($width - $qrSize) / 2 + $qrPadding }}" y="{{ 40 + $qrPadding }}" width="{{ $qrSize - 2 * $qrPadding }}" height="{{ $qrSize - 2 * $qrPadding }}" viewBox="0 0 {{ $qrSizeOrig }} {{ $qrSizeOrig }}" xmlns="http://www.w3.org/2000/svg">
        {!! $qrContent !!}
    </svg>

    <!-- MLUC SENTINEL (below QR) -->
    <text x="50%" y="{{ 40 + $qrSize + 55 }}" fill="{{ $textColor }}" font-size="48" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">
        MLUC SENTINEL
    </text>

    <!-- Sticker Number (Large, Clear) -->
    <text x="50%" y="{{ $height - 60 }}" fill="{{ $textColor }}" font-size="180" font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle">
        {{ $displayNo }}
    </text>
</svg>
