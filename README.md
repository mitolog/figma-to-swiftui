# figma-to-swiftui

This is a sample project that you can extract components specified by keywords, then generate swiftUI view parts.

Because it's just a experiment, only text button is target.

```zsh

$ git clone git@github.com:mitolog/figma-to-swiftui.git
$ cd figma-to-swiftui

$ yarn install

$ npx tsc

$ cp .env.default .env

# fill `FIGMA_FILE_KEY` and `FIGMA_ACCESS_TOKEN` within `.env` file, then execute below
$ node dist/index.js

```
