import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';

const DEFAULT_COLORS = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
  '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E',
  '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC',
  '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC'];

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {


  _NavItems: string[] = ['Dashboard'];

  constructor(private router: Router, private msgSvc: MessageService) { }

  ngOnInit() {
    this.getNavItems();
  }

  getNavItems() {
    this._NavItems = ['Dashboard'];
    if (localStorage.getItem('UserRole') !== undefined && localStorage.getItem('UserRole') !== null) {
      switch (localStorage.getItem('UserRole').toString()) {
        case 'Admin':
          this._NavItems = ['Dashboard', 'Employees', 'Holidays', 'Companies', 'Billing Codes',
            'Project', 'Non-Billables', 'Customers', 'Clients', 'Year End', 'Email', 'Error Log', 'Reports', 'Configuration'];
          break;
        case 'PM':
          this._NavItems = ['Dashboard', 'Employees', 'Reports'];
          break;
        case 'Employee':
          break;
        default:
          this._NavItems = ['Dashboard'];
          break;
      }
    }
  }

  navigateTo(url: any) {
    this.router.navigate([url], { skipLocationChange: true });
  }

  logout() {
    localStorage.clear();
    this.router.navigate([''], { skipLocationChange: true });
  }

  onReject() {
    this.msgSvc.clear('alert');
  }

}
