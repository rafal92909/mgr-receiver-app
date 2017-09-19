import { Component, Input, OnInit } from '@angular/core';
import { ChartModule } from 'angular2-highcharts'; 

@Component({
  selector: 'mgr-small-chart',
  templateUrl: './small-chart.component.html',
  styleUrls: ['./small-chart.component.css']
})
export class SmallChartComponent implements OnInit  {
  @Input() id: string;
  chart: Object;
  options: Object;

  constructor() {        
  }

  ngOnInit() {
    
    var stringObj = '{ "title": { "text": "Id: ' + this.id + '" }, "animation": "Highcharts.svg", "marginRight": 10, "series": [{ "name": "seria 1" }, { "name": "seria 2" }], "xAxis": { "title": { "text": "Measurement date" }, "type": "datetime", "tickPixelInterval": 150 }, "yAxis": { "title": { "text": "Values" } }}';
    stringObj = JSON.parse(stringObj);    
    this.options = stringObj;
    setInterval(() => {
        var x = (new Date()).getTime();
        var y = Math.random() * 10;      
       this.chart.series[0].addPoint([x,y]);
       y = Math.random() * 10;
       this.chart.series[1].addPoint([x,y]);
       var dataLength = this.chart.series[0].data.length;
       if (dataLength > 20) {
        this.chart.series[0].data[0].remove(false, false);
        this.chart.series[1].data[0].remove(false, false);
       }
       
    }, 500);
  }

  saveChart(chart) {
    this.chart = chart;
  }
}
