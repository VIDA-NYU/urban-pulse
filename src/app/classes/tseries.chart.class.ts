// angular imports
import { ElementRef } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

export class TseriesChart{
    // size setup
    private margins = {top: 20, right: 20, bottom: 30, left: 50};
    private chartWidth: 0;
    private chartHeight: 0;    

    // dom elements
    private div:  any;
    private svg:  any;
    private cht:  any;
    private axiX: any;
    private axiY: any;
        
    // axis objects
    private xAxis: any;
    private yAxis: any;
    
    private xRange: any;
    private yRange: any;
    private rRange: any;

    private xScale: any;
    private yScale: any;
    private rScale: any;

    private data: any[];
    private radius: number;

    constructor(element: ElementRef){
        this.div = d3.select(element.nativeElement);
        this.data = [{x: 1, y: 2, r: 1}, {x: 2, y: 1, r: 3}, {x: 4, y: 4, r: 2}, 
                     {x: 5, y: 3, r: 1}, {x: 3, y: 2, r: 2}];

        this._updateSvg();
        this._updateChartGroup();

        this._prepareScales();
        this._updateAxes();
        this._updateCircles();
    }

    private _updateSvg(){
        // computes the chart width
        this.chartWidth  = this.div.node().parentNode.getBoundingClientRect().width;
        this.chartWidth -= this.margins.left + this.margins.right;

        this.chartHeight  = this.div.node().parentNode.getBoundingClientRect().height;
        this.chartHeight -= this.margins.top + this.margins.bottom;
        this.chartHeight *= 0.4;

        // creates the chart svg
        if(typeof this.svg === 'undefined')
            this.svg = this.div.append('svg');

        // updates the chart svg
        this.svg
            .attr( 'width', this.chartWidth + this.margins.left + this.margins.right)
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

    private _prepareScales(){
        // scales parameters
        var xVals = _.map(this.data, function(d){
            return d.x;
        });

        var yVals = _.map(this.data, function(d){
            return d.y;
        });

        var rVals = _.map(this.data, function(d){
            return d.r;
        });

        xVals = xVals.sort();
        yVals = yVals.sort();
        rVals = rVals.sort();
        
        this.xRange = [xVals[0], xVals[xVals.length-1]];
        this.yRange = [yVals[0], yVals[yVals.length-1]];
        this.rRange = [rVals[0], rVals[rVals.length-1]];

        console.log(this.xRange, this.yRange, this.rRange)
    }

    private _updateAxes(){

        // build scales
        this.xScale = d3.scaleLinear().domain(this.xRange).range([0,this.chartWidth]);
        this.yScale = d3.scaleLinear().domain(this.yRange).range([0,this.chartHeight]);

        // radius size
        var dy = this.yScale(this.yRange[1]) - this.yScale(this.yRange[0]);
        var dx = this.xScale(this.xRange[1]) - this.xScale(this.xRange[0]);
        this.radius = 0.03*Math.min(dx, dy);

        // radius scale
        this.rScale = d3.scaleLinear().domain(this.rRange).range([5,this.radius+5]).clamp(true);

        // build axes
        if(typeof this.axiX === 'undefined') this.axiX = this.svg.append('g');
        if(typeof this.axiY === 'undefined') this.axiY = this.svg.append('g');

        this.axiX
            .attr('class', 'xAxis')
            .attr('transform', 'translate('+ (this.margins.left-0.5*this.radius) +','+ (this.margins.top + this.chartHeight) +')');

        this.axiY
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ (this.margins.left-0.5*this.radius) +','+ this.margins.top  +')');

        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);

        this.axiX
            .attr("class", "axisCustom")
            .call(this.xAxis);

        this.axiY
            .attr("class", "axisCustom")
            .call(this.yAxis);
        }

    private _updateCircles(){
        // transition
        var t = d3.transition().duration(450);

        var circles = this.cht.selectAll('circle')
            .data(this.data);

        // enter
        circles
            .enter()
            .append("circle")
            .attr("cx", (d:any) => { return this.xScale(+d.x); })
            .attr("cy", (d:any) => { return this.yScale(+d.y); })
            .attr("r" , (d:any) => { return this.rScale(+d.r); })
            .style("stroke", "#555")
            .style("fill", "#bfbfbf")
            .style("fill-opacity", 0)
            .style("stroke-opacity", 0)
            .transition(t)
            .style("fill-opacity", 1)
            .style("stroke-opacity", 1);
    }
}