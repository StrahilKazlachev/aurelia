/// <reference path="./html.d.ts"/>
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit';
import { IContainer } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime';
import { register } from '@aurelia/plugin-svg';
import { App } from './app';
import { Pythagoras } from './pythagoras';

console.log({ App, Pythagoras });

const au = window['au'] = new Aurelia()
  .register(
    BasicConfiguration,
    DebugConfiguration,
    // Pythagoras as any,
    {
      register(container: IContainer) {
        register(container);
        (Pythagoras as any).register(container);
      }
    }
  )
  .app({ host: document.querySelector('app'), component: new App() });

au.start();
