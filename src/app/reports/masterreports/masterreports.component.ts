import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/primeng';
import { Menu } from 'primeng/components/menu/menu';
import { environment } from 'src/environments/environment';
import { ActivitylogService } from 'src/app/service/activitylog.service';

declare var jQuery: any;

@Component({
  selector: 'app-masterreports',
  templateUrl: './masterreports.component.html',
  styleUrls: ['./masterreports.component.css']
})
export class MasterreportsComponent implements OnInit {
  public visibleHelp = false;
  fullName = 'Welcome';
  title = 'My Master Page...';
  public show = false;
  solutionName = '';


  headerMenu: MenuItem[];
  menuItems: MenuItem[];
  miniMenuItems: MenuItem[];
  visibleSidebar = false;
  @ViewChild('bigMenu') bigMenu: Menu;
  @ViewChild('smallMenu') smallMenu: Menu;
  userOptions: any;

  constructor(
    private router: Router,
    private logSvc: ActivitylogService, // ActivityLog - Default
  ) { }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {

    this.selectInitialMenuItemBasedOnUrl();
  }

  ngOnInit() {
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser') != null &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser') !== '') {
      this.fullName = 'Welcome , ' + sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser');

    }

    const handleSelected = function (event) {
      const allMenus = jQuery(event.originalEvent.target).closest('ul');
      const allLinks = allMenus.find('.menu-selected');

      allLinks.removeClass('menu-selected');
      const selected = jQuery(event.originalEvent.target).closest('a');
      selected.addClass('menu-selected');
    };
    this.getNavItems();

    this.miniMenuItems = [];
    this.menuItems.forEach((item: MenuItem) => {
      const miniItem = { icon: item.icon, routerLink: item.routerLink, title: item.title };
      this.miniMenuItems.push(miniItem);
    });

  }

  getNavItems() {
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole') !== undefined &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole') !== null) {
      const handleSelected = function (event) {
        const allMenus = jQuery(event.originalEvent.target).closest('ul');
        const allLinks = allMenus.find('.menu-selected');
        allLinks.removeClass('menu-selected');
        const selected = jQuery(event.originalEvent.target).closest('a');
        selected.addClass('menu-selected');
      };
      switch (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString()) {
        case 'A':
          this.menuItems = [
            {
              label: 'Billing Code Related',
              items: [
                { label: 'List Client, Project, Non-Billable Items', icon: 'pi pi-fw pi-plus' },
                { label: 'Employee Hours by Billing Code', icon: 'pi pi-fw pi-folder' },
                { label: 'Employees by Billing Code', icon: 'pi pi-fw pi-folder' },
                { label: 'Hours by Employee', icon: 'pi pi-fw pi-clock' },
                { label: 'Weekly Hours by Employee', icon: 'pi pi-fw pi-calendar-plus' },
                { label: 'Unused Billing Codes', icon: 'pi pi-fw pi-folder' },
                { label: 'Holidays', icon: 'pi pi-fw pi-calendar' },
                { label: 'Non-Billable Hours Across Months', icon: 'pi pi-fw pi-calendar-minus' },
                { label: 'Billable Hours by Client or Project', icon: 'pi pi-fw pi-dollar' }
              ]
            },
            {
              label: 'Timesheet Related',
              items: [
                { label: 'Employee Timesheets', icon: 'pi pi-fw pi-user-plus' },
                { label: 'Hours by Timesheet Category', icon: 'pi pi-fw pi-user-minus' },
                { label: 'Payroll', icon: 'pi pi-fw pi-user-plus' },
                { label: 'Period End Hours', icon: 'pi pi-fw pi-user-minus' },
                { label: 'Outstanding Timesheets', icon: 'pi pi-fw pi-user-plus' },
              ]
            },
            {
              label: 'Employee Related',
              items: [
                { label: 'List Employees', icon: 'pi pi-fw pi-user-plus' },
                { label: 'Employee Hours', icon: 'pi pi-fw pi-user-minus' },
                { label: 'Employee Login Data', icon: 'pi pi-fw pi-user-minus' }
              ]
            },
            {
              label: 'Invoice Related',
              items: [
                { label: 'Invoice Data by Customer', icon: 'pi pi-fw pi-user-plus' },
                { label: 'Employee - Billing Code Rates', icon: 'pi pi-fw pi-user-minus' },
              ]
            }];
          break;
        case 'PM':
          this.menuItems = [
            {
              label: 'Dashboard', icon: 'fa fa-tachometer', routerLink: ['/menu/dashboard'], queryParams: { Id: -1 },
              command: (event) => handleSelected(event), title: 'Dashboard'
            },
            {
              label: 'Employees', icon: 'fa fa-user-circle', routerLink: ['/inv/invdashboard'],
              command: (event) => handleSelected(event), title: 'Employees'
            },
            {
              label: 'Reports', icon: 'fa fa-folder', routerLink: ['/menu/schedule'],
              command: (event) => handleSelected(event), title: 'Reports'
            },
          ];
          break;
        case 'E':
          break;
        default:
          this.menuItems = [
            {
              label: 'Dashboard', icon: 'fa fa-tachometer', routerLink: ['/menu/dashboard'], queryParams: { Id: -1 },
              command: (event) => handleSelected(event), title: 'Dashboard'
            },
          ];
          break;
      }

      this.headerMenu = [
        {
          label: 'Timesheets', routerLink: ['/inv/invdashboard'],
          command: (event) => handleSelected(event), title: 'Employees'
        },
        {
          label: 'Pay Stubs', routerLink: ['/menu/schedule'],
          command: (event) => handleSelected(event), title: 'Reports'
        },
      ];
    }
  }


  logout() {
    this.router.navigate([''], { skipLocationChange: true });
  }

  selectInitialMenuItemBasedOnUrl() {
    const path = document.location.pathname;
    const menuItem = this.menuItems.find((item) => item.routerLink[0] === path);
    if (menuItem) {
      const selectedIcon = this.bigMenu.container.querySelector(`.${menuItem.icon}`);
      jQuery(selectedIcon).closest('li').addClass('menu-selected');
    }

  }
  OpenMenu() {
    this.visibleSidebar = true;
  }
  navigateTo() {
    this.router.navigate(['/menu/dashboard'], { queryParams: { Id: -1 }, skipLocationChange: true });
  }
}
