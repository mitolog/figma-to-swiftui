import * as handlebars from 'handlebars';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DataConfig } from './DataConfig';
import { PathManager, OutputType } from './PathManager';

export class CodeGenerator {
    pathManager: PathManager;

    constructor() {
      this.pathManager = new PathManager();
    }

    generate(configs: DataConfig[]) {
        const templateDir = this.pathManager.templateDir;

        // copy models first
        const paths = this.pathManager.searchDirsOrFiles(templateDir, '^Models$', true);
        if (!paths || paths.length <= 0) {
            throw new Error(`no 'Models' directory under ${templateDir}`);
        }
        const modelsDestDir = this.pathManager.outputPath(OutputType.models);
        fs.copySync(paths[0], modelsDestDir);

        // adopt & write each components into files if needed
        const componentsDestDir = this.pathManager.outputPath(OutputType.components);
        for(const config of configs) {
            switch(config.keyword) {
                case 'textButton':
                    const fileName = 'TextButton.swift';
                    const files = this.pathManager.searchDirsOrFiles(templateDir, `^${fileName}.hbs$`, true);
                    if(!files || files.length <= 0) {
                        throw new Error(`no ${fileName}.hbs under ${templateDir}`);
                    }
                    const template = this.compiledTemplate(files[0]);
                    const output = template(config);

                    const filePath = path.join(componentsDestDir, fileName);
                    fs.writeFileSync(filePath, output);
                    break;
                default:
                    console.log(config.keyword);
                    break;
            }
        }
    }

    compiledTemplate(templatePath: string): any {
        const templateStr = this.pathManager.read(templatePath);
        if (!templateStr) {
          throw new Error("couldn't get template: " + templatePath);
        }
        return handlebars.compile(String(templateStr));
    }
}