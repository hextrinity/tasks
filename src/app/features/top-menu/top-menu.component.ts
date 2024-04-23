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
      color1: '#ddbea9',
      color2: '#ffe8d6',
      color3: '#b7b7a4',
      color4: '#a5a58d'
    },
    colorScheme2: {
      color1: '#f7d1cd',
      color2: '#e8c2ca',
      color3: '#d1b3c4',
      color4: '#b392ac'
    },
    colorScheme3: {
      color1: '#CFC7D2',
      color2: '#BEA8AA',
      color3: '#9E9885',
      color4: '#7C7F65'
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
