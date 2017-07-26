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

    // map selection and emitter
    private mapSelection: any = [];
    private mapSelectionChange: EventEmitter<any> = new EventEmitter();

    // constructor
    constructor() {}

    //-----------------------------

    // filter consolidation -------

    private combinePulseFilters()
    {
        var result = this.scatterSelection.slice();

        this.pulseTimeSelection.forEach( (constraint: any) => 
        {
            result = _.filter(result, (x: any) => 
            {
                var maxTime = x.resolutions[constraint['res']]["maxTime"];
                var sigMaxTime = x.resolutions[constraint['res']]["sigMaxTime"];
                var type = (maxTime[constraint['val']]?(sigMaxTime[constraint['val']]?2:1):0);
    
                if(constraint['type'] == 1 && type  >= 1) return true;
                if(constraint['type'] == 2 && type === 2) return true;

                return false;
            })
        });

        return result;
    }

    private processScatterData()
    {
        var scatter = this.scatterSelection.slice();
        var map = this.mapSelection.slice();

        var result = ( map.length === 0 ) ? scatter : map;
        
        return result;
    }

    //-----------------------------

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
        var finalSelection = this.combinePulseFilters();
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
        var finalSelection = this.combinePulseFilters();
        this.pulseTimeSelectionChange.emit(finalSelection);
    }
    
    //-----------------------------

    // Map brush ---------

    getMapSelectionChangeEmitter() {
        return this.mapSelectionChange;
    }

    addToMapSelection(elem: any) 
    {
        if( !_.find(this.mapSelection, x => x['id'] === elem['id']) )
            this.mapSelection.push(elem);
    }
    
    delFromMapSelection(elem: any)
    {
        _.remove(this.mapSelection, x => x['id'] === elem['id'] );
    }
    
    findOnMapSelection(elem: any) 
    {        
        return _.find(this.mapSelection, x => x['id'] === elem['id']);
    }
    
    clearMapSelection(cityId: string) 
    {
        this.mapSelection = _.filter(this.mapSelection, function(o: any) { return o.cityId !== cityId; });
    }

    emitMapSelectionChanged()
    {
        var res =  this.processScatterData();

        this.mapSelectionChange.emit(res);
    }

    //-----------------------------    
}