import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inline-spinner',
  standalone: true,
  templateUrl: './inline-spinner.html',
})
export class InlineSpinner {
  @Input() size: number = 16;
}
