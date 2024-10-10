import clsnames from "@base/classnames";
import { css, keyframes } from "@root/base/styled";
import { CSSProperties, createElement } from "react";

const KLoading = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
`;

const SBox = css`
  background-image: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  height: 1rem;
  background-size: 400% 100%;
  background-position: 100% 50%;
  animation: ${KLoading} 1.4s ease infinite;
`;

function SkeletonBlock(props: {
  className?: string;
  style?: CSSProperties;
}) {
  const { className, style } = props;
  return createElement('div', {
    className: clsnames(SBox, className),
    style,
  }, null);
}

export default SkeletonBlock;
