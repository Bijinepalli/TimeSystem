import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet, Employee, PayStub } from '../model/objects';
import { Tree } from 'primeng/primeng';

@Component({
  selector: 'app-paystubs',
  templateUrl: './paystubs.component.html',
  styleUrls: ['./paystubs.component.css']
})
export class PaystubsComponent implements OnInit {

  _headerText = '2011 Pay Stubs';
  _headerMinorText = 'Latest 2011 Pay Stubs';
  _empPayroll: Employee[] = [];
  _viewCurrent = 'new';
  _displayCurrent = true;
  _payStub: PayStub[];
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private commonSvc: CommonService) { }

  ngOnInit() {
    this.showToggleDisplay('');
  }
  showToggleDisplay(viewCurrent) {
    this.timesysSvc.getEmployeePayroll(localStorage.getItem('UserId')).subscribe(
      (data) => {
        if (viewCurrent === '') {
          this._headerMinorText = 'Latest 2011 Pay Stubs';
        } else {
          this._headerMinorText = 'Older 2011 Pay Stubs';
        }
        this._empPayroll = data;
        if (this._empPayroll !== undefined && this._empPayroll !== null && this._empPayroll.length === 0) {
          this._headerMinorText = 'You do not have any pay stubs available';
        }
        this.getPayStubsForEmployee();
        if (this._payStub !== undefined && this._payStub !== null && this._payStub.length === 0) {
          this._headerMinorText = 'You do not have any ' + (viewCurrent === '' ? '' : 'older') + ' pay stubs available';
        }
      });
  }
  showPaystubs(showPayStubs: string) {
    if (showPayStubs === '') {
      this._displayCurrent = true;
    } else {
      this._displayCurrent = false;
    }
    this.showToggleDisplay(showPayStubs);
  }
  getPayStubsForEmployee() {
    this._payStub = [];
  }
}
