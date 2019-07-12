import * as _ from 'lodash';
import { Node } from 'figma-types/types/node';
import { Rectangle } from 'figma-types/types/rectangle';
import { ButtonConfig, Insets } from './ButtonConfig';
import { Figma } from './Figma';
import { NodeType } from 'figma-types/types/enums';
import { TypeStyle } from 'figma-types/types/type-style';
import { Paint } from 'figma-types/types/paint';
import { DataConfig } from './DataConfig';


export class DataTranslator {
    /**
     * Limitation:
     *  - keyword shuold not be duplicated
     *  - last matched node is used if there are multiple keyword matched
     *  -
     * @param nodes
     * @param keywords
     */
    translate(nodes: Node[], keywords: string[]): DataConfig[] {
        const configs: DataConfig[] = [];
        for (const node of nodes) {
            const lastMatchedKeyword = keywords.filter(keyword => {
                const matched = node.name.match(new RegExp(keyword, 'gi'));
                return matched && matched.length;
            }).reduce((_, current) => current, null);

            // check if the keyord has already translated.
            // If yes, just skip at this time not to override previous config.
            const duplicates = configs.filter(config => config.keyword === lastMatchedKeyword);
            if (duplicates && duplicates.length > 0) {
                continue;
            }

            let dataConfig: DataConfig;
            switch (lastMatchedKeyword) {
                case 'textButton':
                    dataConfig = this.translateTextButton(node);
                default:
                    break;
            }
            if (dataConfig){
                configs.push(dataConfig);
            }
        }

        return configs;
    }

    /**
     * Limitations:
     *  - `node` shuold have only one TEXT
     *  - `node` shuold have node in which name is `buttonShape`
     *  - Paint is just used for fills[0]
     *  - all the cornerRadius are same currently
     * @param node
     */
    translateTextButton(node: Node): DataConfig {
        const figma = new Figma();

        // Lookup a node which has 'TEXT' NodeType
        let nodeType: NodeType = 'TEXT';
        const textNode = figma.getNode(node, nodeType);
        if (!textNode) {
            throw new Error(`no ${nodeType} node within ${node.name}`);
        }

        // Lookup a node which has 'RECTANGLE' NodeType
        nodeType = 'RECTANGLE';
        const buttonRectangle = figma.getNode(node, nodeType);
        if (!buttonRectangle) {
            throw new Error(`no ${nodeType} node within ${node.name}`);
        }

        // Lookup a node where the name is 'buttonShape'.
        let nodeName = 'buttonShape';
        const buttonShape = figma.getNode(node, nodeName);
        if (!buttonShape) {
            throw new Error(`no ${nodeName} node within ${node.name}`);
        }

        const textNodeStyle: TypeStyle = textNode.style;
        const textFill: Paint|null = _.get(textNode, 'fills[0]', null);
        const bgFill: Paint|null = _.get(buttonRectangle, 'fills[0]', null);
        const border: Paint|null = _.get(buttonRectangle, 'strokes[0]', null);
        const outerBox: Rectangle = node.absoluteBoundingBox;
        const innerBox: Rectangle = textNode.absoluteBoundingBox;
        const insets: Insets = {
            top: Math.abs(outerBox.y - innerBox.y),
            left: Math.abs(outerBox.x - innerBox.x),
            right: Math.abs((outerBox.x + outerBox.width) - (innerBox.x + innerBox.width)),
            bottom: Math.abs((outerBox.y + outerBox.height) - (innerBox.y + innerBox.height))
        }
        let cornerRadius: number|null = _.get(buttonShape,'rectangleCornerRadii[0]', null);
        if (cornerRadius && cornerRadius > 99999) {
            cornerRadius = 0;   //  it cannot be that big, so just make it zero.
        }


        const config = new ButtonConfig();
        config.title = textNode.characters;
        if (textNodeStyle) {
            config.font = {
                name: textNodeStyle.fontPostScriptName,
                size: textNodeStyle.fontSize
            };
        }

        if (textFill){
            config.textColor = {
                r: textFill.color.r,
                g: textFill.color.g,
                b: textFill.color.b,
                a: textFill.color.a,
            }
        }

        if(bgFill) {
            config.bgColor = {
                r: bgFill.color.r,
                g: bgFill.color.g,
                b: bgFill.color.b,
                a: bgFill.color.a,
            }
        }

        if (border) {
            config.borderColor = {
                r: border.color.r,
                g: border.color.g,
                b: border.color.b,
                a: border.color.a,
            }
        }

        config.borderWidth = buttonRectangle.strokeWeight;
        if (cornerRadius){
            config.cornerRadius = cornerRadius;
        }
        config.insets = insets;

        return config;
    }
}