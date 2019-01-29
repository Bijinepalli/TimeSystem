import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const dateg = new Date();
    console.log(dateg);
    const newdate = new Date(dateg.setHours(dateg.getHours() + 7));
    console.log(newdate);
  }

}
