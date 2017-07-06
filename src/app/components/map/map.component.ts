// angular components
import { Component, ViewChild, AfterViewInit, ElementRef, QueryList } from '@angular/core';

// my services
import { GMapsLayerGL } from '../../classes/gmaps.layergl.class';

@Component({
  selector: 'pulse-map',
  template: 
    `
    <md-select placeholder="Data selection" [(ngModel)]="mapSelection" [style.width]="mapWidth" style="margin: 18px 4px 4px 4px;">
        <md-option *ngFor="let option of mapOptions" [value]="option">{{ option }}</md-option>
    </md-select>
    <div #mapA [style.width]="mapWidth" [style.height]="mapHeight" style="margin: 4px;"></div>
    <div #mapB [style.width]="mapWidth" [style.height]="mapHeight" style="margin: 4px;"></div>
    `
})
export class MapComponent implements AfterViewInit 
{
  @ViewChild('mapA') mapARef: ElementRef;
  @ViewChild('mapB') mapBRef: ElementRef;
  
  private style: any;
  private mapA: GMapsLayerGL;
  private mapB: GMapsLayerGL;

  private mapWidth: string = "42vw";
  private mapHeight: string = "43vh";

  private mapOptions: string[] = ["Nyc (Flicker)", "Nyc, Sf (Flicker)"];
  private mapSelection: string;

  constructor() 
  {     
    this.style = getMapStyle();
  }

  ngAfterViewInit() 
  {
    this._createMap();
    this._loadLayerGL();
  }

  _createMap()
  {    
    this.mapA = new GMapsLayerGL();
    this.mapA.initMap(this.mapARef.nativeElement, 
    {
        center: { lat: 40.7324607, lng: -73.9887512 },
        scrollwheel: true,
        zoom: 14,
        streetViewControl: false,
        mapTypeControl: false,
        styles: this.style
    });

    this.mapB = new GMapsLayerGL();
    this.mapB.initMap(this.mapBRef.nativeElement, 
    {
        center: { lat: 40.7324607, lng: -73.9887512 },
        scrollwheel: true,
        zoom: 14,
        streetViewControl: false,
        mapTypeControl: false,
        styles: this.style
    });
}

  _loadLayerGL()
  {
    if(this.mapA) this.mapA.initLayerGL();
    if(this.mapB) this.mapB.initLayerGL();
  }
}

// map style definition
const getMapStyle = () => 
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

