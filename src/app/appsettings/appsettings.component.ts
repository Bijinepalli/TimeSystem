import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AppSettings } from '../model/objects';
import { checkAndUpdateBinding } from '@angular/core/src/view/util';
@Component({
  selector: 'app-appsettings',
  templateUrl: './appsettings.component.html',
  styleUrls: ['./appsettings.component.css']
})
export class AppsettingsComponent implements OnInit {

  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService, private fb: FormBuilder) { }
  _appsettings: AppSettings[] = [];
  _recData: any;
  cols: any;
  _appsettingsselection: string[];
  _appsettingInsert: AppSettings[] = [];

  appSettingsFormGroup = new FormGroup({});

  ngOnInit() {
    this.getAppSettings();
    this.cols = [
      { field: 'Type', header: 'Type' },
      { field: 'DataKey', header: 'Data Key' },
      { field: 'Value', header: 'Value' },
      { field: 'Description', header: 'Description' },
    ];

  }

  hasFormErrors() {
    return !this.appSettingsFormGroup.valid;
  }
  getAppSettings() {
    this.timesysSvc.getAppSettings()
      .subscribe(
        (data) => {
          this._appsettings = data;
          this._recData = data.length + ' AppSettings found';
          this.addformcontrols();
        }
      );
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
  onSubmit() {
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
    this.timesysSvc.updateAppSettings(this._appsettingInsert).subscribe(data => {
      this._appsettingInsert = [];
      this._appsettingsselection = [];
      this.getAppSettings();
    });

  }
  CancelClick() {
    this._appsettingInsert = [];
    this._appsettingsselection = [];
    this.getAppSettings();
  }

}
