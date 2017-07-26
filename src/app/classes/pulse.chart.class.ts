// angular imports
import { ElementRef } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

// my services
import { DataService } from './data.class';
import { FilterService } from './filter.class';
import { ParametersService } from './params.class'

export class PulseChart
{
    // margins setup
    private margins: any = {top: 20, right: 40, bottom: 30, left: 20};
    private height: number = 60;
    private padding: number = 50;
    
    // entire chart size
    private chartWidth: number = 0;
    private chartHeight: number = 0;
    
    // each chart size
    private elemWidth: number = 0;
    private elemHeight: number = 0;

    // html element
    private element: any;
    
    // dom elements
    private div: any;

    // svg
    private svgTime: any;
    private svgPlot: any;
    
    // charts
    private chtTime: any;
    private chtPlot: any;
    
    // axis objects
    private axiX: any;
    private axiY: any;
        
    // axis objects
    private xAxis: any;
    private yAxis: any;
    
    // range objects
    private xRange: any;
    private yRange: any;

    // scale objects
    private xScale: any;
    private yScale: any;

    // color scales
    private colorLines = d3.scaleOrdinal(d3.schemeCategory10);
    private colorCircles = d3.scaleOrdinal().range(['#FFFFFF','#C7E9C0','#006D2C']);
    
    // dataset
    private data: any;
    private timeRes: any[];
    private resetTimeFilter: boolean = false;

    // chart parameters
    private series: string = 'scalars';
    private res: string;
    private cities: any;
    
    constructor(element: ElementRef, private dataService: DataService, private filterService: FilterService, private paramsService: ParametersService)
    {
        // get current resolution
        this.res = paramsService.getTimeRes();

        // get the data
        dataService.getFeatures().subscribe((json:any)=>
        { 
            // html element reference
            this.element = element;

            // get time keys
            this.timeRes = dataService.getResolution();
            // get current cities
            this.cities = dataService.getCities();
        
            // format data
            this._buildData(json);
            
            // update the chart
            this.updateChart();
        });
        
        // filter service subscriptions
        this.filterService.getScatterSelectionChangeEmitter().subscribe( (sel: any) => 
        {
            this._buildData(sel);
            this.updateChart();
        } );

        this.filterService.getPulseTimeSelectionChangeEmitter().subscribe( (sel: any) => 
        {
            this._buildData(sel);
            this.updateChart();
        } );

        this.filterService.getMapSelectionChangeEmitter().subscribe( (sel: any)=>
        {
            this._buildData(sel);
            this.updateChart();
        });

        this.paramsService.getTimeResChangeEmitter().subscribe( (res: any) => 
        {
            this.changeResolution(res);
        } );

        // Adds event listener resize when the window changes size.
        window.addEventListener("resize", () => { this.updateChart() });
    }

    updateChart() 
    {
        // this scope
        var that = this;

        // dom elements
        this._buildDomElems();
        
        // update ranges
        this._buildRange();
        this._buildColorScales();
        
        // update the axis
        this._buildXAxis();
        this._buildYAxis();
        
        // creates the chart
        this._buildChart();
    }

    changeResolution(tRes: string)
    {
        this.res = tRes;

        this.resetTimeFilter = true;

        this.filterService.clearPulseTimeSelection();
        this.filterService.emitPulseTimeSelectionChanged();

        this.resetTimeFilter = false;
    }

    private _buildDomElems()
    {
        // element div
        this.div = d3.select(this.element.nativeElement);
        
        // chart size definition
        this.chartWidth  = this.div.node().getBoundingClientRect().width;
        this.chartHeight = this.div.node().getBoundingClientRect().height;

        // small chart size
        this.elemWidth  = this.chartWidth - this.margins.left - this.margins.right;
        this.elemHeight = this.chartHeight - this.margins.top  - this.margins.bottom ;
        
        // create the svg if not defined
        if(typeof this.svgTime === "undefined") {
            this.svgTime = this.div.append('div').append('svg');
        }

        if(typeof this.svgPlot === "undefined") {
            this.svgPlot = this.div.append('div')
                .classed("yScroll", true)
                .append('svg');
        }

        // update the sizes
        this.svgTime.attr("width", this.chartWidth).attr("height", 37);
        this.svgPlot.attr("width", this.chartWidth).attr("height", (this.height+this.padding) * this.data.length);
        
        // create the chart group if not defined
        if(typeof this.chtTime === "undefined") {
            this.chtTime = this.svgTime.append('g');
        }
        if(typeof this.chtPlot === "undefined") {
            this.chtPlot = this.svgPlot.append('g');
        }
        
        // update the sizes
        this.chtTime.attr("width", this.elemWidth).attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
        this.chtPlot.attr("width", this.elemWidth).attr("transform", "translate(" + this.margins.left + "," + 0 + ")");     
    }    

    private _buildData(feat: any)
    {
        // build data
        this.data = feat;
    }

    private _buildRange() 
    {
        // no data available
        if(this.data.length == 0) return;

        // this scope
        var that = this;

        // ranges definition
        this.yRange = [0, -Infinity];
        this.xRange = [1, this.data[0].resolutions[this.res][this.series].length];

        // mapping
        this.data.forEach(function (f: any) 
        {
            var v = d3.max(f.resolutions[that.res][that.series]);
            that.yRange[1] = d3.max([that.yRange[1], v]);
        });                    
    }

    private _buildXAxis() 
    {
        // no data available
        if(this.data.length == 0) return;

        // this scope
        var that = this;

        // scale definition
        this.xScale = d3.scaleLinear().domain(this.xRange).range([0,this.elemWidth]);

        // axis definition
        this.xAxis = d3.axisTop(this.xScale);
        
        // number of ticks
        var numTicks = this.data[0].resolutions[this.res][this.series].length;
        // x format
        var xFormat = d3.format("d");
        
        // x axis
        this.xAxis
            .ticks(numTicks)
            .tickSize(5)
            .tickFormat(xFormat);

        // data join
        var axis = this.chtTime.selectAll(".x.axis")
            .data(["time selector"]);

        // enter
        var xEnter = axis
            .enter()
            .append("g");

        // merge
        axis
            .merge(xEnter)
            .attr("class", "x axis")
            .attr("transform", "translate("+ 0 +"," + 5 + ")")
            .call(this.xAxis);

        // exit
        axis.exit().remove();

        // add
        this.chtTime.selectAll(".tick")
            .each(function()
            {
                var tick = d3.select(this);
                var circle = tick.select("circle");

                if(circle.empty())
                {
                    tick.append("circle")
                        .attr("class","ftype")
                        .attr("cx","0")
                        .attr("cy","5")
                        .attr("r",8);        
                }
                else if(that.resetTimeFilter)
                {
                    circle.classed("max", false);
                    circle.classed("sax", false);
                }
            });

        // callback
        this.chtTime.selectAll(".tick")
            .on("click", function(d: any)
            {
                var self = d3.select(this).select("circle");

                var maxClass = self.classed("max");
                var saxClass = self.classed("sax");

                var max = {'val': d-1, 'res': that.res, 'type': 1};
                var sax = {'val': d-1, 'res': that.res, 'type': 2};

                if(!maxClass && !saxClass)
                {
                    self.classed("max", true);
                    self.classed("sax", false);

                    that.filterService.delFromPulseTimeSelection(sax);
                    that.filterService.addToPulseTimeSelection(max);
                }
                else if(maxClass && !saxClass)
                {
                    self.classed("max", false);
                    self.classed("sax", true);

                    that.filterService.delFromPulseTimeSelection(max);
                    that.filterService.addToPulseTimeSelection(sax);
                }
                else 
                {
                    self.classed("max", false);
                    self.classed("sax", false);

                    that.filterService.delFromPulseTimeSelection(max);
                    that.filterService.delFromPulseTimeSelection(sax);
                }

                that.filterService.emitPulseTimeSelectionChanged();
            });
    }

    private _buildYAxis() 
    {
        // this scope
        var that = this;

        // scale definition
        this.yScale = d3.scaleLinear().domain(this.yRange).range([this.height,0]);
        
        // axis
        this.yAxis = d3.axisLeft(this.yScale);

        // number of ticks
        var numTicks = 3;
        
        // y format
        var yFormat = d3.format("d");
        
        // y axis
        this.yAxis
            .ticks(numTicks)
            .tickSize(-this.elemWidth)
            .tickFormat(yFormat);
    }

    _buildColorScales()
    {
        // color scales
        this.colorLines.domain(this.cities);
        this.colorCircles.domain(<any>[0,1,2]);
    }

    private _buildChart() 
    {
        // this scope
        var that = this;

        // line generator
        var line = d3.line()
            .curve(d3.curveLinear)
            .x(function(d: any, i: any) { return that.xScale(i+1); })
            .y(function(d: any) { return that.yScale(d); });

        // updates the chart hight based on data size
        this.chtPlot.attr("height", this.data.length?(this.data.length+1)*(this.height + this.padding):10 );

        //-------

        // panels join
        var panels = this.chtPlot
            .selectAll(".pulsePanel")
            .data(this.data);

        // panels enter 
        var enter = panels
            .enter()
            .append("g")
            .attr("class", "pulsePanel");
        
        // panels merge
        panels
            .merge(enter)
            .attr("transform", function(d: any, i: any){
                return "translate(" + 0 + "," + i*(that.height + that.padding) + ")";
            });

        // panels remove
        panels.exit().remove();

        //---------

        // updates the lines
        panels
            .select(".feature")
            .select("path")
            .attr("d", function(d: any) { return line(d.resolutions[that.res][that.series]); })
            .style("stroke", function(d: any) { return that.colorLines(d.map); });

        // appends the lines
        enter
            .append("g")
            .attr("class", "feature")
            .append("path")
            .attr("class", "line")
            .attr("d", function(d: any) { return line(d.resolutions[that.res][that.series]); })
            .style("stroke", function(d: any) { return that.colorLines(d.map); });

        // ---------

        // updates the y axis
        panels
            .select(".y.axis")
            .call(this.yAxis);        

        // appends the y axis
        enter
            .append("g")
            .attr("class", "y axis")
            .attr("transform", function() { return "translate(0,0)"; })
            .call(this.yAxis);

        // ---------

        // enter panels: circles join
        var eCircles = enter
            .selectAll(".circle")
            .data( function(d: any){ return that._getBeatTypes(d);} );

        // enter panels: circles enter
        var eCirclesEnter = eCircles
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", function(d: any, i: any){
                return that.xScale(i+1);
            })
            .attr("cy", this.height + 20)
            .attr("r", 8)
            .attr("fill", function(d: any) { return that.colorCircles(d); });

        // enter panels: circles update
        eCircles
            .attr("cx", function(d: any, i: any){
                return that.xScale(i+1);
            })
            .attr("cy", this.height + 20)
            .attr("r", 8)
            .attr("fill", function(d: any) { return that.colorCircles(d); });
        
        // enter panels: remove circles
        eCircles.exit().remove();
        
        // --------

        // update panels: circles join
        var pCircles = panels
            .selectAll(".circle")
            .data( function(d: any){ return that._getBeatTypes(d);} );

        // circles enter
        var pCirclesEnter = pCircles
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", function(d: any, i: any){
                return that.xScale(i+1);
            })
            .attr("cy", this.height + 20)
            .attr("r", 8)
            .attr("fill", function(d: any) { return that.colorCircles(d); });

        // circles update
        pCircles
            .attr("cx", function(d: any, i: any){
                return that.xScale(i+1);
            })
            .attr("cy", this.height + 20)
            .attr("r", 8)
            .attr("fill", function(d: any) { return that.colorCircles(d); });

        // remove circles
        pCircles.exit().remove();

        // mouse capture rectangle
        enter.append('rect')
        .style('visibility', 'hidden')
        .style('pointer-events', 'all')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', that.elemWidth)
        .attr('height', that.elemHeight)
        .on("mouseover", function(d:any){
            console.log("in",d);
        })
        .on("mouseout", function(d:any){
            console.log("out",d);
        });
}

    private _getBeatTypes(feature: any) 
    {
        var beats = [];
        var maxTime = feature.resolutions[this.res]["maxTime"];
        var sigMaxTime = feature.resolutions[this.res]["sigMaxTime"];
        for(var i=0; i<maxTime.length; i++) 
        {
            var b = (maxTime[i]?(sigMaxTime[i]?2:1):0);
            beats.push(b);
        }
        
        return beats;
    }    
}