import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {
  // tslint:disable-next-line:max-line-length
  Holidays, Companies, CompanyHolidays, Projects, AppSettings, Employee, LoginErrorMessage, Customers,
  Clients, NonBillables, MasterPages, LeftNavMenu, BillingCodes, BillingCodesSpecial, EmailOptions,
  ForgotPasswordHistory, EmployeePasswordHistory, AssignForEmployee, Invoice, TimeSheet, TimeSheetForEmplyoee,
  TimePeriods, TimeSheetBinding, TimeSheetForApproval, Email, NonBillablesTotalHours, HoursByTimesheet,
  BillingCodesPendingTimesheet, TimeLine, TimeCell, TimeLineAndTimeCell, TimeSheetSubmit, MonthlyHours, Departments, EmployeeUtilityReport,
  SendEmail,
  DrpList,
  DictionaryType
} from '../model/objects';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommaExpr } from '@angular/compiler';
import { SelectItem } from 'primeng/api';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class TimesystemService {

  private accessSystemURL = environment.accessSystemURL;
  private helpipaddress = environment.helpipaddress;
  private url = environment.url;

  constructor(private http: HttpClient) { }

  getHolidays(year: string, code: string) {
    const params = new HttpParams()
      .set('year', year)
      .set('code', code);
    return this.http.get<Holidays[]>(this.url + 'GetHolidays', { params });
  }

  getCompanies() {
    return this.http.get<Companies[]>(this.url + 'GetCompanies');
  }

  getCompaniesWithUseHours(billingCode: string, holidayCode: string) {
    const params = new HttpParams()
      .set('BillingCode', billingCode)
      .set('HolidayCode', holidayCode);
    return this.http.get<Companies[]>(this.url + 'GetCompaniesHolidayHours', { params });
  }

  getCompanyHolidays(year: string, companyId: string) {
    const params = new HttpParams()
      .set('year', year)
      .set('companyId', companyId);
    const data1 = this.http.get<CompanyHolidays[]>(this.url + 'GetCompaniesAssignedHoliday', { params });
    const data2 = this.http.get<CompanyHolidays[]>(this.url + 'GetCompaniesNotAssignedHoliday', { params });
    return forkJoin([data1, data2]);
  }

  getProjects(code: string) {
    const params = new HttpParams()
      .set('code', code);
    const data1 = this.http.get<Projects[]>(this.url + 'GetProjects');
    const data2 = this.http.get<Projects[]>(this.url + 'GetBillingProjects', { params });
    return forkJoin([data1, data2]);
  }

  getNonBillables(code: string) {
    const params = new HttpParams()
      .set('code', code);
    const data1 = this.http.get<NonBillables[]>(this.url + 'GetNonBillables');
    const data2 = this.http.get<NonBillables[]>(this.url + 'GetBillingProjects', { params });
    return forkJoin([data1, data2]);
  }



  getHelp(filename: string): Observable<any> {
    return this.http.get(this.helpipaddress + filename, { responseType: 'text' }).pipe(
      map(res => res.toString()));
  }


  getAppSettings(): any {
    const params = new HttpParams();
    return this.http.get<AppSettings[]>(this.url + 'GetAppSettings', { params });
  }

  getEmployee(EmployeeID: string, LoginID: string, Password: string): any {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID !== '' ? EmployeeID : '0')
      .set('LoginID', LoginID)
      .set('Password', Password);
    return this.http.get<Employee[]>(this.url + 'GetEmployee', { params });
  }

  EmployeeValidateByLoginID(LoginID: string): any {
    const params = new HttpParams()
      .set('LoginID', LoginID);
    return this.http.get<LoginErrorMessage[]>(this.url + 'EmployeeValidateByLoginID', { params });
  }

  EmployeeValidateByCredentials(AttemptsLimit: string, LoginID: string, Password: string): any {
    const params = new HttpParams()
      .set('LoginID', LoginID)
      .set('Password', Password)
      .set('AttemptsLimit', AttemptsLimit);
    return this.http.get<LoginErrorMessage[]>(this.url + 'EmployeeValidateByCredentials', { params });
  }
  getCustomers() {
    return this.http.get<Customers[]>(this.url + 'GetCustomers');
  }
  getClients() {
    return this.http.get<Clients[]>(this.url + 'GetClients');
  }
  getUsedBillingCodes(code: string) {
    const params = new HttpParams()
      .set('code', code);
    return this.http.get<Clients[]>(this.url + 'GetBillingProjects', { params });
  }
  getAllEmployee(InActive: string, Salaried: string) {
    const params = new HttpParams()
      .set('InActive', InActive.toString())
      .set('Salaried', Salaried.toString());
    return this.http.get<Employee[]>(this.url + 'ListAllEmployee', { params });
  }

  getNonBillablesAssignToEmployee(EmployeeID: number) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString());
    return this.http.get<NonBillables[]>(this.url + 'ListNonBillablesAssignedToEmployee', { params });
  }
  getNonBillablesNotAssignToEmployee(EmployeeID: number) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString());
    return this.http.get<NonBillables[]>(this.url + 'ListNonBillablesNotAssignedToEmployee', { params });
  }

  getProjectsAssignToEmployee(EmployeeID: number) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString());
    return this.http.get<Projects[]>(this.url + 'ListProjectsAssignedToEmployee', { params });
  }
  getProjectsNotAssignToEmployee(EmployeeID: number) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString());
    return this.http.get<Projects[]>(this.url + 'ListProjectsNotAssignedToEmployee', { params });
  }

  getClientsAssignToEmployee(EmployeeID: number) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString());
    return this.http.get<Clients[]>(this.url + 'ListClientsAssignedToEmployee', { params });
  }
  getClientsNotAssignToEmployee(EmployeeID: number) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString());
    return this.http.get<Clients[]>(this.url + 'ListClientsNotAssignedToEmployee', { params });
  }
  getMasterPages() {
    return this.http.get<MasterPages[]>(this.url + 'ListMasterPages');
  }

  getPagesbyRoles(Role: string, PageId: string) {
    const params = new HttpParams()
      .set('Role', Role)
      .set('PageId', PageId);
    return this.http.get<MasterPages[]>(this.url + 'GetPagesByRole', { params });
  }

  InsertAccessRights(_attr: MasterPages[]): Observable<MasterPages[]> {
    const body = JSON.stringify(_attr);
    return this.http.post<MasterPages[]>(this.url + 'InsertAccessRights', body, httpOptions);
  }
  updateAppSettings(_appsettingsselection: AppSettings[]) {
    const body = JSON.stringify(_appsettingsselection);
    return this.http.post<AppSettings[]>(this.url + 'InsertAppSettings', body, httpOptions);
  }
  getLeftNavMenu(Role: string, PageId: string) {
    const params = new HttpParams()
      .set('Role', Role)
      .set('PageId', PageId);
    return this.http.get<LeftNavMenu[]>(this.url + 'GetLeftNavMenu', { params });
  }
  listAllClientItems(inactive: string) {
    const params = new HttpParams()
      .set('Inactive', inactive);
    return this.http.get<Clients[]>(this.url + 'ListAllClientItems', { params });
  }
  listAllProjectData(inactive: string) {
    const params = new HttpParams()
      .set('Inactive', inactive);
    return this.http.get<Projects[]>(this.url + 'ListAllProjectData', { params });
  }
  listAllBillingItems(inactive: string) {
    const params = new HttpParams()
      .set('Inactive', inactive);
    return this.http.get<NonBillables[]>(this.url + 'ListBillingItems', { params });
  }
  getEmployeesForReport(Inactive: string, IPayEligible: string,
    Salaried: string, SubmitsTime: string, _CompanyHolidays: string, StartDate: string, EndDate: string): any {
    const params = new HttpParams()
      .set('Inactive', Inactive)
      .set('IPayEligible', IPayEligible)
      .set('Salaried', Salaried)
      .set('SubmitsTime', SubmitsTime)
      .set('CompanyHolidays', _CompanyHolidays)
      .set('StartDate', StartDate)
      .set('EndDate', EndDate);
    return this.http.get<Employee[]>(this.url + 'GetEmployeesForReport', { params });
  }

  listAllClientItemsForBillingCodes(keys: SelectItem[], codeStatus: string, relStatus: string) {
    const params = new HttpParams()
      .set('keys', keys.join())
      .set('codeStatus', codeStatus)
      .set('relStatus', relStatus);
    return this.http.get<BillingCodes[]>(this.url + 'ListAllClientItemsForBillingCodes', { params });
  }
  listAllProjectDataForBillingCodes(keys: string, codeStatus: string, relStatus: string) {
    const params = new HttpParams()
      .set('keys', keys)
      .set('codeStatus', codeStatus)
      .set('relStatus', relStatus);
    return this.http.get<BillingCodes[]>(this.url + 'ListAllProjectsDataForBillingCodes', { params });
  }
  listAllBillingItemsForBillingCodes(keys: string, codeStatus: string, relStatus: string) {
    const params = new HttpParams()
      .set('keys', keys)
      .set('codeStatus', codeStatus)
      .set('relStatus', relStatus);
    return this.http.get<BillingCodes[]>(this.url + 'ListAllBillingItemsForBillingCodes', { params });
  }

  listAllClientItemsForBillingCodesPost(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListAllClientItemsForBillingCodesPost', body, httpOptions);
  }
  listAllProjectDataForBillingCodesPost(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListAllProjectsDataForBillingCodesPost', body, httpOptions);
  }
  listAllBillingItemsForBillingCodesPost(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListAllBillingItemsForBillingCodesPost', body, httpOptions);
  }
  sendMail(_SendEmail: SendEmail) {
    const body = JSON.stringify(_SendEmail);
    return this.http.post<EmailOptions[]>(this.url + 'SendEmail', body, httpOptions);

  }

  InsertForgotPasswordHistory(forgotPasswordHistory: ForgotPasswordHistory) {
    const body = JSON.stringify(forgotPasswordHistory);
    return this.http.post<ForgotPasswordHistory>(this.url + 'InsertForgotPasswordHistory', body, httpOptions);
  }
  ValidateForgotPassword(forgotPasswordHistory: ForgotPasswordHistory) {
    const body = JSON.stringify(forgotPasswordHistory);
    return this.http.post<ForgotPasswordHistory[]>(this.url + 'ValidateForgotPassword', body, httpOptions);

  }
  ValidateEmployeePasswordHistory(employeePasswordHistory: EmployeePasswordHistory) {
    const body = JSON.stringify(employeePasswordHistory);
    return this.http.post<EmployeePasswordHistory[]>(this.url + 'ValidateEmployeePasswordHistory', body, httpOptions);

  }
  Employee_UpdatePassword(employee: Employee) {
    const body = JSON.stringify(employee);
    return this.http.post<Employee>(this.url + 'Employee_UpdatePassword', body, httpOptions);
  }
  getEmployeeTimeSheetList(employeeId: string, showEveryOne: string) {
    const params = new HttpParams()
      .set('EmployeeId', employeeId)
      .set('ShowEveryOne', showEveryOne);
    return this.http.get<TimeSheetForEmplyoee[]>(this.url + 'GetEmployeeTimeSheetList', { params });
  }

  getTimeSheetPeridos() {
    // return this.http.get<TimePeriods[]>(this.url + 'GetPresentPeriodEndList', { });
    const data1 = this.http.get<TimePeriods[]>(this.url + 'GetTimeSheetPeridos');
    return data1;
  }

  getTimeSheetAfterDateDetails(employeeId: string, hireDate: string) {
    const params = new HttpParams()
      .set('EmployeeId', employeeId)
      .set('HireDate', hireDate);
    return this.http.get<TimeSheetBinding[]>(this.url + 'GetTimeSheetAfterDateDetails', { params });
  }
  getTimeSheetDetails(timeSheetId: string) {
    const params = new HttpParams()
      .set('TimeSheetId', timeSheetId);
    return this.http.get<TimeSheet[]>(this.url + 'GetTimeSheetDetails', { params });
  }
  getTimeSheetForApprovalCheck(employeeId: string) {
    const params = new HttpParams()
      .set('EmployeeId', employeeId);
    return this.http.get<TimeSheetForApproval[]>(this.url + 'GetTimeSheetApprovalsCheck', { params });
  }
  getEmails(EmailType: string) {
    const params = new HttpParams()
      .set('EmailType', EmailType);
    return this.http.get<Email[]>(this.url + 'Email_Get', { params });
  }

  EmailSignature_Get() {
    const params = new HttpParams();
    return this.http.get<Email[]>(this.url + 'EmailSignature_Get', { params });
  }

  Email_InsertOrUpdate(_inputData: Email) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Email_InsertOrUpdate', body, httpOptions);
  }

  Email_Delete(_inputData: Email) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Email_Delete', body, httpOptions);
  }

  Holiday_InsertOrUpdate(_inputData: Holidays) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Holiday_InsertOrUpdate', body, httpOptions);
  }

  Holiday_Delete(_inputData: Holidays) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Holiday_Delete', body, httpOptions);
  }

  Company_InsertOrUpdate(_inputData: Companies) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Company_InsertOrUpdate', body, httpOptions);
  }

  Company_Delete(_inputData: Companies) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Company_Delete', body, httpOptions);
  }

  CompanyHolidays_DeleteAndInsert(_inputData: CompanyHolidays[]) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'CompanyHolidays_DeleteAndInsert', body, httpOptions);
  }

  Customer_InsertOrUpdate(_inputData: Customers) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Customer_InsertOrUpdate', body, httpOptions);
  }

  Customer_Delete(_inputData: Customers) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Customer_Delete', body, httpOptions);
  }

  Project_InsertOrUpdate(_inputData: Projects) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Project_InsertOrUpdate', body, httpOptions);
  }

  Project_Delete(_inputData: Projects) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Project_Delete', body, httpOptions);
  }

  NonBillable_InsertOrUpdate(_inputData: NonBillables) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'NonBillable_InsertOrUpdate', body, httpOptions);
  }

  ListClientHoursByEmployee(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListClientHoursByEmployee', body, httpOptions);
  }
  ListProjectHoursByEmployee(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListProjectHoursByEmployee', body, httpOptions);
  }
  ListNonBillableHoursByEmployee(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListNonBillableHoursByEmployee', body, httpOptions);
  }

  ListEmployeeHoursByClient(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListEmployeeHoursByClient', body, httpOptions);
  }
  ListEmployeeHoursByProject(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListEmployeeHoursByProject', body, httpOptions);
  }
  ListEmployeeHoursByNonBillable(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListEmployeeHoursByNonBillable', body, httpOptions);
  }
  ListWeekEndClientHoursByClientByEmployee(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListWeekEndClientHoursByClientByEmployee', body, httpOptions);
  }
  ListEmployeeHoursByBillingCode(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListEmployeeHoursByBillingCode', body, httpOptions);
  }

  ListEmployeeHoursByTimeSheetCategory(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListEmployeeHoursByTimeSheetCategory', body, httpOptions);
  }

  ListEmployeeHoursByBillingCodeClientOnly(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'ListEmployeeHoursByBillingCodeClientOnly', body, httpOptions);
  }
  ListEmployeeClientRates(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<Invoice[]>(this.url + 'ListEmployeeClientRates', body, httpOptions);
  }
  getDatebyPeriod() {
    return this.http.get<TimeSheet[]>(this.url + 'GeneratePeriodEndDates');
  }
  GetTimeSheetsPerEmployeePeriodStart(PeriodEnd: string) {
    const params = new HttpParams()
      .set('PeriodEnd', PeriodEnd.toString());
    return this.http.get<TimeSheet[]>(this.url + 'GetTimeSheetsPerEmployeePeriodStart', { params });
  }
  NonBillable_Delete(_inputData: NonBillables) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'NonBillable_Delete', body, httpOptions);
  }

  Client_InsertOrUpdate(_inputData: Clients) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Client_InsertOrUpdate', body, httpOptions);
  }

  Client_Delete(_inputData: Clients) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Client_Delete', body, httpOptions);
  }

  Employee_Insert(_inputData: Employee) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Employee_Insert', body, httpOptions);
  }

  Employee_Update(_inputData: Employee) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Employee_Update', body, httpOptions);
  }

  Employee_Unlock(_inputData: Employee) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Employee_Unlock', body, httpOptions);
  }

  Employee_Terminate(_inputData: Employee) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Employee_Terminate', body, httpOptions);
  }

  Employee_ResetPassword(_inputData: Employee) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Employee_ResetPassword', body, httpOptions);
  }

  PendingTimesheet_BillingCodes_Get(_inputData: BillingCodesPendingTimesheet) {
    const body = JSON.stringify(_inputData);
    return this.http.post<BillingCodesPendingTimesheet[]>(this.url + 'PendingTimesheet_BillingCodes_Get', body, httpOptions);
  }

  AssignForEmployee(_inputData: AssignForEmployee) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'AssignForEmployee', body, httpOptions);
  }

  Supervisor_Get() {
    const params = new HttpParams();
    return this.http.get<SelectItem[]>(this.url + 'Supervisor_Get', { params });
  }
  getEmployeeRates(EmployeeID: number): any {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString() !== '0' ? EmployeeID.toString() : '0');
    return this.http.get<Invoice[]>(this.url + 'GetEmployeeRates', { params });
  }
  getEmployeeforRates(EmployeeID: number): any {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID.toString() !== '0' ? EmployeeID.toString() : '0');
    return this.http.get<Employee[]>(this.url + 'Rates_GetEmployee', { params });
  }

  listClientforRateId(RateID: number): any {
    const params = new HttpParams()
      .set('RateID', RateID.toString() !== '0' ? RateID.toString() : '0');
    return this.http.get<Clients[]>(this.url + 'ListClientForRateID', { params });
  }
  getRate(RateID: number): any {
    const params = new HttpParams()
      .set('RateID', RateID.toString() !== '0' ? RateID.toString() : '0');
    return this.http.get<Clients[]>(this.url + 'GetRate', { params });
  }
  updateRate(_inputData: Clients) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'UpdateRate', body, httpOptions);
  }
  getEmployeeClientProjectNonBillableDetails(employeeId: string, periodEnd: string, periodStart: string) {
    const params = new HttpParams()
      .set('EmployeeId', employeeId)
      .set('strEndDate', periodEnd)
      .set('strStartDate', periodStart);
    const data1 = this.http.get<TimeSheetBinding[]>(this.url + 'GetEmployeeClientProjectNonBillableDetails', { params });

    const data2 = this.http.get<NonBillables[]>(this.url + 'GetEmployeeOnlyNonBillDetails', { params });
    return forkJoin([data1, data2]);
  }

  getTimesheetTimeLineTimeCellDetails(timeSheetId: string) {
    const params = new HttpParams().set('TimeSheetId', timeSheetId);

    const data1 = this.http.get<TimeSheet[]>(this.url + 'GetTimeSheetDetailsDateChange', { params });
    const data2 = this.http.get<TimeLine[]>(this.url + 'GetTimeLineDetails', { params });
    const data3 = this.http.get<TimeCell[]>(this.url + 'GetTimeCellDetails', { params });

    return forkJoin([data1, data2, data3]);
  }
  getUnSubmittedTimeSheetDetails(employeeId: string, periodEnd: string) {
    const params = new HttpParams()
      .set('EmployeeId', employeeId)
      .set('PeriodEnd', periodEnd);
    return this.http.get<TimeSheet[]>(this.url + 'GetUnSubmittedTimeSheetDetails', { params });
  }
  timesheetCopyInsert(timeSheet: TimeSheet) {
    const body = JSON.stringify(timeSheet);
    return this.http.post<number>(this.url + 'TimesheetCopyInsert', body, httpOptions);
  }
  TimeLineAndTimeCell_DeleteAndInsert(_inputData: TimeSheetSubmit) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'TimeLineAndTimeCell_DeleteAndInsert', body, httpOptions);
  }
  getBillableHours(code: string, key: string, codeInactive: string, assignInactive: string, startDate: string, endDate: string) {
    const params = new HttpParams()
      .set('code', code)
      .set('key', key)
      .set('codeInactive', codeInactive)
      .set('assignInactive', assignInactive)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<BillingCodes[]>(this.url + 'GetBillableHours', { params });
  }

  getHolidayYears() {
    return this.http.get<Holidays[]>(this.url + 'ListHolidayYears');
  }
  getHolidayList(year: string) {
    const params = new HttpParams()
      .set('year', year);
    return this.http.get<Holidays[]>(this.url + 'GetHolidayList', { params });
  }
  getInvoiceData(invoiceDate: string, startDate: string, endDate: string, divisionid: string, productcode: string,
    selectedValue: string, formattedStart: string, formattedEnd: string) {
    const params = new HttpParams()
      .set('invoiceDate', invoiceDate)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('divisionid', divisionid)
      .set('productcode', productcode)
      .set('billingcycle', selectedValue)
      .set('formattedStart', formattedStart)
      .set('formattedEnd', formattedEnd);
    return this.http.get<Invoice[]>(this.url + 'GetInvoiceData', { params });
  }
  getNonBillableHourGroups(Id: string) {
    const params = new HttpParams()
      .set('Id', Id);
    return this.http.get<NonBillables[]>(this.url + 'GetNonBillableHourGroups', { params });
  }
  getNonBillableCodesforGroup(GroupID: number, Subgroup: number) {
    const params = new HttpParams()
      .set('GroupID', GroupID.toString())
      .set('Subgroup', Subgroup.toString());
    return this.http.get<NonBillables[]>(this.url + 'GetNonBillableCodesForReportGroup', { params });
  }

  getNonBillableHours(startdate: string, enddate: string, Id: string, totalchecked: string) {
    const params = new HttpParams()
      .set('startdate', startdate)
      .set('enddate', enddate)
      .set('id', Id)
      .set('totalchecked', totalchecked);
    return this.http.get<NonBillablesTotalHours[]>(this.url + 'GetNonBillableSoftwareHours', { params });
  }
  getUnusedBillingCodes(codetype: string, usagetype: string, datesince: string) {
    const params = new HttpParams()
      .set('codetype', codetype)
      .set('usagetype', usagetype)
      .set('datesince', datesince);
    return this.http.get<NonBillables[]>(this.url + 'GetUnusedBillingCodes', { params });
  }
  GetEmployeeHours(billingCodesSpecial: BillingCodesSpecial) {
    const body = JSON.stringify(billingCodesSpecial);
    return this.http.post<BillingCodes[]>(this.url + 'GetEmployeeHours', body, httpOptions);
  }
  getOutStandingTimesheets(empId: string, numbers: string) {
    const params = new HttpParams()
      .set('employeeId', empId)
      .set('Numbers', numbers);
    return this.http.get<TimeSheet[]>(this.url + 'GetOutStandingTimesheet', { params });

  }
  getPeriodEndDate() {
    return this.http.get<TimePeriods[]>(this.url + 'GeneratePeriodEndDatesNew');
  }
  getAccessData(month: string, year: string, employeeNumber: string) {
    const params = new HttpParams()
      .set('month', month)
      .set('year', year)
      .set('employeeno', employeeNumber);
    return this.http.get<MonthlyHours[]>(this.accessSystemURL + 'GetAccessSystemData', { params });
  }
  getPeriodEndDatesforDropdown(pastPeriods: string, futurePeriods: string, dateFormat: string) {
    const params = new HttpParams()
      .set('pastPeriods', pastPeriods)
      .set('futurePeriods', futurePeriods)
      .set('dateFormat', dateFormat);
    return this.http.get<TimePeriods[]>(this.url + 'GetPeriodEndforDropdown', { params });
  }
  getOutstandingTimesheetReport(periodEnd: string) {
    const params = new HttpParams()
      .set('periodEnd', periodEnd);
    return this.http.get<TimeSheet[]>(this.url + 'GetOutStandingTimesheetReport', { params });
  }
  timeSheetInsert(timesheet: TimeSheet) {
    const body = JSON.stringify(timesheet);
    return this.http.post<string>(this.url + 'TimeSheetInsert', body, httpOptions);
  }
  getTimeSheetForApprovalGet(employeeId: string) {
    const params = new HttpParams()
      .set('EmployeeId', employeeId);
    return this.http.get<TimeSheetForApproval[]>(this.url + 'GetTimeSheetApprovalsGet', { params });
  }
  getDepartments(Id: string) {
    const params = new HttpParams()
      .set('Id', Id.toString());
    return this.http.get<Departments[]>(this.url + 'GetDepartments', { params });
  }
  Department_InsertOrUpdate(_inputData: Departments) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Department_InsertOrUpdate', body, httpOptions);
  }
  Department_Delete(_inputData: Departments) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'Department_Delete', body, httpOptions);
  }
  departmentEmployee_Get(DepartmentID: string) {
    const params = new HttpParams()
      .set('DepartmentID', DepartmentID);
    return this.http.get<Employee[]>(this.url + 'DepartmentEmployees_Get', { params });
  }
  departmentEmployee_GetByEmployeeId(EmployeeID: string) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID);
    return this.http.get<Departments[]>(this.url + 'DepartmentEmployees_GetByEmployeeId', { params });
  }
  employeeDepartment_Insert(_inputData: Departments) {
    const body = JSON.stringify(_inputData);
    return this.http.post<LoginErrorMessage>(this.url + 'EmployeeDepartment_Insert', body, httpOptions);
  }
  getRevenueReports(startdate: string, enddate: string) {
    const params = new HttpParams()
      .set('startdate', startdate)
      .set('enddate', enddate);
    return this.http.get<BillingCodes[]>(this.url + 'GetRevenueReports', { params });
  }

  GetEmployeeUtilitizationReport(EmployeeID: string, DepartmentID: string, FromDate: string, ToDate: string, WorkingHours: string) {
    const params = new HttpParams()
      .set('EmployeeID', EmployeeID)
      .set('DepartmentID', DepartmentID)
      .set('FromDate', FromDate)
      .set('ToDate', ToDate)
      .set('WorkingHours', WorkingHours);
    return this.http.get<EmployeeUtilityReport>(this.url + 'GetEmployeeUtilitizationReport', { params });
  }
  getEmployeesBySupervisor(employeeId: string) {
    const params = new HttpParams()
      .set('employeeId', employeeId.toString());
    return this.http.get<Employee[]>(this.url + 'GetEmployeesBySupervisor', { params });
  }
  GetClientAndVertexHolidaysForTSPeriod(employeeId: string, periodEnd: string, periodStart: string) {
    const params = new HttpParams()
      .set('EmployeeId', employeeId)
      .set('endDate', periodEnd)
      .set('startDate', periodStart);
    return this.http.get<Holidays[]>(this.url + 'GetClientAndVertexHolidaysForTSPeriod', { params });
  }
  timesheetDelete(_timesheetId: TimeSheet) {
    const body = JSON.stringify(_timesheetId);
    return this.http.post<TimeSheet>(this.url + 'TimeSheetDelete', body, httpOptions);
  }
  getAllWantedDetailsOnLoad(timeSheetemployeeId: string) {
    const data1 = this.http.get<TimePeriods[]>(this.url + 'GetTimeSheetPeridos');

    let params = new HttpParams()
      .set('EmployeeId', timeSheetemployeeId);
    const data2 = this.http.get<TimeSheetForApproval[]>(this.url + 'GetTimeSheetApprovalsCheck', { params });

    params = new HttpParams()
      .set('EmployeeID', timeSheetemployeeId !== '' ? timeSheetemployeeId : '0')
      .set('LoginID', '')
      .set('Password', '');
    const data3 = this.http.get<Employee[]>(this.url + 'GetEmployee', { params });

    return forkJoin([data1, data2, data3]);
  }
  getEmployeesNoTimesheetforInvoice(EmployeeId: string) {
    const params = new HttpParams()
      .set('EmployeeId', EmployeeId.toString());
    return this.http.get<TimeSheet[]>(this.url + 'GetEmployeesNoTimesheetforInvoice', { params });
  }
  getHoursbyTimesheetforEmployee(startdate: string, enddate: string, employeeid: string) {
    const params = new HttpParams()
      .set('startdate', startdate)
      .set('enddate', enddate)
      .set('employeeid', employeeid);
    return this.http.get<HoursByTimesheet[]>(this.url + 'TimeSheetHoursByEmployee', { params });
  }
  onlyTimeLineAndCellDelete(_timeLine: TimeLine) {
    const body = JSON.stringify(_timeLine);
    return this.http.post<TimeSheet>(this.url + 'OnlyTimeLineAndTimeCell_Delete', body, httpOptions);
  }
  timeSheetPendingForApprovalInsert(_timeSheetApp: TimeSheetForApproval) {
    const body = JSON.stringify(_timeSheetApp);
    console.log(body);
    return this.http.post<TimeSheetForApproval>(this.url + 'TimeSheetPendingForApprovalInsert', body, httpOptions);
  }

  timeSheetPendingForApprovalUpdate(_timeSheetApp: TimeSheetForApproval) {
    const body = JSON.stringify(_timeSheetApp);
    console.log(body);
    return this.http.post<TimeSheetForApproval>(this.url + 'TimeSheetPendingForApprovalUpdate', body, httpOptions);
  }
  timeSheetApprovalStatusUpdate(_timeSheet: TimeSheet) {
    const body = JSON.stringify(_timeSheet);
    console.log(body);
    return this.http.post<TimeSheetForApproval>(this.url + 'TimeSheetApprovalStatusUpdate', body, httpOptions);
  }
  getEmployeePayroll(EmployeeId: string) {
    const params = new HttpParams()
      .set('EmployeeId', EmployeeId.toString());
    return this.http.get<Employee[]>(this.url + 'GetPayrollForEmployee', { params });
  }


  EmailByType(sendTo: string, bodyParams: string[], emailType: string, SendOnlyAdmin: string) {
    console.log(bodyParams);
    console.log(JSON.stringify(bodyParams));
    const params = new HttpParams()
      .set('sendTo', sendTo)
      .set('bodyParams', JSON.stringify(bodyParams))
      .set('emailType', emailType)
      .set('SendOnlyAdmin', SendOnlyAdmin);

    return this.http.get<DictionaryType[]>(this.url + 'EmailByType', { params });
  }

  PendingTimesheetEmail(recipientsToEmailJSON: string, byCloseOfBusiness: string, ccFinance: string, periodEndDate: string) {
    const params = new HttpParams()
      .set('recipientsToEmailJSON', recipientsToEmailJSON)
      .set('byCloseOfBusiness', byCloseOfBusiness)
      .set('ccFinance', ccFinance)
      .set('periodEndDate', periodEndDate);

    return this.http.get<DictionaryType[]>(this.url + 'PendingTimesheetEmail', { params });
  }

  EmailTimesheet(empLastName: string, empFirstName: string, empEmailAddress: string,
    timesheetHTML: string, ToFinance: string, ToAddress: string,
    isApproved: string, supLastName: string, supFirstName: string) {
    const params = new HttpParams()
      .set('empLastName', empLastName)
      .set('empFirstName', empFirstName)
      .set('empEmailAddress', empEmailAddress)
      .set('timesheetHTML', timesheetHTML)
      .set('ToFinance', ToFinance)
      .set('ToAddress', ToAddress)
      .set('isApproved', isApproved)
      .set('supLastName', supLastName)
      .set('supFirstName', supFirstName);

    return this.http.get<DictionaryType[]>(this.url + 'EmailTimesheet', { params });
  }

  SendApproveOrRejectMailToEmployee(supEmail: string, period: string, empEmailAddress: string, status: string, timesheetHTML: string) {
    const params = new HttpParams()
      .set('supEmail', supEmail)
      .set('period', period)
      .set('empEmailAddress', empEmailAddress)
      .set('status', status)
      .set('timesheetHTML', timesheetHTML);
    return this.http.get<DictionaryType[]>(this.url + 'SendApproveOrRejectMailToEmployee', { params });
  }


}
