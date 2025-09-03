import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Users,
  Building2,
  HardDrive,
  Monitor,
  CreditCard,
  UserCheck,
  AlertCircle,
  Database,
  RefreshCw,
  ExternalLink,
  Settings,
} from "lucide-react";

// Type definitions based on the application's data structures
interface AdminUser {
  id: string;
  username: string;
  createdAt: string;
}

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  department: string;
  position: string;
  tableNumber: string;
  salary: string;
  status: "active" | "inactive";
  joiningDate: string;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

interface SystemAsset {
  id: string;
  category: string;
  serialNumber: string;
  vendorName: string;
  companyName?: string;
  purchaseDate: string;
  warrantyEndDate: string;
  ramSize?: string;
  ramType?: string;
  processorModel?: string;
  storageType?: string;
  storageCapacity?: string;
  vonageNumber?: string;
  vonageExtCode?: string;
  createdAt: string;
}

interface PCLaptopAsset {
  id: string;
  createdAt: string;
  mouseId?: string;
  keyboardId?: string;
  motherboardId?: string;
  cameraId?: string;
  headphoneId?: string;
  powerSupplyId?: string;
  storageId?: string;
  ramId?: string;
  ramId2?: string;
}

interface ITAccount {
  id: string;
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: Array<{
    provider: string;
    email: string;
    password: string;
  }>;
  vitelGlobal: {
    id: string;
    provider: "vitel" | "vonage";
  };
  lmPlayer: {
    id: string;
    password: string;
    license: string;
  };
  createdAt: string;
}

interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  totalWorkingDays: number;
  actualWorkingDays: number;
  basicSalary: number;
  bonus?: number;
  deductions?: number;
  totalSalary: number;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

interface PendingITNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  tableNumber: string;
  email: string;
  createdAt: string;
  processed: boolean;
}

interface AttendanceRecord {
  employeeId: string;
  date: string;
  present: boolean;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

interface MasterData {
  adminUsers: AdminUser[];
  userCredentials: Record<string, string>;
  employees: Employee[];
  departments: Department[];
  leaveRequests: LeaveRequest[];
  attendanceRecords: AttendanceRecord[];
  systemAssets: SystemAsset[];
  pcLaptopAssets: PCLaptopAsset[];
  itAccounts: ITAccount[];
  salaryRecords: SalaryRecord[];
  pendingITNotifications: PendingITNotification[];
  authInfo: {
    isAuthenticated: boolean;
    userRole: string;
    currentUser: string;
  };
}

export default function MasterAdmin() {
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState<MasterData>({
    adminUsers: [],
    userCredentials: {},
    employees: [],
    departments: [],
    leaveRequests: [],
    attendanceRecords: [],
    systemAssets: [],
    pcLaptopAssets: [],
    itAccounts: [],
    salaryRecords: [],
    pendingITNotifications: [],
    authInfo: {
      isAuthenticated: false,
      userRole: "",
      currentUser: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isGoogleSheetsConfigured, setIsGoogleSheetsConfigured] =
    useState(false);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<{
    title?: string;
    url?: string;
    sheets?: Array<{ title: string; sheetId: number }>;
  }>({});

  useEffect(() => {
    loadAllData();
    checkGoogleSheetsConfiguration();
  }, []);

  const checkGoogleSheetsConfiguration = async () => {
    try {
      const response = await fetch("/api/google-sheets/info");
      if (response.ok) {
        const data = await response.json();
        setIsGoogleSheetsConfigured(data.success);
        if (data.success) {
          setSpreadsheetInfo({
            title: data.title,
            url: data.url,
            sheets: data.sheets,
          });
        }
      }
    } catch (error) {
      console.error("Error checking Google Sheets configuration:", error);
      setIsGoogleSheetsConfigured(false);
    }
  };

  const loadAllData = () => {
    try {
      setLoading(true);

      // Load all localStorage data
      const adminUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const userCredentials = JSON.parse(
        localStorage.getItem("userCredentials") || "{}",
      );
      const employees = JSON.parse(localStorage.getItem("hrEmployees") || "[]");
      const departments = JSON.parse(
        localStorage.getItem("departments") || "[]",
      );
      const leaveRequests = JSON.parse(
        localStorage.getItem("leaveRequests") || "[]",
      );
      const attendanceRecords = JSON.parse(
        localStorage.getItem("attendanceRecords") || "[]",
      );
      const systemAssets = JSON.parse(
        localStorage.getItem("systemAssets") || "[]",
      );
      const pcLaptopAssets = JSON.parse(
        localStorage.getItem("pcLaptopAssets") || "[]",
      );
      const itAccounts = JSON.parse(localStorage.getItem("itAccounts") || "[]");
      const salaryRecords = JSON.parse(
        localStorage.getItem("salaryRecords") || "[]",
      );
      const pendingITNotifications = JSON.parse(
        localStorage.getItem("pendingITNotifications") || "[]",
      );

      // Load auth info
      const authInfo = {
        isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
        userRole: localStorage.getItem("userRole") || "",
        currentUser: localStorage.getItem("currentUser") || "",
      };

      setMasterData({
        adminUsers,
        userCredentials,
        employees,
        departments,
        leaveRequests,
        attendanceRecords,
        systemAssets,
        pcLaptopAssets,
        itAccounts,
        salaryRecords,
        pendingITNotifications,
        authInfo,
      });
    } catch (error) {
      console.error("Error loading master data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = () => {
    try {
      const dataBlob = new Blob([JSON.stringify(masterData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `master-admin-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting data. Please try again.");
    }
  };

  const syncToGoogleSheets = async () => {
    try {
      setSyncing(true);

      const response = await fetch("/api/google-sheets/sync-master-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ masterData }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `Successfully synced all data to Google Sheets!\n\nRecords updated:\n- Employees: ${result.recordCounts.employees}\n- System Assets: ${result.recordCounts.systemAssets}\n- PC/Laptops: ${result.recordCounts.pcLaptopConfigs}\n- IT Accounts: ${result.recordCounts.itAccounts}\n- Salary Records: ${result.recordCounts.salaryRecords}\n- And ${result.sheetsUpdated - 5} more sheets`,
        );
      } else {
        alert(`Error syncing to Google Sheets: ${result.error}`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Error syncing to Google Sheets. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const getAssetDetails = (assetId: string) => {
    const asset = masterData.systemAssets.find((a) => a.id === assetId);
    if (!asset) return assetId;

    let details = `${assetId} (${asset.vendorName}`;
    if (asset.ramSize) details += ` - ${asset.ramSize}`;
    if (asset.storageType && asset.storageCapacity)
      details += ` - ${asset.storageType} ${asset.storageCapacity}`;
    details += ")";
    return details;
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = masterData.employees.find((e) => e.id === employeeId);
    return employee ? employee.fullName : employeeId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
        <AppNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Loading master data...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Master Admin Dashboard
            </h1>
            <p className="text-slate-400">
              Complete database overview in table format
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={exportAllData}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export All Data
            </Button>
            {isGoogleSheetsConfigured && (
              <Button
                onClick={syncToGoogleSheets}
                disabled={syncing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing ? "Syncing..." : "Sync to Google Sheets"}
              </Button>
            )}
            {isGoogleSheetsConfigured && spreadsheetInfo.url && (
              <Button
                onClick={() => window.open(spreadsheetInfo.url, "_blank")}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Spreadsheet
              </Button>
            )}
            {!isGoogleSheetsConfigured && (
              <Button
                onClick={() =>
                  alert(
                    "Please configure Google Sheets first.\n\n1. Set GOOGLE_SHEET_ID in environment variables\n2. Set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS in environment variables\n3. Share your Google Sheet with the service account email",
                  )
                }
                className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Setup Google Sheets
              </Button>
            )}
            <Button
              onClick={loadAllData}
              className="bg-slate-600 hover:bg-slate-700 text-white flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Employees</p>
                  <p className="text-2xl font-bold text-white">
                    {masterData.employees.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">System Assets</p>
                  <p className="text-2xl font-bold text-white">
                    {masterData.systemAssets.length}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">PC/Laptops</p>
                  <p className="text-2xl font-bold text-white">
                    {masterData.pcLaptopAssets.length}
                  </p>
                </div>
                <Monitor className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">IT Accounts</p>
                  <p className="text-2xl font-bold text-white">
                    {masterData.itAccounts.length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Google Sheets Status */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Google Sheets Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGoogleSheetsConfigured ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">
                    Connected
                  </Badge>
                  <span className="text-white">
                    Google Sheets is configured and ready
                  </span>
                </div>
                {spreadsheetInfo.title && (
                  <div className="text-sm text-slate-300">
                    <span className="font-medium">Spreadsheet:</span>{" "}
                    {spreadsheetInfo.title}
                  </div>
                )}
                {spreadsheetInfo.sheets &&
                  spreadsheetInfo.sheets.length > 0 && (
                    <div className="text-sm text-slate-300">
                      <span className="font-medium">Sheets:</span>{" "}
                      {spreadsheetInfo.sheets.map((s) => s.title).join(", ")}
                    </div>
                  )}
                <div className="flex gap-2">
                  <Button
                    onClick={syncToGoogleSheets}
                    disabled={syncing}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
                    />
                    {syncing ? "Syncing..." : "Sync All Data"}
                  </Button>
                  {spreadsheetInfo.url && (
                    <Button
                      onClick={() => window.open(spreadsheetInfo.url, "_blank")}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Spreadsheet
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Not Configured</Badge>
                  <span className="text-white">
                    Google Sheets integration not set up
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  <p className="mb-2">
                    To enable Google Sheets sync, you need to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Create a Google Service Account</li>
                    <li>Download the service account JSON credentials</li>
                    <li>
                      Set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment
                      variable
                    </li>
                    <li>
                      Create a Google Sheet and set GOOGLE_SHEET_ID environment
                      variable
                    </li>
                    <li>
                      Share the Google Sheet with your service account email
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={() =>
                    alert(
                      "Please refer to the setup documentation for detailed instructions on configuring Google Sheets integration.",
                    )
                  }
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Instructions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabbed Data Tables */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              Complete Database Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="employees" className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 bg-slate-800 mb-6">
                <TabsTrigger value="employees" className="text-xs">
                  Employees
                </TabsTrigger>
                <TabsTrigger value="admin" className="text-xs">
                  Admin Users
                </TabsTrigger>
                <TabsTrigger value="departments" className="text-xs">
                  Departments
                </TabsTrigger>
                <TabsTrigger value="systemassets" className="text-xs">
                  System Assets
                </TabsTrigger>
                <TabsTrigger value="pclaptops" className="text-xs">
                  PC/Laptops
                </TabsTrigger>
                <TabsTrigger value="itaccounts" className="text-xs">
                  IT Accounts
                </TabsTrigger>
                <TabsTrigger value="salaries" className="text-xs">
                  Salaries
                </TabsTrigger>
                <TabsTrigger value="leaves" className="text-xs">
                  Leave Requests
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs">
                  IT Notifications
                </TabsTrigger>
              </TabsList>

              {/* Employees Table */}
              <TabsContent value="employees">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Table No.</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joining Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-mono">
                            {employee.employeeId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {employee.fullName}
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.tableNumber}</TableCell>
                          <TableCell>₹{employee.salary}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                employee.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {employee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              employee.joiningDate,
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.employees.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No employees found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Admin Users Table */}
              <TabsContent value="admin">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Has Password</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.adminUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono">{user.id}</TableCell>
                          <TableCell className="font-medium">
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                masterData.userCredentials[user.username]
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {masterData.userCredentials[user.username]
                                ? "Yes"
                                : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.adminUsers.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No admin users found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Departments Table */}
              <TabsContent value="departments">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Department Name</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Employee Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.departments.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-mono">{dept.id}</TableCell>
                          <TableCell className="font-medium">
                            {dept.name}
                          </TableCell>
                          <TableCell>{dept.manager}</TableCell>
                          <TableCell>{dept.employeeCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.departments.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No departments found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* System Assets Table */}
              <TabsContent value="systemassets">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Warranty End</TableHead>
                        <TableHead>Specifications</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.systemAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-mono">
                            {asset.id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{asset.category}</Badge>
                          </TableCell>
                          <TableCell>{asset.vendorName}</TableCell>
                          <TableCell className="font-mono">
                            {asset.serialNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(asset.purchaseDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              asset.warrantyEndDate,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {asset.ramSize &&
                              `${asset.ramSize} ${asset.ramType || ""}`}
                            {asset.processorModel && asset.processorModel}
                            {asset.storageType &&
                              `${asset.storageType} ${asset.storageCapacity || ""}`}
                            {asset.vonageNumber && `Tel: ${asset.vonageNumber}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.systemAssets.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No system assets found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* PC/Laptop Configurations Table */}
              <TabsContent value="pclaptops">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PC/Laptop ID</TableHead>
                        <TableHead>Mouse</TableHead>
                        <TableHead>Keyboard</TableHead>
                        <TableHead>Motherboard</TableHead>
                        <TableHead>RAM Slot 1</TableHead>
                        <TableHead>RAM Slot 2</TableHead>
                        <TableHead>Storage</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.pcLaptopAssets.map((pc) => (
                        <TableRow key={pc.id}>
                          <TableCell className="font-mono font-medium">
                            {pc.id}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pc.mouseId ? getAssetDetails(pc.mouseId) : "-"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pc.keyboardId
                              ? getAssetDetails(pc.keyboardId)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pc.motherboardId
                              ? getAssetDetails(pc.motherboardId)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pc.ramId ? getAssetDetails(pc.ramId) : "-"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pc.ramId2 ? getAssetDetails(pc.ramId2) : "-"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pc.storageId ? getAssetDetails(pc.storageId) : "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(pc.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.pcLaptopAssets.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No PC/Laptop configurations found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* IT Accounts Table */}
              <TabsContent value="itaccounts">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>System ID</TableHead>
                        <TableHead>Table No.</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Email Accounts</TableHead>
                        <TableHead>Vitel/Vonage</TableHead>
                        <TableHead>LM Player</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.itAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">
                            {account.employeeName}
                          </TableCell>
                          <TableCell className="font-mono">
                            {account.systemId}
                          </TableCell>
                          <TableCell>{account.tableNumber}</TableCell>
                          <TableCell>{account.department}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {account.emails.map((email, idx) => (
                                <div key={idx}>
                                  {email.provider}: {email.email}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {account.vitelGlobal.provider}:{" "}
                            {account.vitelGlobal.id}
                          </TableCell>
                          <TableCell className="text-xs">
                            ID: {account.lmPlayer.id}
                            <br />
                            License: {account.lmPlayer.license}
                          </TableCell>
                          <TableCell>
                            {new Date(account.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.itAccounts.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No IT accounts found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Salary Records Table */}
              <TabsContent value="salaries">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Working Days</TableHead>
                        <TableHead>Basic Salary</TableHead>
                        <TableHead>Bonus</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Total Salary</TableHead>
                        <TableHead>Payment Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.salaryRecords.map((salary) => (
                        <TableRow key={salary.id}>
                          <TableCell className="font-medium">
                            {getEmployeeName(salary.employeeId)}
                          </TableCell>
                          <TableCell>
                            {salary.month} {salary.year}
                          </TableCell>
                          <TableCell>
                            {salary.actualWorkingDays}/{salary.totalWorkingDays}
                          </TableCell>
                          <TableCell>
                            ₹{salary.basicSalary.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₹{salary.bonus?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            ₹{salary.deductions?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{salary.totalSalary.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {salary.paymentDate
                              ? new Date(
                                  salary.paymentDate,
                                ).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.salaryRecords.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No salary records found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Leave Requests Table */}
              <TabsContent value="leaves">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.leaveRequests.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell className="font-medium">
                            {leave.employeeName}
                          </TableCell>
                          <TableCell>{leave.leaveType}</TableCell>
                          <TableCell>
                            {new Date(leave.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                leave.status === "approved"
                                  ? "default"
                                  : leave.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {leave.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {leave.reason}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.leaveRequests.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No leave requests found
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Pending IT Notifications Table */}
              <TabsContent value="notifications">
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Table No.</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterData.pendingITNotifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell className="font-medium">
                            {notification.employeeName}
                          </TableCell>
                          <TableCell>{notification.department}</TableCell>
                          <TableCell>{notification.tableNumber}</TableCell>
                          <TableCell>{notification.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                notification.processed
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {notification.processed ? "Processed" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {masterData.pendingITNotifications.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No pending IT notifications found
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Authentication Info */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Current Session Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Authentication Status:</span>
                <div className="font-medium">
                  <Badge
                    variant={
                      masterData.authInfo.isAuthenticated
                        ? "default"
                        : "destructive"
                    }
                  >
                    {masterData.authInfo.isAuthenticated
                      ? "Authenticated"
                      : "Not Authenticated"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-slate-400">User Role:</span>
                <div className="font-medium text-white">
                  {masterData.authInfo.userRole || "None"}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Current User:</span>
                <div className="font-medium text-white">
                  {masterData.authInfo.currentUser || "None"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
