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
