import { GlobalJSONContainerStorage, _GlobalJSONStorage } from "./storage";
import { StorageDriver } from "./types";

class MemoryStorageDriver implements StorageDriver {
  backingStore: { [key: string]: string | undefined };

  constructor() {
    this.backingStore = {};
  }

  async get(key: string): Promise<string | null> {
    const value = this.backingStore[key];
    if (value != null) {
      return value;
    }
    return null;
  }
  async set(key: string, value: string): Promise<void> {
    this.backingStore[key] = value;
  }
  async del(key: string): Promise<void> {
    delete this.backingStore[key];
  }
}

describe("ContainerStorage", () => {
  it("should set, get and delete refresh token", async () => {
    const driver = new MemoryStorageDriver();
    const storage = new GlobalJSONContainerStorage(driver);
    const token = "test_token";
    const ns = "test";

    await storage.setRefreshToken(ns, token);
    let restored = await storage.getRefreshToken(ns);
    expect(restored).toEqual(token);

    await storage.delRefreshToken(ns);
    restored = await storage.getRefreshToken(ns);
    expect(restored).toEqual(null);
  });
});

describe("GlobalJSONStorage", () => {
  it("should scope the key", async () => {
    const driver = new MemoryStorageDriver();
    const storage = new _GlobalJSONStorage(driver);

    await storage.safeSet("a", "b");
    expect(
      Object.prototype.hasOwnProperty.call(driver.backingStore, "a")
    ).toEqual(false);
    expect(
      Object.prototype.hasOwnProperty.call(driver.backingStore, "skygear2_a")
    ).toEqual(true);

    await storage.safeSetJSON("json", {});
    expect(
      Object.prototype.hasOwnProperty.call(driver.backingStore, "json")
    ).toEqual(false);
    expect(
      Object.prototype.hasOwnProperty.call(driver.backingStore, "skygear2_json")
    ).toEqual(true);
  });
  it("should safeSet and safeGet", async () => {
    const driver = new MemoryStorageDriver();
    const storage = new _GlobalJSONStorage(driver);

    await storage.safeSet("a", "b");
    expect(await storage.safeGet("a")).toEqual("b");
  });

  it("should safeDel", async () => {
    const driver = new MemoryStorageDriver();
    const storage = new _GlobalJSONStorage(driver);

    await storage.safeSet("a", "b");
    expect(await storage.safeGet("a")).toEqual("b");
    await storage.safeDel("a");
    expect(await storage.safeGet("a")).toEqual(null);
  });

  it("should safeSetJSON and safeGetJSON", async () => {
    const driver = new MemoryStorageDriver();
    const storage = new _GlobalJSONStorage(driver);

    const json = {
      str: "str",
      num: 1,
      bool: true,
      arr: ["str", 1, true],
    };

    await storage.safeSetJSON("json", json);
    expect(await storage.safeGetJSON("json")).toEqual(json);
    await storage.safeDel("json");
    expect(await storage.safeGetJSON("json")).toEqual(undefined);
  });
});
