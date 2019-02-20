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
  _recData: string;
  _revenuesPageNo: number;
  _errorBlock = '';
  _errorMessage = '';

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
    console.log(this._startDateSelect, this._endDateSelect);
    if ((this._startDateSelect !== undefined && this._startDateSelect !== null && this._startDateSelect.toString() !== '') &&
      (this._endDateSelect !== undefined && this._endDateSelect !== null && this._endDateSelect.toString() !== '')) {
      console.log('no error');
      this.showList = true;
      const startDate = this.datePipe.transform(this._startDateSelect, 'yyyy-MM-dd');
      const endDate = this.datePipe.transform(this._endDateSelect, 'yyyy-MM-dd');
      this.timesysSvc.getRevenueReports(startDate, endDate)
        .subscribe(
          (outputData) => {
            if (outputData !== undefined && outputData !== null && outputData.length > 0) {
              this._recData = outputData.length.toString();
              this._revenueslist = outputData;
            }
          });
    } else {
      this._errorBlock = 'Please select both from and to dates';
      console.log('error');
    }
  }
  clearList() {
    this._errorBlock = '';
    this._errorMessage = '';
    this._revenueslist = [];
    this._recData = '0';
    this._revenuesPageNo = 0;
  }
  startOver() {
    this.showList = false;
    this.clearList();
  }
}
