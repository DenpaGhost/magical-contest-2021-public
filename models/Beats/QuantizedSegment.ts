import { IRepetitiveSegment, IRepetitiveSegments } from "textalive-app-api";
import QuantizingBar from "./QuantizingBar";

export default class QuantizedSegment {
  protected _current: IRepetitiveSegment;
  protected _parent: IRepetitiveSegments;
  public startBar: QuantizingBar;
  public endBar: QuantizingBar;
  public isSabi: boolean = false;
  constructor(
    currentSegment: IRepetitiveSegment,
    parentSegment: IRepetitiveSegments,
    startBar: QuantizingBar,
    endBar: QuantizingBar,
    isSabi?: boolean
  ) {
    this._current = currentSegment;
    this._parent = parentSegment;
    this.startBar = startBar;
    this.endBar = endBar;
    this.isSabi = isSabi ?? false;
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
