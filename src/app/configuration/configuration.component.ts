import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
  ParamSubscribe: any;
  IsSecure: boolean;
  showSpinner: boolean;
  _HasEdit: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
  ) {

  }
  ngOnInit() { }

  //   {
  //   this.CheckActiveSession();
  //   this.commonSvc.setAppSettings();
  // }
  // CheckActiveSession() {
  //   let sessionActive = false;
  //   if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
  //     if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
  //       sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
  //       sessionActive = true;
  //     }
  //   }

  //   if (!sessionActive) {
  //     this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
  //   }
  // }
  // /* #endregion*/

  // /* #region Page Life Cycle Methods*/
  // // tslint:disable-next-line:use-life-cycle-interface
  // ngOnDestroy() {
  //   this.ParamSubscribe.unsubscribe();
  // }

  // ngOnInit() {
  //   this.showSpinner = true;
  //   this.IsSecure = false;
  //   this.ParamSubscribe = this.route.queryParams.subscribe(params => {
  //     if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
  //       const SplitVals = params['Id'].toString().split('@');
  //       this.CheckSecurity(SplitVals[SplitVals.length - 1]);
  //     } else {
  //       this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
  //     }
  //   });
  // }

  // CheckSecurity(PageId: string) {
  //   this.showSpinner = true;
  //   this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
  //     .subscribe((data) => {
  //       this.showSpinner = false;
  //       if (data !== undefined && data !== null && data.length > 0) {
  //         this.ClearAllProperties();
  //         if (data[0].HasEdit) {
  //           this._HasEdit = false;
  //         }
  //         this.IsSecure = true;
  //         this.Initialisations();
  //       } else {
  //         this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
  //       }
  //     });
  // }

  // ClearAllProperties() {
  // }
  // Initialisations() {

  // }
}
