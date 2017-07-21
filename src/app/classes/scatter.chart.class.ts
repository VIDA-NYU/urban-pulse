// angular imports
import { ElementRef } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

// my services
import { DataService } from './data.class';

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

    // data service
    private dataSvc: any;

    constructor(element: ElementRef, private dataService: DataService) 
    {
        // data service reference
        this.dataSvc = dataService;

        // get the data
        this.dataSvc.getFeatures().subscribe((json: any) => 
        {
            // html element reference 
            this.element = element;

            // format data
            this._buildData(json);
            
            // update the chart
            this.updateChart();
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
        // build the axis
        this._buildAxis();

        // creates the chart
        this._buildChart();

        // build brush
        this._buildBrush();
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

    private _buildData(json: any) 
    {
        // this scope
        var that = this;

        // sort features
        var features = json.features.sort(function (x: any, y: any) {
            return d3.ascending(x.rank, y.rank);
        });

        // get time keys
        this.timeRes = Object.keys(features[features.length - 1]["resolutions"]);
        // remove ALL key
        this.timeRes.splice(this.timeRes.indexOf("ALL"), 1);

        // build data
        this.data = {};

        // ranges definition
        this.xRange = [Infinity, -Infinity];
        this.yRange = [Infinity, -Infinity];

        // mapping
        this.timeRes.forEach(function (res: string) {
            that.data[res] = features.map(function (f: any, index:number) 
            {
                // current resolution
                var resolution = res;
                // rank computation
                var fnRank  = f.resolutions[resolution].fnRank;
                var maxRank = f.resolutions[resolution].fnRank;
                var sigRank = f.resolutions[resolution].fnRank;
                
                // x and y values for the scatter plot
                var x = Math.sqrt(maxRank * maxRank + fnRank * fnRank + sigRank * sigRank);
                var y = f.rank;

                that.xRange[0] = Math.min(that.xRange[0], x);
                that.xRange[1] = Math.max(that.xRange[1], x);

                that.yRange[0] = Math.min(that.yRange[0], y);
                that.yRange[1] = Math.max(that.yRange[1], y);

                return { id: index, x: x, y: y };
            });
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
                var data = that.data[d];
                
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
                    .attr("cx", function (d: any) { return that.xScale(d.x); })
                    .attr("cy", function (d: any) { return that.yScale(d.y); })
                    .attr("r", 4)
                    .style("fill", function (d: any) { return "blue"; });

                // exit
                circles.exit().remove();
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
            
            // selected circles
            d3.select(this).selectAll("circle")
                .classed("selected", function(d: any)
                {
                    if( (selection[0][0] <= that.xScale(d.x) && selection[1][0] >= that.xScale(d.x)) &&
                        (selection[0][1] <= that.yScale(d.y) && selection[1][1] >= that.yScale(d.y)) )
                    {
                        that.dataSvc.addSelection(d);
                        return true;
                    }
                    else
                    {
                        that.dataSvc.delSelection(d);                        
                        return false;
                    }
                });
            
            // unselected circles
            that.cht.selectAll("circle")
                .attr('opacity', function(d: any)
                {
                    if( that.dataSvc.findSelection(d) ){
                        d3.select(this).classed('selected', true);
                        return 1.0;                            
                    }
                    else{
                        d3.select(this).classed('selected', false);
                        return 0.2;
                    }
                })
        });
        
        // on move
        this.brush.on("end", function() 
        {
            // clear selection
            if(!d3.event.selection)
            {
                that.cht.selectAll("circle")
                    .classed("selected", false)
                    .attr('opacity', 1.0);

                that.dataSvc.clearSelection();
            }
        });

        // call on each cell
        var cells = this.cht.selectAll('.cell')
            .call(this.brush);
    }
}