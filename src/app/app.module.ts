// angular components
import 'hammerjs';

import { NgModule }                from '@angular/core';
import { FormsModule }             from '@angular/forms';
import { HttpModule }              from '@angular/http';
import { FlexLayoutModule }        from '@angular/flex-layout';
import { BrowserModule }           from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// angular material
import { MaterialModule }  from '@angular/material';

// my components
import { MapComponent }   from './components/map/map.component';
import { VisComponent }   from './components/vis/vis.component';
import { MainComponent }  from './components/main/main.component';

// my services
import { DataService }  from './classes/data.class';
import { FilterService } from './classes/filter.class'

@NgModule({
  imports: 
  [
    BrowserModule, 
    FormsModule,
    HttpModule,
    MaterialModule,
    FlexLayoutModule,
    BrowserAnimationsModule
  ],
  declarations: 
  [ 
    MapComponent,
    VisComponent,
    MainComponent
  ],
  providers:
  [
    DataService,
    FilterService
  ],
  bootstrap: [ MainComponent ]
})
export class AppModule { }
