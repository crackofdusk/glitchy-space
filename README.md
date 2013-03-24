# Glitchy space

This is a music visualization demo using [aurora.js](https://github.com/audiocogs/aurora.js) and [mp3.js](https://github.com/devongovett/mp3.js) for audio decoding and [three.js](https://github.com/mrdoob/three.js/) and [tween.js](https://github.com/sole/tween.js/) for visualizations.

The code was put together quickly at a hackaton. I may or may not clean it up some day.

[Online demo](http://happydawn.github.com/glitchy-space)

Note that the demo relies on WebGL support and Web Audio API support (or, alternatively, the now deprecated Audio Data API). I've only tested it in Chromium 25 during development.

## Usage

1. Open index.html in your browser.
2. Click on the play button to chose a track to play (currently on MP3s supported).
3. ??? (actually, wait a few seconds for the track to start playing)
4. Profit

## Todo

* Support for FLAC, ALAC and AAC
* Better beat detection (possibly using the Echonest API)
* More/better glitch effects?
* Investigate playback problem on Firefox on Linux
