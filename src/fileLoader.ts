import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import * as THREE from 'three';
import { scene } from './viewer';

export let originalPointCloud: THREE.Points | null = null;

export function handleFileUpload() {
  const input = document.getElementById('upload') as HTMLInputElement;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const loader = new PCDLoader();

      const parsed = loader.parse(buffer);
      parsed.geometry.center(); // Center cloud at origin

      const shaderMaterial = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          size: { value: 3 },
          scale: { value: 1 },
          opacity: { value: 1.0 },
          shapeToggle: { value: 1 },
          annotationTexture: { value: null }, // placeholder
        },
        vertexShader: `
          uniform float size;
          uniform float scale;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (scale / length(mvPosition.xyz));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float opacity;
          uniform float shapeToggle;
          varying vec3 vColor;
          void main() {
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if (shapeToggle > 0.5 && ll > 0.5) discard;
            gl_FragColor = vec4(vColor, opacity);
          }
        `,
        vertexColors: true
      });

      const cloud = new THREE.Points(parsed.geometry, shaderMaterial);
      cloud.name = file.name;
      scene.add(cloud);
      originalPointCloud = cloud;

      console.log(`Point cloud loaded: ${file.name}`);
    };

    reader.readAsArrayBuffer(file);
  });
}
