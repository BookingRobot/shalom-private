import type { NumberedPhoto, PhotoTile } from './hotelTypes';
import './HotelGallery.css';

/** One photo tile of the gallery row; the label sits in its corner. */
function Tile({
  tile,
  flex,
  onClick,
  label,
  children,
}: {
  tile: PhotoTile;
  flex: string;
  onClick: () => void;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" className="hg-tile" onClick={onClick} aria-label={label || tile.label} style={{ flex }}>
      <img src={tile.src} alt="" />
      {children ?? <span className="hg-label">{tile.label}</span>}
    </button>
  );
}

/** Gallery: ONE row, sizes decreasing left to right; a click opens the full gallery. */
export function HotelGallery({
  tiles,
  photoCount,
  pick0,
  pick1,
  pick2,
  pickAll,
}: {
  tiles: PhotoTile[];
  photoCount: number;
  pick0: () => void;
  pick1: () => void;
  pick2: () => void;
  pickAll: () => void;
}) {
  return (
    <div className="hg-row" data-canvas="hotel-gallery">
      <Tile tile={tiles[0]} flex="4 1 0" onClick={pick0} label="Территория санатория" />
      <Tile tile={tiles[1]} flex="2.2 1 0" onClick={pick1} />
      <Tile tile={tiles[2]} flex="1.5 1 0" onClick={pick2} />
      <Tile tile={tiles[3]} flex="1 1 0" onClick={pickAll} label="Все фото">
        <span className="hg-label" />
        <span className="hg-all">Все {photoCount} фото →</span>
      </Tile>
    </div>
  );
}

/** Full gallery overlay: all photos large, scrollable. */
export function HotelLightbox({
  name,
  photos,
  onClose,
}: {
  name: string;
  photos: NumberedPhoto[];
  onClose: () => void;
}) {
  return (
    <div className="hg-lb" data-canvas="hotel-lightbox">
      <div className="hg-lb-bar">
        <div className="hg-lb-title">
          {name} — все фото ({photos.length})
        </div>
        <button type="button" className="hg-lb-close" onClick={onClose}>
          Закрыть ✕
        </button>
      </div>
      <div className="hg-lb-list">
        {photos.map((p, k) => (
          <figure id={'lbp-' + k} key={k} className="hg-lb-fig">
            <img src={p.src} alt={p.alt} />
            <figcaption>
              {p.n}. {p.alt}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
