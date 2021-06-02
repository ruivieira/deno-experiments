import {readSecrets} from "./secrets.ts";
import {Todoist} from "../common/tasks/todoist.ts";

const tokens = readSecrets<any>("todoist");

const todoist = new Todoist(tokens.token);

const tasks = await todoist.getAllTasks();

console.log(tasks.map((t) => t.content));

// try with a project

const projTasks = await todoist.getTasks({
    project_id: 1234
})

console.log(projTasks.map((t) => t.content));
