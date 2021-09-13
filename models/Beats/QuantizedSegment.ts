import { IRepetitiveSegment, IRepetitiveSegments } from "textalive-app-api";
import QuantizedBars from "./QuantizedBars";

export default class QuantizedSegment {
  protected _current: IRepetitiveSegment;
  protected _parent: IRepetitiveSegments;
  public startBar: QuantizedBars;
  public endBar: QuantizedBars;
  constructor(
    currentSegment: IRepetitiveSegment,
    parentSegment: IRepetitiveSegments,
    startBar: QuantizedBars,
    endBar: QuantizedBars
  ) {
    this._current = currentSegment;
    this._parent = parentSegment;
    this.startBar = startBar;
    this.endBar = endBar;
  }

  get current() {
    return this._current;
  }

  get parent() {
    return this._parent;
  }

  get duration() {
    return this.endBar.startTime - this.startBar.startTime;
  }
}
