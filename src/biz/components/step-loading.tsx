import { css, keyframes } from "@base/styled";

const KJump = keyframes`
  0% {
    transform: scale(1) translateY(0px) rotateX(0deg);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(1.2) translateY(-25px) rotateX(45deg);
    background: #000;
    box-shadow: 0 25px 40px #000;
  }
`;

export const StepLoadingStyle = css`
  position: relative;
  width: 50px;
  perspective: 200px;
  &::before, &::after {
    position: absolute;
    width: 20px;
    height: 20px;
    content: "";
    animation: ${KJump} 0.5s infinite alternate;
    background: rgba(0, 0, 0, 0);
  }
  &::before {
    left: 0;
  }
  &::after {
    right: 0;
    animation-delay: 0.15s;
  }
`;

