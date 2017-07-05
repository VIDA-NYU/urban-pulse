// angular components
import { Component } from '@angular/core';

// my components
import { MapComponent } from '../map/map.component'

@Component({
  selector: 'urban-pulse',
  templateUrl: './main.component.html',
})
export class MainComponent  
{
  // app title
  appTitle: string = "Urban Pulse";
}
