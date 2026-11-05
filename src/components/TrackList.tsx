import type { ReactElement } from 'react';
import Link from '@docusaurus/Link';
import { tracks } from '../tracks/index.ts';

export default function TrackList(): ReactElement {
  return (
    <ul className="path-goals">
      {tracks.map((track) => (
        <li key={track.id}>
          <Link to={track.to}>{track.title}</Link>
          <span>{track.goal}</span>
        </li>
      ))}
    </ul>
  );
}
