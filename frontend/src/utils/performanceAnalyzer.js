// Performance analyzer for chunk loading and bundle optimization
import logger from './logger';

class PerformanceAnalyzer {
  constructor() {
    this.metrics = {
      chunkLoads: [],
      routeTransitions: [],
      initialLoad: null,
      cacheHits: 0,
      cachemisses: 0
    };
    
    this.isEnabled = import.meta.env.DEV;
    
    if (this.isEnabled) {
      this.initializePerformanceObserver();
      this.monitorResourceTiming();
    }
  }

  // Initialize Performance Observer for monitoring
  initializePerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.recordInitialLoad(entry);
            } else if (entry.entryType === 'resource') {
              this.recordResourceLoad(entry);
            }
          }
        });

        observer.observe({ entryTypes: ['navigation', 'resource'] });
        logger.debug('Performance observer initialized');
      } catch (error) {
        logger.debug('Performance observer not available:', error.message);
      }
    }
  }

  // Monitor resource timing for chunk analysis
  monitorResourceTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      setInterval(() => {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(resource => 
          resource.name.includes('.js') && 
          resource.name.includes('/js/')
        );

        this.analyzeChunkPerformance(jsResources);
      }, 5000);
    }
  }

  // Record initial page load metrics
  recordInitialLoad(entry) {
    this.metrics.initialLoad = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      totalTime: entry.loadEventEnd - entry.navigationStart,
      timestamp: Date.now()
    };

    logger.debug('Initial load recorded:', this.metrics.initialLoad);
  }

  // Record resource load for chunk analysis
  recordResourceLoad(entry) {
    if (entry.name.includes('/js/') && entry.name.includes('.js')) {
      const chunkInfo = this.parseChunkName(entry.name);
      
      this.metrics.chunkLoads.push({
        name: chunkInfo.name,
        type: chunkInfo.type,
        size: entry.transferSize || entry.encodedBodySize,
        loadTime: entry.responseEnd - entry.requestStart,
        cached: entry.transferSize === 0 && entry.encodedBodySize > 0,
        timestamp: Date.now()
      });

      if (entry.transferSize === 0 && entry.encodedBodySize > 0) {
        this.metrics.cacheHits++;
      } else {
        this.metrics.cacheHits++;
      }

      logger.debug('Chunk loaded:', chunkInfo.name, `${(entry.transferSize / 1024).toFixed(2)}KB`);
    }
  }

  // Parse chunk name to identify type
  parseChunkName(url) {
    const filename = url.split('/').pop();
    const baseName = filename.split('-')[0];
    
    const chunkTypes = {
      'index': 'main',
      'react-vendor': 'vendor',
      'ui-vendor': 'vendor', 
      'utility-vendor': 'vendor',
      'admin-dashboard': 'role-dashboard',
      'teacher-dashboard': 'role-dashboard',
      'student-dashboard': 'role-dashboard',
      'academic-dashboard': 'role-dashboard',
      'enhanced-components': 'feature',
      'academic-features': 'feature',
      'communication': 'feature',
      'common-features': 'feature'
    };

    return {
      name: baseName,
      type: chunkTypes[baseName] || 'unknown',
      filename
    };
  }

  // Record route transition performance
  recordRouteTransition(from, to, loadTime) {
    this.metrics.routeTransitions.push({
      from,
      to, 
      loadTime,
      timestamp: Date.now()
    });

    logger.debug('Route transition:', `${from} → ${to}`, `${loadTime}ms`);
  }

  // Analyze chunk loading performance
  analyzeChunkPerformance(resources) {
    const chunksByType = {};
    let totalSize = 0;

    resources.forEach(resource => {
      const chunkInfo = this.parseChunkName(resource.name);
      const size = resource.transferSize || resource.encodedBodySize || 0;
      
      if (!chunksByType[chunkInfo.type]) {
        chunksByType[chunkInfo.type] = { count: 0, totalSize: 0 };
      }
      
      chunksByType[chunkInfo.type].count++;
      chunksByType[chunkInfo.type].totalSize += size;
      totalSize += size;
    });

    return {
      totalChunks: resources.length,
      totalSize,
      byType: chunksByType,
      cacheEfficiency: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheHits) * 100
    };
  }

  // Get performance summary
  getPerformanceSummary() {
    if (!this.isEnabled) {
      return { message: 'Performance analysis only available in development' };
    }

    const resources = performance.getEntriesByType('resource');
    const analysis = this.analyzeChunkPerformance(resources);

    return {
      initialLoad: this.metrics.initialLoad,
      chunkAnalysis: analysis,
      routeTransitions: this.metrics.routeTransitions,
      cacheStats: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheHits,
        efficiency: `${((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheHits)) * 100).toFixed(1)}%`
      },
      recommendations: this.generateRecommendations(analysis)
    };
  }

  // Generate performance recommendations
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.totalSize > 500 * 1024) {
      recommendations.push('Consider further code splitting - total bundle size is large');
    }

    if (analysis.byType.vendor && analysis.byType.vendor.totalSize > 200 * 1024) {
      recommendations.push('Vendor chunks are large - consider splitting vendor libraries');
    }

    if (this.metrics.routeTransitions.some(t => t.loadTime > 1000)) {
      recommendations.push('Some routes have slow transition times - consider preloading');
    }

    if (this.metrics.cacheEfficiency < 50) {
      recommendations.push('Low cache efficiency - optimize chunk splitting strategy');
    }

    return recommendations.length > 0 ? recommendations : ['Performance looks good!'];
  }

  // Generate performance report
  generateReport() {
    const summary = this.getPerformanceSummary();
    
    console.group('📊 Edudemy Performance Report');
    console.log('🚀 Initial Load:', summary.initialLoad);
    console.log('📦 Chunk Analysis:', summary.chunkAnalysis);
    console.log('🔄 Route Transitions:', summary.routeTransitions);
    console.log('💾 Cache Stats:', summary.cacheStats);
    console.log('💡 Recommendations:', summary.recommendations);
    console.groupEnd();

    return summary;
  }

  // Monitor Core Web Vitals
  monitorCoreWebVitals() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                logger.debug('LCP:', `${entry.startTime}ms`);
                break;
              case 'first-input':
                logger.debug('FID:', `${entry.processingStart - entry.startTime}ms`);
                break;
              case 'layout-shift':
                if (!entry.hadRecentInput) {
                  logger.debug('CLS:', entry.value);
                }
                break;
            }
          }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        logger.debug('Core Web Vitals monitoring not available:', error.message);
      }
    }
  }
}

// Create singleton instance
const performanceAnalyzer = new PerformanceAnalyzer();

// Export functions for use in components
export const recordRouteTransition = (from, to, loadTime) => {
  performanceAnalyzer.recordRouteTransition(from, to, loadTime);
};

export const getPerformanceSummary = () => {
  return performanceAnalyzer.getPerformanceSummary();
};

export const generatePerformanceReport = () => {
  return performanceAnalyzer.generateReport();
};

export default performanceAnalyzer;