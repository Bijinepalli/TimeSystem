export class Holidays {
    Id: number;
    HolidayName: string;
    HolidayDate: string;
    CalendarYear: number;
    InUse: number;
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
