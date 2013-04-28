if (!DemoPlayer) {
  var DemoPlayer = {}
}

void function(namespace) {
var button,
    audioSource,

    valid = false,
    ready = false,
    playbackIntended = false, // user has pressed the play button

    player,
    nChannels,
    sampleRate,

    bufferSize = 1152,
    fftData = new Float32Array(bufferSize),
    fft = new FFT.complex(bufferSize/2, false);

var frequenciesBuffer;
var visualize;


var init = function(playerButton, file, buffer, visualizeCallback) {
    button = playerButton;
    audioSource = file;
    frequenciesBuffer = buffer;
    visualize = visualizeCallback;
    player = AV.Player.fromFile(audioSource);
    initPlayer(player, button);
}

// Initializers

var initPlayer = function(player, button) {
    ready = false;
    setupEventListeners(player, button);
    setupProcessing(player);
    player.preload();
}

var setupEventListeners = function(player, button) {

    button.addEventListener('click', function(e) {
        intendPlayback(player);
        e.preventDefault();
    }, false);

    document.addEventListener('keyup', function(e) {
        e.which === 32 && togglePlay(player, button);
        e.preventDefault();
    });

    player.on('buffer', function(progress) {
        if(!ready) {
            console.log("Buffering. " + progress);
        }
        if(!ready && playbackIntended) {
            console.log("Hold it! Still buffering.");
        }
    });

    player.on('ready', function() {
        ready = true;
        console.log("Ready.");
        togglePlay(player, button);
    });

    player.on('format', function(format) {
        valid = true;
        nChannels = format.channelsPerFrame;
        sampleRate = format.sampleRate;
        updateInfo();
    });

    player.on('end', function() {
        togglePlay(player, button);
        player = AV.Player.fromFile(audioSource);
        initPlayer(player, button);
    });

    player.on('error', function(error) {
        document.querySelector('.help .extra').classList.add('warning');
        valid = false;
        throw(error);
    });
}

var setupProcessing = function(player) {
    player.filters.push({ process: function(data) {
        fft.process(fftData, 0, 1, data, 0, nChannels, 'real');
        process(frequenciesBuffer, fftData, sampleRate);
        visualize(frequenciesBuffer);
    }});
}

var process = function(output, data, sampleRate) {

    var N = data.length/2,
        nCategories = output.length,
        real, imag,
        magnitude,
        n, i, x;
    
    var bandFrequency = function(band) {
        return sampleRate / N / 2 * (band + 0.5);
    }

    var areaFrequency = function(area) {
        return Math.pow(2, (area + 1)/nCategories * 14);
    }

    // clear buffer before reuse
    for(i = 0; i < output.length; i++) {
        output[i] = 0;
    }

    for (n = i = x = 0; n < N; n++, x++) {
        real = data[2*n];
        imag = data[2*n+1];

        magnitude = (2/N) * Math.sqrt(real * real + imag * imag);

        if (bandFrequency(n) > areaFrequency(i)) {
            if (x > 0) {
                output[i] /= x;
            }
            i++;
            x = 0;
        }   
        output[i] += magnitude;
    }
}

var togglePlay = function(player, button) {
    var playSymbol = "&#57415;",
        pauseSymbol = "&#57417;";

    if (player.playing) {
        button.innerHTML = playSymbol;
    } else {
        button.innerHTML = pauseSymbol;
    }

    player.togglePlayback();
}

var updateInfo = function() {
  document.querySelector('.help').classList.add('fadeout');
  document.querySelector('.info').classList.add('fadein');
}

var intendPlayback = function(player) {
    playbackIntended = true;
}

var playing = function() {
    if (!player) return false;

    return player.playing;
}

namespace.init = init;
namespace.initialized = function() {
    if (player) {
        return true;
    }
    return false;
}
namespace.playing = playing;
namespace.togglePlay = function() {
    if (player) {
        togglePlay(player, button);
    }
}

namespace.valid = function() {
  return valid;
}

}(DemoPlayer);
