import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/primeng';
import { Menu } from 'primeng/components/menu/menu';
import { TimesystemService } from '../service/timesystem.service';
import { MasterPages, LeftNavMenu, Employee, AppSettings } from '../model/objects';

declare var jQuery: any;

@Component({
  selector: 'app-master2',
  templateUrl: './master2.component.html',
  styleUrls: ['./master2.component.css']
})
export class Master2Component implements OnInit {

  @ViewChild('bigMenu') bigMenu: Menu;
  @ViewChild('smallMenu') smallMenu: Menu;

  public visibleHelp = false;
  public show = false;
  fullName = 'Welcome';
  title = 'My Master Page...';
  solutionName = '';

  menuItems: MenuItem[];
  submenu: MenuItem[];
  visibleSidebar = false;

  userOptions: any;
  changePasswordDialog = false;
  EmployeeData: Employee[];
  passwordExpiry = '';
  appSettings: AppSettings[];

  constructor(private router: Router, private timesysSvc: TimesystemService) {

  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.selectInitialMenuItemBasedOnUrl();
  }

  ngOnInit() {
    this.GetAppSettings();
    this.Initialisations();
  }


  GetAppSettings() {
    this.appSettings = [];
    this.timesysSvc.getAppSettings()
      .subscribe(
        (data) => {
          this.appSettings = data;
        }
      );
  }
  GetAppSettingsValue(DataKey: string): any {
    let AppSettingsValue = '';
    if (this.appSettings !== undefined && this.appSettings !== null && this.appSettings.length > 0) {
      const AppsettingsVal: AppSettings = this.appSettings.find(m => m.DataKey === DataKey);
      if (AppsettingsVal !== undefined && AppsettingsVal !== null) {
        AppSettingsValue = AppsettingsVal.Value;
      }
    }
    return AppSettingsValue;
  }

  Initialisations() {
    this.menuItems = [];
    this.fullName = 'Welcome';

    const validateUser: boolean = this.getUserDetails();
    if (validateUser) {
      const isAuthorised: boolean = this.CheckAuthorisation();
      if (isAuthorised) {

      }
    }
    this.getNavItems();
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
      localStorage.getItem('currentUser') !== '') {
      this.fullName = 'Welcome , ' + localStorage.getItem('currentUser');
    }
  }

  getPasswordExpiry() {
    this.timesysSvc.getEmployee(localStorage.getItem('UserId').toString(), '', '')
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this.EmployeeData = data;
            // const PasswordLastUpdatedDays = this.EmployeeData[0].LastUpdatedDays;
            // if (PasswordLastUpdatedDays !== undefined && PasswordLastUpdatedDays !== null) {
            //   const PasswordExpiryDays = this.GetAppSettingsValue('PasswordExpiryDays');
            //   const ExpiryDays = +PasswordExpiryDays - PasswordLastUpdatedDays;
            const ExpiryDays = 0;
            if (ExpiryDays > 0) {
              this.passwordExpiry = 'Your password will expire in ' + (ExpiryDays).toString() + ' days.';
            } else {
              if (ExpiryDays === 0) {
                this.passwordExpiry = 'Your password expires today.';
              } else {
                this.logout();
              }
            }
            // } else {
            //   this.logout();
            // }
          }
        }
      );
  }

  getNavItems() {
    if (localStorage.getItem('UserRole') !== undefined && localStorage.getItem('UserRole') !== null) {
      const handleSelected = function (event) {
        const allMenus = jQuery(event.originalEvent.target).closest('ul');
        if (allMenus !== null && allMenus.length > 0) {
          const allLinks = allMenus.find('.menu-selected');
          if (allLinks !== null && allLinks.length > 0) {
            allLinks.removeClass('menu-selected');
          }
          const selected = jQuery(event.originalEvent.target).closest('a');
          if (selected !== null && selected.length > 0) {
            selected.addClass('menu-selected');
          }
        }
      };
      this.timesysSvc.getLeftNavMenu(localStorage.getItem('UserRole').toString())
        .subscribe(
          (data) => {
            this.menuItems = data;
          });
    }
  }

  selectInitialMenuItemBasedOnUrl() {
    const path = document.location.pathname;
    if (this.menuItems !== undefined && this.menuItems !== null && this.menuItems.length > 0) {
      const menuItem = this.menuItems.find((item) => item.routerLink[0] === path);
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

  OpenMenu() {
    this.visibleSidebar = true;
  }

  logout() {
    this.router.navigate(['']);
  }

  navigateTo() {
    this.router.navigate(['/menu/dashboard']);
  }

  changePasswordClick() {
    this.changePasswordDialog = true;
  }

}
