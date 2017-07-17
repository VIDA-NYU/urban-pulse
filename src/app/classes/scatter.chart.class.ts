// angular imports
import { ElementRef } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

// my services
import { DataService } from './data.class';

export class ScatterChart{
    // margins setup
    private margins: any = {top: 20, right: 20, bottom: 30, left: 50};
    
    // entire chart size
    private chartWidth: number = 0;
    private chartHeight: number = 0;
    // each matrix size
    private elemWidth: number = 0;
    private elemHeight: number = 0;

    // dom elements
    private div: any;
    private svg: any;
    private cht: any;
    private axiX: any;
    private axiY: any;
        
    // axis objects
    private xAxis: any;
    private yAxis: any;
    
    private xRange: any;
    private yRange: any;

    private xScale: any;
    private yScale: any;

    private data: any;
    private timeRes: any[];

    private search: boolean;
    
    constructor(element: ElementRef, private dataService : DataService){
        dataService.getFeatures().subscribe((json:any)=>{ 

            // sort features
            var features = json.features.sort(function(x: any, y: any) {
                return d3.ascending(x.rank, y.rank);
            });
            this.timeRes = Object.keys(features[features.length-1]["resolutions"]);

            // remove ALL key
            this.timeRes.splice(this.timeRes.indexOf("ALL"),1);

            this.data = {};
            this.xRange = [Infinity, -Infinity];
            this.yRange = [Infinity, -Infinity];
            var that = this;
            this.timeRes.forEach(function(res) {
                that.data[res] = features.map(function(f:any) {
                    var resolution = res;
                    var fnRank = f.resolutions[resolution].fnRank;
                    var maxRank = f.resolutions[resolution].fnRank;
                    var sigRank = f.resolutions[resolution].fnRank;
                    var x = Math.sqrt(maxRank*maxRank + fnRank*fnRank + sigRank*sigRank);
                    var y = f.rank;

                    that.xRange[0] = Math.min(that.xRange[0], x);
                    that.xRange[1] = Math.max(that.xRange[1], x);

                    that.yRange[0] = Math.min(that.yRange[0], y);
                    that.yRange[1] = Math.max(that.yRange[1], y);

                    return {x: x, y: y};
                });
            });

            

            this._buildChart(element);

            // Adds event listener resize when the window changes size.
            window.addEventListener("resize", () => { this._resize() });
        });
    }

    private _buildChart(element : ElementRef) {
        var that = this;
        var isSearch = false;

        this.div = d3.select(element.nativeElement);

        this.chartWidth  = this.div.node().getBoundingClientRect().width;
        this.chartWidth -= this.margins.left + this.margins.right;
        this.chartHeight  = this.div.node().getBoundingClientRect().height;
        this.chartHeight -= this.margins.top + this.margins.bottom;

        // scale
        this.xScale = d3.scaleLinear().domain(this.xRange).range([0,this.chartWidth / 3]);
        this.yScale = d3.scaleLinear().domain(this.yRange).range([this.chartHeight,0]);

        // axis
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);

        var numTicks = isSearch?5:5;
        this.xAxis
            .ticks(numTicks)
            .tickSize( this.chartHeight )
            .tickFormat(d3.format(".1f"));

        var yFormat = !isSearch?d3.format(".1f"):d3.format("f");
        this.yAxis
            .ticks(numTicks)
            .tickSize(-this.chartWidth * this.timeRes.length, 0)
            .tickFormat(yFormat);

        this.svg = this.div.append("svg")
            .attr("width",  this.chartWidth)
            .attr("height", this.chartHeight)
            .append("g")
            .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");

        this.svg.selectAll(".x.axis")
            .data(this.timeRes)
            .enter().append("g")
            .attr("class", "x axis")
            .attr("transform", function(d: any, i: any) {
                var pos = isSearch?0:i;
                return "translate(" + (pos * that.chartWidth / that.timeRes.length) + "," + 0 + ")";
            })
            .each(function(d: any) {
                that.xScale.domain(that.xRange);
                d3.select(this).call(that.xAxis);
            });

        this.svg.selectAll(".y.axis")
            .data(["func"])
            .enter()
            .append("g")
            .attr("class", "y axis")
            .attr("transform", function(d: any, i: any) {
                var pos = isSearch?0:i;
                return "translate("+ (pos*(that.chartWidth / that.timeRes.length)) +", 0)";
            })
            .each(function() {
                that.yScale.domain(that.yRange);
                d3.select(this).call(that.yAxis);
            });

        this.svg.selectAll('.cell')
            .data(this.timeRes)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', function(d: any, i: any) {
                var pos = isSearch?0:i;
                return "translate(" + (pos*(that.chartWidth / that.timeRes.length)) + ", 0)";
            })
            .each(function(d: any) {
                var cell = d3.select(this);
                var data = that.data[d];

                cell.append("rect")
                    .attr("class", "frame")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width",  that.chartWidth / that.timeRes.length)
                    .attr("height", that.chartHeight );

                var circles = cell.selectAll("circle")
                    .data(data);

                circles.enter().append("circle")
                        .attr("cx", function(d) { return that.xScale(d.x); })
                        .attr("cy", function(d) { return that.yScale(d.y); })
                        .attr("r", 4)
                        .style("fill", function(d) { return "blue"; });

                circles.exit().remove();
            });

    }

    private _updateSvg(){
        // computes the chart width
        this.chartWidth  = this.div.node().getBoundingClientRect().width;
        this.chartWidth -= this.margins.left + this.margins.right;
        this.chartHeight  = this.div.node().getBoundingClientRect().height;
        this.chartHeight -= this.margins.top + this.margins.bottom;

        // creates the chart svg
        if(typeof this.svg === 'undefined')
            this.svg = this.div.append('svg');

        // updates the chart svg
        this.svg
            .attr('width', this.chartWidth + this.margins.left + this.margins.right)
            .attr('height', this.chartHeight + this.margins.top  + this.margins.bottom);
    }

    private _updateChartGroup(){
        // creates the chart group
        if(typeof this.cht === 'undefined')
            this.cht = this.svg.append('g');

        // set properties
        this.cht
            .attr('width', this.chartWidth)
            .attr('height', this.chartHeight)
            .attr('transform', 'translate('+ this.margins.left +','+ this.margins.top +')' );
    }

    private _updateAxes(){

        // build scales
        this.xScale = d3.scaleLinear().domain(this.xRange).range([0,this.chartWidth]);
        this.yScale = d3.scaleLinear().domain(this.yRange).range([this.chartHeight,0]);

        // radius size
        var radius = 4.0;

        // build axes
        if(typeof this.axiX === 'undefined') this.axiX = this.svg.append('g');
        if(typeof this.axiY === 'undefined') this.axiY = this.svg.append('g');

        this.axiX
            .data(this.timeRes)
            .enter()
            .append('g')
            .attr('class', 'xAxis')
            .attr('transform', function(d,i) {
                console.log(d,i);
                return 'translate('+ (_this.margins.left-0.5*radius) +','+ (_this.margins.top + _this.chartHeight) +')'
            });

        this.axiY
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ (this.margins.left-0.5*radius) +','+ this.margins.top  +')');

        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);

        this.axiX
            .attr("class", "axisCustom")
            .call(this.xAxis);

        this.axiY
            .attr("class", "axisCustom")
            .call(this.yAxis);
        }

    private _updateMatrix(){
        // transition
        var t = d3.transition(null).duration(450);

        var circles = this.cht.selectAll('circle')
            .data(this.data);

        // enter
        circles
            .enter()
            .append("circle")
            .attr("cx", (d:any) => { return this.xScale(+d.x); })
            .attr("cy", (d:any) => { return this.yScale(+d.y); })
            .attr("r" , 4.0)
            .style("stroke", "#555")
            .style("fill", "#bfbfbf")
            .style("fill-opacity", 0)
            .style("stroke-opacity", 0)
            .transition(t)
            .style("fill-opacity", 1)
            .style("stroke-opacity", 1);

        // update
        circles
            .transition(t)
            .attr("cx", (d:any) => { return this.xScale(+d.x); })
            .attr("cy", (d:any) => { return this.yScale(+d.y); })
            .attr("r" , 1.0)
            .style("stroke", "#555")
            .style("fill", "#bfbfbf")

        // exit selection
        circles
            .exit()
            .transition(t)
            .style("fill-opacity", 0)
            .style("stroke-opacity", 0)
            .remove();
    }

    private _resize(){
        this._updateSvg();
        this._updateChartGroup();

        this._updateAxes();
        this._updateMatrix();        
    }
}