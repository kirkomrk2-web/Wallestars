import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Get system logs
router.get('/', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM system_logs ORDER BY id DESC LIMIT 100').all();
    res.json({
      success: true,
      logs: logs
    });
  } catch (error) {
    console.error('Logs fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as logsRouter };
