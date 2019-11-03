const maxIndexOfObject = (object, depth = 0) => {
  if (depth === 0) {
    const indices = Object.keys(object)
      .map(k => Number.parseInt(k, 10))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => b - a);
    return indices.length === 0 ? -1 : indices[0];
  } else {
    return Object.values(object).reduce((maxIndex, value) => {
      if (typeof value === "object") {
        const objMaxIndex = maxIndexOfObject(value, depth - 1);
        return objMaxIndex > maxIndex ? objMaxIndex : maxIndex;
      } else {
        return maxIndex;
      }
    }, -1);
  }
};

class Sparse3DArray {
  meta;
  constructor() {
    this.meta = { objects: 0, values: 0, lengths: { x: 0, y: 0, z: 0 } };
    ["get", "set", "unset"].forEach(
      method => (this[method] = this[method].bind(this))
    );
  }

  get(x, y, z) {
    return this[x] && this[x][y] ? this[x][y][z] : undefined;
  }

  set(x, y, z, value) {
    if (!this[x]) {
      this[x] = {};
      this.meta.objects++;
      if (x >= this.meta.lengths.x) {
        this.meta.lengths.x = x + 1;
      }
    }
    if (!this[x][y]) {
      this[x][y] = {};
      this.meta.objects++;
      if (y >= this.meta.lengths.y) {
        this.meta.lengths.y = y + 1;
      }
    }
    this[x][y][z] = value;
    this.meta.values++;
    if (z >= this.meta.lengths.z) {
      this.meta.lengths.z = z + 1;
    }
    return value;
  }

  unset(x, y, z) {
    if (this[x] && this[x][y]) {
      delete this[x][y][z];
      this.meta.values--;
      if (z + 1 === this.meta.lengths.z) {
        this.meta.lengths.z = maxIndexOfObject(this, 2) + 1;
      }
      if (Object.keys(this[x][y]).length === 0) {
        delete this[x][y];
        this.meta.objects--;
        if (y + 1 === this.meta.lengths.y) {
          this.meta.lengths.y = maxIndexOfObject(this, 1) + 1;
        }
        if (Object.keys(this[x]).length === 0) {
          delete this[x];
          this.meta.objects--;
          if (x + 1 === this.meta.lengths.x) {
            this.meta.lengths.x = maxIndexOfObject(this) + 1;
          }
        }
      }
    }
  }
}

module.exports = Sparse3DArray;
