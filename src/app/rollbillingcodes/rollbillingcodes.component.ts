import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet } from '../model/objects';

@Component({
  selector: 'app-rollbillingcodes',
  templateUrl: './rollbillingcodes.component.html',
  styleUrls: ['./rollbillingcodes.component.css']
})
export class RollbillingcodesComponent implements OnInit {
  visibleHelp: boolean;
  helpText: string;
  _NonBillSelect = false;
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private commonSvc: CommonService) { }

  _showRoll = false;
  _action1 = '';
  _action2 = '';
  selectedValue = 0;
  rollBillingForm = new FormGroup({});
  _upComingYear = '';
  _priorYear = '';
  ngOnInit() {
    const jsonDate = '/Date(1517855400000+0530)/ ';
    const onlyDate = +(jsonDate.match(/\d+/)[0]);
    const getDate = new Date(onlyDate);
    console.log(getDate);
    this.addDefaultControlsToForm();
    const todayDate = new Date();
    console.log((todayDate.getFullYear() + 1).toString());
    this._upComingYear = todayDate.getMonth() === 12 ? (todayDate.getFullYear() + 1).toString() : todayDate.getFullYear().toString();
    this._priorYear = todayDate.getMonth() === 12 ? todayDate.getFullYear().toString() : (todayDate.getFullYear() - 1).toString();
    console.log(todayDate.getMonth() + '-month');
    console.log(todayDate.getDate() + '-day');
    if ((todayDate.getMonth() === 12 && todayDate.getDate() > 15) || todayDate.getMonth() === 1) {
      // tslint:disable-next-line:max-line-length
      this._action1 = 'Add New Non-Billable Codes for ' + (todayDate.getMonth() === 12 ? (todayDate.getFullYear() + 1) : todayDate.getFullYear());
      // tslint:disable-next-line:max-line-length
      this._action2 = 'Inactivate Non-Billable Codes for ' + (todayDate.getMonth() === 12 ? todayDate.getFullYear() : (todayDate.getFullYear() - 1));
      this._showRoll = true;
      this.selectedValue = 0;
      this.rollBillingForm.disable();
    } else {
      this.rollBillingForm.enable();
    }
  }
  onradioChange(value: string) {
    this._NonBillSelect = true;
    if (value === '0') {
      this.commonSvc.getAppSettingsValue('TimeSheetIntimationCountDown');
      this.rollBillingForm.controls['txtBenchCode'].setValue('');
      this.rollBillingForm.controls['txtBenchName'].setValue('');
      this.rollBillingForm.controls['txtHolidayCode'].setValue('');
      this.rollBillingForm.controls['txtHolidayName'].setValue('');
      this.rollBillingForm.controls['txtPTOCode'].setValue('');
      this.rollBillingForm.controls['txtPTOName'].setValue('');
    } else {
      this.rollBillingForm.controls['txtBenchCode'].setValue('');
      this.rollBillingForm.controls['txtBenchName'].setValue('');
      this.rollBillingForm.controls['txtHolidayCode'].setValue('');
      this.rollBillingForm.controls['txtHolidayName'].setValue('');
      this.rollBillingForm.controls['txtPTOCode'].setValue('');
      this.rollBillingForm.controls['txtPTOName'].setValue('');
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

  Approve() {

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

}
