import { filterTunnels, buildFilterCriteria, FilterableTunnel } from "./TunnelFilter";

function makeTunnel(overrides: Partial<FilterableTunnel> = {}): FilterableTunnel {
  return {
    config: { name: "my-tunnel", subdomain: "my-sub", port: 3000 } as any,
    status: "connected",
    tags: [],
    group: undefined,
    alias: undefined,
    ...overrides,
  };
}

describe("filterTunnels", () => {
  it("returns all tunnels when criteria is empty", () => {
    const tunnels = [makeTunnel(), makeTunnel({ config: { name: "other" } as any })];
    expect(filterTunnels(tunnels, {})).toHaveLength(2);
  });

  it("filters by status", () => {
    const tunnels = [
      makeTunnel({ status: "connected" }),
      makeTunnel({ status: "disconnected" }),
    ];
    const result = filterTunnels(tunnels, { status: "connected" });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("connected");
  });

  it("filters by tag", () => {
    const tunnels = [
      makeTunnel({ tags: ["prod", "web"] }),
      makeTunnel({ tags: ["dev"] }),
    ];
    const result = filterTunnels(tunnels, { tag: "prod" });
    expect(result).toHaveLength(1);
    expect(result[0].tags).toContain("prod");
  });

  it("filters by group", () => {
    const tunnels = [
      makeTunnel({ group: "backend" }),
      makeTunnel({ group: "frontend" }),
    ];
    expect(filterTunnels(tunnels, { group: "backend" })).toHaveLength(1);
  });

  it("filters by alias", () => {
    const tunnels = [
      makeTunnel({ alias: "api" }),
      makeTunnel({ alias: "web" }),
    ];
    expect(filterTunnels(tunnels, { alias: "api" })).toHaveLength(1);
  });

  it("filters by search across name, subdomain, alias, group, tags", () => {
    const tunnels = [
      makeTunnel({ config: { name: "auth-service", subdomain: "auth", port: 4000 } as any }),
      makeTunnel({ config: { name: "payment", subdomain: "pay", port: 5000 } as any }),
    ];
    expect(filterTunnels(tunnels, { search: "auth" })).toHaveLength(1);
  });

  it("combines multiple criteria", () => {
    const tunnels = [
      makeTunnel({ status: "connected", tags: ["prod"], group: "backend" }),
      makeTunnel({ status: "connected", tags: ["dev"], group: "backend" }),
      makeTunnel({ status: "disconnected", tags: ["prod"], group: "backend" }),
    ];
    const result = filterTunnels(tunnels, { status: "connected", tag: "prod" });
    expect(result).toHaveLength(1);
  });
});

describe("buildFilterCriteria", () => {
  it("maps query params to criteria", () => {
    const criteria = buildFilterCriteria({
      status: "connected",
      tag: "prod",
      group: "backend",
      alias: "api",
      search: "auth",
    });
    expect(criteria).toEqual({
      status: "connected",
      tag: "prod",
      group: "backend",
      alias: "api",
      search: "auth",
    });
  });

  it("ignores undefined query params", () => {
    const criteria = buildFilterCriteria({ status: "connected", tag: undefined });
    expect(criteria).toEqual({ status: "connected" });
    expect(criteria.tag).toBeUndefined();
  });
});
