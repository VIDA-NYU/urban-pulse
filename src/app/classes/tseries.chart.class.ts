// angular imports
import { ElementRef } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

// my services
import { DataService } from './data.class';

export class TseriesChart{
    // margins setup
    private margins: any = {top: 20, right: 20, bottom: 30, left: 50};
    
    private element: any;

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

    private res: string = "MONTH";
    private data: any;
    private timeRes: any[];
    
    constructor(element: ElementRef, private dataService : DataService){
        dataService.getFeatures().subscribe((json:any)=>{ 

            // this.element = element;
            // // sort features
            // var features = json.features.sort(function(x: any, y: any) {
            //     return d3.ascending(x.rank, y.rank);
            // });
            // this.timeRes = Object.keys(features[features.length-1]["resolutions"]);

            // // remove ALL key
            // this.timeRes.splice(this.timeRes.indexOf("ALL"),1);

            // this.data = features;
            // features.map(function(f:any) {
            //     var fnRank = f.resolutions[res].fnRank;
            //     var maxRank = f.resolutions[res].fnRank;
            //     var sigRank = f.resolutions[res].fnRank;
            //     var x = Math.sqrt(maxRank*maxRank + fnRank*fnRank + sigRank*sigRank);
            //     var y = f.rank;

            //     that.xRange[0] = Math.min(that.xRange[0], x);
            //     that.xRange[1] = Math.max(that.xRange[1], x);

            //     that.yRange[0] = Math.min(that.yRange[0], y);
            //     that.yRange[1] = Math.max(that.yRange[1], y);
            // }

            // this._buildChart();

            // // Adds event listener resize when the window changes size.
            // window.addEventListener("resize", () => { this._resize() });
        });
    }

    private _buildChart() {
        var that = this;
        var isSearch = false;

        this.div = d3.select(this.element.nativeElement);
        this.div.select('svg').remove();

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

        

        this.svg = this.div.append('svg')
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
                        .attr("cx", function(d: any) { return that.xScale(d.x); })
                        .attr("cy", function(d: any) { return that.yScale(d.y); })
                        .attr("r", 4)
                        .style("fill", function(d: any) { return "blue"; });

                circles.exit().remove();
            });

    }

    private _resize(){
        this._buildChart();    
    }
}