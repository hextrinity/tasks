import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ColorScheme {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

@Injectable({
  providedIn: 'root',
})
export class ColorSchemeService {
  private currentSchemeSubject: BehaviorSubject<ColorScheme>;

  constructor() {
    const firstScheme: ColorScheme = {
      color1: 'white',
      color2: 'white',
      color3: 'white',
      color4: 'white',
    };

    this.currentSchemeSubject = new BehaviorSubject<ColorScheme>(firstScheme);
  }

  getCurrentScheme(): BehaviorSubject<ColorScheme> {
    return this.currentSchemeSubject;
  }

  setCurrentScheme(scheme: ColorScheme): void {
    this.currentSchemeSubject.next(scheme);
  }
}
