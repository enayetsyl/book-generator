// components/ui/Button.jsx
export const Button = ({ children, ...props }) => (
  <button
    {...props}
    style={{
      padding: '8px 16px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    }}
  >
    {children}
  </button>
);

// components/ui/Input.jsx
export const Input = ({ ...props }) => (
  <input
    {...props}
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      marginTop: '4px'
    }}
  />
);

// components/ui/Label.jsx
export const Label = ({ children, ...props }) => (
  <label
    {...props}
    style={{
      display: 'block',
      marginBottom: '4px',
      fontSize: '14px',
      fontWeight: '500'
    }}
  >
    {children}
  </label>
);

// components/ui/Textarea.jsx
export const Textarea = ({ ...props }) => (
  <textarea
    {...props}
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '100px',
      marginTop: '4px'
    }}
  />
);

// components/ui/Select.jsx
export const Select = ({ children, onValueChange, value, ...props }) => (
  <select
    {...props}
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      marginTop: '4px',
      backgroundColor: 'white'
    }}
  >
    {children}
  </select>
);

export const SelectTrigger = ({ children }) => children;
export const SelectContent = ({ children }) => children;
export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);
export const SelectValue = () => null;

// components/ui/Checkbox.jsx
export const Checkbox = ({ onCheckedChange, checked, ...props }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    {...props}
    style={{
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }}
  />
);