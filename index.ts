import { Figma } from './core/Figma';
import { File } from 'figma-types';
import { Node } from 'figma-types/types/node';
import { NodeType } from 'figma-types/types/enums';
import { DataTranslator } from './core/DataTranslator';

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

  }
}

const app = new App();
app.run().then(_ => {
  console.log('extracted then generated');
});

// parse figma file
// gather data
// adopt data to template
// export as a swift file
