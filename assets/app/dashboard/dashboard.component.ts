import { DashboardServie } from './dashboard.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mgr-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loggerIds = [];
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
