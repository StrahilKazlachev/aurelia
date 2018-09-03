// tslint:disable
import { select as d3select, mouse as d3mouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { customElement } from '@aurelia/runtime';

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

// tslint:disable
import { bindable, ObserverLocator, DOM } from "@aurelia/runtime";
import { interpolateViridis as vivid } from 'd3-scale';

export interface IPythagorasProps {
  w: number;
  x: number;
  y: number;
  heightFactor: number;
  lean: number;
  lvl: number;
  maxlvl: number;
  branch: 'left' | 'right' | undefined
}

let id = 1;

@customElement({
  name: 'pythagoras',
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: [],
  surrogates: [],
  templateOrNode: (() => {
    const template = document.createElement('template');
    const parser = document.createElement('div');
    template.setAttribute("transform.bind", "getTransform(x, y, w, A, B)");
    parser.innerHTML = `
    <svg>
      <rect
        x='0'
        y='0'
        width.bind='w'
        height.bind='w'
        css='fill: \${interpolateViridis(lvl / maxlvl)}' />
        <g as-element='pythagoras'
          if.bind='(lvl < maxlvl - 1) && (nextLeft >= 1)'
          w.bind='nextLeft'
          x.bind='0'
          y.bind='-nextLeft'
          lvl.bind='lvl + 1'
          maxlvl.bind='maxlvl'
          height-factor.bind='heightFactor'
          lean.bind='lean'
          left='true'></g>
        <g as-element='pythagoras'
          if.bind='(lvl < maxlvl - 1) && (nextRight >= 1)'
          w.bind='nextRight'
          x.bind='w - nextRight'
          y.bind='-nextRight'
          lvl.bind='lvl + 1'
          maxlvl.bind='maxlvl'
          height-factor.bind='heightFactor'
          lean.bind='lean'
          right='true'></g>
    </svg>
    `;
    while (parser.firstElementChild.firstElementChild) {
      template.content.appendChild(parser.firstElementChild.firstElementChild);
    }
    return template.outerHTML;
  })(),
})
export class Pythagoras {
  @bindable()
  w: number;

  @bindable()
  x: number;

  @bindable()
  y: number;

  @bindable()
  heightFactor: number;

  @bindable()
  lean: number;

  @bindable()
  left: number;

  @bindable()
  right: number;

  @bindable()
  lvl: number;

  @bindable()
  maxlvl: number;

  shouldRender: boolean;
  nextRight: number = 0;
  nextLeft: number = 0;
  A: number = 0;
  B: number = 0;
  constructor(
    // public taskQueue: TaskQueue
  ) {
  }

  bind() {
   this.calculate();
   }
  interpolateViridis(val: number) {
   return vivid(val);
   }
  propertyChanged() {
   this.calculate();
   }
  call() {
   this.calculate();
  }
  calculate = () => {
    const calc = memoizedCalc({
      w: this.w,
      heightFactor: this.heightFactor,
      lean: this.lean
    });
    this.nextRight = calc.nextRight;
    this.nextLeft = calc.nextLeft;
    this.A = calc.A;
    this.B = calc.B;
  };
  getTransform(x: number, y: number, w: number, A: number, B: number) {
   return `translate(${this.x} ${this.y}) ${
     this.left
       ? `rotate(${-A} 0 ${w})`
       : this.right
         ? `rotate(${B} ${w} ${w})`
         : ''
     }`;
  }
}
interface ICalcResult {
  nextRight: number;
  nextLeft: number;
  A: number;
  B: number;
}
interface ICalcParams {
  w: number;
  heightFactor: number;
  lean: number;
}
const memo: Record<string, ICalcResult> = {};
const rad2Deg = radians => radians * (180 / Math.PI);
const key = ({ w, heightFactor, lean }: ICalcParams) => `${w}-${heightFactor}-${lean}`;
const memoizedCalc = (args: ICalcParams) => {
  const memoKey = key(args);
  if (memoKey in memo) {
    return memo[memoKey];
  } else {
    const { w, heightFactor, lean } = args;
    const trigH = heightFactor * w;
    const result = {
      nextRight: Math.sqrt(trigH ** 2 + (w * (0.5 + lean)) ** 2),
      nextLeft: Math.sqrt(trigH ** 2 + (w * (0.5 - lean)) ** 2),
      A: rad2Deg(Math.atan(trigH / ((0.5 - lean) * w))),
      B: rad2Deg(Math.atan(trigH / ((0.5 + lean) * w)))
    };
    memo[memoKey] = result;
    return result
  }
}


@customElement({
  name: 'app',
  dependencies: [Pythagoras],
  templateOrNode: `
  <template>
    <style>
      html, body, app {
        display: block;
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .control {
        float: left;
        vertical-align: top;
        width: 150px;
        height: 50px;
      }
    </style>
    <div style='height: 50px;'>
    </div>
    <svg width.bind='width' height.bind='height' style='border: 1px solid grey;' ref='svg'>
      <g as-element='pythagoras'
        x.bind='width / 2 - 40'
        y.bind='height - baseW'
        w.bind='baseW'
        h.bind='baseW'
        height-factor.bind='heightFactor & throttle:50'
        lean.bind='lean & throttle:50'
        lvl.bind='0'
        maxlvl.bind='currentMax'></g>
    </svg>
  </template>
  `,
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
