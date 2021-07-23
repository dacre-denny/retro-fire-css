if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('/src/worklet.js');
} else {
  console.warn('RetroFireCSS: CSS Paint API not supported by your browser');
}
