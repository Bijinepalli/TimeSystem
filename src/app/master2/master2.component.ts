import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/primeng';
import { Menu } from 'primeng/components/menu/menu';
import { TimesystemService } from '../service/timesystem.service';
import { MasterPages, LeftNavMenu, Employee } from '../model/objects';
import { CommonService } from '../service/common.service';

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

  constructor(
    private router: Router,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    private msgSvc: MessageService) {

  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.selectInitialMenuItemBasedOnUrl();
  }

  ngOnInit() {
    this.Initialisations();
  }

  Initialisations() {
    this.menuItems = [];
    this.fullName = 'Hello';

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
      this.fullName = 'Hello , ' + localStorage.getItem('currentUser');
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
            this.dashboard = [{ label: 'Dashboard', routerLink: '/menu/dashboard' },
            { label: 'Timesheets', routerLink: '/menu/dashboard' },
            { label: 'Pay Stubs', routerLink: '/menu/dashboard' }
            ];
            // console.log(JSON.stringify(this.menuItems));
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
