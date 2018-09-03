/// <reference path="./html.d.ts"/>
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit';
import { IContainer } from '@aurelia/kernel';
import { register as svgPlugin } from '@aurelia/plugin-svg';
import { Aurelia } from '@aurelia/runtime';
import { App, Pythagoras } from './app';

console.log({ App, Pythagoras });

const au = window['au'] = new Aurelia()
  .register(
    BasicConfiguration,
    DebugConfiguration,
    // Pythagoras as any,
    {
      register(container: IContainer) {
        svgPlugin(container);
        // container.register(Pythagoras as any);
        // (Pythagoras as any).register(container);
      }
    }
  )
  .app({ host: document.querySelector('app'), component: new App() });

au.start();
