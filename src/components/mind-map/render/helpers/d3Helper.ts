import { D3DragEvent, DraggedElementBaseType, drag } from 'd3-drag';

export function preventDrag<GElement extends DraggedElementBaseType, Datum>() {
  return drag<GElement, Datum>()
    .on(
      'start',
      (event: D3DragEvent<SVGForeignObjectElement, Datum, unknown>) => {
        // event.sourceEvent.preventDefault();
        event.sourceEvent.stopPropagation();
      },
    )
    .on(
      'drag',
      (event: D3DragEvent<SVGForeignObjectElement, Datum, unknown>) => {
        // event.sourceEvent.preventDefault();
        event.sourceEvent.stopPropagation();
      },
    )
    .on(
      'end',
      (event: D3DragEvent<SVGForeignObjectElement, Datum, unknown>) => {
        // event.sourceEvent.preventDefault();
        event.sourceEvent.stopPropagation();
      },
    );
}
