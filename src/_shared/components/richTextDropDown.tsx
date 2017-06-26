
import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ICommonContext } from '../interfaces/context';

export interface IRichTextDropDownProps {
    options: any[];
    defaultValue: any;
    renderOption?: (data: any) => JSX.Element;
    renderValue?: (data: any) => JSX.Element;
    onChange: (data: any) => void;
    className?: string;
}

export interface IRichTextDropDownStates {
    value?: any;
    highLightOption?: any;
    isOpen?: boolean;
}

export interface IRichTextDropDownItem<T> {
    text: string;
    value: T;
}

export class RichTextDropDown extends SpzaComponent<IRichTextDropDownProps, IRichTextDropDownStates> {
    context: ICommonContext;

    private dropDownElement: HTMLDivElement;
    private valueElement: HTMLAnchorElement;
    private listElement: HTMLUListElement;
    private renderValueMethod: (item: any) => void;
    private renderOptionMethod: (item: any) => void;

    // The following variable is used to make sure if the dropdown doesn't have focus and then is clicked, the "click to open" behavior won't be triggered after "focus to open" happens.
    private justGotFocused: boolean;

    constructor(props: IRichTextDropDownProps, context: ICommonContext) {
        super(props, context);

        this.state = {
            value: this.props.defaultValue
        };

        this.renderValueMethod = this.props.renderValue || ((item: any) => {
            let selectedOption = this.props.options.filter(option => option.value === item.value)[0];
            return (
                <div className='item'><span>{selectedOption ? selectedOption.text : ''}</span></div>
            );
        });

        this.renderOptionMethod = this.props.renderOption || ((item: any) => {
            return (
                <div className='item'>{item.text}</div>
            );
        });
    }

    componentWillReceiveProps(nextProps: IRichTextDropDownProps, nextState: any) {
        if (this.props.options !== nextProps.options || this.props.defaultValue !== nextProps.defaultValue) {
            this.setState({ value: nextProps.defaultValue });
        }
    }

    openDropDown() {
        this.valueElement.setAttribute('aria-expanded', 'true');
        this.listElement.setAttribute('aria-hidden', 'false');
        this.setState({ isOpen: true });
        if (this.state.value) {
            // this.state.highLightOption = this.state.value;
        }
    }

    closeDropDown() {
        this.valueElement.setAttribute('aria-expanded', 'false');
        this.listElement.setAttribute('aria-hidden', 'true');
        this.setState({ isOpen: false });
    }

    onFocus() {
        this.openDropDown();
        this.justGotFocused = true;
    }

    onBlur(event: any) {
        this.closeDropDown();
        this.justGotFocused = false;
    }

    onKeyDown(event: React.KeyboardEvent<any>) {
        let skipPreventDefault = false;

        switch (event.keyCode) {
            case 38: // Up arrow key
                if (!this.state.isOpen) {
                    let index = this.props.options.indexOf(this.state.value);
                    if (index > 0) {
                        let value = this.props.options[index - 1];
                        this.setState({ value: value });
                        this.props.onChange(value);
                    }
                } else {
                    if (!this.state.highLightOption) {
                        this.setState({ highLightOption: this.props.options[this.props.options.length - 1] });
                    } else {
                        let index = this.props.options.indexOf(this.state.highLightOption);
                        if (index > 0) {
                            this.setState({ highLightOption: this.props.options[index - 1] });
                        }
                    }
                }
                break;
            case 40: // Down arrow key
                if (!this.state.isOpen) {
                    let index = this.props.options.indexOf(this.state.value);
                    if (index < this.props.options.length - 1) {
                        let value = this.props.options[index + 1];
                        this.setState({ value: value });
                        this.props.onChange(value);
                    }
                } else {
                    if (!this.state.highLightOption) {
                        this.setState({ highLightOption: this.props.options[0] });
                    } else {
                        let index = this.props.options.indexOf(this.state.highLightOption);
                        if (index < this.props.options.length - 1) {
                            this.setState({ highLightOption: this.props.options[index + 1] });
                        }
                    }
                }
                break;
            case 13: // Enter key
                if (!this.state.isOpen) {
                    this.openDropDown();
                } else {
                    if (this.state.highLightOption) {
                        this.onOptionClicked(this.state.highLightOption);
                    }
                }
                break;
            case 27: // ESC key
                this.closeDropDown();
                break;
            case 9: // Tab key
                skipPreventDefault = true;
                break;
        }

        if (!skipPreventDefault) {
            event.preventDefault();
        }
    }

    onValueBoxClicked() {
        // Only toggle the dropdown if the dropdown already has focus. 
        // If without this check, when the dropdown doesn't have focus and is clicked, 
        // the focus event will be triggered first and open the dropdown and then this click event handler will be triggered to close the opened dropdown which is not expected.
        if (!this.justGotFocused) {
            if (this.state.isOpen) {
                this.closeDropDown();
            } else {
                this.openDropDown();
            }
        }
        this.justGotFocused = false;
    }

    onOptionClicked(option: any) {
        this.setState({ value: option });
        this.props.onChange(option);
        this.closeDropDown();
    }

    renderImpl() {
        return (
            <div className={'c-select-menu richTextDropDown' + (this.props.className ? (' ' + this.props.className) : '')} ref={(el) => { this.dropDownElement = el; } }
                tabIndex={0}
                onBlur={(event) => this.onBlur(event)}
                onFocus={(event) => { this.onFocus(); } }
                onKeyDown={(event) => this.onKeyDown(event)}
                >
                <a className='valueBox' role='button' aria-haspopup='true' aria-expanded='false'
                    onClick={() => { this.onValueBoxClicked(); } }
                    ref={(el) => { this.valueElement = el; } }
                    >
                    {
                        this.renderValueMethod(this.state.value)
                    }
                    <div className='toggle'>
                        <span className='c-glyph'></span>
                    </div>
                </a>
                <ul className='c-menu' aria-hidden='true' ref={(el) => { this.listElement = el; } } >
                    {
                        this.props.options.map((option: any, index: number) => (
                            <li key={index} className={'c-menu-item' + ((this.state.highLightOption === option) ? ' highlight' : '')}
                                onClick={() => { this.onOptionClicked(option); } }
                                onMouseEnter={() => this.setState({ highLightOption: option })}>
                                <div className='value'>
                                    {
                                        this.renderOptionMethod(option)
                                    }
                                </div>
                                <div className='placeholder'></div>
                            </li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}

(RichTextDropDown as any).contextTypes = {
    renderErrorModal: React.PropTypes.func
};