import * as THREE from 'three';
import { getViewerElements } from './viewer';
import { BoundingBox } from './boundingBox';

let mode: 'idle' | 'placing' | 'resizing' | 'moving' = 'idle';
let boxes: BoundingBox[] = [];
let activeBox: BoundingBox | null = null;
let pointerDown = false;
let dragAxis = new THREE.Vector3();
let dragOffset = new THREE.Vector3();
let movePlane: THREE.Plane | null = null;
let moveOffset = new THREE.Vector3();

export function initBoxBuilder() {
  const { scene, camera, renderer, controls } = getViewerElements();
  const raycaster = new THREE.Raycaster();

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  ground.rotateX(-Math.PI / 2);
  scene.add(ground);

  // 🔑 Mode switching
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'n') {
      mode = 'placing';
      controls.enabled = false;
      console.log("🟩 Placement mode: Click to place a new box.");
    }

    if (key === 'm') {
      if (boxes.length > 0) {
        mode = 'moving';
        console.log("🔄 Move mode: Click any box center to move.");
      }
    }

    if (key === 'r') {
      if (boxes.length > 0) {
        mode = 'resizing';
        console.log("📐 Resize mode: Click any face to resize.");
      }
    }
  });

  // 🖱 Pointer move — move or resize
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!pointerDown || !activeBox) return;

    const intersect = getIntersect(
      e,
      camera,
      renderer,
      mode === 'moving' ? [activeBox.centerHandle] : activeBox.facePlanes
    );
    if (!intersect) return;

    const mouse = getMouseVector(e, renderer);
    raycaster.setFromCamera(mouse, camera);

    if (mode === 'resizing') {
      const delta = intersect.point.clone().sub(dragOffset);
      const movement = dragAxis.dot(delta);
      activeBox.resizeAlongAxis(dragAxis, movement);
      dragOffset.copy(intersect.point);
    } else if (mode === 'moving' && movePlane) {
      const hitPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(movePlane, hitPoint)) {
        const newPos = hitPoint.sub(moveOffset);
        activeBox.mesh.position.copy(newPos);
      }
    }
  });

  // 🖱 Pointer down
  renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerDown = true;

    const { camera, renderer, controls } = getViewerElements();

    if (mode === 'placing') {
      const hit = getIntersect(e, camera, renderer, [ground]);
      if (!hit) return;

      const box = new BoundingBox(1, 1, 1, hit.point);
      boxes.push(box);
      scene.add(box.mesh);
      mode = 'idle';
      controls.enabled = true;
      return;
    }

    // Check all boxes
    for (const box of boxes) {
      const targets = mode === 'moving' ? [box.centerHandle] : box.facePlanes;
      const intersect = getIntersect(e, camera, renderer, targets);

      if (intersect) {
        activeBox = box;

        const mouse = getMouseVector(e, renderer);
        raycaster.setFromCamera(mouse, camera);

        if (mode === 'resizing') {
          dragAxis.copy(intersect.object.userData.axis).normalize();
          dragOffset.copy(intersect.point);
          controls.enabled = false;
          console.log("📐 Resizing on axis:", dragAxis);
        } else if (mode === 'moving') {
          movePlane = new THREE.Plane();
          movePlane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(new THREE.Vector3()),
            box.mesh.position
          );

          const hitPoint = new THREE.Vector3();
          if (raycaster.ray.intersectPlane(movePlane, hitPoint)) {
            moveOffset.copy(hitPoint).sub(box.mesh.position);
            controls.enabled = false;
          }
        }

        break; // stop on first interactive box
      }
    }
  });

  // 🖱 Pointer up
  renderer.domElement.addEventListener('pointerup', () => {
    pointerDown = false;
    movePlane = null;
    dragOffset.set(0, 0, 0);
    dragAxis.set(0, 0, 0);
    getViewerElements().controls.enabled = true;
    activeBox = null;
    if (mode !== 'placing') mode = 'idle';
  });
}

// 🔍 Get intersection
function getIntersect(
  e: PointerEvent,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  objects: THREE.Object3D[]
): THREE.Intersection | null {
  const raycaster = new THREE.Raycaster();
  const mouse = getMouseVector(e, renderer);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(objects, true);
  return hits[0] || null;
}

// 🧮 Convert mouse to normalized device coordinates
function getMouseVector(e: PointerEvent, renderer: THREE.WebGLRenderer): THREE.Vector2 {
  return new THREE.Vector2(
    (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
  );
}
