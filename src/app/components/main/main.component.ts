// angular components
import { Component } from '@angular/core';

// my components
import { MapComponent } from '../map/map.component'

@Component({
  selector: 'urban-pulse',
  template: `
  <md-toolbar color="primary">
    {{appTitle}}
  </md-toolbar>
  <section class="app flex-container" layout="column" fxLayoutAlign="start stretch">
      <pulse-map style='width: 40vw'></pulse-map>
      <pulse-vis style='width: 59vw'></pulse-vis>
  </section>`
})
export class MainComponent {
  // app title
  appTitle: string = "Urban Pulse (Web Version)";
}
