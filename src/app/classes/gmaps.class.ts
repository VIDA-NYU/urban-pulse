import { Injectable } from '@angular/core';

import { ScalarOverlay } from './scalar.overlay.class';
import { SvgOverlay } from './svg.overlay.class';

@Injectable()
export class GMapsLayer 
{
    private map: google.maps.Map;
    private scalarOverlay: ScalarOverlay;
    private pulseOverlay: SvgOverlay;

    constructor() { }

    initMap(mapHtmlElement: HTMLElement, options: google.maps.MapOptions)
    {
        var that = this;

        this.map = new google.maps.Map(mapHtmlElement, options);
        this.scalarOverlay = new ScalarOverlay(this.map);
        this.pulseOverlay = new SvgOverlay(this.map);

        // Adds event listener resize when the window changes size.
        window.addEventListener("resize", () => { this.resize(); });

        return this;
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