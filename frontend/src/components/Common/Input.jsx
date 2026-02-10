export default function Input({
  label,
  error,
  required = false,
  className = '',
  id,
  name,
  ...props
}) {
  // Generate a unique ID if not provided
  const inputId = id || name || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name || inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
