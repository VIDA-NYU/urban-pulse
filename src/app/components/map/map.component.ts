// angular components
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

// my services
import { GMapsLayer } from '../../classes/gmaps.class';
import { DataService } from '../../classes/data.class';

    // <md-select placeholder="Data selection" [(ngModel)]="mapSelection" (change)="_addData()" style="width: 98%;  margin: 18px 4px 4px 4px;">
    //     <md-option *ngFor="let option of mapOptions" [value]="option">{{ option }}</md-option>
    // </md-select>

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

    private mapOptions: string[] = ["[Nyc Winter, Nyc Summer] (Flickr Data)", "[Nyc, Sf] (Flickr Data)"];
    private mapSelection: string;
    private gmapsOptions: any = 
        {
            center: { lat: 40.7324607, lng: -73.9887512 },
            scrollwheel: true,
            zoom: 14,
            streetViewControl: false,
            mapTypeControl: false,
            clickableIcons: false,
            styles: getMapStyle()
        }

    constructor(private dataService : DataService) {

    }

    ngAfterViewInit() {
        this._createMap();
        this._loadLayer();
    }

    private _createMap() {
        this.map1 = new GMapsLayer();
        this.map1.initMap(this.mapTopRef.nativeElement, this.gmapsOptions);

        this.map2 = new GMapsLayer();
        this.map2.initMap(this.mapBotRef.nativeElement, this.gmapsOptions);
    }

    private _loadLayer() {

        this.dataService.getScalar().subscribe((json: any) => 
        {
            if (this.map1) this.map1.setData(json);
            if (this.map2) this.map2.setData(json);
        });
    }
}

// map style definition
const getMapStyle = () => {
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

