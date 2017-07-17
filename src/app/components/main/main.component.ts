// angular components
import { Component } from '@angular/core';

// my components
import { MapComponent } from '../map/map.component'

@Component({
  selector: 'urban-pulse',
  template: `
  <div class="app">
      <md-toolbar>
        {{appTitle}}
      </md-toolbar>
      <pulse-map class="mapColumn"></pulse-map>
      <pulse-vis class="visColumn"></pulse-vis>
  </div>`
})
export class MainComponent {
  // app title
  appTitle: string = "Urban Pulse (Web Version)";
}
