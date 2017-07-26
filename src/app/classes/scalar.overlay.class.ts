
// import d3js
import * as d3 from 'd3';

export class ScalarOverlay extends google.maps.OverlayView 
{
    private map: google.maps.Map;
    private bounds: google.maps.LatLngBounds;
    private div: any;
    private colorScale: any;

    constructor(map: google.maps.Map, colorScale: any) 
    {
        super();
        this.map = map;
        this.setMap(this.map);

        this.colorScale = colorScale;
    }

    onAdd()
    {
        this.div = document.createElement('div');
        this.div.style.borderStyle = 'none';
        this.div.style.borderWidth = '0px';
        this.div.style.position = 'absolute';

        var panes = this.getPanes();
        panes.overlayLayer.appendChild(this.div);    
    }

    onRemove()
    {
        if (!this.map) return; 

        this.div.parentNode.removeChild(this.div);

    }

    setData(json: any)
    {
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
                let posb = (y * width + x);

                let val = (values[posv] - range[0]) / (range[1] - range[0]);
                val *= 20.0;
                let color = d3.rgb(this.colorScale(val));

                // console.log(val, color);

                buffer[4*posb] =  color.r;
                buffer[4*posb+1] = color.g;
                buffer[4*posb+2] = color.b;
                buffer[4*posb+3] = 255.0 * val;
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

        this.div.appendChild(img); 
        this.draw();
    }

    draw()
    {
        if (!this.map || !this.bounds) return;


        let projection = this.getProjection();

        let sw = projection.fromLatLngToDivPixel(this.bounds.getSouthWest());
        let ne = projection.fromLatLngToDivPixel(this.bounds.getNorthEast());
        this.div.style.left = sw.x + 'px';
        this.div.style.top = ne.y + 'px';
        this.div.style.width = (ne.x - sw.x) + 'px';
        this.div.style.height = (sw.y - ne.y) + 'px';
        
    }

}