export class YearEndCodes {
    /// <summary>Prefix used for PTO codes. The year is appended to it.</summary>
    public PTOCode = 'NBNWPTO';

    /// <summary>Prefix used for PTO descriptions. The year is appended to it.</summary>
    public PTOName = 'Paid Time Off ';

    /// <summary>Prefix used for Bench codes. The year is appended to it.</summary>
    public BenchCode = 'NBNWBENCH';

    /// <summary>Prefix used for Bench descriptions. The year is appended to it.</summary>
    public BenchName = 'BENCH - ';

    /// <summary>Prefix used for Holiday codes The year is appended to it.</summary>
    public HolidayCode = 'NBNWHOLIDAY';

    /// <summary>Prefix used for Holiday descriptions. The year is appended to it.</summary>
    public HolidayName = 'Holiday ';
}

export class BillingCode {
    /// <summary>Value for time and material billable items.</summary>
    public Client = 'TANDM';

    /// <summary>Value for project billable items.</summary>
    public Project = 'PROJBILL';

    /// <summary>Value for non-billable items.</summary>
    public NonBillable = 'NONBILL';
}

export class DateFormats {
    public DisplayDateFormat = 'MM-dd-yyyy';
    public DisplayMonthDayFormat = 'MM-dd';
    public DisplayTimeStampFormat = 'MM-dd-yyyy hh:mm:ss tt';
}

