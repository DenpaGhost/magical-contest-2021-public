import { useCallback, useEffect } from "react";
import { SceneProps } from "../../SceneScreen";
import generalStyles from "../general.module.scss";
import styles from "./DefaultScene.module.scss";

const DefaultScene: React.FC<SceneProps> = ({
  song,
  isPlayable = false,
  requestPlay,
}) => {
  const onKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Space") {
        if (requestPlay && isPlayable) requestPlay();
        event.preventDefault();
      }
    },
    [requestPlay, isPlayable]
  );

  useEffect(() => {
    if (window) {
      window.addEventListener("keydown", onKeydown, false);
    }
    return () => {
      if (window) {
        window.removeEventListener("keydown", onKeydown, false);
      }
    };
  }, [onKeydown]);

  return (
    <div className={generalStyles.container}>
      {song ? (
        <>
          <div className={styles.container}>
            <div className={styles.songInfoContainer}>
              <div className={styles.title}>{song.name}</div>
              <div className={styles.composer}>{song.artist.name}</div>
            </div>
          </div>
          <div className={styles.hintContainer}>
            <div className={styles.startHint}>
              {isPlayable ? "スペースキーを押してスタート" : "読み込み中..."}
            </div>
          </div>
        </>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
};
export default DefaultScene;
