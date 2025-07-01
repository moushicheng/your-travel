import { prisma } from '../../infrastructure/db';

export class LocationDomainService {
  // 查询所有地点
  async getAllLocations() {
    return prisma.location.findMany();
  }

  // 查询指定ID的地点
  async getLocationById(id: number) {
    return prisma.location.findUnique({ where: { id } });
  }

  // 查询某地点的所有邻居（可达地点）
  async getNeighbors(locationId: number) {
    // 查询所有以该地点为from的Edge
    const edges = await prisma.edge.findMany({ where: { fromId: locationId, isActive: true }, include: { to: true } });
    return edges.map(e => ({ location: e.to, distance: e.distance, eventRate: e.eventRate }));
  }

  // 路径规划：Dijkstra最短路径算法（返回地点ID数组）
  async findShortestPath(startId: number, endId: number): Promise<number[]> {
    // 1. 获取所有地点和边
    const locations = await prisma.location.findMany();
    const edges = await prisma.edge.findMany({ where: { isActive: true } });
    // 2. 构建邻接表
    const adj: Record<number, { to: number, distance: number }[]> = {};
    for (const loc of locations) adj[loc.id] = [];
    for (const edge of edges) adj[edge.fromId].push({ to: edge.toId, distance: edge.distance });
    // 3. Dijkstra
    const dist: Record<number, number> = {};
    const prev: Record<number, number | null> = {};
    const visited: Record<number, boolean> = {};
    for (const loc of locations) {
      dist[loc.id] = Infinity;
      prev[loc.id] = null;
      visited[loc.id] = false;
    }
    dist[startId] = 0;
    while (true) {
      let u: number | null = null;
      let minDist = Infinity;
      for (const id in dist) {
        if (!visited[+id] && dist[+id] < minDist) {
          minDist = dist[+id];
          u = +id;
        }
      }
      if (u === null || u === endId) break;
      visited[u] = true;
      for (const neighbor of adj[u]) {
        const alt = dist[u] + neighbor.distance;
        if (alt < dist[neighbor.to]) {
          dist[neighbor.to] = alt;
          prev[neighbor.to] = u;
        }
      }
    }
    // 4. 回溯路径
    const path: number[] = [];
    let curr: number | null = endId;
    while (curr !== null) {
      path.unshift(curr);
      curr = prev[curr];
    }
    if (path[0] !== startId) return []; // 不可达
    return path;
  }
} 