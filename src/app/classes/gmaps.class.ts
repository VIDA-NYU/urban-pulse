import { Injectable } from '@angular/core';


@Injectable()
export class GMapsLayer 
{
    private map: google.maps.Map;
    private overlay: google.maps.OverlayView;
    private projection: google.maps.MapCanvasProjection;
    private bounds: any;
    private div: any;

    constructor() { }

    initMap(mapHtmlElement: HTMLElement, options: google.maps.MapOptions)
    {
        var that = this;

        this.map = new google.maps.Map(mapHtmlElement, options);
        this.overlay = new google.maps.OverlayView();
        this.overlay.setMap(this.map);
        this.overlay.draw = function() {
            if(that.bounds != undefined) {
                that.projection = that.overlay.getProjection();

                let sw = that.projection.fromLatLngToDivPixel(that.bounds.getSouthWest());
                let ne = that.projection.fromLatLngToDivPixel(that.bounds.getNorthEast());
                that.div.style.left = sw.x + 'px';
                that.div.style.top = ne.y + 'px';
                that.div.style.width = (ne.x - sw.x) + 'px';
                that.div.style.height = (sw.y - ne.y) + 'px';
            }
        }

        google.maps.event.addListener(this.map, 'idle', function() {

            if(that.bounds != undefined) {
                that.projection = that.overlay.getProjection();

                let sw = that.projection.fromLatLngToDivPixel(that.bounds.getSouthWest());
                let ne = that.projection.fromLatLngToDivPixel(that.bounds.getNorthEast());
                that.div.style.left = sw.x + 'px';
                that.div.style.top = ne.y + 'px';
                that.div.style.width = (ne.x - sw.x) + 'px';
                that.div.style.height = (sw.y - ne.y) + 'px';
            }

        });

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

    setData(json: any)
    {
        var that = this;

        this.bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(json['latLng'][0], json['latLng'][1]),
            new google.maps.LatLng(json['latLng'][2], json['latLng'][3])
        );

        let width = json['gridSize'][0];
        let height = json['gridSize'][1];
        let values = json['values'];
        let range = json['range'];
        let buffer = new Uint8ClampedArray(width * height * 4);

        for(let x = 0; x < width; x++) {
            for(let y = 0; y < height; y++) {
                let posv = ((height - y) * width + x);
                let val = (values[posv] - range[0]) / (range[1] - range[0]);
                let posb = (y * width + x);
                buffer[4*posb] =  255.0 * val * 10;
                buffer[4*posb+1] = 0;
                buffer[4*posb+2] = 0;
                buffer[4*posb+3] = 255.0 * val * 10;
            }
        }
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        let idata = ctx.createImageData(width, height);
        idata.data.set(buffer);
        ctx.putImageData(idata, 0, 0);

        let dataUri = canvas.toDataURL();
        let img = document.createElement('img');
        img.src = dataUri;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.position = 'absolute';

        // overlay
        this.div = document.createElement('div');
        this.div.style.borderStyle = 'none';
        this.div.style.borderWidth = '0px';
        this.div.style.position = 'absolute';

        this.div.appendChild(img);  
        var panes = this.overlay.getPanes();
        panes.overlayLayer.appendChild(this.div);
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