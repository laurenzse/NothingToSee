import Image from "next/image";
import styles from "./page.module.css";
import SerenePlayer from "../components/SerenePlayer";
export default function Home() {
    return (
        <div>
            <SerenePlayer />
        </div>
    );
}
