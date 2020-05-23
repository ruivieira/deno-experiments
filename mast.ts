import mammut from "./mammut/index.ts";
import { IClientConfig } from "./mammut/Client/index.ts";
import { IAccessTokenData } from "./mammut/AccessToken/index.ts";
import { readJsonSync } from "https://deno.land/std@0.53.0/fs/mod.ts";
import { exec, OutputMode } from "https://deno.land/x/exec/mod.ts";

let credentials:any = await readJsonSync(`./credentials.json`);

// get last commit hash
let response = await exec('git log -1 --format=oneline', {output: OutputMode.Capture});

let config: IClientConfig = {
  name: "mesozoicbot",
  id: "mesozoicbot",
  client_id: "mesozoicbot",
  client_secret: credentials.client_secret,
  rawurl: "https://botsin.space",
  accessToken: {
    access_token: credentials.access_token,
    scope: ['read', 'write']
  } as IAccessTokenData,
};


let client = new mammut.Client(config);

client.toot(`new commit to https://github.com/ruivieira/deno-experiments\n${response.output}`);