export default function Button({ children, ...props }) {
  return (
    <button
      className="bg-blue-800 text-white px-4 py-2 min-h-11 rounded hover:bg-blue-900 disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}
