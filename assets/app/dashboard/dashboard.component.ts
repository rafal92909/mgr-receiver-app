import { DashboardServie } from './dashboard.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mgr-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  loggerIds = [];
  //x = "1234ED5";
  constructor(private dashboardServie: DashboardServie) { 
    this.loggerIds = [];
  }

  ngOnInit() {    
    this.dashboardServie.getLoggers().subscribe(
      (loggerIds) => {
        this.loggerIds = [];
        this.loggerIds = loggerIds
      }
    );
  }

}
