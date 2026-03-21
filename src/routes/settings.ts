import express, { type IRouter } from "express";
import { settingsStore } from "../store/settings-store";

const router: IRouter = express.Router();

// Get all system settings
router.get("/settings", (_req, res) => {
  try {
    const settings = settingsStore.getSettings();
    res.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve settings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update system settings
router.put("/settings", (req, res) => {
  try {
    const updatedSettings = settingsStore.updateSettings(req.body, "api");

    // Log the settings update
    console.log(
      `[${new Date().toISOString()}] Settings updated:`,
      Object.keys(req.body),
    );

    res.json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Failed to update settings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get specific setting sections
router.get("/settings/ai", (_req, res) => {
  try {
    const aiSettings = settingsStore.getAISettings();
    res.json({
      success: true,
      data: aiSettings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve AI settings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/settings/alerts", (_req, res) => {
  try {
    const alertSettings = settingsStore.getAlertSettings();
    res.json({
      success: true,
      data: alertSettings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve alert settings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/settings/traffic", (_req, res) => {
  try {
    const trafficSettings = settingsStore.getTrafficControlSettings();
    res.json({
      success: true,
      data: trafficSettings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve traffic control settings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/settings/display", (_req, res) => {
  try {
    const displaySettings = settingsStore.getDisplaySettings();
    res.json({
      success: true,
      data: displaySettings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve display settings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Reset settings to defaults
router.post("/settings/reset", (_req, res) => {
  try {
    const defaultSettings = settingsStore.resetToDefaults();
    console.log(`[${new Date().toISOString()}] Settings reset to defaults`);

    res.json({
      success: true,
      data: defaultSettings,
      message: "Settings reset to defaults",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to reset settings",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update specific AI model confidence threshold (used by inference API)
router.put("/settings/ai/confidence", (req, res) => {
  try {
    const { confidenceThreshold } = req.body;

    if (
      typeof confidenceThreshold !== "number" ||
      confidenceThreshold < 0.5 ||
      confidenceThreshold > 0.99
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid confidence threshold",
        message: "Confidence threshold must be between 0.5 and 0.99",
      });
    }

    const updatedSettings = settingsStore.updateSettings(
      {
        aiModel: {
          ...settingsStore.getAISettings(),
          confidenceThreshold,
        },
      },
      "ai-system",
    );

    console.log(
      `[${new Date().toISOString()}] AI confidence threshold updated to ${confidenceThreshold}`,
    );

    res.json({
      success: true,
      data: updatedSettings.aiModel,
      message: `Confidence threshold updated to ${Math.round(confidenceThreshold * 100)}%`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update confidence threshold",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
