// tslint:disable
import { select as d3select, mouse as d3mouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import * as view from 'text!./app.html';
import { customElement } from '@aurelia/runtime';
// import { Pythagoras } from './pythagoras';

@customElement({
  name: 'app',
  templateOrNode: view as any,
  // dependencies: [
  //   Pythagoras
  // ],
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: []
})
export class App {
  unlimited: boolean = false;
  //  @observable()
  // throttleValue: number = 0;
  width = Math.min(window.innerWidth, 1280);
  height = this.width * (600 / 1280);
  currentMax = 0;
  baseW = 80;
  heightFactor = 0;
  lean = 0;
  realMax = 11;
  public readonly svg: SVGSVGElement;
  constructor(
  ) {
  }
  attached() {
    this.next();
    d3select(this.svg).on('mousemove', this.onMousemove);
  }
  private next = () => {
    if (this.currentMax < this.realMax) {
      this.currentMax++;
      setTimeout(this.next, 500);
    }
  }
  private onMousemove: Function = () => {
    let [x, y] = d3mouse(this.svg);
      let scaleFactor = scaleLinear()
      .domain([this.height, 0])
      .range([0, .8]);
      let scaleLean = scaleLinear()
      .domain([0, this.width / 2, this.width])
      .range([.5, 0, -.5]);
      this.heightFactor = scaleFactor(y);
    this.lean = scaleLean(x);
  };
   throttleValueChanged(value: number) {
    if (this.svg) {
      d3select(this.svg)
        .on('mousemove', null)
        .on('mousemove',
          !value
            ? this.onMousemove
            : throttle(this.onMousemove, value)
        );
    }
  }
}
// tslint:disable
export function throttle(func: Function, wait: number, options?: { leading: boolean; trailing: boolean }) {
  let context, args, result;
  let timeout = null;
  let previous = 0;
  if (!options) {
    options = {} as any;
  }
  const later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
