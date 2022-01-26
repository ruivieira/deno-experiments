/**
 * INFO: Generate macOS `launchd` plists
 */
export interface LaunchdOptions {
  key: string;
  env?: string;
  program: string;
  arguments?: Array<string>;
  interval: number;
  err: string;
  out: string;
}

export function createPlist(options: LaunchdOptions) {
  let result = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${options.key}</string>  
`;
  if (options.env != undefined) {
    result += `
        <key>EnvironmentVariables</key>
        <dict>
          <key>PATH</key>
          <string><![CDATA[${options.env!}]]></string>
        </dict>            
`;
  }
  result += `
    <key>Program</key>
    <string>${options.program}</string>    
`;
  if (options.arguments != undefined) {
    let args = options.arguments!.map((x) => `<string>${x}</string>`).join(
      "\n",
    );
    result += `
    <key>ProgramArguments</key>
    <array>
        ${args}
    </array>
`;
  }
  result += `
<key>Nice</key>
<integer>1</integer>

<key>StartInterval</key>
<integer>${options.interval}</integer>

<key>RunAtLoad</key>
<false/>

<key>StandardErrorPath</key>
<string>${options.err}</string>

<key>StandardOutPath</key>
<string>${options.out}</string>
</dict>
</plist>
`;
  return result;
}
