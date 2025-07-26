// src/components/filter/filter.js
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./filter.css";

export default function FilterSidebar({
  categories,
  onCategoryChange,
  onSearchChange,
}) {
  const [checked, setChecked] = useState([]);
  const [search, setSearch] = useState("");

  const handleCategoryChange = (category) => {
    const updated = checked.includes(category)
      ? checked.filter((c) => c !== category)
      : [...checked, category];
    setChecked(updated);
    if (onCategoryChange) onCategoryChange(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) onSearchChange(search);
  };

  return (
    <aside className="filter-sidebar">
      {/* Search Product Block */}
      <div className="filter-block">
        <div className="filter-block-title">Search Product</div>
        <form className="filter-search-box" onSubmit={handleSearchSubmit}>
          <input
            className="filter-search-input"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="filter-search-btn">
            <FaSearch />
          </button>
        </form>
      </div>

      <div className="filter-block">
        <div className="filter-block-title">Product Category</div>
        <ul className="filter-list">
          {categories.map((cat) => (
            <li key={cat}>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={checked.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                  className="filter-checkbox"
                />
                <span className="filter-checkbox-text">{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
