import { Injectable } from '@angular/core';
import { BehaviorSubject, NEVER, Observable, Subject, Subscription, catchError, distinctUntilChanged, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs';
import { StockState } from '../app/interface/stock-state';
import { HttpClient } from '@angular/common/http';
import { Stock } from '../app/interface/stock';

@Injectable({
  providedIn: 'root'
})

export class StoreService {
  private state = new BehaviorSubject<StockState>({
    limit: 0,
    offset: 0,
    stocks: []
  });

  private increaseLimitAction = new Subject<number>();
  private decreaseLimitAction = new Subject<number>();
  private increaseOffsetAction = new Subject<number>();
  private decreaseOffsetAction = new Subject<number>();

  private loadStockAction = new Subject<void>();
  private loadStockSuccessAction = new Subject<Stock[]>();
  private loadStockErrorAction = new Subject<any>();

  limit$ = this.createSelector(state => state.limit);
  offset$ = this.createSelector(state => state.offset);

  stocks$ = this.createSelector(state => state.stocks);

  constructor(private http:HttpClient) {

    this.createEffect(this.loadStockAction.pipe(
      withLatestFrom(this.limit$,this.offset$),
      switchMap(([_,limit,offset]) => {
        return this.http.get<Stock[]>(`http://localhost:3000/stocks?limit=${limit}&offset=${offset}`)
          .pipe(catchError(err => {
            console.log('error',err)
            this.loadStockErrorAction.next(err);
            return NEVER;
          }))
      }), tap(response => {
        console.log(response)
        this.loadStockSuccessAction.next(response);
      })
    ))

    this.createReducer(this.increaseLimitAction, (state, limit) => {
      state.limit += limit;
      return state;
    });

    this.createReducer(this.decreaseLimitAction, (state, limit) => {
      state.limit -= limit;
      return state;
    });

    this.createReducer(this.increaseOffsetAction, (state, offset) => {
      state.offset += offset;
      return state;
    });

    this.createReducer(this.decreaseOffsetAction, (state, offset) => {
      state.offset -= offset;
      return state;
    });

    this.createEffect(this.loadStockErrorAction.pipe(tap(err => {
      console.error(err);
    })))

    this.createReducer(this.loadStockSuccessAction, (state, stocks) => {
      state.stocks = stocks
      return state;
    });
  }

  increaseLimit(limit: number) {
    this.increaseLimitAction.next(limit)
  }
  decreaseLimit(limit: number) {
    this.decreaseLimitAction.next(limit)
  }
  increaseOffset(offset: number) {
    this.increaseOffsetAction.next(offset)
  }
  decreaseOffset(offset: number) {
    this.decreaseOffsetAction.next(offset)
  }

  loadStock(){
    this.loadStockAction.next();
  }

  private createReducer<T>(
    action$: Observable<T>,
    accumulator: (state: StockState, action: T) => StockState
  ) {
    action$.subscribe((action) => {
      const state = { ...this.state.value }
      const newState = accumulator(state, action)
      this.state.next(newState)
    });
  }

  private createSelector<T>(selector: (state: StockState) => T): Observable<T> {
    return this.state.pipe(
      map(selector),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private createEffect<T>(effect$: Observable<T>): Subscription {
    return effect$.subscribe();
  }

}
