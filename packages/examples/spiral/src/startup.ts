import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

console.log({ App });

const au = window['au'] = new Aurelia()
  .register(
    BasicConfiguration,
    DebugConfiguration,
  )
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
