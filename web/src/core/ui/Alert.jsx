// Screen readers announce this automatically (role="alert" / role="status")
export default function Alert({ children, type = "error" }) {
  if (!children) return null;
  const styles = {
    error: "bg-danger/10 text-danger border-danger",
    info: "bg-primary/10 text-primary border-primary",
    success: "bg-success/10 text-success border-success",
    warning: "bg-warning/10 text-warning border-warning",
  };
  return (
    <p role={type === "error" ? "alert" : "status"} className={`mb-4 rounded-lg border-l-4 p-3 ${styles[type] || styles.error}`}>
      {children}
    </p>
  );
}
