import { RequestHandler } from "express";
import { google } from "googleapis";

// Google Sheets API configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

interface MasterData {
  adminUsers: Array<{
    id: string;
    username: string;
    createdAt: string;
  }>;
  userCredentials: Record<string, string>;
  employees: Array<{
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
    fatherName?: string;
    motherName?: string;
    birthDate?: string;
    bloodGroup?: string;
    emergencyMobileNumber?: string;
    alternativeMobileNumber?: string;
    address?: string;
    permanentAddress?: string;
    accountNumber?: string;
    ifscCode?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    uanNumber?: string;
  }>;
  departments: Array<{
    id: string;
    name: string;
    manager: string;
    employeeCount: number;
  }>;
  leaveRequests: Array<{
    id: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: "pending" | "approved" | "rejected";
    reason: string;
  }>;
  attendanceRecords: Array<{
    employeeId: string;
    date: string;
    present: boolean;
    checkIn?: string;
    checkOut?: string;
    notes?: string;
  }>;
  systemAssets: Array<{
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
    vonagePassword?: string;
    createdAt: string;
  }>;
  pcLaptopAssets: Array<{
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
  }>;
  itAccounts: Array<{
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
  }>;
  salaryRecords: Array<{
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
  }>;
  pendingITNotifications: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    tableNumber: string;
    email: string;
    createdAt: string;
    processed: boolean;
  }>;
}

// Helper function to get Google Sheets API client
async function getGoogleSheetsClient() {
  try {
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
    if (!credentials) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable not set",
      );
    }

    const serviceAccount = JSON.parse(credentials);
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    return google.sheets({ version: "v4", auth: authClient });
  } catch (error) {
    console.error("Error creating Google Sheets client:", error);
    throw error;
  }
}

// Helper function to find asset details by ID
function findAssetDetails(systemAssets: any[], assetId: string) {
  const asset = systemAssets.find((a) => a.id === assetId);
  if (!asset) return assetId;

  let details = `${assetId} (${asset.vendorName}`;
  if (asset.ramSize) details += ` - ${asset.ramSize}`;
  if (asset.storageType && asset.storageCapacity)
    details += ` - ${asset.storageType} ${asset.storageCapacity}`;
  details += ")";
  return details;
}

// Helper function to find employee name by ID
function findEmployeeName(employees: any[], employeeId: string) {
  const employee = employees.find((e) => e.id === employeeId);
  return employee ? employee.fullName : employeeId;
}

// Main sync function
export const syncMasterDataToGoogleSheets: RequestHandler = async (
  req,
  res,
) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable not set",
      });
    }

    const { masterData }: { masterData: MasterData } = req.body;
    if (!masterData) {
      return res.status(400).json({
        success: false,
        error: "Master data is required",
      });
    }

    const sheets = await getGoogleSheetsClient();

    // 1. Create/Update Employees Sheet
    const employeesData = [
      [
        "Employee ID",
        "Full Name",
        "Email",
        "Mobile",
        "Department",
        "Position",
        "Table No.",
        "Salary",
        "Status",
        "Joining Date",
        "Father Name",
        "Mother Name",
        "Birth Date",
        "Blood Group",
        "Emergency Mobile",
        "Address",
        "Account Number",
        "IFSC Code",
        "Aadhaar Number",
        "PAN Number",
        "UAN Number",
        "Created Date",
      ],
      ...masterData.employees.map((emp) => [
        emp.employeeId,
        emp.fullName,
        emp.email,
        emp.mobileNumber,
        emp.department,
        emp.position,
        emp.tableNumber,
        emp.salary,
        emp.status,
        new Date(emp.joiningDate).toLocaleDateString(),
        emp.fatherName || "",
        emp.motherName || "",
        emp.birthDate || "",
        emp.bloodGroup || "",
        emp.emergencyMobileNumber || "",
        emp.address || "",
        emp.accountNumber || "",
        emp.ifscCode || "",
        emp.aadhaarNumber || "",
        emp.panNumber || "",
        emp.uanNumber || "",
        new Date(emp.createdAt).toLocaleDateString(),
      ]),
    ];

    // 2. Create/Update Admin Users Sheet
    const adminUsersData = [
      ["ID", "Username", "Has Password", "Created Date"],
      ...masterData.adminUsers.map((user) => [
        user.id,
        user.username,
        masterData.userCredentials[user.username] ? "Yes" : "No",
        new Date(user.createdAt).toLocaleDateString(),
      ]),
    ];

    // 3. Create/Update Departments Sheet
    const departmentsData = [
      ["ID", "Department Name", "Manager", "Employee Count"],
      ...masterData.departments.map((dept) => [
        dept.id,
        dept.name,
        dept.manager,
        dept.employeeCount.toString(),
      ]),
    ];

    // 4. Create/Update System Assets Sheet
    const systemAssetsData = [
      [
        "Asset ID",
        "Category",
        "Vendor",
        "Serial Number",
        "Company",
        "Purchase Date",
        "Warranty End",
        "RAM Size",
        "RAM Type",
        "Processor",
        "Storage Type",
        "Storage Capacity",
        "Vonage Number",
        "Vonage Ext",
        "Created Date",
      ],
      ...masterData.systemAssets.map((asset) => [
        asset.id,
        asset.category,
        asset.vendorName,
        asset.serialNumber,
        asset.companyName || "",
        new Date(asset.purchaseDate).toLocaleDateString(),
        new Date(asset.warrantyEndDate).toLocaleDateString(),
        asset.ramSize || "",
        asset.ramType || "",
        asset.processorModel || "",
        asset.storageType || "",
        asset.storageCapacity || "",
        asset.vonageNumber || "",
        asset.vonageExtCode || "",
        new Date(asset.createdAt).toLocaleDateString(),
      ]),
    ];

    // 5. Create/Update PC/Laptop Configurations Sheet
    const pcLaptopData = [
      [
        "PC/Laptop ID",
        "Mouse",
        "Keyboard",
        "Motherboard",
        "Camera",
        "Headphone",
        "Power Supply",
        "Storage",
        "RAM Slot 1",
        "RAM Slot 2",
        "Created Date",
      ],
      ...masterData.pcLaptopAssets.map((pc) => [
        pc.id,
        pc.mouseId ? findAssetDetails(masterData.systemAssets, pc.mouseId) : "",
        pc.keyboardId
          ? findAssetDetails(masterData.systemAssets, pc.keyboardId)
          : "",
        pc.motherboardId
          ? findAssetDetails(masterData.systemAssets, pc.motherboardId)
          : "",
        pc.cameraId
          ? findAssetDetails(masterData.systemAssets, pc.cameraId)
          : "",
        pc.headphoneId
          ? findAssetDetails(masterData.systemAssets, pc.headphoneId)
          : "",
        pc.powerSupplyId
          ? findAssetDetails(masterData.systemAssets, pc.powerSupplyId)
          : "",
        pc.storageId
          ? findAssetDetails(masterData.systemAssets, pc.storageId)
          : "",
        pc.ramId ? findAssetDetails(masterData.systemAssets, pc.ramId) : "",
        pc.ramId2 ? findAssetDetails(masterData.systemAssets, pc.ramId2) : "",
        new Date(pc.createdAt).toLocaleDateString(),
      ]),
    ];

    // 6. Create/Update IT Accounts Sheet
    const itAccountsData = [
      [
        "Employee Name",
        "Employee ID",
        "System ID",
        "Table No.",
        "Department",
        "Email Accounts",
        "Vitel/Vonage Provider",
        "Vitel/Vonage ID",
        "LM Player ID",
        "LM Player License",
        "Created Date",
      ],
      ...masterData.itAccounts.map((account) => [
        account.employeeName,
        account.employeeId,
        account.systemId,
        account.tableNumber,
        account.department,
        account.emails
          .map((email) => `${email.provider}: ${email.email}`)
          .join("; "),
        account.vitelGlobal.provider,
        account.vitelGlobal.id,
        account.lmPlayer.id,
        account.lmPlayer.license,
        new Date(account.createdAt).toLocaleDateString(),
      ]),
    ];

    // 7. Create/Update Salary Records Sheet
    const salaryData = [
      [
        "Employee Name",
        "Employee ID",
        "Month/Year",
        "Total Working Days",
        "Actual Working Days",
        "Basic Salary",
        "Bonus",
        "Deductions",
        "Total Salary",
        "Payment Date",
        "Notes",
        "Created Date",
      ],
      ...masterData.salaryRecords.map((salary) => [
        findEmployeeName(masterData.employees, salary.employeeId),
        salary.employeeId,
        `${salary.month} ${salary.year}`,
        salary.totalWorkingDays.toString(),
        salary.actualWorkingDays.toString(),
        salary.basicSalary.toString(),
        (salary.bonus || 0).toString(),
        (salary.deductions || 0).toString(),
        salary.totalSalary.toString(),
        salary.paymentDate || "",
        salary.notes || "",
        new Date(salary.createdAt).toLocaleDateString(),
      ]),
    ];

    // 8. Create/Update Leave Requests Sheet
    const leaveRequestsData = [
      [
        "Employee Name",
        "Leave Type",
        "Start Date",
        "End Date",
        "Status",
        "Reason",
      ],
      ...masterData.leaveRequests.map((leave) => [
        leave.employeeName,
        leave.leaveType,
        new Date(leave.startDate).toLocaleDateString(),
        new Date(leave.endDate).toLocaleDateString(),
        leave.status,
        leave.reason,
      ]),
    ];

    // 9. Create/Update Pending IT Notifications Sheet
    const pendingNotificationsData = [
      [
        "Employee Name",
        "Employee ID",
        "Department",
        "Table No.",
        "Email",
        "Status",
        "Created Date",
      ],
      ...masterData.pendingITNotifications.map((notification) => [
        notification.employeeName,
        notification.employeeId,
        notification.department,
        notification.tableNumber,
        notification.email,
        notification.processed ? "Processed" : "Pending",
        new Date(notification.createdAt).toLocaleDateString(),
      ]),
    ];

    // 10. Create/Update Attendance Records Sheet
    const attendanceData = [
      [
        "Employee ID",
        "Employee Name",
        "Date",
        "Present",
        "Check In",
        "Check Out",
        "Notes",
      ],
      ...masterData.attendanceRecords.map((record) => [
        record.employeeId,
        findEmployeeName(masterData.employees, record.employeeId),
        record.date,
        record.present ? "Yes" : "No",
        record.checkIn || "",
        record.checkOut || "",
        record.notes || "",
      ]),
    ];

    // Prepare batch update requests
    const requests = [
      {
        range: "Employees!A:V",
        values: employeesData,
      },
      {
        range: "Admin_Users!A:D",
        values: adminUsersData,
      },
      {
        range: "Departments!A:D",
        values: departmentsData,
      },
      {
        range: "System_Assets!A:O",
        values: systemAssetsData,
      },
      {
        range: "PC_Laptop_Configs!A:K",
        values: pcLaptopData,
      },
      {
        range: "IT_Accounts!A:K",
        values: itAccountsData,
      },
      {
        range: "Salary_Records!A:L",
        values: salaryData,
      },
      {
        range: "Leave_Requests!A:F",
        values: leaveRequestsData,
      },
      {
        range: "IT_Notifications!A:G",
        values: pendingNotificationsData,
      },
      {
        range: "Attendance_Records!A:G",
        values: attendanceData,
      },
    ];

    // Create summary sheet
    const summaryData = [
      ["Data Type", "Count", "Last Updated"],
      [
        "Total Employees",
        masterData.employees.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "Admin Users",
        masterData.adminUsers.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "Departments",
        masterData.departments.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "System Assets",
        masterData.systemAssets.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "PC/Laptop Configurations",
        masterData.pcLaptopAssets.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "IT Accounts",
        masterData.itAccounts.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "Salary Records",
        masterData.salaryRecords.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "Leave Requests",
        masterData.leaveRequests.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "IT Notifications",
        masterData.pendingITNotifications.length.toString(),
        new Date().toLocaleString(),
      ],
      [
        "Attendance Records",
        masterData.attendanceRecords.length.toString(),
        new Date().toLocaleString(),
      ],
    ];

    requests.push({
      range: "Summary!A:C",
      values: summaryData,
    });

    // Execute batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: requests,
      },
    });

    res.json({
      success: true,
      message: "Master data successfully synced to Google Sheets",
      sheetsUpdated: requests.length,
      recordCounts: {
        employees: masterData.employees.length,
        adminUsers: masterData.adminUsers.length,
        departments: masterData.departments.length,
        systemAssets: masterData.systemAssets.length,
        pcLaptopConfigs: masterData.pcLaptopAssets.length,
        itAccounts: masterData.itAccounts.length,
        salaryRecords: masterData.salaryRecords.length,
        leaveRequests: masterData.leaveRequests.length,
        itNotifications: masterData.pendingITNotifications.length,
        attendanceRecords: masterData.attendanceRecords.length,
      },
    });
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync data to Google Sheets",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get spreadsheet info
export const getSpreadsheetInfo: RequestHandler = async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        error: "GOOGLE_SHEET_ID environment variable not set",
      });
    }

    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    res.json({
      success: true,
      title: response.data.properties?.title,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sheets: response.data.sheets?.map((sheet) => ({
        title: sheet.properties?.title,
        sheetId: sheet.properties?.sheetId,
      })),
    });
  } catch (error) {
    console.error("Error getting spreadsheet info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get spreadsheet info",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
