export class DrpList {
    label?: string;
    value?: string;
}

export class DictionaryType {
    Key?: string;
    Value?: string;
}

export class Holidays {
    Id?: number;
    HolidayName?: string;
    HolidayDate?: string;
    CalendarYear?: number;
    InUse?: number;
    CompanyName?: string;
    HolidayDateSearch?: string;
}

export class Companies {
    Id?: number;
    CompanyName?: string;
    DefaultCompany?: boolean;
    HolidaysInUse?: number;
}

export class CompanyHolidays {
    Id?: number;
    HolidayName?: string;
    HolidayDate?: string;
    DisplayName?: string;
    CompanyId?: number;
    HolidayDateSearch?: string;
}

export class Projects {
    Id?: number;
    Key?: string;
    ProjectName?: string;
    Inactive?: boolean;
    CompanyId?: number;
    CreatedOn?: string;
    CanBeDeleted?: number;
    CompanyName?: string;
    ChargeType?: string;
    CreatedOnSearch?: string;
}

export class NonBillables {
    Id?: number;
    Key?: string;
    ProjectName?: string;
    Inactive?: boolean;
    CreatedOn?: string;
    CanBeDeleted?: number;
    Group1?: string;
    Group2?: string;
    LastName?: string;
    FirstName?: string;
    CalendarDate?: string;
    Hours?: string;
    ID1?: number;
    ID2?: number;
    ChargeType?: string;
    CreatedOnSearch?: string;
}

export class AppSettings {
    Id?: number;
    DataKey?: string;
    Value?: string;
    Description?: string;
    Type?: string;
}

export class Employee {
    ID?: number;
    UserLevel?: string;
    LoginID?: string;
    FirstName?: string;
    LastName?: string;
    Password?: string;
    NickName?: string;
    EmailAddress?: string;
    Inactive?: boolean;
    Salaried?: boolean;
    SubmitsTime?: boolean;
    PayAvailableAlert?: boolean;
    IPayEligible?: boolean;
    Officer?: boolean;
    HireDate?: string;
    TimeStamp?: string;
    CompanyHolidays?: boolean;
    HoursPerDay?: string;
    SSMA_TimeStamp?: string;
    SecondaryEmailAddress?: string;
    PasswordUpdatedOn?: string;
    IsLocked?: boolean;
    NoOfAttempts?: number;
    FailureAttemptOn?: string;
    TerminationDate?: string;
    StartDate?: string;
    PayRoleID?: string;
    IsSupervisor?: boolean;
    IsTimesheetVerficationNeeded?: boolean;
    SupervisorId?: number;
    Supervisor?: string;
    SupervisorEmail?: string;
    LastUpdatedDays?: number;
    CreatedBy?: number;
    DecryptedPassword?: string;
    NonBillableID?: string;
    BenchID?: string;
    HolidayID?: string;
    Name?: string;
    Department?: string;
    PasswordExpiresOn?: string;
    PasswordExpiresOnSearch?: string;
    HireDateSearch?: string;
}

export class LoginErrorMessage {
    ErrorMessage?: string;
    ReturnVal?: string;
    Exception?: any;
    ExceptionDetails?: ExceptionDetails;
    ErrorType?: string;
}
export class Customers {
    Id?: number;
    CustomerNumber?: string;
    CustomerName?: string;
    Inactive?: boolean;
    InUse?: boolean;
    LeadBAId?: number;
    LeadBAName?: string;
}

export class Clients {
    Id?: number;
    Key?: string;
    ClientName?: string;
    CompanyId?: number;
    CompanyName?: string;
    CustomerId?: number;
    CustomerName?: string;
    SOWID?: number;
    SOWName?: string;
    BillingCycle?: string;
    PONumber?: string;
    Inactive?: boolean;
    CreatedOn?: String;
    InUse?: boolean;
    ChargeType?: string;
    EffectiveDate?: string;
    Rate?: string;
    EmployeeID?: number;
    RateID?: number;
    CreatedOnSearch?: string;
    EffectiveDateSearch?: string;
}

export class Rates {
    ID?: number;
    EmployeeID?: number;
    ClientID?: number;
    CustomerID?: number;
    ClientName?: string;
    CustomerName?: string;
    Rate?: string;
    EffectiveDate?: string;
    EffectiveDateSearch?: string;
    Inactive?: boolean;
}

export class MasterPages {
    ID?: number;
    ModuleName?: string;
    PageName?: string;
    Controller?: string;
    HasView?: number;
    HasEdit?: number;
    Role?: string;
    PageId?: number;
    Sections?: MasterPages[];
}

export class LeftNavMenu {
    label?: string;
    icon?: string;
    routerLink?: string;
    queryParams?: {
        [k: string]: string;
    };
    items?: LeftNavMenu[];
    // skipLocationChange?: boolean;
    command?: (event?: any) => void;
}


export class BillingCodes {
    Key?: string;
    Name?: string;
    LastName?: string;
    FirstName?: string;
    Salaried?: boolean;
    Inactive?: boolean;
    InactiveRel?: boolean;
    ID?: number;
    Hours?: string;
    PeriodEnd?: string;
    WeekEnd?: string;
    BillingName?: string;
    ChargeType?: string;
    ChargeSort?: number;
    TANDM?: string;
    Project?: string;
    NonBill?: string;
    CalendarDate?: string;
    color?: string;
    weight?: string;
    RowCount?: number;
    PeriodEndSearch?: string;
    WeekEndSearch?: string;
    CalendarDateSearch?: string;
    Department?: string;
    Rate?: string;
    Amount?: string;
}
export class BillingCodesSpecial {
    value?: string;
    codeStatus?: string;
    relStatus?: string;
    periodEnd?: boolean;
    startDate?: string;
    endDate?: string;
    sortOrder?: string;
    billingCycle?: string;
    includeTotals?: number;
    includePeriodEnd?: number;
    department?: string;
    timesheetStatus?: string;
}
// export class Invoice {
//     LastName?: string;
//     FirstName?: string;
//     EmployeeID?: number;
//     ClientName?: string;
//     ClientID?: number;
//     Rate?: string;
//     EffectiveDate?: string;
// }
export class EmailOptions {
    EmailType?: string;
    From?: string;
    CC?: string;
    BCC?: string;
    DisplayName?: string;
    To?: string;
    ReplyTo?: string;
    BodyParams?: string[];
    Attachments?: any;
    SendAdmin?: boolean;
    SendOnlyAdmin?: boolean;
}

export class SendEmail {
    EmailOptions?: EmailOptions;
    EmailContent?: Email;
}

export class ForgotPasswordHistory {
    Id?: number;
    EmployeeID?: number;
    UniqueCode?: string;
    EmailAddress?: string;
    LinkExpiryMin?: number;
}
export class EmployeePasswordHistory {
    Id?: number;
    EmployeeID?: number;
    Password?: string;
    CheckLength?: number;
}
export class TimeSheet {
    Id?: number;
    EmployeeId?: number;
    PeriodEnd?: string;
    Resubmitted?: boolean;
    Submitted?: boolean;
    SubmitDate?: string;
    Comments?: string;
    SevenDay?: string;
    TimeStamp?: string;
    SemiMonthly?: string;
    Hours?: number;
    ApprovalStatus?: string;
    SupervisorComments?: string;
    PeriodEndDate?: string;
    LastName?: string;
    FirstName?: string;
    ClientID?: number;
    EffectiveDate?: string;
    Status?: string;
    EmailAddress?: string;
    TimesheetID?: string;
    Salaried?: string;
    EmployeeName?: string;
    Worked?: string;
    HolidayHours?: string;
    PTOHours?: string;
    IPayHours?: string;
    HoursPaid?: string;
    NonBillableHours?: string;
    TotalHours?: string;
    HasOutstandingTimesheets?: string;
    Mode?: string;
    RowNumber?: string;
    PeriodEndSearch?: string;
}
export class TimeLine {
    Id?: number;
    TimeSheetId?: number;
    ChargeId?: number;
    ChargeType?: string;
}
export class TimeCell {
    Id?: number;
    TimeLineId?: number;
    CalendarDate?: string;
    Hours?: number;
}

export class TimeSheetSubmit {
    timeSheet?: TimeSheet;
    timeLineAndTimeCellArr?: TimeLineAndTimeCell[];
}

export class TimeLineAndTimeCell {
    timeLine?: TimeLine;
    timeCell?: TimeCell[];
}

export class TimeSheetForEmplyoee {
    Id?: number;
    EmployeeId?: number;
    PeriodEnd?: string;
    Resubmitted?: string;
    Submitted?: string;
    SubmitDate?: string;
    SemiMonthly?: string;
    Hours?: string;
    ApprovalStatus?: string;
    PeriodEndSearch?: string;
    SubmitDateSearch?: string;
}
export class TimePeriods {
    PresentPeriodEnd: string;
    FuturePeriodEnd: string;
    PastPeriodEnd: string;
    RowNumber: number;
}
export class TimeSheetBinding {
    value?: number;
    label?: string;
    code?: string;
}
export class TimeSheetForApproval {
    Id?: number;
    EmployeeId?: number;
    SupervisorId?: number;
    TimesheetId?: number;
    PeriodEnd: string;
    EmployeeName: string;
    Status: string;
    Comments: string;
    CreatedOn: string;
    CreatedBy: string;
    UpdatedOn: string;
    UpdatedBy: string;
}


export class Email {
    ID?: number;
    EmailTypeId?: number;
    EmailType?: string;
    Subject?: string;
    Body?: string;
    Signature?: string;
    HighPriority?: boolean;
    SubjectIsTemplate?: boolean;
    BodyIsTemplate?: boolean;
    AddSignature?: boolean;
}

export class BillingCodesPendingTimesheet {
    EmployeeID?: number;
    ChargeID?: string;
    ChargeType?: string;
    AssignType?: string;
}

export class AssignForEmployee {
    UpdateItems?: BillingCodesPendingTimesheet;
    AddItems?: BillingCodesPendingTimesheet[];
}
export class Invoice {
    Id?: number;
    InvoiceDate?: string;
    DivisionNumber?: number;
    CustomerNumber?: string;
    ProductCode?: string;
    Hours?: string;
    Rate?: string;
    Amount?: string;
    StartDate?: string;
    EndDate?: string;
    ClientName?: string;
    PONumber?: string;
    Inactive?: boolean;
    EffectiveDate?: string;
    ClientID?: string;
    InvoiceDateSearch?: string;
    StartDateSearch?: string;
    EndDateSearch?: string;
    EffectiveDateSearch?: string;
}

export class MonthlyHours {
    EmployeeNumber: string;
    EmployeeName: string;
    Day1: string;
    Day2: string;
    Day3: string;
    Day4: string;
    Day5: string;
    Day6: string;
    Day7: string;
    Day8: string;
    Day9: string;
    Day10: string;
    Day11: string;
    Day12: string;
    Day13: string;
    Day14: string;
    Day15: string;
    Day16: string;
    Day17: string;
    Day18: string;
    Day19: string;
    Day20: string;
    Day21: string;
    Day22: string;
    Day23: string;
    Day24: string;
    Day25: string;
    Day26: string;
    Day27: string;
    Day28: string;
    Day29: string;
    Day30: string;
    Day31: string;
}

export class Departments {
    Id?: number;
    Name?: string;
    Description?: string;
    Status?: number;
    EmployeesCount?: number;
    EmployeeId?: number;
}

export class EmployeeUtilityDetails {
    WeekNum?: number;
    Year?: number;
    Startdate?: string;
    Enddate?: string;
    Name?: string;
    Weekday?: string;
    Holiday?: string;
    PTO?: string;
    Billable?: string;
    Utilization?: string;
}

export class EmployeeUtilityReport {
    WeekNumDetails?: EmployeeUtilityDetails[];
    EmployeeLevelDetails?: EmployeeUtilityDetails[];
    TeamLevelDetails?: EmployeeUtilityDetails[];
}

export class NonBillablesTotalHours {
    Id?: number;
    ReportGroup?: string;
    EmployeeName?: string;
    Hours?: string;
    Jan?: string;
    Feb?: string;
    Mar?: string;
    Apr?: string;
    May?: string;
    Jun?: string;
    Jul?: string;
    Aug?: string;
    Sep?: string;
    Oct?: string;
    Nov?: string;
    Dec?: string;
    Total?: string;
    RowCount?: string;
}
export class HoursByTimesheet {
    ChangeSort?: number;
    ChangeType?: string;
    BillingName?: string;
    Key?: string;
    TANDM?: string;
    Project?: string;
    NonBillable?: string;
}
export class PayStub {
    FileName?: string;
    Date?: string;
    EmployeeName?: string;
}


export class SOW {
    SOWID?: number;
    CustomerID?: number;
    CustomerName?: string;
    LeadBAName?: string;
    SOWName?: string;
    SOWNumber?: string;
    EffectiveDate?: string;
    ExpirationDate?: string;
    EffectiveDateSearch?: string;
    ExpirationDateSearch?: string;
    CurrencyType?: string;
    TotalContractValue?: string;
    InvoiceFrequency?: string;
    Originate?: string;
    OpportunityType?: string;
    Status?: string;
    SOWType?: string;
    Notes?: string;
    SOWFileName?: string;
    Hours?: string;
}

export class FileSystem {
    FileName?: string;
    CreatedOn?: string;
}
export class DateArray {
    NoOfDays?: number;
    Dates?: string[];
}


export class ExceptionDetails {
    ErrorMessage?: string;
    StackTrace?: string;
    MethodName?: string;
    Source?: string;
    ExceptionType?: string;
    InnerMessage?: string;
    InnerStackTrace?: string;
    InnerMethodName?: string;
    InnerSource?: string;
    InnerExceptionType?: string;
    NavigateUrl?: string;
}

export class PeriodEndWithKeys {
    PeriodEnd?: string;
    Keys?: string[];
    EmailAddress?: string;
}


export class SOWDetails {
    Month?: number;
    Year?: number;
    Day?: number;
    ClientID?: number;
    EmployeeID?: number;
    ClientName?: string;
    EmployeeName?: string;
    Hours?: string;
}

export class SOWAnalysis {
    SOWID?: number;
    CustomerID?: number;
    CustomerName?: string;
    LeadBAName?: string;
    SOWName?: string;
    SOWNumber?: string;
    EffectiveDate?: string;
    ExpirationDate?: string;
    EffectiveDateSearch?: string;
    ExpirationDateSearch?: string;
    CurrencyType?: string;
    TotalContractValue?: string;
    Hours?: string;
    UtilizedHours?: string;
    RemainingHours?: string;
    UtilizationPercent?: string;
    TimeTaken?: string;
    TimeRemaining?: string;
    ExpectedDays?: string;
    Probability?: string;
}



export class SOWUtilizationReport {
    lstSOW?: SOW[];
    lstMonths?: SOWDetails[];
    lstClients?: SOWDetails[];
    lstEmployees?: SOWDetails[];
    lstDetails?: SOWDetails[];
    lstSOWAnalysis?: SOWAnalysis[];
}
export class SOWMonthlyUtilizationReport {
    lstClients?: SOWDetails[];
    lstEmployees?: SOWDetails[];
    lstDetails?: SOWDetails[];
    monthlyHours?: SOWMonthlyHours[];
}
export class SOWMonthlyHours {
    EmployeeName: string;
    ClientName: string;
    Day1: string;
    Day2: string;
    Day3: string;
    Day4: string;
    Day5: string;
    Day6: string;
    Day7: string;
    Day8: string;
    Day9: string;
    Day10: string;
    Day11: string;
    Day12: string;
    Day13: string;
    Day14: string;
    Day15: string;
    Day16: string;
    Day17: string;
    Day18: string;
    Day19: string;
    Day20: string;
    Day21: string;
    Day22: string;
    Day23: string;
    Day24: string;
    Day25: string;
    Day26: string;
    Day27: string;
    Day28: string;
    Day29: string;
    Day30: string;
    Day31: string;
}

export enum PageNames {
    Login = 'Login',
    Logout = 'Logout',
    Dashboard = 'Dashboard',
    Timesheets = 'Timesheets',
    ForgotPassword = 'Forgot Password',
    AccessDenied = 'Access Denied',
    ReportsDashboard = 'Reports Dashboard',
    Holidays = 'Admin/Holidays',
    Companies = 'Admin/Companies',
    Projects = 'Admin/Projects',
    Customers = 'Admin/Customers',
    BillingCodes = 'Admin/Billing Codes',
    NonBillables = 'Admin/Non-Billables',
    Configuration = 'Admin/Configuration',
    Employees = 'Admin/Employees',
    RollBillingCodes = 'Admin/Roll Billing Codes',
    SOW = 'Admin/SOW',
    Emails = 'Admin/Emails',
    Departments = 'Admin/Departments',
    RevenueReport = 'Billing Code Related/Revenue Report',
    ListBillingCodes = 'Billing Code Related/List Billing Codes',
    EmployeeHoursbyBillingCode = 'Billing Code Related/Employee Hours by Billing Code',
    EmployeeHoursbyBillingCodewithRate = 'Billing Code Related/Employee Hours by Billing Code with Rate',
    EmployeesbyBillingCode = 'Billing Code Related/Employees by Billing Code',
    HoursbyEmployee = 'Billing Code Related/Hours by Employee',
    WeeklyHoursbyEmployee = 'Billing Code Related/Weekly Hours by Employee',
    UnusedBillingCodes = 'Billing Code Related/Unused Billing Codes',
    BillingCode_Holidays = 'Billing Code Related/Holidays',
    NonBillableHoursAcrossMonths = 'Billing Code Related/Non-Billable Hours Across Months',
    BillableHoursbyBillingCodesorProject = 'Billing Code Related/Billable Hours by Billing Codes or Project',
    EmployeeTimesheets = 'Timesheet Related/Employee Timesheets',
    HoursbyTimesheetCategory = 'Timesheet Related/Hours by Timesheet Category',
    PeriodEndHours = 'Timesheet Related/Period End Hours',
    OutstandingTimesheets = 'Timesheet Related/Outstanding Timesheets',
    EmployeeUtilizationReport = 'Timesheet Related/Employee Utilization Report',
    BillingCodeTimesheets = 'Timesheet Related/Billing Code Timesheets',
    SOWUtilizationReport = 'Timesheet Related/SOW Utilization Report',
    Payroll = 'Timesheet Related/Payroll',
    ListEmployees = 'Employee Related/List Employees',
    EmployeeHours = 'Employee Related/Employee Hours',
    EmployeeLoginData = 'Employee Related/Employee Login Data',
    InvoiceDatabyCustomer = 'Invoice Related/Invoice Data by Customer',
    EmployeeBillingCodeRates = 'Invoice Related/Employee - Billing Code Rates'
}

export class ActivityLog {
    ID?: number;
    UserID?: number;
    UserName?: string;
    PageName?: string;
    PageParams?: string;
    SectionName?: string;
    SectionParams?: string;
    ActionName?: string;
    ActionParams?: string;
    Message?: string;
    Mode?: string;
    TimeStamp?: string;
    SessionID?: string;
}
export class Utilization {
    EmployeeID?: string;
    DepartmentID?: string;
    FromDate?: string;
    ToDate?: string;
    WorkingHours?: string;
    Status?: string;
    Frequency?: string;
}

