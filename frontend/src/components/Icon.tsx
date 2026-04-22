import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

type IconProps =
  | { icon: IconDefinition; decorative: true; label?: never }
  | { icon: IconDefinition; label: string; decorative?: never };

export function Icon(props: IconProps) {
  if ('decorative' in props && props.decorative) {
    return <FontAwesomeIcon icon={props.icon} aria-hidden focusable={false} />;
  }
  return <FontAwesomeIcon icon={props.icon} aria-label={props.label} role="img" />;
}
