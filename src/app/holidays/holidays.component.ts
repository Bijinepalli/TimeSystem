import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, HostListener } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Holidays } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SanitizeHtmlPipe } from '../sharedpipes/sanitizeHtmlString.pipe'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css']
})
export class HolidaysComponent implements OnInit {

  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService) { }
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

<<<<<<< HEAD
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // console.log("Width: " + event.target.innerWidth);
    if (event.target.innerWidth <= 640) {
      console.log("Less than 640");
      this._dialogwidth = 500;
    }
    else if (event.target.innerWidth <= 840 && event.target.innerWidth > 640) {
      console.log("Greater than 640");
      this._dialogwidth = 600;
    }
    else {
      console.log(this._dialogwidth);
      this._dialogwidth = 830;
    }
  }
  helpText: any;
  visibleHelp = false;
>>>>>>> cf14ac8b71d05484896c4c153a1bbb8b242dd509
  ngOnInit() {
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

    this._frm.addControl('holidayName', new FormControl(null, Validators.required));
    this._frm.addControl('holidayDate', new FormControl(null, Validators.required));

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

  getHolidays() {
    console.log(this._yec.HolidayCode + this.selectedYear);
    this.timesysSvc.getHolidays(this.selectedYear, this._yec.HolidayCode + this.selectedYear)
      .subscribe(
        (data) => {
          this._holidays = data;
          this._recData = data.length + ' holidays found';
        }
      );
  }

  deleteHoliday(data: Holidays) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.HolidayName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
      },
      reject: () => {
        /* do nothing */
      }

    });
  }

  addHoliday() {
    this.holidayDialog = true;
    this.holidayHdr = 'Add New Holiday';
    this.resetForm();
    this.addControls(undefined);
  }

  editHoliday(data: Holidays) {
    this.holidayDialog = true;
    this.holidayHdr = 'Edit Holiday';
    this.resetForm();
    this.addControls(data);
  }

  addControls(data: Holidays) {
    if (data === undefined) {
      this._frm.controls['holidayDate'].setValue(new Date());
    } else {
      this._frm.controls['holidayName'].setValue(data.HolidayName);
      this._frm.controls['holidayDate'].setValue(data.HolidayDate);
    }
  }

  cancelHoliday() {
    this.holidayDialog = false;
  }

  saveHoliday() {
    this.holidayDialog = false;
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

  getHolidayHelp() {
    this.timesysSvc.getHTMLBody()
      .subscribe(
        (data) => {
          this._sidebarHelp = true;
          let parser = new DOMParser();
          let parsedHtml = parser.parseFromString(data, 'text/html');
          this._helpPage = parsedHtml.getElementsByTagName("body")[0].innerHTML;
        }
      );
  }

}
