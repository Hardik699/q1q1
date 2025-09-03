import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { loadDemoData } from "@/lib/createDemoData";
import { STORAGE_KEY } from "@/lib/systemAssets";
import { useState, useEffect } from "react";
import {
  Mouse,
  Keyboard,
  Cpu,
  HardDrive,
  PlugZap,
  Headphones,
  Camera,
  Monitor,
  Phone,
  Database,
  Download,
  RefreshCw,
  ExternalLink,
  Settings,
} from "lucide-react";
import * as XLSX from "xlsx";
import { googleAppsScriptSync } from "@/lib/googleAppsScriptSync";

const items = [
  {
    name: "Mouse",
    slug: "mouse",
    Icon: Mouse,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    name: "Keyboard",
    slug: "keyboard",
    Icon: Keyboard,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  {
    name: "Motherboard",
    slug: "motherboard",
    Icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    name: "RAM",
    slug: "ram",
    Icon: HardDrive,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  {
    name: "SSD/HDD",
    slug: "storage",
    Icon: HardDrive,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  {
    name: "Power Supply",
    slug: "power-supply",
    Icon: PlugZap,
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  {
    name: "Headphone",
    slug: "headphone",
    Icon: Headphones,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
  },
  {
    name: "Camera",
    slug: "camera",
    Icon: Camera,
    color: "text-pink-400",
    bg: "bg-pink-500/20",
  },
  {
    name: "Monitor",
    slug: "monitor",
    Icon: Monitor,
    color: "text-teal-400",
    bg: "bg-teal-500/20",
  },
  {
    name: "Vonage",
    slug: "vonage",
    Icon: Phone,
    color: "text-indigo-400",
    bg: "bg-indigo-500/20",
  },
];

export default function SystemInfo() {
  const navigate = useNavigate();
  const [assetCount, setAssetCount] = useState(0);
  const [isGoogleSheetsConfigured, setIsGoogleSheetsConfigured] =
    useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    const assets = existing ? JSON.parse(existing) : [];
    setAssetCount(assets.length);

    // Check Google Apps Script configuration
    const configured = googleAppsScriptSync.isReady();
    setIsGoogleSheetsConfigured(configured);
  }, []);

  const handleLoadDemo = () => {
    const newAssets = loadDemoData();
    if (newAssets.length > 0) {
      setAssetCount((prev) => prev + newAssets.length);
      alert(
        `Loaded ${newAssets.length} demo system assets including mouse, keyboard, and other components!`,
      );
    } else {
      alert("Demo data already exists in the system.");
    }
  };

  // Export all system assets to Excel
  const exportSystemAssetsToExcel = () => {
    try {
      // Get all data from localStorage
      const systemAssetsData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]",
      );
      const pcLaptopData = JSON.parse(
        localStorage.getItem("pcLaptopAssets") || "[]",
      );

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // 1. All System Assets Sheet
      const allAssetsSheet = systemAssetsData.map((asset: any) => {
        const baseData = {
          "Asset ID": asset.id,
          Category: asset.category,
          "Serial Number": asset.serialNumber || "-",
          "Vendor Name": asset.vendorName || "-",
          "Company Name": asset.companyName || "-",
          "Purchase Date": asset.purchaseDate
            ? new Date(asset.purchaseDate).toLocaleDateString()
            : "-",
          "Warranty End Date": asset.warrantyEndDate
            ? new Date(asset.warrantyEndDate).toLocaleDateString()
            : "-",
          "Created Date": new Date(asset.createdAt).toLocaleDateString(),
        };

        // Add category-specific fields
        if (asset.category === "ram") {
          return {
            ...baseData,
            "RAM Size": asset.ramSize || "-",
            "RAM Type": asset.ramType || "-",
            "Processor Model": "-",
            "Storage Type": "-",
            "Storage Capacity": "-",
            "Vonage Number": "-",
            "Extension Code": "-",
            Password: "-",
          };
        } else if (asset.category === "motherboard") {
          return {
            ...baseData,
            "RAM Size": "-",
            "RAM Type": "-",
            "Processor Model": asset.processorModel || "-",
            "Storage Type": "-",
            "Storage Capacity": "-",
            "Vonage Number": "-",
            "Extension Code": "-",
            Password: "-",
          };
        } else if (asset.category === "storage") {
          return {
            ...baseData,
            "RAM Size": "-",
            "RAM Type": "-",
            "Processor Model": "-",
            "Storage Type": asset.storageType || "-",
            "Storage Capacity": asset.storageCapacity || "-",
            "Vonage Number": "-",
            "Extension Code": "-",
            Password: "-",
          };
        } else if (asset.category === "vonage") {
          return {
            ...baseData,
            "RAM Size": "-",
            "RAM Type": "-",
            "Processor Model": "-",
            "Storage Type": "-",
            "Storage Capacity": "-",
            "Vonage Number": asset.vonageNumber || "-",
            "Extension Code": asset.vonageExtCode || "-",
            Password: asset.vonagePassword || "-",
          };
        }

        return {
          ...baseData,
          "RAM Size": "-",
          "RAM Type": "-",
          "Processor Model": "-",
          "Storage Type": "-",
          "Storage Capacity": "-",
          "Vonage Number": "-",
          "Extension Code": "-",
          Password: "-",
        };
      });

      const allAssetsWS = XLSX.utils.json_to_sheet(allAssetsSheet);
      XLSX.utils.book_append_sheet(workbook, allAssetsWS, "All System Assets");

      // 2. Create sheets for each asset category
      const categories = [
        { name: "Mouse", category: "mouse" },
        { name: "Keyboard", category: "keyboard" },
        { name: "Motherboard", category: "motherboard" },
        { name: "RAM", category: "ram" },
        { name: "Storage", category: "storage" },
        { name: "Camera", category: "camera" },
        { name: "Headphone", category: "headphone" },
        { name: "Power Supply", category: "power-supply" },
        { name: "Monitor", category: "monitor" },
        { name: "Vonage", category: "vonage" },
      ];

      categories.forEach(({ name, category }) => {
        const categoryData = systemAssetsData
          .filter((asset: any) => asset.category === category)
          .map((asset: any) => {
            const baseData = {
              "Asset ID": asset.id,
              "Serial Number": asset.serialNumber || "-",
              "Vendor Name": asset.vendorName || "-",
              "Company Name": asset.companyName || "-",
              "Purchase Date": asset.purchaseDate
                ? new Date(asset.purchaseDate).toLocaleDateString()
                : "-",
              "Warranty End Date": asset.warrantyEndDate
                ? new Date(asset.warrantyEndDate).toLocaleDateString()
                : "-",
              "Created Date": new Date(asset.createdAt).toLocaleDateString(),
            };

            // Add category-specific fields
            if (category === "ram") {
              return {
                ...baseData,
                "RAM Size": asset.ramSize || "-",
                "RAM Type": asset.ramType || "-",
              };
            } else if (category === "motherboard") {
              return {
                ...baseData,
                "Processor Model": asset.processorModel || "-",
              };
            } else if (category === "storage") {
              return {
                ...baseData,
                "Storage Type": asset.storageType || "-",
                "Storage Capacity": asset.storageCapacity || "-",
              };
            } else if (category === "vonage") {
              return {
                ...baseData,
                "Vonage Number": asset.vonageNumber || "-",
                "Extension Code": asset.vonageExtCode || "-",
                Password: asset.vonagePassword || "-",
              };
            }

            return baseData;
          });

        if (categoryData.length > 0) {
          const categoryWS = XLSX.utils.json_to_sheet(categoryData);
          XLSX.utils.book_append_sheet(workbook, categoryWS, name);
        }
      });

      // 3. PC/Laptop Configurations (if exists)
      if (pcLaptopData.length > 0) {
        const pcLaptopSheet = pcLaptopData.map((item: any) => {
          // Get storage details
          const storageDetails = item.storageId
            ? systemAssetsData.find((s: any) => s.id === item.storageId)
            : null;

          // Get RAM details
          const ram1Details = item.ramId
            ? systemAssetsData.find((s: any) => s.id === item.ramId)
            : null;
          const ram2Details = item.ramId2
            ? systemAssetsData.find((s: any) => s.id === item.ramId2)
            : null;

          // Calculate total RAM
          let totalRam = 0;
          if (ram1Details?.ramSize) {
            totalRam +=
              parseInt(ram1Details.ramSize.replace(/[^0-9]/g, "")) || 0;
          }
          if (ram2Details?.ramSize) {
            totalRam +=
              parseInt(ram2Details.ramSize.replace(/[^0-9]/g, "")) || 0;
          }

          return {
            "PC/Laptop ID": item.id,
            "Mouse ID": item.mouseId || "-",
            "Keyboard ID": item.keyboardId || "-",
            "Motherboard ID": item.motherboardId || "-",
            "Camera ID": item.cameraId || "-",
            "Headphone ID": item.headphoneId || "-",
            "Power Supply ID": item.powerSupplyId || "-",
            "Storage ID": item.storageId || "-",
            "Storage Type": storageDetails?.storageType || "-",
            "Storage Capacity": storageDetails?.storageCapacity || "-",
            "RAM Slot 1 ID": item.ramId || "-",
            "RAM Slot 1 Size": ram1Details?.ramSize || "-",
            "RAM Slot 2 ID": item.ramId2 || "-",
            "RAM Slot 2 Size": ram2Details?.ramSize || "-",
            "Total RAM": totalRam > 0 ? `${totalRam}GB` : "-",
            "Created Date": new Date(item.createdAt).toLocaleDateString(),
          };
        });

        const pcLaptopWS = XLSX.utils.json_to_sheet(pcLaptopSheet);
        XLSX.utils.book_append_sheet(
          workbook,
          pcLaptopWS,
          "PC-Laptop Configurations",
        );
      }

      // 4. Summary Sheet
      const summaryData = [
        { "Data Type": "Total System Assets", Count: systemAssetsData.length },
        {
          "Data Type": "Total PC/Laptop Configurations",
          Count: pcLaptopData.length,
        },
        ...categories.map(({ name, category }) => ({
          "Data Type": `${name} Assets`,
          Count: systemAssetsData.filter(
            (asset: any) => asset.category === category,
          ).length,
        })),
      ];

      const summaryWS = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWS, "Summary");

      // Generate filename with current date
      const now = new Date();
      const filename = `System_Assets_Complete_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.xlsx`;

      // Write the file
      XLSX.writeFile(workbook, filename);

      alert(`Complete system data exported successfully: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">System Info</h1>
            <p className="text-slate-400">Hardware categories</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleLoadDemo}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Load Demo Data
            </Button>
            {assetCount > 0 && (
              <Button
                onClick={() => navigate("/demo-data")}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                View Demo Data
              </Button>
            )}
            {assetCount > 0 && (
              <Button
                onClick={exportSystemAssetsToExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
            )}
            {isGoogleSheetsConfigured && assetCount > 0 && (
              <Button
                onClick={() => googleAppsScriptSync.manualSync()}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sync to Sheets
              </Button>
            )}
            {!isGoogleSheetsConfigured && (
              <Button
                onClick={() => navigate("/google-apps-script-config")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Setup Auto-Sync
              </Button>
            )}
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {assetCount} assets | {items.length} categories
            </Badge>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ name, slug, Icon, color, bg }) => (
            <Card
              key={name}
              className="group relative overflow-hidden bg-slate-900/50 border-slate-700 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-slate-500/60"
            >
              <CardHeader>
                <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-500/5 blur-2xl transition-all duration-300 group-hover:bg-blue-500/15" />
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{name}</span>
                  <span
                    className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-end gap-2">
                <Button
                  onClick={() => navigate(`/system-info/${slug}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-blue-500/20 transition-transform duration-300 hover:scale-105"
                >
                  Go
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
