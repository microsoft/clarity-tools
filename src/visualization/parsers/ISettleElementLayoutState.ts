import { IAttributes, ILayoutState, IElementLayoutState, IDoctypeLayoutState, ITextLayoutState, IIgnoreLayoutState, Action } from "clarity-js/clarity";

export interface ISettleElementLayoutState extends IElementLayoutState {
    isSettleEvent: boolean;
  }