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
  ActionLog(PageID: number, PageName: string, SectionName: string, Mode: string, ActionName: string, Message: string) {
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

    activity.PageID = PageID;
    activity.PageName = PageName;
    activity.SectionName = SectionName;
    activity.ActionName = ActionName;
    activity.Mode = Mode;
    activity.Message = Message;
    this.http.post<LoginErrorMessage>(this.url + 'ActivityLog_Insert', JSON.stringify(activity), httpOptions)
    .subscribe((data) => { }, (error) => { });
  }

}
