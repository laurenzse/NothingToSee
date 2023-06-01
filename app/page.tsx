import Image from "next/image";
import styles from "./page.module.css";
import SerenePlayer from "../components/SerenePlayer";
import LinkBar from "../components/link_bar";
import "../styles/split-layout.css";
import "../styles/global.css";

export default function Home() {
  return (
    <div>
      <div className="split-layout fill-page">
        <div className="bar-complement">
          <SerenePlayer />

          {/*<p>Hey hey</p>*/}
        </div>
        <div className="bar-element">
          <LinkBar />
        </div>
      </div>
    </div>
  );
}
