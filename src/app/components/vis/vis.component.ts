// angular components
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

// my services
import { ScatterChart } from '../../classes/scatter.chart.class';
import { TseriesChart } from '../../classes/tseries.chart.class';
import { DataService } from '../../classes/data.class';

@Component({
  selector: 'pulse-vis',
  template: `
  <md-toolbar>
    {{explorerTitle}}
  </md-toolbar>
  <div class="scatterRow">
    <div #scatter class="scatter"></div>
  </div>
  <md-toolbar>
    {{beatsTitle}}
  </md-toolbar>
  <div class="tseriesRow">
    <div #tseries class="tseries"></div>
  </div>
  `
})
export class VisComponent implements AfterViewInit {
  @ViewChild('scatter') scatterRef: ElementRef;
  @ViewChild('tseries') tseriesRef: ElementRef;

  private explorerTitle: string = "Pulse Explorer";
  private beatsTitle: string = "Pulse Beats";

  private scatter: any;
  private tseries: any;

  constructor(private dataService : DataService) { }

  ngAfterViewInit() {
    this._createCharts();
  }

  private _createCharts() {
    this.scatter = new ScatterChart(this.scatterRef, this.dataService);
    this.tseries = new TseriesChart(this.tseriesRef, this.dataService);
  }
}
