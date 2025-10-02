import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomModalService } from '@core/services/custom-modal/custom-modal.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import thLocale from '@fullcalendar/core/locales/th';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CurrencyDirective } from '@shared/directives/currency.directive';
import { NumbersOnlyDirective } from '@shared/directives/numbers-only.directive';
import {
  formatDateToString,
  getStartEndOfMonth,
} from '@shared/utils/date-format.util';
import { CategoriesApi, ExpenseApi } from 'app/api';
import {
  CreateExpenseDto,
  CreateExpenseItemDto,
} from 'app/api/model/create-expense-dto';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-expense',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FullCalendarModule,
    NumbersOnlyDirective,
    CurrencyDirective,
    NgxMaterialTimepickerModule,
    MatCardModule,
    MatGridListModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatIcon,
  ],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.scss',
})
export class ExpenseComponent {
  showForm = signal(false);
  editingId = signal<string | null>(null);
  categoryDropdown: any[] = []; // โครงสร้างสำหรับแสดง dropdown แบบมีกรุ๊ป
  customerTypeDdl: { name: string; value: CreateExpenseDto.CustomerEnum }[] = [
    { name: 'บุคคลธรรมดา', value: CreateExpenseDto.CustomerEnum.Individual },
    { name: 'บริษัท', value: CreateExpenseDto.CustomerEnum.Company },
  ]; // ประเภทลูกค้า

  form = this.fb.group({
    startProjectDate: ['', Validators.required],
    time: [formatDateToString(new Date(), 'HH:mm'), Validators.required],
    type: ['expense', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    note: [''],
    orderNo: ['', Validators.required],
    websiteName: ['', Validators.required],
    address: [''],
    telNo: [''],
    customerType: ['individual', Validators.required],
    withholdingTaxPercent: [
      3,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    withholdingTaxAmount: [0, [Validators.required, Validators.min(0.01)]],
    serviceFeePercent: [
      10,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    serviceFeeAmount: [0, [Validators.required, Validators.min(0.01)]],
    expenseItems: this.fb.array<CreateExpenseItemDto>([]),
  });

  // อีเวนต์สำหรับ FullCalendar
  events: EventInput[] = [];

  // ตัวเลือกของปฏิทิน
  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      multiMonthPlugin,
    ],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right:
        'dayGridMonth,timeGridWeek,timeGridDay,listDay,listMonth,multiMonthYear',
    },
    buttonText: {
      listDay: 'รายการ(วัน)',
      listMonth: 'รายการ(เดือน)',
    },
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    locale: thLocale,
    select: (arg) => this.onSelect(arg),
    eventClick: (arg) => this.onEventClick(arg),
    events: () => this.events,
  };

  constructor(
    private fb: FormBuilder,
    private expenseApi: ExpenseApi,
    private snack: MatSnackBar,
    private categoriesApi: CategoriesApi,
    private customModalService: CustomModalService
  ) {}

  ngOnInit() {
    this.getExpenses();
    this.onTypeChange(true);
  }

  getExpenses() {
    const dateConvert = getStartEndOfMonth(
      new Date(this.form.get('date')?.value || new Date())
    );
    this.expenseApi
      .listExpenseEvents(
        formatDateToString(dateConvert.start, 'YYYY-MM-DD'),
        formatDateToString(dateConvert.end, 'YYYY-MM-DD')
      )
      .subscribe({
        next: (res) => {
          this.events = res.map(toEventInput);
          this.calendarOptions = {
            ...this.calendarOptions,
            events: this.events,
          };
        },
      });
  }

  // เลือกวันจากปฏิทิน → เปิดฟอร์มสร้างใหม่
  onSelect(arg: DateSelectArg) {
    this.editingId.set(null);
    this.form.reset({
      startProjectDate: arg.startStr,
      time: formatDateToString(new Date(), 'HH:mm'),
      type: 'expense',
      amount: 0,
      category: '',
      note: '',
      orderNo: '',
      websiteName: '',
      address: '',
      telNo: '',
      customerType: 'individual',
      withholdingTaxPercent: 3,
      withholdingTaxAmount: 0,
      serviceFeePercent: 10,
      serviceFeeAmount: 0,
      expenseItems: [],
    });
    this.showForm.set(true);
  }

  formatTime(date: Date): string {
    return formatDateToString(date, 'HH:mm');
  }

  // คลิกอีเวนต์ → เปิดฟอร์มแก้ไข
  onEventClick(arg: EventClickArg) {
    const ext = arg.event.extendedProps as any;
    this.editingId.set(arg.event.id);
    this.form.reset({
      startProjectDate: arg.event.startStr?.slice(0, 10),
      time: ext.startProjectDate.split('T')[1]
        ? this.formatTime(new Date(ext.startProjectDate))
        : undefined,
      type: ext.type || 'expense',
      amount: Number(ext.amount ?? 0),
      category: ext.category,
      note: ext.note || '',
      orderNo: ext.orderNo || '',
      websiteName: ext.websiteName || '',
      address: ext.address || '',
      telNo: ext.telNo || '',
      customerType: ext.customerType || '',
      withholdingTaxPercent: Number(ext.withholdingTaxPercent ?? 3),
      withholdingTaxAmount: Number(ext.withholdingTaxAmount ?? 0),
      serviceFeePercent: Number(ext.serviceFeePercent ?? 10),
      serviceFeeAmount: Number(ext.serviceFeeAmount ?? 0),
      expenseItems: ext.expenseItems || [],
    });
    this.showForm.set(true);
    this.onTypeChange(true);
  }

  groupCategoriesForSelect(data: any[], { type = 'EXPENSE' } = {}) {
    // ใช้เฉพาะประเภทที่ต้องการ และที่ยัง active
    const rows = data.filter((x: any) => x.type === type && x.isActive);

    // ทำ map + เตรียม children
    const byId = new Map();
    rows.forEach((r) => byId.set(r.id, { ...r, children: [] }));

    // ผูกความเป็นลูก
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId).children.push(node);
      }
    });

    const roots = [...byId.values()].filter((n) => !n.parentId);

    const sort = (a: any, b: any) =>
      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'th');

    // ถ้าต้องการให้กลุ่มแสดง “ใบ” ทุกระดับ (deep leaves)
    const leavesOf = (node: any) => {
      if (!node.children || node.children.length === 0) return [node];
      return node.children.sort(sort).flatMap(leavesOf);
    };

    // ถ้าอยากแสดงเฉพาะลูกชั้นเดียว เปลี่ยนเป็น:
    // const leavesOf = (node) => (node.children?.length ? node.children.sort(sort) : [node]);

    return roots.sort(sort).map((root) => {
      const leaves = leavesOf(root);
      return {
        name: root.name,
        items: leaves.map((n: any) => ({
          value: n.name,
          viewValue: n.name,
        })),
      };
    });
  }

  onTypeChange(isInit = false) {
    const type = this.form.get('type')?.value;
    if (type) {
      if (!isInit) this.form.get('category')?.patchValue('');
      this.categoriesApi
        .categoriesControllerList(type as 'income' | 'expense')
        .subscribe({
          next: (res) => {
            this.categoryDropdown = this.groupCategoriesForSelect(res, {
              type: type.toUpperCase(),
            });
          },
        });
    }
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('กรุณาตรวจสอบข้อมูลในฟอร์ม', 'ปิด', { duration: 4000 });
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      startProjectDate: v.startProjectDate! + 'T' + v.time!.slice(0, 5) + ':00',
      amount: Number(v.amount),
      type: v.type as CreateExpenseDto.TypeEnum,
      category: v.category?.trim() || '',
      note: v.note?.trim() || undefined,
      orderNo: v.orderNo || '',
      websiteName: v.websiteName || '',
      address: v.address || '',
      telNo: v.telNo || '',
      customerType:
        (v.customerType as CreateExpenseDto.CustomerEnum) ||
        CreateExpenseDto.CustomerEnum.Individual,
      withholdingTaxPercent: v.withholdingTaxPercent || 3,
      withholdingTaxAmount: v.withholdingTaxAmount || 0,
      serviceFeePercent: v.serviceFeePercent || 10,
      serviceFeeAmount: v.serviceFeeAmount || 0,
      expenseItems: (v.expenseItems as CreateExpenseItemDto[]) || undefined,
    } satisfies Omit<CreateExpenseDto, 'id'>;

    const id = this.editingId();
    if (id) {
      this.expenseApi
        .updateExpenseEvent(id, JSON.stringify(payload))
        .subscribe({
          next: (res) => {
            this.getExpenses();
          },
        });
    } else {
      this.expenseApi.createExpenseEvent(JSON.stringify(payload)).subscribe({
        next: (res) => {
          this.getExpenses();
        },
      });
    }
    this.cancelForm();
  }

  async deleteCurrent() {
    const id = this.editingId();
    if (id) {
      const confirm = await lastValueFrom(
        this.customModalService.openConfirmDialog({
          title: 'ยืนยันการลบ',
          message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?',
        })
      );
      if (!confirm) return;
      this.expenseApi.deleteExpenseEvent(id).subscribe({
        next: (res) => {
          this.getExpenses();
        },
      });
      this.cancelForm();
    } else {
      this.snack.open('ไม่พบข้อมูลที่จะแก้ไข', 'ปิด', { duration: 4000 });
    }
  }

  get expenseItemArr() {
    return this.form.get('expenseItems') as FormArray;
  }

  genExpenseItemForm(item?: CreateExpenseItemDto) {
    return this.fb.group({
      name: [item?.name || '', Validators.required],
      amount: [item?.amount ?? 0, [Validators.required, Validators.min(0.01)]],
    });
  }

  setExpenseItem(items: CreateExpenseItemDto[]) {
    while (this.expenseItemArr.length > 0) {
      this.expenseItemArr.removeAt(0);
    }
    items.forEach((e) => {
      this.onAddExpenseItems(e);
    });
  }

  onAddExpenseItems(item?: CreateExpenseItemDto) {
    this.expenseItemArr.push(this.genExpenseItemForm(item));
  }

  onDeleteExpenseItems(index: number) {
    this.expenseItemArr.removeAt(index);
  }
}

// helpers
function toEventInput(e: any): EventInput {
  const color = e.type === 'income' ? '#2e7d32' : '#c62828';
  const amount = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(e.amount);
  const title = `${amount}${e.category ? ' • ' + e.category : ''}`;
  return {
    id: e.id,
    title: title,
    start: e.startProjectDate,
    allDay: true,
    color,
    extendedProps: { ...e },
  };
}
