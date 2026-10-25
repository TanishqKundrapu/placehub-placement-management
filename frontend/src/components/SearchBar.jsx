import Icon from './Icon';

// Text search box plus optional dropdown filters.
// filters: [{ name, label, options: [{ value, label }] }]
export default function SearchBar({ value, onChange, placeholder = 'Search...', filters = [], filterValues = {}, onFilterChange }) {
  const active = Object.values(filterValues).filter(Boolean).length;
  return (
    <div className="toolbar">
      <label className="search">
        <Icon name="search" size={17} />
        <input type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Search" />
      </label>
      {filters.length > 0 && (
        <div className="filters">
          <span className="filters-label"><Icon name="filter" size={14} /> Filters{active ? ` · ${active}` : ''}</span>
          {filters.map((f) => (
            <select
              key={f.name}
              className={`pill-select ${filterValues[f.name] ? 'is-set' : ''}`}
              value={filterValues[f.name] || ''}
              onChange={(e) => onFilterChange(f.name, e.target.value)}
              aria-label={f.label}
            >
              <option value="">{f.label}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
