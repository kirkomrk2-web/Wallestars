import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getPermissions } from '../services/permissions.js';

const execAsync = promisify(exec);
const router = Router();
const permissions = getPermissions();

// Validate ADB device ID: alphanumeric, colon, dot, hyphen (covers serial and IP:port formats)
function validateDeviceId(deviceId) {
  return typeof deviceId === 'string' && /^[\w.:_-]+$/.test(deviceId);
}

// List connected Android devices
router.get('/devices', permissions.middleware('android.list'), async (req, res) => {
  try {
    const { stdout } = await execAsync('adb devices -l');

    const lines = stdout.split('\n').slice(1).filter(line => line.trim());
    const devices = lines.map(line => {
      const parts = line.split(/\s+/);
      return {
        id: parts[0],
        status: parts[1],
        info: parts.slice(2).join(' ')
      };
    });

    res.json({
      success: true,
      devices: devices,
      count: devices.length
    });
  } catch (error) {
    console.error('ADB devices error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      devices: []
    });
  }
});

// Take Android screenshot
router.post('/screenshot', permissions.middleware('android.screenshot'), async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (deviceId && !validateDeviceId(deviceId)) {
      return res.status(400).json({ success: false, error: 'Invalid device ID' });
    }

    const device = deviceId ? `-s ${deviceId}` : '';

    // Take screenshot and pull to temp location
    await execAsync(`adb ${device} shell screencap -p /sdcard/screenshot.png`);
    await execAsync(`adb ${device} pull /sdcard/screenshot.png /tmp/android_screenshot.png`);

    // Read and encode as base64
    const fs = await import('fs/promises');
    const imageBuffer = await fs.readFile('/tmp/android_screenshot.png');
    const base64 = imageBuffer.toString('base64');

    res.json({
      success: true,
      screenshot: base64,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Android screenshot error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Tap on screen
router.post('/tap', permissions.middleware('android.tap'), async (req, res) => {
  try {
    const { x, y, deviceId } = req.body;

    if (deviceId && !validateDeviceId(deviceId)) {
      return res.status(400).json({ success: false, error: 'Invalid device ID' });
    }

    const xInt = parseInt(x, 10);
    const yInt = parseInt(y, 10);
    if (isNaN(xInt) || isNaN(yInt)) {
      return res.status(400).json({ success: false, error: 'Invalid coordinates' });
    }

    const device = deviceId ? `-s ${deviceId}` : '';
    await execAsync(`adb ${device} shell input tap ${xInt} ${yInt}`);

    res.json({
      success: true,
      action: 'tap',
      coordinates: { x: xInt, y: yInt }
    });
  } catch (error) {
    console.error('Android tap error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Type text on Android
router.post('/type', permissions.middleware('android.type'), async (req, res) => {
  try {
    const { text, deviceId } = req.body;

    if (deviceId && !validateDeviceId(deviceId)) {
      return res.status(400).json({ success: false, error: 'Invalid device ID' });
    }

    if (typeof text !== 'string' || text.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid text parameter' });
    }

    const device = deviceId ? `-s ${deviceId}` : '';

    // Replace spaces with %s for ADB, then escape shell double-quote metacharacters
    const formattedText = text.replace(/ /g, '%s').replace(/["$`\\]/g, '\\$&');
    await execAsync(`adb ${device} shell input text "${formattedText}"`);

    res.json({
      success: true,
      action: 'type',
      text: text
    });
  } catch (error) {
    console.error('Android type error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Press key on Android
router.post('/key', permissions.middleware('android.type'), async (req, res) => {
  try {
    const { keyCode, deviceId } = req.body;

    if (deviceId && !validateDeviceId(deviceId)) {
      return res.status(400).json({ success: false, error: 'Invalid device ID' });
    }

    const keyCodeInt = parseInt(keyCode, 10);
    if (isNaN(keyCodeInt) || keyCodeInt < 0) {
      return res.status(400).json({ success: false, error: 'Invalid keyCode' });
    }

    const device = deviceId ? `-s ${deviceId}` : '';
    // Common keycodes: HOME=3, BACK=4, MENU=82, POWER=26
    await execAsync(`adb ${device} shell input keyevent ${keyCodeInt}`);

    res.json({
      success: true,
      action: 'key',
      keyCode: keyCodeInt
    });
  } catch (error) {
    console.error('Android key error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Install APK
router.post('/install', permissions.middleware('android.install'), async (req, res) => {
  try {
    const { apkPath, deviceId } = req.body;

    if (deviceId && !validateDeviceId(deviceId)) {
      return res.status(400).json({ success: false, error: 'Invalid device ID' });
    }

    // Reject paths with shell metacharacters or path traversal
    if (typeof apkPath !== 'string' || /[&|;`$(){}[\]<>\\'"*?]/.test(apkPath) || apkPath.includes('..')) {
      return res.status(400).json({ success: false, error: 'Invalid APK path' });
    }

    const device = deviceId ? `-s ${deviceId}` : '';
    const { stdout } = await execAsync(`adb ${device} install "${apkPath}"`);

    res.json({
      success: true,
      output: stdout
    });
  } catch (error) {
    console.error('APK install error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get device info
router.get('/info/:deviceId?', permissions.middleware('android.list'), async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (deviceId && !validateDeviceId(deviceId)) {
      return res.status(400).json({ success: false, error: 'Invalid device ID' });
    }

    const device = deviceId ? `-s ${deviceId}` : '';

    const [model, android, battery] = await Promise.all([
      execAsync(`adb ${device} shell getprop ro.product.model`),
      execAsync(`adb ${device} shell getprop ro.build.version.release`),
      execAsync(`adb ${device} shell dumpsys battery | grep level`)
    ]);

    res.json({
      success: true,
      device: {
        model: model.stdout.trim(),
        android: android.stdout.trim(),
        battery: battery.stdout.match(/\d+/)?.[0] || 'unknown'
      }
    });
  } catch (error) {
    console.error('Device info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as androidRouter };
