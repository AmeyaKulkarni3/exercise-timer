import { computed, Injectable, signal } from '@angular/core';
import { Phase } from '../models/phase';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  phases: Phase[] = [];

  currentIndex = 0;

  timeRemaining = signal(0);

  currentPhase = signal<Phase | null>(null);

  running = signal(false);

  finished = signal(false);

  debugMessage = signal('');

  private intervalId?: number;

  workoutActive = computed(() => this.currentPhase() !== null);

  private beepAudio = new Audio('assets/beep.wav');

  private audioContext?: AudioContext;

  phaseTitle = computed(() => {
    switch (this.currentPhase()?.type) {
      case 'Startup':
        return 'Get Ready';

      case 'Hip Raise':
        return 'Hip Raise';

      case 'Chest Raise':
        return 'Chest Raise';

      case 'Change':
        return 'Change Position';

      case 'Elbow Push':
        return 'Elbow Push';

      case 'Elbow Raise':
        return 'Elbow Raise';

      case 'Head Arm Push':
        return 'Head Arm Push';

      case 'Shoulder Shrug Left':
        return 'Shoulder Shrug Left';

      case 'Shoulder Shrug Right':
        return 'Shoulder Shrug Right';

      default:
        return '';
    }
  });

  formattedTime = computed(() => {
    const total = this.timeRemaining();

    const mins = Math.floor(total / 60);
    const secs = total % 60;

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  currentRound = computed(() => this.currentPhase()?.round ?? 0);

  private buildRoutine1(): Phase[] {
    const phases: Phase[] = [];

    // Startup phase
    phases.push({ type: 'Startup', duration: 10, round: 0 });

    for (let round = 1; round <= 5; round++) {
      // Hip raise phase
      phases.push({ type: 'Hip Raise', duration: 120, round });
      phases.push({ type: 'Change', duration: 5, round });
      phases.push({ type: 'Chest Raise', duration: 120, round });
      phases.push({ type: 'Change', duration: 5, round });
    }

    phases.push({ type: 'Change', duration: 15, round: 6, sound: 'double' });
    phases.push({ type: 'Elbow Push', duration: 60, round: 7 });
    phases.push({ type: 'Change', duration: 5, round: 7 });
    phases.push({ type: 'Elbow Raise', duration: 60, round: 8 });
    phases.push({ type: 'Change', duration: 5, round: 8 });
    phases.push({ type: 'Head Arm Push', duration: 60, round: 9 });
    phases.push({ type: 'Change', duration: 5, round: 9 });
    phases.push({ type: 'Shoulder Shrug Left', duration: 60, round: 9 });
    phases.push({ type: 'Change', duration: 5, round: 9 });
    phases.push({ type: 'Shoulder Shrug Right', duration: 60, round: 10 });
    phases.push({ type: 'Change', duration: 5, round: 10, sound: 'double' });

    return phases;
  }

  private buildRoutine2(): Phase[] {
    const phases: Phase[] = [];

    // Startup phase
    phases.push({ type: 'Startup', duration: 10, round: 0 });
    phases.push({ type: 'Elbow Push', duration: 60, round: 1 });
    phases.push({ type: 'Change', duration: 5, round: 1 });
    phases.push({ type: 'Elbow Raise', duration: 60, round: 2 });
    phases.push({ type: 'Change', duration: 5, round: 2 });
    phases.push({ type: 'Head Arm Push', duration: 60, round: 3 });
    phases.push({ type: 'Change', duration: 5, round: 3 });
    phases.push({ type: 'Shoulder Shrug Left', duration: 60, round: 4 });
    phases.push({ type: 'Change', duration: 5, round: 4 });
    phases.push({ type: 'Shoulder Shrug Right', duration: 60, round: 5 });
    phases.push({ type: 'Change', duration: 5, round: 5, sound: 'double' });

    return phases;
  }

  async startRoutine1() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    this.debugMessage.set(`Before Resume: ${this.audioContext.state}`);

    await this.audioContext.resume();

    this.debugMessage.set(`Before Resume: ${this.audioContext.state}`);

    this.cancel();

    this.phases = this.buildRoutine1();

    this.currentIndex = 0;

    this.finished.set(false);

    this.loadCurrentPhase();
  }

  async startRoutine2() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    this.debugMessage.set(`Before Resume: ${this.audioContext.state}`);

    await this.audioContext.resume();

    this.debugMessage.set(`Before Resume: ${this.audioContext.state}`);

    this.cancel();

    this.phases = this.buildRoutine2();

    this.currentIndex = 0;

    this.finished.set(false);

    this.loadCurrentPhase();
  }

  private loadCurrentPhase(): void {
    const phase = this.phases[this.currentIndex];

    this.currentPhase.set(phase);

    this.timeRemaining.set(phase.duration);

    // Play beep for every phase except the initial startup
    if (phase.type !== 'Startup') {
      if (phase.sound === 'double') {
        this.playFinishSound();
      } else {
        this.playBeep();
      }
    }

    this.startCountdown();
  }

  private startCountdown() {
    clearInterval(this.intervalId);

    this.running.set(true);

    this.intervalId = window.setInterval(() => {
      const remaining = this.timeRemaining();

      if (remaining > 1) {
        this.timeRemaining.set(remaining - 1);
        return;
      }

      this.nextPhase();
    }, 1000);
  }

  private nextPhase(): void {
    clearInterval(this.intervalId);
    this.intervalId = undefined;
    this.currentIndex++;

    if (this.currentIndex >= this.phases.length) {
      this.running.set(false);

      this.finished.set(true);

      this.currentPhase.set(null);

      this.playFinishSound();

      return;
    }

    this.loadCurrentPhase();
  }

  private playBeep() {
    if (!this.audioContext) {
      this.debugMessage.set('No AudioContext');
      return;
    }
    
    this.debugMessage.set(`Beef State: ${this.audioContext.state}`);

    try {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 800;

      gain.gain.value = 0.2;

      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);

      oscillator.start();

      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (e) {
      this.debugMessage.set(String(e));
    }
  }

  pause() {
    if (!this.running()) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = undefined;
    this.running.set(false);
  }

  resume() {
    if (!this.workoutActive()) {
      return;
    }

    if (this.running()) {
      return;
    }

    this.startCountdown();
  }

  cancel() {
    clearInterval(this.intervalId);

    this.running.set(false);

    this.finished.set(false);

    this.currentPhase.set(null);

    this.timeRemaining.set(0);

    this.currentIndex = 0;

    this.phases = [];
  }

  private playFinishSound(): void {
    this.playBeep();

    setTimeout(() => {
      this.playBeep();
    }, 300);
  }
}
