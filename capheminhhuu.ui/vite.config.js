import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-chart': ['recharts'],
          'vendor-signalr': ['@microsoft/signalr'],
          'module-admin': [
            './src/modules/admin/pages/AdminDashboard.jsx',
            './src/modules/admin/pages/QuanLySanPham.jsx',
            './src/modules/admin/pages/QuanLyKho.jsx',
          ],
          'module-cashier': [
            './src/modules/cashier/pages/CashierPOS.jsx',
          ],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
});