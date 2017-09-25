import { DashboardServie } from './../dashboard.service';
import { Component, Input, OnInit } from '@angular/core';
import { ChartModule } from 'angular2-highcharts';

@Component({
  selector: 'mgr-small-chart',
  templateUrl: './small-chart.component.html',
  styleUrls: ['./small-chart.component.css']
})
export class SmallChartComponent implements OnInit {
  @Input() itemId: string;
  chart: Object;
  options: Object;
  dateKey: string;
  loggerName: string = 'Logger';
  loggerDesc: string = '';
  initialValues: boolean = false;
  valueKeys = [];
  dataFrames = [];
  descFrame = [];

  constructor(private dashboardServie: DashboardServie) {
  }

  ngOnInit() {

    // var stringObj = '{ ' +
    // '"title": { "text": "Id: ' + this.itemId + '" }, ' +
    // '"marginRight": 10, ' +
    // '"series": [{ "name": "seria 1" }, { "name": "seria 2" }, { "name": "seria 3" }], ' +
    // '"xAxis": { "title": { "text": "Measurement date" }, "type": "datetime", "tickPixelInterval": 150 }, ' +
    // '"yAxis": { "title": { "text": "Values" }}, ' + 
    // '"plotOptions": { "series": { "animation": false }}, ' +
    // //'"chart": { "animation": false }' + 
    // '"chart": { "animation": "Highcharts.svg" }' + 
    // '}';

    // stringObj = JSON.parse(stringObj);    
    // this.options = stringObj;
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



    this.dashboardServie.getDataFrames(this.itemId).subscribe(
      (frames) => {
        this.descFrame = [];
        this.dataFrames = [];
        if (frames.length == 2) {
          this.descFrame = frames[0];
          this.dataFrames = frames[1];
          if (this.descFrame.length == 1) {
            this.proceed();
          }
        }
      }
    );
  }

  // for (let key in Object.keys(jsonObject)) {
  //   if (Object.keys(jsonObject)[key].startsWith('value')) {
  //     values = ', ' + jsonObject[Object.keys(jsonObject)[key]] + values;
  //   }
  // }

  proceed() {
    //console.log(this.descFrame);
    //console.log(this.dataFrames);
    if (this.descFrame[0].hasOwnProperty('DATE') && this.dataFrames.length > 0) { // jeżeli czujnik nie wysyła daty pomiaru lub nie ma danych to nie prezentujemy nic
      this.dateKey = this.descFrame[0].DATE.KEY;

      if (this.descFrame[0].hasOwnProperty('NAME')) {
        this.loggerName = this.descFrame[0].NAME;
      }
      if (this.descFrame[0].hasOwnProperty('DESC')) {
        this.loggerDesc = this.descFrame[0].DESC;
      }
      let series = '{ "name": "seria 1" }';
      if (this.descFrame[0].hasOwnProperty('VALUES')) { // ustalenie serii na podstawie descFrame
        series = '';
        let valueKeys = Object.keys(this.descFrame[0].VALUES);
        for (let i = 0; i < valueKeys.length; i++) {
          this.valueKeys.push(valueKeys[i]);
          if (this.descFrame[0].VALUES[valueKeys[i]].hasOwnProperty('desc')) {
            series += '{ "name": "' + this.descFrame[0].VALUES[valueKeys[i]].desc + '"}, '
          } else {
            series += '{ "name": "' + valueKeys[i] + '"}, '
          }
        }
        if (series.endsWith(', ')) {
          series = series.substring(0, series.length - 2);
        }
      }

      var stringObj = '{ ' +  // ustawienie konfigruacji wykresu
        '"title": { "text": "' + this.loggerName + '<br />' + this.loggerDesc + '" }, ' +
        '"marginRight": 10, ' +
        '"series": [' + series + '], ' +
        '"xAxis": { "title": { "text": "Measurement date" }, "type": "datetime", "tickPixelInterval": 150 }, ' +
        '"yAxis": { "title": { "text": "Values" }}, ' +
        '"plotOptions": { "series": { "animation": false }, "line": { "dataLabels": { "enabled": true }, "enableMouseTracking": false }}, ' +
        //'"chart": { "animation": false }' + 
        '"chart": { "animation": "Highcharts.svg" }' +
        '}';

      stringObj = JSON.parse(stringObj);
      this.options = stringObj;

      this.dataFrames.reverse(); // odwracamy tabliece z danymi, bo zapytanie zwraca najnowszy jako pierwszy, a musimy wykres zasilic danymi od konca


      if (this.chart != null && !this.initialValues) {
        this.setInitialValues();
      }
    }
  }

  setInitialValues() {
    this.initialValues = true;
    for (let i = 0; i < this.dataFrames.length; i++) {
      if (this.dataFrames[i].hasOwnProperty('VALUES')) {
        if (this.dataFrames[i].hasOwnProperty(this.dateKey)) { // jeżeli jest data
          let dateValue = this.dataFrames[i][this.dateKey];
          let x = (new Date(dateValue)).getTime();
          for (let j = 0; j < this.valueKeys.length; j++) {
            if (this.dataFrames[i].VALUES.hasOwnProperty(this.valueKeys[j])) {
              let y = this.dataFrames[i].VALUES[this.valueKeys[j]]; // nie umiem wczytac wartosci string na os y
              y = Math.random() * 10;
              y = y.toFixed(2) * 1;
              this.chart.series[j].addPoint([x, y]);
            }
          }
        }
      }
    }
  }

  saveChart(chart) {
    this.chart = chart;
    if (!this.initialValues) {
      this.setInitialValues();
    }
  }
}

