const iterate3D = require("./iterate3D");

function validate(coords) {
  const { x, y, z, numIndices } = coords;
  const { x: lenX, y: lenY, z: lenZ } = this.lengths;
  if (x !== undefined && x >= lenX)
    throw new RangeError(`${x} is greater than max x index of ${lenX - 1}`);
  if (y !== undefined && y >= lenY)
    throw new RangeError(`${y} is greater than max y index of ${lenY - 1}`);
  if (z !== undefined && z >= lenZ)
    throw new RangeError(`${z} is greater than max z index of ${lenZ - 1}`);
  if (numIndices) {
    const count = ["x", "y", "z"].reduce(
      (count, property) => (coords[property] === undefined ? count : count + 1),
      0
    );
    if (numIndices !== count) {
      throw new Error(`Number of indices must be ${numIndices}.`);
    }
  }
}

class Dense3DArray {
  lengths;
  #defaultValue;
  #validate;

  constructor({ defaultValue = 0 } = {}) {
    this.lengths = { x: 0, y: 0, z: 0 };
    this.#defaultValue = defaultValue;
    ["get", "set", "range", "isEmpty", "clone"].forEach(
      method => (this[method] = this[method].bind(this))
    );
    this.#validate = validate.bind(this);
  }

  // safety only, normally access direct
  get(x, y, z) {
    const { x: lenX, y: lenY, z: lenZ } = this.lengths;
    this.#validate({ x, y, z });
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

  delete({ x, y, z } = {}) {
    this.#validate({ x, y, z, numIndices: 1 });
    const { x: lenX, y: lenY, z: lenZ } = this.lengths;

    if (x !== undefined) {
      const indexToDelete = lenX - 1;
      for (let i = x + 1; i <= indexToDelete; i++) {
        this[i - 1] = this[i];
      }
      delete this[indexToDelete];
      this.lengths = {
        x: indexToDelete,
        y: indexToDelete === 0 ? 0 : lenY,
        z: indexToDelete === 0 ? 0 : lenZ
      };
    }

    if (y !== undefined) {
      const indexToDelete = lenY - 1;
      for (let i = 0; i < lenX; i++) {
        for (let j = y + 1; j <= indexToDelete; j++) {
          this[i][j - 1] = this[i][j];
        }
        delete this[i][indexToDelete];
      }
      if (indexToDelete === 0) {
        for (let x = 0; x < lenX; x++) {
          delete this[x];
        }
        this.lengths = { x: 0, y: 0, z: 0 };
      } else {
        this.lengths = {
          x: lenX,
          y: indexToDelete,
          z: lenZ
        };
      }
    }

    if (z !== undefined) {
      const indexToDelete = lenZ - 1;
      for (let i = 0; i < lenX; i++) {
        for (let j = 0; j < lenY; j++) {
          for (let k = z + 1; k <= indexToDelete; k++) {
            this[i][j][k - 1] = this[i][j][k];
          }
          delete this[i][j][indexToDelete];
        }
      }
      if (indexToDelete === 0) {
        for (let x = 0; x < lenX; x++) {
          delete this[x];
        }
        this.lengths = { x: 0, y: 0, z: 0 };
      } else {
        this.lengths = {
          x: lenX,
          y: lenY,
          z: indexToDelete
        };
      }
    }
  }

  range({ x, y, z } = {}) {
    const { x: lenX, y: lenY, z: lenZ } = this.lengths;
    const values = [];
    if (x !== undefined && y !== undefined && z !== undefined) {
      this.#validate({ x, y, z });
      values.push(this[x][y][z]);
    } else if (x === undefined && y !== undefined && z !== undefined) {
      this.#validate({ y, z });
      for (x = 0; x < this.lengths.x; x++) {
        values.push(this[x][y][z]);
      }
    } else if (x !== undefined && y === undefined && z !== undefined) {
      this.#validate({ x, z });
      for (y = 0; y < this.lengths.y; y++) {
        values.push(this[x][y][z]);
      }
    } else if (x !== undefined && y !== undefined && z === undefined) {
      this.#validate({ x, y });
      for (z = 0; z < this.lengths.z; z++) {
        values.push(this[x][y][z]);
      }
    } else if (x !== undefined && y === undefined && z === undefined) {
      this.#validate({ x });
      for (y = 0; y < this.lengths.y; y++) {
        values[y] = [];
        for (z = 0; z < this.lengths.z; z++) {
          values[y].push(this[x][y][z]);
        }
      }
    } else if (x === undefined && y !== undefined && z === undefined) {
      this.#validate({ y });
      for (x = 0; x < this.lengths.x; x++) {
        values[x] = [];
        for (z = 0; z < this.lengths.z; z++) {
          values[x].push(this[x][y][z]);
        }
      }
    } else if (x === undefined && y === undefined && z !== undefined) {
      this.#validate({ z });
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

  isEmpty() {
    const { x, y, z } = this.lengths;
    return x === 0 && y === 0 && z === 0;
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
