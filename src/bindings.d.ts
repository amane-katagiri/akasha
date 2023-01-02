export interface Bindings {
  DB: D1Database;
}

declare global {
  function getMiniflareBindings(): Bindings;
}
