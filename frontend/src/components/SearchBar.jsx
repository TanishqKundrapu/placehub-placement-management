// Text search box plus optional dropdown filters.
// filters: [{ name, label, options: [{ value, label }] }]
export default function SearchBar({ value, onChange, placeholder = 'Search...', filters = [], filterValues = {}, onFilterChange }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        className="input search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search"
      />
      {filters.map((f) => (
        <select
          key={f.name}
          className="input"
          value={filterValues[f.name] || ''}
          onChange={(e) => onFilterChange(f.name, e.target.value)}
          aria-label={f.label}
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
