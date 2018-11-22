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

export class AppSettings {
    Id?: number;
    DataKey?: string;
    Value?: string;
    Description?: string;
    Type?: string;
}

export class Employee {
    ID?: string;
    UserLevel?: string;
    LoginID?: string;
    FirstName?: string;
    LastName?: string;
    Password?: string;
    NickName?: string;
    EmailAddress?: string;
    Inactive?: string;
    Salaried?: string;
    SubmitsTime?: string;
    PayAvailableAlert?: string;
    IPayEligible?: string;
    Officer?: string;
    HireDate?: string;
    TimeStamp?: string;
    CompanyHolidays?: string;
    HoursPerDay?: string;
    SSMA_TimeStamp?: string;
    SecondaryEmailAddress?: string;
    PasswordUpdatedOn?: string;
    IsLocked?: string;
    NoOfAttempts?: string;
    FailureAttemptOn?: string;
    PasswordExpiresOn?: string;
    TerminationDate?: string;
    StartDate?: string;
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
