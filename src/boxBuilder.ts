import * as THREE from 'three';
import { getViewerElements } from './viewer';
import { BoundingBox } from './boundingBox.ts';

let mode: 'idle' | 'placing' | 'dragging' = 'idle';
let currentBox: BoundingBox | null = null;
let dragOffset = new THREE.Vector3();
let dragAxis = new THREE.Vector3();
let pointerDown = false;

export function initBoxBuilder() {
  const { scene, camera, renderer, controls } = getViewerElements();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  ground.rotateX(-Math.PI / 2);
  scene.add(ground);

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n') {
      mode = 'placing';
      controls.enabled = false;
      console.log("🟩 Placement mode activated. Click on ground to place a box.");
    }
  });

  renderer.domElement.addEventListener('pointermove', (e) => {
    if (mode !== 'dragging' || !currentBox || !pointerDown) return;

    const dragIntersect = getMouseIntersection(e, camera, renderer, currentBox.facePlanes);
    if (!dragIntersect) {
      console.warn('⚠️ Drag intersect is null.');
      return;
    }

    const delta = dragIntersect.point.clone().sub(dragOffset);
    const movement = dragAxis.dot(delta); // Project delta onto drag axis

    currentBox.resizeAlongAxis(dragAxis, movement);
    dragOffset.copy(dragIntersect.point); // Update for continuous movement
  });

  renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerDown = true;

    const { scene, camera, renderer, controls } = getViewerElements();

    if (mode === 'placing') {
      const groundHit = getMouseIntersection(e, camera, renderer, [ground]);
      if (!groundHit) return;

      currentBox = new BoundingBox();
      currentBox.mesh.position.copy(groundHit.point);
      scene.add(currentBox.mesh);
      mode = 'idle';
      controls.enabled = true;
      return;
    }

    if (!currentBox) return;

    const intersect = getMouseIntersection(e, camera, renderer, currentBox.facePlanes);
    if (intersect) {
      dragAxis = intersect.object?.userData.axis.clone();
      dragOffset.copy(intersect.point);
      mode = 'dragging';
      controls.enabled = false;

      console.log('👉 Drag started');
      console.log('📐 Axis:', dragAxis);
      console.log('📍 Offset:', dragOffset);
    }
  });

  renderer.domElement.addEventListener('pointerup', () => {
    pointerDown = false;
    mode = 'idle';
    getViewerElements().controls.enabled = true;
    console.log('✅ Drag complete.');
  });
}

function getMouseIntersection(
  event: PointerEvent,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  objects: THREE.Object3D[]
): THREE.Intersection | null {
  const mouse = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects, true);
  return intersects[0] || null;
}
