// angular components
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

// my services
import { ScatterChart } from '../../classes/scatter.chart.class';
import { TseriesChart } from '../../classes/tseries.chart.class';

@Component({
  selector: 'pulse-vis',
  template: `
  <div style="width: 98%;  margin: 30px 4px 8px 30px;">
      {{chartsTitle}}
  </div>  
  <div #scatter [style.height]="mapHeight" style="margin: 4px;"></div>
  <div #tseries [style.height]="mapHeight" style="margin: 4px;"></div>`
})
export class VisComponent implements AfterViewInit {
  @ViewChild('scatter') scatterRef: ElementRef;
  @ViewChild('tseries') tseriesRef: ElementRef;

  private chartsTitle: string = "Pulse Explorer";

  private scatter: any;
  private tseries: any;
  private mapHeight: string = "41%";

  constructor() { }

  ngAfterViewInit() {
    this._createCharts();
  }

  private _createCharts() {
    this.scatter = new ScatterChart(this.scatterRef);
    this.tseries = new TseriesChart(this.tseriesRef);
  }
}
