import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet } from '../model/objects';
import { YearEndCodes } from '../model/constants';

@Component({
  selector: 'app-rollbillingcodes',
  templateUrl: './rollbillingcodes.component.html',
  styleUrls: ['./rollbillingcodes.component.css']
})
export class RollbillingcodesComponent implements OnInit {
  _NonBillSelect = false;
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, public commonSvc: CommonService) { }

  _showRoll = false;
  _addNew = false;
  _action1 = '';
  _action2 = '';
  selectedValue = 0;
  rollBillingForm = new FormGroup({});
  _upComingYear = '';
  _priorYear = '';
  ngOnInit() {
    // const jsonDate = '/Date(1517855400000+0530)/ ';
    // const onlyDate = +(jsonDate.match(/\d+/)[0]);
    // const getDate = new Date(onlyDate);
    this.addDefaultControlsToForm();
    const todayDate = new Date('2019-01-19');
    console.log(todayDate);
    console.log(todayDate.getMonth());
    this._upComingYear = todayDate.getMonth() === 11 ? (todayDate.getFullYear() + 1).toString() : todayDate.getFullYear().toString();
    this._priorYear = todayDate.getMonth() === 11 ? todayDate.getFullYear().toString() : (todayDate.getFullYear() - 1).toString();
    if ((todayDate.getMonth() === 11 && todayDate.getDate() > 15) || todayDate.getMonth() === 0) {
      // tslint:disable-next-line:max-line-length
      this._action1 = 'Add New Non-Billable Codes for ' + (todayDate.getMonth() === 11 ? (todayDate.getFullYear() + 1) : todayDate.getFullYear());
      // tslint:disable-next-line:max-line-length
      this._action2 = 'Inactivate Non-Billable Codes for ' + (todayDate.getMonth() === 11 ? todayDate.getFullYear() : (todayDate.getFullYear() - 1));
      this.rollBillingForm.enable();
    } else {
      // tslint:disable-next-line:max-line-length
      this._action1 = 'Add New Non-Billable Codes';
      // tslint:disable-next-line:max-line-length
      this._action2 = 'Inactivate Non-Billable Codes';
      this._showRoll = true;
      this.selectedValue = 0;
      this.rollBillingForm.disable();
    }
  }
  onradioChange(value: string) {
    this._NonBillSelect = true;
    const yearEndCodes = new YearEndCodes();
    if (value === '0') {
      this._addNew = true;
      this.commonSvc.getAppSettingsValue('TimeSheetIntimationCountDown');
      this.rollBillingForm.controls['txtBenchCode'].setValue(yearEndCodes.BenchCode + this._upComingYear);
      this.rollBillingForm.controls['txtBenchName'].setValue(yearEndCodes.BenchName + this._upComingYear);
      this.rollBillingForm.controls['txtHolidayCode'].setValue(yearEndCodes.HolidayCode + this._upComingYear);
      this.rollBillingForm.controls['txtHolidayName'].setValue(yearEndCodes.HolidayName + this._upComingYear);
      this.rollBillingForm.controls['txtPTOCode'].setValue(yearEndCodes.PTOCode + this._upComingYear);
      this.rollBillingForm.controls['txtPTOName'].setValue(yearEndCodes.PTOName + this._upComingYear);
    } else {
      this._addNew = false;
      this.rollBillingForm.controls['txtBenchCode'].setValue(yearEndCodes.BenchCode + this._priorYear);
      this.rollBillingForm.controls['txtBenchName'].setValue(yearEndCodes.BenchName + this._priorYear);
      this.rollBillingForm.controls['txtHolidayCode'].setValue(yearEndCodes.HolidayCode + this._priorYear);
      this.rollBillingForm.controls['txtHolidayName'].setValue(yearEndCodes.HolidayName + this._priorYear);
      this.rollBillingForm.controls['txtPTOCode'].setValue(yearEndCodes.PTOCode + this._priorYear);
      this.rollBillingForm.controls['txtPTOName'].setValue(yearEndCodes.PTOName + this._priorYear);
    }

  }

  addDefaultControlsToForm() {
    this.rollBillingForm = new FormGroup({});
    this.rollBillingForm.addControl('radaction1', new FormControl('', null));
    this.rollBillingForm.addControl('radaction2', new FormControl('', null));
    this.rollBillingForm.addControl('txtBenchCode', new FormControl('', null));
    this.rollBillingForm.addControl('txtBenchName', new FormControl('', null));
    this.rollBillingForm.addControl('txtHolidayCode', new FormControl('', null));
    this.rollBillingForm.addControl('txtHolidayName', new FormControl('', null));
    this.rollBillingForm.addControl('txtPTOCode', new FormControl('', null));
    this.rollBillingForm.addControl('txtPTOName', new FormControl('', null));
  }

  AddNewBC() {

  }
  IncativateOldBC() {

  }

}
