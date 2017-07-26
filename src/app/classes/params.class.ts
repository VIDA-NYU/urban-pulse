import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

// import d3js
import * as d3 from 'd3';

// lodash
import * as _ from 'lodash';

@Injectable()
export class ParametersService
{
    public  timeRes: string = 'HOUR';
    private timeResChange: EventEmitter<any> = new EventEmitter();
    
    public  showScalarFunction: boolean = true;
    private showScalarFunctionChange: EventEmitter<any> = new EventEmitter();

    getTimeRes()
    {
        return this.timeRes;
    }

    getTimeResChangeEmitter()
    {
        return this.timeResChange;
    }

    emitTimeResChanged()
    {
        this.timeResChange.emit(this.timeRes);
    }

    //--------

    getShowScalarFunction()
    {
        return this.showScalarFunction;
    }

    getShowScalarFunctionEmitter()
    {
        return this.showScalarFunctionChange;
    }

    emitShowScalarFunctionChanged()
    {
        this.showScalarFunctionChange.emit(this.showScalarFunction);
    }
    
}