import * as THREE from 'three';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

window.onload = function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    scene.add(camera);

    let clickActivated = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5); 
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 4); 
    directionalLight.position.set(2, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    new OrbitControls(camera, renderer.domElement);

    const markerRoot = new THREE.Group();
    scene.add(markerRoot);

    const arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
        sourceWidth: window.innerWidth,
        sourceHeight: window.innerHeight,
        displayWidth: window.innerWidth,
        displayHeight: window.innerHeight,
    });

    arToolkitSource.init(function onReady() {
        setTimeout(onResize, 1000);
    });

    window.addEventListener('resize', onResize);

    function onResize() {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
        }
    }

    const arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://rawcdn.githack.com/AR-js-org/AR.js/master/data/data/camera_para.dat',
        detectionMode: 'mono',
        maxDetectionRate: 30,
    });

    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    const markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: 'https://rawcdn.githack.com/AR-js-org/AR.js/master/data/data/patt.hiro',
    });

    const loader = new GLTFLoader();

    loader.load(
        'bank-vault/source/Bankvault.glb',
        function (gltf) {
            const model = gltf.scene;
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            markerRoot.add(model);
            model.visible = false;
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened while loading the first GLTF model:', error);
        }
    );

    loader.load(
        'pile_of_coins.glb',
        function (gltf) {
            const model1 = gltf.scene;
            model1.scale.set(14, 14, 14);
            model1.position.set(-2, 3.8, 3);
            markerRoot.add(model1);
            model1.visible = false;
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened while loading the second GLTF model:', error);
        }
    );

    document.addEventListener('click', function () {
        clickActivated = true;
        markerRoot.children.forEach(child => {
            child.visible = true;
        });
    });

    function animate() {
        requestAnimationFrame(animate);

        if (arToolkitSource.ready !== false) {
            arToolkitContext.update(arToolkitSource.domElement);
        }

        if (!clickActivated) {
            markerRoot.children.forEach(child => {
                child.visible = false;
            });
        }

        renderer.render(scene, camera);
    }

    animate();
};


