import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ILocParamsContext, ICommonContext, ITimerContext } from '../interfaces/context';

let intervalId: any = null;
let endtime: any = null;

export interface ITimerProps {
    endTime: Date;
}

export interface ITimerState {
    hour: number;
    minute: number;
    second: number;
}
export class Timer extends SpzaComponent<ITimerProps, ITimerState> {
    context: ILocParamsContext & ICommonContext & ITimerContext;

    constructor(props: ITimerProps, context: ILocParamsContext & ICommonContext & ITimerContext) {
        super(props, context);
        endtime = this.props.endTime;
        this.state = {
            hour: 0,
            minute: 0,
            second: 0
        };
    }

    // invoked once, only on the client, after initial render
    componentDidMount() {
        // call it once on initial render, after which it would be called once a minute.
        this.countdown();
        intervalId = setInterval(() => {
            this.countdown();
        }, 1000 * 10);
    }

    countdown() {
        let now: any = new Date();
        let t = Date.parse(endtime) - Date.parse(now);
        let seconds = Math.floor((t / 1000) % 60);
        let minutes = Math.floor((t / 1000 / 60) % 60);
        let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        if ((hours === 0 || hours < 0) && (minutes === 0 || minutes < 0)) {
            this.context.timerCallback();
            clearInterval(intervalId);
        }
        this.setState({
            hour: hours,
            minute: minutes,
            second: seconds
        });
    }


    renderImpl() {
        return (
            <div>
                ({this.context.locParams('Timer', [this.state.hour.toString(), this.state.minute.toString()])})
            </div>
        );
    }
}

(Timer as any).contextTypes = {
    timerCallback: React.PropTypes.func,
    locParams: React.PropTypes.func
};
