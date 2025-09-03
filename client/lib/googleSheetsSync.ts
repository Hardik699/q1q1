// Google Sheets sync utility
export class GoogleSheetsSync {
  private static instance: GoogleSheetsSync;
  private isEnabled: boolean = false;
  private spreadsheetUrl: string = "";

  private constructor() {
    this.checkConfiguration();
  }

  static getInstance(): GoogleSheetsSync {
    if (!GoogleSheetsSync.instance) {
      GoogleSheetsSync.instance = new GoogleSheetsSync();
    }
    return GoogleSheetsSync.instance;
  }

  // Check if Google Sheets is configured
  async checkConfiguration(): Promise<boolean> {
    try {
      const response = await fetch("/api/google-sheets/info");
      const data = await response.json();

      this.isEnabled = data.success && data.isConfigured;
      this.spreadsheetUrl = data.spreadsheetUrl || "";

      return this.isEnabled;
    } catch (error) {
      console.error("Failed to check Google Sheets configuration:", error);
      this.isEnabled = false;
      return false;
    }
  }

  // Get current status
  isConfigured(): boolean {
    return this.isEnabled;
  }

  // Get spreadsheet URL
  getSpreadsheetUrl(): string {
    return this.spreadsheetUrl;
  }

  // Sync all data to Google Sheets
  async syncAllData(): Promise<{
    success: boolean;
    message: string;
    spreadsheetUrl?: string;
  }> {
    try {
      if (!this.isEnabled) {
        await this.checkConfiguration();
        if (!this.isEnabled) {
          return {
            success: false,
            message:
              "Google Sheets is not configured. Please set up Google Sheets integration first.",
          };
        }
      }

      // Get data from localStorage
      const pcLaptopData = JSON.parse(
        localStorage.getItem("pcLaptopAssets") || "[]",
      );
      const systemAssetsData = JSON.parse(
        localStorage.getItem("systemAssets") || "[]",
      );

      const response = await fetch("/api/google-sheets/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pcLaptopData,
          systemAssetsData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.spreadsheetUrl = result.spreadsheetUrl;
      }

      return result;
    } catch (error) {
      console.error("Failed to sync to Google Sheets:", error);
      return {
        success: false,
        message: "Failed to sync to Google Sheets. Please try again.",
      };
    }
  }

  // Auto-sync when data changes (debounced)
  private syncTimeout: number | null = null;

  autoSync(): void {
    if (!this.isEnabled) return;

    // Debounce auto-sync to avoid too many requests
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = window.setTimeout(async () => {
      try {
        await this.syncAllData();
        console.log("Auto-sync to Google Sheets completed");
      } catch (error) {
        console.error("Auto-sync failed:", error);
      }
    }, 2000); // Wait 2 seconds after last change
  }

  // Manual sync with user feedback
  async manualSync(): Promise<void> {
    const result = await this.syncAllData();

    if (result.success) {
      alert(
        `✅ Data synced to Google Sheets successfully!\n\nView at: ${result.spreadsheetUrl}`,
      );
    } else {
      alert(`❌ Sync failed: ${result.message}`);
    }
  }
}

// Export singleton instance
export const googleSheetsSync = GoogleSheetsSync.getInstance();

// Auto-sync hook for React components
export const useGoogleSheetsAutoSync = () => {
  const triggerAutoSync = () => {
    googleSheetsSync.autoSync();
  };

  return { triggerAutoSync, isConfigured: googleSheetsSync.isConfigured() };
};
