type JsonPrimitive = string | number | boolean | null;
type JsonMap = {
  [key: string]: JsonPrimitive | JsonMap | JsonArray;
};
type JsonArray = Array<JsonPrimitive | JsonMap | JsonArray>;
export type Json = JsonPrimitive | JsonMap | JsonArray;
