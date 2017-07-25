
// import d3js
import * as d3 from 'd3';

export class SvgOverlay extends google.maps.OverlayView 
{
    private map: google.maps.Map;
    private bounds: google.maps.LatLngBounds;
    private div: any;
    private data: any[];
    private latlngs: any[];
    private size: number = 100; // size in meters

    constructor(map: google.maps.Map) 
    {
        super();
        this.map = map;
        this.setMap(this.map);

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
                    let scale = that.getScale(d[0], that.map.getZoom());
                    return that.size / scale;
                })
                .attr("cx", function(d: any){
                    let scale = that.getScale(d[0], that.map.getZoom());
                    return 2 * that.size / scale;
                })
                .attr("cy", function(d: any){
                    let scale = that.getScale(d[0], that.map.getZoom());
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
        for(let i=0; i<this.data.length; i++) {
            var latlngs = this.data[i]['latLng'];
            this.latlngs = this.latlngs.concat(latlngs);
        }
        this.draw();
    }

    getData()
    {
        return this.data;
    }

    draw()
    {
        if(!this.map || !this.div) return;

        var that = this;

        let projection = this.getProjection();

        function transform(d: any) {
            let p = projection.fromLatLngToDivPixel(new google.maps.LatLng(d[0], d[1]));
            let scale = that.getScale(d[0], that.map.getZoom());
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
                let scale = that.getScale(d[0], that.map.getZoom());
                return that.size / scale;
            })
            .attr("cx", function(d: any){
                let scale = that.getScale(d[0], that.map.getZoom());
                return 2 * that.size / scale;
            })
            .attr("cy", function(d: any){
                let scale = that.getScale(d[0], that.map.getZoom());
                return 2 * that.size / scale;
            });
        
    }

}