// angular components
import { Component, NgZone } from '@angular/core';
import { DataService } from '../../classes/data.class';
import { ParametersService } from '../../classes/params.class';

@Component({
  selector: 'urban-pulse',
  templateUrl: './main.component.html',
})
export class MainComponent {
  // app title
  appTitle: string = 'Urban Pulse (Web Version)';

  constructor(private dataService: DataService, private paramsService: ParametersService, private zone: NgZone) {
    this.paramsService.getSearchIdEmitter().subscribe((searchId: any) => {
      // update dom
      this.zone.run(() => null);
    });
  }

  emitSearchIdChanged() {
    // emit signal
    this.paramsService.emitSearchIdChanged();
  }

  emitTimeResChanged() {
    // reset observables
    this.dataService.resetScalarsObservable();

    // emit signal
    this.paramsService.emitTimeResChanged();
  }

  emitTimeSelChanged() {
    // reset observables
    this.dataService.resetScalarsObservable();

    // emit signal
    this.paramsService.emitTimeSelChanged();
  }
}
