import "./ShiningLoader.css";

// Number of placeholders to display
const PLACEHOLDERS = 6;

export default function ShiningLoader() {
  return (
    <div className="shining-loader-row">
      {[...Array(PLACEHOLDERS)].map((_, idx) => (
        <div className="shining-loader-card" key={idx}>
          <div className="shining-loader-img shimmer"></div>
          <div className="shining-loader-lines">
            <div className="shining-loader-line shimmer"></div>
            <div className="shining-loader-line short shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
