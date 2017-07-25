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
    private cities: any = ['map1', 'map2'];
    private resolutions: any = null;
    
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
        // this scope
        var that = this;

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
                feat = feat.sort(function (x: any, y: any) {
                    return d3.descending(x.rank, y.rank);
                });

                // resolutions
                this.resolutions = Object.keys(feat[feat.length - 1]["resolutions"]);
                this.resolutions.splice(this.resolutions.indexOf("ALL"), 1);
                
                // adds the feature id
                var data01 = feat.slice(); 
                data01 = data01.map(function(f: any, index: number)
                {
                    // feature id
                    f.id = index;
                    // map
                    f.map = 'map1';
                    
                    // for each resolution
                    that.resolutions.forEach(function(tRes: string)
                    {
                        // rank computation
                        var fnRank  = f.resolutions[tRes].fnRank;
                        var maxRank = f.resolutions[tRes].maxRank;
                        var sigRank = f.resolutions[tRes].sigRank;
                        
                        // x and y values for the scatter plot
                        var x = Math.sqrt(maxRank * maxRank + fnRank * fnRank + sigRank * sigRank);
                        var y = f.rank;

                        // add plot coords
                        f.resolutions[tRes].x = x;
                        f.resolutions[tRes].y = y;
                    })

                    return f;
                });

                var data02 = feat.slice(); 
                data02 = data02.map(function(f: any, index: number)
                {
                    // feature id
                    f.id = data01.length + index;
                    // map
                    f.map = 'map2';

                    // for each resolution
                    that.resolutions.forEach(function(tRes: string)
                    {
                        // rank computation
                        var fnRank  = f.resolutions[tRes].fnRank;
                        var maxRank = f.resolutions[tRes].maxRank;
                        var sigRank = f.resolutions[tRes].sigRank;
                        
                        // x and y values for the scatter plot
                        var x = Math.sqrt(maxRank * maxRank + fnRank * fnRank + sigRank * sigRank);
                        var y = f.rank;

                        // add plot coords
                        f.resolutions[tRes].x = x;
                        f.resolutions[tRes].y = y;
                    })

                    return f;
                });

                this.data = data01.concat(data02);

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

    getResolution()
    {
        return this.resolutions;
    }

    getCities() 
    {
    	return this.cities;
    }
}