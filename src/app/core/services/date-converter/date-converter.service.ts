import { Injectable } from '@angular/core';
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import dayjs from "dayjs";

dayjs.extend(buddhistEra)

@Injectable({
  providedIn: 'root'
})
export class DateConverterService {

  constructor() { }

  formatDateBB(date: Date | string) {
    return dayjs(date).format('DD/MM/BBBB');
  }
}
