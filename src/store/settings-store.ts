// System settings store
// Manages AI detection, alerting, and system configuration

export interface SystemSettings {
  // AI Detection Settings
  aiModel: {
    architecture: "yolov8" | "yolov5" | "efficientdet";
    confidenceThreshold: number; // 0.5 to 0.99
    processingInterval: number; // milliseconds between detections
  };

  // Alert System Settings
  alerts: {
    congestionThreshold: number; // percentage 0-100
    lowSpeedThreshold: number; // km/h
    emergencyVehicleSensitivity: number; // 0.5 to 1.0
    emailNotifications: boolean;
  };

  // Traffic Control Settings
  trafficControl: {
    adaptiveSignalTiming: boolean;
    maxGreenTime: number; // seconds
    minGreenTime: number; // seconds
    emergencyOverride: boolean;
    algorithm: {
      baseTime: number; // seconds
      factor: number; // seconds per vehicle
      w1: number; // vehicle count weight
      w2: number; // wait-time weight
      waitScale: number; // wait-time normalization factor
      starvationThreshold: number; // seconds
      maxWait: number; // seconds clamp for wait contribution
    };
  };

  // Dashboard Settings
  display: {
    refreshInterval: number; // milliseconds
    theme: "dark" | "light";
    showPredictions: boolean;
    autoExport: boolean;
  };

  // System Status
  lastUpdated: Date;
  updatedBy: string;
}

class SettingsStore {
  private settings: SystemSettings = {
    // Default values optimized for 4-camera system
    aiModel: {
      architecture: "yolov8",
      confidenceThreshold: 0.85,
      processingInterval: 350,
    },
    alerts: {
      congestionThreshold: 80,
      lowSpeedThreshold: 15,
      emergencyVehicleSensitivity: 0.9,
      emailNotifications: false,
    },
    trafficControl: {
      adaptiveSignalTiming: true,
      maxGreenTime: 90,
      minGreenTime: 10,
      emergencyOverride: true,
      algorithm: {
        baseTime: 10,
        factor: 2,
        w1: 1,
        w2: 1,
        waitScale: 0.1,
        starvationThreshold: 180,
        maxWait: 300,
      },
    },
    display: {
      refreshInterval: 3000,
      theme: "dark",
      showPredictions: true,
      autoExport: false,
    },
    lastUpdated: new Date(),
    updatedBy: "system",
  };

  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  updateSettings(
    newSettings: Partial<SystemSettings>,
    updatedBy: string = "user",
  ): SystemSettings {
    this.settings = {
      ...this.settings,
      ...newSettings,
      lastUpdated: new Date(),
      updatedBy,
    };

    // Validate settings
    this.validateSettings();

    return { ...this.settings };
  }

  private validateSettings(): void {
    // Ensure confidence threshold is within bounds
    if (this.settings.aiModel.confidenceThreshold < 0.5) {
      this.settings.aiModel.confidenceThreshold = 0.5;
    }
    if (this.settings.aiModel.confidenceThreshold > 0.99) {
      this.settings.aiModel.confidenceThreshold = 0.99;
    }

    // Ensure alert thresholds are reasonable
    if (this.settings.alerts.congestionThreshold < 30) {
      this.settings.alerts.congestionThreshold = 30;
    }
    if (this.settings.alerts.congestionThreshold > 100) {
      this.settings.alerts.congestionThreshold = 100;
    }

    // Ensure speed threshold is reasonable
    if (this.settings.alerts.lowSpeedThreshold < 5) {
      this.settings.alerts.lowSpeedThreshold = 5;
    }
    if (this.settings.alerts.lowSpeedThreshold > 50) {
      this.settings.alerts.lowSpeedThreshold = 50;
    }

    // Ensure refresh interval is reasonable (1-30 seconds)
    if (this.settings.display.refreshInterval < 1000) {
      this.settings.display.refreshInterval = 1000;
    }
    if (this.settings.display.refreshInterval > 30000) {
      this.settings.display.refreshInterval = 30000;
    }

    // Keep traffic timing bounds sane
    if (this.settings.trafficControl.minGreenTime < 5) {
      this.settings.trafficControl.minGreenTime = 5;
    }
    if (this.settings.trafficControl.maxGreenTime > 180) {
      this.settings.trafficControl.maxGreenTime = 180;
    }
    if (this.settings.trafficControl.maxGreenTime < this.settings.trafficControl.minGreenTime) {
      this.settings.trafficControl.maxGreenTime = this.settings.trafficControl.minGreenTime;
    }

    const algo = this.settings.trafficControl.algorithm;
    if (algo.baseTime < 5) algo.baseTime = 5;
    if (algo.baseTime > 30) algo.baseTime = 30;
    if (algo.factor < 0.5) algo.factor = 0.5;
    if (algo.factor > 10) algo.factor = 10;
    if (algo.w1 < 0) algo.w1 = 0;
    if (algo.w1 > 5) algo.w1 = 5;
    if (algo.w2 < 0) algo.w2 = 0;
    if (algo.w2 > 5) algo.w2 = 5;
    if (algo.waitScale < 0.01) algo.waitScale = 0.01;
    if (algo.waitScale > 1) algo.waitScale = 1;
    if (algo.starvationThreshold < 30) algo.starvationThreshold = 30;
    if (algo.starvationThreshold > 600) algo.starvationThreshold = 600;
    if (algo.maxWait < 60) algo.maxWait = 60;
    if (algo.maxWait > 900) algo.maxWait = 900;
  }

  // Get specific setting sections
  getAISettings() {
    return this.settings.aiModel;
  }

  getAlertSettings() {
    return this.settings.alerts;
  }

  getTrafficControlSettings() {
    return this.settings.trafficControl;
  }

  getDisplaySettings() {
    return this.settings.display;
  }

  // Reset to defaults
  resetToDefaults(): SystemSettings {
    this.settings = {
      aiModel: {
        architecture: "yolov8",
        confidenceThreshold: 0.85,
        processingInterval: 350,
      },
      alerts: {
        congestionThreshold: 80,
        lowSpeedThreshold: 15,
        emergencyVehicleSensitivity: 0.9,
        emailNotifications: false,
      },
      trafficControl: {
        adaptiveSignalTiming: true,
        maxGreenTime: 90,
        minGreenTime: 10,
        emergencyOverride: true,
        algorithm: {
          baseTime: 10,
          factor: 2,
          w1: 1,
          w2: 1,
          waitScale: 0.1,
          starvationThreshold: 180,
          maxWait: 300,
        },
      },
      display: {
        refreshInterval: 3000,
        theme: "dark",
        showPredictions: true,
        autoExport: false,
      },
      lastUpdated: new Date(),
      updatedBy: "system",
    };

    return { ...this.settings };
  }
}

// Singleton instance
export const settingsStore = new SettingsStore();
