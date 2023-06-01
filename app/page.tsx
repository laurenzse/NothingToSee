import Image from "next/image";
import styles from "./page.module.css";
import MinimalPlayer from "../components/MinimalPlayer";
import LinkBar from "../components/LinkBar";
import "../styles/split-layout.css";
import "../styles/globals.css";

export default function Home() {
  return (
    <div>
      <div className="split-layout fill-page">
        <div className="bar-complement">
          <MinimalPlayer />

          {/*<p>Hey hey</p>*/}
        </div>
        <div className="bar-element">
          <LinkBar />
        </div>
      </div>
    </div>
  );
}
