import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { MonthlyHours } from '../model/objects';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-accesssystem',
  templateUrl: './accesssystem.component.html',
  styleUrls: ['./accesssystem.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class AccesssystemComponent implements OnInit {
  constructor(private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private commonSvc: CommonService,
    private datePipe: DatePipe) {
    this.commonSvc.setAppSettings();
  }
  _monthlyHours: MonthlyHours[];
  cols: any = [];
  _color = 'red';
  _frozenCols: any;
  ngOnInit() {
    this.cols = [{ field: 'EmployeeNumber', header: 'Employee Number', width: '100px', align: 'left' },
    { field: 'EmployeeName', header: 'Employee Name', width: '200px', align: 'left' }];
    // this._frozenCols = [{ field: 'EmployeeNumber', header: 'Employee #', width: '150px', align: 'left' },
    // { field: 'EmployeeName', header: 'Employee Name', width: '200px', align: 'left' }];
    const days = this.getDaysInMonth('01', '2019');
    for (let i = 1; i <= +days; i++) {
      this.cols.push({ field: 'Day' + i, header: i, width: '60px', align: 'right' });
    }

    this.timesysSvc.getAccessData('01', '2019', 'H400080,H300071,H400007,H400016,H400060,H400069,H400083, H400107').subscribe(
      (data) => {
        this._monthlyHours = data;
      });
  }
  formatTime(timS: string) {
    let tim: number;
    tim = + timS;
    if (tim === 0) {
      return '00:00';
    }
    const h = Math.floor(tim / 60);
    const m = tim % 60;

    // return ((h + ' hr ') + ((m > 0) ? (m + ' min') : ''));
    return (((h < 10 && h > 0) ? ('0' + h) : h) + ((m > 0) ? (':' + ((m < 10) ? ('0' + m) : m)) : ''));
  }
  textcolor(time: any) {
    if (time === 0) {
      return 'gray';
    } else if (time < 420) {
      return 'red';
    } else if (time >= 510) {
      return 'lightgreen';
    } else {
      return 'yellow';
    }
  }
  getDaysInMonth(month: any, year: any) {
    let days: any;
    const dateVAl = new Date(year, month, 0);
    days = (dateVAl).getDate();
    return days;
  }
  headerTextColor(day: any, index: any) {
    if (index > 1) {
      const getdate = new Date('2019' + '-' + '01' + '-' + day);
      const dayName = this.datePipe.transform(getdate, 'EEE');
      if (dayName === 'Sun' || dayName === 'Sat') {
        return 'weekends';
      }
    }
  }
}
