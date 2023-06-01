"use client";
import styles from "../styles/page.module.css";
import MinimalPlayer from "../components/MinimalPlayer";
import React, { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [sourceURL, setSourceURL] = useState<string>();

  return (
    <div>
      <div className="split-layout fill-page">
        <div className={styles.barComplement}>
          <MinimalPlayer sourceURLChanged={(source) => setSourceURL(source)} />
        </div>
        <div className={styles.bar}>
          {sourceURL && (
            <Link
              href={sourceURL}
              className={styles.barElement}
              target="_blank"
            >
              Playing from...
            </Link>
          )}
          <Link href={"adsadfsdf.de"} className={styles.barElement}>
            Imprint
          </Link>
        </div>
      </div>
    </div>
  );
}
