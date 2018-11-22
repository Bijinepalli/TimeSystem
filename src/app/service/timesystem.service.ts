import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {
  Holidays, Companies, CompanyHolidays, Projects
} from '../model/objects';
import { Observable, forkJoin } from 'rxjs';
import { CommaExpr } from '@angular/compiler';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TimesystemService {

  private ipaddress = 'http://172.16.32.67/';
  private url = this.ipaddress + 'TimeSystemService/';
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
    const data1 =  this.http.get<Projects[]>(this.url + 'GetProjects');
    const data2 =  this.http.get<Projects[]>(this.url + 'GetBillingProjects', {params});
    return forkJoin([data1, data2]);
  }



  getHelp(): Observable<any> {
    return this.http.get('http://172.16.32.67/ECTS/TimeSystem/help/HolidayUpdate.htm').pipe(
      map(response => response['_body']));
  }
}
