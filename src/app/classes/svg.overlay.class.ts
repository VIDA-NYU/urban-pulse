
// import d3js
import * as d3 from 'd3';

export class SvgOverlay extends google.maps.OverlayView 
{
    private map: google.maps.Map;
    private bounds: google.maps.LatLngBounds;
    private div: any;
    private data: any[];
    private latlngs: any[];
    private color: any;
    private size: number = 100; // size in meters

    constructor(map: google.maps.Map, color: any) 
    {
        super();
        this.map = map;
        this.setMap(this.map);

        this.color = color;

        this.data = [];
        this.latlngs = [];
    }

    // returns meters per pixel at zoom level
    getScale(lat: number, zoom: number){
        return 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
    }

    onAdd()
    {
        var that = this;

        this.div = document.createElement('div');
        this.div.style.borderStyle = 'none';
        this.div.style.borderWidth = '0px';
        this.div.style.position = 'absolute';

        var panes = this.getPanes();
        panes.overlayLayer.appendChild(this.div);   

        // make sure circles have uniform size on all zoom levels
        google.maps.event.addListener(this.map, 'zoom_changed', function() {

            d3.select(that.div).selectAll('circle')
                .attr('r', function(d: any){
                    let latlng = d.latLng;
                    let scale = that.getScale(latlng[0], that.map.getZoom());
                    return that.size / scale;
                })
                .attr("cx", function(d: any){
                    let latlng = d.latLng;
                    let scale = that.getScale(latlng[0], that.map.getZoom());
                    return 2 * that.size / scale;
                })
                .attr("cy", function(d: any){
                    let latlng = d.latLng;
                    let scale = that.getScale(latlng[0], that.map.getZoom());
                    return 2 * that.size / scale;
                })
        })
        
    }

    onRemove()
    {
        if (!this.map) return; 

        this.div.parentNode.removeChild(this.div);
        this.data = [];
        this.latlngs = [];
    }

    setData(data: any)
    {
        this.data = data;
        this.latlngs = [];
        for(let i=0; i<this.data.length; i++) 
        {
            var id = this.data[i]['id'];
            for(let j=0; j<this.data[i]['latLng'].length; j++) {
                var latlng = this.data[i]['latLng'][j];
                this.latlngs.push({'id': id, 'latLng': latlng});
            }
        }
        this.draw();
    }

    getData()
    {
        return this.data;
    }

    highlight(sel: any)
    {
        if(!this.map || !this.div) return;
        
        // this scope
        var that = this;
        
        // has highlighted element
        var notDefined = (typeof sel === 'undefined');

        // gets the map div
        var map = d3.select(this.div);

        // highlight
        map.selectAll('circle')
            .classed("highlight", function(d: any)
            {
                if(notDefined) return false;
                return sel.id === d.id; 
            })
    }

    draw()
    {
        if(!this.map || !this.div) return;

        // this scope
        var that = this;
        // current projection
        let projection = this.getProjection();

        // lat lng to pixel
        function transform(d: any) {
            let latlng = d.latLng;
            let p = projection.fromLatLngToDivPixel(new google.maps.LatLng(latlng[0], latlng[1]));
            let scale = that.getScale(latlng[0], that.map.getZoom());
            let width = parseInt(d3.select(this).style('width'));
            let height = parseInt(d3.select(this).style('height'));

            // console.log(this, d);

            return d3.select(this)
                .style("left", (p.x - 2.0*that.size/scale) + "px")
                .style("top", (p.y - 2.0*that.size/scale) + "px");
        }

        let marker = d3.select(this.div).selectAll('svg')
            .data(this.latlngs)
            .each(transform)
            .enter()
            .append('svg')
            .each(transform)
            .attr('class', 'marker')
            .style('width', '100px')
            .style('height', '100px')
            .style('position', 'absolute');

        marker.append('circle')
            .attr('r', function(d: any){
                let latlng = d.latLng;
                let scale = that.getScale(latlng[0], that.map.getZoom());
                return that.size / scale;
            })
            .attr("cx", function(d: any){
                let latlng = d.latLng;
                let scale = that.getScale(latlng[0], that.map.getZoom());
                return 2 * that.size / scale;
            })
            .attr("cy", function(d: any){
                let latlng = d.latLng;
                let scale = that.getScale(latlng[0], that.map.getZoom());
                return 2 * that.size / scale;
            })
            .style("fill", this.color);        
    }

}