/**
 * INFO: Online browser for Geometric firs
 */
import { VueApp } from "../Vue.ts";
interface SearchTerms {
  terms: string;
}

export interface Snippet {
  topic: string;
  description: string;
  value: string;
}

class Selection {
  items: Array<Snippet> = [];
  original: Array<Snippet> = [];
}

export function fetchData(url: string): Promise<Array<Snippet>> {
  return fetch(url).then((value) => value.json());
}

export function replaceParameter(
  code: string,
  parameters: { [k: string]: string }
) {
  let newCode = code;
  for (let key of Object.keys(parameters)) {
    const value = parameters[key];
    if (value != "") {
      newCode = newCode.replace(key, parameters[key]);
    }
  }
  return newCode;
}
const parameterRegEx = new RegExp("<(.*?)>", "gm");

export function extractParameters(code: string): { [k: string]: string } {
  let matches = Array.from(code.matchAll(parameterRegEx));
  if (matches != null) {
    return Object.fromEntries(matches.map((x) => x[0]).map((k) => [k, ""]));
  } else {
    return {};
  }
}

export function filterSelection(
  items: Array<Snippet>,
  searchTerms: string
): Array<Snippet> {
  return items.filter((snippet: Snippet) =>
    snippet.description.toLowerCase().includes(searchTerms.toLowerCase())
  );
}

export let termsData: SearchTerms = { terms: "" };
console.log("Initialised from the Deno code!");

export function show(searchTerms: SearchTerms) {
  console.log(`Just got this from the search: "${searchTerms.terms}".`);
}

interface Data {
  snippets: Array<Snippet>;
  searchTerms: string;
  selectedSnippet?: Snippet;
  parameters: any;
  locked: boolean;
}

export const model: VueApp<Data> = {
  el: "#app",
  created() {
    const topics = [
      {
        name: "zsh",
        url:
          "https://raw.githubusercontent.com/ruivieira/zsh.cheat/master/zsh.json",
      },
    ];
    fetchData(topics[0].url).then((data) => {
      data.forEach((x) => (x["topic"] = topics[0].name));
      this.snippets = data;
    });
  },
  methods: {
    setSelectedSnippet(this: Data, snippet: Snippet) {
      this.selectedSnippet = snippet;
      this.parameters = extractParameters(snippet.value);
    },
  },
  data: {
    snippets: [],
    searchTerms: "",
    selectedSnippet: undefined,
    parameters: {},
    locked: false,
  },
  computed: {
    filteredSnippets(this: Data) {
      return filterSelection(this.snippets, this.searchTerms);
    },
    compiledSnippet(this: Data) {
      return replaceParameter(this.selectedSnippet!.value, this.parameters);
    },
  },
};
