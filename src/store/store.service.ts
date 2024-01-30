import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { StockState } from '../app/interface/stock-state';

@Injectable({
  providedIn: 'root'
})

export class StoreService {
  private state = new BehaviorSubject<StockState>({
    limit: 10,
    offset: 0
  });

  private increaseLimitAction = new Subject<number>();
  private decreaseLimitAction = new Subject<number>();
  private increaseOffsetAction = new Subject<number>();
  private decreaseOffsetAction = new Subject<number>();

  limit$ = this.createSelector(state => state.limit);
  offset$ = this.createSelector(state => state.offset);

  constructor() {
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
}
