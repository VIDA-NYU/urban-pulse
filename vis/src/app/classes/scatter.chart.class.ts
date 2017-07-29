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
    private margins: any = { top: 10, right: 20, bottom: 40, left: 30 };
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
    private searchId: string;
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

        this.paramsService.getSearchIdEmitter().subscribe( (searchId: string)=>
        {
            if(searchId === "none") {
                this.paramsService.isSearch = false;
                this.data = this.dataService.getData();
                this.searchId = searchId;
            }
            else {
                this.paramsService.isSearch = true;
                this.searchId = searchId;
                this._buildSearch();
            }
            
            this.updateChart();
            this.filterService.emitSearchSelectionChanged(this.data);
        });

        // Adds event listener resize when the window changes size.
        window.addEventListener("resize", () => { this.updateChart() });
    }

    updateChart()
    {
        // number of charts
        this.nCharts = this.paramsService.getIsSearch() ? 1 : this.timeRes.length;

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
        this.xRange = [Infinity, -Infinity];

        if(this.paramsService.getIsSearch())
            this.yRange = [];
        else
            this.yRange = [Infinity, -Infinity];

        // mapping
        this.data.forEach(function (f: any) 
        {
            let timeRes = [];
            if(that.paramsService.getIsSearch())
                timeRes = ['SEARCH'];
            else
                timeRes = that.timeRes;

            // for each resolution
            timeRes.forEach(function(tRes: string)
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
                if(tRes === 'SEARCH')
                {
                    that.yRange.push(y);                    
                }
                else
                {
                    that.yRange[0] = Math.min(that.yRange[0], y);
                    that.yRange[1] = Math.max(that.yRange[1], y);
                }
            })
        });
    }

    private _buildAxis()
    {
        // this scope
        var that = this;

        // scale definition
        if(this.paramsService.getIsSearch())
        {
            this.xScale = d3.scaleLinear().domain(this.xRange).range([2*this.spaceBetween,  this.elemWidth-2*this.spaceBetween]);
            this.yScale = d3.scalePoint().domain(this.yRange).range([this.elemHeight-this.spaceBetween/2, this.spaceBetween/2]).padding(0.5);
        }
        else
        {
            this.xScale = d3.scaleLinear().domain(this.xRange).range([this.spaceBetween,  this.elemWidth-this.spaceBetween]);
            this.yScale = d3.scaleLinear().domain(this.yRange).range([this.elemHeight-this.spaceBetween/2, this.spaceBetween/2]);            
        }

        // axis
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);

        // number of ticks
        var nTicks = this.paramsService.getIsSearch() ? 10 : 5;
        
        // x axis
        this.xAxis
            .ticks(nTicks)
            .tickSize(this.elemHeight)
            .tickFormat(d3.format(".1f"));

        // y format 
        var yFormat = !this.paramsService.getIsSearch() ? d3.format(".1f") : d3.format(".1d");
        
        // y axis
        this.yAxis
            .ticks(nTicks)
            .tickSize(-this.chartWidth + this.margins.right + this.margins.left, 0)
            .tickFormat(yFormat);

        // data join
        var xaxis = this.cht.selectAll(".x.axis")
            .data(this.paramsService.getIsSearch() ? ['SEARCH'] : this.timeRes);

        // enter
        var xEnter = xaxis
            .enter()
            .append("g");

        // merge
        xaxis
            .merge(xEnter)
            .attr("class", "x axis")
            .attr("transform", (d: any, i: any) => {
                var pos = this.paramsService.getIsSearch() ? 0 : i;
                return "translate(" + (pos * (this.elemWidth + this.spaceBetween)) + ", 0)";
            })
            .each(function() {
                d3.select(this).call(that.xAxis);
            });
        
        // exit
        xaxis.exit().remove();

        // join
        var yaxis = this
            .cht.selectAll(".y.axis")
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
                var pos = this.paramsService.getIsSearch() ? 0 : i;
                return "translate(" + (pos * (this.elemWidth + this.spaceBetween)) + ", 0)";
            })
            .each(function() {
                d3.select(this).call(that.yAxis);
            });

        // exit
        yaxis.exit().remove();
        
        var yLabel = this.cht
            .selectAll(".y.axis")
            .selectAll(".yLabel")
            .data(["yLabel"]);

        var yLabelEnter = yLabel
            .enter()
            .append('text');
        
        yLabel  
            .merge(yLabelEnter)
            .attr("class", "yLabel")
            .attr('y', -0.85*this.margins.left)
            .attr('x', -this.elemHeight / 2)
            .attr("transform", "rotate(-90)")
            .attr('font-family', 'sans-serif')
            .attr('font-size', '10px')
            .attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .text( () => { return this.paramsService.getIsSearch() ? "PULSE ID" : "RANK"; } );

        yLabel.exit().remove();
    }
    
    private _buildChart()
    {
        // this scope
        var that = this;

        // update
        var cells = this.cht.selectAll('.cell')
            .data(this.paramsService.getIsSearch() ? ['SEARCH'] : this.timeRes);
        
        // enter
        var cellsEnter = cells
            .enter()
            .append('g');
            
        // merge
        cells
            .merge(cellsEnter)
            .attr('class', 'cell')
            .attr('transform', function (d: any, i: any) {
                var pos = that.paramsService.getIsSearch() ? 0 : i;
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

        //------

        // update
        var titles = this
            .cht.selectAll('.chartTitle')
            .data(this.paramsService.getIsSearch() ? ['SEARCH'] : this.timeRes);
    
        // enter
        var titlesEnter = titles
            .enter()
            .append('g');
            
        // merge
        titles
            .merge(titlesEnter)
            .attr('class', 'chartTitle')
            .attr('transform', function (d: any, i: any) {
                var pos = that.paramsService.getIsSearch() ? 0 : i;
                return "translate(" + (pos * (that.elemWidth + that.spaceBetween)) + ", -5)";
            })
            .each(function(d:any){

                // get cell and data
                var cell = d3.select(this);

                var text = cell
                    .selectAll('text')
                    .data([cell.datum()]);

                var textEnter = text.enter().append("text");

                text
                    .merge(textEnter)
                    .attr('x', that.elemWidth / 2)
                    .attr('y',  '0px')
                    .attr('text-anchor', 'middle')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', '10px')
                    .attr('fill', 'black')
                    .text( (d: string) => { return that.paramsService.getIsSearch() ? 'SEARCH (DISTANCE)' : 'RANK ('+d+')'; });

                text.exit().remove();
            });

        titles.exit().remove();
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

    private _buildSearch()
    {
        let that = this;
        let sourceFeatures = <any>[];
        let features = this.dataService.getData();

        this.data.forEach(function(f: any) {
            if(f.cityId === that.searchId) {
                sourceFeatures.push(f);
            }
        });

        this.data = this._search(sourceFeatures, features);
    }

    private _search(sourceFeatures: any[], features: any[])
    {
        let that = this;
        let distances = {};

        let count = 0;
        let searchFeatures = <any>[];
        features.forEach(function(f: any) {

            // find distances
            var cdist = 0;
            var closest = -1;
            sourceFeatures.forEach(function(sf: any) 
            {
                if(f.cityId == sf.cityId)
                    return;

                var dist = that._getDistance(f, sf);

                if(closest == -1) {
                    closest = sf.id;
                    cdist = dist;
                }
                else {
                    if(dist < cdist) {
                        closest = sf.id;
                        cdist = dist;
                    }
                }
            });

            if(closest != -1) {
                f.resolutions['SEARCH'] = {'x': cdist, 'y': closest};
                searchFeatures.push(f);
            }
        });

        sourceFeatures.forEach(function(f: any) 
        {
            f.resolutions['SEARCH'] = {'x': 0, 'y': f.id };
        });

        return searchFeatures.concat(sourceFeatures);
    }


    private _getDistance(feature1: any, feature2: any)
    {
        let distance = 0;
        this.timeRes.forEach(function(r: any) {

            //
            let beat1 = feature1.resolutions[r].maxTime;
            let beat2 = feature2.resolutions[r].maxTime;

            let dd = 0;
            for(let i=0; i<beat1.length; i++) {
                dd += ((beat1[i] - beat2[i]) * (beat1[i] - beat2[i]));
            }
            distance += dd;

            //
            let sbeat1 = feature1.resolutions[r].sigMaxTime;
            let sbeat2 = feature2.resolutions[r].sigMaxTime;

            dd = 0;
            for(let i=0; i<sbeat1.length; i++) {
                dd += ((sbeat1[i] - sbeat2[i]) * (sbeat1[i] - sbeat2[i]));
            }
            distance += dd;

            //
            let fbeat1 = feature1.resolutions[r].fn;
            let fbeat2 = feature2.resolutions[r].fn;

            dd = 0;
            for(let i=0; i<fbeat1.length; i++) {
                dd += ((fbeat1[i] - fbeat2[i]) * (fbeat1[i] - fbeat2[i]));
            }
            distance += dd;

        });

        return Math.sqrt(distance);
    }
}