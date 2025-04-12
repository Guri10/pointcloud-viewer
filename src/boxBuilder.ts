import * as THREE from 'three';
import { getViewerElements } from './viewer';

enum BoxMode {
  Idle,
  PickingCorner,
  Rotating,
  Spanning
}

let mode: BoxMode = BoxMode.Idle;
let currentRotation = 0;
let points: THREE.Vector3[] = [];
let tempBox: THREE.Mesh | null = null;
let tempHelper: THREE.AxesHelper | null = null;

export function initBoxBuilder() {
  const { renderer, scene, camera } = getViewerElements();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Key to start placing a new box
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n') {
      console.log("📦 Starting new box: Pick front-top corner");
      resetState(scene);
      mode = BoxMode.PickingCorner;
    }
  });

  // Adjust rotation with scroll wheel
  renderer.domElement.addEventListener('wheel', (e) => {
    if (mode === BoxMode.Rotating) {
      currentRotation += e.deltaY * 0.01;
      updateGhostBox(scene);
    }
  });

  // Clicks for point selection
  renderer.domElement.addEventListener('click', (e) => {
    if (mode === BoxMode.Idle) return;

    // Get clicked 3D point
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length === 0) return;

    const point = intersects[0].point.clone();

    if (mode === BoxMode.PickingCorner) {
      points.push(point);
      currentRotation = 0;
      mode = BoxMode.Rotating;
      createGhostBox(scene);
      console.log("🔁 Scroll to rotate, click again to confirm rotation");
    } else if (mode === BoxMode.Rotating) {
        mode = BoxMode.Spanning;
      console.log("📐 Now define length, width, and height (3 more clicks)");
    } else if (mode === BoxMode.Spanning) {
      if (points.length < 4) {
        const lockedPoint = applyConstraints(point);
        points.push(lockedPoint);
        updateGhostBox(scene);
        if (points.length === 4) {
          finalizeBox(scene);
          resetState(scene);
        }
      }
    }
  });
}

// 🔄 Lock width to Z and height to Y axis
function applyConstraints(point: THREE.Vector3): THREE.Vector3 {
  const base = points[0].clone();
  if (points.length === 2) {
    // lock Z to same value as base
    point.z = base.z;
  } else if (points.length === 3) {
    point.z = points[2].z; // keep same Z as width point
    point.x = points[2].x; // keep same X as width point
  }
  return point;
}

function createGhostBox(scene: THREE.Scene) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
    opacity: 0.5,
    transparent: true,
  });
  tempBox = new THREE.Mesh(geometry, material);
  tempHelper = new THREE.AxesHelper(1);
  tempBox.add(tempHelper);
  scene.add(tempBox);
  updateGhostBox(scene);
}

function updateGhostBox(scene: THREE.Scene) {
  if (!tempBox || points.length < 1) return;

  const origin = points[0];
  const length = points[1] ? points[0].distanceTo(points[1]) : 1;

  tempBox.position.copy(origin);
  tempBox.rotation.y = currentRotation;
  tempBox.scale.set(length, 1, 1);
}

function finalizeBox(scene: THREE.Scene) {
  const base = points[0];
  const lengthVec = new THREE.Vector3().subVectors(points[1], base);
  const widthVec = new THREE.Vector3().subVectors(points[2], points[1]);
  const heightVec = new THREE.Vector3().subVectors(points[3], points[2]);

  const size = new THREE.Vector3(
    lengthVec.length(),
    heightVec.length(),
    widthVec.length()
  );

  const center = base.clone().add(lengthVec).add(heightVec).add(widthVec).multiplyScalar(0.5);

  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true
  });

  const box = new THREE.Mesh(geometry, material);
  box.position.copy(center);
  box.rotation.y = currentRotation;

  scene.add(box);
  console.log("✅ Box placed");
}

function resetState(scene: THREE.Scene) {
  points.length = 0;
  mode = BoxMode.Idle;
  if (tempBox) {
    scene.remove(tempBox);
    tempBox = null;
  }
  if (tempHelper) {
    scene.remove(tempHelper);
    tempHelper = null;
  }
}
