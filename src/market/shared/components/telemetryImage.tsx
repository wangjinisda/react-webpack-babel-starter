import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from '../Models';
import { Constants } from '../utils/constants';

export interface ITelemetryImageProps {
    src: string;
    alt?: string;
    className?: string;
}

export class TelemetryImage extends SpzaComponent<ITelemetryImageProps, any> {
    startTime: number = null;

    constructor(props: any) {
        super(props);
        this.startTime = Date.now();

        let payload: ITelemetryData = {
            page: this.props.src,
            action: Constants.Telemetry.Action.ImageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.Start,
            details: 'Start time: ' + this.startTime
        };

        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    onImageLoaded(event: any) {
        let payload: ITelemetryData = {
            page: this.props.src,
            action: Constants.Telemetry.Action.ImageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End,
            details: 'Elapsed time: ' + (Date.now() - this.startTime) + ' ms'
        };

        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    onImageErrored(event: any) {
        let payload: ITelemetryData = {
            page: this.props.src,
            action: Constants.Telemetry.Action.ImageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.Error,
            details: 'Elapsed time: ' + (Date.now() - this.startTime) + ' ms'
        };

        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    componentWillUpdate(nextProps: any, nextState: any) {
        this.startTime = Date.now();
    }

    renderImpl() {
        return (
            <img
                src={this.props.src}
                alt={this.props.alt}
                className={this.props.className}
                onLoad={this.onImageLoaded.bind(this)}
                onError={this.onImageErrored.bind(this)} />
        );
    }
}