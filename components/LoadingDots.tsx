import React, { useState, useEffect } from "react";
import styles from "../styles/LoadingDots.module.css";

const LoadingDots: React.FC = () => {
  const [dotState, setDotState] = useState<number>(0);

  useEffect(() => {
    // Increment the dotState every 500 milliseconds
    const interval = setInterval(() => {
      setDotState((prevState) => (prevState + 1) % 6); // Cycle through states 0 to 5
    }, 500);

    // Cleanup the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Function to determine the dot content based on the dotState value
  const getDotContent = (state: number): string => {
    switch (state) {
      case 0:
        return "...";
      case 1:
        return " ..";
      case 2:
        return "  .";
      case 3:
        return "   ";
      case 4:
        return ".  ";
      case 5:
        return ".. ";
      default:
        return "...";
    }
  };

  return (
    <div className={styles.loadingDots}>
      {getDotContent(dotState)} {/* Render the dot content */}
    </div>
  );
};

export default LoadingDots;
