import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/primeng';
import { Menu } from 'primeng/components/menu/menu';
import { TimesystemService } from '../service/timesystem.service';
import { MasterPages, LeftNavMenu } from '../model/objects';

declare var jQuery: any;

@Component({
  selector: 'app-master2',
  templateUrl: './master2.component.html',
  styleUrls: ['./master2.component.css']
})
export class Master2Component implements OnInit {
  public visibleHelp = false;
  fullName = 'Welcome';
  title = 'My Master Page...';
  public show = false;
  solutionName = '';

  menuItems: LeftNavMenu[];

  // headerMenu: MenuItem[];
  // menuItems: MenuItem[];
  // miniMenuItems: MenuItem[];
  visibleSidebar = false;
  @ViewChild('bigMenu') bigMenu: Menu;
  @ViewChild('smallMenu') smallMenu: Menu;
  userOptions: any;
  // newmenuItems: MenuItem[];
  submenu: MenuItem[];

  constructor(private router: Router, private timesysSvc: TimesystemService) {

  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {

    this.selectInitialMenuItemBasedOnUrl();
  }

  ngOnInit() {
    if (localStorage.getItem('currentUser') != null && localStorage.getItem('currentUser') !== '') {
      this.fullName = 'Welcome , ' + localStorage.getItem('currentUser');

    }

    const handleSelected = function (event) {
      const allMenus = jQuery(event.originalEvent.target).closest('ul');
      const allLinks = allMenus.find('.menu-selected');

      allLinks.removeClass('menu-selected');
      const selected = jQuery(event.originalEvent.target).closest('a');
      selected.addClass('menu-selected');
    };
    this.getNavItems();

    // this.miniMenuItems = [];
    // this.menuItems.forEach((item: MenuItem) => {
    //   const miniItem = { icon: item.icon, routerLink: item.routerLink, title: item.title };
    //   this.miniMenuItems.push(miniItem);
    // });

  }

  getNavItems() {
    if (localStorage.getItem('UserRole') !== undefined && localStorage.getItem('UserRole') !== null) {
      const handleSelected = function (event) {
        const allMenus = jQuery(event.originalEvent.target).closest('ul');
        const allLinks = allMenus.find('.menu-selected');
        allLinks.removeClass('menu-selected');
        const selected = jQuery(event.originalEvent.target).closest('a');
        selected.addClass('menu-selected');
      };

      this.timesysSvc.getLeftNavMenu(localStorage.getItem('UserRole').toString())
        .subscribe(
          (data) => {
            // this.buildMenu(data);
            console.log('yes');
            this.menuItems = data;
          }
        );

      // switch (localStorage.getItem('UserRole').toString()) {
      //   case 'A':
      //     this.menuItems = [
      //       {
      //         label: 'Dashboard', icon: 'fa fa-tachometer', routerLink: ['/menu/dashboard'],
      //         command: (event) => handleSelected(event), title: 'Dashboard'
      //       },
      //       {
      //         label: 'Employees', icon: 'fa fa-user-circle', routerLink: ['/menu/employees'],
      //         command: (event) => handleSelected(event), title: 'Employees'
      //       },
      //       {
      //         label: 'Holidays', icon: 'fa fa-book', routerLink: ['/menu/holidays'],
      //         command: (event) => handleSelected(event), title: 'Holidays'
      //       },
      //       {
      //         label: 'Companies', icon: 'fa fa-building', routerLink: ['/menu/companies'],
      //         command: (event) => handleSelected(event), title: 'Companies'
      //       },
      //       {
      //         label: 'Billing Codes', icon: 'fa fa-files-o', routerLink: ['/projects'],
      //         command: (event) => handleSelected(event), title: 'Billing Codes'
      //       },
      //       {
      //         label: 'Project', icon: 'fa fa-sticky-note-o', routerLink: ['/menu/projects'],
      //         command: (event) => handleSelected(event), title: 'Project'
      //       },
      //       {
      //         label: 'Non-Billables', icon: 'fa fa-coffee', routerLink: ['/menu/nonbillables'],
      //         command: (event) => handleSelected(event), title: 'Non-Billables'
      //       },
      //       {
      //         label: 'Customers', icon: 'fa fa-users', routerLink: ['/menu/customers'],
      //         command: (event) => handleSelected(event), title: 'Customers'
      //       },
      //       {
      //         label: 'Clients', icon: 'fa fa-user-secret', routerLink: ['/menu/clients'],
      //         command: (event) => handleSelected(event), title: 'Clients'
      //       },
      //       {
      //         label: 'Year End', icon: 'fa fa-calendar', routerLink: ['/menu/user'],
      //         command: (event) => handleSelected(event), title: 'Year End'
      //       },
      //       {
      //         label: 'Email', icon: 'fa fa-envelope', routerLink: ['/menu/user'],
      //         command: (event) => handleSelected(event), title: 'Email'
      //       },
      //       {
      //         label: 'Error Log', icon: 'fa fa-exclamation-triangle', routerLink: ['/menu/user'],
      //         command: (event) => handleSelected(event), title: 'Error Log'
      //       },
      //       {
      //         label: 'Reports', icon: 'fa fa-folder', routerLink: ['/menureports/dashboard'],
      //         command: (event) => handleSelected(event), title: 'Reports'
      //       },
      //       {
      //         label: 'Configuration', icon: 'fa fa-cog', routerLink: ['/menu/configuration'],
      //         command: (event) => handleSelected(event), title: 'Configuration'
      //       },
      //     ];
      //     break;
      //   case 'PM':
      //     this.menuItems = [
      //       {
      //         label: 'Dashboard', icon: 'fa fa-tachometer', routerLink: ['/menu/dashboard'],
      //         command: (event) => handleSelected(event), title: 'Dashboard'
      //       },
      //       {
      //         label: 'Employees', icon: 'fa fa-user-circle', routerLink: ['/inv/invdashboard'],
      //         command: (event) => handleSelected(event), title: 'Employees'
      //       },
      //       {
      //         label: 'Reports', icon: 'fa fa-folder', routerLink: ['/menu/schedule'],
      //         command: (event) => handleSelected(event), title: 'Reports'
      //       },
      //     ];
      //     break;
      //   case 'E':
      //     break;
      //   default:
      //     this.menuItems = [
      //       {
      //         label: 'Dashboard', icon: 'fa fa-tachometer', routerLink: ['/menu/dashboard'],
      //         command: (event) => handleSelected(event), title: 'Dashboard'
      //       },
      //     ];
      //     break;
      // }

      //   this.headerMenu = [
      //     {
      //       label: 'Timesheets', routerLink: ['/inv/invdashboard'],
      //       command: (event) => handleSelected(event), title: 'Employees'
      //     },
      //     {
      //       label: 'Pay Stubs', routerLink: ['/menu/schedule'],
      //       command: (event) => handleSelected(event), title: 'Reports'
      //     },
      //   ];
    }
  }


  logout() {
    this.router.navigate(['']);
  }

  selectInitialMenuItemBasedOnUrl() {
    const path = document.location.pathname;
    const menuItem = this.menuItems.find((item) => item.routeLink[0] === path);
    if (menuItem) {
      const selectedIcon = this.bigMenu.container.querySelector(`.${menuItem.icon}`);
      jQuery(selectedIcon).closest('li').addClass('menu-selected');
    }

  }
  OpenMenu() {
    this.visibleSidebar = true;
  }
  navigateTo() {
    this.router.navigate(['/menu/dashboard']);
  }
  buildMenu(pages: MasterPages[]) {
    console.log(pages);

    // const modules: string[] = new TS.Linq.Enumerator(pages).select(m => m.ModuleName).distinct().toArray();
    // this.newmenuItems = [];
    // for (let i = 0; i < modules.length; i++) {
    //   this.submenu = [];
    //   new TS.Linq.Enumerator(pages).where(m => m.ModuleName === modules[i]).forEach(m => {
    //     this.submenu.push({ label: m.PageName, routerLink: m.Controller.toString() });
    //   });
    //   this.newmenuItems.push({ label: modules[i], items: this.submenu });
  }
}
