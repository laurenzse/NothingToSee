"use client";
import styles from "../styles/page.module.css";
import MinimalPlayer from "../components/MinimalPlayer";
import React, { useCallback, useState } from "react";

export default function Home() {
  const [sourceURL, setSourceURL] = useState<string>();
  const handleSourceURLChanged = useCallback((source: string) => {
    setSourceURL(source);
  }, []);

  return (
    <div>
      <div className="split-layout fill-page">
        <div className={styles.barComplement}>
          <MinimalPlayer sourceURLChanged={handleSourceURLChanged} />
        </div>
        <div className={styles.bar}>
          {sourceURL && (
            <a href={sourceURL} className={styles.barElement} target="_blank">
              Playing from...
            </a>
          )}
          <a
            href={"mailto:laurenzseidel@yahoo.de"}
            className={styles.barElement}
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
