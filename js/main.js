(function() {

function $(s) { return document.querySelector(s); }

var playerButton = $(".play .button"),
    root = $("#visualization"),
    frequencyBins = 1000,
    frequenciesBuffer = new Float32Array(frequencyBins),
    extraBuffer = new Float32Array(frequencyBins);


if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var camera, scene, renderer, composer;
var object, light;

var renderPass, copyPass;

var rgbParams, rgbPass;
var dotScreenParams, dotScreenPass;

var BEAT_HOLD_TIME = 80; //num of frames to hold a beat
var BEAT_DECAY_RATE = 0.99;

var beatCutOff = 0;
var beatTime = 0;

function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 400;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

    object = new THREE.Object3D();
    scene.add( object );

    var geometry = new THREE.SphereGeometry( 1, 4, 4 );
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );

    for ( var i = 0; i < 100; i ++ ) {

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
        mesh.position.multiplyScalar( Math.random() * 400 );
        mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
        object.add( mesh );

    }

    scene.add( new THREE.AmbientLight( 0x222222 ) );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    // postprocessing

    renderPass = new THREE.RenderPass( scene, camera );
    copyPass = new THREE.ShaderPass( THREE.CopyShader );
    dotScreenPass = new THREE.ShaderPass( THREE.DotScreenShader );
    rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );

    dotScreenParams = {
        show: true,
        scale: 5,
    }

    rgbParams = {
        show: true,
        amount: 0.0015,
        angle: 0.0,
    }

    //

    window.addEventListener( 'resize', onWindowResize, false );

    onToggleShaders();
    onParamsChange();

}

function onToggleShaders() {

    //Add shader passes to composer, order is important
    composer = new THREE.EffectComposer( renderer);
    composer.addPass( renderPass );


    if (dotScreenParams.show){
        composer.addPass( dotScreenPass );
    }

    if (rgbParams.show){
        composer.addPass( rgbPass );
    }

    composer.addPass( copyPass );
    copyPass.renderToScreen = true;
}

function onParamsChange() {
    dotScreenPass.uniforms[ "scale" ].value = dotScreenParams.scale;
    rgbPass.uniforms[ "angle" ].value = rgbParams.angle*Math.PI;
    rgbPass.uniforms[ "amount" ].value = rgbParams.amount;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    if (DemoPlayer.playing()) {
        object.rotation.x += 0.005;
        object.rotation.y += 0.01;

        detectBeat(frequenciesBuffer);

        updateParams(beatCutOff);
        TWEEN.update();
    }

    composer.render();

}

function updateParams(intensity) {
    if (intensity) {
        dotScreenParams.scale = ~~(intensity * 100);
        rgbParams.amount = intensity / 10;
        onParamsChange();
    }
}

function onBeat() {
    console.debug("Beat!");

    var tween = new TWEEN.Tween(camera.position)
        .to({
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            z: Math.random() * 10 - 5
        }, 500)
        .easing(TWEEN.Easing.Bounce.Out)
        .start()
}

function detectBeat(data) {
    var n = data.length;

    var i, normLevel;

    var sum = 0;
    var max = 0;

    for(i = 0; i < n; i++) {
        sum += data[i];
        if (data[i] > max) {
            max = data[i];
        }
    }

    var average = sum / n;

    var sensitivity = 1.5;

    normLevel = (average / max) * sensitivity;

    if (normLevel > beatCutOff) {
        onBeat();
        beatCutOff = normLevel * 1.2;
        beatTime = 0;
    } else {
        if (beatTime < BEAT_HOLD_TIME) {
            beatTime++;
        } else {
            beatCutOff *= BEAT_DECAY_RATE;
        }
    }
}

var visualize = function(data) {
    frequenciesBuffer.set(data);
}






function setupFileChooser() {
  chooser = document.createElement('input');
  chooser.setAttribute('type', 'file');
  chooser.style.visibility = 'hidden';

  chooser.onchange = function(e) {
    var file = e.target.files[0];
    DemoPlayer.init(playerButton, file, frequenciesBuffer, visualize);
    DemoPlayer.togglePlay();
  }

  document.body.appendChild(chooser);
}

playerButton.onclick = function() {
    if (DemoPlayer.initialized()) {
        DemoPlayer.togglePlay();
        //this.classList.toggle('pause');
    } else {
      setupFileChooser();
      chooser.click();
    }
}




// Showtime!
init();
animate();


})();
