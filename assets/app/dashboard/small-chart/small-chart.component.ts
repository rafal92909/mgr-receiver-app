import { Component } from '@angular/core';

@Component({
  selector: 'mgr-small-chart',
  templateUrl: './small-chart.component.html',
  styleUrls: ['./small-chart.component.css']
})
export class SmallChartComponent {


  constructor() {
    var stringObj = '{ "title": { "text": "simple chart 2" }, "series": [{ "name": "seria 1", "data": [29.9, 71.5, 106.4, 129.2] }, { "name": "seria 2", "data": [9.9, 51.5, 76.4, 99.2] }]}';
    stringObj = JSON.parse(stringObj);    

    this.options = {
      title: { text: 'simple chart' },
      series: [
        {
          name: "seria1",
          data: [29.9, 71.5, 106.4, 129.2]
        },
        {
          name: "seria2",
          data: [19.9, 61.5, 96.4, 119.2]
        }
    ]
    };

    this.options = stringObj;
  }
  options: Object;

}
