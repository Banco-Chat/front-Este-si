import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { resolveA2uiEntry } from './a2ui-registry';

/**
 * Host dinámico para el sistema de componentes A2UI: resuelve el `component`
 * (string) que llega en el `uiSchema` del backend contra el registro y crea
 * la pieza de Angular correspondiente, pasándole los inputs ya traducidos.
 * Usa ViewContainerRef en vez de *ngComponentOutlet para poder re-emitir el
 * (action) de la pieza creada (confirmaciones/acciones del usuario sobre la tarjeta).
 */
@Component({
  selector: 'app-a2ui-block',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-container #host></ng-container>`,
  host: { class: 'block' },
})
export class A2uiBlock implements OnChanges, OnDestroy {
  @Input() componentType: string = '';
  @Input() props: any = {};
  @Output() action = new EventEmitter<string>();

  @ViewChild('host', { read: ViewContainerRef, static: true }) private host!: ViewContainerRef;

  private actionSub?: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['componentType'] || changes['props']) {
      this.render();
    }
  }

  ngOnDestroy() {
    this.actionSub?.unsubscribe();
  }

  private render() {
    this.actionSub?.unsubscribe();
    this.host.clear();

    const entry = resolveA2uiEntry(this.componentType);
    if (!entry) return;

    const ref = this.host.createComponent(entry.component);
    const inputs = entry.mapInputs(this.props || {});

    for (const [key, value] of Object.entries(inputs)) {
      (ref.instance as any)[key] = value;
    }

    if (ref.instance.action instanceof EventEmitter) {
      this.actionSub = ref.instance.action.subscribe((message: string) => this.action.emit(message));
    }

    ref.changeDetectorRef.detectChanges();
  }
}
