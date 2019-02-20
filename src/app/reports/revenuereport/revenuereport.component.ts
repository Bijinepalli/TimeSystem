import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router } from '@angular/router';
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

  cols: any;
  _recData = 0;
  _revenuesPageNo: number;

  showReport = false;
  showSpinner = false;

  visibleHelp: boolean;
  helpText: string;

  _errorBlock = '';
  _errorMessage = '';

  _frm = new FormGroup({});

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.Initialisations();
  }

  Initialisations() {
    this.cols = [
      { field: 'Name', header: 'Client Name', align: 'left', width: 'auto' },
      { field: 'PeriodEnd', header: 'Period End', align: 'left', width: '150px' },
      { field: 'Hours', header: 'T & M Hours', align: 'right', width: '140px' },
    ];
    this.addControls();
  }

  addControls() {
    this._frm = new FormGroup({});
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

  get currentFormControls() {
    return this._frm.controls;
  }
  showRevenueReport() {
    this.showSpinner = true;
    this.clearControls();
    let startDate = this._frm.controls['_startDateSelect'].value.toString().trim();
    startDate = this.datePipe.transform(new Date(startDate), 'yyyy-MM-dd');
    let endDate = this._frm.controls['_endDateSelect'].value.toString().trim();
    endDate = this.datePipe.transform(new Date(endDate), 'yyyy-MM-dd');

    this.timesysSvc.getRevenueReports(startDate, endDate)
      .subscribe(
        (outputData) => {
          this.showReport = true;
          this._revenueslist = [];
          this._recData = 0;
          if (outputData !== undefined && outputData !== null && outputData.length > 0) {
            this._revenueslist = outputData;
            this._recData = this._revenueslist.length;
          }
          this.showSpinner = false;
        });
  }

  clearControls() {
    this._errorBlock = '';
    this._errorMessage = '';
    this._revenueslist = [];
    this._recData = 0;
    this._revenuesPageNo = 0;
  }

  startOver() {
    this.showReport = false;
    this.clearControls();
    this.resetForm();
  }



}
