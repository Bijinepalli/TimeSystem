export class DrpList {
    label: string;
    value: string;
}

export class Holidays {
    Id: number;
    HolidayName: string;
    HolidayDate: string;
    CalendarYear: number;
    InUse: number;
}

export class Companies {
    Id: number;
    CompanyName: string;
    DefaultCompany: string;
    HolidaysInUse: number;
}

export class CompanyHolidays {
    Id: number;
    HolidayName: string;
    HolidayDate: string;
    DisplayName: string;
}

export class Projects {
    Id: number;
    Key: string;
    ProjectName: string;
    Inactive: boolean;
    CompanyId: number;
    CreatedOn: string;
    CanBeDeleted: number;
    CompanyName: string;
}

export class NonBillables {
    Id: number;
    Key: string;
    ProjectName: string;
    Inactive: boolean;
    CreatedOn: string;
    CanBeDeleted: number;
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
}

export class LoginErrorMessage {
    ErrorMessage?: string;
}
export class Customers {
    Id: number;
    CustomerNumber: string;
    CustomerName: string;
    Inactive: boolean;
    used: number;
}

export class Clients {
    Id: number;
    CompanyId: number;
    CustomerId: number;
    Key: string;
    ClientName: string;
    CustomerName: string;
    BillingCycle: string;
    PONumber: string;
    Inactive: boolean;
    CreatedOn: string;
    used: number;
    CompanyName: string;
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
}

export class LeftNavMenu {
    label: string;
    icon: string;
    routeLink: string;
    items: LeftNavMenu[];
}


export class BillingCodes {
    Key: string;
    Name: string;
    LastName: string;
    FirstName: string;
    Salaried: boolean;
    Inactive: boolean;
    InactiveRel: boolean;
}
export class BillingCodesSpecial {
    value: string;
    codeStatus: string;
    relStatus: string;
}
export class EmailOptions {
    EmailType?: string;
    From?: string;
    To?: string;
    ReplyTo?: string;
    BodyParams?: string[];
    SendAdmin?: boolean;
    SendOnlyAdmin?: boolean;
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
    Id: number;
    EmployeeId: number;
    PeriodEnd: string;
    Redubmitted: boolean;
    Submitted: boolean;
    SubmitDate: string;
    Comments: string;
    SevenDay: string;
    TimeStamp: string;
    SemiMonthly: string;
    Hours: number;
    ApprovalStatus: string;
    SupervisorComments: string;
}
export class TimeSheetForEmplyoee {
    Id: number;
    EmployeeId: number;
    PeriodEnd: string;
    Redubmitted: string;
    Submitted: string;
    SubmitDate: string;
    SemiMonthly: string;
    Hours: number;
    ApprovalStatus: string;
}
export class TimePeriods {
    PresentPeriodEnd: string;
    FuturePeriodEnd: string;
    PastPeriodEnd: string;
}
export class TimeSheetBinding {
    value: number;
    label: string;
    code: string;
}
export class TimeSheetForApproval {
    Id: number;
    EmployeeId: number;
    SupervisorId: number;
    TimesheetId: number;
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
