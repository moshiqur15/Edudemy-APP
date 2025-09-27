// Route preloader for critical pages
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logger from './logger';

// Map of routes to preload based on user roles
const ROUTE_PRELOADS = {
  admin: [
    () => import('../pages/DashboardAdmin'),
    () => import('../pages/UserManagement'),
    () => import('../pages/Students'),
    () => import('../pages/Analytics')
  ],
  teacher: [
    () => import('../pages/DashboardTeacher'),
    () => import('../pages/MyClasses'),
    () => import('../pages/Attendance'),
    () => import('../pages/GradeBook')
  ],
  student: [
    () => import('../pages/DashboardStudent'),
    () => import('../pages/student/GradesPage'),
    () => import('../pages/student/AttendancePage')
  ],
  management: [
    () => import('../pages/DashboardManagement'),
    () => import('../pages/Analytics'),
    () => import('../pages/Attendance')
  ],
  academics: [
    () => import('../pages/DashboardAcademics'),
    () => import('../pages/Batches'),
    () => import('../pages/Analytics')
  ]
};

// Common routes that all authenticated users might need
const COMMON_PRELOADS = [
  () => import('../pages/Profile'),
  () => import('../pages/Settings'),
  () => import('../pages/MessagingPage')
];

export const useRoutePreloader = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;

    const preloadRoutes = async () => {
      try {
        // Preload role-specific routes
        const rolePreloads = ROUTE_PRELOADS[user.role] || [];
        
        // Preload critical routes first (dashboard)
        if (rolePreloads.length > 0) {
          // Preload dashboard immediately
          await rolePreloads[0]();
          logger.debug(`Preloaded dashboard for role: ${user.role}`);
        }

        // Preload other role-specific routes with delay
        setTimeout(async () => {
          const otherRoutes = rolePreloads.slice(1);
          for (const preloadRoute of otherRoutes) {
            try {
              await preloadRoute();
            } catch (error) {
              logger.debug('Route preload failed:', error.message);
            }
          }
          logger.debug(`Preloaded ${otherRoutes.length} additional routes for role: ${user.role}`);
        }, 1000);

        // Preload common routes with further delay
        setTimeout(async () => {
          for (const preloadRoute of COMMON_PRELOADS) {
            try {
              await preloadRoute();
            } catch (error) {
              logger.debug('Common route preload failed:', error.message);
            }
          }
          logger.debug('Preloaded common routes');
        }, 2000);

      } catch (error) {
        logger.debug('Route preloading error:', error.message);
      }
    };

    // Start preloading after a short delay to allow initial page to load
    const preloadTimeout = setTimeout(preloadRoutes, 500);

    return () => clearTimeout(preloadTimeout);
  }, [isAuthenticated, user?.role]);
};

// Higher-order component for route preloading
export const withRoutePreloader = (WrappedComponent) => {
  return function RoutePreloadedComponent(props) {
    useRoutePreloader();
    return <WrappedComponent {...props} />;
  };
};

// Preload specific route manually
export const preloadRoute = async (routeImport) => {
  try {
    await routeImport();
    logger.debug('Route preloaded successfully');
  } catch (error) {
    logger.debug('Manual route preload failed:', error.message);
  }
};

// Check if route is likely to be visited next
export const predictivePreload = (currentPath, userRole) => {
  const predictions = {
    '/admin': [
      () => import('../pages/UserManagement'),
      () => import('../pages/Students'),
      () => import('../pages/Analytics')
    ],
    '/teacher': [
      () => import('../pages/MyClasses'),
      () => import('../pages/Attendance')
    ],
    '/student': [
      () => import('../pages/student/GradesPage'),
      () => import('../pages/student/AttendancePage')
    ]
  };

  const predictedRoutes = predictions[currentPath] || [];
  
  // Preload predicted routes with low priority
  setTimeout(() => {
    predictedRoutes.forEach(async (route) => {
      try {
        await route();
      } catch (error) {
        logger.debug('Predictive preload failed:', error.message);
      }
    });
  }, 3000);
};

export default useRoutePreloader;