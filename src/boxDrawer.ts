import * as THREE from 'three';
import { getViewerElements } from './viewer';
import * as dat from 'dat.gui';
import { originalPointCloud } from './fileLoader';

let startPoint: THREE.Vector3 | null = null;
let endPoint: THREE.Vector3 | null = null;
const boxMeshes: THREE.LineSegments[] = [];

let boundingBoxMode = false;

const guiData = { enabled: false };
const gui = new dat.GUI();
gui.add(guiData, 'enabled').name('Draw Bounding Box').listen();

export function initBoxDrawer() {
  const { camera, renderer, scene } = getViewerElements();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'b') {
      boundingBoxMode = !boundingBoxMode;
      guiData.enabled = boundingBoxMode;
      gui.updateDisplay();
    }

    if (e.key.toLowerCase() === 'e') {
      exportPointsInsideBoxes(scene);
    }
  });

  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mouseup', onMouseUp);

  function getIntersect(event: MouseEvent): THREE.Vector3 | null {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    return intersects[0]?.point ?? null;
  }

  function onMouseDown(event: MouseEvent) {
    if (!boundingBoxMode || event.button !== 2) return;
    startPoint = getIntersect(event);
  }

  function onMouseUp(event: MouseEvent) {
    if (!boundingBoxMode || event.button !== 2 || !startPoint) return;
    endPoint = getIntersect(event);
    if (!endPoint) return;

    const size = new THREE.Vector3(
      Math.abs(endPoint.x - startPoint.x),
      Math.abs(endPoint.y - startPoint.y),
      Math.abs(endPoint.z - startPoint.z)
    );
    const center = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const line = new THREE.LineSegments(wireframe, material);
    line.position.copy(center);

    scene.add(line);
    boxMeshes.push(line);

    startPoint = null;
    endPoint = null;
  }
}

function exportPointsInsideBoxes(scene: THREE.Scene) {
  if (!originalPointCloud) {
    alert('No point cloud loaded.');
    return;
  }

  const geometry = originalPointCloud.geometry;
  const positions = geometry.attributes.position.array;
  const insidePoints: number[][] = [];

  for (const boxMesh of boxMeshes) {
    const box = new THREE.Box3().setFromObject(boxMesh);
    for (let i = 0; i < positions.length; i += 3) {
      const point = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      if (box.containsPoint(point)) {
        insidePoints.push([point.x, point.y, point.z]);
      }
    }
  }

  const json = JSON.stringify({ points: insidePoints }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected_points.json';
  a.click();

  console.log(`Exported ${insidePoints.length} points inside bounding boxes`);
}
