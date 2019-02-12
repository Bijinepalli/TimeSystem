import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  ) {

  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    // this.selectInitialMenuItemBasedOnUrl();
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
    if (localStorage.getItem('UserId') !== undefined &&
      localStorage.getItem('UserId') !== null &&
      localStorage.getItem('UserId').toString() !== '') {
      this.getUserName();
      this.getPasswordExpiry();
      return true;
    } else {
      return false;
    }
  }

  getUserName() {
    if (localStorage.getItem('currentUser') !== undefined &&
      localStorage.getItem('currentUser') !== null &&
      localStorage.getItem('currentUser').toString() !== '') {
      this.fullName = 'Hello ' + localStorage.getItem('currentUser').toString();
      if (localStorage.getItem('PayRollName') !== undefined &&
        localStorage.getItem('PayRollName') !== null &&
        localStorage.getItem('PayRollName').toString() !== '') {
        this.fullName += ' (' + localStorage.getItem('PayRollName').toString() + ') ';
      }
      this.loginTime = this.datePipe.transform(Date(), 'EEEE, MMMM dd, yyyy');
    }
  }

  getPasswordExpiry() {
    this.timesysSvc.getEmployee(localStorage.getItem('UserId').toString(), '', '')
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
    if (localStorage.getItem('UserRole') !== undefined && localStorage.getItem('UserRole') !== null) {
      this.timesysSvc.getLeftNavMenu(localStorage.getItem('UserRole').toString(), '0')
        .subscribe(
          (data) => {
            // this.menuItems=data;
            this.buildMenuItems(data);
            if (localStorage.getItem('SubmitsTime') !== undefined &&
              localStorage.getItem('SubmitsTime') !== null &&
              localStorage.getItem('SubmitsTime').toString() !== '' &&
              localStorage.getItem('SubmitsTime').toString() === 'false'
            ) {
              this.dashboard = [{
                label: 'Dashboard', command: (event) => this.navigateByRoute(event, '/menu/dashboard')
              },
              { label: 'Pay Stubs', command: (event) => this.navigateByRoute(event, '/menu/paystubs') }
              ];
            } else {
              this.dashboard = [{
                label: 'Dashboard', command: (event) => this.navigateByRoute(event, '/menu/dashboard')
              },
              { label: 'Timesheets', command: (event) => this.navigateByRoute(event, '/menu/timesheets') },
              { label: 'Pay Stubs', command: (event) => this.navigateByRoute(event, '/menu/paystubs') }
              ];
              // this.selectInitialMenuItemBasedOnUrl();
            }
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
            command: (event) => this.navigateByRoute(event, data[cnt].routerLink)
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
      queryParamsNew = { TS: _np };
    }
    this.router.navigate([path], { queryParams: queryParamsNew, skipLocationChange: true });
  }

  selectInitialMenuItemBasedOnUrl() {
    const path = document.location.pathname;
    if (this.menuItems !== undefined && this.menuItems !== null && this.menuItems.length > 0) {
      let menuItem = this.getSelectedMenuItem(path, this.menuItems);
      if (menuItem !== undefined && menuItem !== null) {
      } else {
        for (let cnt = 0; cnt < this.menuItems.length; cnt++) {
          if (this.menuItems[cnt].items !== undefined && this.menuItems[cnt].items !== null && this.menuItems[cnt].items.length > 0) {
            menuItem = this.getSelectedMenuItem(path, this.menuItems[cnt].items);
            if (menuItem !== undefined && menuItem !== null) {
              break;
            }
          }
        }
      }
      if (menuItem !== undefined && menuItem !== null) {
        if (this.bigMenu !== undefined &&
          this.bigMenu !== null &&
          this.bigMenu.container !== undefined &&
          this.bigMenu.container !== null) {

          const selectedIcon = this.bigMenu.container.querySelector(`.${menuItem.icon}`);
          if (selectedIcon !== undefined && selectedIcon !== null) {
            const menuselected = jQuery(selectedIcon).closest('li');
            if (selectedIcon !== undefined && selectedIcon !== null) {
              menuselected.addClass('menu-selected');
            }
          }
        }
      }
    }
  }

  getSelectedMenuItem(path: string, menuItems: any): any {
    return menuItems.find((item) =>
      item.routerLink !== undefined &&
      item.routerLink !== null &&
      item.routerLink === path);
  }



  OpenMenu() {
    this.visibleSidebar = true;
  }

  logout() {
    this.router.navigate([''], { skipLocationChange: true });
  }

  navigateTo() {
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
