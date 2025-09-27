import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'utility-vendor': ['axios'],
          
          // Dashboard components by role
          'admin-dashboard': [
            './src/pages/DashboardAdmin.jsx',
            './src/pages/UserManagement.jsx',
            './src/pages/Students.jsx',
            './src/pages/Teachers.jsx',
            './src/pages/Permissions.jsx'
          ],
          'academic-dashboard': [
            './src/pages/DashboardAcademics.jsx',
            './src/pages/DashboardManagement.jsx',
            './src/pages/Batches.jsx'
          ],
          'teacher-dashboard': [
            './src/pages/DashboardTeacher.jsx',
            './src/pages/MyClasses.jsx'
          ],
          'student-dashboard': [
            './src/pages/DashboardStudent.jsx',
            './src/pages/student/GradesPage.jsx',
            './src/pages/student/AttendancePage.jsx'
          ],
          
          // Academic features
          'academic-features': [
            './src/pages/Analytics.jsx',
            './src/pages/Attendance.jsx',
            './src/pages/GradeBook.jsx',
            './src/pages/ExamManagement.jsx'
          ],
          
          // Enhanced components
          'enhanced-components': [
            './src/components/GradeBookEnhanced.jsx',
            './src/components/ExamManagementSystem.jsx',
            './src/components/BehaviorRecordsSystem.jsx',
            './src/components/AttendanceSystemEnhanced.jsx',
            './src/components/ProfileEnhanced.jsx'
          ],
          
          // Communication features
          'communication': [
            './src/pages/MessagingPage.jsx',
            './src/pages/NotificationsPage.jsx',
            './src/pages/Feedback.jsx'
          ],
          
          // Common features
          'common-features': [
            './src/pages/Profile.jsx',
            './src/pages/Settings.jsx',
            './src/pages/ClassesAndStudents.jsx'
          ]
        },
        
        // Chunk file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '')
            : 'chunk';
          return `js/[name]-[hash].js`;
        },
        
        // Entry file naming
        entryFileNames: 'js/[name]-[hash].js',
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Optimization settings
    target: 'esnext',
    minify: 'esbuild',
    
    // Source map for production debugging
    sourcemap: false,
    
    // Bundle analysis threshold
    chunkSizeWarningLimit: 1000
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react']
  }
})
