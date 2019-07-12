import { DataConfig } from './DataConfig';

export interface Font {
    name?: string;
    size: number;
}

export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

export class Insets {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export class ButtonConfig implements DataConfig {
    keyword: string;
    title?: string;
    font?: Font;
    textColor?: Color;
    bgColor?: Color;
    borderColor?: Color;
    borderWidth?: number;
    cornerRadius?: number;
    insets?: Insets;
}