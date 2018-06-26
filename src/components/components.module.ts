import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header';
import { FilterHeaderComponent } from './filter-header/filter-header';
import { RallyFooterComponent } from './rally-footer/rally-footer';
import { RallyOrangeHeaderComponent } from './rally-orange-header/rally-orange-header';
import { RallyNameHeaderComponent } from './rally-name-header/rally-name-header';
import { ButtonComponent } from './main-button/main-button';
import { GoogleAutocompleteComponent } from './google-autocomplete/google-autocomplete';

@NgModule({
	declarations: [
    HeaderComponent,
    FilterHeaderComponent,
    RallyFooterComponent,
    RallyOrangeHeaderComponent,
    RallyNameHeaderComponent,
    ButtonComponent,
    GoogleAutocompleteComponent
    ],
	imports: [
        
    ],
	exports: [
    HeaderComponent,
    FilterHeaderComponent,
    RallyFooterComponent,
    RallyOrangeHeaderComponent,
    RallyNameHeaderComponent,
    ButtonComponent,
    GoogleAutocompleteComponent
    ],
   
})
export class ComponentsModule {}
