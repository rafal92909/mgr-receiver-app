import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mgr-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loggerIds = [ "abc1", "abc2", "abc3", "abc4", "abc5", "abc6", "abc7" ];
  constructor() { }

  ngOnInit() {
  }

}
