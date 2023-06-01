import Image from "next/image";
import styles from "../styles/page.module.css";
import MinimalPlayer from "../components/MinimalPlayer";
import LinkBar from "../components/LinkBar";

export default function Home() {
  return (
    <div>
      <div className="split-layout fill-page">
        <div className={styles.barComplement}>
          <MinimalPlayer />
        </div>
        <div className={styles.barElement}>
          <LinkBar />
        </div>
      </div>
    </div>
  );
}
