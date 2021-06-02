import * as Colors from "https://deno.land/std/fmt/colors.ts";

export interface Task {
    content: string;
    status: Status;
    priority: number;
}

export enum Status {
    Done,
    Todo,
    Later
}

export class Todo implements Task {
    content: string;
    status: Status
    priority: number

    constructor(body: string, status = Status.Todo, priority = 10) {
        this.content = body;
        this.status = status
        this.priority = priority
    }

}

export function toString(todo: Todo) {
    switch (todo.status) {
        case Status.Done:
            return `${Colors.green("DONE")}\t[${todo.priority}]\t${todo.content}`;
        case Status.Todo:
            return `${Colors.brightRed("TODO")}\t[${todo.priority}]\t${todo.content}`;
        case Status.Later:
            return `${Colors.red("LATER")}\t[${todo.priority}]\t${todo.content}`;
        default:
            return "Unsupported task type";
    }    
}