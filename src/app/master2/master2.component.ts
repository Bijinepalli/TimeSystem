import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/primeng';
import { Menu } from 'primeng/components/menu/menu';
import { TimesystemService } from '../service/timesystem.service';
import { LeftNavMenu, Employee } from '../model/objects';
import { CommonService } from '../service/common.service';
import { DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';

declare var jQuery: any;

@Component({
  selector: 'app-master2',
  templateUrl: './master2.component.html',
  styleUrls: ['./master2.component.css'],
  providers: [DatePipe],
})
export class Master2Component implements OnInit {

  @ViewChild('bigMenu') bigMenu: Menu;
  @ViewChild('bigMenu2') bigMenu2: Menu;
  @ViewChild('smallMenu') smallMenu: Menu;

  public visibleHelp = false;
  public show = false;
  BuildType = '';

  fullName = 'Hello';
  title = 'My Master Page...';
  solutionName = '';

  menuItems: MenuItem[];
  dashboard: MenuItem[];
  submenu: MenuItem[];
  visibleSidebar = false;

  userOptions: any;
  changePasswordDialog = false;
  changePasswordButtonClass = 'ui-button-success';
  EmployeeData: Employee[];
  passwordExpiry = '';

  helpText: string;
  loginTime: string;

  constructor(
    private router: Router,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    private datePipe: DatePipe,
  ) { }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    // this.selectInitialMenuItemBasedOnUrl(-1);
  }

  ngOnInit() {
    this.Initialisations();
  }

  Initialisations() {
    this.menuItems = [];
    this.fullName = 'Hello';
    this.BuildType = environment.buildType;
    const validateUser: boolean = this.getUserDetails();
    if (validateUser) {
      const isAuthorised: boolean = this.CheckAuthorisation();
      if (isAuthorised) {

      }
    }
    this.getNavItems();
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };
  }

  CheckAuthorisation(): boolean {
    return true;
  }

  getUserDetails(): boolean {
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString() !== '') {
      this.getUserName();
      this.getPasswordExpiry();
      return true;
    } else {
      return false;
    }
  }

  getUserName() {
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser') !== undefined &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser') !== null &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser').toString() !== '') {
      this.fullName = 'Hello ' + sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser').toString();
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'PayRollName') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'PayRollName') !== null &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'PayRollName').toString() !== '') {
        this.fullName += ' (' + sessionStorage.getItem(environment.buildType.toString() + '_' + 'PayRollName').toString() + ') ';
      }
      this.loginTime = this.datePipe.transform(Date(), 'EEEE, MMMM dd, yyyy');
    }
  }

  getPasswordExpiry() {
    this.timesysSvc.getEmployee(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString(), '', '')
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this.EmployeeData = data;
            const PasswordLastUpdatedDays = this.EmployeeData[0].LastUpdatedDays;
            if (PasswordLastUpdatedDays !== undefined && PasswordLastUpdatedDays !== null) {
              const PasswordExpiryDays = this.commonSvc.getAppSettingsValue('PasswordExpiryDays');
              const ExpiryDays = +PasswordExpiryDays - PasswordLastUpdatedDays;
              if (ExpiryDays > 0) {
                this.passwordExpiry = 'Your password will expire in ' + (ExpiryDays).toString() + ' days.';
                if (ExpiryDays > ((+PasswordExpiryDays) / 2)) {
                  // this.changePasswordButtonClass = 'ui-button-info';
                } else {
                  // this.changePasswordButtonClass = 'ui-button-warning';
                }
              } else {
                if (ExpiryDays === 0) {
                  this.passwordExpiry = 'Your password expires today.';
                  // this.changePasswordButtonClass = 'ui-button-danger';
                } else {
                  this.logout();
                }
              }
            }
          }
        }
      );
  }

  getNavItems() {
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole') !== undefined &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole') !== null) {
      this.timesysSvc.getLeftNavMenu(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), '0')
        .subscribe(
          (data) => {
            // this.menuItems=data;
            this.buildMenuItems(data);
            if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime') !== undefined &&
              sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime') !== null &&
              sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime').toString() !== '' &&
              sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime').toString() === 'false'
            ) {
              this.dashboard = [{
                label: 'Dashboard', queryParams: { Id: -1 }, command: (event) => this.navigateByRoute(event, '/menu/dashboard')
              },
              { label: 'Pay Stubs', queryParams: { Id: -3 }, command: (event) => this.navigateByRoute(event, '/menu/paystubs') }
              ];
            } else {
              this.dashboard = [{
                label: 'Dashboard', queryParams: { Id: -1 }, command: (event) => this.navigateByRoute(event, '/menu/dashboard')
              },
              { label: 'Timesheets', queryParams: { Id: -2 }, command: (event) => this.navigateByRoute(event, '/menu/timesheets') },
              { label: 'Pay Stubs', queryParams: { Id: -3 }, command: (event) => this.navigateByRoute(event, '/menu/paystubs') }
              ];
            }
            this.selectInitialMenuItemBasedOnUrl(-1);
          });
    }
  }


  buildMenuItems(data: LeftNavMenu[]) {
    this.menuItems = [];
    this.buildSubMenus(this.menuItems, data);
  }

  buildSubMenus(menuItem: MenuItem[], data: LeftNavMenu[]) {
    for (let cnt = 0; cnt < data.length; cnt++) {
      if (data[cnt].items !== undefined && data[cnt].items !== null && data[cnt].items.length > 0) {
        let submenuItems: MenuItem[];
        submenuItems = [];
        this.buildSubMenus(submenuItems, data[cnt].items);
        if (data[cnt].routerLink !== undefined && data[cnt].routerLink !== null && data[cnt].routerLink !== '') {
          menuItem.push({
            label: data[cnt].label,
            queryParams: data[cnt].queryParams,
            items: submenuItems,
            command: (event) => this.navigateByRoute(event, data[cnt].routerLink),
          });
        } else {
          menuItem.push({
            label: data[cnt].label,
            queryParams: data[cnt].queryParams,
            items: submenuItems
          });
        }
      } else {
        if (data[cnt].routerLink !== undefined && data[cnt].routerLink !== null && data[cnt].routerLink !== '') {
          menuItem.push({
            label: data[cnt].label,
            queryParams: data[cnt].queryParams,
            command: (event) => this.navigateByRoute(event, data[cnt].routerLink)
          });
        } else {
          menuItem.push({
            label: data[cnt].label,
            queryParams: data[cnt].queryParams
          });
        }
      }
    }
  }

  navigateByRoute(event, path) {
    let queryParamsNew: any;
    queryParamsNew = {};
    const _np = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
    if (event.item.queryParams !== undefined && event.item.queryParams !== null) {
      queryParamsNew = { Id: event.item.queryParams.Id, TS: _np };
    } else {
      queryParamsNew = { Id: -999, TS: _np };
    }
    this.router.navigate([path], { queryParams: queryParamsNew, skipLocationChange: true });
    this.selectInitialMenuItemBasedOnUrl(queryParamsNew.Id);
  }

  selectInitialMenuItemBasedOnUrl(Id) {
    let MainCnt = 0;
    if (this.bigMenu !== undefined && this.bigMenu !== null) {
      if (this.bigMenu.model !== undefined && this.bigMenu.model !== null && this.bigMenu.model.length > 0) {
        this.bigMenu.model.forEach(sm => {
          if (sm !== undefined && sm !== null) {
            sm.expanded = false;
            sm.styleClass = '';
            if (sm.queryParams.Id === Id) {
              sm.expanded = true;
              sm.styleClass = 'ActiveRouteLink';
              MainCnt++;
            }
          }
        });
      }
    }

    if (this.bigMenu2 !== undefined && this.bigMenu2 !== null) {
      if (this.bigMenu2.model !== undefined && this.bigMenu2.model !== null && this.bigMenu2.model.length > 0) {
        this.bigMenu2.model.forEach(m => {
          if (m !== undefined && m !== null) {
            if (MainCnt > 0) {
              m.expanded = false;
            }
            if (m.items !== undefined && m.items !== null && m.items.length > 0) {
              for (let cnt = 0; cnt < m.items.length; cnt++) {
                let smm: any;
                smm = m.items[cnt];
                smm.expanded = false;
                smm.styleClass = '';
                if (m.expanded === true) {
                  if (smm.queryParams.Id === Id) {
                    smm.expanded = true;
                    smm.styleClass = 'ActiveRouteLink';
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  OpenMenu() {
    this.visibleSidebar = true;
  }

  logout() {
    this.router.navigate([''], { skipLocationChange: true });
  }

  navigateTo() {
    this.selectInitialMenuItemBasedOnUrl(-1);
    this.router.navigate(['/menu/dashboard'], { skipLocationChange: true });
  }

  changePasswordClick() {
    this.changePasswordDialog = true;
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

  goto() {
    window.alert('123');
    window.location.href = 'http://www.cnn.com/';
  }

  onReject() {
    this.msgSvc.clear('alert');
  }
}
