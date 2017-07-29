import { Injectable } from '@angular/core';

import { ScalarOverlay } from './scalar.overlay.class';
import { SvgOverlay } from './svg.overlay.class';

import { DataService } from './data.class';
import { FilterService } from './filter.class';
import { ParametersService } from './params.class';

// lodash
import * as _ from 'lodash';

@Injectable()
export class GMapsLayer 
{
    private map: google.maps.Map;
    private drawing: google.maps.drawing.DrawingManager;
    private selectedShape: any;
    private scalarOverlay: ScalarOverlay;
    private pulseOverlay: SvgOverlay;
    private cityId: string;

    constructor(private dataService: DataService, private filterService: FilterService, private paramsService: ParametersService) 
    { 
        this.filterService.getPulseMouseOverChangeEmitter().subscribe( (data: any)=>
        {
            this.pulseOverlay.highlight(data);
        });

        this.filterService.getScatterSelectionChangeEmitter().subscribe( (sel: any) => 
        {
            sel = _.filter(sel, (x: any) => x.cityId === this.cityId);
            this.pulseOverlay.setData(sel);
        } );
    }

    initMap(mapHtmlElement: HTMLElement, options: google.maps.MapOptions, cityId: string)
    {
        let that = this;

        this.map = new google.maps.Map(mapHtmlElement, options);
        this.cityId = cityId;
        this.scalarOverlay = new ScalarOverlay(this.map, this.dataService.getColorScale(cityId));
        this.pulseOverlay = new SvgOverlay(this.map, this.dataService.getColor(cityId));

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

            // delete old shape
            if(that.selectedShape) {
                that.selectedShape.setMap(null);
                that.selectedShape.setVisible(false);
                that.selectedShape.setDraggable(false);
                that.selectedShape.setEditable(false);
            }

            let shape = e.overlay;
            that.filter(e);
            if(that.drawing.getDrawingMode()) {
                that.drawing.setDrawingMode(null);
            }

            that.selectedShape = shape;

            google.maps.event.addListener(shape, 'rightclick', function(e: any) 
            {
                that.selectedShape = null;
                shape.setMap(null);
                shape.setVisible(false);
                shape.setDraggable(false);
                shape.setEditable(false);

                that.paramsService.isSearch = false;
                that.paramsService.searchId = "none";
                that.paramsService.emitSearchIdChanged();

                // clear map
                that.filterService.clearMapSelection(that.cityId);                
                // clear update data
                that.filterService.clearScatterSelection(that.dataService.getData());
                // clear 
                that.filterService.emitMapSelectionChanged();

            });

            google.maps.event.addListener(shape, 'drag', function() {
                shape.isDragging = true ;
            });

            if(e.type == 'rectangle') 
            {                
                google.maps.event.addListener(shape, 'bounds_changed', function() {
                    if(shape.isDragging) return;
                    that.filter(e);
                });
                google.maps.event.addListener(shape, 'dragend', function() {
                    that.filter(e);
                    shape.isDragging = false;
                });
            }
            else if(e.type == 'polygon') 
            {
                let path = shape.getPath();
                google.maps.event.addListener(path, 'set_at', function() {
                    if(shape.isDragging) return;
                    that.filter(e);
                });
                google.maps.event.addListener(path, 'insert_at', function() {
                    if(shape.isDragging) return;
                    that.filter(e);
                });
                google.maps.event.addListener(shape, 'dragend', function() {
                    that.filter(e);
                    shape.isDragging = false;
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
        // that.drawing.setDrawingMode(null);

        let selectedFeatures = [];
        let features = that.pulseOverlay.getData();
        
        that.filterService.clearMapSelection(that.cityId);
        
        for(let i=0; i<features.length; i++) 
        {
            let latlngs = features[i]['latLng'];

            for(let j=0; j<latlngs.length; j++) 
            {
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

        that.filterService.emitMapSelectionChanged();
    }

    scalarVisibility(val: boolean)
    {
        this.scalarOverlay.visibility(val)
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