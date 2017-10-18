import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-big-chart',
  templateUrl: './big-chart.component.html',
  styleUrls: ['./big-chart.component.css']
})
export class BigChartComponent implements OnInit {
  itemId: string;
  initialValues: boolean = false;
  chart: Object;
  options: Object;

  // constructor(private activatedRoute: ActivatedRoute) {

  // }
  constructor(private activatedRoute: ActivatedRoute) {
    
} 

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.itemId = params['id'];
      console.log(this.itemId);
    });
    this.setChartConfig();
  }

  saveChart(chart) {
    this.chart = chart;
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
    '"chart": { "animation": "Highcharts.svg" }' + 
    '}';

    stringObj = JSON.parse(stringObj);    
    this.options = stringObj;
    setInterval(() => {
        var x = (new Date()).getTime();
        var y = Math.random() * 10;      
       this.chart.series[0].addPoint([x,y]);
       y = Math.random() * 10;
       this.chart.series[1].addPoint([x,y]);
       y = Math.random() * 10;
       this.chart.series[2].addPoint([x,y]);

       var dataLength = this.chart.series[0].data.length;
       if (dataLength > 10) {
        this.chart.series[0].data[0].remove(false, false);
        this.chart.series[1].data[0].remove(false, false);
        this.chart.series[2].data[0].remove(true, true);
       }
    }, 1000);

    // this.options = {
    //   title: { text: 'angular2-highcharts example' },
    //   series: [{
    //     name: 's1',
    //     data: [2, 3, 5, 8, 13],
    //     allowPointSelect: true
    //   }, {
    //     name: 's2',
    //     data: [-2, -3, -5, -8, -13],
    //     allowPointSelect: true
    //   }]
    // };
  }
}
