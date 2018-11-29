import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {
  Holidays, Companies, CompanyHolidays, Projects, AppSettings, Employee, LoginErrorMessage, Customers, Clients, NonBillables, MasterPages
} from '../model/objects';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommaExpr } from '@angular/compiler';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class TimesystemService {

  private ipaddress = 'http://172.16.32.67/';
  private ipaddressLocal = 'http://localhost/';
  private helpipaddress = 'http://172.16.32.67/ECTS/TimeSystem/help/';
  private url = this.ipaddress + 'TimeSystemService/';
  private localurl = this.ipaddressLocal + 'TimeSystemService/';
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
  getUsedCustomers() {
    return this.http.get<Customers[]>(this.url + 'GetUsedCustomers');
  }
  getClients() {
    return this.http.get<Clients[]>(this.url + 'GetClients');
  }
  getUsedBillingCodes(code: string) {
    const params = new HttpParams()
      .set('code', code);
    return this.http.get<Clients[]>(this.url + 'GetBillingProjects', { params });
  }
  getAllEmployee(isActiveIndex: number, isSalariedIndex: number) {
    const params = new HttpParams()
      .set('isActiveIndex', isActiveIndex.toString())
      .set('isSalariedIndex', isSalariedIndex.toString());
    return this.http.get<Employee[]>(this.url + 'ListAllEmployee', { params });
  }

<<<<<<< HEAD
  getHTMLBody(): Observable<any> {
    return this.http.get('http://172.16.32.67/ECTS/TimeSystem/help/HolidayUpdate.htm', {responseType: 'text'}).pipe(
    map(res => res.toString()));
    }
=======
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

  getPagesbyRoles(role: string) {
    const params = new HttpParams()
      .set('role', role);
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
>>>>>>> eca1a9c21e0e52c35dbc4871423d544491604571
}
