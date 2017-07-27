// angular components
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

// my charts
import { PulseChart } from '../../classes/pulse.chart.class';
import { ScatterChart } from '../../classes/scatter.chart.class';

// my services
import { DataService } from '../../classes/data.class';
import { FilterService } from '../../classes/filter.class';
import { ParametersService } from '../../classes/params.class';

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

  private scatter: any;
  private pulses: any;

  constructor(private dataService : DataService, private interactionService: FilterService, private paramsService: ParametersService) { }

  ngAfterViewInit() 
  {
    this._createCharts();
  }

  private _createCharts() 
  {
    this.scatter = new ScatterChart(this.scatterRef, this.dataService, this.interactionService, this.paramsService);
    this.pulses = new PulseChart(this.pulsesRef, this.dataService, this.interactionService, this.paramsService);
  }
}
