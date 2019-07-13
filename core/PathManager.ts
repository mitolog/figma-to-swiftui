import * as fs from 'fs-extra';
import * as path from 'path';

export enum OutputType {
    figmaJson,
    components,
    models
}

export enum OriginType {
    components,
    models
}

export class PathManager {
  templateDir: string;
  outputDir: string;

  constructor() {
    this.templateDir = path.resolve(process.cwd(), process.env.TEMPLATE_PATH);
    this.outputDir = path.resolve(process.cwd(), process.env.OUTPUT_PATH);
  }

  outputPath(forType: OutputType): string {
    const outputDir = this.outputDir;
    fs.ensureDirSync(outputDir);

    let outputPath: string = '';
    switch(forType) {
        case OutputType.figmaJson:
            outputPath = path.join(outputDir, 'figma.json');
            break;
        case OutputType.components:
            const componentsDir = path.join(outputDir, 'components');
            fs.ensureDirSync(componentsDir);
            outputPath = componentsDir;
            break;
        case OutputType.models:
                const modelsDir = path.join(outputDir, 'models');
                fs.ensureDirSync(modelsDir);
                outputPath = modelsDir;
                break;
        default:
            break;
    }

    return outputPath;
  }

  /**
   * Search files or directories that match `regExp`
   * under `searchDir` directory `recursive`-ly if needed.
   * @param searchDir {string} directory path. SHUOLD BE DIRECTORY.
   * @param regExp {string} regular expression string
   * @param recursive {boolean} if true, search recursively
   */
  searchDirsOrFiles(
    searchDir: string,
    regExp: string,
    recursive: boolean,
  ): string[] | null {
    if (!PathManager.isDir(searchDir)) return null;

    let foundPaths: string[] = [];
    const dirContents = fs.readdirSync(searchDir);
    dirContents
      .filter(dirOrFile => {
        const isDir = PathManager.isDir(path.join(searchDir, dirOrFile));
        const isMatched = dirOrFile.match(new RegExp(regExp, 'g'));
        if (isDir && recursive) {
          const paths = this.searchDirsOrFiles(
            path.join(searchDir, dirOrFile),
            regExp,
            isDir,
          );
          if (paths && paths.length > 0) {
            paths.forEach(path => foundPaths.push(path));
          }
        }
        return isMatched;
      })
      .forEach(fileName => {
        const filePath = path.join(searchDir, fileName);
        foundPaths.push(filePath);
      });

    return foundPaths;
  }

  read(filePath): string {
    let content = '';
    if (this.check(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }
    return content;
  }

  check(filePath): boolean {
    var isExist = false;
    try {
      fs.statSync(filePath);
      isExist = true;
    } catch (err) {
      isExist = false;
    }
    return isExist;
  }

  /// workaround when `statSync(path).isDirectory()` fails with `ENOENT`
  static isDir(path: string): boolean {
    try {
      return fs.statSync(path).isDirectory();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      } else {
        // todo: need to be tested
        throw new Error(error);
      }
    }
  }
}