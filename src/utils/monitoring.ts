class MetricsRegistry {
  private metrics: Map<string, number> = new Map();

  increment(name: string, value = 1): void {
    const currentValue = this.metrics.get(name) || 0;
    this.metrics.set(name, currentValue + value);
  }

  decrement(name: string, value = 1): void {
    const currentValue = this.metrics.get(name) || 0;
    this.metrics.set(name, Math.max(0, currentValue - value));
  }

  set(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  get(name: string): number {
    return this.metrics.get(name) || 0;
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clear(): void {
    this.metrics.clear();
  }
}

const registry = new MetricsRegistry();

export const metrics = {
  httpRequestDuration: {
    record: (duration: number, method: string, route: string, statusCode: number) => {
      const key = `http_request_duration_${method}_${route}_${statusCode}`;
      registry.set(key, duration);
    },
  },
  transformationDuration: {
    record: (duration: number, databaseType: string) => {
      const key = `transformation_duration_${databaseType}`;
      registry.set(key, duration);
    },
  },
  activeTransformations: {
    increment: () => registry.increment('active_transformations'),
    decrement: () => registry.decrement('active_transformations'),
    get: () => registry.get('active_transformations'),
  },
  getMetrics: () => registry.getMetrics(),
  clearMetrics: () => registry.clear(),
};

export function startMonitoring(): void {
  // Reset metrics on start
  metrics.clearMetrics();
  
  // Report metrics periodically
  const reportInterval = setInterval(() => {
    const currentMetrics = metrics.getMetrics();
    if (Object.keys(currentMetrics).length > 0) {
      console.log('[Metrics]', currentMetrics);
    }
  }, 60000);

  // Clean up on process exit
  process.on('SIGTERM', () => {
    clearInterval(reportInterval);
    metrics.clearMetrics();
  });
}