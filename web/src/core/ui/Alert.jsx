// Screen readers announce this automatically (role="alert" / role="status")
export default function Alert({ children, type = "error" }) {
  if (!children) return null;
  const style =
    type === "error"
      ? "bg-red-50 text-red-800 border-red-700"
      : "bg-green-50 text-green-900 border-green-700";
  return (
    <p role={type === "error" ? "alert" : "status"} className={`border-l-4 p-3 mb-4 ${style}`}>
      {children}
    </p>
  );
}
