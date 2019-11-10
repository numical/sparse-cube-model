const iterate3D = require("./iterate3D");

class Dense3DArray {
  lengths;
  #defaultValue;

  constructor({ defaultValue = 0 } = {}) {
    this.lengths = { x: 0, y: 0, z: 0 };
    this.#defaultValue = defaultValue;
    ["get", "set", "range", "clone"].forEach(
      method => (this[method] = this[method].bind(this))
    );
  }

  // safety only, normally access direct
  get(x, y, z) {
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

  range({ x, y, z }) {
    const { x: lenX, y: lenY, z: lenZ } = this.lengths;
    const values = [];
    if (x && y && z) {
      values.push(this[x][y][z]);
    } else if (x === undefined && y !== undefined && z !== undefined) {
      if (y >= lenY)
        throw new RangeError(`${y} is greater than max y index of ${lenY - 1}`);
      if (z >= lenZ)
        throw new RangeError(`${z} is greater than max z index of ${lenZ - 1}`);
      for (x = 0; x < this.lengths.x; x++) {
        values.push(this[x][y][z]);
      }
    } else if (x !== undefined && y === undefined && z !== undefined) {
      if (x >= lenX)
        throw new RangeError(`${x} is greater than max x index of ${lenX - 1}`);
      if (z >= lenZ)
        throw new RangeError(`${z} is greater than max z index of ${lenZ - 1}`);
      for (y = 0; y < this.lengths.y; y++) {
        values.push(this[x][y][z]);
      }
    } else if (x !== undefined && y !== undefined && z === undefined) {
      if (x >= lenX)
        throw new RangeError(`${x} is greater than max x index of ${lenX - 1}`);
      if (y >= lenY)
        throw new RangeError(`${y} is greater than max y index of ${lenY - 1}`);
      for (z = 0; z < this.lengths.z; z++) {
        values.push(this[x][y][z]);
      }
    } else if (x !== undefined && y === undefined && z === undefined) {
      if (x >= lenX)
        throw new RangeError(`${x} is greater than max x index of ${lenX - 1}`);
      for (y = 0; y < this.lengths.y; y++) {
        values[y] = [];
        for (z = 0; z < this.lengths.z; z++) {
          values[y].push(this[x][y][z]);
        }
      }
    } else if (x === undefined && y !== undefined && z === undefined) {
      if (y >= lenY)
        throw new RangeError(`${y} is greater than max y index of ${lenY - 1}`);
      for (x = 0; x < this.lengths.x; x++) {
        values[x] = [];
        for (z = 0; z < this.lengths.z; z++) {
          values[x].push(this[x][y][z]);
        }
      }
    } else if (x === undefined && y === undefined && z !== undefined) {
      if (z >= lenZ)
        throw new RangeError(`${z} is greater than max z index of ${lenZ - 1}`);
      for (x = 0; x < this.lengths.x; x++) {
        values[x] = [];
        for (y = 0; y < this.lengths.y; y++) {
          values[x].push(this[x][y][z]);
        }
      }
    } else {
      throw new Error("At least one index must be specified.");
    }
    return values;
  }

  clone() {
    const { x: lenX, y: lenY, z: lenZ } = this.lengths;
    const defaultValue = this.#defaultValue;
    const clone = new Dense3DArray({ defaultValue });
    clone.set(lenX - 1, lenY - 1, lenZ - 1, defaultValue);
    iterate3D(lenX, lenY, lenZ, (x, y, z) => {
      clone[x][y][z] = this[x][y][z];
    });
    return clone;
  }
}

module.exports = Dense3DArray;
