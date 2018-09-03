import { bindable, customElement } from '@aurelia/runtime';

const view = `<template>
  <style>
    .control {
      display: inline-block;
      vertical-align: top;
      width: 150px;
      height: 50px;
      color: #000;
    }
  </style>
  <div style='height: 50px; background-color: #fff; text-align: center;'>
    <label class='control'>
      Immutable<br/>
      <input type='checkbox' checked.bind='immutable' />
    </label>
  </div>
  <div
    mousemove.delegate='setXY($event)'
    mousedown.delegate='big = true'
    mouseup.delegate='big = false'
    style='height: calc(100% - 50px);'>

    <div
      class="cursor \${big ? 'big' : '' } \${label ? 'label' : ''}"
      css='
        left: \${x || 0}px;
        top: \${y || 0}px;
        border-color: \${color};'>
      <span class='label' if.bind='label'>\${x}, \${y}</span>
    </div>
    <div
      repeat.for='cursor of cursors'
      class="cursor \${cursor.big ? 'big' : '' } \${cursor.label ? 'label' : ''}"
      style='
        left: \${cursor.x || 0}px;
        top: \${cursor.y || 0}px;
        border-color: \${cursor.color};'>
      <span class='label' if.bind='label'>\${cursor.x}, \${cursor.y}</span>
    </div>
    </div>

</template>`;

const COUNT = 200;
const LOOPS = 6;

@customElement({
  name: 'app',
  templateOrNode: view,
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
  x = 0;
  y = 0;
  big = false;
  counter = 0;

  cursors: ICursorData[] = [];

  @bindable()
  immutable: boolean;

  immutableChanged(immutable: boolean) {
    this.doRender = immutable ? this.immutableRerder : this.mutableRender;
  }

  attached() {
    requestAnimationFrame(this.doRender);
  }

  immutableRerder = () => {
    let counter = ++this.counter;
    let max = COUNT + Math.round(Math.sin(counter / 90 * 2 * Math.PI) * COUNT * 0.5);
    let cursors: ICursorData[] = [];

    for (let i = max; i--;) {
      let f = i / max * LOOPS;
      let θ = f * 2 * Math.PI;
      let m = 20 + i * 2;
      let hue = (f * 255 + counter * 10) % 255;
      cursors[i] = {
        big: this.big,
        color: `hsl(${hue}, 100%, 50%)`,
        x: (this.x + Math.sin(θ) * m) | 0,
        y: (this.y + Math.cos(θ) * m) | 0
      };
    }

    this.cursors = cursors;
    requestAnimationFrame(this.doRender);
  }

  mutableRender = () => {
    let counter = ++this.counter;
    let max = COUNT + Math.round(Math.sin(counter / 90 * 2 * Math.PI) * COUNT * 0.5);
    let oldCursors = this.cursors;
    let cursors: ICursorData[] = [];

    if (oldCursors.length > max) {
      oldCursors.splice(max);
    }

    /**
     * Optimization, as aurelia repeater doesn't handle crazy immutability scenario well
     * Instead, we carefully mutate the collection based on the value of max and LOOPS
     */
    for (let i = oldCursors.length; i < max; ++i) {
      let f = i / max * LOOPS;
      let θ = f * 2 * Math.PI;
      let m = 20 + i * 2;
      let hue = (f * 255 + counter * 10) % 255;
      oldCursors.push({
        big: this.big,
        color: `hsl(${hue}, 100%, 50%)`,
        x: (this.x + Math.sin(θ) * m) | 0,
        y: (this.y + Math.cos(θ) * m) | 0
      });
    }

    for (let i = max; i--;) {
      let f = i / max * LOOPS;
      let θ = f * 2 * Math.PI;
      let m = 20 + i * 2;
      let hue = (f * 255 + counter * 10) % 255;
      Object.assign(oldCursors[i], {
        big: this.big,
        color: `hsl(${hue}, 100%, 50%)`,
        x: (this.x + Math.sin(θ) * m) | 0,
        y: (this.y + Math.cos(θ) * m) | 0
      });
    }

    requestAnimationFrame(this.doRender);
  }

  doRender = this.mutableRender;

  setXY({ pageX, pageY }: MouseEvent) {
    this.x = pageX;
    this.y = pageY;
  }
}

export interface ICursorData {
  big: boolean;
  color: string;
  x: number;
  y: number;
}
