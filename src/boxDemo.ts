// import * as THREE from 'three';
// import { getViewerElements } from './viewer2';
// import { BoundingBox } from './boundingBox';

// let currentBox: BoundingBox;
// let pointerDown = false;
// let dragAxis = new THREE.Vector3();
// let dragOffset = new THREE.Vector3();

// export function initBoxDemo() {
//   const { scene, camera, renderer, controls } = getViewerElements();
//   const raycaster = new THREE.Raycaster();
//   const mouse = new THREE.Vector2();

//   // Create box at center
//   currentBox = new BoundingBox(1, 1, 1, new THREE.Vector3(0, 0, 0));
//   scene.add(currentBox.mesh);

//   renderer.domElement.addEventListener('pointermove', (e) => {
//     if (!pointerDown) {
//       const intersect = getIntersect(e, camera, renderer, currentBox.facePlanes);
//       currentBox.facePlanes.forEach(p => {
//         (p.material as THREE.MeshBasicMaterial).opacity = p === intersect?.object ? 0.4 : 0.1;
//       });
//     } else {
//       const intersect = getIntersect(e, camera, renderer, currentBox.facePlanes);
//       if (!intersect) return;
//       const delta = intersect.point.clone().sub(dragOffset);
//       const movement = dragAxis.dot(delta);

//       currentBox.resizeAlongAxis(dragAxis, movement);
//       dragOffset.copy(intersect.point);
//     }
//   });

//   renderer.domElement.addEventListener('pointerdown', (e) => {
//     const intersect = getIntersect(e, camera, renderer, currentBox.facePlanes);
//     if (intersect) {
//       pointerDown = true;
//       dragAxis.copy(intersect.object.userData.axis).normalize();
//       dragOffset.copy(intersect.point);
//       controls.enabled = false;
//     }
//   });

//   renderer.domElement.addEventListener('pointerup', () => {
//     pointerDown = false;
//     controls.enabled = true;
//   });
// }

// function getIntersect(
//   e: PointerEvent,
//   camera: THREE.Camera,
//   renderer: THREE.WebGLRenderer,
//   objects: THREE.Object3D[]
// ): THREE.Intersection | null {
//   const mouse = new THREE.Vector2(
//     (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
//     -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
//   );
//   const raycaster = new THREE.Raycaster();
//   raycaster.setFromCamera(mouse, camera);
//   const hits = raycaster.intersectObjects(objects, true);
//   return hits[0] || null;
// }
