const memory = new Map();

export function readCache(key, load) {
  if (memory.has(key)) return memory.get(key);
  const task = Promise.resolve()
    .then(load)
    .catch((error) => {
      memory.delete(key);
      throw error;
    });
  memory.set(key, task);
  return task;
}

export function dropCache(prefix) {
  for (const key of memory.keys()) {
    if (!prefix || key === prefix || key.startsWith(`${prefix}:`) || key.startsWith(prefix)) memory.delete(key);
  }
}

export function clearDashboardCache() {
  memory.clear();
}
