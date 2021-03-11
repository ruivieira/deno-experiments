import { JupyterNotebook } from "../jupyter/parse.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Jupyter :: parser :: correct number of images", () => {
    const __dirname = new URL(".", import.meta.url).pathname;
    const text = Deno.readTextFileSync(`${__dirname}/assets/notebook.ipynb`);
    let content: any = JSON.parse(text);
    const notebook = new JupyterNotebook(content);
    notebook.render()
    assertEquals(Object.keys(notebook.images).length, 2);
});