import {readSecrets} from "./secrets.ts"

const tokens = readSecrets<any>("todoist")

const response = fetch("https://api.todoist.com/rest/v1/tasks", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${tokens.token}`,
    },
  });

response.then(r => r.json()).then(r => console.log(r))