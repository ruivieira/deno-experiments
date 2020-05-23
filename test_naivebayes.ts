import { NaiveBayes } from "./ml/naivebayes.ts";

var classifier = new NaiveBayes();

// teach it positive phrases

await classifier.learn("amazing, awesome movie!! Yeah!! Oh boy.", "positive");
await classifier.learn(
  "Sweet, this is incredibly, amazing, perfect, great!!",
  "positive",
);

// teach it a negative phrase

await classifier.learn("terrible, shitty thing. Damn. Sucks!!", "negative");

// now ask it to categorize a document it has never seen before

let classification = await classifier.categorize(
  "awesome, cool, amazing!! Yay.",
);
// => 'positive'

console.log(classification);
