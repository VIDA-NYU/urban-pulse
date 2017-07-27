// angular imports
import { ElementRef } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

// my services
import { DataService } from './data.class';
import { FilterService } from './filter.class';
import { ParametersService } from './params.class';

export class ScatterChart 
{
    // margins setup
    private margins: any = { top: 5, right: 20, bottom: 40, left: 20 };
    private spaceBetween: number = 10;

    // entire chart size
    private chartWidth: number;
    private chartHeight: number;
    
    // each matrix size
    private elemWidth: number;
    private elemHeight: number;

    // html element
    private element: any;

    // dom elements
    private div: any;
    private svg: any;
    private cht: any;

    // axis objects
    private xAxis: any;
    private yAxis: any;

    // range objects
    private xRange: any;
    private yRange: any;

    // scale objects
    private xScale: any;
    private yScale: any;
    
    // brush object
    private brush: any;
    private brushCell: any;

    // dataset
    private data: any;
    private timeRes: any[];
    
    // chart parameters
    private nCharts: number;
    private isSearch: boolean = false;
    private cities: any;
    
    constructor(element: ElementRef, private dataService: DataService, private filterService: FilterService, private paramsService: ParametersService) 
    {
        // get the data
        this.dataService.getMultipleFeatures().subscribe((json: any) => 
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

        this.filterService.getMapSelectionChangeEmitter().subscribe( (data: any)=>
        {
            this._buildData(data);
            this._buildChart();
        });

        this.filterService.getPulseMouseOverChangeEmitter().subscribe( (data: any)=>
        {
            this.highlight(data);
        });

        // Adds event listener resize when the window changes size.
        window.addEventListener("resize", () => { this.updateChart() });
    }

    updateChart()
    {
        // number of charts
        this.nCharts = this.isSearch ? 1 : this.timeRes.length;

        // dom elements
        this._buildDomElems();
        
        // update ranges
        this._buildRange();        

        // build the axis
        this._buildAxis();

        // build brush
        this._buildBrush();
        // creates the chart
        this._buildChart();
    }

    highlight(data: any)
    {
        // this scope
        var that = this;
        
        // has highlighted element
        var notDefined = (typeof data === 'undefined');
        var highElems = (notDefined)?[]:[data];

        // add highlighted circle
        this.cht.selectAll('.cell')
            .each(function (res: any) 
            {
                // time resolution
                var tRes = res;

                // skip unavailable resolutions
                if( !(tRes in that.data[0].resolutions) ) return;
                
                // get cell and data
                var cell = d3.select(this);

                var high = cell.selectAll(".highlight")
                    .data(highElems);

                var highEnter = high
                    .enter()
                    .append("circle");

                high
                    .merge(highEnter)
                    .classed("highlight", true)
                    .attr("cx", function (d: any) { return that.xScale(d.resolutions[tRes].x); })
                    .attr("cy", function (d: any) { return that.yScale(d.resolutions[tRes].y); })
                    .attr("r", 4)
                    .style("fill", function (d: any) { return that.dataService.getColor(d.cityId); });

                high.exit().remove();
            });

    }

    private _buildDomElems()
    {
        // element div
        this.div = d3.select(this.element.nativeElement);
        
        // chart size definition
        this.chartWidth  = this.div.node().getBoundingClientRect().width;
        this.chartHeight = this.div.node().getBoundingClientRect().height;

        // small chart size
        this.elemWidth  = (this.chartWidth - this.margins.left - this.margins.right - (this.nCharts-1)*this.spaceBetween) / this.nCharts;
        this.elemHeight = this.chartHeight - this.margins.top  - this.margins.bottom ;
        
        // create the svg if not defined
        if(typeof this.svg === "undefined")
            this.svg = this.div.append('svg');
        
        // update the sizes
        this.svg.attr("width", this.chartWidth)
                .attr("height", this.chartHeight);
        
        // create the chart group if not defined
        if(typeof this.cht === "undefined")
            this.cht = this.svg.append('g');
        
        // update the sizes
        this.cht.attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");        
    }

    private _buildData(feat: any) 
    {
        // build data
        this.data = feat;
        // clear selection
        this.filterService.clearScatterSelection(this.data);
    }

    private _buildRange() 
    {
        // no data available
        if(this.data.length == 0) return;

        // this scope
        var that = this;

        // ranges definition
        // ranges definition
        this.xRange = [Infinity, -Infinity];
        this.yRange = [Infinity, -Infinity];

        // mapping
        this.data.forEach(function (f: any) 
        {
            // for each resolution
            that.timeRes.forEach(function(tRes: string)
            {
                // skip unavailable resolutions
                if( !(tRes in f.resolutions) ) return;

                // add plot coords
                var x = f.resolutions[tRes].x;
                var y = f.resolutions[tRes].y;
                // update x range
                that.xRange[0] = Math.min(that.xRange[0], x);
                that.xRange[1] = Math.max(that.xRange[1], x);

                // update y range
                that.yRange[0] = Math.min(that.yRange[0], y);
                that.yRange[1] = Math.max(that.yRange[1], y);
            })
        });
    }

    private _buildAxis()
    {
        // this scope
        var that = this;

        // scale definition
        this.xScale = d3.scaleLinear().domain(this.xRange).range([0,  this.elemWidth]);
        this.yScale = d3.scaleLinear().domain(this.yRange).range([this.elemHeight, 0]);

        // axis
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);

        // number of ticks
        var numTicks = this.isSearch ? 5 : 5;
        
        // x axis
        this.xAxis
            .ticks(numTicks)
            .tickSize(this.elemHeight)
            .tickFormat(d3.format(".1f"));

        // y format 
        var yFormat = !this.isSearch ? d3.format(".1f") : d3.format(".1f");
        
        // y axis
        this.yAxis
            .ticks(numTicks)
            .tickSize(-this.chartWidth + this.margins.right + this.margins.left, 0)
            .tickFormat(yFormat);

        // data join
        var xaxis = this.cht.selectAll(".x.axis")
            .data(this.isSearch ? ['search'] : this.timeRes);

        // enter
        var xEnter = xaxis
            .enter()
            .append("g");

        // merge
        xaxis
            .merge(xEnter)
            .attr("class", "x axis")
            .attr("transform", (d: any, i: any) => {
                var pos = this.isSearch ? 0 : i;
                return "translate(" + (pos * (this.elemWidth + this.spaceBetween)) + ", 0)";
            })
            .each(function() {
                d3.select(this).call(that.xAxis);
            });
        
        // exit
        xaxis.exit().remove();

        // join
        var yaxis = this.cht.selectAll(".y.axis")
            .data(["func"]);
        
        // enter
        var yEnter = yaxis
            .enter()
            .append("g");

        // merge
        yaxis
            .merge(yEnter)
            .attr("class", "y axis")
            .attr("transform", (d: any, i: any) => {
                var pos = this.isSearch ? 0 : i;
                return "translate(" + (pos * (this.elemWidth + this.spaceBetween)) + ", 0)";
            })
            .each(function() {
                d3.select(this).call(that.yAxis);
            });

        // exit
        yaxis.exit().remove();
    }
    
    private _buildChart()
    {
        // this scope
        var that = this;

        // update
        var cells = this.cht.selectAll('.cell')
            .data(this.isSearch ? ['search'] : this.timeRes);
        
        // enter
        var cellsEnter = cells
            .enter()
            .append('g');
        
        // merge
        cells
            .merge(cellsEnter)
            .attr('class', 'cell')
            .attr('transform', function (d: any, i: any) {
                var pos = this.isSearch ? 0 : i;
                return "translate(" + (pos * (that.elemWidth + that.spaceBetween)) + ", 0)";
            })
            .each(function (d: any) 
            {
                // get cell and data
                var cell = d3.select(this);
                // current data
                var data = that.data;
                // current resolution
                var tRes = d;

                // matrix frame join
                var frames = cell.selectAll('.frame')
                    .data(['frame']);
                
                // frames enter
                var frameEnter = frames
                    .enter()
                    .append('rect');

                // merge
                frames
                    .merge(frameEnter)
                    .attr("class", "frame")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", that.elemWidth)
                    .attr("height", that.elemHeight)                    
                
                // exit
                frames.exit().remove();

                if( !(tRes in data[0].resolutions) )
                    data = [];

                // circles join
                var circles = cell.selectAll("circle")
                    .data(data);

                // enter
                var circlesEnter = circles
                    .enter()
                    .append("circle");

                // merge
                circles
                    .merge(circlesEnter)                
                    .attr("cx", function (d: any) { return that.xScale(d.resolutions[tRes].x); })
                    .attr("cy", function (d: any) { return that.yScale(d.resolutions[tRes].y); })
                    .attr("r", 4)
                    .attr("opacity", 1.0)
                    .style("fill", function (d: any) { return that.dataService.getColor(d.cityId); });

                // exit
                circles.exit().remove();
                cell.call(that.brush);                
            });

        // exit
        cells.exit().remove();
    }

    private _buildBrush()
    {
        // this scope
        var that = this;

        // brush object
        this.brush = d3.brush()
        .extent([[0, 0], [this.elemWidth, this.elemHeight]]);

        // on start
        this.brush.on("start", function() 
        {
            if(that.brushCell !== this)
            {
                d3.select(that.brushCell).call(that.brush.move, null);
                that.brushCell = this;
            }
        });

        // on move
        this.brush.on("brush", function() 
        {
            // brush selection
            var selection = d3.event.selection;
            if(!selection) return;
            
            // current chart
            var elem = d3.select(this);
            // current resolution
            var tRes = <string>elem.datum();

            // no data on chart
            if( !(tRes in that.data[0].resolutions) ) 
                return; 
    
            // selected circles
            that.cht.selectAll("circle")
                .attr("opacity", function(d: any)
                {    
                    if( (selection[0][0] <= that.xScale(d.resolutions[tRes].x) && selection[1][0] >= that.xScale(d.resolutions[tRes].x)) &&
                        (selection[0][1] <= that.yScale(d.resolutions[tRes].y) && selection[1][1] >= that.yScale(d.resolutions[tRes].y)) )
                    {
                        that.filterService.addToScatterSelection(d);
                        return 1.0;
                    }
                    else
                    {
                        that.filterService.delFromScatterSelection(d);                        
                        return 0.1;
                    }
                });
        });
        
        // on move
        this.brush.on("end", function() 
        {
            // clear selection
            if(!d3.event.selection)
            {
                that.cht.selectAll("circle")
                    .attr('opacity', 1.0);

                that.filterService.clearScatterSelection(that.data);
            }

            that.filterService.emitScatterSelectionChanged();
        });
    }
}