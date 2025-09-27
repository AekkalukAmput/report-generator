import { HttpErrorResponse } from '@angular/common/http';

export interface ApiProblemDetails {
  status: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>; // field -> messages (รองรับรูปแบบ ASP.NET/ทั่วไป)
  path?: string | null;
  code?: string; // optional: error code เฉพาะระบบ
}

export function normalizeApiError(err: unknown): ApiProblemDetails {
  if (err instanceof HttpErrorResponse) {
    const body: any = err.error || {};
    const title =
      body.title || body.message || err.statusText || 'Unexpected error';
    const detail = body.detail || body.message || title;
    const errors: Record<string, string[]> | undefined =
      body.errors || body.validationErrors;
    return {
      status: err.status,
      title,
      detail,
      errors,
      path: err.url ?? null,
      code: body.code,
    };
  }
  // non-HTTP (throw อื่น ๆ)
  return { status: 0, title: 'Client error', detail: String(err), path: null };
}

// helper: map validation errors → Angular FormGroup
import { FormGroup } from '@angular/forms';
export function applyValidationErrors(
  form: FormGroup,
  errors?: Record<string, string[]>
) {
  if (!errors) return;
  Object.entries(errors).forEach(([field, messages]) => {
    const ctrl = form.get(field);
    if (ctrl) {
      const msg = Array.isArray(messages)
        ? messages.join(' ')
        : String(messages);
      const prev = ctrl.errors || {};
      ctrl.setErrors({ ...prev, api: msg });
    }
  });
}
