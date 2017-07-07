// angular components
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

// my services
import { GMapsLayerGL } from '../../classes/gmaps.layergl.class';

@Component({
    selector: 'pulse-map',
    template:
    `
    <md-select placeholder="Data selection" [(ngModel)]="mapSelection" (change)="_addData()" style="width: 98%;  margin: 18px 4px 4px 4px;">
        <md-option *ngFor="let option of mapOptions" [value]="option">{{ option }}</md-option>
    </md-select>
    <div #mapTop [style.height]="mapHeight" style="margin: 4px;"></div>
    <div #mapBot [style.height]="mapHeight" style="margin: 4px;"></div>
    `
})
export class MapComponent implements AfterViewInit {

    @ViewChild('mapTop') mapTopRef: ElementRef;
    @ViewChild('mapBot') mapBotRef: ElementRef;

    private style: any;
    private mapTop: GMapsLayerGL;
    private mapBot: GMapsLayerGL;

    private mapHeight: string = "41%";

    private mapOptions: string[] = ["[Nyc Winter, Nyc Summer] (Flickr Data)", "[Nyc, Sf] (Flickr Data)"];
    private mapSelection: string;

    constructor() {
        this.style = getMapStyle();
    }

    ngAfterViewInit() {
        this._createMap();
        this._loadLayerGL();
    }

    private _createMap() {
        this.mapTop = new GMapsLayerGL();
        this.mapTop.initMap(this.mapTopRef.nativeElement,
            {
                center: { lat: 40.7324607, lng: -73.9887512 },
                scrollwheel: true,
                zoom: 14,
                streetViewControl: false,
                mapTypeControl: false,
                clickableIcons: false,
                styles: this.style
            });

        this.mapBot = new GMapsLayerGL();
        this.mapBot.initMap(this.mapBotRef.nativeElement,
            {
                center: { lat: 40.7324607, lng: -73.9887512 },
                scrollwheel: true,
                zoom: 14,
                streetViewControl: false,
                mapTypeControl: false,
                clickableIcons: false,
                styles: this.style
            });
    }

    private _loadLayerGL() {
        if (this.mapTop) this.mapTop.initLayerGL();
        if (this.mapBot) this.mapBot.initLayerGL();
    }

    private _addData() {
        if (this.mapTop) this.mapTop.addData();
        if (this.mapBot) this.mapBot.addData();
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

