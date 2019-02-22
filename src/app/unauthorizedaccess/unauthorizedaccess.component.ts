import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-unauthorizedaccess',
  templateUrl: './unauthorizedaccess.component.html',
  styleUrls: ['./unauthorizedaccess.component.css']
})
export class UnauthorizedaccessComponent implements OnInit {
  ParamSubscribe: any;
  DisplayMessage: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    localStorage.clear();
    sessionStorage.clear();
  }

  ngOnInit() {
    this.DisplayMessage = 'Page Not Found';
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Message'] !== undefined && params['Message'] !== null && params['Message'].toString() !== '') {
        this.DisplayMessage = params['Message'].toString();
      }
    });
  }

  login() {
    this.router.navigate(['']);
  }

}
