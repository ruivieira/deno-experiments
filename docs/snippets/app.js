function fetchData1(url) {
    return fetch(url).then((value)=>value.json()
    );
}
function replaceParameter1(code, parameters) {
    let newCode = code;
    for (let key of Object.keys(parameters)){
        const value = parameters[key];
        if (value != "") {
            newCode = newCode.replace(key, parameters[key]);
        }
    }
    return newCode;
}
const parameterRegEx = new RegExp("<(.*?)>", "gm");
function extractParameters1(code) {
    let matches = Array.from(code.matchAll(parameterRegEx));
    if (matches != null) {
        return Object.fromEntries(matches.map((x)=>x[0]
        ).map((k)=>[
                k,
                ""
            ]
        ));
    } else {
        return {
        };
    }
}
function filterSelection1(items, searchTerms) {
    return items.filter((snippet)=>snippet.description.toLowerCase().includes(searchTerms.toLowerCase())
    );
}
let termsData1 = {
    terms: ""
};
console.log("Initialised from the Deno code!");
function show1(searchTerms) {
    console.log(`Just got this from the search: "${searchTerms.terms}".`);
}
const model1 = {
    el: "#app",
    created () {
        const topics = [
            {
                name: "zsh",
                url: "https://raw.githubusercontent.com/ruivieira/zsh.cheat/master/zsh.json"
            }, 
        ];
        fetchData1(topics[0].url).then((data)=>{
            data.forEach((x)=>x["topic"] = topics[0].name
            );
            this.snippets = data;
        });
    },
    methods: {
        setSelectedSnippet (snippet) {
            this.selectedSnippet = snippet;
            this.parameters = extractParameters1(snippet.value);
        }
    },
    data: {
        snippets: [],
        searchTerms: "",
        selectedSnippet: undefined,
        parameters: {
        },
        locked: false
    },
    computed: {
        filteredSnippets () {
            return filterSelection1(this.snippets, this.searchTerms);
        },
        compiledSnippet () {
            return replaceParameter1(this.selectedSnippet.value, this.parameters);
        }
    }
};
export { fetchData1 as fetchData };
export { replaceParameter1 as replaceParameter };
export { extractParameters1 as extractParameters };
export { filterSelection1 as filterSelection };
export { termsData1 as termsData };
export { show1 as show };
export { model1 as model };

