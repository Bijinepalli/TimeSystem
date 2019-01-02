import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, TimeSheet } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pendingtimesheets',
  templateUrl: './pendingtimesheets.component.html',
  styleUrls: ['./pendingtimesheets.component.css']
})
export class PendingtimesheetsComponent implements OnInit {
  dates: SelectItem[];
  dateFormat: string;
  periodEnd: any;
  selectedDate: string;
  timesheet: TimeSheet[] = [];
  showSpinner = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.populateDateDrop();
  }

  ngOnInit() {
  }

  populateDateDrop() {
    this.dates = [];
    this.timesysSvc.getDatebyPeriod()
      .subscribe(
        (data) => {
          this.timesheet = data;
          for (let i = 0; i < this.timesheet.length; i++) {
            this.dates.push({ label: this.timesheet[i].PeriodEndDate, value: this.timesheet[i].PeriodEndDate });
          }
        }
      );
  }
  onDateChange(e) {

  }

}
