import { Component, OnInit } from '@angular/core';
import { TimesystemService } from './service/timesystem.service';
import { CommonService } from './service/common.service';
import { Validators } from '@angular/forms';
import { ValidatorHelper } from './sharedpipes/validationhelper.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TimeSystem';
  constructor(public commonSvc: CommonService) {

  }

  ngOnInit() {
    Validators.required = ValidatorHelper.required;
    // this.SetGlobalAppSettings();
  }

  // SetGlobalAppSettings() {
  //   this.timesysSvc.getAppSettings()
  //     .subscribe(
  //       (data) => {
  //         this.commonSvc.setAppSettings(data);
  //       }
  //     );
  // }

}
