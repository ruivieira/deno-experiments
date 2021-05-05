import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import * as snippets from "./snippets.ts";

// Simple name and function, compact form, but not configurable
Deno.test("Extract parameters", () => {
  const code = "which -s <arg1> -e <arg2>";
  const parameters = snippets.extractParameters(code);
  const keys = Object.keys(parameters);
  assertEquals(keys.length, 2);
  assertEquals(keys[0], "<arg1>");
  assertEquals(keys[1], "<arg2>");
});
