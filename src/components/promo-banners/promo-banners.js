import { Link } from "react-router-dom";
import "./promo-banners.css";

function PromoBanners({ items, className = "" }) {
  if (!items || items.length === 0) return null;

  return (
    <aside
      className={`promo-banners promo-banners--inline ${className}`.trim()}
      aria-label="Promotional offers"
    >
      <div className="promo-banners__inner">
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="promo-banners__card"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <span className="promo-banners__shade" aria-hidden />
            <span className="promo-banners__text">
              <span className="promo-banners__eyebrow">{item.eyebrow}</span>
              <span className="promo-banners__title">{item.title}</span>
              <span className="promo-banners__subtitle">{item.subtitle}</span>
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default PromoBanners;
