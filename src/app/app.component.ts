import { Component, OnInit } from '@angular/core';
import { TimesystemService } from './service/timesystem.service';
import { CommonService } from './service/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TimeSystem';
  constructor( private commonSvc: CommonService) {

  }

  ngOnInit() {
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
