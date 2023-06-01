import React from "react";
import "../styles/globals.css";

const LinkBar: React.FC = () => {
  const links: string[] = ["Link 1", "Link 2", "Link 3", "Link 4", "Link 5"]; // Replace with your actual links

  return (
    <div className="bar">
      {links.map((link, index) => (
        <a key={index} href="#">
          {link}
        </a>
      ))}
    </div>
  );
};

export default LinkBar;
