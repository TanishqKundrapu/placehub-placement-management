export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  );
}
