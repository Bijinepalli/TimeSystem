import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from 'src/app/service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { Table } from 'primeng/table';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-activitylogreport',
  templateUrl: './activitylogreport.component.html',
  styleUrls: ['./activitylogreport.component.css']
})
export class ActivitylogreportComponent implements OnInit {

  showSpinner = false;
  showReport = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  admin = false;
  _DateFormat: any;
  _DisplayDateFormat: any;
  IsSecure = false;
  _sortArray: string[];
  ParamSubscribe: any;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    public commonSvc: CommonService) {
      console.log('1');
    // this.CheckActiveSession();
    // this.commonSvc.setAppSettings();
  }

  @ViewChild('dt') dt: Table;

  CheckActiveSession() {
    let sessionActive = false;
    console.log('2');
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
    }
  }


  ngOnInit() {
    console.log('3');
    this.showSpinner = true;
    this.IsSecure = false;
    console.log('In');
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
    this.showSpinner = false;
  }

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }
  Initialisations() {
    this.showSpinner = true;
    this.resetSort();
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.cols = [
      // { field: 'UserID', header: 'UserID', align: 'left', width: 'auto' },
      { field: 'UserName', header: 'User Name', align: 'left', width: 'auto' },
      // { field: 'PageID', header: 'PageID', align: 'left', width: '200px' },
      { field: 'PageName', header: 'Page Name', align: 'left', width: 'auto' },
      { field: 'PageParams', header: 'Page Parameters Passed', align: 'center', width: 'auto' },
      // { field: 'SectionID', header: 'SectionID', align: 'center', width: 'auto' },
      { field: 'SectionName', header: 'Section Name', align: 'center', width: 'auto' },
      { field: 'SectionParams', header: 'Section Parameters Passed', align: 'left', width: 'auto' },
      { field: 'ActionName', header: 'Action Name', align: 'left', width: 'auto' },
      { field: 'ActionParams', header: 'Action Parameters Passed', align: 'right', width: 'auto' },
      { field: 'Message', header: 'Message', align: 'right', width: 'auto' },
      { field: 'Mode', header: 'Mode', align: 'right', width: 'auto' },
      { field: 'TimeStamp', header: 'Date', align: 'right', width: '95px' },
    ];
    this._sortArray = ['UserName', 'PageName', 'PageParams', 'SectionName', 'SectionParams',
      'ActionName', 'ActionParams', 'Message', 'Mode', 'TimeStamp'];
    this.showSpinner = false;
    this.generateReport();
  }
  ClearAllProperties() {
    this.showReport = true;
    this.showSpinner = false;
    this._reports = [];
    this._recData = 0;
    this.cols = {};
    this.admin = false;
    this.IsSecure = false;
    this.showReport = false;
    this.resetSort();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  generateReport() {
    this.showSpinner = true;
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    this.timesysSvc.getActivityLog()
      .subscribe(
        (data) => {
          this.showReport = false;
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = this._reports[0].RowCount;
            this.showReport = true;
          }
          this.showSpinner = false;
        });
  }

  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
