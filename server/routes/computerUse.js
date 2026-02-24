import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import screenshot from 'screenshot-desktop';
import { getPermissions } from '../services/permissions.js';

const execAsync = promisify(exec);
const router = Router();
const permissions = getPermissions();

// Take screenshot
router.get('/screenshot', permissions.middleware('computer.screenshot'), async (req, res) => {
  try {
    const img = await screenshot({ format: 'png' });
    const base64 = img.toString('base64');

    res.json({
      success: true,
      screenshot: base64,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute mouse click
router.post('/click', permissions.middleware('computer.mouse.click'), async (req, res) => {
  try {
    const { x, y, button = 1 } = req.body;

    const xInt = parseInt(x, 10);
    const yInt = parseInt(y, 10);
    const buttonInt = parseInt(button, 10);
    if (isNaN(xInt) || isNaN(yInt) || ![1, 2, 3].includes(buttonInt)) {
      return res.status(400).json({ success: false, error: 'Invalid click parameters' });
    }

    // Using xdotool for Linux
    await execAsync(`xdotool mousemove ${xInt} ${yInt} click ${buttonInt}`);

    res.json({
      success: true,
      action: 'click',
      coordinates: { x: xInt, y: yInt }
    });
  } catch (error) {
    console.error('Click error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Type text
router.post('/type', permissions.middleware('computer.keyboard.type'), async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== 'string' || text.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid text parameter' });
    }

    // Escape single quotes for shell single-quote context
    const escapedText = text.replace(/'/g, "'\\''");
    await execAsync(`xdotool type '${escapedText}'`);

    res.json({
      success: true,
      action: 'type',
      text: text
    });
  } catch (error) {
    console.error('Type error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Press keyboard key
router.post('/key', permissions.middleware('computer.keyboard.press'), async (req, res) => {
  try {
    const { key } = req.body;

    // Whitelist: only allow xdotool key names (alphanumeric, +, -, _)
    if (typeof key !== 'string' || !/^[a-zA-Z0-9+_\-]+$/.test(key)) {
      return res.status(400).json({ success: false, error: 'Invalid key parameter' });
    }

    await execAsync(`xdotool key ${key}`);

    res.json({
      success: true,
      action: 'key',
      key: key
    });
  } catch (error) {
    console.error('Key press error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get system info
router.get('/info', permissions.middleware('computer.info'), async (req, res) => {
  try {
    const [hostname, uptime, memory] = await Promise.all([
      execAsync('hostname'),
      execAsync('uptime -p'),
      execAsync('free -h')
    ]);

    res.json({
      success: true,
      system: {
        hostname: hostname.stdout.trim(),
        uptime: uptime.stdout.trim(),
        memory: memory.stdout,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute shell command (dangerous - use with caution)
router.post('/execute', permissions.middleware('computer.execute'), async (req, res) => {
  try {
    const { command } = req.body;

    if (typeof command !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid command' });
    }

    // Reject any shell metacharacters to prevent injection
    if (/[&|;`$(){}[\]<>\\]/.test(command)) {
      return res.status(403).json({
        success: false,
        error: 'Command not allowed for security reasons'
      });
    }

    // Whitelist of safe commands
    const safeCommands = ['ls', 'pwd', 'date', 'whoami', 'uname'];
    const commandName = command.split(/\s+/)[0];

    if (!safeCommands.includes(commandName)) {
      return res.status(403).json({
        success: false,
        error: 'Command not allowed for security reasons'
      });
    }

    const result = await execAsync(command);

    res.json({
      success: true,
      output: result.stdout,
      error: result.stderr
    });
  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as computerUseRouter };
