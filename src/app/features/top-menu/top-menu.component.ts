import { Component, OnInit } from "@angular/core";
import { ColorScheme, ColorSchemeService } from "../../services/color-scheme.service";

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
})
export class TopMenuComponent implements OnInit {

  colorSchemes: { [key: string]: ColorScheme } = {
    colorScheme1: {
      color1: '#988dae',
      color2: '#84a59d',
      color3: '#f5cac3',
      color4: '#f7ede2'
    },
    colorScheme2: {
      color1: '#ef8354',
      color2: '#939496',
      color3: '#f2dda4',
      color4: '#bfc0c0'
    },
    colorScheme3: {
      color1: '#8892b3',
      color2: '#fdebd3',
      color3: '#679186',
      color4: '#bbd4ce'
    },
  };

  constructor(
    private colorSchemeService: ColorSchemeService
    ) {}

  ngOnInit(): void {
    const initialColorScheme = this.getColorSchemeByIndex(0);
    this.colorSchemeService.setCurrentScheme(initialColorScheme);
  }


  getColorSchemeByIndex(index: number): ColorScheme {
    const colorSchemeKeys = Object.keys(this.colorSchemes);
    const schemeName = colorSchemeKeys[index] as keyof typeof this.colorSchemes;
    return this.colorSchemes[schemeName];
  }

  changeColorScheme(index: number): void {
    const selectedScheme = this.getColorSchemeByIndex(index);
    this.colorSchemeService.setCurrentScheme(selectedScheme);
  }
}
