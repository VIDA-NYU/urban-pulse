// angular components
import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { MaterialModule }   from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

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
    MaterialModule,
    FlexLayoutModule
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
