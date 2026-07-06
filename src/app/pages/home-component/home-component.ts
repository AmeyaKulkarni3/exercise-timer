import { Component, inject } from '@angular/core';
import { TimerService } from '../../services/timer-service';

@Component({
  selector: 'app-home-component',
  imports: [],
  templateUrl: './home-component.html',
})
export class HomeComponent {

  timer = inject(TimerService);

  
}
