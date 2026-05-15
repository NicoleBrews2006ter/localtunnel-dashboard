import {
  createAliasMap,
  setAlias,
  getAlias,
  deleteAlias,
  resolveByAlias,
  listAliases,
} from "./TunnelAlias";

describe("TunnelAlias", () => {
  function makeMap() {
    return createAliasMap();
  }

  it("sets and retrieves an alias", () => {
    const map = makeMap();
    const record = setAlias(map, "tunnel-1", "my-api");
    expect(record.tunnelId).toBe("tunnel-1");
    expect(record.alias).toBe("my-api");
    expect(record.createdAt).toBeDefined();
    expect(getAlias(map, "tunnel-1")).toEqual(record);
  });

  it("trims whitespace from alias", () => {
    const map = makeMap();
    const record = setAlias(map, "tunnel-1", "  frontend  ");
    expect(record.alias).toBe("frontend");
  });

  it("throws when alias is empty", () => {
    const map = makeMap();
    expect(() => setAlias(map, "tunnel-1", "   ")).toThrow("Alias must not be empty");
  });

  it("throws when alias is already used by another tunnel", () => {
    const map = makeMap();
    setAlias(map, "tunnel-1", "shared");
    expect(() => setAlias(map, "tunnel-2", "shared")).toThrow(
      'Alias "shared" is already in use by tunnel "tunnel-1"'
    );
  });

  it("allows updating alias on same tunnel", () => {
    const map = makeMap();
    setAlias(map, "tunnel-1", "old-name");
    const updated = setAlias(map, "tunnel-1", "old-name");
    expect(updated.alias).toBe("old-name");
  });

  it("deletes an alias", () => {
    const map = makeMap();
    setAlias(map, "tunnel-1", "to-delete");
    expect(deleteAlias(map, "tunnel-1")).toBe(true);
    expect(getAlias(map, "tunnel-1")).toBeUndefined();
  });

  it("returns false when deleting non-existent alias", () => {
    const map = makeMap();
    expect(deleteAlias(map, "ghost")).toBe(false);
  });

  it("resolves a tunnel by alias string", () => {
    const map = makeMap();
    setAlias(map, "tunnel-42", "backend");
    const found = resolveByAlias(map, "backend");
    expect(found?.tunnelId).toBe("tunnel-42");
  });

  it("returns undefined for unknown alias", () => {
    const map = makeMap();
    expect(resolveByAlias(map, "nope")).toBeUndefined();
  });

  it("lists all aliases", () => {
    const map = makeMap();
    setAlias(map, "t1", "alpha");
    setAlias(map, "t2", "beta");
    const list = listAliases(map);
    expect(list).toHaveLength(2);
    expect(list.map((a) => a.alias).sort()).toEqual(["alpha", "beta"]);
  });
});
