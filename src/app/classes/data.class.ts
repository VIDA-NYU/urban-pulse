import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';

// import d3js
import * as d3 from 'd3';

// observables
import { Observable } from 'rxjs/Observable';

// RXJS Imports
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

// lodash
import * as _ from 'lodash';

@Injectable()
export class DataService
{
    // data
    private data: any = null;
    // observable
    private dataObs: Observable<any>;

    // scalars
    private scalars: any = null;
    // observable
    private scalarsObs: Observable<any>;

    // parameters
    private cities: any = ['map1', 'map2'];
    private resolutions: any = ['HOUR', 'DAYOFWEEK', 'MONTH'];

    private colorScales: any = {
        'map1': d3.scaleLinear().range(<any[]>['#fee6ce', '#fdae6b', '#e6550d']).domain([0,1]),
        'map2': d3.scaleLinear().range(<any[]>['#deebf7', '#9ecae1', '#3182bd']).domain([0,1])
    };

    private colors: any = {
        'map1': 'orange',
        'map2': 'blue'
    };
    
    constructor(private http: Http){}

    getParam(paramId: string)
    {
    	let params = new URLSearchParams(window.location.search.substring(1));
    	let someParam = params.get(paramId);
    	return someParam;
    }

    getPaths()
    {
    	// data1
    	let param1 = this.getParam('data1');
    	let param2 = this.getParam('data2');

    	if(!param1 || !param2) {
    		alert('Data parameters not supplied');
    		return;
    	}

    	let param1tk = param1.split(/[;,]+/);
    	let param2tk = param2.split(/[;,]+/);

    	if(param1tk.length < 2 || param2tk.length < 2) {
    		alert('Data parameters not supplied');
    		return;
    	}

    	let paths = {
            'map1': param1tk[0]+'/'+param1tk[1],
            'map2': param2tk[0]+'/'+param2tk[1],
        };
        return paths;
    }

    getMultipleScalars()
    {
        // this scope
        var that = this;

        // data paths
        var paths = this.getPaths();

        // current resolution
        var cRes = "HOUR";
        var cTime = 0;
        var group = "";

        // get the observables
        if(this.data)
        {
            return Observable.of(this.scalars);
        }
        else if(this.scalarsObs)
        {
            return this.scalarsObs;
        }
        else
        {
            console.log("Http Call: Getting scalar data.");
            
            // observables
            var obs1 = this.http.get('./' + paths['map1']+ '_' + cRes + '_' + cTime + group + '.scalars').map( (res: any) => res.text() );
            var obs2 = this.http.get('./' + paths['map2']+ '_' + cRes + '_' + cTime + group + '.scalars').map( (res: any) => res.text() );

            this.scalarsObs = Observable.forkJoin(obs1, obs2)
            .map(response => 
            {
                that.scalars = [];

                for(let id=0; id<response.length; id++)
                {
                    var textByLine = response[id].split('\n');
                    var json = {};
                    json['gridSize'] = textByLine[0].split(',').map(function(x: string){return parseInt(x)});
                    json['latLng'] = textByLine[1].split(',').map(function(x: string){return parseFloat(x)});
                    json['values'] = textByLine.slice(3).map(function(x: string){return parseFloat(x)});
                    json['range'] = [d3.min(json['values']), d3.max(json['values'])];

                    that.scalars.push(json);                            
                }

                return this.scalars;
            }).share();

            return this.scalarsObs;
        }
    }

    getMultipleFeatures()
    {
        // this scope
        var that = this;
        // data paths
        var paths = this.getPaths();

        // get the observables
        if(this.data)
        {
            return Observable.of(this.data)
        }
        else if(this.dataObs)
        {
            return this.dataObs;
        }
        else
        {
            console.log("Http Call: Getting feature data.");

            // observables
            var obs1 = this.http.get('./' + paths['map1']+ '-features.json').map( (res: any) => res.json() );
            var obs2 = this.http.get('./' + paths['map2']+ '-features.json').map( (res: any) => res.json() );

            this.dataObs = Observable.forkJoin(obs1, obs2)
            .map(response => 
            {
                // resets the index
                var index = 0;
                that.data = [];
                
                // responses iteration
                for(let id=0; id<response.length; id++)
                {
                    // Otherwise set the data
                    var feat = response[id].features;

                    feat.forEach(function(f: any)
                    {
                        // feature id
                        f.id = index;
                        // city id
                        f.cityId = that.cities[id];

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

                            // index update
                            index += 1;
                        });

                        that.data.push(f);
                    });            
                }

                // sort features
                this.data = this.data.sort(function (x: any, y: any) {
                    return d3.descending(x.rank, y.rank);
                });

                // return the response
                return this.data;
            }).share();

            return this.dataObs;
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

    getColor(cityId: string)
    {
        return this.colors[cityId];
    }

    getColorScale(cityId: string)
    {
        return this.colorScales[cityId];
    }
}