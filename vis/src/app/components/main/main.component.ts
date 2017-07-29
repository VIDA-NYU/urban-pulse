// angular components
import { Component, NgZone } from '@angular/core';

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
        
        <!-- Search --->
        <md-radio-group [(ngModel)]="this.paramsService.searchId" (ngModelChange)="emitSearchIdChanged()">
          <md-radio-button value="none">None</md-radio-button>
          <md-radio-button value="map1">Map1</md-radio-button>
          <md-radio-button value="map2">Map2</md-radio-button>
        </md-radio-group>

        <span class="space"></span>

        <!-- Show Scalar Function --->
        <md-checkbox [(ngModel)]="this.paramsService.showScalarFunction" (ngModelChange)="this.paramsService.emitShowScalarFunctionChanged()" aria-label="Show">Scalar Function</md-checkbox>

        <span class="halfSpace"></span>
        
        <!-- Selected Scalar Time --->
        <md-slider min="1" [max]="this.paramsService.timeMax" step="1" [(ngModel)]="this.paramsService.timeSel" (ngModelChange)="this.emitTimeSelChanged()"></md-slider>
        
        <span class="space"></span>

        <!-- Selected Time Resolution --->
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
  
  constructor(private dataService: DataService, private paramsService: ParametersService, private zone: NgZone)
  {
    this.paramsService.getSearchIdEmitter().subscribe( (searchId: any)=>
    {
        // update dom
        this.zone.run(() => null)
    });
  }

  emitSearchIdChanged()
  {
    // emit signal
    this.paramsService.emitSearchIdChanged();
  }

  emitTimeResChanged()
  {
    // reset observables
    this.dataService.resetScalarsObservable();

    // emit signal
    this.paramsService.emitTimeResChanged();    
  }

  emitTimeSelChanged()
  {
    // reset observables
    this.dataService.resetScalarsObservable();

    // emit signal
    this.paramsService.emitTimeSelChanged();    
  }
}
