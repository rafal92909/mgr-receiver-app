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
  minXDate = '';
  maxXDate = '';
  minXTime = '';
  maxXTime = '';

  dateKey: string;
  loggerName: string = 'Logger';
  loggerDesc: string = '';
  minValue;
  maxValue;
  valueKeys = [];
  dataFrames = [];
  descFrame = [];
  seriesNames = [];

  constructor(private activatedRoute: ActivatedRoute, private bigChartService: BigChartService) {

  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.itemId = params['id'];
    });

    this.bigChartService.getData(this.itemId, 0, 0).subscribe(
      (frames) => {
        this.descFrame = [];
        this.dataFrames = [];
        if (frames.length == 2) {
          this.descFrame = frames[0];
          this.dataFrames = frames[1];

          if (this.descFrame.length == 1) {
            this.proceed(this.dataFrames);

            if (this.dataFrames.length > 0) {
              if (this.dataFrames[0].hasOwnProperty(this.dateKey)) { // jeżeli jest data
                let minDateValue = this.dataFrames[0][this.dateKey];
                let minDateValueAr = minDateValue.split(' ');
                this.minXDate = minDateValueAr[0];
                this.minXTime = minDateValueAr[1];

                let maxDateValue = this.dataFrames[this.dataFrames.length - 1][this.dateKey];
                let maxDateValueAr = maxDateValue.split(' ');
                this.maxXDate = maxDateValueAr[0];
                this.maxXTime = maxDateValueAr[1];
              }
            }
          }
        }
      }
    );
  }

  proceed(dataFrames) {
    if (this.descFrame[0].hasOwnProperty('DATE') && dataFrames.length > 0) { // jeżeli czujnik nie wysyła daty pomiaru lub nie ma danych to nie prezentujemy nic
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
          let whichAxis = '"yAxis": 0';
          if (this.descFrame[0].VALUES[valueKeys[i]].hasOwnProperty('dataType')) {
            if (this.descFrame[0].VALUES[valueKeys[i]].dataType == 'set') {
              whichAxis = '"yAxis": 1';
            }
          }

          if (this.descFrame[0].VALUES[valueKeys[i]].hasOwnProperty('desc')) {
            series += '{ "name": "' + this.descFrame[0].VALUES[valueKeys[i]].desc + '", ' + whichAxis + ' }, '
            switch (i) {
              case 0:
                this.seriesNames[i] = { name: this.descFrame[0].VALUES[valueKeys[i]].desc, color: '#7CB5EC' };
                break;
              case 1:
                this.seriesNames[i] = { name: this.descFrame[0].VALUES[valueKeys[i]].desc, color: '#434348' };
                break;
              case 2:
                this.seriesNames[i] = { name: this.descFrame[0].VALUES[valueKeys[i]].desc, color: '#90ED7D' };
                break;
              default:
                this.seriesNames[i] = { name: this.descFrame[0].VALUES[valueKeys[i]].desc, color: '#434348' };
            }

          } else {
            series += '{ "name": "' + valueKeys[i] + '", ' + whichAxis + ' }, '
            switch (i) {
              case 0:
                this.seriesNames[i] = { name: valueKeys[i], color: '#7CB5EC' };
                break;
              case 1:
                this.seriesNames[i] = { name: valueKeys[i], color: '#434348' };
                break;
              case 2:
                this.seriesNames[i] = { name: valueKeys[i], color: '#90ED7D' };
                break;
              default:
                this.seriesNames[i] = { name: valueKeys[i], color: '#434348' };
            }


          }
          this.setMinMax(valueKeys[i]);

        }
        if (this.minValue == null) {
          this.minValue = 0;
        }
        if (this.maxValue == null) {
          this.maxValue = 100;
        }
        this.minValue = 0;
        this.maxValue = 100;

        if (series.endsWith(', ')) {
          series = series.substring(0, series.length - 2);
        }
      }

      var stringObj = '{ ' +  // ustawienie konfigruacji wykresu
        '"title": { "text": "' + this.loggerName + '<br />' + this.loggerDesc + '" }, ' +
        '"marginRight": 10, ' +
        '"series": [' + series + '], ' +
        '"xAxis": { "title": { "text": "Measurement date" }, "type": "datetime", "tickPixelInterval": 150 }, ' +
        '"yAxis": [{ "title": { "text": "Values" }}, { "title": { "text": "Values 2" }, "opposite": true }], ' +
        '"plotOptions": { "series": { "animation": false }, "line": { "dataLabels": { "enabled": true }, "enableMouseTracking": false }}, ' +
        '"chart": { "animation": "Highcharts.svg", "zoomType": "x" }, ' +
        '"rangeSelector": { "selected": 4,  "buttons": [{ "type": "hour", "count": "1", "text": "1h" }, { "type": "day", "count": "1", "text": "1d" }, { "type": "month", "count": "1", "text": "1m" }, { "type": "year", "count": "1", "text": "1y" }, { "type": "all", "text": "All" }], "inputEnabled": false }' +
        '}';
      stringObj = JSON.parse(stringObj);
      this.options = stringObj;
      this.setYAxis();

      if (this.chart != null && !this.initialValues) {
        this.setInitialValues(0, dataFrames);
      }
    }
  }


  setInitialValues(mode, dataFrames) {
    this.initialValues = true;
    var pointsArr = [];
    for (let j = 0; j < this.valueKeys.length; j++) {
      pointsArr[j] = [];
    }
    for (let i = 0; i < dataFrames.length; i++) {
      if (dataFrames[i].hasOwnProperty('VALUES') && this.descFrame[0].hasOwnProperty('VALUES')) {
        if (dataFrames[i].hasOwnProperty(this.dateKey)) { // jeżeli jest data
          let dateValue = dataFrames[i][this.dateKey];
          let x = (new Date(dateValue)).getTime();
          for (let j = 0; j < this.valueKeys.length; j++) {
            if (dataFrames[i].VALUES.hasOwnProperty(this.valueKeys[j]) && this.descFrame[0].VALUES.hasOwnProperty(this.valueKeys[j])) {
              if (this.descFrame[0].VALUES[this.valueKeys[j]].hasOwnProperty('dataType')) {
                let y = dataFrames[i].VALUES[this.valueKeys[j]]; // nie umiem wczytac wartosci string na os y
                if (y.length > 0) {
                  y = y[0];
                  if (this.descFrame[0].VALUES[this.valueKeys[j]].dataType == "set") { // odwzorowanie na tablice
                    if (this.descFrame[0].VALUES[this.valueKeys[j]].hasOwnProperty('dataSet')) {
                      let dataSet = this.descFrame[0].VALUES[this.valueKeys[j]].dataSet;
                      for (let k = 0; k < dataSet.length; k++) {
                        if (y == dataSet[k]) {
                          y = (this.maxValue - this.minValue) / dataSet.length;
                          y = Math.round(y);
                          y = y * k; // wartosc na osi danego seta to (max - min) / liczba_setow * odpowiednia_wartosc_seta_z_tablicy (od 0 do k)
                          break;
                        }
                      }
                      if (isNaN(y)) {
                        y = 0;
                      }
                    }
                  } else {
                    if (isNaN(y)) {
                      y = 0;
                    } else {
                      y = Number(y); // parsowanie string do liczby
                    }
                  }
                  if (mode == 0) {
                    this.chart.series[j].addPoint([x, y]);
                  } else {
                    pointsArr[j].push([x, y]);
                  }
                }
              }
            }
          }
        }
      }
    }
    if (mode == 1) {
      for (let j = 0; j < this.valueKeys.length; j++) {
        this.chart.series[0].setData(pointsArr[j]);
      }
    }
  }


  setYAxis() {
    let yAxisTab = {};
    for (let i = 0; i < this.valueKeys.length; i++) {
      if (this.descFrame[0].VALUES[this.valueKeys[i]].hasOwnProperty('dataType')) {
        if (this.descFrame[0].VALUES[this.valueKeys[i]].dataType == 'set') {
          if (this.descFrame[0].VALUES[this.valueKeys[i]].hasOwnProperty('dataSet')) {
            let dataSet = this.descFrame[0].VALUES[this.valueKeys[i]].dataSet;
            for (let k = 0; k < dataSet.length; k++) { // wartosc na osi danego seta to (max - min) / liczba_setow * odpowiednia_wartosc_seta_z_tablicy (od 0 do k)
              let label = dataSet[k];
              let key = (Math.round((this.maxValue - this.minValue) / dataSet.length)) * k;
              yAxisTab[key] = label;
            }
            this.options.yAxis[1] = {
              labels: {
                formatter: function () {
                  var value;
                  if (this.value != null && !isNaN(this.value)) {
                    var count = Object.keys(yAxisTab).length;
                    for (let i = 0; i < count; i++) {
                      if (Object.keys(yAxisTab)[i] == this.value) { // klucz rowny wartosci na wykresie
                        value = yAxisTab[this.value];
                        break;
                      } else {
                        if (Object.keys(yAxisTab)[i] < this.value && (i - 1) != count) { // wartosc wieksza od klucza, to nie ten opis
                          continue;
                        } else { // wartosc klucza wieksza - wez poprzedni opis
                          if (i > 0) {
                            value = yAxisTab[Object.keys(yAxisTab)[i - 1]]
                          } else {
                            value = yAxisTab[Object.keys(yAxisTab)[0]]
                          }
                          break;
                        }
                      }
                    }
                    //value = yAxisTab[this.value];
                  }
                  return value !== 'undefined' ? value : this.value;
                }
              }, title: { text: "Values 2" }, opposite: true
            }
            return;
          }
        }
      }
    }
    this.options.yAxis[1] = {
      title: { text: "" }, opposite: true
    }
  }



  setMinMax(valueKey) {
    if (this.descFrame[0].VALUES[valueKey].hasOwnProperty('dataType')) {
      if (this.descFrame[0].VALUES[valueKey].dataType == 'range') {
        if (this.descFrame[0].VALUES[valueKey].hasOwnProperty('valueMin')) {
          let minValue = this.descFrame[0].VALUES[valueKey].valueMin;
          if (minValue != null && minValue !== '') {
            if (this.minValue == null) {
              this.minValue = minValue;
            } else {
              if (this.minValue > minValue) {
                this.minValue = minValue;
              }
            }
          }
        }
        if (this.descFrame[0].VALUES[valueKey].hasOwnProperty('valueMax')) {
          let maxValue = this.descFrame[0].VALUES[valueKey].valueMax;
          if (maxValue != null && maxValue !== '') {
            if (this.maxValue == null) {
              this.maxValue = maxValue;
            } else {
              if (this.maxValue > maxValue) {
                this.maxValue = maxValue;
              }
            }
          }
        }
      }
    }
  }


  getDateTime(date) {
    let time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, second: '2-digit' });
    let yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();

    mm = (mm > 9 ? '' : '0') + mm;
    dd = (dd > 9 ? '' : '0') + dd;

    return yyyy + '-' + mm + '-' + dd + ' ' + time;
  }

  onSetExtremesX(e) {
    this.chart.showLoading('Loading data from server...');
    if (e.originalEvent != null) {
      if (this.initialValues && (e.originalEvent.DOMEvent == null || e.originalEvent.DOMEvent.type == "mouseup")) {
        let minDate = this.getDateTime(new Date(e.context.min));
        let maxDate = this.getDateTime(new Date(e.context.max));
        var minDateAr = minDate.split(' ');
        var maxDateAr = maxDate.split(' ');
        this.minXDate = minDateAr[0];
        this.minXTime = minDateAr[1];
        this.maxXDate = maxDateAr[0];
        this.maxXTime = maxDateAr[1];

        this.bigChartService.getData(this.itemId, e.context.min, e.context.max).subscribe(frames => {
          this.setInitialValues(1, frames[1]);
          this.chart.hideLoading();
        });
      }
    }
  }

  saveChart(chart) {
    this.chart = chart;
    if (!this.initialValues) {
      this.setInitialValues(0, this.dataFrames);
    }
  }
}

// TODO
// 3. opisy serii 