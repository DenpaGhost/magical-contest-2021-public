import { IBeat } from "textalive-app-api";
import QuantizedBars from "./QuantizedBars";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizingBars {
  protected _index: number;
  protected _firstBeat: IBeat;
  protected _bars: IBeat[];
  protected _quantized: QuantizedBars;
  public phrase?: QuantizedPhrase;
  public segments: QuantizedSegment[];

  constructor(
    index: number,
    firstBeat: IBeat,
    bars: IBeat[],
    phrase?: QuantizedPhrase,
    segments?: QuantizedSegment[]
  ) {
    this._index = index;
    this._firstBeat = firstBeat;
    this._bars = bars;
    this.phrase = phrase;
    this.segments = segments ?? [];
  }

  get index(): number {
    return this._index;
  }

  get firstBeat(): IBeat {
    return this._firstBeat;
  }

  get startTime(): number {
    return this._firstBeat.startTime;
  }

  get bars(): IBeat[] {
    return this._bars;
  }

  get length(): number {
    return this._bars.reduce((total, it) => total + it.length, 0);
  }

  get quantizedBars(): QuantizedBars {
    if (!this._quantized) {
      const s: QuantizedSegment = this.segments ? this.segments[0] : null;
      this._quantized = new QuantizedBars(
        this.index,
        this.firstBeat,
        this.bars,
        this.phrase,
        s
      );
    }
    return this._quantized;
  }

  toString() {
    return `${this.index}.${this.firstBeat.position} Bars`;
  }
}
