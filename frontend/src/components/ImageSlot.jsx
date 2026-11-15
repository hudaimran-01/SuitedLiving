export function ImageSlot({ source, src, caption }) {
  return (
    <figure className="image-slot">
      {src ? (
        <img src={src} alt={caption} />
      ) : (
        <div className="image-slot-frame">
          <span className="source">{source}</span>
          <span>Image ties in here</span>
        </div>
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
