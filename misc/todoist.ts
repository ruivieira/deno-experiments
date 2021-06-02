import {readSecrets} from "./secrets.ts";
import {Todoist} from "../common/tasks/todoist.ts";
import {toString} from "../common/tasks/core.ts";

const tokens = readSecrets<any>("todoist");

const todoist = new Todoist(tokens.token);

const tasks = await todoist.getAllActiveTasks();

tasks.forEach(t => console.log(toString(t)))

// try with a project

const projTasks = await todoist.getActiveTasks({
    project_id: 2266793644
})

projTasks.forEach(t => console.log(toString(t)))
