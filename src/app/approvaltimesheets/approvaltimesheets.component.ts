import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet, TimeSheetForApproval } from '../model/objects';

@Component({
  selector: 'app-approvaltimesheets',
  templateUrl: './approvaltimesheets.component.html',
  styleUrls: ['./approvaltimesheets.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class ApprovaltimesheetsComponent implements OnInit {

  _approvals: TimeSheetForApproval[];
  cols: any;
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private datePipe: DatePipe, private decimal: DecimalPipe, private commonSvc: CommonService) {


  }

  ngOnInit() {
    console.log(localStorage.getItem('UserId'));
    this.timesysSvc.getTimeSheetForApprovalGet(localStorage.getItem('UserId')).subscribe(
      (data) => {
        this._approvals = data;
        console.log(this._approvals);
        this.cols = [
          { field: 'PeriodEnd', header: 'Period Ending' },
          { field: 'EmployeeName', header: 'Employee Name' },
          { field: 'CreatedOn', header: 'Created On' },
        ];
      });
  }
  approveTimeSheet(timeSheet: TimeSheetForApproval) {
    // this.confSvc.confirm({
    //   message: 'Do you want to approve the timesheet?',
    //   accept: () => {
    this.router.navigate(['/menu/maintaintimesheet/' + timeSheet.TimesheetId]);
    //   }
    // });
  }

}
