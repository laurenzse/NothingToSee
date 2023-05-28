import Image from "next/image";
import styles from "./page.module.css";
import YouTubeAudioPlayer from "../components/YouTubeAudioPlayer";
export default function Home() {
  const videoId = "3r_Z5AYJJd4";

  return (
    <div>
      {/* Render other components */}
      <YouTubeAudioPlayer videoId={videoId} />
    </div>
  );
  // return (
  //   <main className={styles.main}>
  //     <div className={styles.description}>
  //       <p>
  //         Get started by editing&nbsp;
  //         <code className={styles.code}>app/page.tsx</code>
  //       </p>
  //       <div>
  //         <a
  //           href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           <Image
  //             src="/vercel.svg"
  //             alt="Vercel Logo"
  //             className={styles.vercelLogo}
  //             width={100}
  //             height={24}
  //             priority
  //           />
  //         </a>
  //       </div>
  //     </div>
  //     <YouTubeAudioPlayer videoId="3r_Z5AYJJd4" />
  //     <div className={styles.center}>
  //       <Image
  //         className={styles.logo}
  //         src="/next.svg"
  //         alt="Next.js Logo"
  //         width={180}
  //         height={37}
  //         priority
  //       />
  //     </div>
  //   </main>
  // );
}
