const isImageUrl = (v) => typeof v === "string" && /^(https?:)?\/\//.test(v.trim());

/**
 * Renders a product's `image` field, which can be either:
 *  - an emoji/short string (legacy placeholder), or
 *  - a real uploaded photo URL (from the vendor's product form)
 *
 * fill=true: parent already sizes a box (e.g. h-40) — image covers it.
 * fill=false: renders a small fixed-size icon (for table rows, etc).
 */
export default function ProductThumb({ image, fill = false, size = 40, emojiSize = 44, className = "" }) {
  if (isImageUrl(image)) {
    if (fill) {
      return <img src={image} alt="" className={`h-full w-full object-cover ${className}`} />;
    }
    return (
      <img
        src={image}
        alt=""
        className={`shrink-0 rounded-md object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span aria-hidden className={className} style={{ fontSize: fill ? emojiSize : size * 0.6, lineHeight: 1 }}>
      {image || "📦"}
    </span>
  );
}
