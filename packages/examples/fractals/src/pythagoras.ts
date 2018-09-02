// tslint:disable
import { customElement, bindable, ObserverLocator, DOM } from "@aurelia/runtime";
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
