import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

// import d3js
import * as d3 from 'd3';

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
    // data
    private data: any = null;
    private res:  any = null;

    // observable
    private obs: Observable<any>;

    constructor(private http: Http) { }

    getScalar() 
    {
        return this.http.get('./data/nyc/flickr_ALL_0-day.scalars').map((res:any) => {
            var textByLine = res.text().split('\n');
            var json = {};
            json['gridSize'] = textByLine[0].split(',').map(function(x: string){return parseInt(x)});
            json['latLng'] = textByLine[1].split(',').map(function(x: string){return parseFloat(x)});
            json['values'] = textByLine.slice(3).map(function(x: string){return parseFloat(x)});
            json['range'] = [d3.min(json['values']), d3.max(json['values'])];
            return json;
        });
    }
    
    getFeatures() 
    {
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
                var feat = response.json().features;

                // sort features
                var features = feat.sort(function (x: any, y: any) {
                    return d3.descending(x.rank, y.rank);
                });

                // resolutions
                this.res = Object.keys(features[features.length - 1]["resolutions"]);
                this.res.splice(this.res.indexOf("ALL"), 1);
                
                // adds the feature id
                this.data = features.map(function(f: any, index: number)
                {
                    f.id = index;
                    return f;
                });

                // And return the response
                return this.data
            })
            .share();

            // Return the observable to be subscribed to
            return this.obs;
        }
    }

    getData()
    {
        return this.data;
    }

    getResolutions()
    {
        return this.res;
    }

    getCities() 
    {
    	return ['nyc', 'nyc'];
    }
}