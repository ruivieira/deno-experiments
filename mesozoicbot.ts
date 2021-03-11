/**
 * INFO: Mastodon notification bot for website builds
 */
import mammut from "./mammut/index.ts";
import { IClientConfig } from "./mammut/Client/index.ts";
import { IAccessTokenData } from "./mammut/AccessToken/index.ts";
import { exec, OutputMode } from "https://deno.land/x/exec/mod.ts";

const HOME = Deno.env.get("HOME");

const text = await Deno.readTextFile(
  `${HOME}/.config/mastodon/mesozoicbot.json`
);
let credentials: any = JSON.parse(text);

// get last commit hash
let response = await exec(
  `git --git-dir ${HOME}/Sync/code/sites/ruivieira.github.io/.git log -1`,
  {
    output: OutputMode.Capture,
  }
);

let config: IClientConfig = {
  name: "mesozoicbot",
  id: "mesozoicbot",
  client_id: "mesozoicbot",
  client_secret: credentials.client_secret,
  rawurl: "https://botsin.space",
  accessToken: {
    access_token: credentials.access_token,
    scope: ["read", "write"],
  } as IAccessTokenData,
};

const response_lines = response.output.split("\n");
const commid_id = response_lines[0].slice(0, 11);
const commit_description = response_lines[4];

const message = `New content in https://ruivieira.dev\n[${commid_id}...]\n${commit_description}`;

let client = new mammut.Client(config);

client.toot(message);
console.log(message);
