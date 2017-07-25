import { Injectable } from '@angular/core';

import { ScalarOverlay } from './scalar.overlay.class';
import { SvgOverlay } from './svg.overlay.class';

import { DataService } from './data.class';
import { FilterService } from './filter.class';

@Injectable()
export class GMapsLayer 
{
    private map: google.maps.Map;
    private drawing: google.maps.drawing.DrawingManager;
    private selectedShape: any;
    private scalarOverlay: ScalarOverlay;
    private pulseOverlay: SvgOverlay;

    constructor(private dataService: DataService, private filterService: FilterService) { }

    initMap(mapHtmlElement: HTMLElement, options: google.maps.MapOptions)
    {
        let that = this;

        this.map = new google.maps.Map(mapHtmlElement, options);
        this.scalarOverlay = new ScalarOverlay(this.map);
        this.pulseOverlay = new SvgOverlay(this.map);

        this.drawing = new google.maps.drawing.DrawingManager(<google.maps.drawing.DrawingManagerOptions>{
            drawingMode: null,
            drawingControl: true,
            drawingControlOptions: <google.maps.drawing.DrawingControlOptions>{
                position: <google.maps.ControlPosition>google.maps.ControlPosition.TOP_CENTER,
                drawingModes: <google.maps.drawing.OverlayType[]>[
                    <google.maps.drawing.OverlayType>google.maps.drawing.OverlayType.RECTANGLE,
                    <google.maps.drawing.OverlayType>google.maps.drawing.OverlayType.POLYGON
                ]
            },
            rectangleOptions: {
                clickable: true,
                draggable: true,
                editable: true
            },
            polygonOptions: {
                clickable: true,
                draggable: true,
                editable: true
            }
        });

        this.drawing.setMap(this.map);

        google.maps.event.addListener(this.drawing, 'overlaycomplete', function(e: any) {
            let shape = e.overlay;
            that.filter(e);

            google.maps.event.addListener(shape, 'rightclick', function(e: any) {
                shape.setMap(null);
                that.filterService.clearMapSelection();
            });

            if(e.type == 'rectangle') {
                google.maps.event.addListener(shape, 'bounds_changed', function() {
                    that.filter(e);
                });
                google.maps.event.addListener(shape, 'drag', function() {
                    that.filter(e);
                });
            }
            else if(e.type == 'polygon') {
                let path = shape.getPath();
                google.maps.event.addListener(path, 'set_at', function() {
                    that.filter(e);
                });
                google.maps.event.addListener(path, 'insert_at', function() {
                    that.filter(e);
                });
                google.maps.event.addListener(shape, 'drag', function() {
                    that.filter(e);
                });
            }

        });
        google.maps.event.addListener(this.map, 'click', function(e: any) {
            that.drawing.setDrawingMode(null);
        });

        // Adds event listener resize when the window changes size.
        window.addEventListener("resize", () => { this.resize(); });

        return this;
    }

    filter(e: any)
    {
        let that = this;
        let shape = e.overlay;
        that.selectedShape = shape;
        that.drawing.setDrawingMode(null);

        let selectedFeatures = [];
        let features = that.pulseOverlay.getData();
        for(let i=0; i<features.length; i++) {
            let latlngs = features[i]['latLng'];
            for(let j=0; j<latlngs.length; j++) {
                let lat = latlngs[j][0];
                let lon = latlngs[j][1];
                let ll = new google.maps.LatLng(lat,lon)

                if(e.type == 'rectangle') {
                    let bounds = shape.getBounds();
                    if(bounds.contains(ll)) {
                        that.filterService.addToMapSelection(features[i]);
                    }
                }
                else if(e.type == 'polygon') {
                    if(google.maps.geometry.poly.containsLocation(ll, shape)) {
                        that.filterService.addToMapSelection(features[i]);
                    }
                }
            }      
        }
    }

    setCenter(latLng: google.maps.LatLng) 
    {
        if (this.map != null && latLng != null) 
        {
            // Changes the center of the map to the given LatLng.
            this.map.panTo(latLng);
        }
    }

    setZoom(zoom: number) 
    {
        if (this.map != null) 
        {
            this.map.setZoom(zoom);
        }
    }

    setScalarData(json: any)
    {
        this.scalarOverlay.setData(json);
    }

    setFeaturesData(json: any)
    {
        this.pulseOverlay.setData(json);
    }
    
    private resize() 
    {
        // Saves the center.
        let latLng: google.maps.LatLng = this.map.getCenter();
        // Triggers resize event.
        google.maps.event.trigger(this.map, "resize");
        // Restores the center.
        this.map.setCenter(latLng);
    }    
}