import * as THREE from 'three';

export class BoundingBox {
  public mesh: THREE.Mesh;
  public facePlanes: THREE.Mesh[] = [];

  constructor(
    public length = 1,
    public width = 1,
    public height = 1,
    public position = new THREE.Vector3(0, 0, 0),
    public color = 0xffff00
  ) {
    this.mesh = this._createBoxMesh();
    this.mesh.position.copy(this.position);
    this._createFacePlanes();
  }

  private _createBoxMesh(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(this.length, this.height, this.width);
    const material = new THREE.MeshBasicMaterial({ color: this.color, wireframe: true });
    return new THREE.Mesh(geometry, material);
  }

  private _createFacePlanes() {
    const half = new THREE.Vector3(this.length / 2, this.height / 2, this.width / 2);
  
    const definitions = [
      { axis: new THREE.Vector3(1, 0, 0), pos: new THREE.Vector3(half.x, 0, 0), rot: [0, Math.PI / 2, 0], size: [this.width, this.height] },
      { axis: new THREE.Vector3(-1, 0, 0), pos: new THREE.Vector3(-half.x, 0, 0), rot: [0, Math.PI / 2, 0], size: [this.width, this.height] },
      { axis: new THREE.Vector3(0, 1, 0), pos: new THREE.Vector3(0, half.y, 0), rot: [Math.PI / 2, 0, 0], size: [this.length, this.width] },
      { axis: new THREE.Vector3(0, -1, 0), pos: new THREE.Vector3(0, -half.y, 0), rot: [Math.PI / 2, 0, 0], size: [this.length, this.width] },
      { axis: new THREE.Vector3(0, 0, 1), pos: new THREE.Vector3(0, 0, half.z), rot: [0, 0, 0], size: [this.length, this.height] },
      { axis: new THREE.Vector3(0, 0, -1), pos: new THREE.Vector3(0, 0, -half.z), rot: [0, 0, 0], size: [this.length, this.height] }
    ];
  
    // Clean up old planes
    this.facePlanes.forEach(f => this.mesh.remove(f));
    this.facePlanes = [];
  
    definitions.forEach((def, i) => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(def.size[0], def.size[1]),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          opacity: 0.1,
          transparent: true,
          side: THREE.DoubleSide
        })
      );
      plane.position.copy(def.pos);
      plane.rotation.set(...(def.rot as [number, number, number]));
      plane.userData.axis = def.axis;
      this.mesh.add(plane);
      this.facePlanes.push(plane);
    });
  }
  

  public setDimensions(length: number, width: number, height: number) {
    if (length <= 0 || width <= 0 || height <= 0) {
      console.warn("Invalid dimensions.");
      return;
    }
    this.length = length;
    this.width = width;
    this.height = height;
    const newGeometry = new THREE.BoxGeometry(length, height, width);
    this.mesh.geometry.dispose();
    this.mesh.geometry = newGeometry;
    this._createFacePlanes();
  }

  public getDimensions(): { length: number; width: number; height: number } {
    return {
      length: this.length,
      width: this.width,
      height: this.height
    };
  }

  public resizeAlongAxis(axis: THREE.Vector3, delta: number) {
    if (axis.x !== 0) this.setDimensions(this.length + delta * axis.x, this.width, this.height);
    if (axis.y !== 0) this.setDimensions(this.length, this.width, this.height + delta * axis.y);
    if (axis.z !== 0) this.setDimensions(this.length, this.width + delta * axis.z, this.height);
  }
}
