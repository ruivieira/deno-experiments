import { globFiles } from "../common/fs.ts";
import { Task, Todo } from "../common/tasks.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

export function getAllTasks(path: string): Array<Task> {
  const entries = globFiles(path, "md", false);
  const decoder = new TextDecoder("utf-8");
  const lines = entries
    .map((entry) => {
      return decoder.decode(Deno.readFileSync(entry.path));
    })
    .flatMap((text) => text.split("\n"))
    .map((line) => line.trimStart());
  const tasks = lines
    .map(parseLogSeqTask)
    .filter((x) => x)
    .map((x) => x!);
  return tasks;
}

export function parseLogSeqTask(line: string): Task | undefined {
  if (line.startsWith("- TODO")) {
    return new Todo(line.slice(7), true);
  } else if (line.startsWith("- DONE")) {
    return new Todo(line.slice(7), false);
  } else {
    return undefined;
  }
}

function taskToString(task: Task): string {
  if (task.done) {
    return `${Colors.green("DONE")} ${task.body}`;
  } else {
    return `${Colors.red("TODO")} ${task.body}`;
  }
}

const tasks = getAllTasks("/Users/rui/notes/logseq"); //.filter(tasks => !tasks.done);
tasks.forEach((task) => {
  console.log(taskToString(task));
});
