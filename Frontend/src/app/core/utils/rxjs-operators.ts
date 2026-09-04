import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/common/api-response.model';

/**
 * Custom RxJS operator to unwrap standard ApiResponse<T> payloads
 * into their underlying T data value gracefully.
 */
export function unwrapApiResponse<T>() {
  return (source$: Observable<ApiResponse<T> | T>): Observable<T> =>
    source$.pipe(
      map((res: any) => {
        if (res && typeof res === 'object' && ('data' in res || 'Data' in res)) {
          return res.data ?? res.Data;
        }
        return res as T;
      })
    );
}
