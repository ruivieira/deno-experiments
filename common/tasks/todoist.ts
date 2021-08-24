import { Task, Status, Todo } from "./core.ts";
import { qs } from "https://deno.land/x/deno_qs/mod.ts";

export interface TodoistTask extends Todo {
  id: number;
  project_id: number;
}

export interface TaskOptions {
  project_id?: number; // Filter tasks by project ID.
  section_id?: number; //Filter tasks by section ID.
  label_id?: number; // Filter tasks by label.
  filter?: string; // Filter by any supported filter.
  lang?: string; // IETF language tag defining what language filter is written in, if differs from default English.
  ids?: Array<number>; // A list of the task IDs to retrieve, this should be a comma separated list.
}

function assignStatus(
  tasks: Array<TodoistTask>,
  status: Status
): Array<TodoistTask> {
  tasks.forEach((task) => (task.status = status));
  return tasks;
}

export class Todoist {
  constructor(private token: string) {}

  async getAllActiveTasks(): Promise<Array<Task>> {
    const data = await fetch("https://api.todoist.com/rest/v1/tasks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    const tasks = await data.json();
    return assignStatus(tasks, Status.Todo);
  }

  async getActiveTasks(options: TaskOptions): Promise<Array<Task>> {
    const params = qs.stringify(options);
    const data = await fetch(
      `https://api.todoist.com/rest/v1/tasks?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
    const tasks = await data.json();
    return assignStatus(tasks, Status.Todo);
  }
}
