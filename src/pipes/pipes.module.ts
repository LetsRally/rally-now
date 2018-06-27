import { NgModule } from '@angular/core';
import { CapitalizePipe } from './../pipes/capitalize/capitalize';
import { DateTransformPipe } from './../pipes/date-transform/date-transform';
@NgModule({
	declarations: [CapitalizePipe,
    DateTransformPipe],
	imports: [],
	exports: [CapitalizePipe,
    DateTransformPipe]
})
export class PipesModule {}
