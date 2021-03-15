/**
 * INFO: Tools to parse Jupyter notebooks
 */

interface JupyterCell {
  cell_type: string;
  id: string;
  metadata: any;
  source?: string[];
  execution_count?: number;
  outputs: any[];
}

interface JupyterMetadata {
  kernelspec: any;
}

interface JupyterSource {
  cells: JupyterCell[];
  metadata: JupyterMetadata;
}

export class JupyterNotebook {
  get imageFolder(): string {
    return this._imageFolder;
  }
  get images(): { [p: string]: string } {
    return this._images;
  }
  private content: JupyterSource;
  private _images: { [key: string]: string } = {};
  private readonly imagePrefix: string;
  private readonly _imageFolder: string;
  private readonly language: string;
  constructor(
    content: JupyterSource,
    imageFolder = "./images/",
    imagePrefix = "notebook_image",
  ) {
    this.content = content;
    this._imageFolder = imageFolder;
    this.imagePrefix = imagePrefix;
    this.language = content.metadata.kernelspec.language;
  }

  render(): string {
    let lines: string[] = [];
    let imageCounter = 1;
    for (let cell of this.content.cells) {
      if (cell.cell_type == "markdown") {
        lines.push(cell.source!.join(""));
      }
      if (cell.cell_type == "code") {
        lines.push("```" + this.language);
        lines.push(cell.source!.join(""));
        lines.push("```\n");
        // now get the outputs
        for (let output of cell.outputs) {
          if (output.output_type == "display_data") {
            const data = output.data;
            if ("image/png" in data) {
              const imageName = `${this.imagePrefix}_${imageCounter}`;
              this._images[imageName] = data["image/png"];
              lines.push(
                `![${imageName}](${this._imageFolder}${imageName}.png)`,
              );
              imageCounter += 1;
            }
          } else if (output.output_type == "stream") {
            lines.push("```");
            lines.push(output.text.join(""));
            lines.push("```\n");
          } else if (output.output_type == "execute_result") {
            const data = output.data;
            if (data["text/html"]) {
              lines.push(data["text/html"].join(""));
            }
          }
        }
      }
    }
    return lines.join("\n");
  }
}
