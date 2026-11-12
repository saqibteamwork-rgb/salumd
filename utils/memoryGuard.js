'use strict';
const os = require('os');

const pruners = new Map();

function canAllocate(bytes = 0) {
  try {
    const free = os.freemem();
    return free > (bytes + 25 * 1024 * 1024);
  } catch {
    return true;
  }
}

function level() {
  try {
    const free = os.freemem();
    if (free < 30 * 1024 * 1024) return 'critical';
    return 'ok';
  } catch {
    return 'ok';
  }
}

function registerPrune(name, fn) {
  if (typeof fn === 'function') {
    pruners.set(name, fn);
  }
}

function pruneAll(sev = 'normal') {
  for (const [name, fn] of pruners) {
    try {
      fn(sev);
    } catch (e) {
      console.error(`[memoryGuard] prune error in ${name}:`, e.message);
    }
  }
}

class BoundedMap extends Map {
  constructor(maxSize = 500) {
    super();
    this.maxSize = maxSize;
  }
  set(key, value) {
    if (this.size >= this.maxSize) {
      const firstKey = this.keys().next().value;
      this.delete(firstKey);
    }
    return super.set(key, value);
  }
}

module.exports = {
  canAllocate,
  level,
  registerPrune,
  pruneAll,
  BoundedMap
};
