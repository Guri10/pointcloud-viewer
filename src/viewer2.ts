// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// export let scene: THREE.Scene;
// export let camera: THREE.PerspectiveCamera;
// export let renderer: THREE.WebGLRenderer;
// export let controls: OrbitControls;

// export function initViewer() {
//   scene = new THREE.Scene();
//   scene.background = new THREE.Color(0x222222);

//   camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//   camera.position.set(2, 2, 4);

//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   document.body.appendChild(renderer.domElement);

//   controls = new OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true;

//   window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   });

//   animate();
// }

// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }

// export function getViewerElements() {
//   return { scene, camera, renderer, controls };
// }
