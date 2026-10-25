// Label + input/select/textarea + validation error, used by every form
export default function FormField({ label, name, error, as = 'input', options = [], hint, ...props }) {
  const id = `f-${name}`;
  const common = { id, name, className: `input ${error ? 'input-invalid' : ''}`, 'aria-invalid': !!error, ...props };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {as === 'select' ? (
        <select {...common}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea rows={3} {...common} />
      ) : (
        <input {...common} />
      )}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
