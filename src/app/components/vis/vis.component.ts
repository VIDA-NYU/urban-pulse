// angular components
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

// my charts
import { PulseChart } from '../../classes/pulse.chart.class';
import { ScatterChart } from '../../classes/scatter.chart.class';

// my services
import { DataService } from '../../classes/data.class';
import { FilterService } from '../../classes/filter.class';

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
    <span class="hFill"></span>
    <md-radio-group [(ngModel)]="currentRes" (ngModelChange)="onResChange()">
      <md-radio-button value="HOUR">Hour</md-radio-button>
      <md-radio-button value="DAYOFWEEK">DayOfWeek</md-radio-button>
      <md-radio-button value="MONTH">Month</md-radio-button>
      </md-radio-group>
  </md-toolbar>
  <div class="pulsesRow">
    <div #pulses class="pulses"></div>
  </div>
  `
})
export class VisComponent implements AfterViewInit {
  @ViewChild('scatter') scatterRef: ElementRef;
  @ViewChild('pulses') pulsesRef: ElementRef;

  private explorerTitle: string = "Pulse Explorer";
  private beatsTitle: string = "Pulse Beats";
  private currentRes: string = "HOUR";

  private scatter: any;
  private pulses: any;

  constructor(private dataService : DataService, private interactionService: FilterService) { }

  ngAfterViewInit() 
  {
    this._createCharts();
  }

  onResChange()
  {
    this.pulses.changeResolution(this.currentRes);
  }

  private _createCharts() 
  {
    this.scatter = new ScatterChart(this.scatterRef, this.dataService, this.interactionService);
    this.pulses = new PulseChart(this.pulsesRef, this.dataService, this.interactionService, this.currentRes);
  }


}
