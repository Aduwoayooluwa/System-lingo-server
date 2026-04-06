import { Injectable } from '@nestjs/common';

export interface SimNode {
  id: string;
  type: string;
  data?: Record<string, any>;
}

export interface SimEdge {
  id: string;
  source: string;
  target: string;
}

export interface SimulationRequest {
  nodes: SimNode[];
  edges: SimEdge[];
  requestCount: number;
  duration?: number;
  expectedComponents?: string[];
}

export interface SimulationResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  maxLatency: number;
  throughput: number;
  bottlenecks: string[];
  events: SimEvent[];
  score: number;
  feedback: FeedbackItem[];
}

export interface SimEvent {
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'overload' | 'cache_hit' | 'cache_miss';
  source: string;
  target?: string;
  message: string;
}

export interface FeedbackItem {
  character: string;
  emotion: string;
  message: string;
  suggestion?: string;
}

@Injectable()
export class SimulationService {
  run(input: SimulationRequest): SimulationResult {
    const { nodes, edges, requestCount = 10, expectedComponents } = input;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const adjacency = new Map<string, string[]>();

    for (const edge of edges) {
      if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
      adjacency.get(edge.source)!.push(edge.target);
    }

    // Find client nodes (entry points)
    const clientNodes = nodes.filter((n) => n.type === 'client');
    const serverNodes = nodes.filter((n) => n.type === 'server');
    const dbNodes = nodes.filter((n) => n.type === 'database');
    const cacheNodes = nodes.filter((n) => n.type === 'cache');
    const lbNodes = nodes.filter((n) => n.type === 'loadbalancer');
    const cdnNodes = nodes.filter((n) => n.type === 'cdn');
    const queueNodes = nodes.filter((n) => n.type === 'queue');

    const events: SimEvent[] = [];
    const bottlenecks: string[] = [];
    const feedback: FeedbackItem[] = [];

    let successful = 0;
    let failed = 0;
    let totalLatency = 0;
    let maxLatency = 0;

    // Server capacity: each server handles ~5 concurrent requests
    const serverCapacity = 5;
    const serverLoad = new Map<string, number>();
    serverNodes.forEach((s) => serverLoad.set(s.id, 0));

    // Simulate requests
    for (let i = 0; i < requestCount; i++) {
      let latency = 0;
      let requestFailed = false;
      const timestamp = i * 100;

      // Step 1: Client sends request
      const client = clientNodes[0];
      if (!client) {
        failed++;
        events.push({
          timestamp,
          type: 'error',
          source: 'system',
          message: 'No client node found!',
        });
        continue;
      }

      const clientTargets = adjacency.get(client.id) || [];
      if (clientTargets.length === 0) {
        failed++;
        events.push({
          timestamp,
          type: 'error',
          source: client.id,
          message: 'Client has no connections! Requests go nowhere.',
        });
        continue;
      }

      latency += 10; // Network latency

      // Step 2: Route through load balancer or direct to server
      let targetServer: string | null = null;

      const firstTarget = nodeMap.get(clientTargets[0]);
      if (firstTarget?.type === 'loadbalancer') {
        latency += 5; // LB overhead
        const lbTargets = adjacency.get(firstTarget.id) || [];
        const lbServers = lbTargets.filter(
          (t) => nodeMap.get(t)?.type === 'server',
        );

        if (lbServers.length === 0) {
          failed++;
          events.push({
            timestamp,
            type: 'error',
            source: firstTarget.id,
            message: 'Load balancer has no servers connected!',
          });
          continue;
        }

        // Round-robin
        targetServer = lbServers[i % lbServers.length];
        events.push({
          timestamp,
          type: 'request',
          source: firstTarget.id,
          target: targetServer,
          message: `Balancy routes request #${i + 1} to server`,
        });
      } else if (firstTarget?.type === 'server') {
        targetServer = firstTarget.id;
      } else if (firstTarget?.type === 'cdn') {
        // CDN cache hit for static content
        if (Math.random() < 0.7) {
          latency += 5;
          events.push({
            timestamp,
            type: 'cache_hit',
            source: firstTarget.id,
            message: `Cloudy served content from edge cache!`,
          });
          successful++;
          totalLatency += latency;
          maxLatency = Math.max(maxLatency, latency);
          continue;
        }
        // CDN miss - route to server
        const cdnTargets = adjacency.get(firstTarget.id) || [];
        targetServer = cdnTargets.find(
          (t) => nodeMap.get(t)?.type === 'server',
        ) || null;
        latency += 15;
      }

      if (!targetServer) {
        failed++;
        events.push({
          timestamp,
          type: 'error',
          source: client.id,
          message: 'No server reachable!',
        });
        continue;
      }

      // Step 3: Server processes request
      const currentLoad = serverLoad.get(targetServer) || 0;
      serverLoad.set(targetServer, currentLoad + 1);

      if (currentLoad >= serverCapacity) {
        latency += 500; // Server overloaded
        events.push({
          timestamp,
          type: 'overload',
          source: targetServer,
          message: `Servie is overwhelmed! Too many requests (${currentLoad + 1}/${serverCapacity})`,
        });

        if (currentLoad >= serverCapacity * 2) {
          failed++;
          requestFailed = true;
          events.push({
            timestamp,
            type: 'error',
            source: targetServer,
            message: 'Server crashed under load! 💥',
          });
          continue;
        }
      }

      latency += 20; // Server processing

      // Step 4: Check cache before database
      const serverTargets = adjacency.get(targetServer) || [];
      const connectedCache = serverTargets.find(
        (t) => nodeMap.get(t)?.type === 'cache',
      );
      const connectedDb = serverTargets.find(
        (t) => nodeMap.get(t)?.type === 'database',
      );

      if (connectedCache) {
        // Cache hit rate ~60%
        if (Math.random() < 0.6) {
          latency += 2; // Cache hit
          events.push({
            timestamp,
            type: 'cache_hit',
            source: connectedCache,
            message: 'Cappy remembered the answer! ⚡',
          });
        } else {
          latency += 5; // Cache miss
          events.push({
            timestamp,
            type: 'cache_miss',
            source: connectedCache,
            message: "Cappy didn't have this one, asking Debby...",
          });
          if (connectedDb) {
            latency += 50; // Database query
          }
        }
      } else if (connectedDb) {
        latency += 50; // Direct DB hit every time
        events.push({
          timestamp,
          type: 'request',
          source: targetServer,
          target: connectedDb,
          message: 'Every request goes to Debby directly',
        });
      }

      // Step 5: Response
      if (!requestFailed) {
        successful++;
        events.push({
          timestamp: timestamp + latency,
          type: 'response',
          source: targetServer,
          target: client.id,
          message: `Response sent (${latency}ms)`,
        });
      }

      totalLatency += latency;
      maxLatency = Math.max(maxLatency, latency);
    }

    // Decrement server loads
    serverLoad.forEach((load, serverId) => {
      if (load > serverCapacity) {
        bottlenecks.push(serverId);
      }
    });

    // Helper to check if feedback is relevant to the current lesson context
    const expects = (type: string) => !expectedComponents || expectedComponents.includes(type);

    // Generate character feedback
    if (serverNodes.length === 0 && expects('server')) {
      feedback.push({
        character: 'servie',
        emotion: 'confused',
        message: "You need at least one server! I'm ready to help, just drag me onto the canvas!",
        suggestion: 'Add a server component',
      });
    }

    if (serverNodes.length === 1 && requestCount > 5 && expects('loadbalancer')) {
      feedback.push({
        character: 'servie',
        emotion: 'stressed',
        message: `I'm handling all ${requestCount} requests alone! Maybe I could use a friend?`,
        suggestion: 'Add another server and a load balancer',
      });
    }

    if (lbNodes.length === 0 && serverNodes.length > 1 && expects('loadbalancer')) {
      feedback.push({
        character: 'balancy',
        emotion: 'eager',
        message: "I see multiple servers but no load balancer! I can help distribute the work fairly!",
        suggestion: 'Add a load balancer between client and servers',
      });
    }

    if (cacheNodes.length === 0 && dbNodes.length > 0 && requestCount > 3 && expects('cache')) {
      feedback.push({
        character: 'cappy',
        emotion: 'helpful',
        message: "Debby is getting tired answering the same questions! I can remember recent answers so she doesn't have to work so hard!",
        suggestion: 'Add a cache between server and database',
      });
    }

    if (dbNodes.length === 0 && serverNodes.length > 0 && expects('database')) {
      feedback.push({
        character: 'debby',
        emotion: 'sad',
        message: "The server has no way to remember data! Add me so I can store information persistently!",
        suggestion: 'Add a database',
      });
    }

    if (failed > requestCount * 0.5) {
      feedback.push({
        character: 'monique',
        emotion: 'alert',
        message: `⚠️ ${failed} out of ${requestCount} requests failed! The system needs help!`,
      });
    }

    const avgLatency = requestCount > 0 ? totalLatency / requestCount : 0;
    const score = Math.round(
      Math.max(
        0,
        100 -
          (failed / Math.max(requestCount, 1)) * 50 -
          Math.max(0, avgLatency - 50) * 0.5,
      ),
    );

    return {
      totalRequests: requestCount,
      successfulRequests: successful,
      failedRequests: failed,
      avgLatency: Math.round(avgLatency),
      maxLatency,
      throughput: Math.round((successful / Math.max(requestCount, 1)) * 100),
      bottlenecks,
      events: events.slice(0, 50), // Cap events for response size
      score,
      feedback,
    };
  }
}
