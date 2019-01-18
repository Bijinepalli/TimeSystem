import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, HostListener } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Holidays } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SanitizeHtmlPipe } from '../sharedpipes/sanitizeHtmlString.pipe';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css'],
  providers: [DatePipe],
})
export class HolidaysComponent implements OnInit {

  // tslint:disable-next-line:max-line-length
  constructor(
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    private datePipe: DatePipe,
  ) { }
  _holidays: Holidays[] = [];
  _yec: YearEndCodes = new YearEndCodes();
  _years; any;
  selectedYear: any;
  cols: any;
  _recData: any;
  _helpPage: any;
  _sidebarHelp = false;
  _dialogwidth: number;
  holidayDialog = false;
  holidayHdr = 'Add Holiday';
  _frm = new FormGroup({});
  helpText: any;
  visibleHelp = false;

  _selectedHoliday: Holidays;
  _IsEdit = false;

  _HasEdit = false;

  ngOnInit() {

    this.CheckSecurity();

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
      { field: 'CalendarYear', header: 'Year' },
      { field: 'HolidayName', header: 'Holiday Name' },
      { field: 'HolidayDate', header: 'Date' },
    ];

    const _date: Date = new Date();
    this.selectedYear = _date.getFullYear();

    this.getHolidays();
    this.addControls();
  }

  CheckSecurity() {
    this._HasEdit = false;
    this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        this.timesysSvc.getPagesbyRoles(localStorage.getItem('UserRole').toString(), params['Id'].toString())
          .subscribe((data) => {
            if (data != null && data.length > 0) {
              if (data[0].HasEdit) {
                this._HasEdit = true;
              }
            }
          });
      }
    });
  }

  getHolidays() {
    this.timesysSvc.getHolidays(this.selectedYear, this._yec.HolidayCode + this.selectedYear)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            this._holidays = data;
            this._recData = data.length + ' holidays found';
          } else {
            this._holidays = [];
            this._recData = 'No holidays found';
          }
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
    this._selectedHoliday = data;
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
    if (data === undefined) {
      this._frm.controls['holidayDate'].setValue(new Date());
    } else {
      this._frm.controls['holidayName'].setValue(data.HolidayName);
      this._frm.controls['holidayDate'].setValue(data.HolidayDate);
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

  clearControls() {
    this._IsEdit = false;
    this._selectedHoliday = null;
    this.resetForm();
    this.holidayHdr = 'Add New Holiday';
    this.holidayDialog = false;
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

  cancelHoliday() {
    this.clearControls();
  }

  saveHoliday() {
    if (this._IsEdit === false) {
      if (this._selectedHoliday === undefined || this._selectedHoliday === null) {
        this._selectedHoliday = {};
      }
      this._selectedHoliday.Id = -1;
    }
    this._selectedHoliday.HolidayName = this._frm.controls['holidayName'].value.toString().trim();
    this._selectedHoliday.HolidayDate = this.datePipe.transform(this._frm.controls['holidayDate'].value, 'yyyy/MM/dd');
    this._selectedHoliday.CalendarYear = new Date(this._selectedHoliday.HolidayDate).getFullYear();
    this.SaveHolidaySPCall();
  }
  deleteHoliday(data: Holidays) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.HolidayName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Holiday_Delete(data)
          .subscribe(
            (outputData) => {
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
    this.timesysSvc.Holiday_InsertOrUpdate(this._selectedHoliday)
      .subscribe(
        (outputData) => {
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

}
