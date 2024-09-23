import { css } from './styled';

const HiddenStyle = css`
  position: fixed;
  left: -9999px;
  top: -9999px;
  z-index: -9999;
`;
function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.classList.add(HiddenStyle);
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand('copy');
  } catch (err) {
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
}

function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text);
  }
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch((err) => fallbackCopyTextToClipboard(text));
}

export default copyTextToClipboard;
