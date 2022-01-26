import { readSecrets } from "../misc/secrets.ts";
import { Todoist } from "../common/tasks/todoist.ts";
import { Status, toString } from "../common/tasks/core.ts";
import { getAllTasksByStatus } from "../misc/outliner.ts";

const tokens = readSecrets<any>("todoist");

const todoist = new Todoist(tokens.token);

const tasksTodoist = await todoist.getAllActiveTasks();
const tasksLogSeq = getAllTasksByStatus(
  "/Users/rui/notes/logseq",
  Status.Later,
);
(tasksTodoist.concat(tasksLogSeq)).sort((a, b) => b.priority - a.priority)
  .forEach((task) => {
    console.log(toString(task));
  });

// tasks.forEach(t => console.log(toString(t)))

// // try with a project

// const projTasks = await todoist.getActiveTasks({
//     project_id: 2266793644
// })

// projTasks.forEach(t => console.log(toString(t)))
