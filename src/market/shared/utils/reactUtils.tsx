let ReactDOM = require('react-dom');

export interface Offset {
    x: number;
    y: number;
}

export function getComponentXYOffset(componentRef: any): Offset {
    if (componentRef) {
        const domNode = ReactDOM.findDOMNode(componentRef);

        if (domNode) {
            const boundingRect = domNode.getBoundingClientRect();

            return {
                x: boundingRect.left,
                y: boundingRect.top
            };
        }
    }

    return {
        x: -1,
        y: -1
    };
}

export function processDelayLoadingImages() {
    let delayLoadImageElements = document.querySelectorAll('.delayLoadImage');
    for (let i = 0, len = delayLoadImageElements.length; i < len; i++) {
        let image = document.createElement('img');
        image.src = delayLoadImageElements.item(i).innerHTML;
        let delayLoadImageElement = delayLoadImageElements.item(i);
        delayLoadImageElement.className += ' ready';

        // Removes the content of delayLoadImageElement which is the image src value.
        delayLoadImageElement.removeChild(delayLoadImageElement.firstChild);

        // Appends the real img element to show the image.
        delayLoadImageElement.appendChild(image);
    }

    let svgImageElements = document.querySelectorAll('.topBackground');
    for (let i = 0, len = svgImageElements.length; i < len; i++) {
        let svgImageElement = svgImageElements.item(i);

        // Gets the image url from the svgImageElement inner html (actually it's a text)
        // and uses this url to construct the SVG html markup.
        svgImageElement.innerHTML = getTileBackgroundSVGHtml(svgImageElement.innerHTML);
    }
}

export function getTileBackgroundSVGHtml(iconURL: string): string {
    return '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<defs><filter id="blur"><feGaussianBlur stdDeviation="50" /></filter></defs>' +
        '<image width="400" height="400" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href=\"'
        + iconURL + '\"' +
        'filter="url(#blur)"></image></svg>';
}