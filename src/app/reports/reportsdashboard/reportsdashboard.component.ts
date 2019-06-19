import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivitylogService } from 'src/app/service/activitylog.service';
import { PageNames } from 'src/app/model/objects';

@Component({
  selector: 'app-reportsdashboard',
  templateUrl: './reportsdashboard.component.html',
  styleUrls: ['./reportsdashboard.component.css']
})
export class ReportsdashboardComponent implements OnInit {

  constructor(
    private logSvc: ActivitylogService, // ActivityLog - Default
  ) { }

  ReportCategories: MenuItem[];

  ngOnInit() {
    this.logSvc.ActionLog(PageNames.ReportsDashboard, '', 'Fine', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
    this.ReportCategories = [
      {
        label: 'Billing Code Related',
        items: [
          { label: 'List Client, Project, Non-Billable Items', icon: 'pi pi-fw pi-plus' },
          { label: 'Employee Hours by Billing Code', icon: 'pi pi-fw pi-download' },
          { label: 'Employees by Billing Code', icon: 'pi pi-fw pi-download' },
          { label: 'Hours by Employee', icon: 'pi pi-fw pi-download' },
          { label: 'Weekly Hours by Employee', icon: 'pi pi-fw pi-download' },
          { label: 'Unused Billing Codes', icon: 'pi pi-fw pi-download' },
          { label: 'Holidays', icon: 'pi pi-fw pi-download' },
          { label: 'Non-Billable Hours Across Months', icon: 'pi pi-fw pi-download' },
          { label: 'Billable Hours by Client or Project', icon: 'pi pi-fw pi-download' }
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
          { label: 'Employee - Client Rates', icon: 'pi pi-fw pi-user-minus' },
        ]
      }];

  }

}
