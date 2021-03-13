import { SAXParser, ElementInfo } from 'https://deno.land/x/xmlp/mod.ts';

// create a SAX parser instance
const parser = new SAXParser();

// add SAX event handlers
parser.on('start_prefix_mapping', (ns, uri) => {
    console.log(`mapping start ${ns}: ${uri}`);
}).on('text', (text, element) => {
    if (element.qName === 'm:comment') {
        console.log(`${element.attributes[0].value}: ${text}`);
    }
}).on('start_element', (element: ElementInfo) => {
    console.log(element)
});

const HOME = Deno.env.get("HOME");

// run parser, input source is Deno.Reader or Uint8Array or string
const reader = await Deno.open(`${HOME}//Sync/code/ml/benchmark-models/minimal-numerical/models/model.pmml`);
await parser.parse(reader);
reader.close();