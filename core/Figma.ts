import * as dotenv from 'dotenv';
import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PathManager, OutputType } from './PathManager';
import { File } from 'figma-types';
import { Node } from 'figma-types/types/node';
import { NodeType } from 'figma-types/types/enums';

dotenv.config();
if (dotenv.error) {
  throw dotenv.error;
}

export class Figma {

  /**
   * get all nodes that have keywords within `name` property.
   * Limitations:
   *  - keyword shuold not be duplicated
   *  - last matched node is used if there are multiple keyword matched
   * @param nodeType {NodeType} node type
   * @param names {string[]} optional. specity names that matches nodes' name
   */
  public async getAll(nodeType: NodeType, keywords?: string[] ): Promise<Node[]|null> {
    const file = await this.getFigmaFile(true);
    const outputs: Node[] = [];

    const rootChildren = file.document.children;
    for (const rootChild of rootChildren) {
      this.searchNodes(rootChild, nodeType, outputs);
    }

    const filtered = outputs.filter(node => {
      const keywordMatched = keywords.filter(keyword => {
        const matched = node.name.match(new RegExp(keyword, 'gi'));
        return matched && matched.length > 0;
      }).reduce((_, current) => current, null);
      return (keywordMatched) ? true : false;
    });

    return filtered;
  }

  /**
   * Get first matched node, dig down recursively.
   * @param baseNode
   * @param nodeTypeOrName
   */
  public getNode(baseNode: Node, nodeTypeOrName: NodeType|string): Node|null {
    let matchedNode: Node|null = null;
    baseNode.children.some(child => {
      matchedNode = this.firstMatchedNode(child, nodeTypeOrName);
      if (matchedNode) return true;
    });
    return matchedNode;
  }

  private firstMatchedNode(targetNode: Node, nodeTypeOrName: NodeType|string): Node|null {
    const children = targetNode.children;
    if (children && children.length > 0) {
      for (const child of children) {
        const node = this.firstMatchedNode(child, nodeTypeOrName);
        if (node) return node;
      }
    }
    return (targetNode.type === nodeTypeOrName || targetNode.name === nodeTypeOrName) ? targetNode : null;
  }

  private searchNodes(targetNode: Node, nodeType: NodeType, outputs: Node[]) {
    const children = targetNode.children;
    if (children && children.length > 0) {
      for (const child of children) {
        this.searchNodes(child, nodeType, outputs);
      }
    }
    if (targetNode.type === nodeType) {
      outputs.push(targetNode);
    }
  }

  private async getFigmaFile(shouldWriteFile: boolean): Promise<File> {
    var fileData: File;

    try {
      const filesResult = await axios(this.filesConfig());
      fileData = filesResult.data as File;
    } catch (error) {
      throw new Error(error);
    }

    if (!fileData) {
      throw new Error('no figma files found.');
    }

    if (shouldWriteFile) {
      const pm = new PathManager();
      const filePath = await pm.outputPath(OutputType.figmaJson);
      await fs.writeFile(filePath, JSON.stringify(fileData));
    }
    return fileData;
  }

  private filesConfig(): AxiosRequestConfig {
    return {
      url: `/files/${process.env.FIGMA_FILE_KEY}`,
      method: 'get',
      baseURL: 'https://api.figma.com/v1/',
      headers: {
        'X-FIGMA-TOKEN': process.env.FIGMA_ACCESS_TOKEN,
      },
    };
  }
}
