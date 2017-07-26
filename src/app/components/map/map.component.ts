// angular components
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

// my services
import { GMapsLayer } from '../../classes/gmaps.class';
import { DataService } from '../../classes/data.class';
import { FilterService } from '../../classes/filter.class';
import { ParametersService } from '../../classes/params.class';

// lodash
import * as _ from 'lodash';

@Component({
    selector: 'pulse-map',
    template:
    `
    <div #map1 class="map"></div>
    <div #map2 class="map"></div>
    `
})
export class MapComponent implements AfterViewInit {

    @ViewChild('map1') mapTopRef: ElementRef;
    @ViewChild('map2') mapBotRef: ElementRef;

    private map1: GMapsLayer;
    private map2: GMapsLayer;

    private gmapsOptions: any = 
        {
            center: { lat: 40.7324607, lng: -73.9887512 },
            scrollwheel: true,
            zoom: 14,
            maxZoom: 13,
            streetViewControl: false,
            mapTypeControl: false,
            clickableIcons: false,
            styles: getMapStyle()
        }

    private cities: string[];

    constructor(private dataService : DataService, private filterService : FilterService, private paramsService : ParametersService) 
    {
        this.cities = dataService.getCities();

        this.paramsService.getShowScalarFunctionEmitter().subscribe( (res: any) => 
        {
            this._scalarVisibility(res);
        } );
    }

    ngAfterViewInit() 
    {
        this._createMap();
        this._loadLayer();
    }

    private _createMap() {
        this.map1 = new GMapsLayer(this.dataService, this.filterService);
        this.map1.initMap(this.mapTopRef.nativeElement, this.gmapsOptions, this.cities[0]);

        this.map2 = new GMapsLayer(this.dataService, this.filterService);
        this.map2.initMap(this.mapBotRef.nativeElement, this.gmapsOptions, this.cities[1]);
    }

    private _loadLayer() 
    {
        this.dataService.getScalar().subscribe((json: any) => 
        {
            if (this.map1) this.map1.setScalarData(json);
            if (this.map2) this.map2.setScalarData(json);
        });

        this.dataService.getFeatures().subscribe((json: any) => 
        {
            var data01: any = [];
            var data02: any = [];

            _.forEach(json, function(d)
            {
                if(d.cityId === 'map1') data01.push(d);
                if(d.cityId === 'map2') data02.push(d);            
            });

            if (this.map1) this.map1.setFeaturesData(data01);
            if (this.map2) this.map2.setFeaturesData(data02);
        });
    }

    private _scalarVisibility(val: boolean)
    {
        this.map1.scalarVisibility(val);
        this.map2.scalarVisibility(val);
    }
}

// map style definition
const getMapStyle = function() 
{
    return [
        {
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#f5f5f5"
                }
            ]
        },
        {
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#616161"
                }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#f5f5f5"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#bdbdbd"
                }
            ]
        },
        {
            "featureType": "administrative.neighborhood",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#eeeeee"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#757575"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e5e5e5"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#757575"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#dadada"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#616161"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e5e5e5"
                }
            ]
        },
        {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#eeeeee"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#c9c9c9"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        }
    ];
}

