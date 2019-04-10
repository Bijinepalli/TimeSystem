import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, HostListener, ViewChild } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Holidays } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SanitizeHtmlPipe } from '../sharedpipes/sanitizeHtmlString.pipe';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css'],
  providers: [DatePipe],
})
export class HolidaysComponent implements OnInit {

  _holidays: Holidays[] = [];
  _yec: YearEndCodes = new YearEndCodes();
  _years; any;
  selectedYear: any;
  cols: any;
  _recData = 0;
  _dialogwidth: number;
  holidayDialog = false;
  holidayHdr = 'Add Holiday';
  _frm = new FormGroup({});

  _selectedHoliday: Holidays;
  _IsEdit = false;

  _HasEdit = true;
  showSpinner = false;
  IsSecure = false;
  ParamSubscribe: any;
  DisplayDateFormat = '';
  showReport: boolean;
  _sortArray: string[];

  @ViewChild('dt') dt: Table;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    public commonSvc: CommonService,
    public datepipe: DatePipe
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
      this.IsSecure = false;
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
  }
  /* #endregion */

  /* #region Basic Methods */

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          if (data[0].HasEdit) {
            this._HasEdit = false;
          }
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this.resetSort();
    this.showReport = false;
    this._holidays = [];
    this._recData = 0;
    this._selectedHoliday = {};
    this.resetForm();
    this.showSpinner = false;
  }

  Initialisations() {
    this.showSpinner = true;
    this.DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._dialogwidth = 830;
    this._years = [
      { label: '2010', value: '2010' },
      { label: '2011', value: '2011' },
      { label: '2012', value: '2012' },
      { label: '2013', value: '2013' },
      { label: '2014', value: '2014' },
      { label: '2015', value: '2015' },
      { label: '2016', value: '2016' },
      { label: '2017', value: '2017' },
      { label: '2018', value: '2018' },
      { label: '2019', value: '2019' },
      { label: '2020', value: '2020' },
    ];

    this.cols = [
      { field: 'CalendarYear', header: 'Year', align: 'center', width: '100px' },
      { field: 'HolidayDate', header: 'Date', align: 'center', width: '100px' },
      { field: 'HolidayName', header: 'Holiday Name', align: 'left', width: 'auto' },
    ];
    this._sortArray = ['CalendarYear', 'HolidayDateSearch', 'HolidayName'];

    const _date: Date = new Date();
    this.selectedYear = _date.getFullYear();
    this.addControls();
    this.showSpinner = false;
    this.getHolidays();

  }
  /* #endregion*/

  getHolidays() {
    this.showSpinner = true;
    this.showReport = false;
    this.resetSort();
    this.timesysSvc.getHolidays(this.selectedYear, this._yec.HolidayCode + this.selectedYear)
      .subscribe(
        (data) => {
          this._holidays = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._holidays = data;
            this._recData = data.length;
          }
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }

  addHoliday() {
    this._IsEdit = false;
    this._selectedHoliday = {};
    this.resetForm();
    this.setDataToControls(this._selectedHoliday);
    this.holidayHdr = 'Add New Holiday';
    this.holidayDialog = true;
  }

  editHoliday(data: Holidays) {
    this._IsEdit = true;
    this._selectedHoliday = new Holidays();
    this._selectedHoliday.Id = data.Id;
    this._selectedHoliday.CalendarYear = data.CalendarYear;
    this._selectedHoliday.CompanyName = data.CompanyName;
    this._selectedHoliday.HolidayDate = data.HolidayDate;
    this._selectedHoliday.HolidayDateSearch = data.HolidayDateSearch;
    this._selectedHoliday.HolidayName = data.HolidayName;
    this._selectedHoliday.InUse = data.InUse;
    this.resetForm();
    this.setDataToControls(data);
    this.holidayHdr = 'Edit Holiday';
    this.holidayDialog = true;
  }

  addControls() {
    this._frm.addControl('holidayName',
      new FormControl(null,
        [Validators.required,
        Validators.pattern('^[a-zA-Z0-9\\040\\047\\055]*$'),
        ]
      ));
    this._frm.addControl('holidayDate', new FormControl(null, Validators.required));
  }

  setDataToControls(data: Holidays) {
    if (data !== undefined) {
      if (!this.IsControlUndefined('holidayName')) {
        if (data.HolidayName !== undefined && data.HolidayName !== null && data.HolidayName.toString() !== '') {
          this._frm.controls['holidayName'].setValue(data.HolidayName);
        }
      }

      if (!this.IsControlUndefined('holidayDate')) {
        if (data.HolidayDate !== undefined && data.HolidayDate !== null && data.HolidayDate.toString() !== '') {
          this._frm.controls['holidayDate'].setValue(new Date(data.HolidayDate));
        } else {
          this._frm.controls['holidayDate'].setValue(new Date());
        }
      }
    }
  }

  hasFormErrors() {
    return !this._frm.valid;
  }

  resetForm() {
    this._frm.markAsPristine();
    this._frm.markAsUntouched();
    this._frm.updateValueAndValidity();
    this._frm.reset();
  }

  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }

  clearControls() {
    this._IsEdit = false;
    this._selectedHoliday = null;
    this.resetForm();
    this.holidayHdr = 'Add New Holiday';
    this.holidayDialog = false;
  }

  cancelHoliday() {
    this.clearControls();
  }

  saveHoliday() {
    this.showSpinner = true;
    if (this._IsEdit === false) {
      if (this._selectedHoliday === undefined || this._selectedHoliday === null) {
        this._selectedHoliday = {};
      }
      this._selectedHoliday.Id = -1;
    }
    if (!this.IsControlUndefinedAndHasValue('holidayName')) {
      this._selectedHoliday.HolidayName = this._frm.controls['holidayName'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('holidayDate')) {
      this._selectedHoliday.HolidayDate = this.datepipe.transform(this._frm.controls['holidayDate'].value, 'yyyy/MM/dd');
      this._selectedHoliday.CalendarYear = new Date(this._selectedHoliday.HolidayDate).getFullYear();
    }
    this.showSpinner = false;
    this.SaveHolidaySPCall();
  }

  IsControlUndefined(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frm.controls[ctrlName] !== undefined &&
      this._frm.controls[ctrlName] !== null
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }

  IsControlUndefinedAndHasValue(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frm.controls[ctrlName] !== undefined &&
      this._frm.controls[ctrlName] !== null &&
      this._frm.controls[ctrlName].value !== undefined &&
      this._frm.controls[ctrlName].value !== null &&
      this._frm.controls[ctrlName].value.toString().trim() !== ''
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }

  deleteHoliday(data: Holidays) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.HolidayName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.showSpinner = true;
        this.timesysSvc.Holiday_Delete(data)
          .subscribe(
            (outputData) => {
              this.showSpinner = false;
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Holiday deleted successfully'
                });
                this.getHolidays();
              }
            });
      },
      reject: () => {
        /* do nothing */
      }

    });
  }

  SaveHolidaySPCall() {
    this.showSpinner = true;
    this.timesysSvc.Holiday_InsertOrUpdate(this._selectedHoliday)
      .subscribe(
        (outputData) => {
          this.showSpinner = false;
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage
            });
          } else {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Holiday saved successfully' });
            this.clearControls();
            this.getHolidays();
          }
        });
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['HolidayDate'], ['CalendarYear']);
  }
}
