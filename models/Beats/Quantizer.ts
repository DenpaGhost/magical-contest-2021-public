import {
  IBeat,
  IPhrase,
  IRepetitiveSegments,
  TimedObject,
} from "textalive-app-api";
import QuantizingBar from "./QuantizingBar";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

const searchNearBars = (
  bars: QuantizingBar[],
  obj: TimedObject
): [QuantizingBar, QuantizingBar] => {
  const startBar = bars.reduce((min, current) => {
    if (min) {
      const diffMin = Math.abs(min.startTime - obj.startTime);
      const diffCurrent = Math.abs(current.startTime - obj.startTime);
      return diffMin > diffCurrent ? current : min;
    } else {
      return current;
    }
  }, null);

  const endBar = bars.reduce((min, current) => {
    if (min) {
      const diffMin = Math.abs(min.startTime - obj.endTime);
      const diffCurrent = Math.abs(current.startTime - obj.endTime);
      return diffMin > diffCurrent ? current : min;
    } else {
      return current;
    }
  }, null);

  return [startBar, endBar];
};

const plucPhrases = (bars: QuantizingBar[]): QuantizedPhrase[] => {
  return bars.map((it) => it.phrase).filter((it) => !!it);
};

const parseBars = (beats: IBeat[]): QuantizingBar[] => {
  const array: QuantizingBar[] = [];
  let barsIndex = 1;
  beats.forEach((beat) => {
    if (beat.position === 1) {
      const bars: IBeat[] = [beat];
      for (let it = beat.next; it && it.position !== 1; it = it.next) {
        bars.push(it);
      }
      array.push(new QuantizingBar(barsIndex++, beat, bars));
    }
  });
  return array;
};

const quantizePhrases = (bars: QuantizingBar[], phrases: IPhrase[]): void =>
  phrases.forEach((phrase) => {
    const [startBar, endBar] = searchNearBars(bars, phrase);
    startBar.phrase = new QuantizedPhrase(phrase, startBar, endBar);
  });

const quantizeSegments = (
  bars: QuantizingBar[],
  segments: IRepetitiveSegments
): void =>
  segments.segments.forEach((segment) => {
    const [startBar, endBar] = searchNearBars(bars, segment);
    startBar.segments.push(
      new QuantizedSegment(segment, segments, startBar, endBar, segments.chorus)
    );
  });

const adjustPhrases = (bars: QuantizingBar[]) => {
  const ps = plucPhrases(bars);

  ps.forEach((phrase, i) => {
    const next = ps[i + 1];

    if (
      next?.phrase &&
      phrase &&
      next.startBar.index - phrase.endBar.index === 1
    ) {
      phrase.endBar = next.startBar;
    }
  });
};

const adjustSegments = (bars: QuantizingBar[]) => {
  let s: QuantizedSegment[] = [];
  bars.forEach(({ segments }) => {
    if (segments)
      segments.forEach((it) => {
        s.push(it);
      });
  });
  s = s.sort((a, b) => a.startBar.index - b.startBar.index);

  const removingSegment: QuantizedSegment[] = [];
  s.forEach((i) => {
    s.forEach((j) => {
      // 同じセグメント同士の比較あるいは処理済みセグメントならば何も行わない
      if (i === j || removingSegment.includes(i) || removingSegment.includes(j))
        return;

      // セグメントの区間が全く同じならば片方を削除する
      if (
        i.startBar.index === j.startBar.index &&
        i.endBar.index === j.endBar.index
      ) {
        i.isSabi = i.isSabi || j.isSabi;
        removingSegment.push(j);
        return;
      }

      // セグメントの開始位置が同じならば2つに分割する
      if (
        i.startBar.index === j.startBar.index &&
        i.endBar.index !== j.endBar.index
      ) {
        if (i.endBar.index < j.endBar.index) {
          j.startBar.segments = j.startBar.segments.filter((it) => it !== j);
          j.startBar = i.endBar;
          i.endBar.segments.push(j);
        } else {
          i.startBar.segments = i.startBar.segments.filter((it) => it !== i);
          i.startBar = j.endBar;
          j.endBar.segments.push(i);
        }
        return;
      }

      // セグメントの区間が重なっていたら結合する
      if (
        i.startBar.index < j.startBar.index &&
        j.startBar.index < i.endBar.index
      ) {
        //サビ区間はそのままにしておく
        if (i.parent.chorus) {
          removingSegment.push(j);
          return;
        }
        if (j.parent.chorus) {
          removingSegment.push(i);
          return;
        }

        // サビではないものはくっつける
        if (i.endBar.index < j.endBar.index) {
          i.endBar = j.endBar;
        }
        i.isSabi = i.isSabi || j.isSabi;
        removingSegment.push(j);
      }
    });
  });

  // 結合したセグメントを削除
  removingSegment.forEach((it) => {
    it.startBar.segments = it.startBar.segments.filter(
      (segment) => segment !== it
    );
  });

  // セグメントとセグメントの間に1小節だけ隙間があったら前のセグメントを伸ばして埋める
  const adjusted: QuantizedSegment[] = [];
  bars.forEach(({ segments }) => {
    if (segments)
      segments.forEach((it) => {
        adjusted.push(it);
      });
  });
  adjusted.forEach((segment, i) => {
    const next = adjusted[i + 1];
    if (!next) return;

    if (next.startBar.index - segment.endBar.index === 1) {
      segment.endBar = next.startBar;
    }
  });
};

export default {
  plucPhrases,
  parseBars,
  quantizePhrases,
  quantizeSegments,
  adjustPhrases,
  adjustSegments,
};
