import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet, Employee, PayStub } from '../model/objects';
import { Tree } from 'primeng/primeng';
import { environment } from 'src/environments/environment';

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
  showSpinner = false;
  ParamSubscribe: any;
  DisplayDateFormat: any;
  IsSecure: boolean;
  _HasEdit: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    public datepipe: DatePipe
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }
  CheckActiveSession() {
    let sessionActive = false;
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
    }
  }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.IsSecure = false;
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
  }
  /* #endregion */

  /* #region Basic Methods */

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.ClearAllProperties();
    this.IsSecure = true;
    this.showSpinner = false;
    this.Initialisations();
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this._displayCurrent = false;
    this._headerMinorText = '';
    this._payStub = [];
    this._empPayroll = [];
    this.showSpinner = false;
  }

  Initialisations() {
    this.showToggleDisplay('');
  }

  showToggleDisplay(viewCurrent) {
    this.showSpinner = true;
    this.timesysSvc.getEmployeePayroll(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId')).subscribe(
      (data) => {
        if (viewCurrent === '') {
          this._headerMinorText = 'Latest 2011 Pay Stubs';
        } else {
          this._headerMinorText = 'Older 2011 Pay Stubs';
        }
        this._empPayroll = [];
        if (data !== undefined && data !== null && data.length > 0) {
          this._empPayroll = data;
        } else {
          this._headerMinorText = 'You do not have any pay stubs available';
        }
        this.showSpinner = false;
        this.getPayStubsForEmployee(viewCurrent);
      });
  }
  getPayStubsForEmployee(viewCurrent) {
    this.showSpinner = true;
    this._payStub = [];
    const data = [];
    if (data !== undefined && data !== null && data.length > 0) {
      this._payStub = data;
    } else {
      this._headerMinorText = 'You do not have any ' + (viewCurrent === '' ? '' : 'older') + ' pay stubs available';
    }
    this.showSpinner = false;
  }
  showPaystubs(showPayStubs: string) {
    if (showPayStubs === '') {
      this._displayCurrent = true;
    } else {
      this._displayCurrent = false;
    }
    this.showToggleDisplay(showPayStubs);
  }
}
