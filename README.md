# tf-classification

Draw a doodle on a canvas and a small convolutional network, trained in your browser with TensorFlow.js, guesses what it is.

<!-- Add a screenshot or GIF here: docs/screenshot.png -->

## What it does

- On page load the app fetches `assets/data/data.json`: 400 28x28 drawings from the Google Quick, Draw! dataset across six classes (square, star, cat, circle, t-shirt, tent). It previews them on the canvas and trains a CNN on them for 15 epochs. Progress and loss are shown next to the canvas.
- Once training finishes, draw on the canvas. On desktop the model predicts while you draw. On mobile, press **Predict**. The predicted class and its probability are shown.
- **Clear** (or the `C` key) wipes the canvas.
- **Push** turns the current drawing into a 28x28 vector, adds it to an in-memory training set (in Redux) under the class picked in the dropdown, and copies the vector to the clipboard. **Train** then trains the same model on the pushed samples for 100 epochs.

The model is defined in `src/components/sketch.js`: two conv + max-pool blocks, a dense softmax layer, and the Adam optimizer with categorical cross-entropy.

## Tech stack

- TensorFlow.js 1.x
- React 16, Redux, react-redux
- Ant Design 3 (notifications), react-select
- Stylus with CSS modules
- Webpack 4, Babel 7

## Getting started

Requires Node.js and npm.

```bash
npm ci
npm run dev     # dev server at http://localhost:3000
npm run build   # production build into dist/
```

Webpack 4 does not run on Node.js 17 or newer without the legacy OpenSSL provider:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run dev
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

### Regenerating the training data

`quickdraw.js` (in the repo root) uses the `quickdraw.js` npm package to build `src/assets/data/data.json`. The class list and sample count are set at the top of the script. The package has to download the drawings for those categories first; see its README for the `import` step. Then run:

```bash
node quickdraw.js
```

If you change the classes, keep `NUM_OUTPUT_CLASSES` in `src/components/sketch.js` in step with them.

## Project structure

```
quickdraw.js                 Node script that builds the training data JSON
src/
  index.html, index.js       page shell, React + Redux bootstrap
  store/index.js             Redux reducers (pushed samples, training status)
  utils.js                   debounce, data fetch, mobile detection
  assets/data/data.json      training data (copied to dist/assets at build time)
  components/
    index.js                 App component
    container.js             react-redux connect helper
    sketch.js                TensorFlow.js model, training and prediction
    canvas.js                drawing canvas and 28x28 downsampling
    CanvasView/              main UI: canvas, buttons, training status
    Background/              animated background
    Speech/                  speech recognition experiment (not rendered)
webpack.config.js
```

## Known issues

- The dropdown used by **Push** offers "zero", "one" and "two". **Train** labels results with `classNames` from the Redux store ("smiley face", "sad face", "three", ...), so after custom training the names shown do not match the dropdown.
- The toolchain is old: Webpack 4, babel-loader 7 through the `babel-core` bridge, React 16, antd 3. Moving to Vite, React 18 and current TensorFlow.js would be the next step.
- The model lives in a module-level variable in `sketch.js`, and the TensorFlow.js library is exposed globally as `window.tf`.
- There are no tests.

## License

MIT, see [LICENSE](LICENSE).
