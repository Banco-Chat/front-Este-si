import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-messages',
  imports: [CommonModule],
  templateUrl: './error-messages.html',
  styleUrl: './error-messages.css',
})
export class ErrorMessages implements OnChanges, OnDestroy {
  @Input() control!: AbstractControl | null;
  @Input() label: string = '';
  @Input() version: 'm' | 'f' = 'm';
  @Input() unidad: string = '';
  @Input() messageFormat: string = '';

  private cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['control']) {
      this.sub?.unsubscribe();

      if (this.control) {
        this.sub = this.control.statusChanges.subscribe(() => {
          this.cdr.markForCheck();
        });
      }
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  shouldShowError(): boolean {
    return !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  getFirstError(): string | null {
    if (!this.control || !this.control.errors) return null;

    const e = this.control.errors;

    if (e['required']) {
      const generoTxt = this.version === 'f' ? 'obligatoria' : 'obligatorio';
      return `${this.label} es ${generoTxt}`;
    }
    if (e['email']) return `Formato de correo inválido`;
    if (e['pattern']) return this.messageFormat?.trim() || 'Formato inválido';
    if (e['minlength']) return `Mínimo ${e['minlength'].requiredLength} caracteres`;
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres`;
    if (e['min']) return `Mínimo ${e['min'].min}${this.unidad ? ' ' + this.unidad : ''}`;
    if (e['max']) return `Máximo ${e['max'].max}${this.unidad ? ' ' + this.unidad : ''}`;
    if (e['noMatch']) return `Los campos no coinciden`;
    if (e['minimumAge']) return `Debes ser mayor de ${e['minimumAge'].requiredAge} años`;
    if (e['hourInPast']) return `La hora seleccionada ya pasó`;
    if (e['fileType']) return `El archivo debe ser una imagen JPEG, JPG, PNG o WEBP`;
    if (e['invalidFile']) return `Archivo inválido`;
    if (e['maxSize']) return `El archivo es demasiado grande`;
    if (e['emailOrPhone']) return `Debe ser un correo válido o un teléfono de 10 dígitos`;
    if (e['profanity']) return `El contenido contiene palabras no permitidas`;
    if (e['clabeFormat']) return this.messageFormat?.trim() || `La CLABE debe tener exactamente 18 dígitos`;
    if (e['clabeInvalid']) return `La CLABE es inválida (el dígito verificador no coincide)`;
    if (e['rfcInvalid']) return `Formato inválido. Ejemplo: XEXX010101000 (persona física)`;

    return null;
  }

  getAllErrors(): string[] {
    if (!this.control || !this.control.errors) return [];

    const e = this.control.errors;
    const messages: string[] = [];

    if (e['required']) {
      const generoTxt = this.version === 'f' ? 'obligatoria' : 'obligatorio';
      messages.push(`${this.label} es ${generoTxt}`);
    }
    if (e['email']) messages.push(`Formato de correo inválido`);
    if (e['pattern']) messages.push(this.messageFormat?.trim() || 'Formato inválido');
    if (e['minlength']) messages.push(`Mínimo ${e['minlength'].requiredLength} caracteres`);
    if (e['maxlength']) messages.push(`Máximo ${e['maxlength'].requiredLength} caracteres`);
    if (e['min']) messages.push(`Mínimo ${e['min'].min}${this.unidad ? ' ' + this.unidad : ''}`);
    if (e['max']) messages.push(`Máximo ${e['max'].max}${this.unidad ? ' ' + this.unidad : ''}`);
    if (e['noMatch']) messages.push(`Los campos no coinciden`);
    if (e['minimumAge']) messages.push(`Debes ser mayor de ${e['minimumAge'].requiredAge} años`);
    if (e['hourInPast']) messages.push(`La hora seleccionada ya pasó`);
    if (e['fileType']) messages.push(`El archivo debe ser una imagen JPEG, JPG, PNG o WEBP`);
    if (e['invalidFile']) messages.push(`Archivo inválido`);
    if (e['maxSize']) messages.push(`El archivo es demasiado grande`);
    if (e['emailOrPhone']) messages.push(`Debe ser un correo válido o un teléfono de 10 dígitos`);
    if (e['profanity']) messages.push(`El contenido contiene palabras no permitidas`);
    if (e['clabeFormat']) messages.push(this.messageFormat?.trim() || `La CLABE debe tener exactamente 18 dígitos`);
    if (e['clabeInvalid']) messages.push(`La CLABE es inválida (el dígito verificador no coincide)`);
    if (e['rfcInvalid']) messages.push(`Formato inválido. Ejemplo: XEXX010101000 (persona física)`);

    return messages;
  }
}