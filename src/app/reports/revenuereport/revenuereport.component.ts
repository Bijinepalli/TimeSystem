import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  _frm = new FormGroup({});

  constructor(private timesysSvc: TimesystemService, private router: Router,
    private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.cols = [
      { field: 'Name', header: 'Client Name', align: 'left', width: 'auto' },
      { field: 'PeriodEnd', header: 'Period End', align: 'left', width: '150px' },
      { field: 'Hours', header: 'T & M Hours', align: 'right', width: '140px' },
    ];
    this.addControls();
  }
  addControls() {
    this._frm.addControl('_startDateSelect', new FormControl(null, Validators.required));
    this._frm.addControl('_endDateSelect', new FormControl(null, Validators.required));
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

  showRevenueReport() {
    this.clearList();
    let startDate = this._frm.controls['_startDateSelect'].value.toString().trim();
    startDate = this.datePipe.transform(new Date(startDate), 'yyyy-MM-dd');
    let endDate = this._frm.controls['_endDateSelect'].value.toString().trim();
    endDate = this.datePipe.transform(new Date(endDate), 'yyyy-MM-dd');
    this.showList = true;
    this.timesysSvc.getRevenueReports(startDate, endDate)
      .subscribe(
        (outputData) => {
          if (outputData !== undefined && outputData !== null && outputData.length > 0) {
            this._recData = outputData.length.toString();
            this._revenueslist = outputData;
          }
        });
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
    this.resetForm();
  }
  get currentFormControls() {
    return this._frm.controls;
  }
}
