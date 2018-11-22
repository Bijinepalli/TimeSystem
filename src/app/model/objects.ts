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
