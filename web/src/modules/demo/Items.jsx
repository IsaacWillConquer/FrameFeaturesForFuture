import CrudPage from "../../core/crud/CrudPage";
import itemsConfig from "./itemsConfig";

export default function Items() {
  return <CrudPage config={itemsConfig} />;
}
