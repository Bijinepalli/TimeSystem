import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-revenuereport',
  templateUrl: './revenuereport.component.html',
  styleUrls: ['./revenuereport.component.css'],
  providers: [DatePipe]
})
export class RevenuereportComponent implements OnInit {

  _revenueslist: BillingCodes[] = [];
  _startDateSelect: Date;
  _endDateSelect: Date;
  showList = false;
  cols: any;
  _recData: any;
  _revenuesPageNo: number;

  constructor(private timesysSvc: TimesystemService, private router: Router,
    private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.cols = [
      { field: 'Name', header: 'Client Name', align: 'left', width: 'auto' },
      { field: 'PeriodEnd', header: 'Period End', align: 'left', width: '150px' },
      { field: 'Hours', header: 'T & M Hours', align: 'right', width: '100px' },
    ];
  }

  showRevenueReport() {
    this.clearList();
    this.showList = true;
    const startDate = this.datePipe.transform(this._startDateSelect, 'yyyy-MM-dd');
    const endDate = this.datePipe.transform(this._endDateSelect, 'yyyy-MM-dd');
    this.timesysSvc.getRevenueReports(startDate, endDate)
      .subscribe(
        (outputData) => {
          if (outputData !== undefined && outputData !== null && outputData.length > 0) {
            this._recData = outputData.length;
            this._revenueslist = outputData;
          }
        });
  }
  clearList() {
    this._revenueslist = [];
    this._recData = 0;
    this._revenuesPageNo = 0;
  }
  startOver() {
    this.showList = false;
    this.clearList();
  }
}
