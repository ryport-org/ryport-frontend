const storageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: storageMock(),
    writable: true,
  });
  Object.defineProperty(window, "sessionStorage", {
    value: storageMock(),
    writable: true,
  });
}

if (typeof globalThis !== "undefined") {
  if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== "function") {
    Object.defineProperty(globalThis, "localStorage", {
      value: storageMock(),
      writable: true,
    });
  }
  if (!globalThis.sessionStorage || typeof globalThis.sessionStorage.clear !== "function") {
    Object.defineProperty(globalThis, "sessionStorage", {
      value: storageMock(),
      writable: true,
    });
  }
}
