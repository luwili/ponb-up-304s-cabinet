import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sync-schedule-api',
      configureServer(server) {
        server.middlewares.use('/api/sync-schedule', async (req, res) => {
          if (req.method === 'POST') {
            try {
              const { stdout } = await execAsync('python3 scripts/sync_uust_schedule.py --force');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, log: stdout }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          } else {
            res.statusCode = 405;
            res.end();
          }
        });
      }
    }
  ],
  base: './', // relative base ensures GitHub Pages subfolder compatibility
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
