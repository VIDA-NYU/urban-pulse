import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// observables
import { Observable } from 'rxjs/Observable';

// RXJS Imports
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

// lodash
import * as _ from 'lodash';

@Injectable()
export class DataService
{
    private data: any = null;
    private obs: Observable<any>;

    constructor(private http: Http) { }

    getFeatures() {
        if(this.data){
            return Observable.of(this.data);
        }
        else if(this.obs){
            return this.obs;
        }
        else 
        {
            // Otherwise get the data
            this.obs = this.http.get('./data/nyc/flickr-features.json')
            .map( response => {
                // Clear the observable
                this.obs = null;

                // Otherwise set the data
                this.data = response.json();

                // And return the response
                return this.data
            })
            .share();

            // Return the observable to be subscribed to
            return this.obs;
        }
    }
}
