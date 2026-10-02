// DEMO of the CRUD kit. On reveal day: copy this file for each real entity, then delete the demo.
// fields: type can be "text" (default), "number", "textarea", "select" (needs options), "date"
export default {
  title: "Items (demo)",
  collectionName: "items",
  writeRole: "staff", // who can add/edit/delete. Everyone signed in can view.
  fields: [
    { name: "name", label: "Name", required: true },
    { name: "category", label: "Category", type: "select", options: ["A", "B", "C"] },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
  ],
};
