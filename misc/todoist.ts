import { Todoist } from "../external/todoist.ts";
import {readSecrets} from "./secrets.ts"

const tokens = readSecrets<any>("todoist")

const td = new Todoist(tokens.token);

let tasks = await td.getTasks();

tasks?.forEach(task => console.log(task))
console.log(tasks?.length + " tasks found");