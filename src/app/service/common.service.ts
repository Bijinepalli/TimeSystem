import { Injectable } from '@angular/core';
import { AppSettings } from '../model/objects';
import { TimesystemService } from './timesystem.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  GlobalAppSettings: AppSettings[] = [];
  constructor(private timesysSvc: TimesystemService, private http: HttpClient) { }

  setAppSettings() {
    const params = new HttpParams();
    return new Promise((resolve, reject) => {
      this.timesysSvc.getAppSettings().subscribe(response => {
        this.GlobalAppSettings = response;
        resolve(true);
      });
    });
  }

  getAppSettingsValue(DataKey: string): any {
    let AppSettingsValue = '';
    if (this.GlobalAppSettings !== undefined && this.GlobalAppSettings !== null && this.GlobalAppSettings.length > 0) {
      const AppsettingsVal: AppSettings = this.GlobalAppSettings.find(m => m.DataKey === DataKey);
      if (AppsettingsVal !== undefined && AppsettingsVal !== null) {
        AppSettingsValue = AppsettingsVal.Value;
      }
    }
    return AppSettingsValue;
  }

}
