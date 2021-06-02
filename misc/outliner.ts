import {globFiles} from "../common/fs.ts";
import {Status, Task, Todo, toString} from "../common/tasks/core.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

export function getAllTasks(path: string): Array<Task> {
    const entries = globFiles(path, "md", false);
    const decoder = new TextDecoder("utf-8");
    const lines = entries
        .map((entry) => {
            return decoder.decode(Deno.readFileSync(entry.path));
        })
        .flatMap((text) => text.split("\n"))
        .map((line) => line.trimStart())
        .filter(isTask);
    const tasks = lines.map(parseLogSeqTask);
    return tasks;
}

export function getAllTasksByStatus(path: string, status: Status): Array<Task> {
    return getAllTasks(path).filter(task => task.status == status)
}

function isTask(line: string): boolean {
    return (
        line.startsWith("- TODO") ||
        line.startsWith("- DONE") ||
        line.startsWith("- LATER")
    );
}

function parsePriority(line: string): number {
    if (line.includes("[#A]")) {
        return 1;
    } else if (line.includes("[#B]")) {
        return 2;
    } else if (line.includes("[#C]")) {
        return 3;
    } else {
        return 10;
    }
}

export function parseLogSeqTask(line: string): Task {
    const priority = parsePriority(line);
    if (line.startsWith("- TODO")) {
        return new Todo(line.slice(7), Status.Done, priority);
    } else if (line.startsWith("- DONE")) {
        return new Todo(line.slice(7), Status.Todo, priority);
    } else if (line.startsWith("- LATER")) {
        return new Todo(line.slice(8), Status.Later, priority);
    } else {
        return new Todo(line.slice(7), Status.Done, priority);
    }
}

function taskToString(task: Task): string {
    switch (task.status) {
        case Status.Done:
            return `${Colors.green("DONE")}\t[${task.priority}]\t${task.content}`;
        case Status.Todo:
            return `${Colors.brightRed("TODO")}\t[${task.priority}]\t${task.content}`;
        case Status.Later:
            return `${Colors.red("LATER")}\t[${task.priority}]\t${task.content}`;
        default:
            return "Unsupported task type";
    }
}

// const tasks = getAllTasks("/Users/rui/notes/logseq");
const tasks = getAllTasksByStatus("/Users/rui/notes/logseq", Status.Later);
tasks
    .sort((a, b) => b.priority - a.priority)
    .forEach((task) => {
        console.log(toString(task));
    });
