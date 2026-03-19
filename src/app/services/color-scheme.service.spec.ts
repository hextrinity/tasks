import { TestBed } from '@angular/core/testing';
import { ColorScheme, ColorSchemeService } from './color-scheme.service';

describe('ColorSchemeService', () => {
  let service: ColorSchemeService;


  beforeEach(() => {    
    TestBed.configureTestingModule({
        providers: [
            ColorSchemeService
        ]
    });
    service = TestBed.inject(ColorSchemeService);
  });
 
  it('should return the default color scheme', () => {  
    spyOn(service, 'getCurrentScheme').and.callThrough();
    const scheme = service.getCurrentScheme().value;    

    expect(scheme).toEqual({
      color1: 'white',
      color2: 'white',
      color3: 'white',
      color4: 'white'
    });

    expect(service.getCurrentScheme).toHaveBeenCalledTimes(1);   
  });

  it('should update the color scheme', () => {    
    const newScheme: ColorScheme = {
        color1: 'red',
        color2: 'blue',
        color3: 'green',
        color4: 'yellow'
    };

    service.setCurrentScheme(newScheme);

    expect(service.getCurrentScheme().value).toEqual(newScheme);
    });

});