import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { SelectItem, SortEvent } from 'primeng/api';
import { Holidays } from '../../model/objects';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-holidaysreport',
  templateUrl: './holidaysreport.component.html',
  styleUrls: ['./holidaysreport.component.css']
})
export class HolidaysreportComponent implements OnInit {

  _years; any;
  selectedYear: any;
  _holidayList: Holidays[] = [];
  _selectedHolidays: Holidays;
  _recData: any;
  cols: any;
  helpText: any;
  visibleHelp = false;
  showReport = false;
  showSpinner = false;
  ParamSubscribe: any;
  _DateFormat: any;
  _DisplayDateFormat: any;
  IsSecure = false;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private commonSvc: CommonService,
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }

  CheckActiveSession() {
    let sessionActive = false;
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
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }
  ngOnInit() {
    this.showSpinner = true;
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
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

  ClearAllProperties() {
    this._years = [];
    this.selectedYear = '';
    this._holidayList = [];
    // this._selectedHolidays = new Holidays();
    this._recData = '';
    this.cols = {};
    this.helpText = '';
    this.visibleHelp = false;
    this.showReport = false;
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.cols = [
      { field: 'CalendarYear', header: 'Year', align: 'center', width: '100px' },
      { field: 'CompanyName', header: 'Company Name', align: 'left', width: 'auto' },
      { field: 'HolidayName', header: 'Holiday Name', align: 'left', width: 'auto' },
      { field: 'HolidayDate', header: 'Holiday Date', align: 'center', width: '150px' },
    ];
    this.showSpinner = false;
    this.getHolidayYears();
  }
  getHolidayYears() {
    this.showSpinner = true;
    this._years = [];
    this._years.push({ label: 'All Years', value: 0 });
    this.timesysSvc.getHolidayYears()
      .subscribe(
        (data) => {
          for (let i = 0; i < data.length; i++) {
            this._years.push({ label: data[i].CalendarYear.toString(), value: data[i].CalendarYear.toString() });
          }
          const _date: Date = new Date();
          this.selectedYear = _date.getFullYear();
          this.getHolidays();
        }
      );
  }

  getHolidays() {
    this.showSpinner = true;
    let year = '';
    if (this.selectedYear.toString() !== '0') {
      year = this.selectedYear.toString();
    } else {
      year = '';
    }
    this.timesysSvc.getHolidayList(year)
      .subscribe(
        (data) => {
          this.showReport = false;
          this._holidayList = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._holidayList = data;
            this._recData = this._holidayList.length;
            this.showReport = true;
          }
          this.showSpinner = false;
        }
      );
  }
  showHelp(file: string) {
    this.timesysSvc.getHelp(file)
      .subscribe(
        (data) => {
          // this.helpText = data;
          this.visibleHelp = true;
          const parser = new DOMParser();
          const parsedHtml = parser.parseFromString(data, 'text/html');
          this.helpText = parsedHtml.getElementsByTagName('body')[0].innerHTML;
        }
      );
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['HolidayDate'], ['CalendarYear']);
  }

}
