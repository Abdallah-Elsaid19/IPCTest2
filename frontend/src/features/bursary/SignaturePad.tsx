import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useController, useFormContext } from "react-hook-form";

import type { BursaryApplicationFormValues } from "./schema";

const signatureFieldName = "reviewAndDeclaration.electronicSignature" as const;
const isSignatureImage = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("data:image/png;base64,");

export function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const { control, formState: { submitCount } } = useFormContext<BursaryApplicationFormValues>();
  const { field, fieldState } = useController({ name: signatureFieldName, control });
  const visibleError = fieldState.error && (fieldState.isTouched || submitCount > 0)
    ? fieldState.error.message
    : undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!isSignatureImage(field.value)) return;

    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = field.value;
  }, [field.value]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };

  const startDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#171310";
    drawing.current = true;
  };

  const continueDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const finishDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = event.currentTarget;
    canvas.getContext("2d")?.closePath();
    field.onChange(canvas.toDataURL("image/png"));
    field.onBlur();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    field.onChange("");
    field.onBlur();
  };

  return (
    <div className="mt-6">
      <label className="mb-2 block text-sm font-semibold text-background-950">
        Draw signature <span className="text-primary-700" aria-hidden="true">*</span>
      </label>
      <div className={`border bg-white p-4 ${visibleError ? "border-red-500" : "border-background-300"}`}>
        <canvas
          ref={canvasRef}
          width={900}
          height={210}
          role="application"
          aria-label="Draw your signature using a mouse, stylus or touch screen"
          aria-invalid={Boolean(visibleError)}
          aria-describedby={visibleError ? "bursary-signature-error" : "bursary-signature-help"}
          onPointerDown={startDrawing}
          onPointerMove={continueDrawing}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          className="h-48 w-full touch-none border border-dashed border-background-300 bg-white"
        />
        <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p id="bursary-signature-help" className="text-xs leading-5 text-foreground-500">
            Sign inside the box using a mouse, stylus or touch screen.
          </p>
          <button
            type="button"
            onClick={clearSignature}
            className="border border-background-300 bg-white px-4 py-2 text-xs font-semibold hover:border-primary-500"
          >
            Clear signature
          </button>
        </div>
      </div>
      {visibleError && <p id="bursary-signature-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{visibleError}</p>}
    </div>
  );
}
