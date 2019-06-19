import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ActivityLog, LoginErrorMessage } from '../model/objects';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ActivitylogService {

  private url = environment.url;
  constructor(private http: HttpClient) { }
  ActionLog(PageName: string, SectionName: string, Mode: string, ActionName: string, Message: string,
    PageParams: string, SectionParams: string, ActionParams: string) {
    let activity: ActivityLog;
    activity = {};
    if (sessionStorage && environment && environment.buildType) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId')) {
        activity.UserID = +(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString());
      } else {
        if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserName')) {
          activity.UserName = sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserName');
        }
      }
    }
    activity.PageName = PageName;
    activity.PageParams = PageParams;
    activity.SectionName = SectionName;
    activity.SectionParams = SectionParams;
    activity.ActionName = ActionName;
    activity.ActionParams = ActionParams;
    activity.Mode = Mode;
    activity.Message = Message;
    this.http.post<LoginErrorMessage>(this.url + 'ActivityLog_Insert', JSON.stringify(activity), httpOptions)
      .subscribe((data) => { }, (error) => { });
  }

}
