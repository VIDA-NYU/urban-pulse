import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';

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

    private colorScales: any = {
        'map1': d3.scaleLinear().range(<any[]>['#fee6ce', '#fdae6b', '#e6550d']).domain([0,1]),
        'map2': d3.scaleLinear().range(<any[]>['#deebf7', '#9ecae1', '#3182bd']).domain([0,1])
    };

    private colors: any = {
        'map1': 'orange',
        'map2': 'blue'
    };
    
    // observable
    private obs: Observable<any>;

    constructor(private http: Http)
    {
    }

    getPaths()
    {
        let paramId = '?data';
        let params = new URLSearchParams(window.location.search);
        let someParam = params.get(paramId);
        if(!someParam) {
            alert('Data path not supplied');
        }
        someParam = someParam.split(',');
        if(someParam.length < 2) {
            alert('Data path not supplied');
        }
        let paths = {
            'map1': someParam[0],
            'map2': someParam[1]
        };
        return paths;
    }

    getScalar() 
    {
        let paths = this.getPaths();
        return this.http.get('./' + paths['map1'] + '_ALL_0-day.scalars').map((res:any) => {
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
            let paths = this.getPaths();
            this.obs = this.http.get('./' + paths['map1']+ '-features.json')
            .map( response => {
                // Clear the observable
                this.obs = null;

                // Otherwise set the data
                var feat = response.json().features;

                // resolutions
                this.resolutions = Object.keys(feat[feat.length - 1]["resolutions"]);
                this.resolutions.splice(this.resolutions.indexOf("ALL"), 1);
                
                // adds the feature id (map1 features)
                var data01 = feat.map(function(feature: any, index: number)
                {
                    // make a copy
                    var f = _.cloneDeep(feature);

                    // feature id
                    f.id = index;
                    // map
                    f.cityId = 'map1';
                    
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

                // adds the feature id (map2 features)
                var data02 = feat.map(function(feature: any, index: number)
                {
                    // make a copy
                    var f = _.cloneDeep(feature);

                    // feature id
                    f.id = data01.length + index;
                    // map
                    f.cityId = 'map2';

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
                        f.resolutions[tRes].x = 1.1*x;
                        f.resolutions[tRes].y = 1.1*y;
                    })

                    return f;
                });

                // concat data
                this.data = data01.concat(data02);

                // sort features
                this.data = this.data.sort(function (x: any, y: any) {
                    return d3.descending(x.rank, y.rank);
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