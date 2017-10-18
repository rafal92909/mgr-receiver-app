import { LogoComponent } from './../../logo.component';
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
  minValue;
  maxValue;
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
          let whichAxis = '"yAxis": 0';
          if (this.descFrame[0].VALUES[valueKeys[i]].hasOwnProperty('dataType')) {
            if (this.descFrame[0].VALUES[valueKeys[i]].dataType == 'set') {
              whichAxis = '"yAxis": 1';
            }
          }

          if (this.descFrame[0].VALUES[valueKeys[i]].hasOwnProperty('desc')) {
            series += '{ "name": "' + this.descFrame[0].VALUES[valueKeys[i]].desc + '", ' + whichAxis + ' }, '
          } else {
            series += '{ "name": "' + valueKeys[i] + '", ' + whichAxis + ' }, '
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
        //'"chart": { "animation": false }' + 
        '"chart": { "animation": "Highcharts.svg" }' +
        '}';

      stringObj = JSON.parse(stringObj);
      this.options = stringObj;
      this.setYAxis();



      this.dataFrames.reverse(); // odwracamy tabliece z danymi, bo zapytanie zwraca najnowszy jako pierwszy, a musimy wykres zasilic danymi od konca
      if (this.chart != null && !this.initialValues) {
        this.setInitialValues();
      }
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

  setYAxis() { // NIE DZIALA POPRAWNIE
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
            //console.log(yAxisTab);
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


  setInitialValues() {
    this.initialValues = true;
    for (let i = 0; i < this.dataFrames.length; i++) {
      if (this.dataFrames[i].hasOwnProperty('VALUES') && this.descFrame[0].hasOwnProperty('VALUES')) {
        if (this.dataFrames[i].hasOwnProperty(this.dateKey)) { // jeżeli jest data
          let dateValue = this.dataFrames[i][this.dateKey];
          let x = (new Date(dateValue)).getTime();
          for (let j = 0; j < this.valueKeys.length; j++) {
            if (this.dataFrames[i].VALUES.hasOwnProperty(this.valueKeys[j]) && this.descFrame[0].VALUES.hasOwnProperty(this.valueKeys[j])) {
              if (this.descFrame[0].VALUES[this.valueKeys[j]].hasOwnProperty('dataType')) {
                let y = this.dataFrames[i].VALUES[this.valueKeys[j]]; // nie umiem wczytac wartosci string na os y
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
                  this.chart.series[j].addPoint([x, y]);
                }
              }
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
    //   var change = {
    //     0: 'Very Low',
    //     5: 'Low',
    //     10: 'Medium',
    //     15: 'High',
    //     20: 'Very High'
    // };
    //   console.log(this.options.yAxis);
    //   this.options.yAxis = {
    //     labels: {
    //         formatter: function() {
    //             var value = change[this.value];
    //             return value !== 'undefined' ? value : this.value;
    //         }
    //     }
    // }

  }

// TODO - 2017-10-18
// 1. wprawic mini charty w ruch
// 6. stworzyc duzego charta - z danymi z bazy
// 7. tworzyc tyle dużych chartów ile serii danych
// 8. historyczny przeglad danych


// DONE - 2017-10-18
// 2. stworzyć nową pustą strnę dla duzego charta
// 3. on click na mini chart - przenosi do strony z duzym chartem
// 4. przekazanie do duzego charta ID loggera
// 5. stworzyc duzego charta - z danymi na sztywno



// DONE - 2017-09-20
// 1. wziac wszystkie wartosci typu range i sprawdzic ich min i max - ustalic jeden min i jedne max
// 2. wysylac wszystkie wartosci seta w ramce typu desc
// 3. tablica odwzorowujaca wartosci seta na liczby - wartosc na osi danego seta to (max - min) / liczba_setow * odpowiednia_wartosc_seta_z_tablicy (od 0 do x)
// 4. opisac os Y wartosciami tekstowymi seta - miej lub bardziej jest