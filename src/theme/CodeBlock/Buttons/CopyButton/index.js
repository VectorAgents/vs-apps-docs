import React, {useRef, useState, useEffect} from 'react';
import Button from '@theme/CodeBlock/Buttons/Button';
import IconCopy from '@theme/Icon/Copy';
import IconSuccess from '@theme/Icon/Success';
import styles from '@docusaurus/theme-classic/lib/theme/CodeBlock/Buttons/CopyButton/styles.module.css';

/** The rendered rows, minus those marked removed: a removed line is shown but never pasted. */
function finalCode(button) {
  const pre = button.closest('[class*="codeBlockContent"]').querySelector('pre');
  return Array.from(pre.querySelectorAll('.token-line'))
    .filter((row) => !row.classList.contains('code-line-removed'))
    .map((row) => row.textContent.replace(/\n$/, ''))
    .join('\n');
}

export default function CopyButton({className}) {
  const [isCopied, setIsCopied] = useState(false);
  const timer = useRef(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onClick = (event) => {
    navigator.clipboard.writeText(finalCode(event.currentTarget)).then(() => {
      setIsCopied(true);
      timer.current = window.setTimeout(() => setIsCopied(false), 1000);
    });
  };
  return (
    <Button
      aria-label={isCopied ? 'Copied' : 'Copy code to clipboard'}
      title="Copy"
      className={[className, styles.copyButton, isCopied ? styles.copyButtonCopied : ''].join(' ')}
      onClick={onClick}>
      <span className={styles.copyButtonIcons} aria-hidden="true">
        <IconCopy className={styles.copyButtonIcon} />
        <IconSuccess className={styles.copyButtonSuccessIcon} />
      </span>
    </Button>
  );
}
