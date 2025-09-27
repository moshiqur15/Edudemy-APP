import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import logger from './logger';

// Debounce hook for search inputs and expensive operations
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for frequent events like scrolling
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Local storage hook with error handling
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        logger.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

// Async operation hook with loading and error states
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (asyncFunction) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction();
      
      if (isMountedRef.current) {
        setLoading(false);
        return result;
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
        logger.error('Async operation failed:', err);
      }
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      logger.debug('IntersectionObserver not supported, defaulting to visible');
      setIsIntersecting(true);
      return;
    }

    try {
      const observer = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      }, {
        threshold: 0.1,
        rootMargin: '10px',
        ...options
      });

      observer.observe(target);

      return () => {
        try {
          observer.unobserve(target);
        } catch (error) {
          logger.debug('Error unobserving intersection observer:', error.message);
        }
      };
    } catch (error) {
      logger.debug('Error creating intersection observer:', error.message);
      // Fallback to always visible
      setIsIntersecting(true);
    }
  }, [options]);

  return [targetRef, isIntersecting];
};

// Performance measurement hook
export const usePerformance = (name) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;
      logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    };
  }, [name]);
};

// Memoized API data fetcher
export const useMemoizedFetch = (fetchFunction, dependencies = []) => {
  return useMemo(() => {
    return fetchFunction();
  }, dependencies);
};

// Optimized list rendering hook
export const useVirtualList = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      items: items.slice(visibleStart, visibleEnd),
      startIndex: visibleStart,
      endIndex: visibleEnd,
      totalHeight: items.length * itemHeight,
      offsetY: visibleStart * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return { visibleItems, handleScroll };
};

// Memory usage monitoring (development only)
export const useMemoryMonitor = (componentName) => {
  useEffect(() => {
    if (import.meta.env.DEV && typeof performance !== 'undefined' && 'memory' in performance) {
      const logMemory = () => {
        try {
          const memory = performance.memory;
          if (memory && memory.usedJSHeapSize) {
            logger.debug(`Memory usage for ${componentName}:`, {
              used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
              total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
              limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
            });
          }
        } catch (error) {
          // Silently fail if memory API is not available or throws error
          logger.debug(`Memory monitoring not available for ${componentName}`);
        }
      };

      const interval = setInterval(logMemory, 10000); // Log every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [componentName]);
};

// Optimized search functionality
export const useOptimizedSearch = (data, searchFields, minQueryLength = 2) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const filteredData = useMemo(() => {
    if (debouncedQuery.length < minQueryLength) {
      return data;
    }

    const lowercaseQuery = debouncedQuery.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(lowercaseQuery);
      });
    });
  }, [data, debouncedQuery, searchFields, minQueryLength]);

  return { query, setQuery, filteredData, isSearching: debouncedQuery.length >= minQueryLength };
};

// Component wrapper for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    usePerformance(componentName);
    useMemoryMonitor(componentName);
    
    return React.createElement(WrappedComponent, props);
  };
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    // Bundle analysis would be configured in the build process
    // This is a placeholder for future integration with build tools
    logger.info('Bundle analysis feature available - configure in build tools');
    
    // Alternative: Use built-in performance API to estimate bundle size
    try {
      if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(resource => 
          resource.name && resource.name.includes('.js') && resource.transferSize
        );
        
        const totalJSSize = jsResources.reduce((total, resource) => 
          total + (resource.transferSize || 0), 0
        );
        
        if (totalJSSize > 0) {
          logger.debug('Estimated JS bundle size:', {
            totalSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
            resources: jsResources.length
          });
        }
      }
    } catch (error) {
      logger.debug('Bundle size analysis not available:', error.message);
    }
  }
};

// Performance tips based on component usage patterns
export const getPerformanceTips = (componentMetrics) => {
  const tips = [];

  if (componentMetrics.renderCount > 10) {
    tips.push('Consider using React.memo() for this component');
  }

  if (componentMetrics.recomputeCount > 5) {
    tips.push('Consider using useMemo() for expensive calculations');
  }

  if (componentMetrics.effectCount > 3) {
    tips.push('Review useEffect dependencies to prevent unnecessary runs');
  }

  return tips;
};