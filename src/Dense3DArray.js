const debug = require("debug")("sparse-cube-model:Dense3DArray");
const methods = ["get", "set"];
const defaultZ = 0;

class Dense3DArray {
  lengths;
  #defaultValue;

  constructor(defaultValue = 0) {
    this.lengths = { x: 0, y: 0, z: 0 };
    this.#defaultValue = defaultValue;
    methods.forEach(method => (this[method] = this[method].bind(this)));
  }

  // safety only, normally access direct
  get(x, y, z = defaultZ) {
    const { x: lenX, y: lenY, z: lenZ } = this.lengths;
    if (x >= lenX)
      throw new RangeError(`${x} is greater than max x index of ${lenX - 1}`);
    if (y >= lenY)
      throw new RangeError(`${y} is greater than max y index of ${lenY - 1}`);
    if (z >= lenZ)
      throw new RangeError(`${z} is greater than max z index of ${lenZ - 1}`);
    return this[x][y][z];
  }

  set(x, y, z, value) {
    if (value == null) {
      value = z;
      z = defaultZ;
    }
    let { x: lenX, y: lenY, z: lenZ } = this.lengths;
    if (x >= lenX) {
      for (let i = lenX; i <= x; i++) {
        this[i] = {};
        for (let j = 0; j < lenY; j++) {
          this[i][j] = {};
          for (let k = 0; k < lenZ; k++) {
            this[i][j][k] = this.#defaultValue;
          }
        }
      }
      lenX = x + 1;
      this.lengths.x = lenX;
    }
    if (y >= lenY) {
      for (let i = 0; i < lenX; i++) {
        for (let j = lenY; j <= y; j++) {
          this[i][j] = {};
          for (let k = 0; k < lenZ; k++) {
            this[i][j][k] = this.#defaultValue;
          }
        }
      }
      lenY = y + 1;
      this.lengths.y = lenY;
    }
    if (z >= lenZ) {
      for (let i = 0; i < lenX; i++) {
        for (let j = 0; j < lenY; j++) {
          for (let k = lenZ; k <= z; k++) {
            this[i][j][k] = this.#defaultValue;
          }
        }
      }
      lenZ = z + 1;
      this.lengths.z = lenZ;
    }
    this[x][y][z] = value;
  }
}

module.exports = Dense3DArray;
