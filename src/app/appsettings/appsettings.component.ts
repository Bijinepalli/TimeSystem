import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AppSettings, PageNames } from '../model/objects';
import { checkAndUpdateBinding } from '@angular/core/src/view/util';
import { DatePipe } from '@angular/common';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { ActivitylogService } from '../service/activitylog.service'; // ActivityLog - Default

@Component({
  selector: 'app-appsettings',
  templateUrl: './appsettings.component.html',
  styleUrls: ['./appsettings.component.css']
})
export class AppsettingsComponent implements OnInit {

  ParamSubscribe: any;
  IsSecure: boolean;

  _appsettings: AppSettings[] = [];
  _recData: any;
  cols: any;
  _appsettingsselection: string[];
  _appsettingInsert: AppSettings[] = [];
  showSpinner = false;

  appSettingsFormGroup = new FormGroup({});
  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    public commonSvc: CommonService,
    private route: ActivatedRoute,
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
    this.IsSecure = false;
    this.logSvc.ActionLog(PageNames.Configuration,
      'App Settings', 'Pages', 'OnInit', 'Initialisation', '', '{"PhysicalPath":"app/appsettings"}', ''); // ActivityLog
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
  }

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  Initialisations() {
    this.getAppSettings();
    this.cols = [
      { field: 'Type', header: 'Type' },
      { field: 'DataKey', header: 'Data Key' },
      { field: 'Value', header: 'Value' },
      { field: 'Description', header: 'Description' },
    ];
  }
  getAppSettings() {
    this.showSpinner = true;
    this.timesysSvc.getAppSettings()
      .subscribe(
        (data) => {
          this._appsettings = data;
          this._recData = data.length + ' appSettings found';
          this.addformcontrols();
          this.showSpinner = false;
        }
      );
  }
  ClearAllProperties() {
    this.showSpinner = true;
    this._appsettings = [];
    this._recData = '';
    this.cols = {};
    this._appsettingsselection = [];
    this._appsettingInsert = [];
    this.showSpinner = false;
  }

  hasFormErrors() {
    return !this.appSettingsFormGroup.valid;
  }
  getRowColor(r: number) {
    if (r % 2 === 0) {
      return 'RowColor';
    } else {
      return 'altRowColor';
    }
  }

  addformcontrols() {
    this.appSettingsFormGroup = new FormGroup({});
    this._appsettingsselection = [];
    for (let i = 0; i < this._appsettings.length; i++) {
      this.appSettingsFormGroup.addControl('chkAppSetting_' + this._appsettings[i].Id, new FormControl(null, null));
      // tslint:disable-next-line:max-line-length
      this.appSettingsFormGroup.addControl('txtAppSettingVal_' + this._appsettings[i].Id, new FormControl({ value: null, disabled: true }, null));
      // tslint:disable-next-line:max-line-length
      this.appSettingsFormGroup.addControl('hdnAppSettingVal_' + this._appsettings[i].Id, new FormControl({ value: this._appsettings[i].Value }, null));
    }
  }

  toggleControls(id: string) {
    let chk: boolean;

    chk = this.appSettingsFormGroup.get('chkAppSetting_' + id).value;
    this.appSettingsFormGroup.controls['txtAppSettingVal_' + id].enable();
    // tslint:disable-next-line:max-line-length
    this.appSettingsFormGroup.controls['txtAppSettingVal_' + id].setValue(this.appSettingsFormGroup.controls['hdnAppSettingVal_' + id].value);

    if (chk === true) {
      this._appsettingsselection.push(id);
      this.appSettingsFormGroup.controls['chkAppSetting_' + id].setValue(true);
    } else {
      const idx = this._appsettingsselection.indexOf(id);
      if (idx !== -1) {
        return this._appsettingsselection.splice(idx, 1);
      }
      this.appSettingsFormGroup.controls['chkAppSetting_' + id].setValue(false);
      this.appSettingsFormGroup.controls['txtAppSettingVal_' + id].disable();
    }
  }
  saveAppSettings() {
    this.showSpinner = true;
    let appsettings = new AppSettings();

    for (let i = 0; i < this._appsettingsselection.length; i++) {
      appsettings = new AppSettings();
      const _Id = this._appsettingsselection[i];
      const chk = this.appSettingsFormGroup.controls['chkAppSetting_' + _Id];
      const txt = this.appSettingsFormGroup.controls['txtAppSettingVal_' + _Id];

      appsettings.Id = +_Id;
      appsettings.Value = txt.value;
      appsettings.DataKey = '';
      appsettings.Description = '';
      appsettings.Type = '';

      this._appsettingInsert.push(appsettings);
    }
    this.logSvc.ActionLog(PageNames.Configuration,
      'App Settings', 'Pages/Event', 'saveAppSettings', 'Save AppSettings', '', '{"PhysicalPath":"app/appsettings"}', JSON.stringify(this._appsettingInsert)); // ActivityLog
    this.timesysSvc.updateAppSettings(this._appsettingInsert).subscribe(data => {
      this.showSpinner = false;
      if (data != null && data[0].Id > 0) {
        this._appsettingInsert = [];
        this._appsettingsselection = [];
        this.getAppSettings();
        this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Saved Successfully' });
        this.confSvc.confirm({
          message: 'Do you want to see the changes in action right away by logging in again?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            /* do nothing */
            this.router.navigate(['']);
          },
          reject: () => {
            /* do nothing */
          }
        });

      } else {
        this.msgSvc.add({ key: 'saveSuccess', severity: 'warn', summary: 'Info Message', detail: 'An Error Occurred' });
      }
    });

  }
  CancelClick() {
    this._appsettingInsert = [];
    this._appsettingsselection = [];
    this.getAppSettings();
  }

}
