import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChartModule } from 'angular2-highcharts';

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
  minX = '';
  maxX = '';
  flag: boolean  = false;
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
    if (this.flag) {      
      let minDate = this.getDateTime(new Date(e.context.min));
      let maxDate = this.getDateTime(new Date(e.context.max));
      this.minX = minDate;
      this.maxX = maxDate;
      console.log(minDate);
      console.log(maxDate);
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
    // setInterval(() => {
    //     var x = (new Date()).getTime();
    //     var y = Math.random() * 10;      
    //    this.chart.series[0].addPoint([x,y]);
    //    y = Math.random() * 10;
    //    this.chart.series[1].addPoint([x,y]);
    //    y = Math.random() * 10;
    //    this.chart.series[2].addPoint([x,y]);

    //    var dataLength = this.chart.series[0].data.length;
    //    if (dataLength > 10) {
    //     this.chart.series[0].data[0].remove(false, false);
    //     this.chart.series[1].data[0].remove(false, false);
    //     this.chart.series[2].data[0].remove(true, true);
    //    }
    // }, 1000);

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
