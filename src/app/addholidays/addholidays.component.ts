import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-addholidays',
  templateUrl: './addholidays.component.html',
  styleUrls: ['./addholidays.component.css']
})
export class AddholidaysComponent implements OnInit {

  _frm = new FormGroup({});
  _title: string;
  constructor(private router: Router, private msgSvc: MessageService) { }

  ngOnInit() {
    this._title = 'Add Holiday';
    this.addControls();
  }

  addControls() {
    this._frm.addControl('holidayName', new FormControl(null, Validators.required));
    this._frm.addControl('holidayDate', new FormControl(null, Validators.required));
    this._frm.controls['holidayDate'].setValue(new Date());
  }

// Comment added 
  cancelHoliday() {
    this.router.navigate(['/menu/holidays']);
  }

  addHoliday() {
    this.router.navigate(['/menu/holidays']);
  }

  hasFormErrors() {
    return !this._frm.valid;
  }
}
