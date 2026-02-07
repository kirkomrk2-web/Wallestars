import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getPermissions } from '../services/permissions.js';

const execAsync = promisify(exec);
const router = Router();
const permissions = getPermissions();

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
    const device = deviceId ? `-s ${deviceId}` : '';

    await execAsync(`adb ${device} shell input tap ${x} ${y}`);

    res.json({
      success: true,
      action: 'tap',
      coordinates: { x, y }
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
    const device = deviceId ? `-s ${deviceId}` : '';

    // Replace spaces with %s for ADB
    const formattedText = text.replace(/ /g, '%s');
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
    const device = deviceId ? `-s ${deviceId}` : '';

    // Common keycodes: HOME=3, BACK=4, MENU=82, POWER=26
    await execAsync(`adb ${device} shell input keyevent ${keyCode}`);

    res.json({
      success: true,
      action: 'key',
      keyCode: keyCode
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
