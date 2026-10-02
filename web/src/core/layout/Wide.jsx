// Lets a page (tables, admin screens) be wider than the narrow default column
export default function Wide({ children }) {
  return <div className="relative left-1/2 w-[min(92vw,56rem)] -translate-x-1/2">{children}</div>;
}
