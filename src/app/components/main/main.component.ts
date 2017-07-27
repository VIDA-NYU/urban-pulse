// angular components
import { Component } from '@angular/core';

// my components
import { MapComponent } from '../map/map.component'
import { DataService } from '../../classes/data.class'
import { ParametersService } from '../../classes/params.class'

@Component({
  selector: 'urban-pulse',
  template: `
  <div class="app">
      <md-toolbar>
        {{appTitle}}
        <span class="hFill"></span>
        
        <md-checkbox [(ngModel)]="this.paramsService.showScalarFunction" (ngModelChange)="this.paramsService.emitShowScalarFunctionChanged()" aria-label="Show">Scalar Function</md-checkbox>

        <span class="space"></span>

        <md-radio-group [(ngModel)]="this.paramsService.timeRes" (ngModelChange)="emitTimeResChanged()">
          <md-radio-button value="HOUR">Hour</md-radio-button>
          <md-radio-button value="DAYOFWEEK">DayOfWeek</md-radio-button>
          <md-radio-button value="MONTH">Month</md-radio-button>
        </md-radio-group>
      
      </md-toolbar>
      <pulse-map class="mapColumn"></pulse-map>
      <pulse-vis class="visColumn"></pulse-vis>
  </div>`
})
export class MainComponent 
{
  // app title
  appTitle: string = "Urban Pulse (Web Version)";
  
  constructor(private dataService: DataService, private paramsService: ParametersService){}

  emitTimeResChanged()
  {
    // reset observables
    this.dataService.resetScalarsObservable();

    // emit signal
    this.paramsService.emitTimeResChanged();    
  }
}
