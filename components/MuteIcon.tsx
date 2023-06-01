import * as React from "react";
import { SVGProps } from "react";
const MuteIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="5em"
    height="5em"
    viewBox="0 0 64 64"
    {...props}
  >
    <g fill="none" strokeMiterlimit={10} strokeWidth={2}>
      <path d="M4 32V20h12L34 2v60L16 44H4zM42 23l18 18M42 41l18-18" />
    </g>
  </svg>
);
export default MuteIcon;
