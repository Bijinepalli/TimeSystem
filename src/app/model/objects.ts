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
    PasswordExpiresOn?: string;
    TerminationDate?: string;
    StartDate?: string;
    PayRoleID: string;

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
