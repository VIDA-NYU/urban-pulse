import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

@Injectable()
export class FilterService
{
    // scatter selection and emitter
    private scatterSelection: any = [];
    private scatterSelectionChange: EventEmitter<any> = new EventEmitter();

    // pulse time selection and emitter
    private pulseTimeSelection: any = [];
    private pulseTimeSelectionChange: EventEmitter<any> = new EventEmitter();

    // constructor
    constructor() {}

    private combineFilters()
    {
        var result = this.scatterSelection.slice();

        this.pulseTimeSelection.forEach( (constraint: any) => 
        {
            result = _.filter(result, (x: any) => 
            {
                var maxTime = x.resolutions[constraint['res']]["maxTime"];
                var sigMaxTime = x.resolutions[constraint['res']]["sigMaxTime"];
                var type = (maxTime[constraint['val']]?(sigMaxTime[constraint['val']]?2:1):0);
    
                return type === constraint['type'];
            })
        });

        return result;
    }

    // Scatter plot brush ---------

    getScatterSelectionChangeEmitter() {
        return this.scatterSelectionChange;
    }

    addToScatterSelection(elem: any) 
    {
        if( !_.find(this.scatterSelection, x => x['id'] === elem['id']) )
            this.scatterSelection.push(elem);
    }
    
    delFromScatterSelection(elem: any) 
    {
        _.remove(this.scatterSelection, x => x['id'] === elem['id'] );
    }
    
    findOnScatterSelection(elem: any) 
    {        
        return _.find(this.scatterSelection, x => x['id'] === elem['id']);
    }
    
    clearScatterSelection(data: any)
    {
        this.scatterSelection = data.slice();
    }

    emitScatterSelectionChanged()
    {
        var finalSelection = this.combineFilters();
        this.scatterSelectionChange.emit(finalSelection);        
    }

    //-----------------------------
    // Pulse time selector --------

    getPulseTimeSelectionChangeEmitter()
    {
        return this.pulseTimeSelectionChange;
    }

    addToPulseTimeSelection(tSel: any) 
    {        
        if( !_.find(this.pulseTimeSelection, x => { return x['val'] === tSel['val'] && x['res'] === tSel['res'] && x['type'] === tSel['type']; }) )
            this.pulseTimeSelection.push(tSel);
        }

    delFromPulseTimeSelection(tSel: any) 
    {        
        _.remove(this.pulseTimeSelection, x => { return x['val'] === tSel['val'] && x['res'] === tSel['res'] && x['type'] === tSel['type']; });
    }

    findOnPulseTimeSelection(tSel: any) 
    {        
        return _.find(this.pulseTimeSelection, x => { return x['val'] === tSel['val'] && x['res'] === tSel['res'] && x['type'] === tSel['type']; });
    }

    clearPulseTimeSelection()
    {
        this.pulseTimeSelection = [];
    }

    emitPulseTimeSelectionChanged()
    {
        var finalSelection = this.combineFilters();
        this.pulseTimeSelectionChange.emit(finalSelection);
    }
    //-----------------------------
}