import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { TimeSheetForEmplyoee, TimeSheetBinding, TimeSheet, TimeSheetForApproval, Employee } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-employeetimesheets',
  templateUrl: './employeetimesheets.component.html',
  styleUrls: ['./employeetimesheets.component.css'],
  providers: [DatePipe]
})
export class EmployeetimesheetsComponent implements OnInit {
  types: SelectItem[];
  hoursType: SelectItem[];
  selectedType: string;
  selectedhoursType: string;
  showSpinner = false;
  codes: SelectItem[];
  _employee: Employee[];
  _codeCount: string;
  showBillingCodeList = false;
  changeCodeList = false;
  showReport = false;
  cols: any[];
  _recData = 0;
  _recDataPending = 0;
  _timeSheets: TimeSheetForEmplyoee[];
  _timePeriods: TimeSheetBinding[];
  selectedValues: Boolean;
  selectedCode: string;
  visibleHelp: boolean;
  helpText: string;
  selectedEmployeeName: string;
  ParamSubscribe: any;
  IsSecure = false;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
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
    this.types = [];
    this.hoursType = [];
    this.selectedType = '0';
    this.selectedhoursType = '';
    this.codes = [];
    this._employee = [];
    this._codeCount = '';
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this.cols = [];
    this._recData = 0;
    this._recDataPending = 0;
    this._timeSheets = [];
    this._timePeriods = [];
    this.selectedCode = '';
    this.visibleHelp = false;
    this.helpText = '';
    this.selectedEmployeeName = '';
  }

  Initialisations() {
    this.hoursType = [
      { label: 'Salary', value: '1' },
      { label: 'Hourly', value: '0' },
      { label: 'Both', value: '' }
    ];
    this.selectedhoursType = '';
    this.types = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '' }
    ];
    this.selectedType = '0';
    this.cols = [
      { field: 'PeriodEnd', header: 'PeriodEnd', align: 'center', width: 'auto' },
      { field: 'Submitted', header: 'Submitted', align: 'center', width: 'auto' },
      { field: 'SubmitDate', header: 'Date Submitted', align: 'center', width: 'auto' },
      { field: 'Resubmitted', header: 'Resubmitted', align: 'center', width: 'auto' },
      { field: 'SemiMonthly', header: 'Semi-Monthly', align: 'center', width: 'auto' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '95px' },
    ];
  }
  getEmployees() {
    this.showSpinner = true;
    this.codes = [];
    this.selectedCode = '';
    this.timesysSvc.getAllEmployee(this.selectedType.toString(), this.selectedhoursType.toString()).subscribe(
      (data) => {
        this._employee = [];
        if (data !== undefined && data !== null && data.length > 0) {
          data = data.filter(m => m.SubmitsTime.toString().toLowerCase() === 'true');
          if (data !== undefined && data !== null && data.length > 0) {
            this._employee = data;
          }
        }

        // if (this.selectedType === '0' || this.selectedType === '1') {
        //   this._employee = data.filter(P => P.Inactive === (this.selectedType === '0' ? false : true));
        // } else {
        // }

        for (let i = 0; i < this._employee.length; i++) {
          this.codes.push({
            label: this._employee[i].LastName + ', ' + this._employee[i].FirstName,
            value: this._employee[i].ID
          });
        }

        this._codeCount = 'Select from ' + this._employee.length + ' matching Employees';
        this.showBillingCodeList = true;
        this.showSpinner = false;
      }
    );
  }
  generateReport() {
    const Mode = '0';
    this.selectedEmployeeName = this.codes.find(m => m.value === this.selectedCode).label.toString();
    this.timesysSvc.getEmployeeTimeSheetList(this.selectedCode.toString(), Mode)
      .subscribe(
        (data) => {
          this._timeSheets = [];
          this._recData = 0;
          this._recDataPending = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._timeSheets = data;
            this._recData = this._timeSheets.length;
            const Pending = data.filter(m => m.Submitted.toUpperCase() === 'NO');
            if (Pending !== undefined && Pending !== null && Pending.length > 0) {
              this._recDataPending = Pending.length;
            }
          }
          this.showReport = true;
          this.showSpinner = false;
          this.changeCodeList = true;
          this.showBillingCodeList = false;
        }
      );
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this.showSpinner = false;
  }
  viewTimeSheet(rowData: TimeSheetForEmplyoee) {
    this.navigateToTimesheet(rowData.Id, '');
  }
  navigateToTimesheet(TimesheetId, TimesheetDate) {
    // this.timesheetDialog = false;
    let routerLinkTimesheet = '/menu/maintaintimesheet/' + TimesheetId;
    if (TimesheetDate !== '') {
      routerLinkTimesheet += '/' + TimesheetDate;
    }
    this.router.navigate([routerLinkTimesheet], { skipLocationChange: true });
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
}
