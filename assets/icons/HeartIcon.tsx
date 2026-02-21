import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const HeartIcon = (props: SvgProps) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      d="M8 14s-5-3.2-6.8-6.1C-.3 5.5 1.3 2.8 4 2.4c1.5-.2 2.9.6 3.6 1.9.7-1.3 2.1-2.1 3.6-1.9 2.7.4 4.3 3.1 2.8 5.5C13 10.8 8 14 8 14z"
      fill="currentColor"
    />
  </Svg>
);

export default HeartIcon;
