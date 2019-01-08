import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, TimeSheet } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-periodendhours',
  templateUrl: './periodendhours.component.html',
  styleUrls: ['./periodendhours.component.css'],
  providers: [DatePipe]
})
export class PeriodendhoursComponent implements OnInit {
  dates: SelectItem[];
  dateFormat: string;
  periodEnd: any;
  selectedDate: string;
  timesheet: TimeSheet[] = [];
  showSpinner = false;
  helpText: any;
  visibleHelp = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.populateDateDrop();
  }

  ngOnInit() {
  }

  populateDateDrop() {
    this.dates = [];
    const PeriodEndReportPeriods = 48;    // GET VALUE FROM APPSETTINGS
    this.timesysSvc.getDatebyPeriod()
      .subscribe(
        (data) => {
          this.timesheet = data;
          for (let i = 0; i < PeriodEndReportPeriods; i++) {
            this.dates.push({ label: this.timesheet[i].PeriodEndDate, value: this.timesheet[i].PeriodEndDate });
          }
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
  onDateChange(e) {
    // this.showSpinner = true;
    // const semiMonthlyStart = '2011-12-16';
    // const semiMonthly = true;
    // const dateFormat = 'yyyy-MM-dd'
    // const convertedDate = new Date(this.selectedDate);
    // const periodEnd = this.datePipe.transform(this.selectedDate, dateFormat);
    // tslint:disable-next-line:max-line-length
    // if (semiMonthly && semiMonthlyStart === (convertedDate.getFullYear() + '-' + convertedDate.getMonth() + '-' + (convertedDate.getDate() + 1))) {
    //   this.getPeriodEndHoursSemiMonthly(this.selectedDate);
    // } else if ()
  }
  // getPeriodEndHoursSemiMonthly(selectedDate: string): any {
  //   throw new Error('Method not implemented.');
  // }

}
