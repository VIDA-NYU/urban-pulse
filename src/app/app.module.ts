// angular components
import 'hammerjs';

import { NgModule }                from '@angular/core';
import { FormsModule }             from '@angular/forms';
import { BrowserModule }           from '@angular/platform-browser';
import { MaterialModule }          from '@angular/material';
import { FlexLayoutModule }        from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// my components
import { MapComponent }   from './components/map/map.component';
import { VisComponent }   from './components/vis/vis.component';
import { MainComponent }  from './components/main/main.component';

// my services
import { GMapsLayerGL } from './classes/gmaps.layergl.class'

@NgModule({
  imports: 
  [
    BrowserModule, 
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    BrowserAnimationsModule
  ],
  declarations: 
  [ 
    MapComponent,
    VisComponent,
    MainComponent, 
  ],
  providers:
  [
    GMapsLayerGL
  ],
  bootstrap: [ MainComponent ]
})
export class AppModule { }
