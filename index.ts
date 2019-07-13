import { Figma } from './core/Figma';
import { DataTranslator } from './core/DataTranslator';
import { Node } from 'figma-types/types/node';
import { CodeGenerator } from './core/CodeGenerator';

class App {
  async run() {

    const keywords = ['textButton'];

    // retrieve buttons
    const figma = new Figma();
    const nodes: Node[] = await figma.getAll('COMPONENT', keywords);
    //console.log(nodes.map(node => node.name));

    // convert figma nodes into template data
    const translator = new DataTranslator();
    const configs = translator.translate(nodes, keywords);
    //console.log(configs);

    // adopt template
    const generator = new CodeGenerator();
    generator.generate(configs);
  }
}

const app = new App();
app.run().then(_ => {
  console.log('extracted then generated');
});