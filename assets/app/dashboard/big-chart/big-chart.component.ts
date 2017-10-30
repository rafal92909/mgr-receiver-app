import { BigChartService } from './big-chart.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChartModule } from 'angular2-highcharts';

@Component({
  selector: 'app-big-chart',
  templateUrl: './big-chart.component.html',
  styleUrls: ['./big-chart.component.css'],
  providers: [BigChartService]
})
export class BigChartComponent implements OnInit {
  itemId: string;
  initialValues: boolean = false;
  chart: Object;
  options: Object;
  minX = '';
  maxX = '';
  flag: boolean  = false;

  constructor(private activatedRoute: ActivatedRoute, private bigChartService: BigChartService) {
    
} 

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.itemId = params['id'];
    });
    this.setChartConfig();

    this.bigChartService.getData(this.itemId, 0, 0).subscribe(dataFrames => {
      console.log(dataFrames);
    });
  }

  getDateTime(date) {    
    let time =date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false, second: '2-digit'});
    let yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();

    mm = (mm > 9 ? '' : '0') + mm;
    dd = (dd > 9 ? '' : '0') + dd;

    return yyyy + '-' + mm + '-' + dd + ' ' + time;
  }

  onAfterSetExtremesX (e) {
   
  }
  onSetExtremesX(e) {    
    console.log(e.originalEvent.DOMEvent.type);
    this.chart.showLoading('Loading data from server...');
    if (e.originalEvent != null && e.originalEvent.DOMEvent != null) {
      if (this.flag && e.originalEvent.DOMEvent.type == "mouseup") {        
        let minDate = this.getDateTime(new Date(e.context.min));
        let maxDate = this.getDateTime(new Date(e.context.max));
        this.minX = minDate;
        this.maxX = maxDate;      
        this.bigChartService.getData(this.itemId, e.context.min, e.context.max).subscribe(dataFrames => {
          console.log(dataFrames);
        });
        this.chart.hideLoading();
      } 
    }    
  }

  saveChart(chart) {
    this.chart = chart;
    for (var i = 0; i < 10; i++) {
      let d = new Date();
      d.setDate(d.getDate() - 10 + (i* 10));
      var x = d.getTime();      
      var y = Math.random() * 10;      
     this.chart.series[0].addPoint([x,y]);
     y = Math.random() * 10;
     this.chart.series[1].addPoint([x,y]);
     y = Math.random() * 10;
     this.chart.series[2].addPoint([x,y]);
    }
    this.flag = true;

  }
  setChartConfig() {
    this.initialValues = true;

        var stringObj = '{ ' +
    '"title": { "text": "Id: ' + this.itemId + '" }, ' +
    '"marginRight": 10, ' +
    '"series": [{ "name": "seria 1" }, { "name": "seria 2" }, { "name": "seria 3" }], ' +
    '"xAxis": { "title": { "text": "Measurement date" }, "type": "datetime", "tickPixelInterval": 150 }, ' +
    '"yAxis": { "title": { "text": "Values" }}, ' + 
    '"plotOptions": { "series": { "animation": false }}, ' +
    //'"chart": { "animation": false }' + 
    '"chart": { "animation": "Highcharts.svg", "zoomType": "x" }, ' +
    '"rangeSelector": { "buttons": [{ "type": "hour", "count": "1", "text": "1h" }, { "type": "day", "count": "1", "text": "1d" }, { "type": "month", "count": "1", "text": "1m" }, { "type": "year", "count": "1", "text": "1y" }, { "type": "all", "text": "All" }], "inputEnabled": false, "selected": 4 }' +
    '}';

    stringObj = JSON.parse(stringObj);    
    this.options = stringObj;

  }
}
