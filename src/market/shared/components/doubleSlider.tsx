import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ILocContext, ILocParamsContext, ICommonContext } from '../interfaces/context';

export interface IDoubleSliderProps {
    min: number;
    max: number;
    defaultValue1: number;
    defaultValue2: number;
    onValue1Change: (value: number) => void;
    onValue2Change: (value: number) => void;
}

export interface IDoubleSliderState {
    value1?: number;
    value2?: number;
}

export class DoubleSlider extends SpzaComponent<IDoubleSliderProps, IDoubleSliderState> {
    context: ILocContext & ILocParamsContext & ICommonContext;

    private componentWillUnmountHanlder: () => void;
    private activeSlider: HTMLElement;
    private offsetX: number;
    private container: HTMLElement;
    private slider1: HTMLElement;
    private slider2: HTMLElement;
    private middleBar: HTMLElement;
    private isSliderMoved: boolean;
    private doesPropChangeCauseSliderUpdate: boolean;

    constructor(props: IDoubleSliderProps, context: ILocContext & ILocParamsContext & ICommonContext) {
        super(props, context);

        this.state = {
            value1: props.defaultValue1,
            value2: props.defaultValue2
        };
    }

    componentDidMount() {
        let onMouseDownHandler = this.onMouseDown.bind(this);
        let onMouseMoveHandler = this.onMouseMove.bind(this);
        let onMouseUpHandler = this.onMouseUp.bind(this);
        document.body.addEventListener('mousedown', onMouseDownHandler);
        document.body.addEventListener('mousemove', onMouseMoveHandler);
        document.body.addEventListener('mouseup', onMouseUpHandler);

        let onTouchStartHandler = this.onTouchStart.bind(this);
        let onTouchMoveHandler = this.onTouchMove.bind(this);
        let onTouchEndHandler = this.onMouseUp.bind(this);
        document.body.addEventListener('touchstart', onTouchStartHandler);
        document.body.addEventListener('touchmove', onTouchMoveHandler);
        document.body.addEventListener('touchend', onTouchEndHandler);

        // Since the ".bind" method is used above to maintain "this" context, a closure is created for each of "bind" call.
        // So we cannot simply remove event listener by using like "this.onMOuseDown.bind(this)".
        // We need to create a closure below to save all those actual event handlers with "this" context.
        // The method below with the closure will be used to detach the event handler in componentWillUnmount function.
        this.componentWillUnmountHanlder = () => {
            document.body.removeEventListener('mousedown', onMouseDownHandler);
            document.body.removeEventListener('mousemove', onMouseMoveHandler);
            document.body.removeEventListener('mouseup', onMouseUpHandler);
            document.body.removeEventListener('touchstart', onTouchStartHandler);
            document.body.removeEventListener('touchmove', onTouchMoveHandler);
            document.body.removeEventListener('touchend', onTouchEndHandler);
        };

        this.updateSlidePositions();
    }

    componentWillUnmount() {
        this.componentWillUnmountHanlder();
    }

    componentWillReceiveProps(nextProps: IDoubleSliderProps, nextState: any) {
        this.doesPropChangeCauseSliderUpdate = false;
        if (this.props.min !== nextProps.min) {
            this.setState({ value1: nextProps.min });
            this.doesPropChangeCauseSliderUpdate = true;
        }

        if (this.props.max !== nextProps.max) {
            this.setState({ value2: nextProps.max });
            this.doesPropChangeCauseSliderUpdate = true;
        }

        if (this.props.defaultValue1 !== nextProps.defaultValue1) {
            this.setState({ value1: nextProps.defaultValue1 });
            this.doesPropChangeCauseSliderUpdate = true;
        }

        if (this.props.defaultValue2 !== nextProps.defaultValue2) {
            this.setState({ value2: nextProps.defaultValue2 });
            this.doesPropChangeCauseSliderUpdate = true;
        }
    }

    componentDidUpdate() {
        if (this.doesPropChangeCauseSliderUpdate) {
            this.updateSlidePositions();
        }
    }

    updateSlidePositions() {
        this.slider1.style.left = this.calculatePositionByValue(this.state.value1);
        this.slider2.style.left = this.calculatePositionByValue(this.state.value2);
        this.updateMiddleBar();
    }

    onTouchStart(event: TouchEvent) {
        this.onSliderMoveStart(event.target as HTMLElement, event.touches[0].clientX);
    }

    onMouseDown(event: MouseEvent) {
        this.onSliderMoveStart(event.target as HTMLElement, event.clientX);
    }

    onSliderMoveStart(target: HTMLElement, left: number) {
        if (target === this.slider1 || target === this.slider2) {
            this.slider1.style.zIndex = '0';
            this.slider2.style.zIndex = '0';
            this.activeSlider = target;
            this.activeSlider.style.zIndex = '1';
            this.offsetX = left;

            this.isSliderMoved = false;
        }
    }

    onTouchMove(event: TouchEvent) {
        this.onSliderMoveInProgress(event.touches[0].clientX);
    }

    onMouseMove(event: MouseEvent) {
        this.onSliderMoveInProgress(event.clientX);
    }

    onSliderMoveInProgress(left: number) {
        if (this.activeSlider) {
            let originalLeft = this.activeSlider.offsetLeft;
            let newLeft = originalLeft + left - this.offsetX;

            if (this.activeSlider === this.slider1) {
                if (newLeft < 0) {
                    newLeft = 0;
                } else if (newLeft > this.slider2.offsetLeft) {
                    if (!this.isSliderMoved) {
                        // When the Slider 1 and Slider 2 are put on top of each other, which means the min value and max value are the same,
                        // if the user click on Slider 1 and try to move it (which means the Slider 1 hasn't been moved, yet) to right (even righter than Slider 2),
                        // let the user switch the moving to Slider 2 which means the user is actually changing the max value.
                        this.activeSlider = this.slider2;
                    } else {
                        // If the Slider 1 is already being moved, make sure it won't be moved to right of Slider 2.
                        newLeft = this.slider2.offsetLeft;
                    }
                } else {
                    this.offsetX = left;
                }

                this.setState({ value1: this.calculateValueByPosition(this.slider1.offsetLeft) });
                this.props.onValue1Change(this.state.value1);
            } else if (this.activeSlider === this.slider2) {
                if (newLeft < this.slider1.offsetLeft) {
                    if (!this.isSliderMoved) {
                        // When the Slider 1 and Slider 2 are put on top of each other, which means the min value and max value are the same,
                        // if the user click on Slider 2 and try to move it (which means the Slider 2 hasn't been moved, yet) to left (even lefter than Slider 1),
                        // let the user switch the moving to Slider 1 which means the user is actually changing the min value.
                        this.activeSlider = this.slider1;
                    } else {
                        // If the Slider 2 is already being moved, make sure it won't be moved to left of Slider 1.
                        newLeft = this.slider1.offsetLeft;
                    }
                } else if (newLeft > this.container.offsetWidth - this.slider2.offsetWidth) {
                    newLeft = this.container.offsetWidth - this.slider2.offsetWidth;
                } else {
                    this.offsetX = left;
                }

                this.setState({ value2: this.calculateValueByPosition(this.slider2.offsetLeft) });
                this.props.onValue2Change(this.state.value2);
            }

            if (originalLeft !== newLeft) {
                this.isSliderMoved = true;
            }

            this.activeSlider.style.left = newLeft.toString() + 'px';
            this.updateMiddleBar();
        }
    }

    onTouchEnd() {
        this.onSliderMoveEnd();
    }

    onMouseUp() {
        this.onSliderMoveEnd();
    }

    onSliderMoveEnd() {
        this.activeSlider = null;
        this.isSliderMoved = false;
        this.updateSlidePositions();
    }

    onKeyDownOnSlider1(event: React.KeyboardEvent<any>) {
        let value = this.state.value1;
        switch (event.keyCode) {
            case 37:
                if (value > this.props.min) {
                    value--;
                }
                this.props.onValue1Change(value);
                break;
            case 39:
                if (value < this.state.value2) {
                    value++;
                }
                this.props.onValue1Change(value);
                break;
        }
        this.setState({ value1: value });
        this.slider1.style.left = this.calculatePositionByValue(value);
        this.updateMiddleBar();
    }

    onKeyDownOnSlider2(event: React.KeyboardEvent<any>) {
        let value = this.state.value2;
        switch (event.keyCode) {
            case 37:
                if (value > this.state.value1) {
                    value--;
                }
                this.props.onValue2Change(value);
                break;
            case 39:
                if (value < this.props.max) {
                    value++;
                }
                this.props.onValue2Change(value);
                break;
        }
        this.setState({ value2: value });
        this.slider2.style.left = this.calculatePositionByValue(value);
        this.updateMiddleBar();
    }

    calculatePositionByValue(value: number): string {
        return (this.container.offsetWidth - this.slider2.offsetWidth) * ((value - this.props.min) / (this.props.max - this.props.min)) + 'px';
    }

    calculateValueByPosition(position: number): number {
        return this.props.min + Math.round((this.props.max - this.props.min) * (position / (this.container.offsetWidth - this.slider2.offsetWidth)));
    }

    updateMiddleBar() {
        this.middleBar.style.left = (this.slider1.offsetLeft + this.slider1.offsetWidth / 2) + 'px';
        this.middleBar.style.right = (this.container.offsetWidth - this.slider2.offsetLeft - this.slider2.offsetWidth / 2) + 'px';
    }

    renderImpl() {
        return (
            <div className='doubleSlider'>
                <span className='value1'>{this.state.value1}</span>
                <div className='centerCell'>
                    <div className='container' ref={ref => this.container = ref}>
                        <div className='bar'></div>
                        <div className='middleBar' ref={ref => this.middleBar = ref}></div>
                        <div className='slider slider1' ref={ref => this.slider1 = ref} onKeyDown={event => this.onKeyDownOnSlider1(event)}
                            aria-valuemin={this.props.min} aria-valuemax={this.props.max} aria-valuenow={this.state.value1} tabIndex={0}
                            ></div>
                        <div className='slider slider2' ref={ref => this.slider2 = ref} onKeyDown={event => this.onKeyDownOnSlider2(event)}
                            aria-valuemin={this.props.min} aria-valuemax={this.props.max} aria-valuenow={this.state.value2} tabIndex={0}
                            ></div>
                    </div >
                </div>
                <span className='value2'>{this.state.value2}</span>
            </div>
        );
    }
}

(DoubleSlider as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};