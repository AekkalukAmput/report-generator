import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { applyValidationErrors } from '@core/error-handling/api-error';
import { RouterService } from '@core/services/router/router.service';
import { PATH } from '@shared/constants/paths.constant';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loading = false;
  errorMsg: string | null = null;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  passwordVisible = false;

  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private routerService: RouterService
  ) {
    this.sub = this.form.valueChanges.subscribe(() => {
      if (this.errorMsg) this.errorMsg = null;
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value as any;
    this.auth.login(email, password).subscribe({
      next: () => this.routerService.navigateTo(PATH.HOME),
      error: (e) => {
        console.error(e);
        const status = e?.status;
        const body = e?.error || {};
        const detail = e.detail || body.message || e?.statusText;
        this.loading = false;
        if (status === 422) {
          applyValidationErrors(this.form, e.errors);
          this.errorMsg = 'กรุณาตรวจสอบข้อมูลให้ครบถ้วน';
        } else if (status === 400 || status === 401) {
          this.errorMsg = detail || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        } else if (status === 0) {
          this.errorMsg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
        } else {
          this.errorMsg = detail || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        }
      },
    });
  }

  navigateToCreateAccount(): void {
    this.routerService.navigateTo(PATH.REGISTER);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
