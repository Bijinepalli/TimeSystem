import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {
  Holidays, Customers
} from '../model/objects';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimesystemService {

  private ipaddress = 'http://localhost/';
  private url = this.ipaddress + 'TimeSystemService/';
  constructor(private http: HttpClient) { }

  getHolidays(year: string, code: string) {
    const params = new HttpParams()
      .set('year', year)
      .set('code', code);
    return this.http.get<Holidays[]>(this.url + 'GetHolidays', { params });
  }
  getCustomers() {
    return this.http.get<Customers[]>(this.url + 'GetCustomers');
  }
  getUsedCustomers() {
    return this.http.get<Customers[]>(this.url + 'GetUsedCustomers');
  }

  getHelp() {
    return this.http.get('http://172.16.32.67/ECTS/TimeSystem/help/HolidayUpdate.htm');
  }
}
